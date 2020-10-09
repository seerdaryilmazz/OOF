import React from "react";
import _ from "lodash";
import {Grid, GridCell} from "susam-components/layout";
import {NumberInput} from 'susam-components/advanced';

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


    renderAreaCode(){
        let value = this.value();
        if(value.countryCode !="34"){
           return (
           <NumberInput value = {value.regionCode} onchange = {(value) => this.update("regionCode", value)}
                                            required = {this.props.required} placeholder="Area Code" maxLength="4"
           validationGroup={this.props.validationGroup}/> );
        }
        else {
            if(!_.isEmpty(value.regionCode))
            {
                this.update("regionCode",null);
            }       
             return null; 
        }

    }

    render(){
        let value = this.value();
        let countryInput = <NumberInput value = {value.countryCode} onchange = {(value) => this.update("countryCode", value)}
                                         required = {this.props.required} placeholder="Country Code" maxLength="3"
                                         validationGroup={this.props.validationGroup}/>;
       
        let numberInput = <NumberInput value = {value.phone} onchange = {(value) => this.update("phone", value)} maxLength="9"
                                        required = {this.props.required} placeholder="Phone Nr"
                                        validationGroup={this.props.validationGroup}/>;
        let extensionInput = "";
        let width = "5";
        if(this.props.showExtension){
            width = "6";
            extensionInput = <GridCell width={"1-" + width}>
                <NumberInput value = {value.extension} maxLength="5" onchange = {(value) => this.update("extension", value)} placeholder="Ext" />
            </GridCell>;
        }

        return (
            <Grid collapse = {true}>
                <GridCell width={"1-" + width}>{countryInput}</GridCell>
                <GridCell width={"1-" + width}>{this.renderAreaCode()}</GridCell>
                <GridCell width={"3-" + width}>{numberInput}</GridCell>
                {extensionInput}
            </Grid>
        );


    }
}