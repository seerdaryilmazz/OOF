import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { LoadingIndicator } from "../utils";
import { Form, TextInput, Span, ReadOnlyDropDown, TextArea, Button } from 'susam-components/basic';
import { Grid, GridCell } from 'susam-components/layout';
import { NumericInput, Date as DateSelector, DatePickerButton } from "susam-components/advanced";
import { RenewalDate } from "../common/RenewalDate";
import {LookupService} from "../services/LookupService";
import {Notify} from "susam-components/basic";
import {CurrencyService} from "../services/CurrencyService";

export class UnitPrice extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            historyUnitPrice:props.unitPrice,
            billingItems:[],
            basedOn:[],
            currencies: [
                {id: "EUR", code: "EUR", name: "EUR"},
                {id: "TRY", code: "TRY", name: "TRY"},
                {id: "USD", code: "USD", name: "USD"},
                {id: "GBP", code: "GBP", name: "GBP"}
            ]
        };
        this.moment = require("moment");
    }

    componentWillMount(){
    }

    componentDidMount(){
        if(this.props.renew){
            let historyUnitPrice = _.cloneDeep(this.props.unitPrice);
            let unitPrice = _.cloneDeep(this.props.unitPrice);
            historyUnitPrice.id=undefined;
            historyUnitPrice.unitPriceId=unitPrice.id;
            this.setState({historyUnitPrice : historyUnitPrice});

            unitPrice.eurRef = null;
            unitPrice.usdRef = null;
            unitPrice.historyUnitPrice = historyUnitPrice;
            unitPrice.notes = null;
            unitPrice.validityStartDate = this.setDayOfDate(unitPrice.validityEndDate,1);
            unitPrice.validityEndDate  = this.calculateEndDate(unitPrice.validityStartDate);
            this.props.onChange(unitPrice);
        }
        this.initializeLookups();
    }

    handleExchangeRates(key, date) {
        let fromCurrency;
        if(key=="usdRef"){
            fromCurrency = "USD";
        }else if(key=="eurRef"){
            fromCurrency = "EUR";
        }
        let params = {
            pageNumber: 0,
            pageSize: 1000,
            publisherCode: "CENTRAL_BANK_OF_TURKEY",
            publishDate: date,
            fromCurrencyCode: fromCurrency
        };
        CurrencyService.findExchangeRates(params).then(response => {
            if(!_.isEmpty(response.data.currentPageContent)){
                let roundedValue = Math.round(response.data.currentPageContent[0].banknoteSellingValue * 100) / 100;
                this.handleChange(key, roundedValue);
            }
        });

    }


    setDayOfDate(date,valueToBeAdded){
        // Gelen tarihin ay kısmını, new Date() fonksiyonuyla oluşturulan tarihte bir fazla gösterdiği için
        //o fazlalık çıkarıldı ==> parts[1]-1
        let parts = date.split("/");
        return moment(new Date(parts[2], parts[1] - 1, parts[0])).add(+valueToBeAdded, 'days').format('DD/MM/YYYY');
    }

    calculateEndDate(startDate){
        return (
        moment(startDate, "DD/MM/YYYY")
            .add(this.props.unitPrice.updatePeriod, this.props.unitPrice.renewalDateType.id)
            .format('DD/MM/YYYY'));
    }

    initializeLookups() {
        LookupService.getBillingItems(this.props.serviceAreas).then(response=>{
            if(response.data){
                response.data.forEach(item=>{
                    item.label=item.code+" - "+item.description
                });
                this.setState({billingItems:response.data});
            }
        }).catch(e=>{
            Notify.showError(e);
        });

        LookupService.getBasedOnTypes().then(response=>{
            this.setState({basedOn:response.data})
        }).catch(e=>{
            Notify.showError(e);
        });
    }

    validate() {
        return this.form.validate();
    }

    validateCalculation(){
        let unitPrice = _.cloneDeep(this.props.unitPrice);
        let historyUnitPrice = _.cloneDeep(this.state.historyUnitPrice);
        if(!unitPrice.usdRef && !unitPrice.eurRef && ! unitPrice.minimumWageRef && !unitPrice.inflationRef){
            Notify.showError("You must enter the next values of USD Ref & EUR Ref & Minimum Wage Ref & Inflation Ref(%) for calculation");
            return false;
        }
        if(!historyUnitPrice.eurRef && !historyUnitPrice.usdRef){
            Notify.showError("Current values of USD Ref & EUR Ref must be entered before renewing");
            return false;
        }
        return true;
    }

    handleChange(key, value) {
        let unitPrice = _.cloneDeep(this.props.unitPrice);
        _.set(unitPrice, key, value);
        this.props.onChange(unitPrice);
    }

    handleCurrencyChange(value){
        let unitPrice = _.cloneDeep(this.props.unitPrice);
        if(value){
            _.set(unitPrice, "currency", value.name);
        }else{
            _.set(unitPrice, "currency", null);
        }

        this.props.onChange(unitPrice);

    }

    handlePercentageChange(key,value){
        let unitPrice = _.cloneDeep(this.props.unitPrice);
        if(value>100){
            value=100;
        }
        _.set(unitPrice, key, value);
        this.props.onChange(unitPrice);
    }

    renderAmount() {
        if (this.props.readOnly) {
            return (
                <Span label="Amount" value={_.get(this.props.unitPrice,'contractAmount',"0,00")}/>
            );
        }
        else {
            return <NumericInput label="Amount" maxLength={"12"}
                                 style={{ textAlign: "right" }}
                                 digits="2" digitsOptional = {false}
                                 value={_.get(this.props.unitPrice,'contractAmount',"0,00")}
                                 onchange={(value) => this.handleChange("contractAmount", value)}/>;
        }
    }

    handleCalculationDate(key, value) {
        if(key || value){
            this.handleChange(key, value);
        }

        let date = (this.props.unitPrice.validityStartDate &&
            this.props.unitPrice.updatePeriod &&
            this.props.unitPrice.renewalDateType)
            ? this.calculateEndDate(this.props.unitPrice.validityStartDate) : null;
        if(date){
            this.handleChange("validityEndDate",date);
        }
    }

    renderUsdRefNext(){
        return(
            <Grid collapse={true}>
                <GridCell width="2-3" noMargin={true}>
                    <NumericInput label="USD Ref (Next)"
                                  digits="2" digitsOptional = {false}
                                  style={{ textAlign: "right" }}
                                  value={this.props.unitPrice.usdRef}
                                  onchange={(value) => this.handleChange("usdRef", value)}/>
                </GridCell>
                <GridCell width="1-3" style={{position: "relative"}}>
                    <DatePickerButton readOnly={false}
                                      value={this.props.unitPrice.usdRef}
                                      onchange={(value) => this.handleExchangeRates("usdRef", value)} />
                </GridCell>
            </Grid>
        )
    }

    renderEurRefNext(){
        return(
            <Grid collapse={true}>
                <GridCell width="2-3" noMargin={true}>
                    <NumericInput label="EUR Ref (Next)"
                                  digits="2" digitsOptional = {false}
                                  style={{ textAlign: "right" }}
                                  value={this.props.unitPrice.eurRef}
                                  onchange={(value) => this.handleChange("eurRef", value)}/>
                </GridCell>
                <GridCell width="1-3" style={{position: "relative"}}>
                    <DatePickerButton readOnly={false}
                                      value={this.props.unitPrice.eurRef}
                                      onchange={(value) => this.handleExchangeRates("eurRef", value)} />
                </GridCell>
            </Grid>
        )
    }

    getContent() {
        if(this.props.renew){
            return(
                <Grid>
                    <GridCell width="2-5">
                        <ReadOnlyDropDown options={this.state.billingItems} label="Billing Item"
                                          labelField="label"
                                          disabled={true}
                                          readOnly={this.props.readOnly}
                                          value={this.state.historyUnitPrice.billingItem}
                                          onchange = {(value) => this.handleChange("billingItem", value)}/>
                    </GridCell>
                    <GridCell width="2-5">
                        <TextInput label="Service Name"
                                   value = {this.state.historyUnitPrice.serviceName}
                                   disabled={true}
                                   uppercase = {true}
                                   onchange = {(value) => this.handleChange("serviceName", value)}/>
                    </GridCell>
                    <GridCell width="1-5">
                        <ReadOnlyDropDown options={this.props.priceModels} label="Price Model"
                                          readOnly={this.props.readOnly}
                                          valueField="name" labelField="name"
                                          value={this.props.unitPrice.priceModel}
                                          onchange = {(value) => this.handleChange("priceModel", value)}/>
                    </GridCell>
                    <GridCell width="1-5">
                        <ReadOnlyDropDown options={this.state.basedOn} label="Based On"
                                          required={true}
                                          labelField="name"
                                          readOnly={this.props.readOnly}
                                          value={this.props.unitPrice.basedOn}
                                          onchange = {(value) => this.handleChange("basedOn", value)}/>
                    </GridCell>
                    <GridCell width="1-5">
                        <DateSelector label="Validity Start Date" hideIcon={true}
                              readOnly={true}
                              value={this.props.unitPrice.validityStartDate}
                              onchange={(value) => this.handleCalculationDate("validityStartDate", value)} />
                    </GridCell>
                    <GridCell width="2-5">
                        <RenewalDate renewalLengthLabel="Update Period"
                                     required={true}
                                     renewalLengthValue={this.props.unitPrice.updatePeriod}
                                     renewalLengthDateType={this.props.unitPrice.renewalDateType}
                                     onRenewalLengthChange={(value) => this.handleCalculationDate("updatePeriod", value)}
                                     onRenewalLengthDateTypeChange={(value) => this.handleCalculationDate("renewalDateType", value)}/>
                    </GridCell>
                    <GridCell width="1-5">
                        <DateSelector label="Validity End Date" hideIcon={true}
                              value={this.props.unitPrice.validityEndDate}
                              readOnly={true} />
                    </GridCell>
                    <GridCell width="1-5">
                        <NumericInput label="EUR Ref (Current)"
                                      digits="2" digitsOptional = {false}
                                      disabled={true}
                                      style={{ textAlign: "right" }}
                                      value={this.state.historyUnitPrice.eurRef}/>
                    </GridCell>
                    <GridCell width="1-5">
                        {this.renderEurRefNext()}
                    </GridCell>
                    <GridCell width="1-5">
                        <NumericInput label="USD Ref (Current)"
                                      digits="2" digitsOptional = {false}
                                      disabled={true}
                                      style={{ textAlign: "right" }}
                                      value={this.state.historyUnitPrice.usdRef}/>
                    </GridCell>
                    <GridCell width="1-5">
                        {this.renderUsdRefNext()}
                    </GridCell>
                    <GridCell width="1-5">
                    </GridCell>
                    <GridCell width="1-5">
                        <NumericInput label="Minimum Wage Ref (Current)"
                                      digits="2" digitsOptional = {false}
                                      disabled={true}
                                      style={{ textAlign: "right" }}
                                      value={this.state.historyUnitPrice.minimumWageRef}/>
                    </GridCell>
                    <GridCell width="1-5">
                        <NumericInput label="Minimum Wage Ref (Next)"
                                      digits="2" digitsOptional = {false}
                                      style={{ textAlign: "right" }}
                                      value={this.props.unitPrice.minimumWageRef}
                                      onchange={(value) => this.handleChange("minimumWageRef", value)}/>
                    </GridCell>
                    <GridCell width="1-5">
                        <NumericInput label="Inflation Ref (%) (Current)"
                                      maxLength={"3"}
                                      disabled={true}
                                      style={{ textAlign: "right" }}
                                      value={this.state.historyUnitPrice.inflationRef}/>
                    </GridCell>
                    <GridCell width="1-5">
                        <NumericInput label="Inflation Ref (%) (Next)" maxLength={"3"}
                                      style={{ textAlign: "right" }}
                                      value={this.props.unitPrice.inflationRef}
                                      onchange={(value) => this.handlePercentageChange("inflationRef", value)}/>
                    </GridCell>
                    <GridCell width="1-5">
                    </GridCell>
                    <GridCell width="1-5">
                        <NumericInput label="Price (Current)" maxLength={"6"}
                                      disabled={true}
                                      digits="2" digitsOptional = {false}
                                      value={this.state.historyUnitPrice.price}/>
                    </GridCell>
                    <GridCell width="1-5">
                        <NumericInput label="Price (Next)" maxLength={"6"}
                                      required={true}
                                      digits="2" digitsOptional = {false}
                                      value={this.props.unitPrice.price}
                                      onchange={(value) => this.handleChange("price", value)}/>
                    </GridCell>
                    <GridCell width="1-5">
                        <ReadOnlyDropDown options={this.state.currencies} label="Currency"
                                          required={true}
                                          readOnly={this.props.readOnly}
                                          value={this.props.unitPrice.currency}
                                          onchange = {(value) => this.handleCurrencyChange(value)}/>
                    </GridCell>
                    <GridCell width="2-5">
                    <TextArea label="Notes"
                              value = {this.props.unitPrice.notes}
                              onchange = {(value) => this.handleChange("notes", value)}/>
                    </GridCell>
                </Grid>
            );
        }
        else{
            return(
                <Grid>
                    <GridCell width="2-5">
                        <ReadOnlyDropDown options={this.state.billingItems} label="Billing Item"
                                          required={true}
                                          labelField="label"
                                          readOnly={this.props.readOnly}
                                          value={this.props.unitPrice.billingItem}
                                          onchange = {(value) => this.handleChange("billingItem", value)}/>
                    </GridCell>
                    <GridCell width="2-5">
                        <TextInput label="Service Name"
                                   value = {this.props.unitPrice.serviceName}
                                   required={true}
                                   uppercase = {true}
                                   onchange = {(value) => this.handleChange("serviceName", value)}/>
                    </GridCell>
                    <GridCell width="1-5">
                        <ReadOnlyDropDown options={this.props.priceModels} label="Price Model"
                                          readOnly={this.props.readOnly}
                                          valueField="name" labelField="name"
                                          value={this.props.unitPrice.priceModel}
                                          onchange = {(value) => this.handleChange("priceModel", value)}/>
                    </GridCell>
                    <GridCell width="1-5">
                        <ReadOnlyDropDown options={this.state.basedOn} label="Based On"
                                          required={true}
                                          labelField="name"
                                          readOnly={this.props.readOnly}
                                          value={this.props.unitPrice.basedOn}
                                          onchange = {(value) => this.handleChange("basedOn", value)}/>
                    </GridCell>
                    <GridCell width="1-5">
                        <DateSelector label="Validity Start Date" hideIcon={true}
                              readOnly={this.props.readOnly}
                              required={true}
                              value={this.props.unitPrice.validityStartDate}
                              onchange={(value) => this.handleCalculationDate("validityStartDate", value)} />
                    </GridCell>
                    <GridCell width="2-5">
                        <RenewalDate renewalLengthLabel="Update Period"
                                     required={true}
                                     renewalLengthValue={this.props.unitPrice.updatePeriod}
                                     renewalLengthDateType={this.props.unitPrice.renewalDateType}
                                     onRenewalLengthChange={(value) => this.handleCalculationDate("updatePeriod", value)}
                                     onRenewalLengthDateTypeChange={(value) => this.handleCalculationDate("renewalDateType", value)}/>
                    </GridCell>
                    <GridCell width="1-5">
                        <DateSelector label="Validity End Date" hideIcon={true}
                              value={this.props.unitPrice.validityEndDate}
                              readOnly={true} />
                    </GridCell>
                    <GridCell width="1-5">
                        <NumericInput label="EUR Ref"
                                      digits="2" digitsOptional = {false}
                                      style={{ textAlign: "right" }}
                                      value={this.props.unitPrice.eurRef}
                                      onchange={(value) => this.handleChange("eurRef", value)}/>
                    </GridCell>
                    <GridCell width="1-5">
                        <NumericInput label="USD Ref"
                                      digits="2" digitsOptional = {false}
                                      style={{ textAlign: "right" }}
                                      value={this.props.unitPrice.usdRef}
                                      onchange={(value) => this.handleChange("usdRef", value)}/>
                    </GridCell>
                    <GridCell width="1-5">
                        <NumericInput label="Minimum Wage Ref"
                                      digits="2" digitsOptional = {false}
                                      style={{ textAlign: "right" }}
                                      value={this.props.unitPrice.minimumWageRef}
                                      onchange={(value) => this.handleChange("minimumWageRef", value)}/>
                    </GridCell>
                    <GridCell width="1-5">
                        <NumericInput label="Inflation Ref (%)" maxLength={"3"}
                                      style={{ textAlign: "right" }}
                                      value={this.props.unitPrice.inflationRef}
                                      onchange={(value) => this.handlePercentageChange("inflationRef", value)}/>
                    </GridCell>
                    <GridCell width="1-5">
                    </GridCell>
                    <GridCell width="1-5">
                        <NumericInput label="Price" maxLength={"6"}
                                      required={true}
                                      digits="2" digitsOptional = {false}
                                      value={this.props.unitPrice.price}
                                      onchange={(value) => this.handleChange("price", value)}/>
                    </GridCell>
                    <GridCell width="1-5">
                        <ReadOnlyDropDown options={this.state.currencies} label="Currency"
                                          required={true}
                                          readOnly={this.props.readOnly}
                                          value={this.props.unitPrice.currency}
                                          onchange = {(value) => this.handleCurrencyChange(value)}/>
                    </GridCell>
                    <GridCell width="2-5">
                    <TextArea label="Notes"
                              value = {this.props.unitPrice.notes}
                              onchange = {(value) => this.handleChange("notes", value)}/>
                    </GridCell>
                </Grid>
            );
        }

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