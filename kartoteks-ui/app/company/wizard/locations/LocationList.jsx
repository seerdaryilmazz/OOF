import React from "react";
import _ from "lodash";
import uuid from 'uuid';

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, CardHeader, Wizard, Modal} from "susam-components/layout";
import {Notify, TextInput, Button, DropDown, RadioButton, Span, Form} from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';

import {PhoneNumberUtils} from '../../../utils/';
import {CompanyService} from '../../../services/KartoteksService';

export class LocationList extends TranslatingComponent {

    constructor(props){
        super(props);
        this.state = {};
    }

    componentDidMount() {

    }
    componentWillReceiveProps(nextProps){

    }
    handleAddLocationClick(value){
        this.props.onadd && this.props.onadd(value);
    }
    handleMergeLocationClick(value){
        if (_.isNil(value.id)) {
            this.setState({locationToMerge: value});
            this.mergeModal.open();
        } else {
            // Seçilen lokasyon, diğer lokasyon ile birleştirilip silineceği için birleştirme adımına geçmeden önce kullanıcıyı uyaralım dedik.
            CompanyService.ensureLocationCanBeDeleted(value.id).then(response => {
                this.setState({locationToMerge: value});
                this.mergeModal.open();
            }).catch(error => {
                Notify.showError(error);
            });
        }
    }
    handleReviewLocationClick(value){
        let locationToEdit = _.find(this.props.mergeOptions, {id: value.id});
        this.props.onreview && this.props.onreview(locationToEdit, value);
    }
    handleMergeLocationSelect(){
        this.mergeModal.close();
        this.props.onmerge && setTimeout(() => this.props.onmerge(this.state.locationToEdit, this.state.locationToMerge), 500);
    }
    handleEditLocationClick(value){
        this.props.onedit && this.props.onedit(value);
    }
    handleDeleteLocationClick(value){
        UIkit.modal.confirm("Are you sure?", () => {
            if (_.isNil(value.id)) {
                this.props.ondelete && this.props.ondelete(value);
            } else {
                CompanyService.ensureLocationCanBeDeleted(value.id).then(response => {
                    this.props.ondelete && this.props.ondelete(value);
                }).catch(error => {
                    Notify.showError(error);
                });
            }
        });
    }
    handleSelectMergeLocationSelect(item){
        this.setState({locationToEdit: item});
    }


    render(){
        let actions = [];
        if(this.props.showAddButton) {
            actions.push(
                <DataTable.ActionWrapper key="add" track="onclick" onaction={(data) => this.handleAddLocationClick(data)}>
                    <Button label="add" flat={true} style="primary" size="small"/>
                </DataTable.ActionWrapper>
            );
        }
        if(this.props.showMergeButton){
            actions.push(
                <DataTable.ActionWrapper key="merge" track="onclick" onaction = {(data) => this.handleMergeLocationClick(data)}>
                    <Button icon="compress" size="small" tooltip="merge"/>
                </DataTable.ActionWrapper>
            );
        }
        if(this.props.showEditButton){
            actions.push(
                <DataTable.ActionWrapper key="edit" track="onclick" onaction = {(data) => this.handleEditLocationClick(data)}>
                    <Button icon="pencil" size="small" tooltip="edit"/>
                </DataTable.ActionWrapper>
            );
        }
        if(this.props.showDeleteButton){
            actions.push(
                <DataTable.ActionWrapper key="delete" track="onclick" onaction = {(data) => this.handleDeleteLocationClick(data)}>
                    <Button icon="close" size="small" tooltip="delete"/>
                </DataTable.ActionWrapper>
            );
        }
        if(this.props.showReviewButton){
            actions.push(
                <DataTable.ActionWrapper key="review" track="onclick" onaction = {(data) => this.handleReviewLocationClick(data)}>
                    <Button label="review" flat = {true} style="primary" size="small"/>
                </DataTable.ActionWrapper>
            );
        }

        let locationsToMerge = [];
        if(this.props.mergeOptions){
            let mergeOptions = _.cloneDeep(this.props.mergeOptions);
            if(this.state.locationToMerge){
                _.remove(mergeOptions, {_key: this.state.locationToMerge._key});
            }
            locationsToMerge = mergeOptions.map(item => {
                let selectedClassName = this.state.locationToEdit && this.state.locationToEdit._key == item._key ? "md-bg-light-blue-50" : "";
                return(
                    <li key = {item._key} className={selectedClassName} style = {{cursor: 'pointer'}} onClick = {(e) => this.handleSelectMergeLocationSelect(item)}>
                        <div className="md-list-content">
                            <div className="md-list-heading">
                                {item.name}
                            </div>
                            <div className="uk-text-small uk-text-muted">{item.postaladdress ? item.postaladdress.formattedAddress : ""}</div>
                        </div>
                    </li>
                );
            });
        }


        return (
            <div>
                <Grid>
                    <GridCell width="1-1" margin="small">
                        <DataTable.Table data={this.props.locations} title={this.props.title}
                                         editable = {false} insertable = {false} sortable = {true} filterable={false}>
                            <DataTable.Text field="name" header="Name" width="15" sortable = {true} />
                            <DataTable.Text header="Phone Numbers" width="12" reader = {new PhoneNumberListReader()} printer = {new ListPrinter()} />
                            <DataTable.Text field="postaladdress.formattedAddress" header="Address" width="20" sortable = {true} textBreak = {true} printer={new AddressPrinter()}/>
                            <DataTable.Text field="postaladdress.postalCode" header="Postal Code" width="8" sortable = {true} />
                            <DataTable.Text field="postaladdress.district" header="District" width="10" sortable = {true} />
                            <DataTable.Text field="postaladdress.city" header="City" width="10" sortable = {true} />
                            <DataTable.Text field="postaladdress.region" header="Region" width="10" sortable = {true} />
                            <DataTable.ActionColumn width="10">
                                {actions}
                            </DataTable.ActionColumn>
                        </DataTable.Table>
                    </GridCell>
                </Grid>
                <Modal title="Select Merge Location" ref = {(c) => this.mergeModal = c}
                       actions = {[{label:"Close", action:() => this.mergeModal.close()},
                   {label:"select", buttonStyle:"primary", action:() => this.handleMergeLocationSelect()}]}>
                    <Grid>
                        <GridCell width="1-1">
                            <ul className="md-list md-list-centered">
                                {locationsToMerge}
                            </ul>
                        </GridCell>
                    </Grid>
                </Modal>
            </div>
        );
    }
}
class AddressPrinter{
    constructor(){
    }
    print(data){
        if(data.length > 50){
            data = data.substring(0,47) + "...";
        }
        return data;
    }
}
class ListPrinter{
    print(data){
        return data.map(item => <div key={uuid.v4()}>{item}<br/></div>);
    }
}
class PhoneNumberListReader{
    readCellValue(row) {
        let formattedPhones = [];
        row.phoneNumbers.forEach(item => {
            let phoneNumber = item.phoneNumber;
            if(phoneNumber){
                formattedPhones.push(PhoneNumberUtils.format(phoneNumber));
            }
        });
        return formattedPhones;
    };

    readSortValue(row) {
        return "";
    };
}