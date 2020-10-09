import React from "react";
import _ from "lodash";
import uuid from "uuid";
import * as axios from "axios";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, CardHeader, Wizard, Loader} from "susam-components/layout";
import {Notify, TextInput, Button, DropDown, Checkbox, CheckboxGroup, Span, Form} from 'susam-components/basic';
import {Chip} from 'susam-components/advanced';

import {LookupService, CompanyService} from '../../../services/KartoteksService';

import {ContactPhoneNumbers} from './ContactPhoneNumbers';
import {ContactEmails} from './ContactEmails';
import {CompanyContactUpdateList} from './CompanyContactUpdateList';
import {LinkedinProfileSearch} from './LinkedinProfileSearch';
import {PhoneNumberUtils, EmailUtils, StringUtils} from '../../../utils/';

export class CompanyContact extends TranslatingComponent {

    constructor(props){
        super(props);
        this.state = {errors:{}};
    }

    initializeState(props){
        let state = _.cloneDeep(this.state);
        state.contact = props.contact;
        if(_.isEmpty(state.contact.companyLocation) && this.props.locations.length === 1){
            state.contact.companyLocation = this.props.locations[0];
        }
        this.setState(state);
    }

    componentDidMount(){
        this.initializeState(this.props);
        this.validate();

    }
    componentWillReceiveProps(nextProps){
        this.initializeState(nextProps);
        this.validate();
    }

    updateState(key, value){
        let contact = _.cloneDeep(this.state.contact);
        _.set(contact, key, value);
        this.setState({contact: contact});
    }

