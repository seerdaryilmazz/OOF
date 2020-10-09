import React from 'react';
import uuid from 'uuid';
import * as axios from 'axios';
import _ from 'lodash';

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card, Section} from 'susam-components/layout';
import {DropDown, TextInput} from 'susam-components/basic';
import {Chip} from 'susam-components/advanced';
import {CompanySearchAutoComplete,MultipleCompanySelector} from 'susam-components/oneorder';

import {Kartoteks} from '../../services/KartoteksService';

export class GeneralInfo extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {data: {}, lookups: {}};
        if (props.data) {
            this.state.data = props.data;
        } else {
            this.state.data = [];
        }
    }

    getServiceTypes() {
        return axios.get('/order-service/lookup/service-type/');
    }

    getIncoTerms() {
        return axios.get('/order-service/lookup/incoterm/');
    }

    getTruckLoadTypes() {
        return axios.get('/order-service/lookup/truck-load-type/');
    }

    getInvoiceOwners() {
        return axios.get('/kartoteks-service/company/owned-by-ekol');
    }



    componentDidMount() {
        axios.all([this.getServiceTypes(),
            this.getIncoTerms(), this.getTruckLoadTypes(), this.getInvoiceOwners(), Kartoteks.getCountries()])
            .then(axios.spread((serviceType, incoterm, truckLoadType, invoiceOwner, country) => {
                let state = _.cloneDeep(this.state);
                state.lookups.serviceTypes = serviceType.data;
                state.lookups.incoterms = incoterm.data;
                state.lookups.truckLoadTypes = truckLoadType.data;
                state.lookups.invoiceOwners = invoiceOwner.data.map(i => { i.type = null; return i;});
                state.lookups.countries = country.data.map(c => { return ({id: c.id, code: c.phoneCode, name:c.countryName});});
                this.setState(state);
            })).catch((error) => {
            console.log(error);
        });

    }
    
    componentWillReceiveProps(nextProps) {
        if (nextProps.data) {
            this.setState({data: nextProps.data});
        }

    }

    updateState(field, value) {
        this.props.handleDataUpdate(field, value);
    }

    deleteDataFromArray(field, value) {

        let data = _.cloneDeep(this.state.data);

        _.remove(data[field], req => {
            return req.id == value;
        });

        this.setState({data: data});
        this.props.handleDataUpdate(field, data[field]);
    }

    historyObjectToTextFcn(data) {
        let label = data.owner.label + ":";

        if(Array.isArray(data.data)) {
            data.data.forEach((elem) => {
                label += "\n" + elem.name
            })
        } else {
            label += "\n" + data.data.name;
        }
        return label;
    }

    historyObjectToTextFcnForSingleElement(data) {
        let label = data.owner.label + ": \n" + data.data.name;
        return label;
    }

    render() {
        let readOnlyDataInterface = this.props.readOnlyDataInterface;
        return (
            <Card title="Order General Information">
                <Grid>
                    <GridCell width="9-10" noMargin={true}>
                        <Chip label="From Country"
                              onchange={(value) => this.updateState("fromCountries", value)}
                              value={readOnlyDataInterface.retrieveValue("fromCountries")}
                              readOnly={readOnlyDataInterface.isReadOnly("fromCountries")}
                              options={this.state.lookups.countries}/>
                    </GridCell>
                    <GridCell width="1-10" noMargin={true}>
                        {this.props.hierarchialDataIcon(this.historyObjectToTextFcn, "fromCountries")}
                    </GridCell>

                    <GridCell width="9-10">
                        <Chip label="To Country"
                              onchange={(value) => this.updateState("toCountries", value)}
                              value={readOnlyDataInterface.retrieveValue("toCountries")}
                              readOnly={readOnlyDataInterface.isReadOnly("toCountries")}
                              options={this.state.lookups.countries}/>
                    </GridCell>
                    <GridCell width="1-10" noMargin={true}>
                        {this.props.hierarchialDataIcon(this.historyObjectToTextFcn, "toCountries")}
                    </GridCell>


                    <GridCell width="9-10">
                        <Chip label="Service Type"
                              onchange={(value) => this.updateState("serviceTypes", value)}
                              value={readOnlyDataInterface.retrieveValue("serviceTypes")}
                              readOnly={readOnlyDataInterface.isReadOnly("serviceTypes")}
                              options={this.state.lookups.serviceTypes}/>
                    </GridCell>
                    <GridCell width="1-10" noMargin={true}>
                        {this.props.hierarchialDataIcon(this.historyObjectToTextFcn, "serviceTypes")}
                    </GridCell>
                    <GridCell width="9-10">
                        <Chip label="Incoterms"
                              onchange={(value) => this.updateState("incoterms", value)}
                              value={readOnlyDataInterface.retrieveValue("incoterms")}
                              readOnly={readOnlyDataInterface.isReadOnly("incoterms")}
                              options={this.state.lookups.incoterms}/>
                    </GridCell>
                    <GridCell width="1-10">
                        {this.props.hierarchialDataIcon(this.historyObjectToTextFcn, "incoterms")}
                    </GridCell>

                    <GridCell width="9-10">
                        <Chip label="FTL/LTL"
                              onchange={(value) => this.updateState("truckLoadTypes", value)}
                              value={readOnlyDataInterface.retrieveValue("truckLoadTypes")}
                              readOnly={readOnlyDataInterface.isReadOnly("truckLoadTypes")}
                              options={this.state.lookups.truckLoadTypes}/>
                    </GridCell>
                    <GridCell width="1-10">
                        {this.props.hierarchialDataIcon(this.historyObjectToTextFcn, "truckLoadTypes")}
                    </GridCell>
                    <GridCell width="9-10">
                        <DropDown label="Invoice Owner" options={this.state.lookups.invoiceOwners}
                                  value={this.state.data.invoiceOwner}
                                  onchange={(value) =>  { if(value == ""){ value=null;}this.updateState("invoiceOwner", value);} }/>
                    </GridCell>
                    <GridCell width="1-10">
                        {this.props.hierarchialDataIcon(this.historyObjectToTextFcnForSingleElement, "invoiceOwner")}
                    </GridCell>
                    <GridCell width="9-10">
                        <MultipleCompanySelector
                            label="Invoice Companies"
                            data={this.state.data.invoiceCompanies}
                            handleDataUpdate={(value) =>  this.updateState("invoiceCompanies", value)}
                            deleteNodeHandler={(value) =>  this.deleteDataFromArray("invoiceCompanies", value)}/>
                    </GridCell>
                    <GridCell width="1-10">
                        {this.props.hierarchialDataIcon(this.historyObjectToTextFcn, "invoiceCompanies")}
                    </GridCell>
                    <GridCell width="9-10">
                        <DropDown
                            label="Insured By Ekol"
                            value={this.state.data.insuredByEkol}
                            onchange={(value) =>  {if(value == "" ) { value = null;} this.updateState("insuredByEkol", value)}}
                            options={[{id:"1",code:"1",name:"Yes"},{id:"0",code:"0",name:"No"}]}/>
                    </GridCell>
                    <GridCell width="1-10">
                        {this.props.hierarchialDataIcon(this.historyObjectToTextFcn, "insuredByEkol")}
                    </GridCell>
                    <GridCell width="9-10">
                        <DropDown
                            label="Confirmation Required"
                            value={this.state.data.confirmationRequired}
                            onchange={(value) =>  {if(value == "" ) { value = null;} this.updateState("confirmationRequired", value)}}
                            options={[{id:"1",code:"1",name:"Yes"},{id:"0",code:"0",name:"No"}]}/>
                    </GridCell>
                    <GridCell width="1-10">
                        {this.props.hierarchialDataIcon(this.historyObjectToTextFcn, "confirmationRequired")}
                    </GridCell>
                </Grid>
            </Card>
        );
    }
}

GeneralInfo.contextTypes = {
    translator: React.PropTypes.object
};
