import React from "react";
import _ from "lodash";
import uuid from "uuid";
import * as axios from "axios";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, CardHeader, Loader} from "susam-components/layout";
import {Notify, TextInput, Button, DropDown, Checkbox, CheckboxGroup, Span, Form} from 'susam-components/basic';
import {PhoneNumberUtils} from 'susam-components/utils';

import {PhoneNumberList} from '../phoneNumbers/PhoneNumberList';
import {EmailList} from '../phoneNumbers/EmailList';

import {LocationService} from '../../../services/LocationService';
import {KartoteksService} from '../../../services/KartoteksService';

export class CustomsContact extends TranslatingComponent {

    state = {};

    componentDidMount() {
        this.initialize(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.initializeState(nextProps);
    }

    initializeState(props) {
        if (!props.contact) {
            return;
        }
        let state = _.cloneDeep(this.state);
        state.contact = _.cloneDeep(props.contact);
        state.country = _.cloneDeep(props.data.country);
        this.convertTypeCodeToObject(state.contact);
        this.setState(state);
    }
    initialize(props) {
        axios.all([
            LocationService.retrieveCountries(),
            KartoteksService.getPhoneTypeList(),
            KartoteksService.getUsageTypeList()
        ]).then(axios.spread((countries, phoneTypes, usageTypes) => {
            this.setState({
                    countries: countries.data,
                    phoneTypes: phoneTypes.data,
                    usageTypes: usageTypes.data,
                    genders: KartoteksService.getGenderList()
                },
                () => this.initializeState(props));
        })).catch((error) => {
            Notify.showError(error);
        });
    }

    convertTypeCodeToObject(contact) {
        let phoneNumbers = _.get(contact, "phoneNumbers");
        if (phoneNumbers) {
            phoneNumbers.forEach(item => {
                if (item.phoneType) {
                    item.phoneType = _.find(this.state.phoneTypes, {code: item.phoneType});
                    PhoneNumberUtils.setIsValid(item.phoneNumber);
                }
            });
        }
        let emails = _.get(contact, "emails");
        if (emails) {
            emails.forEach(item => {
                if (item.usageType) {
                    item.usageType = _.find(this.state.usageTypes, {code: item.usageType});
                }
            });
        }
        let gender = _.get(contact, "gender");
        if(gender){
            contact.gender = _.find(this.state.genders, {code: gender});
        }
    }

    updateState(key, value) {
        let contact = _.cloneDeep(this.state.contact);
        _.set(contact, key, value);
        this.setState({contact: contact});
    }
    handlePhoneNumbersChange(phoneNumbers) {
        let contact = _.cloneDeep(this.state.contact);
        contact.phoneNumbers = phoneNumbers;
        this.setState({contact: contact});
    }
    handleEmailsChange(emails) {
        let contact = _.cloneDeep(this.state.contact);
        contact.emails = emails;
        this.setState({contact: contact});
    }
    handleSaveContact(){
        if(!this.form.validate()) {
            Notify.showError("There are eori problems");
            return;
        }
        let contact = _.cloneDeep(this.state.contact);
        this.convertTypesToCode(contact);
        this.props.onSave && this.props.onSave(contact);

    }

    handleCancelClick(){
        this.props.onCancel && this.props.onCancel();
    }

    convertTypesToCode(contact) {
        let phoneNumbers = _.get(contact, "phoneNumbers");
        if (phoneNumbers) {
            phoneNumbers.forEach(item => {
                if (item.phoneType) {
                    item.phoneType = item.phoneType.code;
                }
            });
        }
        let emails = _.get(contact, "emails");
        if (emails) {
            emails.forEach(item => {
                if (item.usageType) {
                    item.usageType = item.usageType.code;
                }
            });
        }
        let gender = _.get(contact, "gender");
        if(gender){
            contact.gender = gender.code;
        }
    }

    render(){
        if(!this.state.contact){
            return null;
        }
        return(
            <Grid>
                <GridCell width = "1-1">
                    <Form ref = {c => this.form = c}>
                        <Grid>
                            <GridCell width="1-1">
                                <Checkbox label="Active"
                                          value = {this.state.contact.active}
                                          onchange = {(value) => this.updateState("active", value)} />
                            </GridCell>
                            <GridCell width="1-4">
                                <DropDown label="Gender" options = {this.state.genders}
                                          valueField = "code" required = {true}
                                          value = {this.state.contact.gender}
                                          onchange = {(value) => this.updateState("gender", value)} />
                            </GridCell>
                            <GridCell width="1-4">
                                <TextInput label="First Name" required = {true} uppercase = {true}
                                           value = {this.state.contact.firstName}
                                           onchange = {(value) => this.updateState("firstName", value)} />
                            </GridCell>
                            <GridCell width="1-4">
                                <TextInput label="Last Name" required = {true} uppercase = {true}
                                           value = {this.state.contact.lastName}
                                           onchange = {(value) => this.updateState("lastName", value)} />
                            </GridCell>
                            <GridCell width="1-4">
                                <DropDown label="Location" options = {this.props.data.locations}
                                          value = {this.state.contact.customsLocation} valueField = "_key"
                                          onchange = {(value) => this.updateState("customsLocation", value)} />
                            </GridCell>
                        </Grid>
                    </Form>
                </GridCell>
                <GridCell width="1-2">
                    <PhoneNumberList
                        readOnly = {this.props.readOnly}
                        phoneTypes={this.state.phoneTypes}
                        phoneNumbers={this.state.contact.phoneNumbers}
                        showExtension = {true}
                        country={this.state.country}
                        onChange={(phoneNumbers) => this.handlePhoneNumbersChange(phoneNumbers)} />
                </GridCell>
                <GridCell width="1-2">
                    <EmailList
                        readOnly = {this.props.readOnly}
                        usageTypes={this.state.usageTypes}
                        emails={this.state.contact.emails}
                        onChange={(emails) => this.handleEmailsChange(emails)} />
                </GridCell>
                <GridCell width="1-1">
                    <div className = "uk-align-right">
                        <Button label="Cancel" size = "small"
                                onclick = {() => this.handleCancelClick()} />
                        <Button label="Save" size = "small" style = "primary"
                                onclick = {() => this.handleSaveContact()} />
                    </div>
                </GridCell>
            </Grid>
        );
    }

}