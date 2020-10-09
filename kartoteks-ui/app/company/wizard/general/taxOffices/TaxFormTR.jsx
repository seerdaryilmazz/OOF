import React from "react";
import _ from 'lodash';
import * as axios from "axios";
import PropTypes from "prop-types";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, CardHeader, Wizard} from "susam-components/layout";
import {Notify, TextInput, Button, DropDown, CheckboxGroup, Span, Form} from 'susam-components/basic';
import {NumberInput} from 'susam-components/advanced';
import {LookupService} from '../../../../services/KartoteksService';

export class TaxFormTR extends TranslatingComponent {
    constructor(props){
        super(props);
        this.state = {};
    }

    componentDidMount(){
        axios.all([
            LookupService.getCompanyTypeList(),
            LookupService.getTaxOfficeList()
        ]).then(axios.spread((companyTypes, taxOffices) => {
            let state = _.cloneDeep(this.state);
            state.types = companyTypes.data;
            state.taxOffices = taxOffices.data;
            this.setState(state);
            if(_.isEmpty(this.props.company.type)){
                this.updateState("type", _.find(companyTypes.data, {code: "CORPORATE"}));
            }
        })).catch(error => {
            Notify.showError(error);
        });
    }

    updateTcknState(value){
        this.props.onupdate && this.props.onupdate("tckn", value);
    }
    checkAndRemoveTaxIdError(value){
        if(!this.state.taxIdError){
            return;
        }
        let taxIdError = _.cloneDeep(this.state.taxIdError);
        this.state.taxIdError.forEach((error, index) => {
            if(error.correctValue && error.correctValue == value){
                taxIdError.splice(index, 1);
            }
        });
        this.setState({taxIdError: (taxIdError.size == 0 ? null : taxIdError)});
    }
    updateTaxIdState(value){
        value=value.trim();
        this.checkAndRemoveTaxIdError(value);
        this.props.onupdate && this.props.onupdate("taxId", value);
    }
    updateState(key, value){
        this.props.onupdate && this.props.onupdate(key, value);
    }
    updateTaxOffice(value){
        this.props.onupdate && this.props.onupdate("taxOffice", value);
        this.props.onupdate && this.props.onupdate("taxOfficeCode", value ? value.code : null);
    }
    isCompanyTypePersonal(){
        let type = _.get(this.props.company, 'type.code');
        return type == 'PERSONAL';
    }
    isCompanyTypeCorporate(){
        let type = _.get(this.props.company, 'type.code');
        return type == 'CORPORATE';
    }
    isCompanyTypeFreeZone(){
        let type = _.get(this.props.company, 'type.code');
        return type == 'FREEZONE';
    }
    verifyTaxOfficeAndTaxId(params){
        LookupService.verifyTaxOfficeAndID(params).then(response => {
            if(response.data.status == "error"){
                Notify.showError("Tax Id is not valid");
                this.setState({taxIdError: [{code: "taxIdNotValid", message: "Tax Id is not valid"}]});
                this.props.onverify && this.props.onverify("taxIdVerificationResult", response.data.data);
            }else{
                this.setState({taxIdError: null});
                this.props.onverify && this.props.onverify("taxIdVerificationResult", response.data.data);
            }
        }).catch(error => {
            Notify.showError(error);
        });
    }
    verifyTaxOfficeAndTckn(params){
        LookupService.verifyTaxOfficeAndID(params).then(response => {
            if(response.data.status == "error"){
                this.setState({tcknError: [{code: "tcknNotValid", message: "Tckn is not valid"}]});
                this.props.onverify && this.props.onverify("tcknVerificationResult", response.data.data);
            }else{
                this.setState({tcknError: null});
                if(this.props.company.taxId && this.props.company.taxId != response.data.data.taxId){
                    this.setState({taxIdError: [{code: "taxIdNotValid", message: "Tax Id is not valid", correctValue: response.data.data.taxId}]});
                }else{
                    this.setState({taxIdError: null});
                }
                this.props.onverify && this.props.onverify("tcknVerificationResult", response.data.data);
            }
        }).catch(error => {
            Notify.showError(error);
        });
    }
    validateTaxOffice(){
        if(!this.props.company.taxOffice){
            Notify.showError("Please select tax office");
            return false;
        }
        return true;
    }
    handleVerifyTcknClick(){
        if(!this.validateTaxOffice()){
            return;
        }
        let params = {country: this.props.company.country.iso};
        if(params.country == 'TR'){
            params.taxoffice = this.props.company.taxOffice.code;
            params.tckn = this.props.company.tckn;
            params.type = "PERS";
            this.verifyTaxOfficeAndTckn(params);
        }
    }
    handleVerifyTaxIdClick(){
        if(!this.validateTaxOffice()){
            return;
        }
        let params = {country: this.props.company.country.iso};
        if(params.country == 'TR'){
            params.taxoffice = this.props.company.taxOffice.code;
            params.taxid = this.props.company.taxId;
            params.type = this.isCompanyTypePersonal() ? "PERS" : "CORP";
            this.verifyTaxOfficeAndTaxId(params);
        }
    }

    render(){
        if(!this.props.company){
            return null;
        }
        let taxId = null;
        let tckn = null;
        if(this.isCompanyTypePersonal()){
            tckn = <NumberInput label="TCKN" value = {this.props.company.tckn}
                                oninput = {(value) => this.updateTcknState(value)} maxLength="11"
                                errors = {this.state.tcknError}
                                button = {{style:"success",
                                    label: super.translate("verify"),
                                    onclick: () => {this.handleVerifyTcknClick()}}
                                }/>;
        }
        if(this.isCompanyTypeCorporate() || this.isCompanyTypeFreeZone() || this.isCompanyTypePersonal()){
            taxId = <NumberInput label="Tax ID" value = {this.props.company.taxId}
                                  oninput = {(value) => this.updateTaxIdState(value)}
                                  errors = {this.state.taxIdError}
                                 button = {{style:"success",
                                     label: super.translate("verify"),
                                     onclick: () => {this.handleVerifyTaxIdClick()}}
                                 }/>;
        }
        return (
            <Grid>
                <GridCell width="1-4">
                    <DropDown options = {this.state.types} label="Type" required = {true} translate={true}
                              value = {this.props.company.type} onchange = {(value) => this.updateState("type", value)} />
                </GridCell>
                <GridCell width="1-4">
                    <DropDown options = {this.state.taxOffices} label="Tax Office"
                              value = {this.props.company.taxOffice} onchange = {(value) => this.updateTaxOffice(value)} />
                </GridCell>
                <GridCell width="1-4">
                    {taxId}
                </GridCell>
                <GridCell width="1-4">
                    {tckn}
                </GridCell>

            </Grid>
        );

    }
}
TaxFormTR.contextTypes = {
    translator: PropTypes.object
};