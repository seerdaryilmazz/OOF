import React from "react";
import _ from 'lodash';
import PropTypes from "prop-types";


import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, CardHeader, Wizard} from "susam-components/layout";
import {Notify, TextInput, Button, DropDown, Checkbox, CheckboxGroup, Span, Form} from 'susam-components/basic';
import {LookupService} from '../../../../services/KartoteksService';

export class TaxFormAlphaNumericTax extends TranslatingComponent {
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

    render(){
        if(!this.props.company){
            return null;
        }
        return (
            <Grid>
                <GridCell width="1-5">
                    <DropDown options = {this.state.types} label="Type" required = {true} translate={true}
                              value = {this.props.company.type} onchange = {(value) => this.updateState("type", value)} />
                </GridCell>
                <GridCell width="1-5">
                    <TextInput label="Tax ID" value = {this.props.company.taxId} onchange = {(value) => this.updateState("taxId", value)} />
                </GridCell>
            </Grid>
        );

    }
}
TaxFormAlphaNumericTax.contextTypes = {
    translator: PropTypes.object
};