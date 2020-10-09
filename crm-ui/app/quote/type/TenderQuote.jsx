import _ from "lodash";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Form, Notify, ReadOnlyDropDown, TextArea } from "susam-components/basic";
import { Card, CardHeader, Grid, GridCell, PageHeader } from "susam-components/layout";
import { LookupService } from '../../services';
import {ObjectUtils} from "../../utils";
import { BundledProductList } from "../product/bundled/BundledProductList";
import { QuoteCommonInfo } from "../QuoteCommonInfo";


export class TenderQuote extends TranslatingComponent{

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount(){
        this.retrievePaymentDueDays();
    }

    
    retrievePaymentDueDays(){
        LookupService.getPaymentDueDays().then(response => {
            this.setState({paymentDueDays : response.data.map(value => {return {id: value, code: value, name: value}})});
        }).catch(error => {
            console.log(error);
            Notify.showError(error);
        });
    }
    
    validate(){
        if(!this.quoteCommonInfo.validate()) {    
            return false;
        }
        if(this.paymentForm){
            return this.paymentForm.validate();
        }      
        return true;
    }

    updateState(key, value) {
        let state = _.cloneDeep(this.state);
        state[key] = value;
        this.setState(state);
    }

    handleChange(key, value) {
        this.handleChangeMultiple([{key: key, value: value}]);
             
    }

    /**
     * Tek seferde birden çok değeri değiştirmek için...
     */
    handleChangeMultiple(keyValuePairs) {
        let quote = _.cloneDeep(this.props.quote);
        ObjectUtils.applyKeyValuePairs(keyValuePairs, quote);
        this.props.onChange(quote);
    }

