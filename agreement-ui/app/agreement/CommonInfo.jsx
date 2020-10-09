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

import {StringUtils, withReadOnly} from "../utils";

export class CommonInfo extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.moment = require("moment");
        this.state = {};
    }

    componentDidMount() {
        this.initializeLookups();
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
        this.props.onChange(agreement);
    }

    renderAgreementType() {
        if (this.props.readOnly) {
            return(
                <Span label="Agreement Type" value={this.props.agreement.type.code}/>
            );
        }
        else {
            return (
                <ReadOnlyDropDown options={this.state.agreementTypes} label="Agreement Type"
                                  required={true}
                                  readOnly={this.props.readOnly}
                                  value={this.props.agreement.type || this.state.type}
                                  onchange = {(value) => this.handleChange("type", value)}/>
            );
        }
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

    renderAutoRenewalDate() {
        let date = (this.props.agreement.endDate && this.props.agreement.autoRenewalLength && this.props.agreement.autoRenewalDateType)
                        ? moment(this.props.agreement.endDate, "DD/MM/YYYY")
                        .subtract(this.props.agreement.autoRenewalLength, this.props.agreement.autoRenewalDateType.id)
                        .format('DD/MM/YYYY')
                        : "";
        return(
            <DateSelector label="Auto Renewal Date" hideIcon={true}
                  value={date}
                  readOnly={true} />
        );
    }

    validate() {
        if(!this.form.validate()){
            return false;
        } else{
            let agreement=_.cloneDeep(this.props.agreement);
            if(this.processDate(agreement.startDate)>this.processDate(agreement.endDate)){
                Notify.showError("Start Date must be earlier than End Date in Common Info");
                return false;
            }
        }

        return true;
    }

    processDate(date){
        let parts=date.split("/");
        return new Date(parts[2],parts[1]-1,parts[0])
    }

    render() {
        return(
            <Form ref = {c => this.form = c}>
                <Card>
                    <CardHeader title="Common Info"/>
                    <Grid>
                        <GridCell width="1-4">
                            <Span label="Status" value={<AgreementStatus status={this.props.agreement.status}/>}/>
                        </GridCell>
                        <GridCell width="1-4">
                            {this.renderAgreementType()}
                        </GridCell>
                        <GridCell width="2-4">
                            <TextInput label="Name"
                                       value = {this.props.agreement.name}
                                       uppercase = {true}
                                       onchange = {(value) => this.handleChange("name", value)}
                                       required = {true}
                                       readOnly={this.props.readOnly}/>
                        </GridCell>
                        {this.renderDateInterval()}
                        <GridCell width="2-4">
                            <AccountSearchAutoComplete label="Account"
                                                       value={this.props.agreement.account}
                                                       required={true}
                                                       readOnly={this.props.readOnly}
                                                       onchange={(value) => this.handleChange("account", value)}
                                                       onclear={() => this.handleChange("account", null)}/>
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
                            {this.renderAutoRenewalDate()}
                        </GridCell>
                        <GridCell width="1-4">
                            <ReadOnlyChip options = {this.state.serviceAreas} label="Service Areas" valueField="code"
                                          value = {this.props.agreement.serviceAreas} required={true} hideSelectAll = {true}
                                          readOnly = {this.props.readOnly}
                                          onchange={(data) => this.handleChange("serviceAreas", data)} />
                        </GridCell>
                    </Grid>
                </Card>
            </Form>
        );
    }

}

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
    translator: React.PropTypes.object,
};