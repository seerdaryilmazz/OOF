import * as axios from "axios";
import React from "react";
import { Helmet } from 'react-helmet';
import { TranslatingComponent } from 'susam-components/abstract';
import { FabToolbar } from 'susam-components/advanced';
import { Button, Notify } from "susam-components/basic";
import { Card, CardHeader, Grid, GridCell, PageHeader } from 'susam-components/layout';
import { AxiosUtils } from "susam-components/utils/AxiosUtils";
import { Calendar, DocumentList, NoteList } from "../common";
import {CompanyService, CrmAccountService, CrmActivityService, CrmOpportunityService, OutlookService} from '../services';
import {EmailUtils, LoadingIndicator, PromiseUtils} from "../utils";
import { Activity } from "./Activity";
import _ from "lodash";
import PropTypes from "prop-types";


export class ActivityManagement extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = { activity: {} };
    }

    componentDidMount() {
        this.initialize();
    }

    initialize() {
        this.setState({ busy: true });
        if (this.props.route.options.mode === 'view') {
            this.retrieveActivityInfo(this.props.params.activityId);
        } else {
            this.retrieveAccountInfo(this.props.params.accountId, this.props.location.query.opportunity);
        }
    }

    retrieveActivityInfo(activityId) {
        if(!activityId){
            history.back();
            return
        }
        CrmActivityService.getActivityById(activityId).then(response => {
            this.setState({
                activity: response.data,
                readOnly: true
            }, () => this.retrieveAccountInfo(response.data.account.id));
        }).catch(error => {
            this.setState({ busy: false });
            console.log(error);
            Notify.showError(error);
        });
    }

    retrieveAccountInfo(accountId, opportunityId) {
        axios.all([
            CrmAccountService.getAccountById(accountId),
            opportunityId ? CrmOpportunityService.getOpportunityById(opportunityId) : PromiseUtils.getFakePromise({})
        ]).then(axios.spread((account, opportunity) => {
            this.setState(prevState=>{
                if(!prevState.activity.id) {
                    prevState.activity.createdBy = this.context.user.username;
                }
                if(!_.isEmpty(opportunity.data)){
                    prevState.activity.serviceAreas = [];
                    prevState.activity.serviceAreas.push(opportunity.data.serviceArea) 
                }
                prevState.activity.account = account.data;
                return prevState;
            }, () => this.initializeLookups());
        })).catch(error => {
            this.setState({ busy: false });
            console.log(error);
            Notify.showError(error);
        });
    }

    mapContact(contact){
        let formattedEmail = null;
        _.filter(contact.emails, { usageType: { code: "WORK" } }).every(item => {
            let email = item.email;
            if (email) {
                formattedEmail = EmailUtils.format(email);
                return true;
            }
        });
        return {
            id: contact.id,
            name: (contact.firstName + " " + contact.lastName),
            emailAddress: formattedEmail
        }
    }

    initializeLookups() {
        axios.all([
            CompanyService.getContactsByCompany(this.state.activity.account.company.id),
            CrmAccountService.retrieveContacts(this.state.activity.account.id),
            this.props.location.query.opportunity ? CrmOpportunityService.getOpportunityById(this.props.location.query.opportunity) : PromiseUtils.getFakePromise([]),
        ]).then(axios.spread((companyContacts, accountContacts, opportunity) => {
            let state = _.cloneDeep(this.state);
            state.users = this.context.getUsers().map(user => {
                return { id: user.id, username: user.username, name: user.displayName, emailAddress: user.email }
            });
            let contacts = _.filter(companyContacts.data, cc => _.find(accountContacts.data, i => i.companyContactId === cc.id));
            state.contacts = contacts.map(contact => this.mapContact(contact));
            state.busy = false;
            this.setState(state);
        })).catch(error => {
            this.setState({ busy: false });
            console.log(error);
            Notify.showError(error);
        });
    }

    updateState(key, value) {
        let state = _.cloneDeep(this.state);
        _.set(state, key, value)
        if (key === 'activity') {
            if (!value.tool || value.tool.code === 'E_MAIL') {
                value.calendar = undefined;
            }
        }
        this.setState(state);
    }

    updateNotes(value) {
        this.setState({ busy: true });
        let activity = _.cloneDeep(this.state.activity);
        CrmActivityService.updateNotes(activity.id, value).then(response => {
            activity.notes = response.data;
            this.setState({ activity: activity, busy: false },
                () => Notify.showSuccess("Notes saved successfully"));
        }).catch(error => {
            this.setState({ busy: false });
            Notify.showError(error);
        });
    }

    updateDocuments(value) {
        this.setState({ busy: true });
        let activity = _.cloneDeep(this.state.activity);
        CrmActivityService.updateDocuments(activity.id, value).then(response => {
            activity.documents = response.data;
            this.setState({ activity: activity, busy: false },
                () => Notify.showSuccess("Documents saved successfully"));
        }).catch(error => {
            this.setState({ busy: false });
            Notify.showError(error);
        });
    }

    handleStatusChange(status, confirmMsg) {
        Notify.confirm(_.defaultTo(confirmMsg, 'Are you sure?'), () => {
            CrmActivityService.updateStatus(this.state.activity.id, status).then(response => {
                this.setState({ activity: response.data });
            }).catch(e => Notify.showError(e));
        })
    }

    handleActivitySave() {
        if (this.activityForm.form.validate()) {
            if (!this.calendarForm || this.calendarForm.form.validate()) {
                let shareWithAll = _.get(this.state.activity, 'calendar.shareWithAll');
                let onlyWithOrganizer = _.get(this.state.activity, 'calendar.onlyWithOrganizer');
                if ((onlyWithOrganizer && !shareWithAll) || (shareWithAll && this.checkIfParticipantsValid())) {
                    this.checkIfOutlookAccountIsValid();
                } else {
                    this.saveActivity();
                }
            }
        }
    }

    checkIfParticipantsValid() {
        let invalidParticipants = [];
        if (this.state.activity.calendar.internalParticipants) {
            this.state.activity.calendar.internalParticipants.forEach(item => {
                if (!item.emailAddress) {
                    invalidParticipants.push(item.name);
                }
            });
        }
        if (this.state.activity.calendar.externalParticipants) {
            this.state.activity.calendar.externalParticipants.forEach(item => {
                if (!item.emailAddress) {
                    invalidParticipants.push(item.name);
                }
            });
        }

        if (!_.isEmpty(invalidParticipants)) {
            Notify.showError(`User(s)/Contact(s): ` + invalidParticipants.join() + ` do not have email information. `);
            return false;
        }
        return true;
    }

    checkIfOutlookAccountIsValid() {
        let params = {
            sender: this.state.activity.calendar.organizer.emailAddress,
        };
        OutlookService.checkIfAccountIsValid(params).then(response => {
            if (response.data) {
                this.saveActivity();
            } else {
                this.getOutlookLoginUrl();
            }
        }).catch(error => {
            Notify.showError(error);
        });
    }

    getOutlookLoginUrl() {
        OutlookService.getLoginUrl().then(response => {
            window.open(response.data);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    saveActivity() {
        let activity = this.state.activity;
        CrmActivityService.validateCalender(activity).then(response => {
            this.createOrUpdateActivity(activity.tool.code == 'E_MAIL');
        }).catch(error => {
            let msg = AxiosUtils.getErrorMessage(error);
            if (msg) {
                Notify.confirm(msg.message, () => this.createOrUpdateActivity(true), msg.args);
            }
        });
    }

    createOrUpdateActivity(complete) {
        this.setState({ busy: true });
        let activity = _.cloneDeep(this.state.activity);
        if (complete) {
            activity.status = { id: 'COMPLETED', code: 'COMPLETED' }
        }
        CrmActivityService.saveActivity(activity, this.props.location.query).then(response => {
            this.setState({
                activity: response.data,
                readOnly: true,
                busy: false
            }, () => {
                Notify.showSuccess("Activity saved successfully");
                this.context.router.push("/ui/crm/activity/view/" + this.state.activity.id);
            });
        }).catch(error => {
            this.setState({ busy: false });
            Notify.showError(error);
        });
    }

    renderButtons() {
        if (!this.state.readOnly) {
            return (
                <GridCell>
                    <div className="uk-align-right">
                        <Button label="Save" style="success"
                            onclick={() => this.handleActivitySave()} />
                        <Button label="cancel" style="danger"
                            onclick={() => this.setState({ readOnly: true }, () => this.retrieveActivityInfo(this.props.params.activityId))} />
                    </div>
                </GridCell>
            );
        }
    }

    handleAddContact(contact) {
        let activity = _.cloneDeep(this.state.activity);
        let externalParticipants = _.get(activity, 'calendar.externalParticipants');
        if(_.isEmpty(externalParticipants)) {
            externalParticipants = [];
        }
        externalParticipants.push(this.mapContact(contact));
        activity.calendar.externalParticipants = externalParticipants;
        this.setState({activity: activity}, () => this.initializeLookups());
    }

    renderCalendar() {
        if (this.state.activity.tool &&
            this.state.activity.tool.code !== 'E_MAIL') {
            return (
                <GridCell width="1-1">
                    <Card>
                        <CardHeader title="Calendar" />
                        <Calendar ref={c => this.calendarForm = c}
                            activity={this.state.activity}
                            calendar={this.state.activity.calendar || undefined}
                            users={this.state.users}
                            contacts={this.state.contacts}
                            readOnly={this.state.readOnly}
                            contactsDisabled={this.state.activity.scope && this.state.activity.scope.code !== 'EXTERNAL'}
                            onChange={(value) => this.updateState("activity.calendar", value)}
                            onAddContact={(contact) => this.handleAddContact(contact)} />
                    </Card>
                </GridCell>
            );
        }
    }

    routeToOpportunity(){
        this.context.router.push(`/ui/crm/opportunity/new?activity=${this.state.activity.id}`);
    }

    renderActionMenu() {
        let actions = [];

        let enableOpportunity = this.context.getOption("ENABLE_OPPORTUNITY", false);

        let activity = this.state.activity;
        if (this.state.readOnly
            && _.get(activity, 'status.code') != 'CANCELED'
            && this.state.activity.id
            && this.state.activity.createdBy === this.context.user.username) {
            if (_.get(activity, 'status.code') == 'OPEN') {
                actions.push({
                    name: "Edit Activity",
                    icon: "edit",
                    onAction: () => this.setState({ readOnly: false }),
                   
                });
                if(enableOpportunity){
                    actions.push({
                        name:"To Opportunity",
                        label:"O",
                        onAction: () => this.routeToOpportunity()
                    });
                }
                if (_.get(activity, 'calendar.status.code') == 'EXPIRED') {
                    actions.push({
                        name: "Complete Activity",
                        icon: "check_circle_outline",
                        onAction: () => this.handleStatusChange("COMPLETED", 'Activity will be completed. Are you sure?'),
                        
                    });
                }
                actions.push({
                    name: "Mark as Canceled",
                    icon: "cancel",
                    onAction: () => this.handleStatusChange("CANCELED", 'Activity will be canceled. Are you sure?'),
                    
                });
            } else {
                if(enableOpportunity && _.get(activity, 'status.code') == 'COMPLETED'){
                    actions.push({
                        name:"To Opportunity",
                        label:"O",
                        onAction: () => this.routeToOpportunity()
                    });
                }
                actions.push({
                    name: "Reopen Activity",
                    icon: "restore",
                    onAction: () => this.handleStatusChange("OPEN", 'Activity will be reopened. Are you sure?'),
                    
                });
            }
        }
        if (!_.isEmpty(actions)) {
            return (
                <div className="user_heading" style={{ padding: "0" }}>
                    <FabToolbar actions = {actions}/>
                </div>
            );
        }
    }

    renderDocumentList() {
        if (this.state.activity.id) {
            return (
                <GridCell width="1-1">
                    <Card style={{ minHeight: "250px" }}>
                        <div style={{ minHeight: "20px" }} />
                        <DocumentList documents={this.state.activity.documents}
                            readOnly={_.get(this.state.activity, 'status.code') == 'CANCELED' || !this.state.readOnly}
                            onChange={(value) => this.updateDocuments(value)} />
                    </Card>
                </GridCell>
            );
        }
    }

    renderNoteList() {
        if (this.state.activity.id) {
            let internalRecipients;
            let externalRecipients;
            if (this.state.activity.calendar) {
                internalRecipients = this.state.activity.calendar.internalParticipants;
                externalRecipients = this.state.activity.calendar.externalParticipants;
            }
            return (
                <GridCell width="1-1">
                    <Card style={{ minHeight: "250px" }}>
                        <div style={{ minHeight: "20px" }} />
                        <NoteList notes={this.state.activity.notes}
                            readOnly={_.get(this.state.activity, 'status.code') == 'CANCELED' || !this.state.readOnly}
                            users={this.state.users}
                            contacts={this.state.contacts}
                            internalRecipients={internalRecipients}
                            externalRecipients={externalRecipients}
                            documents={this.state.activity.documents}
                            mailFeature={true}
                            onChange={(value) => this.updateNotes(value)} />
                    </Card>
                </GridCell>
            );
        }
    }

    render() {
        let activity = this.state.activity;
        let activityStyle = { minHeight: "900px" };
        if (activity.calendar) {
            activityStyle = { minHeight: "200px" };
        }
        let title = activity.id ? `${super.translate("Activity") + " - " + _.get(activity.account, "name")}` : `${super.translate("New Activity")}`;
        return (
            <div>
                <Helmet>
                    <title>{title}</title>
                </Helmet>
                <LoadingIndicator busy={this.state.busy} />
                <PageHeader title={super.translate("Activity Management")} />
                <Grid divider={true} noMargin={true}>
                    <GridCell width="1-1">
                        <Grid collapse={true}>
                            <GridCell width="6-10">
                                <Card>
                                    <Grid collapse={true}>
                                        <GridCell width="1-1">
                                            {this.renderActionMenu()}
                                            <Card style={activityStyle}>
                                                <CardHeader title="Activity" />
                                                <Activity ref={c => this.activityForm = c}
                                                    activity={activity}
                                                    users={this.state.users}
                                                    readOnly={this.state.readOnly}
                                                    onChange={(value) => this.updateState("activity", value)} />
                                            </Card>
                                        </GridCell>
                                        {this.renderCalendar()}
                                        {this.renderButtons()}
                                    </Grid>
                                </Card>
                            </GridCell>
                            <GridCell width="4-10">
                                <Grid collapse={true}>
                                    {this.renderDocumentList()}
                                    {this.renderNoteList()}
                                </Grid>
                            </GridCell>
                        </Grid>
                    </GridCell>
                </Grid>
            </div>
        );
    }
}

ActivityManagement.contextTypes = {
    getOption: PropTypes.func,
    getUsers: PropTypes.func,
    getAllUsers: PropTypes.func,
    user: PropTypes.object,
    router: PropTypes.object,
    translator: PropTypes.object
};

