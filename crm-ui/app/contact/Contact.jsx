import React from "react";
import * as axios from "axios";
import uuid from "uuid";

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, CardHeader, Loader} from "susam-components/layout";
import {Notify, TextInput, DropDown, Checkbox, Form} from 'susam-components/basic';
import {Chip} from 'susam-components/advanced';
import {LookupService} from '../services';
import {ContactPhoneNumbers, ContactEmails} from './';
import {LinkedinProfileSearch} from '../common';
import {PhoneNumberUtils, EmailUtils} from '../utils';

export class Contact extends TranslatingComponent {

    static defaultProps = {
        contact: {}
    }

    constructor(props){
        super(props);
        this.state = {errors:{}};
    }
    
    componentDidMount(){
        this.initializeLookups();

        if(this.props.locations.length == 1){
            let contact = _.cloneDeep(this.props.contact);
            contact.companyLocation = this.props.locations[0];
            this.props.onChange && this.props.onChange(contact);
        }
    }
    
    handleChange(key, value){
        let contact = _.cloneDeep(this.props.contact);
        contact[key] = value;
        this.props.onChange && this.props.onChange(contact);
    }

    initializeLookups(){
        axios.all([
            LookupService.getServiceAreas(),
            LookupService.getGenders(),
            LookupService.getContactDepartments(),
            LookupService.getContactTitles(),
            LookupService.getPhoneTypeList(),
            LookupService.getUsageTypeList()
        ]).then(axios.spread((segmentTypes, genders, departments, titles, phoneTypes, usageTypes) => {
            let state = _.cloneDeep(this.state);
            state.segmentTypes = segmentTypes.data;
            state.genders = genders.data;
            state.departments = departments.data;
            state.titles = titles.data;
            state.phoneTypes = phoneTypes.data;
            state.usageTypes = usageTypes.data;
            this.setState(state);
        })).catch(error => {
            Notify.showError(error);
        })
    }

    validate(){
        let formIsValid = true;
        if(this.form){
            formIsValid = this.form.validate();
            if(!formIsValid){
                Notify.showError("There are validation errors");
            }
        }

        let phoneNumbersAreValid = true;
        let emailsAreValid = true;
        if(this.props.contact){
            this.props.contact.phoneNumbers && this.props.contact.phoneNumbers.forEach(item => {
                if(!item.phoneNumber._valid){
                    Notify.showError("Phone number " + PhoneNumberUtils.format(item.phoneNumber) + " is not valid");
                    phoneNumbersAreValid = false;
                }
            });
            this.props.contact.emails && this.props.contact.emails.forEach(item => {
                if(!item.email._valid){
                    Notify.showError("Email address " + EmailUtils.format(item.email) + " is not valid");
                    emailsAreValid = false;
                }
            });
        }
        return formIsValid && phoneNumbersAreValid && emailsAreValid;
    }

    handlePhoneCreate(item){
        PhoneNumberUtils.setIsValid(item.phoneNumber);
        let contact = _.cloneDeep(this.props.contact);
        item._key = uuid.v4();
        contact.phoneNumbers = contact.phoneNumbers || [];
        contact.phoneNumbers.push(item);
        this.props.onChange(contact);
    }
    handlePhoneDelete(item){
        let contact = _.cloneDeep(this.props.contact);
        _.remove(contact.phoneNumbers, {_key: item._key});
        this.props.onChange(contact);
    }
    handlePhoneUpdate(item){
        PhoneNumberUtils.setIsValid(item.phoneNumber);
        let contact = _.cloneDeep(this.props.contact);
        let index = _.findIndex(contact.phoneNumbers, {_key: item._key});
        if(index != -1){
            contact.phoneNumbers[index] = item;
        }else{
            console.warn("Can not find phone number with _key: " + JSON.stringify(item));
        }

        this.props.onChange(contact);
    }
    handleEmailCreate(item){
        EmailUtils.setIsValid(item.email);
        let contact = _.cloneDeep(this.props.contact);
        item._key = uuid.v4();
        contact.emails = contact.emails || [];
        contact.emails.push(item);
        this.props.onChange(contact);
    }
    handleEmailDelete(item){
        let contact = _.cloneDeep(this.props.contact);
        _.remove(contact.emails, {_key: item._key});
        this.props.onChange(contact);
    }
    handleEmailUpdate(item){
        EmailUtils.setIsValid(item.email);
        let contact = _.cloneDeep(this.props.contact);
        let index = _.findIndex(contact.emails, {_key: item._key});
        if(index != -1){
            contact.emails[index] = item;
        }else{
            console.warn("Can not find email with _key: " + JSON.stringify(item));
        }
        this.props.onChange(contact);
    }

