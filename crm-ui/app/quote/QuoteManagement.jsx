import * as axios from "axios";
import _ from "lodash";
import PropTypes from "prop-types";
import React from "react";
import { Helmet } from 'react-helmet';
import { TranslatingComponent } from 'susam-components/abstract';
import { Date, FabToolbar } from "susam-components/advanced";
import { Button, Notify } from "susam-components/basic";
import { Card, Grid, GridCell, Loader, Modal, PageHeader, Secure } from "susam-components/layout";
import { DocumentList, NoteList, PdfViewer, SimpleEmailForm, SupportedLocaleDropDown } from "../common";
import { HistoryTable } from "../history/HistoryTable";
import { CrmAccountService, CrmInboundService, CrmOpportunityService, CrmQuoteService, HistoryService, LocationService, LookupService, QuadroIntegrationService, SalesboxService, TranslatorService } from '../services';
import { LoadingIndicator, ObjectUtils, PromiseUtils, QuoteUtils } from '../utils';
import { CompanyDebt } from "./CompanyDebt";
import { LostReason } from "./LostReason";
import { BundledProductList, SpotProductList } from "./product";
import { LongTermQuote, SpotQuote, TenderQuote } from "./type";

const STATUS_OPEN = ObjectUtils.enumHelper('OPEN');
const STATUS_WON = ObjectUtils.enumHelper('WON');
const STATUS_LOST = ObjectUtils.enumHelper('LOST');
const STATUS_CANCELED = ObjectUtils.enumHelper('CANCELED');
const STATUS_PDF_CREATED = ObjectUtils.enumHelper('PDF_CREATED');

export class QuoteManagement extends TranslatingComponent{

    constructor(props) {
        super(props);
        this.moment = require("moment");
        this.state = {
            quote: {
                relatedPeople: [],
                status: STATUS_OPEN,
                products: [],
                measurement: {
                    weight: 0,
                    ldm: 0,
                    volume: 0
                },
                payWeight: 0,
                quantity: 0,
                chargeableWeight: 0,
                businessVolume: {
                    inbound: null,
                    storage: null,
                    outbound: null,
                    vas: null,
                    spot: false
                }
            }
        };
        this.supportedLocales = [];
    }

    componentDidMount(){
        this.loadSupportedLocales((response) => {
            this.supportedLocales = response.data;
            this.initialize(this.props.route.options.mode);
        });
    }

    componentDidUpdate(prevProps, prevState){
        if(!_.isEqual(this.props.params.quoteId, prevProps.params.quoteId)){
            this.initialize(this.props.params.quoteId?'view':'new');
        } else if (!this.state.readOnly) {
            if ('SPOT' === _.get(this.state.quote, 'type.code')) {
                if(!_.isEqual(prevState.quote.subsidiary, this.state.quote.subsidiary)){
                    this.setState(pState=>{
                        pState.quote.validityEndDate = this.getSpotQuoteValidityEndDate();
                        return pState
                    });
                }
            }
        }
        if ('SPOT' === _.get(this.state.quote, 'type.code') 
            && !_.isEqual(prevState.quote.defaultInvoiceCompanyCountry, this.state.quote.defaultInvoiceCompanyCountry)) {
            this.determinePricingConfigs();
        }
    }

    determinePricingConfigs() {
        let { quote } = this.state;
        let pricingConfig = null;
        if (quote && quote.subsidiary) {
            let costBasedPricing = this.context.getOption("COST_BASED_SPOT_QUOTE_TARIFF", false, quote.subsidiary);
            if (costBasedPricing) {
                let country = { iso: quote.defaultInvoiceCompanyCountry };
                LocationService.queryWarehouses({ country }).then(response => {
                    pricingConfig = {costBasedPricing};
                    pricingConfig.warehouses = response.data;
                    pricingConfig.subsidiaryCountry = country ;
                    pricingConfig.subsidiary = quote.subsidiary;
                    pricingConfig.operation = QuoteUtils.determinePricingOperation(pricingConfig, _.first(quote.products));
                    this.handleChange("quote.pricingConfig", pricingConfig);
                }).catch(error => Notify.showError(error));
            } else {
                this.handleChange("quote.pricingConfig", pricingConfig);
            }
        } else {
            this.handleChange("quote.pricingConfig", pricingConfig);
        }
    }

