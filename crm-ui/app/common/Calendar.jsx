
import * as axios from "axios";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Chip, DateTime } from "susam-components/advanced";
import { Button, Checkbox, Form, Notify, Span, TextInput } from "susam-components/basic";
import { Grid, GridCell } from 'susam-components/layout';
import { AddContact } from '../common/AddContact';
import { LookupService } from '../services';
import { withReadOnly } from "../utils";
import {RichTextEditor} from "./RichTextEditor";

var moment = require("moment");

export class Calendar extends TranslatingComponent {

    static defaultProps = {
        calendar: {
            onlyWithOrganizer: false,
            shareWithAll: false,
        }
    };

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        if (_.isEmpty(_.get(this.props, 'calendar.internalParticipants'))) {
            this.handleChange("internalParticipants", _.filter(this.props.users, i => i.username === this.props.activity.createdBy));
        }
        if (!_.isEmpty(_.get(this.props, 'calendar.startDate'))) {
            this.adjustShareWithAll(_.get(this.props, 'calendar.startDate'));
        }

    }

    mapUser(user) {
        return {
            id: user.id,
            name: user.displayName,
            username: user.username,
            emailAddress: user.email
        }
    }

    adjustShareWithAll(startDateValue) {
        let shareWithAllValue = moment().isAfter(moment(startDateValue, "DD/MM/YYYY HH:mm Z"));
        this.handleChange('shareWithAll', _.get(this.props, 'calendar.shareWithAll') && !shareWithAllValue);
        this.setState({ shareWithAllReadonly: shareWithAllValue });
    }

    handleChange(key, value) {
        let calendar = _.cloneDeep(this.props.calendar);
        if (!calendar.organizer) {
            calendar.organizer = this.mapUser(this.context.user);
        }
        if ('allDayEvent' === key && value) {
                this.adjustTime(calendar);
        }
        calendar[key] = value;
        this.props.onChange(calendar);
    }

    handleDateChange(key, value) {
        let calendar = _.cloneDeep(this.props.calendar);
        if ('allDayEvent' === key && value) {
            this.adjustTime(calendar);
        }
        calendar[key] = value;
        this.props.onChange(calendar);
        if ('startDate' === key) {
            this.adjustShareWithAll(value);
        }
    }

    adjustTime(calendar) {
        let timeMatch;
        if (calendar.startDate) {
            timeMatch = calendar.startDate.match(/(\d{2}:\d{2})/);
            if (timeMatch) {
                calendar.startDate = _.replace(calendar.startDate, timeMatch[0], '00:00');
            }

        }
        if (calendar.endDate) {
            timeMatch = calendar.endDate.match(/(\d{2}:\d{2})/);
            if (timeMatch) {
                calendar.endDate = _.replace(calendar.endDate, timeMatch[0], '00:00');
            }
        }
    }

    renderStartDate() {
        if (this.props.readOnly) {
            return (
                <Span label="Start Date" value={this.props.calendar.startDate} />
            );
        } else {
            return (
                <DateTime label="Start Date" required={true}
                    value={this.props.calendar.startDate} step={10}
                    onchange={(data) => this.handleDateChange("startDate", data)} />
            );

        }
    }

    renderEndDate() {
        if (this.props.readOnly) {
            return (
                <Span label="End Date" value={this.props.calendar.endDate} />
            );
        } else {
            let value = "";
            if (!this.props.calendar.endDate && this.props.activity.tool.code != 'CALL') {
                value = this.props.calendar.startDate;
            } else {
                value = this.props.calendar.endDate;
            }
            let required = this.props.calendar.onlyWithOrganizer 
                            || this.props.calendar.shareWithAll
                            || 'CALL' !== _.get(this.props.activity, 'tool.code')
            return (
                <DateTime label="End Date" 
                    required={required}
                    value={value} step={10}
                    onchange={(data) => this.handleDateChange("endDate", data)} />
            );
        }
    }

    loadAccountContacts(contact) {
        this.props.onAddContact && this.props.onAddContact(contact);
    }

    renderExternalParticipants() {
        let top = this.props.readOnly ? 0: -30;
        if (!this.props.contactsDisabled) {
            return (
                <div>
                    {!this.props.readOnly &&
                    <div style={{ position: "relative", top: `${top+16}px`, left: "116px", zIndex:"998"}}>
                        <Button iconColorClass="md-btn-flat-success" tooltip="Add Contact" icon="plus" size="small" style="success" flat={true} onclick={() => this.addContactForm.openModal()} />
                    </div>}
                    <div style={{ position: "relative", top: `${top}px` }} >
                        <ReadOnlyChip options={this.props.contacts} label="External Participants"
                            value={this.props.calendar.externalParticipants}
                            readOnly={this.props.readOnly} hideSelectAll={true}
                            onchange={(data) => { this.handleChange("externalParticipants", data) }} />
                    </div>
                </div>
            );
        }
    }

    render() {
        return (
            <div>
                <Form ref={c => this.form = c}>
                    <Grid>
                        <GridCell width="1-2">
                            <Checkbox label="Create/Edit Activity on my Calendar" value={this.props.calendar.onlyWithOrganizer}
                                disabled={this.props.readOnly}
                                onchange={(data) => { this.handleChange("onlyWithOrganizer", data) }} />
                        </GridCell>
                        <GridCell width="1-2">
                            <Checkbox label="Share with all" value={this.props.calendar.shareWithAll}
                                disabled={this.state.shareWithAllReadonly || this.props.readOnly}
                                onchange={(data) => { this.handleChange("shareWithAll", data) }} />
                        </GridCell>
                        <GridCell width="1-2">
                            <TextInput label="Location" required={this.props.activity.tool.name != 'Call'} readOnly={this.props.readOnly}
                                value={this.props.calendar.location}
                                onchange={(data) => { this.handleChange("location", data) }} />
                        </GridCell>
                        <GridCell width="1-2">
                            <TextInput label="Meeting Room" readOnly={this.props.readOnly}
                                value={this.props.calendar.meetingRoom}
                                onchange={(data) => { this.handleChange("meetingRoom", data) }} />
                        </GridCell>
                        <GridCell width="1-1">
                            <Grid>
                                <GridCell width="1-2">
                                    {this.renderStartDate()}
                                </GridCell>
                                <GridCell width="1-2">
                                    <Checkbox label="All day event" value={this.props.calendar.allDayEvent}
                                        disabled={this.props.readOnly}
                                        onchange={(data) => { this.handleDateChange("allDayEvent", data) }} />
                                </GridCell>
                                <GridCell width="1-2">
                                    {this.renderEndDate()}
                                </GridCell>
                            </Grid>
                        </GridCell>
                        <GridCell width="1-2">
                            <ReadOnlyChip options={this.props.users} label="Internal Participants"
                                value={this.props.calendar.internalParticipants} required={true}
                                readOnly={this.props.readOnly} hideSelectAll={true}
                                onchange={(data) => { this.handleChange("internalParticipants", data) }} />
                        </GridCell>
                        <GridCell width="1-2">
                            {this.renderExternalParticipants()}
                        </GridCell>
                        <GridCell width="1-1">
                            <TextInput label="Subject" readOnly={this.props.readOnly}
                                value={this.props.calendar.subject} required={true}
                                onchange={(data) => { this.handleChange("subject", data) }} />
                        </GridCell>
                        <GridCell width="1-1">
                            <RichTextEditor label="Content"
                                            value={this.props.calendar.content}
                                            asHtml={true}
                                            readOnly={this.props.readOnly}
                                            onChange={(content) => this.handleChange("content", content)}/>
                        </GridCell>
                    </Grid>
                </Form>
                <AddContact ref={c => this.addContactForm = c} account={this.props.activity.account} onAddContact={contact => this.loadAccountContacts(contact)} />
            </div>
        );
    }
}
const ReadOnlyChip = withReadOnly(Chip);

Calendar.contextTypes = {
    user: React.PropTypes.object
};

