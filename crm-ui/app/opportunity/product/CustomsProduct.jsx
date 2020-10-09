import React from "react";
import {TranslatingComponent} from 'susam-components/abstract';
import * as axios from "axios";

import {Grid, GridCell} from "susam-components/layout";
import {Span, Notify, DropDown, Form} from 'susam-components/basic';
import { LoadingIndicator } from "../../utils/index";
import {CrmOpportunityService, LocationService, LookupService} from "../../services/index";
import {NumberInput, NumericInput, Chip} from "susam-components/advanced";
import _ from "lodash";

export class CustomsProduct extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount(){
        let product = _.cloneDeep(this.props.product);
        if(!product.id){
            product.serviceArea = this.props.serviceArea;
            this.props.onChange(product);
        }
        this.initializeLookups();
    }

    initializeLookups() {
        axios.all([
            LookupService.getCurrencies(),
            CrmOpportunityService.getCustomsServiceTypes(),
            LookupService.getOpportunityExistenceTypes(),
            LocationService.retrieveCustomsOffices()
        ]).then(axios.spread((currencies, customsServiceTypes, existenceTypes, customsOffices) => {
            this.setState({
                currencies: currencies.data,
                customsServiceTypes: customsServiceTypes.data.map(item => {return {id: item, code: item, name: item}}),
                existenceTypes: existenceTypes.data,
                customsOffices: customsOffices.data
            })
        })).catch(error => {
            console.log(error);
            Notify.showError(error);
        });
    }

    updateState(key, value, callback){
        let setStateCallback = () => {
            if (callback) {
                callback();
            }
        };
        let state = _.cloneDeep(this.state);
        _.set(state, key, value);
        this.setState(state, setStateCallback);
    }

    handleChange(key, value) {
        let product = _.cloneDeep(this.props.product);
        if(_.isNil(value)){
            _.unset(product, key);
        }else{
            _.set(product, key, value);
        }
        this.props.onChange(product)
    }

    validate(){
        return this.form.validate();
    }

    getContent(){
        return (
            <Grid widthLarge={true}>
                <GridCell width="1-3">
                    <DropDown options = {this.state.customsServiceTypes} label="Customs Service Types"
                              value = {this.props.product.customsServiceType} required={true}
                              onchange = {(customsServiceType) => {customsServiceType ? this.handleChange("customsServiceType", customsServiceType.code) : null}}/>
                </GridCell>
                <GridCell width="1-3">
                    <DropDown options={this.state.customsOffices} label="Customs Offices"
                              value={this.props.product.customsOffice}
                              onchange={(value) => this.handleChange("customsOffice", value)}/>
                </GridCell>
                <GridCell width="1-3"></GridCell>
                <GridCell width="1-3">
                    <DropDown options={this.state.existenceTypes} label="New/Existing"
                              translate={true}
                              value = {this.props.product.existenceType} required={true}
                              onchange = {(value) => this.handleChange("existenceType", value)}/>
                </GridCell>
                <GridCell width="1-3">
                    <NumericInput label = "Expected Turnover per Year" digits="2" digitsOptional = {false}
                                  value = {this.props.product.expectedTurnoverPerYear ? this.props.product.expectedTurnoverPerYear.amount : null}
                                  onchange = {(value) => this.handleChange("expectedTurnoverPerYear.amount", value)}/>
                </GridCell>
                <GridCell width="1-3">
                    <DropDown options={this.state.currencies} label="Currency"
                              required={_.get(this.props.product.expectedTurnoverPerYear, 'amount')}
                              value={this.props.product.expectedTurnoverPerYear ? this.props.product.expectedTurnoverPerYear.currency : null}
                              onchange={(value) => this.handleChange("expectedTurnoverPerYear.currency", value)}/>
                </GridCell>
            </Grid>
        )
    }

    render() {
        return(
            <div>
                <LoadingIndicator busy={this.state.busy}/>
                <Form ref={c => this.form = c}>
                    {this.getContent()}
                </Form>
            </div>
        );

    }
}