import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { LoadingIndicator } from "../utils";
import { Form, TextArea, Span, ReadOnlyDropDown } from 'susam-components/basic';
import { Grid, GridCell } from 'susam-components/layout';
import { NumericInput, Date as DateSelector } from "susam-components/advanced";
import {Notify} from "susam-components/basic";


export class LetterOfGuarentee extends TranslatingComponent {

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

    validate() {
        if(!this.form.validate()){
            return false;
        }else{
            let letterOfGuarentee = _.cloneDeep(this.props.letterOfGuarentee);
            if(this.processStartDate(letterOfGuarentee.validityStartDate)>this.processEndDate(letterOfGuarentee.validityEndDate)){
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
        let letterOfGuarentee = _.cloneDeep(this.props.letterOfGuarentee);
        _.set(letterOfGuarentee, key, value);
        this.props.onChange(letterOfGuarentee);
    }

    handleCurrencyChange(value){
        let letterOfGuarentee = _.cloneDeep(this.props.letterOfGuarentee);
        if(value){
            _.set(letterOfGuarentee, "currency", value.name);
        }else{
            _.set(letterOfGuarentee, "currency", null);
        }

        this.props.onChange(letterOfGuarentee);

    }

    renderAmount() {
        if (this.props.readOnly) {
            return (
                <Span label="Amount" value={_.get(this.props.letterOfGuarentee,'contractAmount',"0,00")}/>
            );
        }
        else {
            return <NumericInput label="Amount" maxLength={"12"}
                                 style={{ textAlign: "right" }}
                                 digits="2" digitsOptional = {false}
                                 value={_.get(this.props.letterOfGuarentee,'contractAmount',"0,00")}
                                 onchange={(value) => this.handleChange("contractAmount", value)}/>;
        }
    }

    getContent() {
        return(
            <Grid>
                <GridCell width="1-4">
                    {this.renderAmount()}
                </GridCell>
                <GridCell width="1-4">
                    <ReadOnlyDropDown options={this.state.currencies} label="Currency"
                                      required={this.props.letterOfGuarentee.contractAmount}
                                      readOnly={this.props.readOnly}
                                      value={this.props.letterOfGuarentee.currency}
                                      onchange = {(value) => this.handleCurrencyChange(value)}/>
                </GridCell>
                <GridCell width="1-4">
                    <DateSelector label="Validity Start Date" hideIcon={true}
                          readOnly={this.props.readOnly}
                          required={true}
                          value={this.props.letterOfGuarentee.validityStartDate}
                          onchange={(value) => this.handleChange("validityStartDate", value)} />
                </GridCell>
                <GridCell width="1-4">
                    <DateSelector label="Validity End Date" hideIcon={true}
                          readOnly={this.props.readOnly}
                          required={true}
                          value={this.props.letterOfGuarentee.validityEndDate}
                          onchange={(value) => this.handleChange("validityEndDate", value)} />
                </GridCell>
                <GridCell width="1-4">
                    <TextArea label="Scope"
                              value = {this.props.letterOfGuarentee.scope}
                              onchange = {(value) => this.handleChange("scope", value)}/>
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