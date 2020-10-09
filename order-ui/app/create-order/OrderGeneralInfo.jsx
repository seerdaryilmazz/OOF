import React from 'react';
import * as axios from 'axios';
import _ from 'lodash';

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card, Section} from 'susam-components/layout';
import {DropDown, TextInput} from 'susam-components/basic';
import {CurrencyInput} from 'susam-components/advanced';

export class OrderGeneralInfo extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {orderGeneralInfo: {}, lookups: {}};
    }

    getServiceTypes() {
        return axios.get('/order-service/lookup/service-type/');
    }
    getIncoTerms() {
        return axios.get('/order-service/lookup/incoterm/');
    }
    getCurrencies(){
        return axios.get('/order-service/lookup/currency/');
    }
    getPaymentMethods(){
        return axios.get('/order-service/lookup/payment-method/');
    }
    getTruckLoadTypes(){
        return axios.get('/order-service/lookup/truck-load-type/');
    }


    componentDidMount(){
        axios.all([this.getServiceTypes(),
            this.getIncoTerms(),
            this.getPaymentMethods(), this.getTruckLoadTypes()])
            .then(axios.spread((serviceType, incoterm, paymentMethod, truckLoadType) => {
                let state = _.cloneDeep(this.state);
                state.lookups.serviceType = serviceType.data;
                state.lookups.incoterm = incoterm.data;
                state.lookups.paymentMethod = paymentMethod.data;
                state.lookups.truckLoadType = truckLoadType.data;
                this.setState(state);
            })).catch((error) => {
                console.log(error);
            });

    }

    updateState(field, value){
        let state = _.cloneDeep(this.state);
        state.orderGeneralInfo[field] = value;
        this.props.updateGeneralInfo(field, value);
        this.setState(state);
    }

    render(){
        return(
            <Grid>
                <GridCell width="1-3">
                    <DropDown label="Service Type" required={true}
                              onchange={(value) => this.updateState("serviceType", value)}
                              value = {this.state.orderGeneralInfo.serviceType}
                              options={this.state.lookups.serviceType}/>
                </GridCell>
                <GridCell width="1-3">
                    <DropDown label="Incoterms" required={true}
                              onchange={(value) => this.updateState("incoterm", value)}
                              value = {this.state.orderGeneralInfo.incoterm}
                              options={this.state.lookups.incoterm}/>
                </GridCell>
                <GridCell width="1-3">
                    <DropDown label="FTL/LTL" required={true}
                              onchange={(value) => this.updateState("truckLoadType", value)}
                              value = {this.state.orderGeneralInfo.truckLoadType}
                              options={this.state.lookups.truckLoadType}/>
                </GridCell>
                <GridCell width="1-3">
                    <CurrencyInput required = {true} label = "Amount"
                                   value = {this.state.orderGeneralInfo.loadWorth}
                                   onchange = {(value) =>  this.updateState("loadWorth", value)}/>
                </GridCell>
                <GridCell width="1-3">
                    <DropDown label="Payment Type"
                              onchange={(value) => this.updateState("paymentMethod", value)}
                              value = {this.state.orderGeneralInfo.paymentMethod}
                              options={this.state.lookups.paymentMethod}/>
                </GridCell>
                <GridCell width="1-3">
                    <DropDown label="Insurance"
                              onchange={(value) => this.updateState("insuranceIncluded", value)}
                              value = {this.state.orderGeneralInfo.insuranceIncluded}
                              options={[{id:"1",name:"Yes"},{id:"0",name:"No"}]}/>
                </GridCell>
            </Grid>
        );
    }
}

OrderGeneralInfo.contextTypes = {
    translator: React.PropTypes.object
};
