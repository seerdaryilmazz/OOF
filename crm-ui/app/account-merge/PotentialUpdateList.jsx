
import React from "react";
import _ from "lodash";
import uuid from "uuid";

import {TranslatingComponent} from 'susam-components/abstract';
import {UpdateList} from './UpdateList';
import {UpdateListPopulator} from './UpdateListPopulator';

export const PotentialUpdateConfig = [
    {fieldToCompare: "fromCountry.countryName",fieldToCopy: "fromCountry", label: "From Country"},
    {fieldToCompare: "fromCountryPoint.name", fieldToCopy: "fromCountryPoint", label: "From Postal"},
    {fieldToCompare: "toCountry.countryName", fieldToCopy: "toCountry", label: "To Country"},
    {fieldToCompare: "toCountryPoint.name", fieldToCopy: "toCountryPoint", label: "To Postal"},
    {fieldToCompare: "shipmentLoadingType.code", fieldToCopy: "shipmentLoadingType", label: "FTL/LTL"},
    {fieldToCompare: "frequencyType", fieldToCopy: "frequencyType", label: "Frequency Type"},
    {fieldToCompare: "frequency", label: "Frequency"},
    {fieldToCompare: "", fieldToCopy: "", label: "Type"},
    {fieldToCompare: "createdBy", label: "Created By"},
    {fieldToCompare: "createdAt", fieldToCopy: "createdAt", label: "Created At"},


];

export class PotentialUpdateList extends TranslatingComponent {

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
    populateUpdatesList(potentialToEdit, potentialToMerge, potentialOriginal){
        if(!(potentialToEdit && potentialToMerge && potentialOriginal)){
            return;
        }

        let populator = new UpdateListPopulator(potentialToEdit, potentialToMerge, potentialOriginal);
        let updateList = populator.populate(PotentialUpdateConfig);
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