    renderPageHeader(){
        let quoteNumberSuffix = !_.isNil(this.props.quote.number) ? " - " + this.props.quote.number : "";
        return (
            <GridCell noMargin={true} style={{paddingLeft:"10px",paddingTop:"10px",position:"fixed",zIndex:2,marginTop: "-54px", marginRight:"50px", background:"#eeeeee"}}>
                <PageHeader title={super.translate("Tender Quote") + quoteNumberSuffix}/>
            </GridCell>
        );
    }

    
    render(){
        if (!this.props.account) {
            return null;
        }
        return(
            <div>
                {this.renderPageHeader()}
                <QuoteCommonInfo ref = {c => this.quoteCommonInfo = c}
                                 account = {this.props.account}
                                 quote = {this.props.quote}
                                 onChange={(keyValuePairs) => this.handleChangeMultiple(keyValuePairs)}
                                 readOnly={this.props.readOnly}/>
                <Card>
                <Form ref = {c => this.paymentForm = c}>
                    <CardHeader title="Payment & Invoicing Info"/>
                    <Grid>
                        <GridCell width="1-2">
                            <ReadOnlyDropDown options = {this.state.paymentDueDays} label="Payment Due Days" readOnly={this.props.readOnly}
                                              value = {_.toString(this.props.quote.paymentDueDays)} required={true}
                                              onchange = {(value) => {value ? this.handleChange("paymentDueDays", value.code) : null}}/>
                        </GridCell>
                        <GridCell width="1-2">
                            <TextArea label="Payment Description" value = {this.props.quote.paymentDescription || " "}
                                              rows={3} readOnly={this.props.readOnly} maxLength="2000"
                                              onchange = {(value) => this.handleChange("paymentDescription", value)}/>
                        </GridCell>
                    </Grid>
                    </Form>
                </Card>
                <Card>
                    <CardHeader title="Transportation & Equipment Info"/>
                    <Grid>
                        <GridCell width="1-2">
                            <TextArea label="Product Type" value = {this.props.quote.productType || " "}
                                              rows={3} readOnly={this.props.readOnly} maxLength="2000"
                                              onchange = {(value) => this.handleChange("productType", value)}/>
                        </GridCell>
                        <GridCell width="1-2">
                            <TextArea label="Transportation Type" value = {this.props.quote.transportationType || " "}
                                              rows={3} readOnly={this.props.readOnly} maxLength="2000"
                                              onchange = {(value) => this.handleChange("transportationType", value)}/>
                        </GridCell>
                        <GridCell width="1-2">
                            <TextArea label="Equipment Type" value = {this.props.quote.equipmentType || " "}
                                              rows={3} readOnly={this.props.readOnly} maxLength="2000"
                                              onchange = {(value) => this.handleChange("equipmentType", value)}/>
                        </GridCell>
                    </Grid>
                </Card>
                <Card>
                    <CardHeader title="Pricing Info"/>
                    <Grid>
                        <GridCell width="1-2">
                            <TextArea label="Important Price Issues" value = {this.props.quote.importantPriceIssues || " "}
                                              rows={3} readOnly={this.props.readOnly} maxLength="2000"
                                              onchange = {(value) => this.handleChange("importantPriceIssues", value)}/>
                        </GridCell>
                        <GridCell width="1-2">
                            <TextArea label="Conversion Factors for LTL" value = {this.props.quote.conversionFactorsLtl || " "}
                                              rows={3} readOnly={this.props.readOnly} maxLength="2000"
                                              onchange = {(value) => this.handleChange("conversionFactorsLtl", value)}/>
                        </GridCell>
                    </Grid>
                </Card>
                <Card>
                    <CardHeader title="Surcharges Info"/>
                    <Grid>
                        <GridCell width="1-2">
                            <TextArea label="Diesel Mechanism" value = {this.props.quote.dieselMechanism || " "}
                                              rows={3} readOnly={this.props.readOnly} maxLength="2000"
                                              onchange = {(value) => this.handleChange("dieselMechanism", value)}/>
                        </GridCell>
                        <GridCell width="1-2">
                            <TextArea label="ADR/Frigo/Express" value = {this.props.quote.adrFrigoExpress || " "}
                                              rows={3} readOnly={this.props.readOnly} maxLength="2000"
                                              onchange = {(value) => this.handleChange("adrFrigoExpress", value)}/>
                        </GridCell>
                        <GridCell width="1-2">
                            <TextArea label="Demurrage" value = {this.props.quote.demurrage || " "}
                                              rows={3} readOnly={this.props.readOnly} maxLength="2000"
                                              onchange = {(value) => this.handleChange("demurrage", value)}/>
                        </GridCell>
                        <GridCell width="1-2">
                            <TextArea label="Cancellation" value = {this.props.quote.cancellation || " "}
                                              rows={3} readOnly={this.props.readOnly} maxLength="2000"
                                              onchange = {(value) => this.handleChange("cancellation", value)}/>
                        </GridCell>
                    </Grid>
                </Card>
                <Card>
                    <CardHeader title="KPI & Penalty Info"/>
                    <Grid>
                        <GridCell width="1-2">
                            <TextArea label="KPI" value = {this.props.quote.kpi || " "}
                                              rows={3} readOnly={this.props.readOnly} maxLength="2000"
                                              onchange = {(value) => this.handleChange("kpi", value)}/>
                        </GridCell>
                        <GridCell width="1-2">
                            <TextArea label="Penalty Detail" value = {this.props.quote.penaltyDetail || " "}
                                              rows={3} readOnly={this.props.readOnly} maxLength="2000"
                                              onchange = {(value) => this.handleChange("penaltyDetail", value)}/>
                        </GridCell>
                    </Grid>
                </Card>
                <Card>
                    <CardHeader title="Loading & Unloading Info"/>
                    <Grid>
                        <GridCell width="1-2">
                            <TextArea label="Loading & Unloading FreeTimes" value = {this.props.quote.loadUnloadFreeTimes || " "}
                                              rows={3} readOnly={this.props.readOnly} maxLength="2000"
                                              onchange = {(value) => this.handleChange("loadUnloadFreeTimes", value)}/>
                        </GridCell>
                        <GridCell width="1-2">
                            <TextArea label="Stackability" value = {this.props.quote.stackability || " "}
                                              rows={3} readOnly={this.props.readOnly} maxLength="2000"
                                              onchange = {(value) => this.handleChange("stackability", value)}/>
                        </GridCell>
                    </Grid>
                </Card>
                <BundledProductList quote = {this.props.quote}
                                    onChange={(keyValuePairs) => this.handleChangeMultiple(keyValuePairs)}
                                    readOnly={this.props.readOnly}/>
            </div>
        );
    }
}