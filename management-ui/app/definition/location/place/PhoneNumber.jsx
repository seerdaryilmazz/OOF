import React from "react";
import _ from "lodash";

import {Card, Grid, GridCell} from "susam-components/layout";
import {TextInput} from 'susam-components/basic';
import {NumericInput} from 'susam-components/advanced';

import {TranslatingComponent} from 'susam-components/abstract';

export class PhoneNumber extends TranslatingComponent{
    constructor(props){
        super(props);
    }
    componentDidMount(){

    }
    componentWillReceiveProps(){

    }

    value(){
        let value = {countryCode: this.props.countryCode, regionCode: this.props.regionCode};
        if(this.props.value){
            value = this.props.value;
        }
        return value;
    }

    update(key, value){
        let phoneNumber = _.cloneDeep(this.value());
        phoneNumber[key] = value;
        this.props.onchange && this.props.onchange(phoneNumber);
    }

    render(){
        let value = this.value();
        let countryInput = <NumericInput value = {value.countryCode} onchange = {(value) => this.update("countryCode", value)}
                                         required = {this.props.required} placeholder="Country Code"
                                         validationGroup={this.props.validationGroup}/>;
        let regionCodeInput = <NumericInput value = {value.regionCode} onchange = {(value) => this.update("regionCode", value)}
                                            required = {this.props.required} placeholder="Area Code"
                                            validationGroup={this.props.validationGroup}/>;
        let numberInput = <NumericInput value = {value.phone} onchange = {(value) => this.update("phone", value)}
                                        required = {this.props.required} placeholder="Phone Nr"
                                        validationGroup={this.props.validationGroup}/>;
        let extensionInput = "";
        let width = "5";
        if(this.props.showExtension){
            width = "6";
            extensionInput = <GridCell width={"1-" + width}>
                <NumericInput value = {value.extension} onchange = {(value) => this.update("extension", value)} placeholder="Ext" />
            </GridCell>;
        }

        return (
            <Grid collapse = {true}>
                <GridCell width={"1-" + width}>{countryInput}</GridCell>
                <GridCell width={"1-" + width}>{regionCodeInput}</GridCell>
                <GridCell width={"3-" + width}>{numberInput}</GridCell>
                {extensionInput}
            </Grid>
        );


    }
}