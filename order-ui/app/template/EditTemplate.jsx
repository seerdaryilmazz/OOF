import * as axios from 'axios';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, Checkbox, DropDown, Notify, TextInput } from 'susam-components/basic';
import { Card, Grid, GridCell, Loader, PageHeader } from 'susam-components/layout';
import { CompanySearchAutoComplete } from 'susam-components/oneorder';
import { convertLocationsWithPostalCodes } from "../Helper";
import { Kartoteks, OrderService } from '../services';
import { EditTemplateCustomizedCompany } from "./EditTemplateCustomizedCompany";
import { EditTemplateDefaults } from "./EditTemplateDefaults";
import { EditTemplatePivotCompany } from "./EditTemplatePivotCompany";



export class EditTemplate extends TranslatingComponent {

    constructor(props){
        super(props);
        this.state = {templateFields: []};
    }

    componentDidMount(){
        let ownerCompanyId = _.get(this.props, "template.ownerCompany.id");
        if(ownerCompanyId){
            this.loadCompanyLocations(ownerCompanyId);
        }
        this.loadLookupData();
        this.buildTemplateFields(this.props.template);
    }
    componentWillReceiveProps(nextProps){
        this.buildTemplateFields(nextProps.template);
    }

    buildTemplateFields(template){
        if(template && template.id && template.defaults){
            let fields = [];
            for(let key in template.defaults) {
                if (template.defaults.hasOwnProperty(key) && template.defaults[key]) {
                    fields.push(key);
                }
            }
            this.setState({templateFields: fields});
        }
    }

    loadLookupData(){
        axios.all([OrderService.getServiceTypes(),
            OrderService.getIncoTerms(),
            OrderService.getTruckLoadTypes(),
            OrderService.getPaymentMethods(),
            OrderService.getCurrencies()])
            .then(axios.spread((serviceTypes, incoterms, truckLoadTypes, paymentTypes, currencies) => {
                let state = _.cloneDeep(this.state);
                state.lookup = {};
                state.lookup.serviceTypes = serviceTypes.data;
                state.lookup.incoterms = incoterms.data;
                state.lookup.truckLoadTypes = truckLoadTypes.data;
                state.lookup.paymentTypes = paymentTypes.data;
                state.lookup.currencies = currencies.data;
                state.lookup.yesNoOptions = [{code: "YES", name: "Yes"}, {code: "NO", name: "No"}];
                state.lookup.shipmentUnitOptions = [{code: "ALWAYS", name: "Always Ask"}, {code: "FOR_LTL", name: "Ask For LTL"}, {code: "NEVER", name: "Never Ask"}];
                this.setState(state);
            })).catch(error => {
            Notify.showError(error);
        });
    }

    loadCompanyLocations(companyId){
        Kartoteks.getCompanyLocations(companyId).then(response => {
            this.setState({ownerLocations: response.data.map(item => convertLocationsWithPostalCodes(item))
            });
        }).catch(error => {
            Notify.showError(error);
        });
    }

    updateState(key, value){
        let state = _.cloneDeep(this.state);
        state[key] = value;
        this.setState(state);
    }
    updateOwnerCompany(company){
        this.handleChange("ownerCompany", company);
        this.loadCompanyLocations(company.id);
    }

    handleBackClick(){
        this.props.onBack && this.props.onBack();
    }
    handleChange(key, value){
        let template = _.cloneDeep(this.props.template);
        _.set(template, key, value);
        this.props.onChange && this.props.onChange(template);
    }
    handlePivotChange(value){
        this.handleChange("pivot", value);

    }

    handleSetOwnerAsCustomer(){
        this.updateOwnerCompany(this.props.template.customer);
    }

    handleClickSave(){
        this.props.onSave();
    }
    handleClickCancel(){
        this.handleBackClick();
    }
    handleAddDefaultField(field){
        let templateFields = _.cloneDeep(this.state.templateFields);
        templateFields.push(field);
        let defaults = _.cloneDeep(this.props.template.defaults);
        defaults[field] = [];
        this.setState({templateFields: templateFields}, () => this.handleChange("defaults", defaults));
    }
    handleRemoveDefaultField(field){
        let templateFields = _.cloneDeep(this.state.templateFields);
        let index = _.findIndex(templateFields, field);
        templateFields.splice(index, 1);
        let defaults = _.cloneDeep(this.props.template.defaults);
        delete defaults[field];
        this.setState({templateFields: templateFields}, () => this.handleChange("defaults", defaults));
    }


