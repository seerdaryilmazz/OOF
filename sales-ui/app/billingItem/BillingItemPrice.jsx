import React from "react";
import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell} from "susam-components/layout";
import {Notify, DropDown, Form, TextInput} from 'susam-components/basic';
import {KartoteksService} from '../services';
import {NumericInput} from "susam-components/advanced";

export class BillingItemPrice extends TranslatingComponent{

    static defaultProps = {
        billingItemPrice: {
            price:0,
            minPrice:0
        }
    };

    constructor(props){
        super(props);
        this.state= {
            currencies: [
                {id: "GBP", code:"GBP", name:"GBP"},
                {id: "EUR", code: "EUR", name: "EUR"},
                {id: "TRY", code: "TRY", name: "TRY"},
                {id: "USD", code: "USD", name: "USD"}
            ]
        }
    }

    handleChange(key, value){
        let billingItemPrice = _.cloneDeep(this.props.billingItemPrice);
        if(key === 'price'){
            billingItemPrice.minPrice = value;
        }
        _.set(billingItemPrice, key, value);
        this.props.onChange(billingItemPrice);
    }

    validate(){
        return this.form.validate();
    }

    render(){
        return(
            <Form ref = {c => this.form = c}>
                <Grid widthLarge={true} divider={true}>
                    <GridCell width="4-10">
                        <DropDown options = {this.props.countries} label="From Country" labelField = "countryName" valueField="iso"
                                  value = {this.props.billingItemPrice.fromCountryCode}
                                  onchange = {(country) => {country ? this.handleChange("fromCountryCode", country.iso) : null}} />
                    </GridCell>
                    <GridCell width="4-10">
                        <TextInput label="From Postal Code" maxLength={2} uppercase = {{locale: "en"}}
                                   value = {this.props.billingItemPrice.fromPostalCode ? this.props.billingItemPrice.fromPostalCode : ""}
                                   onchange = {(value) => this.handleChange("fromPostalCode", value)}/>
                    </GridCell>
                    <GridCell width="4-10">
                        <DropDown options = {this.props.countries} label="To Country" labelField = "countryName" valueField="iso"
                                  value = {this.props.billingItemPrice.toCountryCode}
                                  onchange = {(country) => {country ? this.handleChange("toCountryCode", country.iso) : null}} />
                    </GridCell>
                    <GridCell width="4-10">
                        <TextInput label="To Postal Code" maxLength={2} uppercase = {{locale: "en"}}
                                   value = {this.props.billingItemPrice.toPostalCode ? this.props.billingItemPrice.toPostalCode : ""}
                                   onchange = {(value) => this.handleChange("toPostalCode", value)}/>
                    </GridCell>
                    <GridCell width="4-10">
                        <NumericInput label = "Price" digits="2" digitsOptional = {false} required={true}
                                      value = {this.props.billingItemPrice.price}
                                      onchange = {(value) => this.handleChange("price", value)}/>
                    </GridCell>
                    <GridCell width="4-10">
                        <NumericInput label = "Minimum Price" digits="2" digitsOptional = {false} required={true}
                                      value = {this.props.billingItemPrice.minPrice}
                                      onchange = {(value) => this.handleChange("minPrice", value)}/>
                    </GridCell>
                    <GridCell width="2-10">
                        <DropDown options={this.state.currencies} label="Currency"
                                  value = {this.props.billingItemPrice.currency} required={true}
                                  onchange = {(currency) => {currency ? this.handleChange("currency", currency.code) : null}}/>
                    </GridCell>
                </Grid>
            </Form>

        );
    }
}