import React from "react";
import _ from "lodash";
import * as axios from "axios";
import uuid from "uuid";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, CardHeader, Loader} from "susam-components/layout";
import {Notify, TextInput, Button, DropDown, Checkbox, Span, Form} from 'susam-components/basic';
import {UpdateList} from '../UpdateList';
import {UpdateListPopulator} from '../UpdateListPopulator';

export class CompanyGeneralUpdateList extends TranslatingComponent {

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

    populateUpdatesList(companyToEdit, companyToMerge, companyOriginal){
        if(!(companyToEdit && companyToMerge && companyOriginal)){
            return;
        }
        let config = [
            {fieldToCompare: "name", label: "Name"},
            {fieldToCompare: "localName", label: "Local Name"},
            {fieldToCompare: "ownedByEkol", label: "Owned by Ekol"},
            {fieldToCompare: "country.countryName", fieldToCopy: "country", label: "Country"},
            {fieldToCompare: "website", label: "Website"},
            {fieldToCompare: "type.code", fieldToCopy:"type", label: "Company Type"},
            {fieldToCompare: "taxOffice", fieldToCopy:"taxOffice", label: "Tax Office", relatedFields: ["taxOfficeCode"],
                valueToCompare: (item) => {
                    return item ? item.id : "";
                },
                valueToPrint: (item) => {
                    return item ? item.name : "";
                }
            },
            {fieldToCompare: "taxOfficeCode", fieldToCopy: "taxOfficeCode" , label:"Tax Office Code", relatedFields: ["taxOffice"], notVisible:true },
            {fieldToCompare: "taxId", label: "Tax ID"},
            {fieldToCompare: "identityNumber", label: "TCKN"},
            {fieldToCompare: "eoriNumber", label: "EORI Number"},
            {fieldToCompare: "customsCode", label: "Customs Code"},
            {fieldToCompare: "portfolioOwner", label: "Portfolio Owner"}
        ];

        let populator = new UpdateListPopulator(companyToEdit, companyToMerge, companyOriginal);
        let updateList = populator.populate(config);
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
    getIgnoredItems(){
        return _.filter(this.state.updateList, {status: "IGNORED"});
    }

    render(){
        return <UpdateList updates = {this.state.updateList}
                           onupdate = {(items) => this.handleFieldUpdate(items)}
                           onundoupdate = {(items) => this.handleFieldUndoUpdate(items)}
                           onignore = {(items) => this.handleFieldIgnore(items)}
                           onundoignore = {(items) => this.handleFieldUndoIgnore(items)}/>
    }
}