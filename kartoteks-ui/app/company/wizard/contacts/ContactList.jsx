import React from "react";
import _ from "lodash";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, CardHeader, Wizard, Modal} from "susam-components/layout";
import {Notify, TextInput, Button, DropDown, Checkbox, RadioButton, Span, Form} from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';

import {PhoneNumberUtils, EmailUtils} from '../../../utils/';

export class ContactList extends TranslatingComponent {

    constructor(props){
        super(props);
        this.state = {};
    }

    componentDidMount() {

    }
    componentWillReceiveProps(nextProps){

    }
    handleAddContactClick(value){
        if(value._canMergeWith){
            this.possibleMatchModal.open();
            this.setState({contactToEdit: value._canMergeWith, contactToMerge: value});
        }else{
            this.props.onadd && this.props.onadd(value);
        }

    }
    handleMergeContactClick(value){
        this.setState({contactToMerge: value});
        this.mergeModal.open();
    }
    handleReviewContactClick(value){
        let contactToEdit = _.find(this.props.mergeOptions, {id: value.id});
        this.props.onreview && this.props.onreview(contactToEdit, value);
    }
    handleEditContactClick(value){
        this.props.onedit && this.props.onedit(value);
    }
    handleDeleteContactClick(value){
        UIkit.modal.confirm("Are you sure?", () => this.props.ondelete && this.props.ondelete(value));
    }
    handleIgnoreContactClick(value){
        UIkit.modal.confirm("Are you sure?", () => this.props.onignore && this.props.onignore(value));
    }

    handleMergeContactSelect(){
        this.mergeModal.close();
        this.props.onmerge && setTimeout(() => this.props.onmerge(this.state.contactToEdit, this.state.contactToMerge), 500);
    }
    handleSelectMergeContactRadioClick(e, item){
        e.preventDefault();
        this.setState({contactToEdit: item});
    }
    handleSelectMergeFromMatchModal(){
        this.possibleMatchModal.close();
        this.props.onmerge && setTimeout(() => this.props.onmerge(this.state.contactToEdit, this.state.contactToMerge), 500);
    }
    handleSelectAddFromMatchModal(){
        this.possibleMatchModal.close();
        this.props.onadd && setTimeout(() => this.props.onadd(this.state.contactToEdit), 500);
    }

    renderMergeListItem(contact){
        let selectedClassName = this.state.contactToEdit && this.state.contactToEdit.id == contact.id ? "md-bg-light-blue-50" : "";
        return(
            <li key = {contact._key} className={selectedClassName} style = {{cursor: 'pointer'}} onClick = {(e) => this.handleSelectMergeContactRadioClick(e, contact)}>
                <div className="md-list-content">
                            <span className="md-list-heading">
                                {contact.firstName} {contact.lastName}
                            </span>
                    <span className="uk-text-small uk-text-muted">{contact.department ? contact.department.name: ""} {contact.title ? contact.title.name: ""}</span>
                </div>
            </li>
        );
    }