    loadSupportedLocales(callback) {
        TranslatorService.findActiveSupportedLocales().then(response => {
            callback(response);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    initialize(mode) {
        if (mode === 'new') {
            this.setState({ busy: true });
            axios.all([
                LookupService.getQuoteTypeByCode(this.props.params.type),
                LookupService.getServiceAreaByCode(this.props.params.serviceArea),
                CrmAccountService.getAccountById(this.props.params.accountId),
                this.props.location.query.opportunity ? CrmOpportunityService.getOpportunityById(this.props.location.query.opportunity) : PromiseUtils.getFakePromise(undefined),
                this.props.location.query.inbound ? CrmInboundService.getInbound(this.props.location.query.inbound): PromiseUtils.getFakePromise(undefined)
            ]).then(axios.spread((typeResponse, serviceAreaResponse, account, opportunity, inbound) => {
                document.title = "Create " + typeResponse.data.name + " Quote" ;
                let quote = _.cloneDeep(this.state.quote);
                quote.createdBy = this.context.user.username;
                quote.quoteOwner = this.context.user.username;
                quote.type = typeResponse.data;
                quote.serviceArea = serviceAreaResponse.data;
                quote.discriminator = typeResponse.data.code;
                quote.referrerTaskId = this.props.location.query ? this.props.location.query.referrerTaskId : null;
                quote.potentialId = this.props.params.potentialId;
                quote.account = account.data;
                opportunity.data ? quote.accountLocation = opportunity.data.accountLocation : null;
                quote.requestedDate = _.get(inbound.data, 'message.sentTime');
                quote.inbound = inbound.data;
                if (quote.type.code === 'SPOT') {
                    quote.validityStartDate = this.moment().format('DD/MM/YYYY');
                    quote.validityEndDate = this.getSpotQuoteValidityEndDate();
                    if (!_.get(quote, "paymentRule.invoiceCompany")) {
                        _.set(quote, "paymentRule.invoiceCompany", quote.account.company);
                    }

                }
                this.setState({ account: quote.account, quote: quote, busy: false });
                this.getCompanyDebtInformation(quote.account);
            })).catch(error => {
                console.log(error);
                Notify.showError(error);
            });
        } else {
            this.retrieveQuoteInfo(this.props.params.quoteId);
        }
    }

    getCompanyDebtInformation(account){
        let params = {
            userEmail : this.context.getUser(account.accountOwner,'email'),
            hasAccReceivableBusiness: 1,
            companyId: account.company.id
        }
        QuadroIntegrationService.getCompanyInfoData(params).then(response=>{
            let companyDepts = this.arrangeCompanyDebts(_.get(response.data, 'accountReceivedBusinessInfo', []));
            if(_.find(companyDepts, i=> !_.isNil(i.limitAmount) && i.debitTotal > i.limitAmount)){
                this.setState({companyDebts: companyDepts}, ()=> this.companyDebtModal.open())
            }
        }).catch(e => {
            console.log(e);
            Notify.showError(e);
        })
    }

    arrangeCompanyDebts(companyDebts){
        let arrangedCompanyDebts = [];
        companyDebts.forEach(companyDebt=>{

            let debt = _.find(arrangedCompanyDebts, i => i.businessArea === companyDebt.businessArea);
            if (_.isEmpty(debt)){
                arrangedCompanyDebts.push(companyDebt);
            }else {
                debt.debitTotal += companyDebt.debitTotal;
            }
        });
        return arrangedCompanyDebts;
    }

    setPdfLanguage(quote) {
        let localeObject = _.find(this.supportedLocales, (item) => item.isoCode == this.context.translator.getLocale());
        quote.pdfLanguage = localeObject;
    }

    checkPotentailAvailability(action) {
        let potentialId = _.get(this.state, 'quote.potentialId');
        if (potentialId) {
            CrmAccountService.getPotentialById(potentialId).then(response => {
                if (_.get(response.data, "status.code") === "ACTIVE") {
                    action && action();
                } else {
                    Notify.showError("Since the potential of the quote is inactive, it cannot be copied!");
                }
            }).catch(error => {
                if (error.response.status === 404) {
                    Notify.showError("Since the potential of the quote was deleted, it cannot be copied!");
                }
            });
        } else {
            action && action();
        }
    }

    getSpotQuoteValidityEndDate(){
        let term = this.context.getOption('SPOT_QUOTE_VALIDITY_DAYS', 14, _.get(this.state.quote,'subsidiary'));
        return this.moment().add(term, "day").format('DD/MM/YYYY');
    }

    cloneQuote(){
        let quote = _.cloneDeep(this.state.quote);
        quote.createdBy=this.context.user.username;
        quote.quoteOwner=this.context.user.username;
        quote.status=STATUS_OPEN;
        quote.validityStartDate=this.moment().format('DD/MM/YYYY');
        quote.validityEndDate=this.getSpotQuoteValidityEndDate();
        quote.initial=true;
        if (!_.isEmpty(quote.products)) {
            quote.products.forEach((product) => {
                product.status = STATUS_OPEN;
            });
        }
        ObjectUtils.setNull(quote, ['id', 'number', 'name', 'mappedIds', 'documents', 'notes','createdAt','lastUpdated','lastUpdatedBy'])
        ObjectUtils.setNull(quote.products, ['id','earliestReadyDate','latestReadyDate','lostReason']);
        ObjectUtils.setNull(quote.customs, ['id']);
        ObjectUtils.setNull(quote.packages, ['id']);
        ObjectUtils.setNull(quote.loads, ['id']);
        ObjectUtils.setNull(quote.vehicleRequirements, ['id']);
        ObjectUtils.setNull(quote.containerRequirements, ['id']);
        ObjectUtils.setNull(quote.services, ['id']);
        ObjectUtils.setNull(quote.prices, ['id','authorization']);
        ObjectUtils.setNull(quote.paymentRule, ['id']);

        this.setState({quote: quote, readOnly: undefined},
            ()=>this.context.router.push(`/ui/crm/quote/new/${quote.type.code}/${quote.serviceArea.code}/${this.state.account.id}${quote.potentialId?'/'+quote.potentialId:''}`));
    }

    retrieveQuoteInfo(quoteId){
        this.setState({busy: true});
        CrmQuoteService.getQuoteById(quoteId).then(response => {
            document.title = response.data.type.name + " Quote " + response.data.number;
            let quote = response.data;
            this.adjustQuoteElementKeys(quote);
            this.adjustCampaignPropertiesAfterRetrieve(quote, (returnedQuote) => {
                axios.all([
                    returnedQuote.quoteAttribute.inbound ? CrmInboundService.getInbound(returnedQuote.quoteAttribute.inbound): PromiseUtils.getFakePromise(undefined),
                    CrmAccountService.getAccountById(returnedQuote.account.id)
                ]).then(axios.spread((inbound, account)=>{
                    returnedQuote.requestedDate = returnedQuote.requestedDate || _.get(inbound.data, 'message.sentTime');
                    returnedQuote.inbound = inbound.data;
                    this.setState({quote: returnedQuote, account: account.data,readOnly: true, busy: false}, ()=>{
                        this.determinePricingConfigs();
                    });
                })).catch(error=>{
                    this.setState({busy: false});
                    Notify.showError(error)
                });
            });
        }).catch(error => {
            this.setState({busy: false});
            Notify.showError(error);
        });
    }

    adjustQuoteElementKeys(quote){
        if(quote.products){
            quote.products.forEach(product => {
                product._key = product.id;
            });
        }
        if(quote.packages){
            quote.packages.forEach(quotePackage => {
                quotePackage._key = quotePackage.id;
            });
        }
        if(quote.vehicleRequirements){
            quote.vehicleRequirements.forEach(vehicleRequirement => {
                vehicleRequirement._key = vehicleRequirement.id;
            });
        }
        if(quote.containerRequirements){
            quote.containerRequirements.forEach(containerRequirement => {
                containerRequirement._key = containerRequirement.id;
            });
        }
        if(quote.prices){
            quote.prices.forEach(price => {
                price._key = price.billingItem.name + '_' + price.type.code;
            });
        }
    }

    validate(){
        return this.quoteForm.validate();
    }

    handleQuoteSave(validationRequired, quote, closeProductModal, closePdfLanguageSelectionModal){

        let goon = true;

        if (validationRequired) {
            goon = this.validate();
        }

        if (goon) {
            this.setState({busy: true});
            let quoteToBeSaved = quote ? _.cloneDeep(quote) : _.cloneDeep(this.state.quote);
            this.adjustCampaignPropertiesBeforeSave(quoteToBeSaved);
            let isNewQuote = _.isNil(quoteToBeSaved.id);
            CrmQuoteService.saveQuote(quoteToBeSaved, this.props.location.query).then(response => {
                if (isNewQuote) {
                    this.setState({busy: false}, () => {
                        Notify.showSuccess("Quote saved successfully");
                        this.context.router.push(`/ui/crm/quote/view/${response.data.id}`);
                        this.determinePricingConfigs();
                    });
                } else {
                    if(closeProductModal){
                        this.productsModal && this.productsModal.close();
                    }
                    if(closePdfLanguageSelectionModal){
                        this.pdfLanguageSelectionModal && this.pdfLanguageSelectionModal.close();
                    }
                    let savedQuote = response.data;
                    this.adjustQuoteElementKeys(savedQuote);
                    this.adjustCampaignPropertiesAfterRetrieve(savedQuote, (returnedQuote) => {
                        this.setState({quote: returnedQuote, tempQuote: undefined, readOnly: true, busy: false}, () => {
                            Notify.showSuccess("Quote saved successfully");
                            this.determinePricingConfigs();
                        });
                    });
                }
            }).catch(error => {
                this.setState({busy: false});
                Notify.showError(error);
            });
        }
    }

    handleProductStatusChange(productStatus){
        if(!_.isEmpty(this.state.quote)){
            let product=_.isEmpty(this.state.quote.products) ? {} : _.cloneDeep(this.state.quote.products[0]);
            if (productStatus=="WON"){
                product.status=STATUS_WON;
                this.setState({product: product}, () => this.handleProductChange(this.state.product));
            }
            if (productStatus=="LOST"){
                product.status=STATUS_LOST;
                this.setState({product: product}, () => this.lostReasonModal.open());
            }
            if (productStatus=="CANCELED"){
                product.status=STATUS_CANCELED;
                this.setState({product: product}, () => this.handleProductChange(this.state.product));
            }
            if(productStatus=="PDF_CREATED"){
                product.status=STATUS_PDF_CREATED;
                this.setState({product:product}, ()=>this.handleProductChange(this.state.product));
            }
        }
    }

    handleProductChange(product){
        let products = this.state.quote.products ? _.cloneDeep(this.state.quote.products) : [];
        products.forEach(i=>{
            i.status = product.status;
            i.lostReason = product.lostReason;
        })
        let tempQuote = _.cloneDeep(this.state.quote);
        tempQuote.products = products;
        this.setState({tempQuote: tempQuote} ,()=>{
            this.handleStatusChange("CLOSED")
        });
    }

    handleStatusChange(status, closeProductModal, closePdfLanguageSelectionModal){
        let quote = _.cloneDeep(_.defaultTo(this.state.tempQuote, this.state.quote));
        LookupService.getQuoteStatusByCode(status).then(response => {
            quote.status = response.data;
            if(status !== 'CLOSED' && status !== 'PARTIAL_WON'){
                quote.products && quote.products.forEach(i=>i.status=response.data);
            }
            if(_.get(this.state.product, 'status.code') === STATUS_CANCELED.code){
                quote.status = STATUS_CANCELED;
                this.setState({product: undefined});
            }
            this.handleQuoteSave(false, quote, closeProductModal, closePdfLanguageSelectionModal);
        }).catch(error => {
            console.log(error);
            Notify.showError(error);
        });
    }

    renderLostReason(){
        let actions = [];
        actions.push({label: "SAVE", buttonStyle:"success", flat:false, action: () => this.handleLostReasonFormSaveClick()});
        actions.push({label: "CLOSE", buttonStyle:"danger", flat:false, action: () => this.lostReasonModal.close()});

        let content = null;
        if (this.state.product) {
            content = (
                <LostReason ref = {c => this.lostReasonForm = c}
                            lostReason = {this.state.product.lostReason || undefined}
                            readOnly={false}
                            onChange={(lostReason) => this.handleChange("product.lostReason", lostReason)}/>
            );
        }
        return(
            <Modal ref={(c) => this.lostReasonModal = c} title = "Lost Reason"
                   closeOnBackgroundClicked={false}
                   center={false}
                   large={true} actions={actions}>
                {content}
            </Modal>
        );
    }

    closeCompanyDebt(){
        this.companyDebtModal.close();
        this.setState({companyDebts: {}});
        setTimeout(()=> history.back(), 500);
    }

    renderCompanyDebt(){
        let actions =[];
        actions.push({label: "Continue", buttonStyle:"primary",flat:false, action: () => this.companyDebtModal.close()});
        actions.push({label: "CLOSE", buttonStyle:"danger",flat:false, action: () => this.closeCompanyDebt()});
        return(
            <Modal ref={(c) => this.companyDebtModal = c}
                   title = "Company Debit & Limit Info"
                   closeOnBackgroundClicked={false}
                   actions={actions}>
                {!_.isEmpty(this.state.companyDebts)&&<CompanyDebt companyDebts={this.state.companyDebts}/>}
            </Modal>
        );
    }

    handleLostReasonFormSaveClick() {
        if (this.lostReasonForm.form.validate()) {
            this.lostReasonModal.close();
            this.handleProductChange(this.state.product);
        }
    }

    handleQuoteCancel(closeProductModal){
        if(closeProductModal){
            this.productsModal && this.productsModal.close();
        }
        this.setState(prevState => ({ readOnly: true, quote: _.cloneDeep(prevState.quoteOrj), quoteOrj: null }));
    }

    handleChange(key, value, callback){
        this.setState(pState=>{
            _.set(pState, key, value);
            return pState
        }, callback);
    }

    handleProductListChange(keyValuePairs,callback) {
        let quote = _.cloneDeep(this.state.quote);
        ObjectUtils.applyKeyValuePairs(keyValuePairs, quote);
        this.setState({quote: quote},callback);
    }

    adjustCampaignPropertiesBeforeSave(quote) {
        let priceWithCampaign = _.find(quote.prices, (price) => {
            return !_.isNil(price.campaignId);
        });
        if (priceWithCampaign && !priceWithCampaign.useCampaign) {
            priceWithCampaign.campaign = null;
            priceWithCampaign.campaignId = null;
            priceWithCampaign.useCampaign = null;
        }
    }

    adjustCampaignPropertiesAfterRetrieve(quote, callback) {
        let priceWithCampaign = _.find(quote.prices, (price) => {
            return !_.isNil(price.campaignId);
        });
        if (priceWithCampaign) {
            this.findCampaign(priceWithCampaign.campaignId, (response) => {
                priceWithCampaign.campaign = response.data;
                priceWithCampaign.useCampaign = true;
                callback(quote);
            });
        } else {
            callback(quote);
        }
    }

    findCampaign(id, callback) {
        SalesboxService.findCampaign(id).then(response => {
            callback(response);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    renderCancelButton(){
        if(this.state.quote.id && !this.state.readOnly){
            return (
                <div className="uk-align-right">
                    <Button label="Cancel" style="danger"
                            onclick = {() => this.handleQuoteCancel()}/>
                </div>

            );
        }
    }

    renderCancelNewQuote(){
        if(!this.state.quote.id){
            return (
                <div className="uk-align-right">
                    <Button label="Cancel" style = "danger" onclick = {() =>  history.back()} />
                </div>
            )
        }
    }

    renderButtons(){
        if(!this.state.readOnly){
            return (
                <Grid style={{padding:"0 0 0 0",right:"10px",position:"fixed",zIndex:12,marginTop: "-54px", marginRight:"50px"}}>
                    <GridCell>
                        {this.renderCancelButton()}
                        {this.renderCancelNewQuote()}
                            <Secure operations={["crm-quote.create"]}>
                                <div className="uk-align-right">
                                    <Button label="Save" style = "success" onclick = {() => this.handleQuoteSave(true, null, false, false)}/>
                                </div>
                            </Secure>
                    </GridCell>
                </Grid>

            );
        }
    }

    getActionMenu () {
        let actions = [];
        if(this.state.quote.status.code === "OPEN"){
            actions.push({ name: "Edit Quote", icon: "edit", onAction: () => this.setState(prevState => ({ readOnly: false, quoteOrj: _.cloneDeep(prevState.quote) })), operationName: ["crm-quote.create"] });
        }
        if(this.state.quote.type.code === 'SPOT'){
            if(this.state.quote.status.code === "OPEN"){
                actions.push({name:"Create PDF", icon: "picture_as_pdf", onAction: () => this.openPdfLanguageSelectionModal(), operationName:["crm-quote.create"]});
                actions.push({name:"Mark as Lost", icon: "thumb_down", onAction: () => this.handleProductStatusChange("LOST"), operationName:["crm-quote.create"]});
                actions.push({name:"Mark as Canceled", icon: "cancel", onAction: () => Notify.confirm("Are you sure?", () => this.handleProductStatusChange("CANCELED")), operationName:["crm-quote.create"]});
            }else if(this.state.quote.status.code === "PDF_CREATED"){
                actions.push({name:"View PDF", icon: "picture_as_pdf", onAction: () => this.openPdfViewer(), operationName:["crm-quote.create"]});
                actions.push({name:"Email PDF", icon: "mail_outline", onAction: () => this.openEmailQuoteModal(), operationName:["crm-quote.create"]});
                actions.push({name:"Reopen Quote", icon: "restore", onAction: () => Notify.confirm("Are you sure?", () => this.handleStatusChange("OPEN")),operationName:["crm-quote.create"]});
                actions.push({name:"Mark as Won", icon: "thumb_up", onAction: () => Notify.confirm("Are you sure?", () => this.handleProductStatusChange("WON")), operationName:["crm-quote.create"]});
                actions.push({name:"Mark as Lost", icon: "thumb_down", onAction: () => this.handleProductStatusChange("LOST")});
                actions.push({name:"Mark as Canceled", icon: "cancel", onAction: () => Notify.confirm("Are you sure?", () => this.handleProductStatusChange("CANCELED")), operationName:["crm-quote.create"]});
            }else {
                if(this.state.quote.status.code !== "CANCELED"){
                    actions.push({name:"Reopen Quote", icon: "restore", onAction: () => Notify.confirm("Are you sure?", () => this.handleStatusChange("OPEN"))});
                }
            }
        } else{
            if(this.state.quote.status.code === "OPEN"){
                if (this.state.quote.type.code === 'TENDER') {
                    actions.push({name:"Email", icon: "mail_outline", onAction: () => this.openEmailQuoteModal(), operationName:["crm-quote.create"]});
                }
                actions.push({name:"Mark as Close", icon: "star_half", onAction: () => (this.productsModal.open()), operationName:["crm-quote.create"]});
                actions.push({name:"Mark as Canceled", icon: "cancel", onAction: () => Notify.confirm("Are you sure?", () => this.handleProductStatusChange("CANCELED")), operationName:["crm-quote.create"]});
            }else {
                if(this.state.quote.status.code !== "CANCELED"){
                    actions.push({name:"Reopen Quote", icon: "restore", onAction: () => Notify.confirm("Are you sure?", () => this.handleStatusChange("OPEN")), operationName:["crm-quote.create"]});
                }
            }
        }

        actions.push({name:"Copy Quote", icon: "content_copy", onAction: () => this.checkPotentailAvailability(()=>this.cloneQuote()), operationName:["crm-quote.create"]});
        actions.push({name:"History", icon: "bookmark", onAction: () => this.retrieveChangeHistory(), operationName:["crm-quote.create"]});
        return actions;
    }

    renderActionMenu(){
        if(this.state.readOnly && this.state.quote.id){
            return(
                <div className="user_heading" style = {{padding:"0 0 0 0" ,position:"fixed",zIndex:"3",marginTop:"-26px",right:"20px"}}>
                    <Secure operations ={["crm.account.edit-quote", "crm-quote.create","crm-quote.update"]}>
                        <FabToolbar actions = {this.getActionMenu()}/>
                    </Secure>
                </div>
            );
        }
    }

    openPdfViewer() {
        let pdfUrl = CrmQuoteService.generateFileDownloadUrl("spotQuote", this.state.quote.id);
        this.pdfViewer.open(pdfUrl);
    }

    openPdfLanguageSelectionModal() {
        let quote = _.cloneDeep(this.state.quote);
        this.setPdfLanguage(quote);
        this.setState({quote: quote}, () => this.pdfLanguageSelectionModal.open());

    }

    openEmailQuoteModal() {
        this.emailQuoteModal.open();
    }

    emailQuote(data) {
        this.setState({busy: true}, () => {
            CrmQuoteService.emailQuote(this.state.quote.id, data).then(response => {
                this.retrieveQuoteInfo(this.props.params.quoteId);
                this.emailQuoteModal.close();
                this.setState({busy: false});
                Notify.showSuccess("Email sent successfully.");
            }).catch(error => {
                this.setState({busy: false});
                Notify.showError(error);
            });
        });
    }

    closeEmailQuoteModal() {
        this.emailQuoteModal.close();
    }

    cancelPdfCreation() {
        this.pdfLanguageSelectionModal.close();
    }

    continuePdfCreation() {
        if (!this.state.quote.pdfLanguage) {
            Notify.showError("Please select a language.");
        } else {
            this.handleStatusChange("PDF_CREATED", false, true);
        }
    }

    renderPdfLanguageSelectionModal() {

        let content;

        if (this.state.busy) {
            content = (
                <Loader size="L" title="Creating PDF..."/>
            );
        } else {
            content = (
                <Grid>
                    <GridCell width="1-1" noMargin={true}>
                        <PageHeader title="PDF Language Selection"/>
                    </GridCell>
                    <GridCell width="1-1">
                        <SupportedLocaleDropDown label="Language"
                                                 value={this.state.quote.pdfLanguage}
                                                 translate={true}
                                                 onchange={(value) => this.handleChange("quote.pdfLanguage", value)}/>
                    </GridCell>
                    <GridCell width="1-1">
                        <div className="uk-align-right">
                            <Button label="Save" style="success" waves={true} onclick={() => this.continuePdfCreation()}/>
                            <Button label="Cancel" style="danger"waves={true} onclick={() => this.cancelPdfCreation()}/>


                        </div>
                    </GridCell>
                </Grid>
            );
        }

        return(
            <Modal ref={(c) => this.pdfLanguageSelectionModal = c}
                   large={false}>
                {content}
            </Modal>
        );
    }

    renderPdfViewer() {
        return (
            <PdfViewer ref={(c) => this.pdfViewer = c}/>
        );
    }


    renderEmailQuoteModal() {

        let content = null;

        if (this.state.busy) {
            content = (
                <Loader size="L" title="Sending email..."/>
            );
        } else {

            // Yani teklif kaydedildikten sonra...
            if (!_.isNil(this.state.quote.id)) {

                let title = "";
                let initialData = {};
                let asHtml = false;

                if (this.state.quote.type.code === 'SPOT') {

                    asHtml = false;
                    title = "Spot Quote Email";
                    initialData.subject = super.translate('Spot quote {0} for {1}',{0:this.state.quote.number,1:this.state.account.name});
                    initialData.body = super.translate("Dear customer,\n" +
                        "We would like to thank you for your request for quote. Attached, please find our offer for your company.\n" +
                        "We will be glad to serve your company and are looking forward for your orders.\n" +
                        "Best regards");

                } else if (this.state.quote.type.code === 'TENDER') {

                    let paymentDesc = _.get(this.state.quote, "paymentDueDays") + " days";

                    asHtml = true;
                    title = "Tender Quote Email";
                    initialData.subject = super.translate('Tender quote {0} for {1}',{0:this.state.quote.number,1:this.state.account.name});
                    initialData.body = "<div>Hello,</div>" +
                        "<div>You can find the details for tender below.</div>" +
                        "<div>Best regards,</div>";
                }

                content = (
                    <SimpleEmailForm title={title}
                                     account={this.state.account}
                                     quote={this.state.quote}
                                     data={initialData}
                                     onSend={(data) => this.emailQuote(data)}
                                     asHtml={asHtml}
                                     onCancel={() => this.closeEmailQuoteModal()}/>
                );
            }
        }

        return (
            <Modal ref={(c) => this.emailQuoteModal = c}
                   closeOnBackgroundClicked={false}
                   large={true}>
                {content}
            </Modal>
        );
    }

    getOrEmptyString(object, propertyPath) {
        let propertyValue = _.get(object, propertyPath);
        if (_.isNil(propertyValue)) {
            return "";
        } else {
            return propertyValue;
        }
    }

    renderProductModal(){
        if(!(this.state.account && this.state.account.id)){
            return null;
        }
        return this.state.quote.type.code === 'SPOT' ? this.renderSpotProductModal() : this.renderBundledProductModal();
    }

    renderSpotProductModal(){
        let actions = [];
        actions.push({label: "SAVE", flat:false, buttonStyle:"success", action: () => this.handleStatusChange('CLOSED', true)});
        actions.push({label: "CLOSE", flat:false, buttonStyle:"danger", action: () => this.handleQuoteCancel(true)});
        return(
            <Modal ref={(c) => this.productsModal = c} title = "Spot Quote Closure Info"
                   minHeight="400px"
                   closeOnBackgroundClicked={false}
                   closeOtherOpenModals={false}
                   large={true} actions={actions}>
                <SpotProductList quote = {this.state.quote}
                                 onChange={(keyValuePairs) => this.handleProductListChange(keyValuePairs)}
                                 readOnly={this.state.readOnly}
                                 editable={true}/>
            </Modal>
        );
    }

    renderBundledProductModal(){
        let title;
        this.state.quote.type.code=="TENDER" ? title="Tender Quote Close Info" : title = "Long Term Quote Close Info";
        let actions = [];
        actions.push({label: "SAVE", action: () => this.handleStatusChange('CLOSED', true)});
        actions.push({label: "CLOSE", action: () => this.handleQuoteCancel(true)});
        let today = this.moment().format('DD/MM/YYYY');
        return(
            <Modal ref={(c) => this.productsModal = c} title = {title}
                   minHeight="400px"
                   closeOnBackgroundClicked={false}
                   closeOtherOpenModals={false}
                   large={true} actions={actions}>
                <Grid>
                    <GridCell>
                        <BundledProductList quote = {this.state.quote}
                                            onChange={(keyValuePairs) => this.handleProductListChange(keyValuePairs)}
                                            readOnly={this.state.readOnly}
                                            editable={true}/>
                    </GridCell>
                    <GridCell>
                        <Grid>
                            <GridCell width="1-3">
                                <Date label="Operation Start Date" hideIcon={true}
                                      value={this.state.quote.operationStartDate ? this.state.quote.operationStartDate : " "}
                                      onchange={(value) => this.handleChange("quote.operationStartDate", value)} />
                            </GridCell>
                            <GridCell width="1-3">
                                <Date label="Contract Start Date" hideIcon={true}
                                      value={this.state.quote.contractStartDate ? this.state.quote.contractStartDate : " "}
                                      onchange={(value) => this.handleChange("quote.contractStartDate", value)} />
                            </GridCell>
                            <GridCell width="1-3">
                                <Date label="Contract End Date" hideIcon={true}
                                      value={this.state.quote.contractEndDate ? this.state.quote.contractEndDate : " "}
                                      onchange={(value) => this.handleChange("quote.contractEndDate", value)} />
                            </GridCell>
                        </Grid>
                    </GridCell>
                </Grid>
            </Modal>
        );
    }

    retrieveChangeHistory(){
        this.setState({busy: true});
        let params = {id: this.state.quote.id, type: 'quote'};
        HistoryService.retrieveChanges(params)
            .then(response => {
                this.setState({changes:response.data, busy: false}, () => this.historyModal.open())
            }).catch(error => {
            this.setState({busy: false});
            console.log(error);
            Notify.showError(error);
        });
    }

    renderHistoryModal(){
        let actions =[];
        actions.push({label: "CLOSE", buttonStyle:"danger",flat:false, action: () => this.historyModal.close()});
        return(
            <Modal ref={(c) => this.historyModal = c}
                   title = "Change History"
                   closeOnBackgroundClicked={false}
                   large={true}
                   actions={actions}>
                <HistoryTable changes = {this.state.changes}/>
            </Modal>
        );
    }

    renderSpotQuote(){
        return(
            <SpotQuote ref = {c => this.quoteForm = c}
                       account = {this.state.account}
                       quote = {this.state.quote}
                       onChange={(quote, callback) => this.handleChange("quote", quote, callback)}
                       readOnly={this.state.readOnly}/>
        );
    }

    renderLongTermQuote(){
        return(
            <LongTermQuote ref = {c => this.quoteForm = c}
                           account = {this.state.account}
                           quote = {this.state.quote}
                           onChange={(quote, callback) => this.handleChange("quote", quote, callback)}
                           readOnly={this.state.readOnly}/>
        );
    }


    renderTenderQuote(){
        return(
            <TenderQuote ref = {c => this.quoteForm = c}
                         account = {this.state.account}
                         quote = {this.state.quote}
                         onChange={(quote, callback) => this.handleChange("quote", quote, callback)}
                         readOnly={this.state.readOnly}/>
        );
    }

    updateNotes(value) {
        this.setState({busy: true});
        let quote = _.cloneDeep(this.state.quote);
        CrmQuoteService.updateNotes(quote.id, value).then(response => {
            quote.notes = response.data;
            this.setState({quote: quote, busy: false},
                () => Notify.showSuccess("Notes saved successfully"));
        }).catch(error => {
            this.setState({busy: false});
            Notify.showError(error);
        });
    }

    updateDocuments(value) {
        this.setState({busy: true});
        let quote = _.cloneDeep(this.state.quote);
        CrmQuoteService.updateDocuments(quote.id, value).then(response => {
            quote.documents = response.data;
            this.setState({quote: quote, busy: false},
                () => Notify.showSuccess("Documents saved successfully"));
        }).catch(error => {
            this.setState({busy: false});
            Notify.showError(error);
        });
    }

    renderNotesAndDocuments(){
        if (this.state.readOnly){
            return(
                <Card>
                    <Grid collapse={true}>
                        <GridCell width="1-2">
                            <NoteList notes={this.state.quote.notes}
                                      isSpotQuote={this.state.quote.type.code=='SPOT'? true:false}
                                      readOnly={!this.state.readOnly}
                                      onChange={(value) => this.updateNotes(value)}/>
                        </GridCell>
                        <GridCell width="1-2">
                            <DocumentList documents = {this.state.quote.documents}
                                          readOnly={!this.state.readOnly}
                                          onChange={(value) => this.updateDocuments(value)}/>
                        </GridCell>
                    </Grid>
                </Card>
            );
        }
    }

    getContent () {
        switch (this.state.quote.type.code) {
            case 'SPOT':
                return this.renderSpotQuote();

            case 'LONG_TERM':
                return this.renderLongTermQuote();

            case 'TENDER':
                return this.renderTenderQuote();

            default:
                return null;
        }
    }

    render(){
        let quote = this.state.quote;
        let title = quote.id ? `${super.translate(_.get(quote.type, "name") + " Quote")} - ${quote.number}` : `${super.translate("New " + _.get(quote.type, "name") + " Quote")}`;
        return(
            <div>
                <Helmet>
                    <title>{title}</title>
                </Helmet>
                <LoadingIndicator busy={this.state.busy}/>
                {this.renderQuoteForm()}
            </div>
        );
    }

    renderQuoteForm(){
        if (this.state.account && this.state.quote.type && this.state.quote.serviceArea) {
            return(
                <div>
                    {this.renderActionMenu()}
                    {this.renderButtons()}
                    {this.renderPdfLanguageSelectionModal()}
                    {this.renderPdfViewer()}
                    {this.renderEmailQuoteModal()}
                    {this.renderHistoryModal()}
                    {this.renderProductModal()}
                    {this.renderLostReason()}
                    {this.renderCompanyDebt()}
                    {this.getContent()}
                    {this.renderNotesAndDocuments()}
                </div>
            );
        }
    }
}

QuoteManagement.contextTypes = {
    getOption: PropTypes.func,
    getUser: PropTypes.func,
    user: PropTypes.object,
    router: PropTypes.object.isRequired,
    translator: PropTypes.object,
};
