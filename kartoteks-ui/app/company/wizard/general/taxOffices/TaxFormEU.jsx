import _ from 'lodash';
import PropTypes from "prop-types";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { DropDown, Notify, TextInput } from 'susam-components/basic';
import { Grid, GridCell } from "susam-components/layout";
import { LookupService } from '../../../../services/KartoteksService';


export class TaxFormEU extends TranslatingComponent {
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
        // if(key=="taxId"){
        //     value=value.replace(/[^a-z0-9]/gi,'');//Only allows alphanumeric characters
        // }
        this.props.onupdate && this.props.onupdate(key, value);
    }
    verifyTaxOfficeAndTaxId(params){
        LookupService.verifyTaxOfficeAndID(params).then(response => {
            if (response.data.status == "error") {
                Notify.showError("Tax Id is not valid");
                this.props.onverify && this.props.onverify("taxIdVerificationResult", null);
            } else {
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
                    <TextInput label="Tax ID" value={this.props.company.taxId} uppercase={true}
                               onchange={(value) => this.updateState("taxId", value)}
                               mask="'mask':'[A{0,}9{0,}]', 'repeat':'4', 'greedy':false, 'showmaskonhover':false, 'placeholder':''"
                               button={{
                                   style: "success",
                                   label: super.translate("verify"),
                                   onclick: () => {this.handleVerifyTaxOfficeClick()}}}/>
                </GridCell>
            </Grid>
        );

    }
}
TaxFormEU.contextTypes = {
    translator: PropTypes.object
};
