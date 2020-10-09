import React from "react";
import _ from "lodash";
import * as axios from "axios";
import uuid from "uuid";
import {UpdateList} from '../account-merge/UpdateList';
import {UpdateListPopulator} from '../account-merge/UpdateListPopulator';

import {TranslatingComponent} from 'susam-components/abstract';

export class AccountUpdateList extends TranslatingComponent {
    state = {
        updateList: []
    };
    constructor(props) {
        super(props);
    }
    componentDidMount(){
        this.populateUpdatesList(this.props.current, this.props.updated, this.props.original);
    }
    componentWillReceiveProps(nextProps){
        console.log("ddd")
        this.populateUpdatesList(nextProps.current, nextProps.updated, nextProps.original);
    }

    populateUpdatesList(accountToMerge, accountToEdit, accountOriginal){
        if(!(accountToEdit && accountToMerge && accountOriginal)){
            return;
        }
        let config = [
            {fieldToCompare: "accountOwner", label: "Account Owner"},
            {fieldToCompare: "accountType", label: "Account Type", valueToPrint: val=>_.get(val, 'name')},
            {fieldToCompare: "segment", label: "Segment", valueToPrint: val=>_.get(val, 'name')}
        ];

        let populator = new UpdateListPopulator(accountToMerge, accountToEdit, accountOriginal);
        let updateList = populator.populate(config);
        if(updateList){
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
        console.log("items", items)
        console.log("newStatus", newStatus)
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