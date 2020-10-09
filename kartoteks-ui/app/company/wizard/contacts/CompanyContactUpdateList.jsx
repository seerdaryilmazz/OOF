import React from "react";
import _ from "lodash";
import uuid from "uuid";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, CardHeader, Loader} from "susam-components/layout";
import {Notify, TextInput, Button, DropDown, Checkbox, Span, Form} from 'susam-components/basic';
import {UpdateList} from '../UpdateList';
import {UpdateListPopulator} from '../UpdateListPopulator';
import {PhoneNumberUtils} from '../../../utils/PhoneNumberUtils';
import {EmailUtils} from '../../../utils/EmailUtils';

export const CompanyContactUpdateConfig = [
    {fieldToCompare: "default", label: "Is Default"},
    {fieldToCompare: "active", label: "Is Active"},
    {fieldToCompare: "gender.code", fieldToCopy: "gender", label: "Gender"},
    {fieldToCompare: "firstName", label: "First Name"},
    {fieldToCompare: "lastName", label: "Last Name"},
    {fieldToCompare: "location.name", fieldToCopy: "location", label: "Location"},
    {fieldToCompare: "department.name", fieldToCopy: "department", label: "Department"},
    {fieldToCompare: "title.name", fieldToCopy: "title", label: "Title"},
    {fieldToCompare: "companyServiceTypes", fieldToCopy:"companyServiceTypes", label: "Service Types",
        valueToCompare: (item) => {
            return item.code;
        },
        valueToPrint: (item) => {
            return <div key={uuid.v4()} style={{marginBottom: "8px"}}>
                <i className="uk-badge" style = {{marginRight: "3px"}}>{item.code}</i>
            </div>;
        }
    },
    {fieldToCompare: "phoneNumbers", fieldToCopy:"phoneNumbers", label: "Phone Numbers",
        valueToCompare: (item) => {
            return [item.numberType.code, item.usageType.code, item.default, PhoneNumberUtils.format(item.phoneNumber)].join(":");
        },
        valueToPrint: (item) => {
            return <div key={uuid.v4()} style={{marginBottom: "8px"}}>
                <i className="uk-badge" style = {{marginRight: "3px"}}>{item.numberType.code}</i>
                <i className="uk-badge" style = {{marginRight: "3px"}}>{item.usageType.code}</i>
                {item.default ? <i className="uk-badge" style = {{marginRight: "3px"}}>Default</i> : ""}
                {PhoneNumberUtils.format(item.phoneNumber)}
            </div>;
        }
    },
    {fieldToCompare: "emails", fieldToCopy:"emails", label: "Emails",
        valueToCompare: (item) => {
            return [item.usageType.code, item.default, item.email.emailAddress].join(":");
        },
        valueToPrint: (item) => {
            return <div key={uuid.v4()} style={{marginBottom: "8px"}}>
                <i className="uk-badge" style = {{marginRight: "3px"}}>{item.usageType.code}</i>
                {item.default ? <i className="uk-badge" style = {{marginRight: "3px"}}>Default</i> : ""}
                {EmailUtils.format(item.email)}
            </div>;

        }
    }
];

export class CompanyContactUpdateList extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {};
    }
    componentDidMount(){
        this.populateUpdatesList(this.props.current, this.props.updated, this.props.original);
    }
    componentWillReceiveProps(nextProps){
        this.populateUpdatesList(nextProps.current, nextProps.updated, nextProps.original);
    }
    populateUpdatesList(contactToEdit, contactToMerge, contactOriginal){
        if(!(contactToEdit && contactToMerge && contactOriginal)){
            return;
        }

        let populator = new UpdateListPopulator(contactToEdit, contactToMerge, contactOriginal);
        let updateList = populator.populate(CompanyContactUpdateConfig);
        if(this.state.updateList){
            updateList.forEach(item => {
                let prevIgnoredItem =_.find(this.state.updateList, {fieldToCompare: item.fieldToCompare, status: "IGNORED"});
                if(prevIgnoredItem){
                    item.status = prevIgnoredItem.status;
                }
            });
        }
        this.setState({updateList: updateList});
    }
    handleFieldUpdate(items){
        this.props.onupdate && this.props.onupdate(items);
        this.updateItemStatus(items, "UPDATED");
    }
    handleFieldIgnore(items){
        this.updateItemStatus(items, "IGNORED");
    }
    handleFieldUndoIgnore(items){
        this.updateItemStatus(items, "");
    }
    handleFieldUndoUpdate(items){
        this.props.onundo && this.props.onundo(items);
        this.updateItemStatus(items, "");
    }
    updateItemStatus(items, newStatus){
        let updateList = _.cloneDeep(this.state.updateList);
        items.forEach(item => {
            let index = _.findIndex(updateList, {fieldToCompare: item.fieldToCompare});
            if(index != -1){
                item.status = newStatus;
                updateList[index] = item;
            }
        });
        this.setState({updateList: updateList});
    }
    hasPendingItems(){
        return _.filter(this.state.updateList, {status: ""}).length > 0;
    }

    render(){
        return <UpdateList updates = {this.state.updateList}
                           onupdate = {(items) => this.handleFieldUpdate(items)}
                           onundoupdate = {(items) => this.handleFieldUndoUpdate(items)}
                           onignore = {(items) => this.handleFieldIgnore(items)}
                           onundoignore = {(items) => this.handleFieldUndoIgnore(items)}/>
    }
}