import React from "react";
import {TranslatingComponent} from 'susam-components/abstract';
import {LookupService} from "../services/LookupService";
import * as axios from 'axios';
import { Button, Form, Notify,DropDown, ReadOnlyDropDown, Span, TextInput } from 'susam-components/basic';
import { NumericInput, Date as DateSelector, Chip, DateRange } from "susam-components/advanced";
import { Card, CardHeader, Grid, GridCell } from 'susam-components/layout';
import { AccountSearchAutoComplete} from "../common/AccountSearchAutoComplete";
import { RenewalDate } from "../common/RenewalDate";
import _ from "lodash";
import PropTypes from "prop-types";

import {StringUtils, withReadOnly} from "../utils";
import {DateTimeUtils} from "../utils/DateTimeUtils";
import {AgreementService} from "../services";

export class AgreementCommonInfo extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.moment = require("moment");
        this.state = {
            serviceAreaEditable: true
        };
    }

    componentDidMount() {
        this.initializeLookups();
    }

    componentDidUpdate(prevProps){
        if(!_.isEmpty(this.props.changes) && !_.isEqual(this.props.changes, prevProps.changes)){
            let serviceAreaEditable = _.isEmpty(_.find(this.props.changes, i => i.description.includes("to 'APPROVED'")));
            this.setState({serviceAreaEditable: serviceAreaEditable})
        }
        if(this.props.agreement.endDate && this.props.agreement.autoRenewalLength && !_.isEmpty(this.props.agreement.autoRenewalDateType)){
            if (!_.isEqual(this.props.agreement.endDate, prevProps.agreement.endDate) ||
                !_.isEqual(this.props.agreement.autoRenewalLength, prevProps.agreement.autoRenewalLength) ||
                !_.isEqual(this.props.agreement.autoRenewalDateType, prevProps.agreement.autoRenewalDateType) ||
                !prevProps.agreement.autoRenewalDate) {
                this.calculateAutoRenewalDate(this.props);
            }
        }
    }

    initializeLookups() {
        axios.all([
            LookupService.getServiceAreas(),
            LookupService.getAgreementTypes()
        ]).then(axios.spread((serviceAreas, agreementTypes) => {
            let state = _.cloneDeep(this.state);
            state.serviceAreas = serviceAreas.data;
            state.agreementTypes = agreementTypes.data;
            state.type = {id: "CONTRACT", code: "CONTRACT", name: "Contract"};
            this.setState(state);
        })).catch(error => {
            Notify.showError(error);
        });
    }

    handleChange(key, value) {
        let agreement = _.cloneDeep(this.props.agreement);
        if (!_.get(agreement,"type")) {
            _.set(agreement, "type", this.state.type);
        }
        if ("dateRange" === key) {
            _.set(agreement, "startDate", value.startDate);
            _.set(agreement, "endDate", value.endDate);
        }
        else {
            _.set(agreement, key, value);
        }
        if(!agreement.endDate || !agreement.autoRenewalLength || _.isEmpty(agreement.autoRenewalDateType)){
            if(agreement.autoRenewalDate){
                _.set(agreement, "autoRenewalDate", null)
            }
        }
        this.props.onChange(agreement);
    }

    renderDateInterval() {
        if (this.props.readOnly) {
            return(
                <GridCell width="2-4">
                    <Grid>
                        <GridCell width="1-2">
                            <Span label="Start Date" value={this.props.agreement.startDate}/>
                        </GridCell>
                        <GridCell width="1-2">
                            <Span label="End Date" value={this.props.agreement.endDate}/>
                        </GridCell>
                    </Grid>
                </GridCell>
            );
        }
        else {
            let dateRange = {};
            dateRange.startDate = this.props.agreement.startDate ? this.props.agreement.startDate : "";
            dateRange.endDate = this.props.agreement.endDate ? this.props.agreement.endDate : "";
            return(
                <GridCell width="2-4">
                    <DateRange startDateLabel="Start Date"
                               endDateLabel="End Date"
                               required={true}
                               value={dateRange}
                               onchange={(value) => this.handleChange("dateRange", value)} />
                </GridCell>
            );
        }
    }

    calculateAutoRenewalDate(props) {
        let agreement = _.cloneDeep(props.agreement);
        let params = {
            endDate: agreement.endDate,
            addType: agreement.autoRenewalDateType.id,
            addCount: agreement.autoRenewalLength
        };
        AgreementService.calculateAutoRenewalDate(params).then(response => {
            this.handleChange("autoRenewalDate", response.data);
        }).catch(error=>{
            console.log(error);
            Notify.showError(error)
        })

    }

    getUsers(status){
        if(status){
            return _.filter(this.context.getAllUsers(), i=>i.status.code === status);
        }  else {
            return this.context.getAllUsers();
        }
    }

    getDisplayNameOfUser(username){
        if(this.context.user.username === username){
            return this.context.user.displayName || "";
        }
        return _.get(_.find(this.getUsers(), {username: username}), 'displayName') || "";
    }

    renderCreatedDate(){
        let format = "DD.MM.YYYY";
        if(this.props.agreement.createdAt){
            return this.moment(this.props.agreement.createdAt,"DD/MM/YYYY HH:mm Z").format(format);
        } else {
            return this.moment().format(format);
        }
    }

    validate() {
        if(!this.form.validate()){
            return false;
        } else{
            let agreement=_.cloneDeep(this.props.agreement);
            if(DateTimeUtils.translateToDateObject(agreement.startDate, "/") > DateTimeUtils.translateToDateObject(agreement.endDate, "/")){
                Notify.showError("Start Date must be earlier than End Date in Common Info");
                return false;
            }
        }

        return true;
    }

    renderAccount(){
        if((this.props.agreement.fromAccount && !_.isEmpty(this.props.agreement.account))|| this.props.readOnly){
            return (
                <Span label="Account"
                      value={<a style={{color: 'black'}}
                                href={`/ui/crm/account/${this.props.agreement.account.id}/view`}><u>{this.props.agreement.account.name}</u></a>}/>
            )
        }else{
            return(
                <AccountSearchAutoComplete label="Account"
                                           value={this.props.agreement.account}
                                           required={true}
                                           onchange={(value) => this.handleChange("account", value)}
                                           onclear={() => this.handleChange("account", null)}/>
            )
        }
    }

    render() {
        return(
            <Form ref = {c => this.form = c}>
                <div style={{marginTop:"30px"}}>
                    <Card>
                        <CardHeader title="Common Info" translate={true}/>
                        <Grid>
                            <GridCell width="1-4">
                                <Span label="Status" value={<AgreementStatus status={this.props.agreement.status}/>}/>
                            </GridCell>
                            <GridCell width="1-4">
                                <ReadOnlyDropDown options={this.state.agreementTypes} label="Agreement Type"
                                                  required={true} translate={true}
                                                  readOnly={this.props.readOnly}
                                                  value={this.props.agreement.type || this.state.type}
                                                  onchange={(value) => this.handleChange("type", value)}/>
                            </GridCell>
                            <GridCell width="1-4">
                                <TextInput label="Name"
                                           value = {this.props.agreement.name}
                                           uppercase = {true}
                                           onchange = {(value) => this.handleChange("name", value)}
                                           required = {true}
                                           readOnly={this.props.readOnly}/>
                            </GridCell>
                            <GridCell width="1-4">
                                <Span label="Created By / Created Date"
                                      value={this.getDisplayNameOfUser(this.props.agreement.createdBy) + " / " + this.renderCreatedDate()}/>
                            </GridCell>
                            {this.renderDateInterval()}
                            <GridCell width="2-4">
                                {this.renderAccount()}
                            </GridCell>
                            <GridCell width="1-4">
                                <RenewalDate renewalLengthLabel="Renewal Length"
                                             renewalLengthValue={this.props.agreement.renewalLength}
                                             renewalLengthDateType={this.props.agreement.renewalDateType}
                                             readOnly={this.props.readOnly}
                                             onRenewalLengthChange={(value) => this.handleChange("renewalLength", value)}
                                             onRenewalLengthDateTypeChange={(value) => this.handleChange("renewalDateType", value)}/>
                            </GridCell>
                            <GridCell width="1-4">
                                <RenewalDate renewalLengthLabel="Auto Renewal Notice"
                                             renewalLengthValue={this.props.agreement.autoRenewalLength}
                                             renewalLengthDateType={this.props.agreement.autoRenewalDateType}
                                             readOnly={this.props.readOnly}
                                             onRenewalLengthChange={(value) => this.handleChange("autoRenewalLength", value)}
                                             onRenewalLengthDateTypeChange={(value) => this.handleChange("autoRenewalDateType", value)}/>
                            </GridCell>
                            <GridCell width="1-4">
                                <DateSelector label="Auto Renewal Date" hideIcon={true}
                                              value={this.props.agreement.autoRenewalDate}
                                              readOnly={true}/>
                            </GridCell>
                            <GridCell width="1-4">
                                <ReadOnlyChip options = {this.state.serviceAreas} label="Service Areas" valueField="code"
                                              value = {this.props.agreement.serviceAreas} required={true} hideSelectAll = {true}
                                              readOnly = {this.props.readOnly ?  this.props.readOnly : _.get(this.props.agreement.status, "code") === "APPROVED" || !this.state.serviceAreaEditable}
                                              onchange={(data) => this.handleChange("serviceAreas", data)} />
                            </GridCell>
                        </Grid>
                    </Card>
                </div>
            </Form>
        );
    }

}

AgreementCommonInfo.contextTypes = {
    translator: PropTypes.object,
    user: PropTypes.object,
    getUsers: PropTypes.func,
    getAllUsers: PropTypes.func,
};

const ReadOnlyChip = withReadOnly(Chip);

class AgreementStatus extends TranslatingComponent {
    render() {
        let {status} = this.props;

        if (status.code == "APPROVED") {
            return <span className="uk-badge md-bg-green-600" style = {{fontSize:"15px"}}>{this.translate(_.capitalize(status.name))}</span>
        } else if (status.code == "OPEN") {
            return <span className="uk-badge md-bg-blue-500" style = {{fontSize:"15px"}}>{this.translate(_.capitalize(status.name))}</span>
        } else if (status.code == "CANCELED") {
            return <span className="uk-badge uk-badge-muted" style = {{fontSize:"15px"}}>{this.translate(_.capitalize(status.name))}</span>
        } else if (status.code == "TERMINATED") {
            return <span className="uk-badge md-bg-red-500" style = {{fontSize:"15px"}}>{this.translate(_.capitalize(status.name))}</span>
        }else {
            return null;
        }
    }
}

AgreementStatus.contextTypes = {
    translator: PropTypes.object,
};