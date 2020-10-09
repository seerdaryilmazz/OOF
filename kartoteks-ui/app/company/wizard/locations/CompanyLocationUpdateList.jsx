import React from "react";
import _ from "lodash";
import uuid from "uuid";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, CardHeader, Loader} from "susam-components/layout";
import {Notify, TextInput, Button, DropDown, Checkbox, Span, Form} from 'susam-components/basic';
import {UpdateList} from '../UpdateList';
import {UpdateListPopulator} from '../UpdateListPopulator';
import {PhoneNumberUtils} from '../../../utils/PhoneNumberUtils';

export class CompanyLocationUpdateList extends TranslatingComponent {

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
    printBooleanUpdate(value){
        let className = "uk-icon uk-icon-small ";
        if(value){
            className += "uk-icon-check-square-o";
        }else{
            className += "uk-icon-square-o";
        }
        return <i className={className}/>;
    }
    populateUpdatesList(locationToEdit, locationToMerge, locationOriginal){
        if(!(locationToEdit && locationToMerge)){
            return;
        }
        let config = [
            {fieldToCompare: "default", label: "Is Default",
                valueToCompare: (item) => item,
                valueToPrint: (item) => this.printBooleanUpdate(item)
            },
            {fieldToCompare: "active", label: "Is Active",
                valueToCompare: (item) => item,
                valueToPrint: (item) => this.printBooleanUpdate(item)
            },
            {fieldToCompare: "name", label: "Name"},
            {fieldToCompare: "postaladdress.country.countryName", fieldToCopy: "postaladdress.country", label: "Country"},
            {fieldToCompare: "postaladdress.city", label: "City"},
            {fieldToCompare: "postaladdress.district", label: "District"},
            {fieldToCompare: "postaladdress.region", label: "Region"},
            {fieldToCompare: "postaladdress.postalCode", label: "Postal Code"},
            {fieldToCompare: "postaladdress.streetName", label: "Street Name"},
            {fieldToCompare: "phoneNumbers", fieldToCopy:"phoneNumbers", label: "Phone Numbers",
                valueToCompare: (item) => {
                    if(!item){
                        return "";
                    }
                    return [item.numberType.code, item.default, PhoneNumberUtils.format(item.phoneNumber)].join(":");
                },
                valueToPrint: (item) => {
                    if(!item){
                        return "";
                    }
                    return <div key={uuid.v4()} style={{marginBottom: "8px"}}>
                            <i className="uk-badge" style = {{marginRight: "3px"}}>{item.numberType.code}</i>
                        {item.default ? <i className="uk-badge" style = {{marginRight: "3px"}}>Default</i> : ""}
                        {PhoneNumberUtils.format(item.phoneNumber)}
                        </div>;
                }
            },
            {fieldToCompare: "postaladdress.pointOnMap", fieldToCopy:"postaladdress.pointOnMap", label: "Map Location",
                valueToCompare: (item) => {
                    if(!item){
                        return "";
                    }
                    return [item.lat, item.lng].join(" , ");
                },
                valueToPrint: (item) => {
                    if(!item){
                        return "";
                    }
                    return [item.lat, item.lng].join(" , ");
                }
            }
        ];

        let populator = new UpdateListPopulator(locationToEdit, locationToMerge, locationOriginal);
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

    render(){
        return <UpdateList updates = {this.state.updateList}
                           onupdate = {(items) => this.handleFieldUpdate(items)}
                           onundoupdate = {(items) => this.handleFieldUndoUpdate(items)}
                           onignore = {(items) => this.handleFieldIgnore(items)}
                           onundoignore = {(items) => this.handleFieldUndoIgnore(items)}/>
    }
}