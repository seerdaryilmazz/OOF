import * as axios from "axios";
import PropTypes from "prop-types";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, Form, Notify, ReadOnlyDropDown, Span } from 'susam-components/basic';
import { Card, CardHeader, Grid, GridCell, Modal } from 'susam-components/layout';
import { CompanySearchAutoComplete } from 'susam-components/oneorder';
import { FormattedAddress } from '../common';
import { ActiveCompanyLocationDropDown } from "../common/ActiveCompanyLocationDropDown";
import { CrmAccountService, LookupService } from '../services';
import { PromiseUtils, ResponsiveFrame } from '../utils';

const SEGMENT_SALES = {
    id: "SALES",
    code: "SALES",
    name: "SALES",
};

const TRANSPORT_TYPE = {
    SEA: 'SHIPOWNER',
    AIR: 'AIRLINE'
};

export class PaymentRule extends TranslatingComponent {

    static defaultProps = {
        paymentRule: {}
    };

    constructor(props){
        super(props);
        this.state = {};
    }

    componentDidMount(){
        this.initializeLookups();
    }

    initializeLookups(){
        let serviceArea = _.get(this.props.quote, 'serviceArea.code');
        let type = serviceArea ? TRANSPORT_TYPE[serviceArea] : null;
        axios.all([
            LookupService.getPaymentTypes(),
            LookupService.getPaymentDueDays(),
            LookupService.getAccountTypes(),
            type ? LookupService.getTransportingCompanies(type) : PromiseUtils.getFakePromise([])
        ]).then(axios.spread((paymentTypesResponse, paymentDueDaysResponse, accountTypes,transportingCompaniesResponse) => {
            let paymentTypes = paymentTypesResponse.data;
            let paymentDueDays = paymentDueDaysResponse.data.map(value => {return {id: value, code: value, name: value}});
            let transportingCompanies = transportingCompaniesResponse.data;
            this.setState({paymentTypes: paymentTypes, paymentDueDays: paymentDueDays, accountTypes: accountTypes.data, transportingCompanies: transportingCompanies});
        })).catch(error => {
            Notify.showError(error);
        });
    }
    
    handleInvoiceCompanyChange(value) {
        let paymentRule = _.cloneDeep(this.props.paymentRule);
        paymentRule.invoiceCompany = value;
        paymentRule.invoiceLocation = null;
        this.props.onChange(paymentRule);
    }

    handleChange(key, value){
        let paymentRule = _.cloneDeep(this.props.paymentRule);
        _.set(paymentRule, key, value);
        this.props.onChange(paymentRule);
    }

    handleChangeOwnerCompany(value){
        let paymentRule = _.cloneDeep(this.props.paymentRule);
        if(!_.isNil(value)){
            _.set(paymentRule, "ownerCompany.name", value)
        }else {
            _.unset(paymentRule, "ownerCompany.name")
        }
        this.props.onChange(paymentRule);
    }

    validate(){
        return this.form.validate();
    }

    openCompanyAddModel() {
        this.setState({openModal: true}, () => this.companyAddModal.open())
    }

    handleNewCompany(value){
        this.adjustAccountInfo(value);
        this.handleInvoiceCompanyChange(value);
        this.closeCompanyAddModel();
    }

    adjustAccountInfo(company){
        if(company){
            let newAccount={};
            newAccount.name = company.name;
            newAccount.accountOwner = this.context.user.username;
            newAccount.country = company.country ? {iso: company.country.iso, name: company.country.countryName} : null;
            newAccount.accountType = _.find(this.state.accountTypes, {'code': 'PROSPECT'});
            newAccount.segment = SEGMENT_SALES;
            newAccount.totalLogisticsPotential = null;
            newAccount.strategicInformation = null;

            let defaultSector = _.find(company.sectors, {default: true}) || {};
            newAccount.subSector = defaultSector.sector;
            newAccount.parentSector = (defaultSector.sector || {}).parent;

            newAccount.company = {
                id: company.id,
                name: company.name,
            };
            this.setState({newAccount: newAccount}, ()=> this.saveAccount(this.state.newAccount))
        }
    }

    saveAccount(newAccount){
        this.setState({busy: true});
        CrmAccountService.saveAccount(newAccount).then(response => {
            this.setState({busy: false, newAccount:{}}, () => Notify.showSuccess("Company added successfully"));
        }).catch(error => {
            this.setState({busy: false, newAccount:{}});
            Notify.showError(error);
        });
    }

    closeCompanyAddModel() {
        this.setState({openModal: false}, () => this.companyAddModal.close())
    }

