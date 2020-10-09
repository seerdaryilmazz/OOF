import * as axios from "axios";
import _ from "lodash";
import PropTypes from 'prop-types';
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, DropDown, Notify } from "susam-components/basic";
import * as DataTable from 'susam-components/datatable';
import { Card, Grid, GridCell, LoaderWrapper, Modal } from 'susam-components/layout';
import uuid from 'uuid';
import * as Constants from "../../../common/Constants";
import { Potential } from "../../../potential/Potential";
import { PotentialList } from "../../../potential/PotentialList";
import { CrmAccountService, LookupService } from '../../../services';
import { ActionHeader } from '../../../utils/ActionHeader';
import { MessageUtils } from '../../../utils/MessageUtils';
import { PotentialUtils } from '../../../utils/PotentialUtils';
import { LostReason } from "../../LostReason";
import { SpotProduct } from "./SpotProduct";

export class SpotProductList extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount(){
        if(this.props.quote.potentialId){
            this.retrievePotentialInfo(this.props.quote.potentialId);
        }
    }

    componentDidUpdate(prevProps){
        if(this.props.quote.serviceArea.code === 'DTR'
            && !_.isEmpty(this.props.quote.subsidiary)
            && this.props.quote.defaultInvoiceCompanyCountry
            && !_.isEqual(this.props.quote.defaultInvoiceCompanyCountry, prevProps.quote.defaultInvoiceCompanyCountry)) {
            this.getProductCountry(this.props.quote.defaultInvoiceCompanyCountry);
        }
    }

    getProductCountry(iso){
        LookupService.getCountryByIso(iso).then(response => {
            this.setState({productCountry: response.data});
        }).catch(error => {
            console.log(error);
            Notify.showError(error);
        });
    }

    componentWillReceiveProps(nextProps){
        if(this.props.quote.potentialId !== nextProps.quote.potentialId){
            this.retrievePotentialInfo(nextProps.quote.potentialId);
        }
    }

    updateState(key, value, callback) {
        let setStateCallback = () => {
            if (callback) {
                callback();
            }
        };
        let state = _.cloneDeep(this.state);
        _.set(state, key, value);
        this.setState(state, setStateCallback);
    }

    handleChange(products) {
        
        let keyValuePairs = [{key: "products", value: products}];
        
        if (this.isPriceRecalculationRequired(this.props.quote.serviceArea, this.props.quote.products, products)) {
            if (!_.isEmpty(this.props.quote.prices)) {
                let prices = _.cloneDeep(this.props.quote.prices);
                prices.forEach((price) => {
                    price.priceCalculation = null;
                });
                keyValuePairs.push({key: "prices", value: prices});
            }
        }
        
        if (this.props.quote.status.code === 'OPEN') {
            let product = products[0];
            if (product.newPotentialId) {
                keyValuePairs.push({key: "potentialId", value: product.newPotentialId});
            }
        }
        
        this.props.onChange(keyValuePairs);
    }

    isPriceRecalculationRequired(serviceArea, prevProducts, products) {

        let isPriceRecalculationRequired = false;

        if (serviceArea.code == "ROAD") {

            let prevProduct = null;
            let product = null;

            if (_.isArray(prevProducts) && prevProducts.length == 1) {
                prevProduct = prevProducts[0];
            }

            if (_.isArray(products) && products.length == 1) {
                product = products[0];
            }

            if (!_.isNil(prevProduct) && !_.isNil(product)) {
                if (!_.isEqual(prevProduct.fromCountry, product.fromCountry) ||
                    !_.isEqual(prevProduct.fromPoint, product.fromPoint) ||
                    !_.isEqual(prevProduct.toCountry, product.toCountry) ||
                    !_.isEqual(prevProduct.toPoint, product.toPoint) ||
                    !_.isEqual(prevProduct.collectionWarehouse, product.collectionWarehouse) ||
                    !_.isEqual(prevProduct.deliveryWarehouse, product.deliveryWarehouse) ||
                    !_.isEqual(prevProduct.collectionTariffRegion, product.collectionTariffRegion) ||
                    !_.isEqual(prevProduct.deliveryTariffRegion, product.deliveryTariffRegion) ||
                    !_.isEqual(prevProduct.shipmentLoadingType, product.shipmentLoadingType)) {
                    isPriceRecalculationRequired = true;
                }
            }
        }

        return isPriceRecalculationRequired;
    }

    retrievePotentialInfo(potentialId, callback){
        let setStateCallback = () => {
            if (callback) {
                callback();
            }
        };
        let loadingAndDelivery;
        if(potentialId) {
            CrmAccountService.getPotentialById(potentialId).then(response => {
                loadingAndDelivery = {
                    fromCountry: response.data.fromCountry,
                    fromPoint: response.data.fromPoint,
                    toCountry: response.data.toCountry,
                    toPoint: response.data.toPoint,
                    shipmentLoadingTypes: response.data.shipmentLoadingTypes,
                    incoterms: response.data.incoterm ? [{id: response.data.incoterm, code: response.data.incoterm, name: response.data.incoterm}] : null,
                    incotermExplanations: response.data.incotermExplanation ? [response.data.incotermExplanation] : null
                };
                this.setState({loadingAndDelivery: loadingAndDelivery}, setStateCallback);
            }).catch(error => {
                if(error.response.status !== 404){
                    Notify.showError(error);
                }
            });
        }else{
            this.setState({loadingAndDelivery: undefined}, setStateCallback);
        }
    }
    
    adjustProductAccordingToLoadingAndDelivery(product, loadingAndDelivery) {
        if (loadingAndDelivery) {
            loadingAndDelivery = _.cloneDeep(loadingAndDelivery);
            product.fromCountry = loadingAndDelivery.fromCountry;
            product.toCountry = loadingAndDelivery.toCountry;
            if(!_.isEmpty(loadingAndDelivery.fromPoint) && loadingAndDelivery.fromPoint.length === 1){
                product.fromPoint = _.first(loadingAndDelivery.fromPoint);
            }
            if(!_.isEmpty(loadingAndDelivery.toPoint) && loadingAndDelivery.toPoint.length === 1){
                product.toPoint = _.first(loadingAndDelivery.toPoint);
            }
            if (!_.isEmpty(loadingAndDelivery.shipmentLoadingTypes) && loadingAndDelivery.shipmentLoadingTypes.length === 1) {
                product.shipmentLoadingType = loadingAndDelivery.shipmentLoadingTypes[0].code.substring(0, 3);
                if (this.props.quote.serviceArea.code === 'ROAD') {
                    product.vehicleCount = 1;
                }
            }
            if (!_.isEmpty(loadingAndDelivery.incoterms) && loadingAndDelivery.incoterms.length === 1) {
                product.incoterm = loadingAndDelivery.incoterms[0].code;
            }
            if (!_.isEmpty(loadingAndDelivery.incotermExplanations) && loadingAndDelivery.incotermExplanations.length === 1) {
                product.incotermExplanation =  loadingAndDelivery.incotermExplanations[0].code;
            }
        }
    }

    openProductForm(product){
        if(!_.get(this.props.quote,'subsidiary')){
            Notify.showError("Please select subsidiary first");
            return
        }
        if(this.props.quote.serviceArea.code === 'DTR' && _.isEmpty(this.props.quote.subsidiary)){
            Notify.showError("Please select Owner Subsidiary first!");
            return false;
        }
        let state = _.cloneDeep(this.state);
        if(product){
            state.product = product;
        }else{
            state.product = {
                status: {id: 'OPEN', code: 'OPEN', name: 'Open'},
                serviceArea: this.props.quote.serviceArea,
                discriminator: 'SPOT'
            };
            this.adjustProductAccordingToLoadingAndDelivery(state.product, this.state.loadingAndDelivery);
            if(this.props.quote.serviceArea.code === 'DTR'){
                state.product.fromCountry = this.state.productCountry;
                state.product.toCountry = this.state.productCountry;
            }
        }
        this.setState(state, () => {this.productModal.open()});
    }

    closeProductForm(){
        let state = _.cloneDeep(this.state);
        state.product = undefined;
        this.setState(state, this.productModal.close());
    }

    renderProductForm(){
            return(
                <Modal ref={(c) => this.productModal = c}
                       title="Product Detail"
                       large={true}
                       closeOnBackgroundClicked={false}
                       actions={[
                           {label: "SAVE", buttonStyle:"success", flat:false, action: () => {this.state.product && this.state.product._key ? this.updateProduct(this.state.product, true) : this.addProduct()}},
                           {label: "CLOSE", buttonStyle:"danger", flat:false, action: () => this.closeProductForm()}]}>
                    {this.getProductForm()}
                </Modal>
            );
    }
    
    validateNewPotentialAndProductCompatibility(newPotential, product) {
        if (newPotential.fromCountry.iso != product.fromCountry.iso) {
            Notify.showError(MessageUtils.createParameterizedErrorMessage("From country should be {0}.", [super.translate(product.fromCountry.name)]));
            return false;
        }
        if (newPotential.toCountry.iso != product.toCountry.iso) {
            Notify.showError(MessageUtils.createParameterizedErrorMessage("To country should be {0}.", [super.translate(product.toCountry.name)]));
            return false;
        }
        return true;
    }
    
    handlePotentialChange(newPotentialId) {
        this.retrievePotentialInfo(newPotentialId, () => {
            let product = _.cloneDeep(this.state.product);
            product.newPotentialId = newPotentialId;
            this.adjustProductAccordingToLoadingAndDelivery(product, this.state.loadingAndDelivery);
            this.setState({busy: false, newPotential: null, product: product}, () => {
                this.productModal.open();
            });
        });
    }

    handlePotentialChangeRequest() {
        this.setState({busy: true});
        axios.all([
            LookupService.getCountryByIso(this.state.product.fromCountry.iso),
            LookupService.getCountryByIso(this.state.product.toCountry.iso)
        ]).then(axios.spread((fromCountryResponse, toCountryResponse) => {
            let initialPotentialSearchParams = {
                fromCountry: fromCountryResponse.data,
                toCountry: toCountryResponse.data
            };
            this.setState({busy: false, initialPotentialSearchParams: initialPotentialSearchParams}, () => {
                this.potentialSearchModal.open()
            });
        })).catch(error => {
            this.setState({busy: false});
            Notify.showError(error);
        });
    }

    handlePotentialAddRequest() {
        this.setState({busy: true});
        axios.all([
            LookupService.getCountryByIso(this.state.product.fromCountry.iso),
            LookupService.getCountryByIso(this.state.product.toCountry.iso)
        ]).then(axios.spread((fromCountryResponse, toCountryResponse) => {
            let newPotential = PotentialUtils.getEmptyPotential(this.props.quote.serviceArea.code);
            newPotential.fromCountry = fromCountryResponse.data;
            newPotential.toCountry = toCountryResponse.data;
            this.setState({busy: false, newPotential: newPotential}, () => {
                this.potentialModal.open();
            });
        })).catch(error => {
            this.setState({busy: false});
            Notify.showError(error);
        });
    }

    handlePotentialModalSave() {
        if (this.potentialForm.validate()) {
            let newPotential = this.state.newPotential;
            let product = this.state.product;
            if (this.validateNewPotentialAndProductCompatibility(newPotential, product)) {
                this.setState({potentialBusy: true});
                CrmAccountService.createPotential(this.props.quote.account.id, newPotential).then(response => {
                    let newPotentialId = response.data.id;
                    this.handlePotentialChange(newPotentialId);
                    this.setState({ potentialBusy: false, newPotential: null }, () => this.potentialModal.close());
                }).catch(error => {
                    this.setState({potentialBusy: false});
                    Notify.showError(error);
                });
            }
        }
    }

    handlePotentialModalClose() {
        this.setState({newPotential: null}, () => {
            this.productModal.open();
        });
    }
    
    renderPotentialModal() {
        
        let actions = [];
        actions.push({label: "SAVE", buttonStyle: "success", flat: false, action: () => this.handlePotentialModalSave()});
        actions.push({label: "CLOSE", buttonStyle: "danger", flat: false, action: () => this.handlePotentialModalClose()});
        
        let content = null;
        if (this.state.newPotential) {
            content = (
                <Potential ref={(c) => this.potentialForm = c}
                           serviceArea={this.props.quote.serviceArea.code}
                           potential={this.state.newPotential}
                           readOnly={false}
                           onChange={(value) => this.updateState("newPotential", value)}/>
            );
        }

        return (
            <Modal ref={(c) => this.potentialModal = c} 
                   title="Potential"
                   closeOnBackgroundClicked={false}
                   large={true}
                   actions={actions}>
                <LoaderWrapper busy={this.state.potentialBusy}>
                    {content}
                </LoaderWrapper>
            </Modal>
        );
    }

    handlePotentialSelect(data) {
        let newPotential = data;
        let product = this.state.product;
        if (this.validateNewPotentialAndProductCompatibility(newPotential, product)) {
            this.handlePotentialChange(newPotential.id);
        }
    }

    handlePotentialSearchModalClose() {
        this.productModal.open();
    }

    renderPotentialSearchModal() {

        let actions = [];
        actions.push({label: "CLOSE", buttonStyle: "danger", flat: false, action: () => this.handlePotentialSearchModalClose()});
        
        let content = null;
        if (this.state.initialPotentialSearchParams) {
            content = (
                <PotentialList mode={Constants.POTENTIAL_LIST_MODE_SEARCH_AND_SELECT} 
                               initialSearchParams={this.state.initialPotentialSearchParams}
                               account={this.props.quote.account}
                               serviceArea={this.props.quote.serviceArea.code}
                               onPotentialSelect={(data) => this.handlePotentialSelect(data)}/>
            );
        }
        
        return (
            <Modal ref={(c) => this.potentialSearchModal = c}
                   closeOnBackgroundClicked={false}
                   large={true}
                   actions={actions}>
                {content}
            </Modal>
        );
    }

    openLostReason(row){
        this.setState({product: row}, ()=>this.lostReasonModal.open());
    }

    renderLostReasonForm(){
        let actions = [];
        if(this.props.editable){
            actions.push({label: "SAVE", buttonStyle:"success", flat:false, action: () => this.handleLostReasonFormSaveClick()});
        }
        actions.push({label: "CLOSE", buttonStyle:"danger", flat:false, action: () => this.lostReasonModal.close()});
        let content = null;
        if (this.state.product) {
            content = (
                <LostReason ref = {c => this.lostReasonForm = c}
                            lostReason = {this.state.product.lostReason || undefined}
                            readOnly={!this.props.editable}
                            onChange={(lostReason) => this.updateState("product.lostReason", lostReason)}/>
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

    handleLostReasonFormSaveClick() {
        if (this.lostReasonForm.form.validate()) {
            this.lostReasonModal.close();
            this.updateProduct(this.state.product, false);
        }
    }

    addProduct(){
        if(this.validateProductForm()){
            let products = [];
            let product = this.state.product;
            product._key = uuid.v4();
            products.push(product);
            this.productModal.close();
            this.updateState("product", undefined, () => {
                this.handleChange(products);
            });
        }
    }

    edit(row){
        if(this.props.editable && row.status.code === 'LOST'){
            this.openLostReason(row);
        }else{
            this.updateProduct(row, false);
        }
    }

    validateProductForm(){
        return this.productForm.validate();
    }

    updateProduct(product, withForm){
        if(withForm && !this.validateProductForm()){
            return;
        }
        let products = [];
        products.push(product);
        this.productModal && this.productModal.close();
        this.updateState("product", undefined, () => {
            this.handleChange(products);
        });
    }

    getProductForm () {
        if(this.state.product){
            return <SpotProduct ref={(c) => this.productForm = c}
                                pricingConfig = {this.props.quote.pricingConfig}
                                onPricingConfigUpdate={pricingConfig=>this.props.onChange([{key:'pricingConfig', value:pricingConfig}])}
                                product = {this.state.product || undefined}
                                loadingAndDelivery={this.state.loadingAndDelivery}
                                onChange={(value) => this.updateState("product", value)}
                                onPotentialChangeRequest={() => this.handlePotentialChangeRequest()}
                                onPotentialAddRequest={() => this.handlePotentialAddRequest()}/>;
        }
        return null;
    }

    getContent () {
        switch (this.props.quote.serviceArea.code) {
            case 'ROAD':
                return this.renderRoadProducts();

            case 'SEA':
                return this.renderSeaProducts();

            case 'AIR':
                return this.renderAirProducts();

            case 'DTR':
                return this.renderDomesticProducts();

            default:
                return null;
        }
    }

    renderActionColumns(){
        return(
            <DataTable.ActionColumn>
                <DataTable.ActionWrapper shouldRender = {() => !this.props.readOnly} key="editProduct" track="onclick"
                                         onaction = {(data) => this.openProductForm(data)}>
                    <Button icon="pencil" size="small"/>
                </DataTable.ActionWrapper>
            </DataTable.ActionColumn>
        );
    }

    renderRoadProducts(){
        return(
            <DataTable.Table data={this.props.quote.products}
                             editable={this.props.editable}
                             onupdate={data => this.edit(data)}
                             key='_ROAD_SPOT_PRODUCT'>
                <DataTable.Text field="fromCountry.name" header="From Country" width="10" translator={this} editable={false}/>
                <DataTable.Text field="fromPoint" header="From Postal" width="10" editable={false} printer={new TruncatePrinter("fromPoint.name")}/>
                <DataTable.Text field="toCountry.name" header="To Country" width="10" translator={this} editable={false}/>
                <DataTable.Text field="toPoint" header="To Postal" width="10" editable={false} printer={new TruncatePrinter("toPoint.name")}/>
                <DataTable.Text field="shipmentLoadingType" header="FTL/LTL" width="5" editable={false}/>
                <DataTable.Text field="incoterm" header="Incoterm" width="5" editable={false}/>
                <DataTable.Text field="earliestReadyDate" header="Ready Date(Ear.)" width="8" editable={false}/>
                <DataTable.Text field="latestReadyDate" header="Ready Date(Lt.)" width="8" editable={false}/>
                <DataTable.Text field="loadingType.name" header="Loading Type" translator={this} width="5" editable={false}/>
                <DataTable.Text field="loadingLocation.name" header="Loading Loc." width="5" editable={false}/>
                <DataTable.Text field="deliveryType.name" header="Delivery Type" width="5" translator={this} editable={false}/>
                <DataTable.Text field="deliveryLocation.name" header="Delivery Loc." width="5" editable={false}/>
                <DataTable.Text field="vehicleCount" header="Vehicle Count" width="9" editable={false}/>
                <DataTable.Badge field="status" header="Status" width="5"
                                 reader = {new StatusReader()} printer={new StatusPrinter(this, this.context.translator)}>
                    <DataTable.EditWrapper>
                        <DropDown options={[
                            {id:"WON", code:"WON", name:"Won"},
                            {id:"LOST", code:"LOST", name:"Lost"}]}/>
                    </DataTable.EditWrapper>
                </DataTable.Badge>
                {this.renderActionColumns()}
            </DataTable.Table>
        );
    }

    renderSeaProducts(){
        return(
            <DataTable.Table data={this.props.quote.products}
                             editable={this.props.editable}
                             onupdate={data => this.edit(data)}
                             key='_SEA_SPOT_PRODUCT'>
                <DataTable.Text field="fromCountry.name" header="From Country" width="10" translator={this} editable={false}/>
                <DataTable.Text field="fromPoint" header="From Port" width="10" editable={false} printer={new TruncatePrinter("fromPoint.name")}/>
                <DataTable.Text field="toCountry.name" header="To Country" width="10" translator={this} editable={false}/>
                <DataTable.Text field="toPoint" header="To Port" width="10" editable={false} printer={new TruncatePrinter("toPoint.name")}/>
                <DataTable.Text field="shipmentLoadingType" header="FCL/LCL" width="10" translator={this} editable={false} />
                <DataTable.Text field="transshipmentPort.name" header="Transshipment Port" width="10" editable={false} />
                <DataTable.Text field="transitTime" header="Transit Time(Days)" width="10" editable={false}/>
                <DataTable.Text field="incoterm" header="Incoterm" width="10" editable={false}/>
                <DataTable.Text field="incotermExplanation" header="Incoterm Exp." width="10" translator={this} editable={false}/>
                <DataTable.Text field="earliestReadyDate" header="Ready Date(Earliest)" width="10" editable={false}/>
                <DataTable.Text field="latestReadyDate" header="Ready Date(Latest)" width="10" editable={false}/>
                <DataTable.Badge field="status" header="Status" width="10"
                                 reader = {new StatusReader()} printer={new StatusPrinter(this, this.context.translator)}>
                    <DataTable.EditWrapper>
                        <DropDown options={[
                            {id:"WON", code:"WON", name:"Won"},
                            {id:"LOST", code:"LOST", name:"Lost"}]}/>
                    </DataTable.EditWrapper>
                </DataTable.Badge>
                {this.renderActionColumns()}
            </DataTable.Table>
        );
    }

    renderAirProducts(){
        return(
            <DataTable.Table data={this.props.quote.products}
                             editable={this.props.editable}
                             onupdate={data => this.edit(data)}
                             key='_AIR_SPOT_PRODUCT'>
                <DataTable.Text field="fromCountry.name" header="From Country" width="10" translator={this} editable={false}/>
                <DataTable.Text field="fromPoint" header="From Airport" width="10" editable={false} printer={new TruncatePrinter("fromPoint.name")}/>
                <DataTable.Text field="toCountry.name" header="To Country" width="10" translator={this} editable={false}/>
                <DataTable.Text field="toPoint" header="To Airport" width="10" editable={false} printer={new TruncatePrinter("toPoint.name")}/>
                <DataTable.Text field="incoterm" header="Incoterm" width="10" editable={false}/>
                <DataTable.Text field="transshipmentPort.name" header="Transshipment Airport" width="10" editable={false}/>
                <DataTable.Text field="transitTime" header="Transit Time(Days)" width="10" editable={false}/>
                <DataTable.Text field="incotermExplanation" header="Incoterm Exp." translator={this} width="10" editable={false}/>
                <DataTable.Text field="earliestReadyDate" header="Ready Date(Earliest)" width="10" editable={false}/>
                <DataTable.Text field="latestReadyDate" header="Ready Date(Latest)" width="10" editable={false}/>
                <DataTable.Badge field="status" header="Status" width="10"
                                 reader = {new StatusReader()} printer={new StatusPrinter(this, this.context.translator)}>
                    <DataTable.EditWrapper>
                        <DropDown options={[
                            {id:"WON", code:"WON", name:"Won"},
                            {id:"LOST", code:"LOST", name:"Lost"}]}/>
                    </DataTable.EditWrapper>
                </DataTable.Badge>
                {this.renderActionColumns()}
            </DataTable.Table>
        );
    }
    
    renderDomesticProducts(){
        return(
            <DataTable.Table data={this.props.quote.products}
                             editable={this.props.editable}
                             onupdate={data => this.edit(data)}
                             key='_DOMESTIC_SPOT_PRODUCT'>
                <DataTable.Text field="fromCountry.name" header="From Country" width="10" translator={this} editable={false}/>
                <DataTable.Text field="fromPoint" header="From Postal" width="10" editable={false} printer={new TruncatePrinter("fromPoint.name")}/>
                <DataTable.Text field="toCountry.name" header="To Country" width="10" translator={this} editable={false}/>
                <DataTable.Text field="toPoint" header="To Postal" width="10" editable={false} printer={new TruncatePrinter("toPoint.name")}/>
                <DataTable.Text field="shipmentLoadingType" header="Transportation Type" translator={this} width="10" editable={false}/>
                <DataTable.Text field="calculationType.name" header="Calculation Type" width="5" translator={this} editable={false} printer={new TruncatePrinter("calculationType.name")}/>
                <DataTable.Text field="earliestReadyDate" header="Ready Date(Ear.)" width="10" editable={false}/>
                <DataTable.Text field="latestReadyDate" header="Ready Date(Lt.)" width="10" editable={false}/>
                <DataTable.Text field="loadingType.name" header="Loading Type" width="5" translator={this} editable={false}/>
                <DataTable.Text field="loadingLocation.name" header="Loading Loc." width="5" editable={false}/>
                <DataTable.Text field="deliveryType.name" header="Delivery Type" width="5" translator={this} editable={false}/>
                <DataTable.Text field="deliveryLocation.name" header="Delivery Loc." width="5" editable={false}/>
                <DataTable.Badge field="status" header="Status" width="5"
                                 reader = {new StatusReader()} printer={new StatusPrinter(this, this.context.translator)}>
                    <DataTable.EditWrapper>
                        <DropDown options={[
                            {id:"WON", code:"WON", name:"Won"},
                            {id:"LOST", code:"LOST", name:"Lost"}]}/>
                    </DataTable.EditWrapper>
                </DataTable.Badge>
                {this.renderActionColumns()}
            </DataTable.Table>
        );
    }

    renderDataTable(){
        if (!this.props.quote) {
            return null;
        }
        return (
            <Grid divider = {true}>
                <GridCell width="1-1" margin="small">
                    {this.getContent()}
                </GridCell>
                {this.renderLostReasonForm()}
                {this.renderProductForm()}
                {this.renderPotentialModal()}
                {this.renderPotentialSearchModal()}
            </Grid>
        );
    }

    render(){
        return (
            <Card>
                <ActionHeader title="Product Details" readOnly={this.props.readOnly || (this.props.quote.products && this.props.quote.products.length == 1)}
                              tools={[{title: "Add", items: [{label: "", onclick: () => this.openProductForm()}]}]} />
                <LoaderWrapper busy = {this.state.busy} title="" size = "S">
                    {this.renderDataTable()}
                </LoaderWrapper>
            </Card>

        );
    }

}

SpotProductList.contextTypes = {
    translator: PropTypes.object
};
class StatusReader {
    setValue(row, value){
        row.status = value;
    }
    readCellValue(row){
        return row ? (row.status ? row.status : "" ) : "";
    }
    readSortValue(row){
        return row ? (row.status ? row.status.name : "" ) : "";
    }
}

class StatusPrinter {

    constructor(callingComponent, translator) {
        this.callingComponent = callingComponent;
        this.translator = translator;
    }

    translate(text){
        return this.translator ? this.translator.translate(text) : text; 
    }

    printUsingRow(row, data) {
        if (data.code === "WON") {
            return <span className="uk-badge md-bg-green-600">{this.translate(_.capitalize(data.name))}</span>
        } else if (data.code === "PARTIAL_WON") {
            return <span className="uk-badge md-bg-green-400">{this.translate(_.capitalize(data.name))}</span>
        } else if (data.code === "OPEN") {
            return <span className="uk-badge md-bg-blue-500">{this.translate(_.capitalize(data.name))}</span>
        } else if (data.code === "CANCELED") {
            return <span className="uk-badge uk-badge-muted">{this.translate(_.capitalize(data.name))}</span>
        } else if (data.code === "LOST") {
            return  ( <div className="uk-form-row">
                    <span className="uk-badge md-bg-red-600">{this.translate(data.name)}</span>
                    <a>
                        <i className="uk-icon-comment " style = {{fontSize: "120%"}}
                           title={this.translate("Lost Reason")} data-uk-tooltip="{pos:'bottom'}" onClick = {() => this.callingComponent.openLostReason(row)}/>
                    </a>
                </div>
                );
        } else if (data.code === "PDF_CREATED") {
            let statusName = this.translate(_.capitalize(data.name));
            statusName = statusName.replace("Pdf", "PDF");
            return <span className="uk-badge md-bg-blue-700">{statusName}</span>
        } 
        else {
            return null;
        }
        }
}

class ArrayPrinter {
    constructor(field) {
        this.field = field;
    }
    printUsingRow(row, data) {
        let array = _.get(row, this.field);
        if(array){
            return ArrayPrinter.convertToMultipleLineColumnValue(array);
        }
    }
    static convertToMultipleLineColumnValue(array) {
        return array.map(item => <div key={item.id}>{ArrayPrinter.truncatedValue(item.name)}<br/></div>);
    }

    static truncatedValue(value){
        if(value && value.length > 10){
            value = value.substring(0, 10) + "..";
        }
        return value;
    }
}

class TruncatePrinter {
    constructor(field) {
        this.field = field;
    }
    printUsingRow(row, data) {
        return <div >{TruncatePrinter.truncatedValue(_.get(row, this.field))}</div>
    }
    static truncatedValue(value){
        if(value && value.length > 10){
            value = value.substring(0, 10) + "..";
        }
        return value;
    }
}