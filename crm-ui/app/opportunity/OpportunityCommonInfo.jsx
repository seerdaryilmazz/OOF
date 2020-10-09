import React from "react";
import {TranslatingComponent} from 'susam-components/abstract';
import _ from "lodash";
import * as axios from 'axios';

import { Chip, Date, NumericInput } from 'susam-components/advanced';
import { Button, Form, Notify, ReadOnlyDropDown, Span, TextInput, DropDown } from 'susam-components/basic';
import { Card, CardHeader, Grid, GridCell } from 'susam-components/layout';
import {  CompanyLocationDropDown, AccountSearchAutoComplete, FormattedAddress } from "../common";
import {CompanyService, CrmAccountService, LookupService} from '../services';
import { StringUtils as StringUtilz } from "susam-components/utils/StringUtils";
import {StringUtils} from "../utils";

export class OpportunityCommonInfo extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.moment = require("moment");
        this.state = {
            company:{}
        };
    }


    componentDidMount() {
        this.initialize();
    }

    componentDidUpdate(prevProps) {
        if (!_.isEqual(this.props.opportunity.account, prevProps.opportunity.account)){
            if (_.isEmpty(this.props.opportunity.account)){
                this.setState({company: {}}, ()=> this.handleChange('accountLocation', null))
            }else {
                this.retrieveCompany(this.props.opportunity.account.id)
            }
        }
    }

    getUsers(status){
        if(status){
            return _.filter(this.context.getAllUsers(), i=>i.status.code === status);
        }  else {
            return this.context.getAllUsers();
        }
    }

    initialize() {
        this.initializeLookups();
        // if (!this.props.readOnly && !this.props.opportunity.subsidiary && this.context.user.subsidiaries.length == 1) {
        //     this.handleChange("ownerSubsidiary", this.context.user.subsidiaries[0]);
        // }
    }

    initializeLookups(){
        axios.all([
            LookupService.getCurrencies(),
            LookupService.getServiceAreas()
        ]).then(axios.spread((currencies, serviceAreas) => {
            this.setState({
                currencies: currencies.data,
                serviceAreas: _.filter(serviceAreas.data,
                    (i=> ['ROAD', 'SEA', 'AIR', 'DTR', 'CCL', 'WHM'].includes(i.code)))
            });
        })).catch(error => {
            Notify.showError(error);
        });
    }

    handleChange(key, value) {
        let opportunity = _.cloneDeep(this.props.opportunity);
        _.set(opportunity, key, value);
        this.props.onChange(opportunity)
    }

    handleAccountChange(key, value){
        this.handleChange(key, value);
        if(value && value.id){
            this.retrieveCompany(value.id)
        }else {
            this.setState({company: {}}, ()=> this.handleChange('accountLocation', null))
        }
    }

    retrieveCompany(accountId) {
        if (accountId) {
            CrmAccountService.getAccountById(accountId).then(response => {
                let account = response.data;
                CompanyService.getCompany(account.company.id).then(response => {
                    let company = response.data;
                    this.setState({company: company});
                }).catch(error => {
                    console.log(error);
                    Notify.showError(error);
                });
            }).catch(error => {
                console.log(error);
                Notify.showError(error);
            });
        }
    }

    validate(){
        return this.form.validate();
    }

    convertUsernameToObject(username) {
        if (username) {
            return {username: username};
        } else {
            return null;
        }
    }

    getDisplayNameOfUser(username){
        if(this.context.user.username === username){
            return this.context.user.displayName || "";
        }
        return _.get(_.find(this.getUsers(), {username: username}), 'displayName') || "";
    }

    routeToActivity(accountId){
        this.context.router.push(`/ui/crm/activity/view/${accountId}`)
    }

    renderOpportunityOwner() {
        if (this.props.readOnly) {
            return (
                <Span label="Opportunity Owner" value={this.getDisplayNameOfUser(this.props.opportunity.opportunityOwner)}/>
            );
        } else {
            return (
                <ReadOnlyDropDown options={this.getUsers('ACTIVE')} label="Opportunity Owner"
                                  valueField="username" labelField="displayName" required={true}
                                  readOnly={this.props.readOnly}
                                  value={this.convertUsernameToObject(this.props.opportunity.opportunityOwner)}
                                  onchange = {(value) => this.handleChange("opportunityOwner", value ? value.username : null)}/>
            );
        }
    }

    renderCreatedDate(){
        let format = "DD.MM.YYYY";
        if(this.props.opportunity.createdAt){
            return this.moment(this.props.opportunity.createdAt,"DD/MM/YYYY HH:mm Z").format(format);
        } else {
            return this.moment().format(format);
        }
    }

    renderAccount(){
        if(this.props.readOnly && !_.isEmpty(this.props.opportunity.account)){
            return (
                <Span label="Account"
                      value={<a style={{color: 'black'}}
                                href={`/ui/crm/account/${this.props.opportunity.account.id}/view`}><u>{this.props.opportunity.account.name}</u></a>}/>
            )
        }else{
            return(
                <AccountSearchAutoComplete label="Account"
                                           value={this.props.opportunity.account}
                                           required={true}
                                           onchange={(value) => this.handleChange("account", value)}
                                           onclear={() => this.handleChange("account", null)}/>
            )
        }
    }

    renderAccountLocation() {
        return (
            <CompanyLocationDropDown readOnly={this.props.readOnly}
                                     label="Account Location"
                                     company={this.state.company}
                                     value={this.props.opportunity.accountLocation}
                                     required={true}
                                     setInitialValue={true}
                                     onchange={(value) => this.handleChange("accountLocation", value)}/>
        );
    }

    renderExpectedQuoteDate() {
        let opportunity = _.cloneDeep(this.props.opportunity);
        if (!this.props.readOnly && ["VALUE_PROPOSITION", "PROSPECTING"].includes(opportunity.status.code)) {
            let today = this.moment().format('DD/MM/YYYY');
            return (
                <GridCell width="1-4">
                    <Date label="Expected Quote Date" hideIcon={true}
                          value={opportunity.expectedQuoteDate} minDate={today}
                          onchange={(value) => this.handleChange("expectedQuoteDate", value)} />
                </GridCell>
            )
        } else {
            return (
                <GridCell width="1-4">
                    <Span label="Expected Quote Date" value={opportunity.expectedQuoteDate} />
                </GridCell>
            );
        }
    }

    renderTurnover(key, label){
        if(this.props.readOnly || key == "committedTurnoverPerYear" || key=="quotedTurnoverPerYear"){
            let value;
            if(_.get(this.props.opportunity, `${key}.currency`)){
                value = StringUtils.formatMoney(_.get(this.props.opportunity, `${key}.amount`, 0), _.get(this.props.opportunity, `${key}.currency.code`));
            }
            return (
                    <Span label={label} value={value} />
            )
        }else {
            return (
                <Grid>
                    <GridCell width="1-2">
                        <NumericInput label = {label} grouping={true}
                                      style={{ textAlign: "right" }}
                                      value = {_.get(this.props.opportunity, `${key}.amount`)}
                                      digits="2"
                                      maxIntegerDigit={10}
                                      required={true}
                                      onchange = {(value) => this.handleChange(`${key}.amount`, value)}/>
                    </GridCell>
                    <GridCell width="1-2">
                        <ReadOnlyDropDown options={this.state.currencies} label="Currency"
                                          required={true}
                                          value={_.get(this.props.opportunity[key], 'currency')}
                                          onchange={(value) => this.handleChange(`${key}.currency`, value)}/>
                    </GridCell>
                </Grid>

            )
        }
    }

    render() {
        if (!(this.props.opportunity)) {
            return null;
        }
        return (
            <Form ref={c => this.form = c}>
                <div>
                    <Card>
                        <OpportunityStatusHeader title="Common Info" status={this.props.opportunity.status}
                                                 activityAttribute = {_.get(this.props.opportunity.opportunityAttribute, "activity")}
                                                 routeToActivity = {(activityAttribute) => this.routeToActivity(activityAttribute)}
                                                 openCloseModal = {() => this.props.openCloseModal && this.props.openCloseModal()} />
                        <Grid>
                            <GridCell width="1-4">
                                <ReadOnlyDropDown label="Service Area"
                                                  required={true}
                                                  valueField="code"
                                                  options={this.state.serviceAreas}
                                                  value={this.props.opportunity.serviceArea}
                                                  readOnly={this.props.readOnly || _.get(this.props.opportunity.status, "code") === "QUOTED" || !_.isEmpty(this.props.opportunity.products)}
                                                  onchange={(value) => this.handleChange("serviceArea", value)}/>
                            </GridCell>
                            <GridCell width="1-4">
                                {this.renderOpportunityOwner()}
                            </GridCell>
                            <GridCell width="1-4">
                                <Span label="Created By / Created Date"
                                      value={this.getDisplayNameOfUser(this.props.opportunity.createdBy) + " / " + this.renderCreatedDate()}/>
                            </GridCell>
                            {this.renderExpectedQuoteDate()}
                            <GridCell width="1-4">
                                <TextInput label="Opportunity Name"
                                           value = {this.props.opportunity.name}
                                           uppercase = {true}
                                           onchange = {(value) => this.handleChange("name", value)}
                                           required = {false}
                                           readOnly={this.props.readOnly}/>
                            </GridCell>
                            <GridCell width="1-4">
                                {this.renderAccount()}
                            </GridCell>
                            <GridCell width="1-2">
                                <Grid>
                                    <GridCell width="1-2" margin="medium">
                                        {this.renderAccountLocation()}
                                    </GridCell>
                                    <GridCell width="1-2" margin="medium">
                                        <ReadOnlyDropDown label="Owner Subsidiary"
                                                          value={this.props.opportunity.ownerSubsidiary}
                                                          readOnly={this.props.readOnly}
                                                          onchange={(value) => this.handleChange("ownerSubsidiary", value)}
                                                          options={this.context.user.subsidiaries}
                                                          required={true}/>
                                    </GridCell>
                                    <GridCell width="1-1" margin="medium">
                                        <FormattedAddress location={this.props.opportunity.accountLocation}/>
                                    </GridCell>
                                </Grid>
                            </GridCell>
                            <GridCell width="1-2">
                                {this.renderTurnover("expectedTurnoverPerYear" , "Expected Turnover/Year")}
                            </GridCell>
                            <GridCell width="1-4">
                                {this.renderTurnover("quotedTurnoverPerYear" , "Quoted Turnover/Year")}
                            </GridCell>
                            <GridCell width="1-4">
                                {this.renderTurnover("committedTurnoverPerYear" , "Committed Turnover/Year")}
                            </GridCell>
                        </Grid>
                    </Card>
                </div>
            </Form>
        );
    }
}

