import React from "react";
import _ from "lodash";
import uuid from "uuid";
import * as axios from "axios";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, CardHeader, Loader} from "susam-components/layout";
import {Notify, TextInput, Button, DropDown, Checkbox, CheckboxGroup, Span, Form} from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';

import {PhoneNumberUtils} from 'susam-components/utils';
import {PhoneNumberList} from '../phoneNumbers/PhoneNumberList';
import {EmailList} from '../phoneNumbers/EmailList';
import {CustomsContact} from './CustomsContact';

import {LocationService} from '../../../services/LocationService';
import {KartoteksService} from '../../../services/KartoteksService';

export class CustomsContactList extends TranslatingComponent {

    state = {};

    componentDidMount(){
        this.initialize(this.props);
    }
    componentWillReceiveProps(nextProps){
        this.initializeState(nextProps);
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
                usageTypes: usageTypes.data},
                () => this.initializeState(props));
        })).catch((error) => {
            Notify.showError(error);
        });
    }
    initializeState(props) {
        if (!props.data) {
            return;
        }
        let state = _.cloneDeep(this.state);
        state.contacts = _.cloneDeep(props.data.contacts);
        this.setState(state);
    }
    updateState(key, value) {
        let contactToEdit = _.cloneDeep(this.state.contactToEdit);
        _.set(contactToEdit, key, value);
        this.setState({contactToEdit: contactToEdit});
    }

    handleClickEdit(contact){
        this.setState({contactToEdit: contact});
    }
    handleClickDelete(contact){
        UIkit.modal.confirm("Are you sure ?", () => this.handleDelete(contact));
    }
    handleDelete(contact){
        let contacts = _.cloneDeep(this.state.contacts);
        _.remove(contacts, {_key: contact._key});
        this.setState({contacts: contacts});
    }
    handleNewContactClick(){
        this.setState({
            contactToEdit: {
                active: true,
                phoneNumbers: [],
                emails: []
            }
        });
    }
    handleCancelContact(){
        this.setState({contactToEdit: null});
    }
    handleSaveContact(contact){
        let contacts = [];
        if(contact._key){
            contacts = this.updateContact(contact);
        }else{
            contacts = this.addContact(contact);
        }
        this.setState({contacts: contacts, contactToEdit: null});
    }
    addContact(contact){
        let contacts = _.cloneDeep(this.state.contacts);
        contact._key = uuid.v4();
        contacts.push(contact);
        return contacts;
    }
    updateContact(contact){
        let contacts = _.cloneDeep(this.state.contacts);
        let index = _.findIndex(contacts, {_key: contact._key});
        if(index >= 0){
            contacts[index] = contact;
        }
        return contacts;
    }



    next() {
        return new Promise(
            (resolve, reject) => {
                if(this.state.contactToEdit){
                    Notify.showError("Please save the contact you are editing");
                    reject(false);
                    return;
                }
                let contacts = _.cloneDeep(this.state.contacts);
                this.props.handleSave && this.props.handleSave(contacts);
                resolve(true);
            });
    }
    renderContactEdit(){
        return(
            <CustomsContact contact = {this.state.contactToEdit}
                            data = {this.props.data}
                            onSave = {data => this.handleSaveContact(data)}
                            onCancel = {() => this.handleCancelContact()}/>

        );
    }
    render() {
        if (!this.state.contacts) {
            return <Loader title="Fetching contact data"/>;
        }

        if(this.state.contactToEdit){
            return this.renderContactEdit();
        }

        return (
            <Grid>
                <GridCell width="1-1">
                    <CardHeader title="Contacts"/>
                </GridCell>
                <GridCell width="1-1">
                    <div className = "uk-align-right">
                        <Button label="New Contact" flat = {true} size = "small" style = "success"
                                onclick = {() => this.handleNewContactClick()} />
                    </div>
                </GridCell>
                <GridCell width="1-1">
                    <Grid>
                        <GridCell width="1-1" noMargin={true}>
                            <DataTable.Table data={this.state.contacts} filterable={false} sortable={true} insertable={false}
                                             editable={false}>
                                <DataTable.Text width="15" header="Name" reader = {new NameReader()}/>
                                <DataTable.Text width="15" field="customsLocation.name" header="Location" />
                                <DataTable.Text width="10" header="Phone" reader = {new PhoneReader("PHONE")} printer = {new ListPrinter()}/>
                                <DataTable.Text width="10" header="Mobile" reader = {new PhoneReader("MOBILE")} printer = {new ListPrinter()}/>
                                <DataTable.Text width="20" header="Email" reader = {new EmailReader()} printer = {new ListPrinter()}/>
                                <DataTable.Bool width="10" field="active" header="Active" />
                                <DataTable.ActionColumn width="20">
                                    <DataTable.ActionWrapper track="onclick"
                                                             onaction={(data) => this.handleClickEdit(data)}>
                                        <Button label="Edit" flat={true} style="success" size="small"/>
                                    </DataTable.ActionWrapper>
                                    <DataTable.ActionWrapper track="onclick"
                                                             onaction={(data) => this.handleClickDelete(data)}>
                                        <Button label="Delete" flat={true} style="danger" size="small"/>
                                    </DataTable.ActionWrapper>
                                </DataTable.ActionColumn>
                            </DataTable.Table>
                        </GridCell>
                    </Grid>
                </GridCell>
            </Grid>
        );
    }

}

class NameReader{
    readCellValue(row) {
        return row.firstName + " " + row.lastName;
    };

    readSortValue(row) {
        return this.readCellValue(row);
    };
}

class ListPrinter{
    print(data){
        return data.map(item => <div key={uuid.v4()}>{item}<br/></div>);
    }
}
class EmailReader{
    readCellValue(row) {
        let emails = [];
        if(row.emails){
            row.emails.forEach(item => {
                if(item.email){
                    emails.push(item.email);
                }
            });
        }
        return emails;
    }
    readSortValue(row) {
        return "";
    };
}
class PhoneReader{
    constructor(type){
        this.type = type;
    }
    readCellValue(row) {
        let formattedPhones = [];
        if(row.phoneNumbers){
            _.filter(row.phoneNumbers, {phoneType: this.type})
                .forEach(item => {
                    if(item.phoneNumber){
                        formattedPhones.push(PhoneNumberUtils.format(item.phoneNumber));
                    }
            });
        }

        return formattedPhones;
    };

    readSortValue(row) {
        return "";
    };
}