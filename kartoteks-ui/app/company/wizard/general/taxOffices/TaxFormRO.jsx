import React from "react";
import _ from 'lodash';
import PropTypes from "prop-types";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, CardHeader, Wizard} from "susam-components/layout";
import {Notify, TextInput, Button, DropDown, Checkbox, CheckboxGroup, Span, Form} from 'susam-components/basic';
import {NumberInput} from 'susam-components/advanced';
import {LookupService} from '../../../../services/KartoteksService';


export class TaxFormRO extends TranslatingComponent {
    constructor(props){
        super(props);
        this.state = {};
    }

    componentDidMount(){
        LookupService.getCompanyTypeList().then(response => {
            let filter = {code: LookupService.PERSONAL};
            let types = response.data;
            _.remove(types, filter);
            this.setState({types: types});
            if(_.isEmpty(this.props.company.type)){
                this.updateState("type", _.find(types, {code: "CORPORATE"}));
            }
        }).catch(error => {
            Notify.showError(error);
        });
    }

    updateState(key, value){
        if(key=="taxId"){
            value=value.trim();
        }
        this.props.onupdate && this.props.onupdate(key, value);
    }
    verifyTaxOfficeAndTaxId(params){
        LookupService.verifyTaxOfficeAndID(params).then(response => {
            if(response.data.status == "error"){
                Notify.showError("Tax Id is not valid");
                this.props.onverify && this.props.onverify("taxIdVerificationResult", null);
            }else{
                this.props.onverify && this.props.onverify("taxIdVerificationResult", response.data.data);
            }
        }).catch(error => {
            Notify.showError(error);
        });
    }
    handleVerifyTaxOfficeClick(){
        let params = {
            country: this.props.company.country.iso,
            taxid: this.props.company.taxId,
            type: "CORP"
        };
        this.verifyTaxOfficeAndTaxId(params);
    }

    render(){
        if(!this.props.company){
            return null;
        }
        return (
            <Grid>
                <GridCell width="1-4">
                    <DropDown options = {this.state.types} label="Type" required = {true} translate={true}
                              value = {this.props.company.type} onchange = {(value) => this.updateState("type", value)} />
                </GridCell>
                <GridCell width="1-4">
                    <NumberInput label="Tax ID" value = {this.props.company.taxId}
                                 oninput = {(value) => this.updateState("taxId", value)}
                                 button = {{style:"success",
                                     label: super.translate("verify"),
                                     onclick: () => {this.handleVerifyTaxOfficeClick()}}
                                 }/>
                </GridCell>

            </Grid>
        );

    }
}
TaxFormRO.contextTypes = {
    translator: PropTypes.object
};