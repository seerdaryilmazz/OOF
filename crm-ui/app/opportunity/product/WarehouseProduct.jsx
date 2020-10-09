import React from "react";
import {TranslatingComponent} from 'susam-components/abstract';
import * as axios from "axios";

import {Grid, GridCell} from "susam-components/layout";
import {Span, Notify, DropDown, Form} from 'susam-components/basic';
import { LoadingIndicator } from "../../utils/index";
import {LocationService, LookupService} from "../../services/index";
import {NumberInput, NumericInput, Chip} from "susam-components/advanced";
import _ from "lodash";

export class WarehouseProduct extends TranslatingComponent {
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
        ]).then(axios.spread((currencies, countries, existenceTypes)=> {
            this.setState({
                currencies:currencies.data,
                countries:countries.data,
                existenceTypes:existenceTypes.data,
            })
        })).catch(error => {
            console.log(error);
            Notify.showError(error);
        });
        if(!_.isEmpty(this.props.product.country)){
            this.retrieveCountryPoints(this.props.product.country)
        }
    }

    updateState(key, value, callback){
        let setStateCallback = () => {
            if (callback) {
                callback();
            }
        };
        this.setState(prevState => prevState[key] = value, setStateCallback);
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

    handleCountryChange(value){
        this.handleChange("country", value);
        if(!_.isNil(value)){
            this.retrieveCountryPoints(this.props.product.country)
        }else {
            this.handleChange("point", null);
            this.updateState("point", []);
        }
    }

    retrieveCountryPoints(country){
        LookupService.getCountyPoints(country.iso, 'POSTAL').then(response => {
            this.updateState("point", response.data);
        }).catch(error => {
            this.updateState("point", []);
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
                <GridCell width="1-3">
                    <DropDown options = {this.state.countries} label="Country" valueField="iso"
                              translate={true}
                              value = {this.props.product.country} required={true}
                              onchange = {(country) => this.handleCountryChange(country)} />
                </GridCell>
                <GridCell width="1-3">
                    <DropDown options = {this.state.point} label="Point"
                              value = {this.props.product.point}
                              onchange = {(value) => {this.handleChange("point", value)}}/>
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