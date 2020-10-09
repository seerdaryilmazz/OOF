import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Card, CardHeader, Grid, GridCell} from 'susam-components/layout';
import { Form, ReadOnlyDropDown, Notify, Span, Checkbox } from 'susam-components/basic';
import { NumericInput, Date } from "susam-components/advanced";
import { LookupService } from "../services/LookupService";
import * as axios from 'axios';

export class FinancialInfo extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.moment = require("moment");
        this.state = {
            currencies: [
                {id: "EUR", code: "EUR", name: "EUR"},
                {id: "TRY", code: "TRY", name: "TRY"},
                {id: "USD", code: "USD", name: "USD"},
                {id: "GBP", code: "GBP", name: "GBP"}
            ]
        };
    }

    componentDidMount(){
        this.initializeLookups();
    }

    validate() {
        return this.form.validate();
    }

    initializeLookups() {
        axios.all([
            LookupService.getPaymentDueDays(),
            LookupService.getStampTaxPayer()
        ]).then(axios.spread((paymentDueDays, stampTaxPayer) => {
            let state = _.cloneDeep(this.state);
            state.paymentDueDays = paymentDueDays.data.map(value => {return {id: value, code: value, name: value}});
            state.stampTaxPayer = stampTaxPayer.data;
            this.setState(state);
        })).catch(error => {
            Notify.showError(error);
        });
    }

    handleChange(key, value) {
        let financialInfo = _.cloneDeep(this.props.financialInfo);
        _.set(financialInfo, key, value);
        let keyValuePairs = [{key: "financialInfo", value: financialInfo}];
        this.props.onChange(keyValuePairs);
    }

    renderStampTaxDueDate() {
        if (this.props.readOnly) {
            return (
                <Span label="Payment Due Date" value={this.props.financialInfo.stampTaxDueDate}/>
            );
        }
        else {
            return (
                <Date label="Payment Due Date" hideIcon={true}
                      value={this.props.financialInfo.stampTaxDueDate ? this.props.financialInfo.stampTaxDueDate : " "}
                      onchange={(value) => this.handleChange("stampTaxDueDate", value)}/>
            );
        }
    }

    renderAmount(label, type) {
        if (this.props.readOnly) {
            return (
                <Span label={label} value={_.get(this.props.financialInfo,`${type}`,"0,00")}/>
            );
        }
        else {
            return <NumericInput label={label} maxLength={"12"}
                                 style={{ textAlign: "right" }}
                                 digits="2" digitsOptional = {false}
                                 value={_.get(this.props.financialInfo,`${type}`,"0,00")}
                                 onchange={(value) => this.handleChange(`${type}`, value)}/>;
        }
    }

    getContent() {
        return(
            <Grid>
                <GridCell width="1-3">
                    {this.renderAmount("Contract Amount", "contractAmount")}
                </GridCell>
                <GridCell width="1-3">
                    <ReadOnlyDropDown options={this.state.currencies} label="Currency"
                                      required={this.props.financialInfo.contractAmount}
                                      readOnly={this.props.readOnly}
                                      value={this.props.financialInfo.contractAmountCurrency}
                                      onchange = {(value) => this.handleChange("contractAmountCurrency", value.name)}/>
                </GridCell>
                <GridCell width="1-3">
                    <ReadOnlyDropDown options = {this.state.paymentDueDays} label="Payment Due Days" readOnly={this.props.readOnly}
                                      value = {_.toString(this.props.financialInfo.paymentDueDays)}
                                      onchange = {(value) => {value ? this.handleChange("paymentDueDays", value.code) : null}}/>
                </GridCell>
            </Grid>
        );
    }

    getStampTaxInfoContent() {
        return(
            <Grid>
                <GridCell width="1-5">
                    <ReadOnlyDropDown options={this.state.stampTaxPayer} label="Payer"
                                      readOnly={this.props.readOnly}
                                      value={this.props.financialInfo.stampTaxPayer}
                                      onchange = {(value) => this.handleChange("stampTaxPayer", value)}/>
                </GridCell>
                <GridCell width="1-5">
                    {this.renderAmount("Amount", "stampTaxAmount")}
                </GridCell>
                <GridCell width="1-5">
                    <ReadOnlyDropDown options={this.state.currencies} label="Currency"
                                      required={this.props.financialInfo.stampTaxAmount}
                                      readOnly={this.props.readOnly}
                                      value={this.props.financialInfo.stampTaxCurrency}
                                      onchange = {(value) => this.handleChange("stampTaxCurrency", value.name)}/>
                </GridCell>
                <GridCell width="1-5">
                    {this.renderStampTaxDueDate()}
                </GridCell>
                <GridCell width="1-5">
                    <Checkbox label="Paid" value={this.props.financialInfo.paid}
                              disabled={this.props.readOnly}
                              onchange={(value) => this.handleChange("paid", value)}/>
                </GridCell>
            </Grid>
        );
    }

    render() {
        return(
            <Card>
                <Form ref={c => this.form = c}>
                    <CardHeader title="Financial Info"/>
                    {this.getContent()}
                    <CardHeader title="Stamp Tax Info"/>
                    {this.getStampTaxInfoContent()}
                </Form>
            </Card>
        );
    }

}