    render(){
        let {template} = this.props;
        if(!template){
            return <Loader title="Loading template" />;
        }
        let customerName = template.customer ? template.customer.name : "";

        return(
            <div>
                <PageHeader title = {`${super.translate("Customer")}: ${customerName}`} />
                <Card>
                    <Grid>
                        <GridCell width = "1-1">
                            <Button label="Back to template list" style = "success" flat = {true} size = "small"
                                    onclick = {() => this.handleBackClick()} />
                        </GridCell>
                        <GridCell width = "1-3">
                            <CompanySearchAutoComplete label = "Customer"
                                                       value = {template.customer} required = {true}
                                                       onchange = {(value) => this.handleChange("customer", value)} />
                        </GridCell>
                        <GridCell width = "2-3"/>
                        <GridCell width = "1-3">
                            <CompanySearchAutoComplete label = "Template Owner"
                                                       value = {template.ownerCompany} required = {true}
                                                       onchange = {(value) => this.updateOwnerCompany(value)} />
                        </GridCell>
                        <GridCell width = "1-3">
                            <div className = "uk-margin-top">
                                <Button label="use customer" flat = {true} size = "small" style = "success"
                                        onclick = {() => this.handleSetOwnerAsCustomer()} />
                            </div>
                        </GridCell>
                        <GridCell width = "1-3">
                            <DropDown label = "Location" options = {this.state.ownerLocations}
                                      uninitializedText = "Please select owner"
                                      value = {template.ownerLocation} required = {true}
                                      onchange = {(value) => this.handleChange("ownerLocation", value)} />
                        </GridCell>
                        <GridCell width = "1-3">
                            <TextInput label="Template Name" value = {template.name} uppercase = {true}
                                       onchange = {(value) => this.handleChange("name", value)} />
                        </GridCell>
                        <GridCell width = "2-3" />
                        <GridCell width = "1-4">
                            <Checkbox label="Ask Order Numbers" value = {template.askOrderNumbers}
                                      onchange = {(value) => this.handleChange("askOrderNumbers", value)} />
                        </GridCell>

                        <GridCell width = "1-4">
                            <Checkbox label="Create orders with Confirmed status" value = {template.ordersAreConfirmed}
                                      onchange = {(value) => this.handleChange("ordersAreConfirmed", value)} />
                        </GridCell>
                        <GridCell width = "1-4">
                            <Checkbox label="Multiple shipment creation" value = {template.allowMultipleShipments}
                                      onchange = {(value) => this.handleChange("allowMultipleShipments", value)} />
                        </GridCell>
                        <GridCell width = "1-4">
                            <Checkbox label="Order Replication" value = {template.allowOrderReplication}
                                      onchange = {(value) => this.handleChange("allowOrderReplication", value)} />
                        </GridCell>
                        <GridCell width = "1-1">
                            <EditTemplateDefaults defaults = {template.defaults} lookup = {this.state.lookup}
                                                  fields = {this.state.templateFields}
                                                  onChange = {(value) => this.handleChange("defaults", value)}
                                                  onAddField = {(field => this.handleAddDefaultField(field))}
                                                  onRemoveField = {(field => this.handleRemoveDefaultField(field))}/>
                        </GridCell>
                        <GridCell width = "1-1">
                            <EditTemplatePivotCompany pivot = {template.pivot} owner = {template.ownerCompany}
                                                     onChange = {(value) => this.handlePivotChange(value)} />
                        </GridCell>
                        <GridCell width = "1-1">
                            <EditTemplateCustomizedCompany customizations = {template.customizations} pivot = {template.pivot}
                                                           defaults = {template.defaults} lookup = {this.state.lookup}
                                                           fields = {this.state.templateFields}
                                                           onChange = {(value) => this.handleChange("customizations", value)}/>
                        </GridCell>
                        <GridCell width = "1-1">
                            <div className="uk-align-right">
                                <Button label = "Cancel" flat = {true} size = "small" onclick = {() => this.handleClickCancel()} />
                                <Button label = "Save" style = "primary" size = "small" onclick = {() => this.handleClickSave()} />
                            </div>
                        </GridCell>
                    </Grid>
                </Card>
            </div>
        );
    }

}


EditTemplate.contextTypes = {
    translator: PropTypes.object
};