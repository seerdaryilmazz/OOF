import * as axios from "axios";
import _ from "lodash";
import PropTypes from 'prop-types';
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { FabToolbar } from 'susam-components/advanced';
import { Button, Form, Notify, ReadOnlyDropDown, Span } from 'susam-components/basic';
import { Card, Grid, GridCell, Loader, Modal } from 'susam-components/layout';
import { HistoryTable } from "../history/HistoryTable";
import { CompanySearch } from "../search";
import { CompanySectorList } from "../sector/CompanySectorList";
import { CompanyService, CrmAccountService, HistoryService, LookupService } from "../services";
import { ActionHeader, LoadingIndicator, PhoneNumberUtils, ResponsiveFrame } from '../utils';
import { AccountDetail } from "./AccountDetail";
import { CRInformation } from "./CRInformation";
import { StringUtils } from "susam-components/utils/StringUtils";

const SEGMENT_SALES = {
    id: "SALES",
    code: "SALES",
    name: "SALES",
};

export class Account extends TranslatingComponent {

    static defaultProps = {
        account: {accountType: {}},
        accountExist: false
    };

    constructor(props) {
        super(props);
        this.state={
            company:{},
            step:"ONEORDER",
            crInfo: false
        };
    }

    isNew(){
        return 'new' === this.props.options.mode
    }