    render(){
        if(this.state.busy){
            return <Loader title="Validating contact"/>;
        }
        let locale = _.get(this.state.contact, "companyLocation.postaladdress.country.language");
        return (
            <Grid>
                <GridCell width="1-1">
                    <CardHeader title="Contact Information"/>
                </GridCell>
                <GridCell width="1-1">
                    <Form ref = {(c) => this.form = c}>
                        <Grid>
                            <GridCell width="1-3" noMargin = {true}>
                                <Checkbox label="Set as active" value = {this.props.contact.active} onchange = {(value) => this.handleChange("active", value)} />
                            </GridCell>
                            <GridCell width="1-3" noMargin = {true}>
                                <Checkbox label="Set as default" value = {this.props.contact.default} onchange = {(value) => this.handleChange("default", value)} />
                            </GridCell>
                            <GridCell width="1-1">
                                <Chip label="Segments" options = {this.state.segmentTypes} required = {true}
                                      translate={true} hideSelectAll={true} 
                                      value = {this.props.contact.companyServiceTypes} valueField="code"
                                      onchange = {(value) => this.handleChange("companyServiceTypes", value)}/>
                            </GridCell>
                            <GridCell width="1-6">
                                <DropDown label="Gender" required = {true}
                                          options = {this.state.genders}
                                          value = {this.props.contact.gender}
                                          translate={true}
                                          onchange = {(value) => this.handleChange("gender", value)} />
                            </GridCell>
                            <GridCell width="1-3">
                                <TextInput label="First Name" required = {true} uppercase = {{locale: locale}}
                                           value = {this.props.contact.firstName}
                                           onchange = {(value) => this.handleChange("firstName", value)} />
                            </GridCell>
                            <GridCell width="1-3">
                                <TextInput label="Last Name" required = {true} uppercase = {{locale: locale}}
                                           value = {this.props.contact.lastName}
                                           onchange = {(value) => this.handleChange("lastName", value)} />
                            </GridCell>
                            <GridCell width="1-3">
                                <DropDown label="Location" required={true}
                                          options = {this.props.locations} valueField="name"
                                          value = {this.props.contact.companyLocation}
                                          onchange = {(value) => this.handleChange("companyLocation", value)} />
                            </GridCell>
                            <GridCell width="1-3">
                                <DropDown label="Department"
                                          options = {this.state.departments}
                                          value = {this.props.contact.department}
                                          translate={true}
                                          onchange = {(value) => this.handleChange("department", value)} />
                            </GridCell>
                            <GridCell width="1-3">
                                <DropDown label="Title"
                                          options = {this.state.titles}
                                          value = {this.props.contact.title}
                                          translate={true}
                                          onchange = {(value) => this.handleChange("title", value)} />
                            </GridCell>
                        </Grid>
                    </Form>
                    <Grid>
                        <GridCell width="2-3">
                            <ContactPhoneNumbers phoneNumbers = {this.props.contact.phoneNumbers}
                                                 usageTypes = {this.state.usageTypes}
                                                 phoneTypes = {this.state.phoneTypes}
                                                 country = {this.props.country}
                                                 oncreate = {(item) => this.handlePhoneCreate(item)}
                                                 onupdate = {(item) => this.handlePhoneUpdate(item)}
                                                 ondelete = {(item) => this.handlePhoneDelete(item)}/>
                        </GridCell>
                        <GridCell width="2-3">
                            <ContactEmails emails = {this.props.contact.emails}
                                           usageTypes = {this.state.usageTypes}
                                           oncreate = {(item) => this.handleEmailCreate(item)}
                                           onupdate = {(item) => this.handleEmailUpdate(item)}
                                           ondelete = {(item) => this.handleEmailDelete(item)}/>
                        </GridCell>
                    </Grid>

                </GridCell>
            </Grid>
        );
    }
}