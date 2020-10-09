import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell} from 'susam-components/layout';
import {Notify, DropDown, Form} from 'susam-components/basic';
import {LookupService} from '../services';
import {withReadOnly} from '../utils';
import * as axios from 'axios';
import _ from "lodash";


export class CloseReason extends TranslatingComponent{

    constructor(props){
        super(props);
        this.state = {};
    }

    componentDidMount(){
        if(!this.props.readOnly){
            this.initializeLookups();
        }
    }

    initializeLookups() {
        axios.all([
            LookupService.getOpportunityCloseReasonTypes(),
            LookupService.getOpportunityCloseTypes(),
            LookupService.getCurrencies()
        ]).then(axios.spread((closeReasonTypes, closeTypes, currencies) => {
            let state = _.cloneDeep(this.state);
            state.closeReasonTypes = closeReasonTypes.data;
            state.closeTypes = closeTypes.data;
            state.currencies = currencies.data;
            this.setState(state);
        })).catch(error => {
            console.log(error);
            Notify.showError(error);
        })
    }

    handleChange(key, value) {
        let closeReason = _.cloneDeep(this.props.closeReason);
        if(_.isNil(value)){
            _.unset(closeReason, key);
        }else{
            _.set(closeReason, key, value);
        }
        this.props.onChange(closeReason)
    }

    validate(){
        if(!this.form.validate()){
            return false;
        }
        return true;
    }

    render(){
        let reasonDetails = [];
        if(this.props.closeReason && this.props.closeReason.reason){
            if(this.props.closeReason.reason.options){
                reasonDetails = this.props.closeReason.reason.options.map(opt => {return {id: opt, name: opt}});
            }
        }

        return(
            <Card>
                <Form ref = {c => this.form = c}>
                    <Grid widthLarge={true}>
                        <GridCell>
                            <ReadOnlyDropDown options = {this.state.closeTypes} label="Opportunity Closing Type" readOnly={this.props.readOnly} translate={true}
                                              value = {this.props.closeReason.type} required={true}
                                              onchange = {(reason) => this.handleChange("type", reason)}/>
                        </GridCell>
                        <GridCell width="1-3">
                            {_.get(this.props.closeReason, "type.code") !== "CLOSE" ?
                                <ReadOnlyDropDown options = {this.state.closeReasonTypes} label="Reason" readOnly={this.props.readOnly} translate={true}
                                                  value = {this.props.closeReason.reason} required={true}
                                                  onchange = {(reason) => this.handleChange("reason", reason)}/>
                                : null
                            }

                        </GridCell>
                        <GridCell width="1-3">
                            {_.get(this.props.closeReason, "type.code") !== "CLOSE" ?
                                <ReadOnlyDropDown options={reasonDetails} label="Reason Detail"
                                                  readOnly={this.props.readOnly} translate={true}
                                                  required={!_.isEmpty(reasonDetails)}
                                                  value={this.props.closeReason.reasonDetail}
                                                  onchange={(reasonDetail) => {
                                                      reasonDetail ? this.handleChange("reasonDetail", reasonDetail.name) : null
                                                  }}/>
                                : null
                            }
                        </GridCell>
                    </Grid>
                </Form>
            </Card>

        );
    }
}

const ReadOnlyDropDown = withReadOnly(DropDown);