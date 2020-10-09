import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell} from 'susam-components/layout';
import {Notify, DropDown, Form} from 'susam-components/basic';
import {NumericInput} from "susam-components/advanced";
import {LookupService} from '../services';
import {withReadOnly} from '../utils';
import {CompanySearchAutoComplete} from 'susam-components/oneorder';


export class LostReason extends TranslatingComponent{

    static defaultProps = {
        lostReason: {}
    };

    constructor(props){
        super(props);
        this.state = {
            currencies: [
                {id:"EUR", code:"EUR", name:"EUR"},
                {id:"USD", code:"USD", name:"USD"}
            ],
        };
    }

    componentDidMount(){
        if(!this.props.readOnly){
            this.initializeLookups();
        }
    }

    initializeLookups(){
        this.getLostReasons();
    }

    getLostReasons(){
        LookupService.getLostReasons().then((response) => {
            let state = _.cloneDeep(this.state);
            state.lostReasons = response.data;
            this.setState(state);
        }).catch(error => {
            Notify.showError(error);
        })
    }

    handleChange(key, value){
        let lostReason = _.cloneDeep(this.props.lostReason);
        _.set(lostReason, key, value);
        this.props.onChange(lostReason);
    }

    validate(){
        if(!this.form.validate()){
            return false;
        }
        return true;
    }

    render(){
        let reasonDetails = [];
        if(this.props.lostReason && this.props.lostReason.reason){
            if(this.props.lostReason.reason.options){
                reasonDetails = this.props.lostReason.reason.options.map(opt => {return {id: opt, name: opt}});
            }
        }

        return(
            <Card>
                <Form ref = {c => this.form = c}>
                    <Grid widthLarge={true}>
                        <GridCell width="2-3">
                            <ReadOnlyDropDown options = {this.state.lostReasons} label="Reason" readOnly={this.props.readOnly} translate={true}
                                              value = {this.props.lostReason.reason} required={true}
                                              onchange = {(reason) => this.handleChange("reason", reason)}/>
                        </GridCell>
                        <GridCell width="1-3">
                            <ReadOnlyDropDown options = {reasonDetails} label="Reason Detail" readOnly={this.props.readOnly} translate={true}
                                              value = {this.props.lostReason.reasonDetail}
                                              onchange = {(reasonDetail) => {reasonDetail ? this.handleChange("reasonDetail", reasonDetail.name) : null}}/>
                        </GridCell>
                        <GridCell width="4-6">
                            <CompanySearchAutoComplete label="Competitor Company" readOnly={this.props.readOnly}
                                                       value={this.props.lostReason.competitor}
                                                       onchange={(value) => this.handleChange("competitor", value)}
                                                       onclear={() => this.handleChange("competitor", {})}/>
                        </GridCell>
                        <GridCell width="1-6">
                            <NumericInput label = "Competitor Price" digits="2" digitsOptional = {false}
                                          value = {this.props.lostReason.competitorPrice} readOnly={this.props.readOnly}
                                          onchange = {(value) => this.handleChange("competitorPrice", value)}/>
                        </GridCell>
                        <GridCell width="1-6">
                            <ReadOnlyDropDown options={this.state.currencies} label="Currency"
                                              value = {this.props.lostReason.competitorPriceCurrency} readOnly={this.props.readOnly}
                                              onchange = {(currency) => {currency ? this.handleChange("competitorPriceCurrency", currency.code) : null}}/>
                        </GridCell>
                    </Grid>
                </Form>
            </Card>

        );
    }
}

const ReadOnlyDropDown = withReadOnly(DropDown);