    render(){
        let actions = [];
        if(this.props.showAddButton) {
            actions.push(
                <DataTable.ActionWrapper key="add" track="onclick" onaction={(data) => this.handleAddContactClick(data)}>
                    <Button label="add" flat={true} style="primary" size="small"/>
                </DataTable.ActionWrapper>
            );
        }
        if(this.props.showMergeButton){
            actions.push(
                <DataTable.ActionWrapper key="merge" track="onclick" onaction = {(data) => this.handleMergeContactClick(data)}>
                    <Button icon="compress" size="small" tooltip="merge"/>
                </DataTable.ActionWrapper>
            );
        }
        if(this.props.showEditButton){
            actions.push(
                <DataTable.ActionWrapper key="edit" track="onclick" onaction = {(data) => this.handleEditContactClick(data)}>
                    <Button icon="pencil" size="small" tooltip="edit"/>
                </DataTable.ActionWrapper>
            );
        }
        if(this.props.showDeleteButton){
            actions.push(
                <DataTable.ActionWrapper key="delete" track="onclick" onaction = {(data) => this.handleDeleteContactClick(data)}>
                    <Button icon="close" size="small" tooltip="delete"/>
                </DataTable.ActionWrapper>
            );
        }
        if(this.props.showReviewButton){
            actions.push(
                <DataTable.ActionWrapper key="review" track="onclick" onaction = {(data) => this.handleReviewContactClick(data)}>
                    <Button label="review" flat = {true} style="primary" size="small"/>
                </DataTable.ActionWrapper>
            );
        }
        if(this.props.showIgnoreButton){
            actions.push(
                <DataTable.ActionWrapper key="ignore" track="onclick" onaction = {(data) => this.handleIgnoreContactClick(data)}>
                    <Button label="ignore" flat = {true} style="danger" size="small"/>
                </DataTable.ActionWrapper>
            );
        }

        let contactsToMerge = [];
        let possibleMatch = null;
        if(this.props.mergeOptions){
            let mergeOptions = _.cloneDeep(this.props.mergeOptions);
            if(this.state.contactToMerge && this.state.contactToMerge._canMergeWith){
                possibleMatch = this.renderMergeListItem(this.state.contactToMerge._canMergeWith);
                _.remove(mergeOptions, {id: this.state.contactToMerge._canMergeWith.id});
            }

            contactsToMerge = mergeOptions.map(item => {
                return this.renderMergeListItem(item);
            });
        }
        let possibleMatchModal = null;
        if(this.state.contactToEdit && this.state.contactToMerge){
            possibleMatchModal =
                <Grid>
                    <GridCell width="1-2">
                        <Span label="Name" value = {this.state.contactToEdit.firstName + " " + this.state.contactToEdit.lastName} />
                    </GridCell>
                    <GridCell width="1-2">
                        <Span label="Name" value = {this.state.contactToMerge.firstName + " " + this.state.contactToMerge.lastName} />
                    </GridCell>
                </Grid>;
        }

        return (
            <div>
                <Grid>
                    <GridCell width="1-1">
                        <DataTable.Table data={this.props.contacts} title={this.props.title}
                                         editable = {false} insertable = {false} filterable = {false} sortable = {true}>
                            <DataTable.Text header="Name" width="15" sortable = {true} reader = {new FullnameReader()}/>
                            <DataTable.Text header="Department" field="department.name" width="15" sortable = {true}/>
                            <DataTable.Text header="Title" field="title.name" width="15" sortable = {true}/>
                            <DataTable.Text header="Location" field="companyLocation.name" width="15" sortable = {true}/>
                            <DataTable.Text header="Work Phone" width="15" reader = {new PhoneNumberListReader({usageType:{code:"WORK"}, numberType:{code:"PHONE"}})} printer = {new ListPrinter()} />
                            <DataTable.Text header="Work Mobile" width="15" reader = {new PhoneNumberListReader({usageType:{code:"WORK"}, numberType:{code:"MOBILE"}})} printer = {new ListPrinter()} />
                            <DataTable.Text header="Work Emails" width="15" reader = {new EmailListReader()} printer = {new ListPrinter()} />
                            <DataTable.ActionColumn width="10">
                                {actions}
                            </DataTable.ActionColumn>
                        </DataTable.Table>
                    </GridCell>
                </Grid>
                <Modal title="Select Contact To Merge" ref = {(c) => this.mergeModal = c}
                       actions = {[{label:"Close", action:() => this.mergeModal.close()},
                        {label:"select", buttonStyle:"primary", action:() => this.handleMergeContactSelect()}]}>
                    <Grid overflow = {true}>
                        <GridCell width="1-1" >
                            <CardHeader title="Possible Match"/>
                        </GridCell>
                        <GridCell width="1-1" >
                            <ul className="md-list md-list-centered">
                                {possibleMatch}
                            </ul>
                        </GridCell>
                        <GridCell width="1-1" >
                            <CardHeader title="All Contacts"/>
                        </GridCell>
                        <GridCell width="1-1" >
                            <ul className="md-list md-list-centered">
                                {contactsToMerge}
                            </ul>
                        </GridCell>
                    </Grid>
                </Modal>
                <Modal title="Possible match" ref = {(c) => this.possibleMatchModal = c}
                       actions = {[{label:"Add", action:() => this.handleSelectAddFromMatchModal()},
                                    {label:"merge", buttonStyle:"primary", action:() => this.handleSelectMergeFromMatchModal()}]}>
                    {possibleMatchModal}
                </Modal>
            </div>
        );
    }
}
class ListPrinter{
    print(data){
        if(data.indexOf("\n") != -1){
            return data.split("\n").map(item => <div key={item}>{item}<br/></div>);
        }
        return data;
    }
}
class FullnameReader{
    readCellValue(row) {
        return row.firstName + " " + row.lastName;
    };

    readSortValue(row) {
        return row.firstName + " " + row.lastName;
    };
}

class EmailListReader{
    readCellValue(row) {
        let formattedEmails = [];
        _.filter(row.emails, {usageType:{code:"WORK"}}).forEach(item => {
            let email = item.email;
            if(email){
                formattedEmails.push(EmailUtils.format(email));
            }
        });
        return formattedEmails.join("\n");
    };

    readSortValue(row) {
        return "";
    };
}
class PhoneNumberListReader{
    constructor(filter){
        this.filter = filter;
    }
    readCellValue(row) {
        let formattedPhones = [];
        _.filter(row.phoneNumbers, this.filter).forEach(item => {
            let phoneNumber = item.phoneNumber;
            if(phoneNumber){
                formattedPhones.push(PhoneNumberUtils.format(phoneNumber));
            }
        });
        return formattedPhones.join("\n");
    };

    readSortValue(row) {
        return "";
    };
}