    handleUndoClick(){
        this.initializeState(this.props);
    }
    handleCancelClick(){
        this.props.oncancel && this.props.oncancel();
    }
    handleSaveClick(){
        if(this.props.showUpdateList && this.updateList.hasPendingItems()){
            Notify.showError("Please complete all items in update list");
            return false;
        }
        if(!this.validate()){
            return false;
        }
        this.setState({busy: true});
        let contact = _.cloneDeep(this.state.contact);

        CompanyService.validateContact(contact).then(response => {
            this.props.onsave && this.props.onsave(contact);
        }).catch(error => {
            Notify.showError(error);
            this.setState({busy: false});
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
        if(this.state.contact){
            this.state.contact.phoneNumbers.forEach(item => {
                if(!item.phoneNumber._valid){
                    Notify.showError("Phone number " + PhoneNumberUtils.format(item.phoneNumber) + " is not valid");
                    phoneNumbersAreValid = false;
                }
            });
            this.state.contact.emails.forEach(item => {
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
        let contact = _.cloneDeep(this.state.contact);
        item._key = uuid.v4();
        contact.phoneNumbers.push(item);
        this.setState({contact: contact});
    }
    handlePhoneDelete(item){
        let contact = _.cloneDeep(this.state.contact);
        _.remove(contact.phoneNumbers, {_key: item._key});
        this.setState({contact: contact});
    }
    handlePhoneUpdate(item){
        PhoneNumberUtils.setIsValid(item.phoneNumber);
        let contact = _.cloneDeep(this.state.contact);
        let index = _.findIndex(contact.phoneNumbers, {_key: item._key});
        if(index != -1){
            contact.phoneNumbers[index] = item;
        }else{
            console.warn("Can not find phone number with _key: " + JSON.stringify(item));
        }

        this.setState({contact: contact});
    }
    handleEmailCreate(item){
        EmailUtils.setIsValid(item.email);
        let contact = _.cloneDeep(this.state.contact);
        item._key = uuid.v4();
        contact.emails.push(item);
        this.setState({contact: contact});
    }
    handleEmailDelete(item){
        let contact = _.cloneDeep(this.state.contact);
        _.remove(contact.emails, {_key: item._key});
        this.setState({contact: contact});
    }
    handleEmailUpdate(item){
        EmailUtils.setIsValid(item.email);
        let contact = _.cloneDeep(this.state.contact);
        let index = _.findIndex(contact.emails, {_key: item._key});
        if(index != -1){
            contact.emails[index] = item;
        }else{
            console.warn("Can not find email with _key: " + JSON.stringify(item));
        }
        this.setState({contact: contact});
    }

    handleUpdateFromUpdateList(items){
        items.forEach(item => {
            this.updateState(item.fieldToCopy, item.valueToCopy);
        });
    }
    handleUndoUpdateFromUpdateList(items){
        items.forEach(item => {
            this.updateState(item.fieldToCopy, item.valueToUndo);
        });
    }

    render(){
        if(!this.state.contact || !this.props.lookups){
            return <Loader title="Fetching contact"/>;
        }
        if(this.state.busy){
            return <Loader title="Validating contact"/>;
        }
        let updateList = "";
        if(this.props.showUpdateList){
            updateList = <GridCell width="1-1">
                <CompanyContactUpdateList ref = {(c) => this.updateList = c}
                                          onupdate = {(items) => this.handleUpdateFromUpdateList(items)}
                                          onundo = {(items) => this.handleUndoUpdateFromUpdateList(items)}
                                          current = {this.state.contact}
                                          updated = {this.props.contactToMerge}
                                          original = {this.props.contactOriginal}/>
            </GridCell>;
        }
        let locale = _.get(this.state.contact, "companyLocation.postaladdress.country.language");
        return (
            <Grid>
                {updateList}
                <GridCell width="1-1">
                    <CardHeader title="Contact Information"/>
                </GridCell>
                <GridCell width="1-1">
                    <Form ref = {(c) => this.form = c}>
                        <Grid>
                            <GridCell width="1-3" noMargin = {true}>
                                <Checkbox label="Set as active" value = {this.state.contact.active} onchange = {(value) => this.updateState("active", value)} />
                            </GridCell>
                            <GridCell width="1-3" noMargin = {true}>
                                <Checkbox label="Set as default" value = {this.state.contact.default} onchange = {(value) => this.updateState("default", value)} />
                            </GridCell>
                            <GridCell width="1-1">
                                <Chip label="Segments" options = {this.props.lookups.segmentTypes} required = {true}
                                      translate={true} hideSelectAll={true}
                                      postTranslationCaseConverter={1}
                                      value = {this.state.contact.companyServiceTypes} valueField="code"
                                      onchange = {(value) => this.updateState("companyServiceTypes", value)}/>
                            </GridCell>
                            <GridCell width="1-6">
                                <DropDown label="Gender" required = {true}
                                          translate={true}
                                          options = {this.props.lookups.genders}
                                          value = {this.state.contact.gender}
                                          onchange = {(value) => this.updateState("gender", value)} />
                            </GridCell>
                            <GridCell width="1-3">
                                <TextInput label="First Name" required = {true} uppercase = {{locale: locale}}
                                           value = {this.state.contact.firstName}
                                           onchange = {(value) => this.updateState("firstName", value)} />
                            </GridCell>
                            <GridCell width="1-3">
                                <TextInput label="Last Name" required = {true} uppercase = {{locale: locale}}
                                           value = {this.state.contact.lastName}
                                           onchange = {(value) => this.updateState("lastName", value)} />
                            </GridCell>
                            <GridCell width="1-3">
                                <DropDown label="Location" required = {true}
                                          options = {this.props.locations} valueField="name"
                                          value = {this.state.contact.companyLocation}
                                          onchange = {(value) => this.updateState("companyLocation", value)} />
                            </GridCell>
                            <GridCell width="1-3">
                                <DropDown label="Department"
                                          translate={true}
                                          options = {this.props.lookups.departments}
                                          value = {this.state.contact.department}
                                          onchange = {(value) => this.updateState("department", value)} />
                            </GridCell>
                            <GridCell width="1-3">
                                <DropDown label="Title"
                                          options = {this.props.lookups.titles}
                                          translate={true}
                                          value = {this.state.contact.title}
                                          onchange = {(value) => this.updateState("title", value)} />
                            </GridCell>
                        </Grid>
                    </Form>
                    <Grid>
                        <GridCell width="2-3">
                            <ContactPhoneNumbers phoneNumbers = {this.state.contact.phoneNumbers}
                                                 usageTypes = {this.props.lookups.usageTypes}
                                                 phoneTypes = {this.props.lookups.phoneTypes}
                                                 country = {this.props.country}
                                                 oncreate = {(item) => this.handlePhoneCreate(item)}
                                                 onupdate = {(item) => this.handlePhoneUpdate(item)}
                                                 ondelete = {(item) => this.handlePhoneDelete(item)}/>
                        </GridCell>
                        <GridCell width="2-3">
                            <ContactEmails emails = {this.state.contact.emails}
                                           usageTypes = {this.props.lookups.usageTypes}
                                           oncreate = {(item) => this.handleEmailCreate(item)}
                                           onupdate = {(item) => this.handleEmailUpdate(item)}
                                           ondelete = {(item) => this.handleEmailDelete(item)}/>
                        </GridCell>
                        <GridCell width="1-1">
                             <div className="uk-align-right">
                                <Button label="cancel" waves = {true} style ="danger" onclick = {() => this.handleCancelClick()}/>
                            </div>  
                             <div className="uk-align-right">
                                <Button label="Ok" waves = {true} style = "primary" onclick = {() => this.handleSaveClick()}/>
                            </div>                         
                        </GridCell>
                    </Grid>

                </GridCell>
            </Grid>
        );
    }
}