    confirmClose(){
        Notify.confirm("The information you have entered will be lost. Are you sure?", () => this.closeCompanyAddModel())
    }

    renderCompanyAddModal(){
        return(
            <Modal ref={(c) => this.companyAddModal = c}
                   large={true} minHeight="600px"
                   closeOnBackgroundClicked={false}
                   closeOtherOpenModals={false}>
                {this.renderNewCompany()}
            </Modal>
        );
    }

    renderNewCompany(){
        if(this.state.openModal){
            const attributes = {
                src: "/ui/kartoteks/crm-company/new",
                width: "100%",
                height: "900px"
            };
            return (
                <div>
                    <ResponsiveFrame attributes={attributes}
                                     onReceiveMessage={(value) => this.handleNewCompany(value)}/>
                    <br/>
                    <br/>
                    <div className="uk-align-right">
                        <Button label= "CLOSE" waves = {true} style = "danger" onclick = {() =>  this.confirmClose()}/>
                    </div>
                    <br/>
                    <br/>
                </div>
            );
        }
    }

    renderInvoiceCompany(){
        if(this.props.readOnly){
            return(
                <GridCell width="1-2">
                    <Span label="Invoice Company"
                          value = {this.props.paymentRule.invoiceCompany ? this.props.paymentRule.invoiceCompany.name : null}/>
                </GridCell>
            );
        }else{
            return(
                <GridCell width="1-2">
                    <CompanySearchAutoComplete label="Invoice Company" readOnly={this.props.readOnly}
                                               value={this.props.paymentRule.invoiceCompany} required={true}
                                               onchange={(value) => this.handleInvoiceCompanyChange(value)}
                                               onAddNew={()=> this.openCompanyAddModel()}
                                               onclear={() => this.handleInvoiceCompanyChange(null)}/>
                </GridCell>
            );
        }
    }

    renderInvoiceLocation() {
            return(
                    <ActiveCompanyLocationDropDown label="Invoice Location"
                                             readOnly={this.props.readOnly}
                                             company={this.props.paymentRule.invoiceCompany}
                                             value={_.get(this.props.paymentRule, "invoiceLocation")} 
                                             required={true}
                                             setInitialValue={true}
                                             onchange = {(value) => this.handleChange("invoiceLocation", value)}/>
            );
    }

    renderTransportingCompany() {
        let content = null;
        let serviceArea = _.get(this.props.quote, 'serviceArea.code');
        let type = serviceArea && TRANSPORT_TYPE[serviceArea];
        if (serviceArea && type) {
            let label = super.translate(`${_.upperFirst(_.lowerCase(type))} Company`);
            content = <ReadOnlyDropDown options={this.state.transportingCompanies} label={label} readOnly={this.props.readOnly}
                value={_.get(this.props.paymentRule, 'ownerCompany')} required={true} translate={true}
                onchange={(value) => this.handleChange("ownerCompany", value)} />
        }
        return <GridCell width="1-4">{content}</GridCell>;
    }

    render() {
        return (
            <Card>
                <Form ref = {c => this.form = c}>
                    <CardHeader title="Payment Rules"/>
                    <Grid widthLarge={true} gridMargin={true}>
                        {this.renderInvoiceCompany()}
                        <GridCell width="1-2">
                            <Grid>
                                <GridCell width="1-2" margin="medium" >
                                    {this.renderInvoiceLocation()}
                                </GridCell>
                                <GridCell width="1-1" margin="medium">
                                    <FormattedAddress location={this.props.paymentRule.invoiceLocation}/>   
                                </GridCell>

                            </Grid>
                        </GridCell>
                        <GridCell width="1-4">
                            <ReadOnlyDropDown options={this.state.paymentTypes} label="Payment Type"
                                              readOnly={this.props.readOnly}
                                              value={this.props.paymentRule.type} required={true} translate={true}
                                              onchange={(value) => this.handleChange("type", value)}/>
                        </GridCell>
                        <GridCell width="1-4">
                            <ReadOnlyDropDown options={this.state.paymentDueDays} label="Payment Due Days"
                                              readOnly={this.props.readOnly}
                                              value={_.toString(this.props.paymentRule.paymentDueDays)} required={true}
                                              onchange={(value) => {
                                                  value ? this.handleChange("paymentDueDays", value.code) : null
                                              }}/>
                        </GridCell>
                        {this.renderTransportingCompany()}
                    </Grid>
                </Form>
                {this.renderCompanyAddModal()}
            </Card>
        );
    }
}

PaymentRule.contextTypes = {
    user: PropTypes.object,
    translator: PropTypes.object
};

