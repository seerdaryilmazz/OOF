import _ from "lodash";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Chip, Date } from 'susam-components/advanced';
import { Button, Form, Notify, ReadOnlyDropDown, Span, TextInput } from 'susam-components/basic';
import { Card, Grid, GridCell, Modal } from 'susam-components/layout';
import { StringUtils } from "susam-components/utils/StringUtils";
import uuid from 'uuid';
import { CompanyContactDropDownFilteredByAccountAndLocation, CompanyLocationDropDown, FormattedAddress } from "../common";
import { AuthorizationService, CompanyService, LookupService } from '../services';
import { PromiseUtils, withReadOnly } from "../utils";
import { ActiveCompanyLocationDropDown } from "../common/ActiveCompanyLocationDropDown";

var userList=null;
export class QuoteCommonInfo extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.moment = require("moment");
        this.state = {};
    }


    componentDidMount() {
        this.initialize();
    }

    getUsers(status){
        if(status){
            return _.filter(this.context.getAllUsers(), i=>i.status.code === status);
        }  else {
            return this.context.getAllUsers();
        }
    }
    
    initialize() {
        if (!this.props.readOnly && !this.props.quote.subsidiary && this.context.user.subsidiaries.length == 1) {
            this.handleSubsidiaryChange("subsidiary", this.context.user.subsidiaries[0]);
        }
        if(this.props.readOnly){
            this.getDefaultInvoiceCompanyCountry(this.props.quote.subsidiary);
        }
        this.getPromise_getRoundTypes().then(response=>{
            this.setState({
                roundTypes: response.data
            });
        }).catch(error => {
            Notify.showError(error);
        });
    }

    mapUserToRelatedPeople(user){
        return user && {code: user.username, name: user.displayName};
    }
    mapRelatedPeopleToUser(relatedPeople){
        return relatedPeople && {username: relatedPeople.code, displayName: relatedPeople.name};
    }

    getPromise_getRoundTypes() {
        if (this.props.quote.type.code === 'TENDER') {
            return LookupService.getRoundTypes();
        } else {
            return PromiseUtils.getFakePromise([]);
        }
    }

    getDefaultInvoiceCompanyCountry(subsidiary){
        AuthorizationService.getSubsidiary(subsidiary.id).then(respone=>{
            return CompanyService.getCompany(respone.data.defaultInvoiceCompany.id);
        }).then(response=>{
            this.handleChange("defaultInvoiceCompanyCountry", response.data.country.iso);
        });
    }

    handleSubsidiaryChange(key, value) {
        this.handleChange(key,value);
        this.getDefaultInvoiceCompanyCountry(value);
    }
    handleChange(key, value) {
        let keyValuePairs = [{key: key, value: value}];
        this.props.onChange(keyValuePairs);
    }

    handleAccountLocationChange(location) {
        let keyValuePairs = [];
        keyValuePairs.push({key: "accountLocation", value: location});
        keyValuePairs.push({key: "contact", value: null});
        this.props.onChange(keyValuePairs);
    }

    validate(){
        return this.form.validate();
    }
    
    refreshContacts() {
        // key değerini değiştirmek component'in tekrar mount olmasını sağlıyor.
        this.setState({keyForContact: uuid.v4()}, () => {
            this.props.onChange([{key: "contact", value: null}]);
        });
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

    renderQuoteOwner() {
        if (this.props.readOnly) {
            return (
                <Span label="Quote Owner" value={this.getDisplayNameOfUser(this.props.quote.quoteOwner)}/>
            );
        } else {
            return (
                <ReadOnlyDropDown options={this.getUsers('ACTIVE')} label="Quote Owner"
                                  valueField="username" labelField="displayName" required={true}
                                  readOnly={this.props.readOnly}
                                  value={this.convertUsernameToObject(this.props.quote.quoteOwner)}

                                  onchange = {(value) => this.handleChange("quoteOwner", value ? value.username : null)}/>
            );
        }
    }

    renderExternalSystemId(){
        let orders = _.defaultTo(this.props.quote.orders, []).filter(o=>'ADDED' === o.relation).map((o,i)=><div key={i}>{o.orderNumber}</div>);
        let func = !_.isEmpty(orders) && (()=>this.orderNumberModal.open());
        let tooltip = !_.isEmpty(orders) && {position: 'bottom-left', title: super.translate("Show Related Orders")};
        return(
            <GridCell width="1-4">
                <Span label="Quadro Quote Number" tooltip={tooltip}  onclick={func}
                    value={this.props.quote.mappedIds && this.props.quote.mappedIds.QUADRO}/>
                <Modal ref={c=>this.orderNumberModal=c}>
                    <div>
                        {orders}
                    </div>
                </Modal>
            </GridCell>
        );
    }

    renderRequestedDate() {
        if (this.props.readOnly || this.props.quote.inbound) {
            return (
                <GridCell width="1-4">
                    <Span label="Requested Date" value={this.props.quote.requestedDate} />
                </GridCell>
            )
        } else {
            return (
                <GridCell width="1-4">
                    <Date label="Requested Date" hideIcon={true}
                        value={this.props.quote.requestedDate}
                        onchange={(value) => this.handleChange("requestedDate", _.isEmpty(value) ? null : `${value} 00:00 ${this.context.user.timeZoneId}`)} />
                </GridCell>
            );
        }
    }
    
    renderValidityStartDate(){
        if(this.props.readOnly){
            return(
                <GridCell width="1-4">
                    <Span label="Validity Start Date" value={this.props.quote.validityStartDate}/>
                </GridCell>
            );
        }else{
            let today = this.moment().format('DD/MM/YYYY');
            return(
                <GridCell width="1-4">
                    <Date label="Validity Start Date" required={true} minDate={today} hideIcon={true}
                          value={this.props.quote.validityStartDate ? this.props.quote.validityStartDate : " "}
                          onchange={(value) => this.handleChange("validityStartDate", value)} />
                </GridCell>
            );
        }
    }



    renderValidityEndDate(){
        if(this.props.readOnly){
            return(
                <GridCell width="1-4">
                    <Span label="Validity End Date" value={this.props.quote.validityEndDate}/>
                </GridCell>
            );
        }else{
            let today = this.moment().format('DD/MM/YYYY');
            return(
                <GridCell width="1-4">
                    <Date label="Validity End Date" required={true} minDate={today} hideIcon={true}
                         readOnly={this.props.quote.type.code === 'SPOT'} value={this.props.quote.validityEndDate ? this.props.quote.validityEndDate : " "}
                          onchange={(value) => this.handleChange("validityEndDate", value)} />
                </GridCell>
            );
        }
    }

    renderContact() {
        return (
            <GridCell width="1-4">
                <Grid collapse={true}>
                    <GridCell width="4-5" noMargin={true}>
                        <CompanyContactDropDownFilteredByAccountAndLocation
                            readOnly={this.props.readOnly}
                            reloadKey={this.state.keyForContact}
                            label="Contact"
                            account={this.props.account}
                            setInitialValue={true}
                            location={this.props.quote.accountLocation}
                            value={this.props.quote.contact} required={true} uninitializedText="Please select location"
                            onchange={(value) => this.handleChange("contact", value)}
                            emptyText="No contact at this location"/>
                    </GridCell>
                    <GridCell width="1-5" noMargin={true}>
                        <Grid>
                            <GridCell width="1-1" noMargin={true}/>
                            <GridCell width="1-1">
                                {!this.props.readOnly && <Button icon="refresh" iconColorClass="md-color-green-500"
                                        tooltip="Refresh Contact List" flat={true} size="small"
                                        onclick={() => this.refreshContacts()}/>}
                            </GridCell>
                        </Grid>
                    </GridCell>
                </Grid>
            </GridCell>
        );
    }

    renderQuoteName(){
        if(this.props.quote.type.code === 'SPOT'){
            return(
                <GridCell width="1-4">
                    <Span label="Quote Name" value={this.props.quote.name}/>
                </GridCell>
            );
        }else{
            return(
                <GridCell width="1-4">
                    <TextInput label="Quote Name"
                               value = {this.props.quote.name}
                               uppercase = {true}
                               onchange = {(value) => this.handleChange("name", value)}
                               required = {true}
                               readOnly={this.props.readOnly}/>
                </GridCell>
            );

        }
    }

    renderCloseDate(){
        if(this.props.readOnly){
            return(
                <GridCell width="1-4">
                    <Span label="Close Date" value={this.props.quote.closeDate}/>
                </GridCell>
            );
        }else{
            let today = this.moment().format('DD/MM/YYYY');
            if (this.props.quote.type.code == "TENDER" || this.props.quote.type.code == "LONG_TERM") {
                today = null;
            }
            return(
                <GridCell width="1-4">
                    <Date label="Close Date" required={true} minDate={today} hideIcon={true}
                          value={this.props.quote.closeDate ? this.props.quote.closeDate : " "}
                          onchange={(value) => this.handleChange("closeDate", value)} />
                </GridCell>
            );
        }
    }

    renderContractStartDate(){
        if(this.props.readOnly){
            return(
                <GridCell width="1-4">
                    <Span label="Contract Start Date" value={this.props.quote.contractStartDate}/>
                </GridCell>
            );
        }else{
            return(
                <GridCell width="1-4">
                    <Date label="Contract Start Date" hideIcon={true}
                          value={this.props.quote.contractStartDate ? this.props.quote.contractStartDate : " "}
                          onchange={(value) => this.handleChange("contractStartDate", value)} />
                </GridCell>
            );
        }
    }

    renderContractEndDate(){
        if(this.props.readOnly){
            return(
                <GridCell width="1-4">
                    <Span label="Contract End Date" value={this.props.quote.contractEndDate}/>
                </GridCell>
            );
        }else{
            let today = this.moment().format('DD/MM/YYYY');
            if(this.props.quote.type.code=="TENDER"||this.props.quote.type.code=="LONG_TERM"){
                today=null;
            }
            return(
                <GridCell width="1-4">
                    <Date label="Contract End Date" minDate={today} hideIcon={true}
                          value={this.props.quote.contractEndDate ? this.props.quote.contractEndDate : " "}
                          onchange={(value) => this.handleChange("contractEndDate", value)} />
                </GridCell>
            );
        }
    }

    renderOperationStartDate(){
        if(this.props.readOnly){
            return(
                <GridCell width="1-4">
                    <Span label="Operation Start Date" value={this.props.quote.operationStartDate}/>
                </GridCell>
            );
        }else{
            let today = this.moment().format('DD/MM/YYYY');
            return(
                <GridCell width="1-4">
                    <Date label="Operation Start Date" hideIcon={true}
                          value={this.props.quote.operationStartDate ? this.props.quote.operationStartDate : " "}
                          onchange={(value) => this.handleChange("operationStartDate", value)} />
                </GridCell>
            );
        }
    }

    renderInvitationDate(){
        if(this.props.readOnly){
            return(
                <GridCell width="1-4">
                    <Span label="Invitation Date" value={this.props.quote.invitationDate}/>
                </GridCell>
            );
        }else{
            let today = this.moment().format('DD/MM/YYYY');
            if(this.props.quote.type.code=="TENDER"){
                today=null;
            }
            return(
                <GridCell width="1-4">
                    <Date label="Invitation Date" minDate={today} hideIcon={true} required={true}
                          value={this.props.quote.invitationDate ? this.props.quote.invitationDate : " "}
                          onchange={(value) => this.handleChange("invitationDate", value)} />
                </GridCell>
            );
        }
    }

    renderSpotSpecifics(){
        return(
            <Grid>
                {this.renderExternalSystemId()}
                {this.renderValidityStartDate()}
                {this.renderValidityEndDate()}
                {this.renderContact()}
            </Grid>
        );
    }

    renderLongTermSpecifics(){
        return(
            <Grid>
                {this.renderCloseDate()}
                {this.renderOperationStartDate()}
                {this.renderContractStartDate()}
                {this.renderContractEndDate()}
            </Grid>
        );
    }

    renderTenderSpecifics(){
        let rounds = [];
        if(this.props.quote.roundType && this.props.quote.roundType.rounds){
            rounds = this.props.quote.roundType.rounds.map(round => {
                return {id: round, code: round, name: round}
            });
        }
        return(
            <Grid>
                {this.renderCloseDate()}
                {this.renderOperationStartDate()}
                {this.renderContractStartDate()}
                {this.renderContractEndDate()}
                {this.renderInvitationDate()}
                <GridCell width="1-4">
                    <Grid>
                        <GridCell width="1-2">
                            <ReadOnlyDropDown options = {this.state.roundTypes} label="Round Type" readOnly={this.props.readOnly}
                                              translate={true}
                                              value = {this.props.quote.roundType} required={true}
                                              onchange = {(value) => this.handleChange("roundType", value)}/>
                        </GridCell>
                        <GridCell width="1-2">
                            <ReadOnlyDropDown options = {rounds} label="Round" readOnly={this.props.readOnly}
                                              value = {this.props.quote.round} required={rounds.length > 0}
                                              onchange = {(value) => this.handleChange("round", value.code)}/>
                        </GridCell>
                    </Grid>
                </GridCell>
                <GridCell width="2-4">
                    <ReadOnlyChip options={this.getUsers('ACTIVE')} label="Related People" 
                                  valueField="username" labelField="displayName" hideSelectAll={true}
                                  value={this.props.quote.relatedPeople.map(i=>this.mapRelatedPeopleToUser(i))}
                                  readOnly={this.props.readOnly}
                                  onchange={(data) => {this.handleChange("relatedPeople", data.map(i=>this.mapUserToRelatedPeople(i)))}}/>
                </GridCell>
            </Grid>
        );
    }

    getContentByType() {
        switch (this.props.quote.type.code) {
            case 'SPOT':
                return this.renderSpotSpecifics();

            case 'LONG_TERM':
                return this.renderLongTermSpecifics();

            case 'TENDER':
                return this.renderTenderSpecifics();

            default:
                return null;
        }
    }
    
    renderCreatedDate(){
        let format = "DD.MM.YYYY";
        if(this.props.quote.createdAt){
            return this.moment(this.props.quote.createdAt,"DD/MM/YYYY HH:mm Z").format(format);
        } else {
            return this.moment().format(format);
        }
    }
    
    renderAccountLocation() {
        return (
            <ActiveCompanyLocationDropDown readOnly={this.props.readOnly}
                                     label="Account Location"
                                     company={this.props.account.company}
                                     value={this.props.quote.accountLocation}
                                     required={true}
                                     setInitialValue={true}
                                     onchange={(value) => this.handleAccountLocationChange(value)}/>
        );
    }

    render() {
        if (!(this.props.quote && this.props.account)) {
            return null;
        }
        return (
            <Form ref={c => this.form = c}>
                <div style={{marginTop: "30px"}}>
                    <Card>
                        <QuoteStatusHeader title="Common Info" status={this.props.quote.status} />
                        <Grid>
                            <GridCell width="1-4">
                                <Span label="Service Area" translate={true} value={this.props.quote.serviceArea.name}/>
                            </GridCell>
                            <GridCell width="1-4">
                                {this.renderQuoteOwner()}
                            </GridCell>
                            <GridCell width="1-4">
                                <Span label="Created By / Created Date"
                                      value={this.getDisplayNameOfUser(this.props.quote.createdBy) + " / " + this.renderCreatedDate()}/>
                            </GridCell>
                            {this.renderRequestedDate()}
                            {this.renderQuoteName()}
                            <GridCell width="1-4">
                                <Span label="Account" value={<a style={{color: 'black'}} href={`/ui/crm/account/${this.props.account.id}/view`}><u>{this.props.account.name}</u></a>}/>
                            </GridCell>
                            <GridCell width="1-2">
                                <Grid>
                                    <GridCell width="1-2" margin="medium">
                                        {this.renderAccountLocation()}
                                    </GridCell>
                                    <GridCell width="1-2" margin="medium">
                                        <ReadOnlyDropDown label="Owner Subsidiary"
                                                          value={this.props.quote.subsidiary}
                                                          readOnly={this.props.readOnly || (this.props.quote.createdBy !== this.context.user.username)}
                                                          onchange={(value) => this.handleSubsidiaryChange("subsidiary", value)}
                                                          options={this.context.user.subsidiaries}
                                                          required={true}/>
                                    </GridCell>
                                    <GridCell width="1-1" margin="medium">
                                        <FormattedAddress location={this.props.quote.accountLocation}/>
                                    </GridCell>
                                </Grid>
                            </GridCell>
                        </Grid>
                        {this.getContentByType()}
                    </Card>
                </div>
            </Form>
        );
    }
}

