import React from 'react';
import _ from 'lodash';
import uuid from 'uuid';

import {Grid, GridCell, CardHeader} from 'susam-components/layout'
import {Form, Button, DropDown, Notify} from 'susam-components/basic'
import {TranslatingComponent} from 'susam-components/abstract'
import {CompanySearchAutoComplete} from 'susam-components/oneorder'
import *  as DataTable from 'susam-components/datatable'

import {Kartoteks} from '../services';

export class ProjectTemplateSender extends TranslatingComponent {

    constructor(props){
        super(props);
        this.state = {};
    }

    updateState(key, value){
        let state = _.cloneDeep(this.state);
        state[key] = value;
        this.setState(state);
    }

    handleLoadingCompanySelect(company){
        Kartoteks.getCompanyLocations(company.id).then(response => {
            this.setState({loadingCompany: company, locations: response.data});
        }).catch(error => {
            Notify.showError(error);
        })
    }
    handleSetLoadingAsSenderCompany(){
        if(this.state.senderCompany){
            this.handleLoadingCompanySelect(this.state.senderCompany);
        }
    }
    handleSetSenderAsCustomerCompany(){
        if(this.props.project.customer){
            this.updateState("senderCompany", this.props.project.customer);
        }
    }

    validateSender(sender){
        if(this.props.senders && this.props.senders.length > 0){
            let found = _.find(this.props.senders, {
                senderCompany: {id: sender.senderCompany.id},
                loadingCompany: {id: sender.loadingCompany.id},
                loadingLocation: {id: sender.loadingLocation.id}
            });
            return !found;
        }
        return true;
    }

    handleClickAddSender(){
        if(!this.form.validate()){
            return;
        }
        let sender = {
            _key: uuid.v4(),
            senderCompany: this.state.senderCompany,
            loadingCompany: this.state.loadingCompany,
            loadingLocation: this.state.loadingLocation
        };
        if(!this.validateSender(sender)){
            Notify.showError("Sender with same details is already on list");
            return;
        }
        let senders = _.cloneDeep(this.props.senders) || [];
        senders.push(sender);
        this.setState({senderCompany: null, loadingCompany: null, loadingLocation: null, locations: null}, () => {
            this.props.onChange  && this.props.onChange(senders);
        });
    }
    handleClickDeleteSender(sender){
        let senders = _.cloneDeep(this.props.senders) || [];
        _.remove(senders, {_key: sender._key});
        this.props.onChange  && this.props.onChange(senders);
    }

    renderSenderList(){
        return (
            <DataTable.Table data={this.props.senders}>
                <DataTable.Truncated field="senderCompany.name" header="Sender Company" wordCount = {2}/>
                <DataTable.Truncated field="loadingCompany.name" header="Loading Company" wordCount = {2}/>
                <DataTable.Truncated field="loadingLocation.name" header="Loading location" wordCount = {2}/>
                <DataTable.ActionColumn >
                    <DataTable.ActionWrapper track="onclick"
                                             onaction={(data) => {this.handleClickDeleteSender(data)}}>
                        <Button label="Delete" flat={true} style="danger" size="small"/>
                    </DataTable.ActionWrapper>
                </DataTable.ActionColumn>
            </DataTable.Table>
        );
    }

    render(){
        return(
            <GridCell width = "1-1">
                <CardHeader title = "Senders & Locations" />
                <Form ref = {c => this.form = c}>
                    <Grid>
                        <GridCell width = "2-3">
                            <CompanySearchAutoComplete label = "Sender Company" value = {this.state.senderCompany}
                                                       required = {true}
                                                       onchange = {(value) => this.updateState("senderCompany", value)} />
                        </GridCell>
                        <GridCell width = "1-3">
                            <div className = "uk-margin-top">
                                <Button label="use customer" flat = {true} size = "small" style = "success"
                                        onclick = {() => this.handleSetSenderAsCustomerCompany()} />
                            </div>
                        </GridCell>
                        <GridCell width = "2-3">
                            <CompanySearchAutoComplete label = "Loading Company" value = {this.state.loadingCompany}
                                                       required = {true}
                                                       onchange = {(value) => this.handleLoadingCompanySelect(value)} />
                        </GridCell>
                        <GridCell width = "1-3">
                            <div className = "uk-margin-top">
                                <Button label="use sender company" flat = {true} size = "small" style = "success"
                                        onclick = {() => this.handleSetLoadingAsSenderCompany()} />
                            </div>
                        </GridCell>
                        <GridCell width = "2-3">
                            <DropDown label = "Loading Location" options = {this.state.locations}
                                      emptyText = "No locations..." uninitializedText = "Select loading company..."
                                      value = {this.state.loadingLocation} required = {true}
                                      onchange = {(value) => this.updateState("loadingLocation", value)} />
                        </GridCell>
                        <GridCell width = "1-3">
                            <div className = "uk-margin-top">
                                <Button label="add" style="primary" size = "small" flat = {true}
                                        onclick = {() => this.handleClickAddSender()} />
                            </div>
                        </GridCell>
                    </Grid>
                </Form>
                <Grid>
                    <GridCell width = "1-1">
                        {this.renderSenderList()}
                    </GridCell>
                </Grid>
            </GridCell>
        );
    }

}