import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { LoadingIndicator } from "../utils";
import { Form, ReadOnlyDropDown, TextArea } from 'susam-components/basic';
import { Grid, GridCell } from 'susam-components/layout';
import { NumericInput, Date as DateSelector } from "susam-components/advanced";
import {LookupService} from "../services/LookupService";
import * as axios from 'axios';
import {Notify} from "susam-components/basic";


export class InsuranceInfo extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            currencies: [
                {id: "EUR", code: "EUR", name: "EUR"},
                {id: "TRY", code: "TRY", name: "TRY"},
                {id: "USD", code: "USD", name: "USD"},
                {id: "GBP", code: "GBP", name: "GBP"}
            ]
        };
        this.moment = require("moment");
    }

    componentDidMount(){
        this.initializeLookups();
    }

    initializeLookups() {
        axios.all([
            LookupService.getInsuranceTypes(),
            LookupService.getEkolOrCustomer()
        ]).then(axios.spread((insuranceTypes, insuredBy) => {
            let state = _.cloneDeep(this.state);
            state.insuranceTypes = insuranceTypes.data;
            state.insuredBy = insuredBy.data;
            this.setState(state);
        })).catch(error => {
            Notify.showError(error);
        });
    }


    validate() {
        if(!this.form.validate()){
            return false;
        }else{
            let insuranceInfo = _.cloneDeep(this.props.insuranceInfo);
            if(this.processStartDate(insuranceInfo.validityStartDate)>this.processEndDate(insuranceInfo.validityEndDate)){
                Notify.showError("Validity Start Date must be earlier than Validity End Date");
                return false;
            }
        }
        return true;
    }

    processStartDate(date){
        let parts=date.split("/");
        return new Date(parts[2],parts[1]-1,parts[0]);
    }

    //Start Date ve End Date aynı gün girilmesine izin vermemek için yapıldı.
    processEndDate(date){
        let parts=date.split("/");
        return new Date(parts[2],parts[1]-1,parts[0]-1);
    }

    handleChange(key, value) {
        let insuranceInfo = _.cloneDeep(this.props.insuranceInfo);
        _.set(insuranceInfo, key, value);
        this.props.onChange(insuranceInfo);
    }

    handleCurrencyChange(value){
        let insuranceInfo = _.cloneDeep(this.props.insuranceInfo);
        if(value){
            _.set(insuranceInfo, "currency", value.name);
        }else{
            _.set(insuranceInfo, "currency", null);
        }
        this.props.onChange(insuranceInfo);
    }

    handleDateChange(key,value){
        let insuranceInfo = _.cloneDeep(this.props.insuranceInfo);
        if(value==null || value==""){
            _.unset(insuranceInfo, key);
        }else{
            _.set(insuranceInfo, key, value);
        }
        this.props.onChange(insuranceInfo);
    }

    getContent() {
        return(
            <Grid>
                <GridCell width="1-4">
                    <ReadOnlyDropDown options={this.state.insuranceTypes} label="Type"
                                      required={true}
                                      readOnly={this.props.readOnly}
                                      labelField="name" valueField="name"
                                      value={this.props.insuranceInfo.insuranceType}
                                      onchange = {(value) => this.handleChange("insuranceType", value)}/>
                </GridCell>
                <GridCell width="1-4">
                    <ReadOnlyDropDown options={this.state.insuredBy} label="Insured By"
                                      required={true}
                                      readOnly={this.props.readOnly}
                                      labelField="name" valueField="name"
                                      value={this.props.insuranceInfo.insuredBy}
                                      onchange = {(value) => this.handleChange("insuredBy", value)}/>
                </GridCell>
                <GridCell width="1-4">
                    <DateSelector label="Validity Start Date" hideIcon={true}
                          readOnly={this.props.readOnly}
                          required={true}
                          value={this.props.insuranceInfo.validityStartDate}
                          onchange={(value) => this.handleChange("validityStartDate", value)} />
                </GridCell>
                <GridCell width="1-4">
                    <DateSelector label="Validity End Date" hideIcon={true}
                          readOnly={this.props.readOnly}
                          required={true}
                          value={this.props.insuranceInfo.validityEndDate}
                          onchange={(value) => this.handleChange("validityEndDate", value)} />
                </GridCell>
                <GridCell width="1-4">
                    <NumericInput label="Exemption Limit" maxLength={"11"}
                                  style={{ textAlign: "right" }}
                                  digits="2" digitsOptional = {false}
                                  value={this.props.insuranceInfo.exemptionLimit}
                                  onchange={(value) => this.handleChange("exemptionLimit", value)}/>
                </GridCell>
                <GridCell width="1-4">
                    <ReadOnlyDropDown options={this.state.currencies} label="Currency"
                                      required={this.props.insuranceInfo.exemptionLimit}
                                      readOnly={this.props.readOnly}
                                      value={this.props.insuranceInfo.currency}
                                      onchange = {(value) => this.handleCurrencyChange(value)}/>
                </GridCell>
                <GridCell width="1-4">
                    <TextArea label="Coverage"
                              value = {this.props.insuranceInfo.coverage}
                              onchange = {(value) => this.handleChange("coverage", value)}/>
                </GridCell>
            </Grid>
        );
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