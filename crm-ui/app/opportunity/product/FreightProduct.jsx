import React from "react";
import {TranslatingComponent} from 'susam-components/abstract';
import * as axios from "axios";

import {Grid, GridCell} from "susam-components/layout";
import {Span, Notify, DropDown, Form} from 'susam-components/basic';
import { LoadingIndicator } from "../../utils/index";
import {LocationService, LookupService} from "../../services/index";
import {NumberInput, NumericInput, Chip} from "susam-components/advanced";
import _ from "lodash";

const TYPE = {
    AIR: 'AIRPORT',
    ROAD: 'POSTAL',
    SEA: 'PORT',
    DTR: 'POSTAL'
};

export class FreightProduct extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {
            fromPostal:[],
            toPostal:[]
        };
    }

    componentDidMount(){
        let product = _.cloneDeep(this.props.product);
        if(!product.id){
            product.serviceArea = this.props.serviceArea;
            this.props.onChange(product);
        }

        this.initializeLookups();
    }

    initializeLookups(){
        axios.all([
            LookupService.getCurrencies(),
            LookupService.getCountries(),
            LookupService.getOpportunityExistenceTypes(),
            LookupService.getOpportunityFrequencyTypes()
        ]).then(axios.spread((currencies, countries, existenceTypes, frequencyTypes)=> {
            this.setState({
                currencies:currencies.data,
                countries:countries.data,
                existenceTypes:existenceTypes.data,
                frequencyTypes:frequencyTypes.data
            })
        })).catch(error => {
            console.log(error);
            Notify.showError(error);
        });
        if(!_.isEmpty(this.props.product.fromCountry)){
            this.retrieveCountryPoints(this.props.product.fromCountry, "fromPoint")
        }
        if(!_.isEmpty(this.props.product.toCountry)){
            this.retrieveCountryPoints(this.props.product.toCountry, "toPoint")
        }
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

    handleChangeFrequencyType(value){
        this.handleChange("frequencyType", value);
        if(_.isNil(value)){
            this.handleChange("frequency", undefined)
        }
    }

    handleCountryChange(key, value){
        this.handleChange(key, value);
        let state = _.cloneDeep(this.state);
        let point = key === "fromCountry" ? "fromPoint" : "toPoint";
        if(!_.isNil(value)){
            this.retrieveCountryPoints(this.props.product[key], point)
        }else {
            this.handleChange(point, null);
            _.set(state, point, []);
            this.setState(state);
        }
    }

    retrieveCountryPoints(country, point){
        let state = _.cloneDeep(this.state);
        LookupService.getCountyPoints(country.iso, TYPE[this.props.serviceArea]).then(response => {
            _.set(state, point, response.data);
            this.setState(state);
        }).catch(error => {
            _.set(state, point, []);
            this.setState(state);
            console.log(error);
            Notify.showError(error);
        });
    }

    validate(){
        return this.form.validate();
    }

    getContent(){
        return (
            <Grid widthLarge={true}>
                <GridCell width="1-4">
                    <DropDown options = {this.state.countries} label="From Country" valueField="iso"
                              translate={true}
                              value = {this.props.product.fromCountry} required={true}
                              onchange = {(country) => this.handleCountryChange("fromCountry", country)} />
                </GridCell>
                <GridCell width="1-4">
                    <DropDown options = {this.state.fromPoint} label="From Point"
                              value = {this.props.product.fromPoint}
                              onchange = {(value) => {this.handleChange("fromPoint", value)}}/>
                </GridCell>
                <GridCell width="1-4">
                    <DropDown options = {this.state.countries} label="To Country" valueField="iso"
                              translate={true}
                              value = {this.props.product.toCountry} required={true}
                              onchange = {(country) => this.handleCountryChange("toCountry", country)} />
                </GridCell>
                <GridCell width="1-4">
                    <DropDown options = {this.state.toPoint} label="To Point"
                              value = {this.props.product.toPoint}
                              onchange = {(value) => {this.handleChange("toPoint", value)}}/>
                </GridCell>
                <GridCell width="1-4">
                    <DropDown options={this.state.existenceTypes} label="New/Existing"
                              translate={true}
                              value = {this.props.product.existenceType} required={true}
                              onchange = {(value) => this.handleChange("existenceType", value)}/>
                </GridCell>
                <GridCell width="1-4">
                    <DropDown options = {this.state.frequencyTypes} label="Frequency Type"
                              value = {this.props.product.frequencyType}
                              onchange = {(value) => {this.handleChangeFrequencyType(value)}}/>
                </GridCell>
                <GridCell width="1-4">
                    <NumericInput label = "Frequency" digitsOptional = {false}
                                  required={_.get(this.props.product, 'frequencyType')}
                                  disabled={!_.get(this.props.product, 'frequencyType')}
                                  value = {this.props.product.frequency}
                                  onchange = {(value) => this.handleChange("frequency", value)}/>
                </GridCell>

                <GridCell width="1-4">
                </GridCell>

                <GridCell width="1-4">
                    <NumericInput label = "Expected Turnover per Year" digits="2" digitsOptional = {false}
                                  value = {this.props.product.expectedTurnoverPerYear ? this.props.product.expectedTurnoverPerYear.amount : null}
                                  onchange = {(value) => this.handleChange("expectedTurnoverPerYear.amount", value)}/>
                </GridCell>
                <GridCell width="1-4">
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