import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { LoadingIndicator } from "../utils";
import { Form, TextInput, TextArea, Span } from 'susam-components/basic';
import { Grid, GridCell } from 'susam-components/layout';
import { NumericInput, Date as DateSelector } from "susam-components/advanced";
import {Notify} from "susam-components/basic";
import {DateTimeUtils} from "../utils/DateTimeUtils";



export class PriceAdaptationModel extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {};
        this.moment = require("moment");
    }

    componentDidMount(){
        if(this.props.renew){
            let historyModel = _.cloneDeep(this.props.priceAdaptationModel);
            let priceAdaptationModel = _.cloneDeep(this.props.priceAdaptationModel);
            historyModel.id=undefined;
            historyModel.modelId=priceAdaptationModel.id;

            priceAdaptationModel.historyModel = historyModel;
            priceAdaptationModel.validityStartDate = this.moment().format('DD/MM/YYYY');
            priceAdaptationModel.notes = null;
            this.props.onChange(priceAdaptationModel);
        }
    }

    initializeLookups() {

    }

    validate() {
        if(!this.form.validate()){
            return false;
        }else{
            let priceAdaptationModel=this.props.priceAdaptationModel;
            if(priceAdaptationModel.eur>100){
                Notify.showError("EUR (%) can not be bigger than %100");
                return false;
            }
            if(priceAdaptationModel.usd>100){
                Notify.showError("USD (%) can not be bigger than %100");
                return false;
            }
            if(priceAdaptationModel.inflation>100){
                Notify.showError("Inflation (%) can not be bigger than %100");
                return false;
            }
            if(priceAdaptationModel.minimumWage>100){
                Notify.showError("Minimum Wage (%) can not be bigger than %100");
                return false;
            }
            if(!(priceAdaptationModel.eur + priceAdaptationModel.usd + priceAdaptationModel.inflation + priceAdaptationModel.minimumWage == 100)){
                Notify.showError("Sum of  EUR (%) , USD (%), Inflation (%) and Minimum Rage (%) values must be equal to 100!");
                return false;
            }
            if(this.props.renew){
                if(DateTimeUtils.translateToDateObject(this.props.priceAdaptationModel.historyModel.validityStartDate, "/") >
                    DateTimeUtils.translateToDateObject(this.props.priceAdaptationModel.validityStartDate, "/")){
                    Notify.showError("Renewed Adaptation Model's Validity Start Date can not be before than Old Adaptation Model");
                    return false;
                }
            }
        }
        return true;
    }

    handleChange(key, value) {
        let priceAdaptationModel = _.cloneDeep(this.props.priceAdaptationModel);
        _.set(priceAdaptationModel, key, value);
        this.props.onChange(priceAdaptationModel);
    }

    handlePercentageChange(key,value){
        let priceAdaptationModel = _.cloneDeep(this.props.priceAdaptationModel);
        if(value>100){
            value=100;
        }
        _.set(priceAdaptationModel, key, value);
        this.props.onChange(priceAdaptationModel);
    }

    getContent() {
        return(
            <Grid>
                <GridCell width="1-5">
                    <TextInput label="Name"
                               value = {this.props.priceAdaptationModel.name}
                               uppercase = {true}
                               disabled = {this.props.renew}
                               onchange = {(value) => this.handleChange("name", value)}
                               required = {true}/>
                </GridCell>
                <GridCell width="1-5">
                    <NumericInput label="EUR (%)" maxLength={"3"}
                                  style={{ textAlign: "right" }}
                                  value={this.props.priceAdaptationModel.eur}
                                  onchange={(value) => this.handlePercentageChange("eur", value)}/>
                </GridCell>
                <GridCell width="1-5">
                    <NumericInput label="USD (%)" maxLength={"3"}
                                  style={{ textAlign: "right" }}
                                  value={this.props.priceAdaptationModel.usd}
                                  onchange={(value) => this.handlePercentageChange("usd", value)}/>
                </GridCell>
                <GridCell width="1-5">
                    <NumericInput label="Inflation (%)" maxLength={"3"}
                                  style={{ textAlign: "right" }}
                                  value={this.props.priceAdaptationModel.inflation}
                                  onchange={(value) => this.handlePercentageChange("inflation", value)}/>
                </GridCell>
                <GridCell width="1-5">
                    <NumericInput label="Minimum Wage (%)" maxLength={"3"}
                                  style={{ textAlign: "right" }}
                                  value={this.props.priceAdaptationModel.minimumWage}
                                  onchange={(value) => this.handlePercentageChange("minimumWage", value)}/>
                </GridCell>
                <GridCell width="1-5">
                    <DateSelector label="Validity Start Date" hideIcon={true}
                          readOnly={this.props.readOnly}
                          required={true}
                          value={this.props.priceAdaptationModel.validityStartDate}
                          onchange={(value) => this.handleChange("validityStartDate", value)} />
                </GridCell>
                <GridCell width="1-5">
                    <Span label="Validity End Date"/>
                </GridCell>
                <GridCell width="3-5">
                    <TextArea label="Notes"
                               value = {this.props.priceAdaptationModel.notes}
                               onchange = {(value) => this.handleChange("notes", value)}/>
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