const ReadOnlyChip = withReadOnly(Chip);

QuoteCommonInfo.contextTypes = {
    router: React.PropTypes.object,
    user: React.PropTypes.object,
    getUsers: React.PropTypes.func,
    getAllUsers: React.PropTypes.func,
};

class QuoteStatusHeader extends TranslatingComponent {
    STATUS_STYLE = {
        WON: 'md-bg-green-600',
        PARTIAL_WON: 'md-bg-green-400',
        OPEN: 'md-bg-blue-500',
        CANCELED: 'uk-badge-muted',
        LOST: 'md-bg-red-600',
        PDF_CREATED: 'md-bg-blue-700',
    };

    componentDidUpdate(){
        let color = $(".status-text").css("background-color");
        $(".status-header").css('border-bottom-color', color)
    }

    render() {
        let { status } = this.props;

        let className = `status-text uk-text-right ${this.STATUS_STYLE[status.code]}`
        return status && (<h3 className="status-header full_width_in_card heading_c" style={{borderBottom: "4px solid"}} >
            <span>
                {this.translate(this.props.title)}
            </span>
            <span style={{color: "white", float:"right", padding:"10px", margin:"-10px"}} className={className}>
                {this.translate(StringUtils.titleCase(status.name, this.context.translator.getLanguage()))}
            </span>
        </h3>)
    }
}

QuoteStatusHeader.contextTypes = {
    translator: React.PropTypes.object,
    userList: React.PropTypes.array
};