    componentDidMount(){
        this.adjustAccountInfo(this.props.company);
        this.initializeLookups();
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.company && nextProps.company.id !== (this.props.company || {}).id){
            this.adjustAccountInfo(nextProps.company);
        }
        if(!nextProps.accountExist && !nextProps.account.id && nextProps.company){
            if(!_.isEqual(nextProps.account, this.props.account)){
                this.saveAccount(nextProps.account, this.state.step === 'CREATED');
            }
        }
    }

    initializeLookups(){
        axios.all([
            LookupService.getAccountTypes(),
            LookupService.getSegmentTypes()
        ]).then(axios.spread((accountTypes, segmentTypes) => {
            this.setState({ accountTypes: accountTypes.data, segmentTypes: segmentTypes.data});
        })).catch(error => {
            Notify.showError(error);
        })
    }

    handleCompanyChange(data, step){
        this.closeSearchModal(step ? step : 'ONEORDER');
        this.props.onCompanyChange && this.props.onCompanyChange(data.id);
    }

    retrieveCompany(companyId){
        this.closeSearchModal();
        this.setState({busy: true});
        CompanyService.getCompany(companyId)
            .then(response => {
                this.setState({company:response.data, busy: false}, ()=>this.adjustAccountInfo());
            }).catch(error => {
            this.setState({busy: false});
            Notify.showError(error);
        });
    }

    handleDeleteAccount(data, isOwner){
       let call = isOwner ? () => CrmAccountService.deleteAccountByOwner(data.id) : () => CrmAccountService.deleteAccount(data.id);
        Notify.confirm("Are you sure?", () => {
            this.setState({busy:true});
            call().then(() => {
                Notify.showSuccess("Account deleted");
            }).catch(error => {
                Notify.showError(error);
            }).then(()=>{
                this.setState({busy:false});
            });

        })
    }

    retrieveChangeHistory(){
        this.setState({busy: true});
        let params = {id: this.props.account.id, type: 'account'};
        HistoryService.retrieveChanges(params)
            .then(response => {
                this.setState({changes:response.data, busy: false}, () => this.historyModal.open())
            }).catch(error => {
            this.setState({busy: false});
            console.log(error);
            Notify.showError(error);
        });
    }

    adjustAccountInfo(company){
        if(company){
            let account = _.cloneDeep(this.props.account);
            if(!account.id){
                account.name = company.name;
                account.accountOwner = this.context.user.username;
                account.country = company.country ? {iso: company.country.iso, name: company.country.countryName} : null;
                account.accountType = _.find(this.state.accountTypes, {'code': 'PROSPECT'});
                account.segment = SEGMENT_SALES;
                account.totalLogisticsPotential = null;
                account.strategicInformation = null;

                let defaultSector = _.find(company.sectors, {default: true}) || {};
                account.subSector = defaultSector.sector;
                account.parentSector = (defaultSector.sector || {}).parent;
            }
            account.company = {
                id: company.id,
                name: company.name,
            }
            this.props.onAccountChange(account);
        }
    }

    handleAccountChange(key, value){
        let account = _.cloneDeep(this.props.account);
        account[key] = value;
        this.props.onAccountChange && this.props.onAccountChange(account);
    }

    saveAccount(account, createdFromKartoteks){
        this.setState({busy: true});
        CrmAccountService.saveAccount(account).then(response => {
            account = response.data;
            account.readOnly = true;
            if(createdFromKartoteks){
                this.addToAccountContacts(this.props.company, account);
            }else{
                this.setState({busy: false}, () => Notify.showSuccess("Account saved successfully"));
                this.props.onAccountChange(account);
            }
        }).catch(error => {
            this.setState({busy: false});
            Notify.showError(error);
        });
    }

    addToAccountContacts(company, account){
        let contacts=[];
        company.companyContacts.forEach(companyContact => {
            let accountContact = {
                companyContactId : companyContact.id,
                account : account,
                firstName : companyContact.firstName,
                lastName : companyContact.lastName
            };
            contacts.push(accountContact);
        });

        if(!_.isEmpty(contacts)){
            CrmAccountService.saveMultipleContact(account.id, contacts).then(response => {
                this.props.onAccountChange(account);
                this.setState({busy: false}, () => Notify.showSuccess("Account saved successfully"));
            }).catch(error => {
                this.setState({busy: false});
                Notify.showError(error);
            });
        }
    }

    handleAccountSave(){
        if(_.isEmpty(this.props.account.company)){
            Notify.showError("Please select a company from list");
        } else if(this.form.validate()){
            this.saveAccount(this.props.account);
        }
    }

    handleAccountDetailSave(accountDetail){
        let account = _.cloneDeep(this.props.account);
        account.details = accountDetail;
        this.saveAccount(account);
        this.accountDetailModal.close();

    }

    handleAccountSectorSave(companySector){
        let account = _.cloneDeep(this.props.account);
        account.parentSector = companySector.sector.parent;
        account.subSector = companySector.sector;
        this.props.onAccountChange(account);
        this.sectorInfoModal.close();
    }
    renderCompanySearch(){
        if(this.state.step == 'NEW'){
            return this.renderNewCompany();
        }
       
    }
    renderOneOrderSearch() {
        let content = <div>
            <ActionHeader title="Search In OneOrder" tools={[{ title: 'New Company' }]} />
            <CompanySearch ref={(c) => this.companySearchComponent = c}
                           onAddNew={() => this.openSearchModalNew()}
                           onItemSelected={(value) => this.handleCompanyChange(value)}/>
        </div>;
        if(this.state.step !='NEW'){
            if(_.get(this.props, 'options.noCard')){
                return content;
            } else {
                return <Card>{content}</Card>;
            }
        }
    }

    confirmClose(){
        Notify.confirm("The information you have entered will be lost. Are you sure?", () => {this.closeSearchModal()})
    }


    renderNewCompany(){
        if(this.state.step === 'NEW'){
            const attributes = {
                src: "/ui/kartoteks/crm-company/new",
                width: "100%",
                height: "800px"
            };
            return (
                <div>
                    <ResponsiveFrame attributes={attributes}
                                     onReceiveMessage={(value) => this.handleCompanyChange(value, 'CREATED')} />
                </div>
            );
            }
    }

    goToMapPage(){
        let company = this.props.company || {};
        let defaultLocation = _.find(company.companyLocations, 'default');
        let googlePlace = defaultLocation.googlePlaceUrl ? defaultLocation.googlePlaceUrl : "";
        window.open(googlePlace, "_blank");
    }

    renderDefaultLocationName(defaultLocation){
        const MAX_PHONE_SIZE = 4;
        let result =[];

        let phoneNumbers = _.filter(defaultLocation.phoneNumbers, i => i.numberType.code != 'FAX' );
        let defaultPhoneNumbers = _.filter(phoneNumbers, i=>i.default);
        let otherPhoneNumbers = _.reject(phoneNumbers, i=>i.default);

        if(defaultPhoneNumbers.length >= MAX_PHONE_SIZE){
            for(let i = 0; i<MAX_PHONE_SIZE; i++){
                result.push(PhoneNumberUtils.format(defaultPhoneNumbers[i].phoneNumber))
            }
        } else {
            defaultPhoneNumbers && defaultPhoneNumbers.forEach(i=>{
                result.push(PhoneNumberUtils.format(i.phoneNumber))
            })
            let missed = MAX_PHONE_SIZE - defaultPhoneNumbers.length;
            let remaining = _.slice(otherPhoneNumbers, 0, missed);
            remaining && remaining.forEach(i=>{
                result.push(PhoneNumberUtils.format(i.phoneNumber));
            })
        }
        return (
            <div>
                {defaultLocation.name} 
                <span><i className="uk-icon-location-arrow" style={{ padding: "0 8px", fontSize: "150%", color: "blue"}}
                         title="Show On Map" data-uk-tooltip="{pos:'top'}" onClick={() => this.goToMapPage()} /></span>
                <span><i className="uk-icon-phone" style={{ color: "green", padding: "0 8px", fontSize: "150%" }}
                         title={result.join("<br/>")} data-uk-tooltip="{pos:'top'}" /></span>
            </div>);
    }
    
    renderCompanyInfo(){
        let company = this.props.company || {};
        let defaultLocation = _.find(company.companyLocations, 'default');
        if(!defaultLocation){
            defaultLocation = {};
        }
        defaultLocation.formattedAddress = defaultLocation.postaladdress ? defaultLocation.postaladdress.formattedAddress : null;

        let sectorLabel;
        if (this.props.account.parentSector) {
            sectorLabel = this.props.account.parentSector.name;
        } else {
            sectorLabel = "Sector";
        }

        let subSectorLabel;
        if (this.props.account.subSector) {
            subSectorLabel = this.props.account.subSector.name;
        } else {
            subSectorLabel = "SubSector";
        }

        if(!this.props.company || !this.props.company.id){
            return null;

        }
        else {
            return (
                <div>
                 <Grid>
                        <GridCell width="9-10">
                            <Grid>
                                <GridCell width="1-4" noMargin={true}>
                                    <Span label="Short Name" value={company.shortName}/>
                                </GridCell>
                                <GridCell width="1-4" noMargin={true}>
                                    <Span label="Country" translate={true}
                                          value={this.props.account.country ? this.props.account.country.name : null}/>
                                </GridCell>
                                <GridCell width="1-4" noMargin={true}>
                                    {
                                        this.props.account.readOnly
                                            ? <Span label="Account Owner"
                                                    value={StringUtils.uppercase(this.context.getUser(this.props.account.accountOwner, 'displayName'), this.context.translator.getLanguage())}/>
                                            : <ReadOnlyDropDown options={this.context.getUsers()}
                                                                label="Account Owner"
                                                                labelField="displayName"
                                                                valueField="username" required={true}
                                                                readOnly={this.props.account.readOnly}
                                                                value={this.props.account.accountOwner}
                                                                onchange={(accountOwner) => {
                                                                    accountOwner ? this.handleAccountChange("accountOwner", accountOwner.username) : null
                                                                }}/>
                                    }
                                </GridCell>
                                <GridCell width="1-4" noMargin={true}>
                                    <Button label={[sectorLabel, subSectorLabel]}
                                            disabled={!this.props.company}
                                            style="primary" size="small"
                                            onclick={() => this.sectorInfoModal.open()}/>
                                </GridCell>
                                <GridCell width="1-4">
                                    {
                                        this.props.account.readOnly
                                            ? <div>
                                            <Span label="Type" translate={true}
                                                  value={_.upperCase(this.props.account.accountType.name)}/>
                                                <a>
                                                    <i className="material-icons md-color-green-800"
                                                       style={{fontSize: "200%"}}
                                                       title={this.translate("CSR Information")} data-uk-tooltip="{pos:'bottom'}"
                                                       onClick={() => this.setState({crInfo:true}, ()=> this.companyCrInfoModal.open())}>people</i>
                                                </a>
                                            </div>
                                            : <ReadOnlyDropDown options={this.state.accountTypes}
                                                                label="Type"
                                                                required={true}
                                                                readOnly={this.props.account.readOnly}
                                                                value={this.props.account.accountType}
                                                                translate={true}
                                                                onchange={(accountType) => {
                                                                    accountType ? this.handleAccountChange("accountType", accountType) : null
                                                                }}/>
                                    }
                                </GridCell>
                                <GridCell width="1-4">
                                    {
                                        this.props.account.readOnly
                                            ? <Span label="Segment" translate={true}
                                                    value={_.upperCase(this.props.account.segment.name)}/>
                                            : <ReadOnlyDropDown options={this.state.segmentTypes}
                                                                label="Segment"
                                                                required={true}
                                                                readOnly={this.props.account.readOnly}
                                                                value={this.props.account.segment}
                                                                translate={true}
                                                                onchange={(segment) => {
                                                                    segment ? this.handleAccountChange("segment", segment) : null
                                                                }}/>
                                    }
                                </GridCell>
                                <GridCell width="2-4">
                                    <Span label="Default Location"
                                          value={this.renderDefaultLocationName(defaultLocation)}/>
                                    <span
                                        className="uk-text-small uk-text-muted uk-text-bold">{defaultLocation.formattedAddress}</span>
                                </GridCell>
                            </Grid>
                        </GridCell>
                        <GridCell width="1-10">
                            {this.renderCompanyLogo()}
                        </GridCell>
                    </Grid>
                    {this.renderAccountFormButtons()}

                </div>
            );
        }
    }

    renderCompanyLogo(){

        if(_.isEmpty(this.props.company)){
            return null;
        }

        let logoUrl = this.props.company.logoFilePath  ? baseResourceUrl + "/company-images/" + this.props.company.logoFilePath
            : baseResourceUrl + "/assets/img/logo-placeholder.png";
        return(
            <div className="uk-align-right">
                <div className="user_heading_avatar">
                    <div className="thumbnail">
                        <img src={logoUrl} />
                    </div>
                </div>
            </div>

        );
    }

    openSearchModalNew(){
        this.setState({step: 'NEW'})
    }

    closeSearchModal(step){
        this.setState({step: step}, () => {
            if('ONEORDER' === step){
                this.companySearchComponent.clearQuery();
            }
        });
    }
    
    renderAccountFormButtons(){
        if(!(this.props.account.id && this.props.account.readOnly)){
            return(
                <Grid>
                    <GridCell width="1-1">
                        <div className="uk-align-right">
                            <Button label="Save" style = "success" onclick = {() => this.handleAccountSave()}/>
                            <Button label="Cancel" style="danger" onclick={()=> this.props.onEditCancel && this.props.onEditCancel() } />
                        </div>        
                    </GridCell>        
                </Grid>
            );
        }
    }
    

    renderActionMenu(){

        if(this.props.account.id){
            let actions = [];

            let editAccountOperationName = null;
            let deleteAccountOperationName = ["crm-account.power-update"];
            let userAccountOwner = this.props.account.accountOwner === this.context.user.username;

            if (userAccountOwner) {
                editAccountOperationName = ["crm-account.update"];
            } else {
                editAccountOperationName = ["crm-account.power-update"];
            } 


            actions.push({name:"Edit Account", icon: "edit", onAction: () => this.handleAccountChange("readOnly", false), operationName: editAccountOperationName});
            if(this.props.account.readOnly){
                actions.push({name:"CRM Info", icon: "add_circle", onAction: () => this.accountDetailModal.open()});
                actions.push({name:"Company Info", icon: "info_circle", onAction: () => this.openCompanyCard()});
                actions.push({name:"Delete", icon: "delete", onAction: () => this.handleDeleteAccount(this.props.account, userAccountOwner), operationName: editAccountOperationName});
                actions.push({name:"Merge", icon:"compare_arrows",  onAction: (e) => this.navigateToMerge(e,this.props.account), operationName: deleteAccountOperationName});
                actions.push({name:"History", icon: "bookmark", onAction: () => this.retrieveChangeHistory()});
            }
            return(

                <div className="user_heading" style = {{padding: "0 0 0 0",top:"-24px",zIndex:998}}>
                    <FabToolbar actions = {actions} />
                </div>
            );
        }
    }

    navigateToMerge(e, item){
        e.preventDefault();
        this.context.router.push("/ui/crm/account/" + item.id + "/merge");
    }
    renderHistoryModal(){
        if(this.isNew()){
            return null;
        }
        let actions =[];
        actions.push({label: "CLOSE", action: () => this.historyModal.close()});
        return(
            <Modal ref={(c) => this.historyModal = c}
                   title = "Change History"
                   closeOnBackgroundClicked={false}
                   large={true}
                   actions={actions}>
                {this.renderHistoryTable()}
            </Modal>
        );
    }

    renderHistoryTable(){
        if((this.props.account || {}).id){
            return(
                <HistoryTable changes = {this.state.changes}/>
            );
        }
    }

    renderCompanyCrInfoModal(){
        if(this.isNew()){
            return null;
        }
        let actions =[];
        actions.push({label: "CLOSE", buttonStyle:"danger", flat:false, action: () => this.companyCrInfoModal.close()});
        return(
            <Modal ref={(c) => this.companyCrInfoModal = c}
                   closeOnBackgroundClicked={false}
                   large={true}
                   actions={actions}>
                {this.renderCompanyCrInfo()}
            </Modal>
        );
    }

    renderCompanyCrInfo() {
        if ((this.props.company || {}).id && this.state.crInfo) {
            return (
                <CRInformation companyId={this.props.company.id} />
            );
        }
    }

    renderSectorInfoModal(){
        if(this.isNew()){
            return null;
        }
        return(
            <Modal ref={(c) => this.sectorInfoModal = c}
                   closeOnBackgroundClicked={false}
                   large={true}>
                {this.renderSectorInfo()}
            </Modal>
        );
    }

    renderSectorInfo(){
        if((this.props.company || {}).id){
            return(
                <CompanySectorList company = {this.props.company}
                                   onSave = {(sector) => this.handleAccountSectorSave(sector)}
                                   onClose={() => this.sectorInfoModal.close()}/>
            );
        }
    }

    openCompanyCard() {
        let win = window.open(`/ui/kartoteks/company/${this.props.company.id}?origin=CRM`, '_blank');
        win.focus();
    }

    renderAccountDetailModal(){
        if(this.isNew()){
            return null;
        }
        return(
            <Modal ref={(c) => this.accountDetailModal = c}
                   closeOnBackgroundClicked={false}
                   large={true}>
                {this.renderAccountDetail()}
            </Modal>
        );
    }

    renderAccountDetail(){
        if((this.props.account || {}).id){
            return(
                <AccountDetail
                    account = {this.props.account}
                    onSave = {(accountDetail) => this.handleAccountDetailSave(accountDetail)}
                    onClose={() => this.accountDetailModal.close()}/>
            );
        }
    }

    renderContent(){
        let company = this.props.company || {};
        if(this.state.busy){
            return <Loader title="Loading"/>
        }
        let defaultLocation = _.find(company.companyLocations, 'default');
        if(!defaultLocation){
            defaultLocation = {};
        }
        defaultLocation.formattedAddress = _.get(defaultLocation, 'postaladdress.formattedAddress');
        if(this.isNew()) {
            return this.renderOneOrderSearch();
        } else {
            return (
                <Card style={{marginTop: "32px"}}>
                    <LoadingIndicator busy={this.state.busy}/>
                    <ActionHeader title="General Info" className="uk-accordion-title" />
                   {this.renderActionMenu()}
                    <div className="uk-accordion-content uk-accordion-initial-open">
                        <Form ref={c => this.form = c}>
                            {this.renderCompanyInfo()}
                        </Form>
                    </div>
                </Card>
            );
        }
    }

    render(){
        return(
            <div>
                {this.renderCompanyCrInfoModal()}
                {this.renderCompanySearch()}
                {this.renderHistoryModal()}
                {this.renderAccountDetailModal()}
                {this.renderSectorInfoModal()}
                {this.renderContent()}
            </div>
        );

    }
}

Account.contextTypes = {
    getUser: PropTypes.func,
    getUsers: PropTypes.func,
    getAllUsers: PropTypes.func,
    user: PropTypes.object,
    router: PropTypes.object.isRequired,
    translator: PropTypes.object
};
