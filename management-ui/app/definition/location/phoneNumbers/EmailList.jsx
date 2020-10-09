import React from "react";
import _ from "lodash";
import uuid from "uuid";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, Wizard, Loader} from "susam-components/layout";
import {Notify, TextInput, Button, DropDown, Checkbox} from 'susam-components/basic';
import {NumericInput} from 'susam-components/advanced';

import * as DataTable from 'susam-components/datatable';



export class EmailList extends TranslatingComponent {
    constructor(props){
        super(props);
        this.state = {};
    }

    handleClickEdit(email){
        this.setState({emailToEdit: email});
    }

    handleClickDelete(email){
        UIkit.modal.confirm("Are you sure ?", () => this.deleteEmail(email));
    }
    deleteEmail(email){
        let emails = _.cloneDeep(this.props.emails);
        _.remove(emails, {_key: email._key});
        this.props.onChange && this.props.onChange(emails);
    }

    updateState(key, value) {
        let emailToEdit = _.cloneDeep(this.state.emailToEdit);
        _.set(emailToEdit, key, value);
        this.setState({emailToEdit: emailToEdit});
    }

    handleClickSave(){
        let emailToEdit = _.cloneDeep(this.state.emailToEdit);
        if(!emailToEdit.email || !emailToEdit.usageType){
            Notify.showError("Please check email");
            return;
        }
        let emails = [];
        if(emailToEdit._key){
            emails = this.updateEmail(emailToEdit);
        }else{
            emails = this.addEmail(emailToEdit);
        }
        this.setState({emailToEdit: null}, () => {
            this.props.onChange && this.props.onChange(emails);
        });

    }
    addEmail(email){
        let emails = _.cloneDeep(this.props.emails);
        email._key = uuid.v4();
        emails.push(email);
        return emails;
    }
    updateEmail(email){
        let emails = _.cloneDeep(this.props.emails);
        let index = _.findIndex(emails, {_key: email._key});
        if(index >= 0){
            emails[index] = email;
        }
        return emails;
    }
    createNewEmail(){
        return {};
    }

    renderEmailEdit(){
        if(this.state.emailToEdit){
            return (
                <Grid>
                    <GridCell width = "1-5">
                        <DropDown label = "Type" options = {this.props.usageTypes}
                                  value = {this.state.emailToEdit.usageType}
                                  onchange = {(value) => this.updateState("usageType", value)} />
                    </GridCell>
                    <GridCell width = "1-5">
                        <div className = "uk-margin-top">
                            <Checkbox label = "Default" value = {this.state.emailToEdit.default}
                                      onchange = {(value) => this.updateState("default", value)}/>
                        </div>
                    </GridCell>
                    <GridCell width = "2-5">
                        <TextInput value = {this.state.emailToEdit.email} placeholder = "Email"
                                   mask = "'showMaskOnFocus':'false', 'alias': 'email', 'clearIncomplete': 'true'"
                                   onchange = {(value) => this.updateState("email", value)}/>
                    </GridCell>
                    <GridCell width = "1-5">
                        <div className = "uk-margin-top">
                            <Button label = "save" style = "success" size = "small"
                                    onclick = {() => this.handleClickSave()} />
                        </div>
                    </GridCell>
                </Grid>
            );
        }
        return (
            <div className = "ul-align-right">
                <Button label = "add email" flat = {true} style = "success" size = "small"
                        onclick = {() => this.handleClickEdit(this.createNewEmail())} />
            </div>
        );
    }

    render(){
        if(!this.props.usageTypes){
            return <Loader size="M"/>;
        }
        return (
            <Grid>
                <GridCell width="1-1">
                    {this.renderEmailEdit()}
                </GridCell>
                <GridCell width="1-1">
                    <DataTable.Table data={this.props.emails} title="Emails"
                                     filterable = {false} sortable = {false}>
                        <DataTable.Lookup header="Type" width="25" field="usageType" required = {true}/>
                        <DataTable.Bool field="default" header="Is Default" width="10"/>
                        <DataTable.Text field = "email" header="Email" width="40"/>
                        <DataTable.ActionColumn width="20">
                            <DataTable.ActionWrapper track="onclick" disabled = {this.props.readOnly}
                                                     onaction={(data) => this.handleClickEdit(data)}>
                                <Button label="Edit" flat={true} style="success" size="small"/>
                            </DataTable.ActionWrapper>
                            <DataTable.ActionWrapper track="onclick" disabled = {this.props.readOnly}
                                                     onaction={(data) => this.handleClickDelete(data)}>
                                <Button label="Delete" flat={true} style="danger" size="small"/>
                            </DataTable.ActionWrapper>
                        </DataTable.ActionColumn>
                    </DataTable.Table>
                </GridCell>
            </Grid>
        );
    }
}