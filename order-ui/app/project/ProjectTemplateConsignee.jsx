import React from 'react';
import _ from 'lodash';
import uuid from 'uuid';

import {Grid, GridCell, CardHeader} from 'susam-components/layout'
import {Form, Button, DropDown, Notify} from 'susam-components/basic'
import {TranslatingComponent} from 'susam-components/abstract'
import {CompanySearchAutoComplete} from 'susam-components/oneorder'
import *  as DataTable from 'susam-components/datatable'

import {Kartoteks} from '../services';

export class ProjectTemplateConsignee extends TranslatingComponent {

    constructor(props){
        super(props);
        this.state = {};
    }

    updateState(key, value){
        let state = _.cloneDeep(this.state);
        state[key] = value;
        this.setState(state);
    }

    handleUnloadingCompanySelect(company){
        Kartoteks.getCompanyLocations(company.id).then(response => {
            this.setState({unloadingCompany: company, locations: response.data});
        }).catch(error => {
            Notify.showError(error);
        })
    }
    handleSetUnloadingAsConsigneeCompany(){
        if(this.state.consigneeCompany){
            this.handleUnloadingCompanySelect(this.state.consigneeCompany);
        }
    }
    handleSetConsigneeAsCustomerCompany(){
        if(this.props.project.customer){
            this.updateState("consigneeCompany", this.props.project.customer);
        }
    }

    validateConsignee(consignee){
        if(this.props.consignees && this.props.consignees.length > 0){
            let found = _.find(this.props.consignees, {
                consigneeCompany: {id: consignee.consigneeCompany.id},
                unloadingCompany: {id: consignee.unloadingCompany.id},
                unloadingLocation: {id: consignee.unloadingLocation.id}
            });
            return !found;
        }
        return true;
    }

    handleClickAddConsignee(){
        if(!this.form.validate()){
            return;
        }
        let consignee = {
            _key: uuid.v4(),
            consigneeCompany: this.state.consigneeCompany,
            unloadingCompany: this.state.unloadingCompany,
            unloadingLocation: this.state.unloadingLocation
        };
        if(!this.validateConsignee(consignee)){
            Notify.showError("Consignee with same details is already on list");
            return;
        }
        let consignees = _.cloneDeep(this.props.consignees) || [];
        consignees.push(consignee);
        this.setState({consigneeCompany: null, unloadingCompany: null, unloadingLocation: null, locations: null}, () => {
            this.props.onChange  && this.props.onChange(consignees);
        });
    }
    handleClickDeleteConsignee(consignee){
        let consignees = _.cloneDeep(this.props.consignees) || [];
        _.remove(consignees, {_key: consignee._key});
        this.props.onChange  && this.props.onChange(consignees);
    }

    renderConsigneeList(){
        return (
            <DataTable.Table data={this.props.consignees}>
                <DataTable.Truncated field="consigneeCompany.name" header="Consignee Company" wordCount = {2}/>
                <DataTable.Truncated field="unloadingCompany.name" header="Unloading Company" wordCount = {2}/>
                <DataTable.Truncated field="unloadingLocation.name" header="Unloading location" wordCount = {2}/>
                <DataTable.ActionColumn >
                    <DataTable.ActionWrapper track="onclick"
                                             onaction={(data) => {this.handleClickDeleteConsignee(data)}}>
                        <Button label="Delete" flat={true} style="danger" size="small"/>
                    </DataTable.ActionWrapper>
                </DataTable.ActionColumn>
            </DataTable.Table>
        );
    }

    render(){
        return(
            <GridCell width = "1-1">
                <CardHeader title = "Consignees & Locations" />
                <Form ref = {c => this.form = c}>
                    <Grid>
                        <GridCell width = "2-3">
                            <CompanySearchAutoComplete label = "Consignee Company" value = {this.state.consigneeCompany}
                                                       required = {true}
                                                       onchange = {(value) => this.updateState("consigneeCompany", value)} />
                        </GridCell>
                        <GridCell width = "1-3">
                            <div className = "uk-margin-top">
                                <Button label="use customer" flat = {true} size = "small" style = "success"
                                        onclick = {() => this.handleSetConsigneeAsCustomerCompany()} />
                            </div>
                        </GridCell>
                        <GridCell width = "2-3">
                            <CompanySearchAutoComplete label = "Unloading Company" value = {this.state.unloadingCompany}
                                                       required = {true}
                                                       onchange = {(value) => this.handleUnloadingCompanySelect(value)} />
                        </GridCell>
                        <GridCell width = "1-3">
                            <div className = "uk-margin-top">
                                <Button label="use consignee company" flat = {true} size = "small" style = "success"
                                        onclick = {() => this.handleSetUnloadingAsConsigneeCompany()} />
                            </div>
                        </GridCell>
                        <GridCell width = "2-3">
                            <DropDown label = "Unloading Location" options = {this.state.locations}
                                      emptyText = "No locations..." uninitializedText = "Select unloading company..."
                                      value = {this.state.unloadingLocation} required = {true}
                                      onchange = {(value) => this.updateState("unloadingLocation", value)} />
                        </GridCell>
                        <GridCell width = "1-3">
                            <div className = "uk-margin-top">
                                <Button label="add" style="primary" size = "small" flat = {true}
                                        onclick = {() => this.handleClickAddConsignee()} />
                            </div>
                        </GridCell>
                    </Grid>
                </Form>
                <Grid>
                    <GridCell width = "1-1">
                        {this.renderConsigneeList()}
                    </GridCell>
                </Grid>
            </GridCell>
        );
    }

}