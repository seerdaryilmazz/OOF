import React from "react";
import _ from "lodash";
import * as axios from 'axios';
import uuid from 'uuid';

import {Grid, GridCell, CardHeader, Card, Modal} from 'susam-components/layout'
import {Span, Button, Notify, DropDown, Form} from 'susam-components/basic'
import {TranslatingComponent} from 'susam-components/abstract'
import {CompanySearchAutoComplete} from 'susam-components/oneorder'
import * as DataTable from 'susam-components/datatable';

import {Kartoteks, LocationService} from "../services";
import {convertLocationsWithPostalCodes} from "../Helper";

export class CompanyLocationList extends TranslatingComponent{

    state = {locationToEdit: {}};

    componentDidMount(){
        if(this.props.data.locations.length > 0){
            this.setState({locationToEdit: {}});
        }
    }

    updateState(key, value){
        let locationToEdit = _.cloneDeep(this.state.locationToEdit);
        locationToEdit[key] = value;
        this.setState({locationToEdit: locationToEdit});
    }
    updateLocationCompany(value){
        let locationToEdit = _.cloneDeep(this.state.locationToEdit);
        locationToEdit.company = value;
        this.setState({locationToEdit: locationToEdit}, () => this.loadLocations());
    }

    loadLocations(){
        let companyType = _.get(this.state, 'locationToEdit.company.type' );
        let call = null;
        if(companyType === 'COMPANY'){
            call = ()=>Kartoteks.getCompanyLocations(this.state.locationToEdit.company.id);
        } else if(companyType === 'CUSTOMS'){
            call = ()=>LocationService.getCustomsOfficeLocations(this.state.locationToEdit.company.id);
        }

        call().then(response => {
            this.setState({companyLocations: response.data.map(item => convertLocationsWithPostalCodes(item))});
        }).catch(error => Notify.showError(error));
    }

    handleClickUseParty(){
        let company = _.cloneDeep(this.props.data.company);
        _.set(company, 'type', 'COMPANY');
        this.updateLocationCompany(company);
    }
    handleSaveLocation(){
        if(!this.form.validate()){
            return;
        }
        let itemWithSameLocation =
            _.find(this.props.data.locations, item => item.location.id === this.state.locationToEdit.location.id);

        if(itemWithSameLocation){
            Notify.showError("This location already exists in location list");
            return;
        }

        this.props.onSave(this.state.locationToEdit);
        this.setState({locationToEdit: {}, companyLocations: []});
    }


    handleLocationEditClick(value){
        this.setState({locationToEdit: value}, () => this.loadLocations());
    }
    handleLocationDeleteClick(value){
        Notify.confirm("Are you sure?", () => {
            this.props.onDelete(value);
        });
    }

    renderLocationsForm(){
        if(this.props.readOnly){
            return null;
        }
        let buttonTitle = this.props.isSender ? "Use Sender" : "Use Consignee";
        return(
            <Form ref = {c => this.form = c}>
                <Grid>
                    <GridCell width = "1-4">
                        <CompanySearchAutoComplete label = "Company" required = {true}
                                                    sources={["COMPANY","CUSTOMS"]}
                                                   value = {this.state.locationToEdit.company}
                                                   onchange = {(value) => this.updateLocationCompany(value)} />
                    </GridCell>
                    <GridCell width = "1-4">
                        <div className = "uk-margin-top">
                            <Button label = {buttonTitle} style = "success" size = "small"  flat = {true}
                                    onclick = {() => this.handleClickUseParty()} />
                        </div>
                    </GridCell>
                    <GridCell width = "1-4">
                        <DropDown label = "Location" required = {true}
                              options = {this.state.companyLocations}
                              value = {this.state.locationToEdit.location}
                              onchange = {value => this.updateState("location", value)} />
                    </GridCell>
                    <GridCell width = "1-4">
                        <Button label = "save" style = "success" size = "small" onclick = {() => this.handleSaveLocation()} />
                    </GridCell>
                </Grid>
            </Form>
        );
    }
    renderLocationsTable(){
        return(
            <DataTable.Table data={this.props.data.locations}>
                <DataTable.Text width="30" header="Company" field = "company.name"/>
                <DataTable.Text width="30" header="Location" field = "location.name"/>
                <DataTable.ActionColumn >
                    <DataTable.ActionWrapper track="onclick" shouldRender = {() => !this.props.readOnly}
                                             onaction={(value) => {this.handleLocationEditClick(value)}}>
                        <Button label="Edit" flat={true} style="success" size="small" hidden = {this.props.readOnly}/>
                    </DataTable.ActionWrapper>
                    <DataTable.ActionWrapper track="onclick" shouldRender = {() => !this.props.readOnly}
                                             onaction={(value) => {this.handleLocationDeleteClick(value)}}>
                        <Button label="Delete" flat={true} style="danger" size="small" hidden = {this.props.readOnly}/>
                    </DataTable.ActionWrapper>
                </DataTable.ActionColumn>
            </DataTable.Table>
        );
    }
    render(){
        if(!this.props.data){
            return null;
        }

        return(
            <Grid>
                <GridCell width = "1-1" noMargin = {true}>
                    {this.renderLocationsForm()}
                </GridCell>
                <GridCell width = "1-1" noMargin = {true}>
                    {this.renderLocationsTable()}
                </GridCell>
            </Grid>
        );
    }
}