OpportunityCommonInfo.contextTypes = {
    router: React.PropTypes.object,
    user: React.PropTypes.object,
    getUsers: React.PropTypes.func,
    getAllUsers: React.PropTypes.func,
};

class OpportunityStatusHeader extends TranslatingComponent {
    STATUS_STYLE = {
        QUOTED: 'md-bg-green-600',
        PROSPECTING: 'md-bg-blue-500',
        CANCELED: 'uk-badge-muted',
        CLOSED: 'uk-badge-warning',
        REJECTED: 'md-bg-red-600',
        WITHDRAWN: 'md-bg-red-600',
        VALUE_PROPOSITION: 'md-bg-blue-700',
    };

    componentDidUpdate(){
        let color = $(".status-text").css("background-color");
        $(".status-header").css('border-bottom-color', color)
    }

    render() {
        let {status, activityAttribute} = this.props;
        let className = `status-text uk-text-right ${this.STATUS_STYLE[status.code]}`;

        return status && (
            <h3 className="status-header full_width_in_card heading_c" style={{borderBottom: "4px solid"}}>
                <span>
                    {this.props.title}
                </span>
                <span style={{float: "right"}}>
                    {!_.isEmpty(activityAttribute) ?
                        <div style={{display: "inline-block", marginRight: "25px"}}>
                            <a>
                                <i data-uk-tooltip="{pos:'bottom'}" title="To Related Activity"
                                   style={{
                                       border: "3px",
                                       borderStyle: "solid",
                                       borderColor: "orchid",
                                       padding: "8px",
                                       color: "white",
                                       fontStyle: "normal",
                                       backgroundColor: "orchid"
                                   }}
                                   onClick={() => this.props.routeToActivity && this.props.routeToActivity(activityAttribute)}>
                                    A
                                </i>
                            </a>
                        </div>
                        : ""
                    }
                    <div style={{color: "white", padding: "10px", margin: "-10px", display: "inline-block"}} className={className}>
                        {["CLOSED", "REJECTED", "WITHDRAWN"].includes(status.code) ?
                            <a style={{marginRight: "5px"}}>
                                <i className="uk-icon-comment "
                                   style={{fontSize: "120%", transform: "scaleX(-1)", color: "white"}}
                                   title={this.translate("Close Info")} data-uk-tooltip="{pos:'bottom'}"
                                   onClick={() => this.props.openCloseModal && this.props.openCloseModal()}/>
                            </a> : ""}
                        {this.translate(StringUtilz.titleCase(status.name, this.context.translator.getLanguage()))}
                    </div>
                </span>
            </h3>)
    }
}

OpportunityStatusHeader.contextTypes = {
    translator: React.PropTypes.object,
    userList: React.PropTypes.array
};