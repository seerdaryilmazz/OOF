import React from "react";
import _ from "lodash";
import uuid from "uuid";
import * as axios from "axios";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, CardHeader, Loader} from "susam-components/layout";
import {Notify, TextInput, Button, DropDown, Checkbox, CheckboxGroup, Span, Form} from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';

import {CustomsLocation} from './CustomsLocation';
import {LocationService} from '../../../services/LocationService';

import {PhoneNumberUtils} from 'susam-components/utils';

export class CustomsLocationList extends TranslatingComponent {

    state = {
        info: {
            active: true
        }
    };

    componentDidMount(){
        this.initializeState(this.props);
        this.initialize();
    }
    componentWillReceiveProps(nextProps){
        this.initializeState(nextProps);
    }
    initialize() {
        LocationService.retrieveCountries().then(response => {
            this.setState({countries: response.data});
        }).catch((error) => {
            Notify.showError(error);
        });
    }
    initializeState(props) {
        if (!props.data) {
            return;
        }
        let state = _.cloneDeep(this.state);
        state.locations = _.cloneDeep(props.data.locations);
        state.country = _.cloneDeep(props.data.country);
        this.setState(state);
    }
    updateState(key, value) {
        let locationToEdit = _.cloneDeep(this.state.locationToEdit);
        _.set(locationToEdit, key, value);
        this.setState({locationToEdit: locationToEdit});
    }

    handleClickEdit(location){
        this.setState({locationToEdit: location});
    }
    handleClickDelete(location){
        UIkit.modal.confirm("Are you sure ?", () => this.handleDelete(location));
    }
    handleDelete(location){
        let locations = _.cloneDeep(this.state.locations);
        _.remove(locations, {_key: location._key});
        this.setState({locations: locations});
    }
    handleNewLocationClick(){
        this.setState({
            locationToEdit: {
                active: true,
                country: this.state.country,
                phoneNumbers: [],
            }
        });
    }
    handleCancelLocation(){
        this.setState({locationToEdit: null});
    }
    handleSaveLocation(data){
        let location = _.cloneDeep(data);
        let locations = [];
        if(location._key){
            locations = this.updateLocation(location);
        }else{
            locations = this.addLocation(location);
        }
        this.setState({locations: locations, locationToEdit: null});
    }

    addLocation(location){
        let locations = _.cloneDeep(this.state.locations);
        location._key = uuid.v4();
        locations.push(location);
        return locations;
    }
    updateLocation(location){
        let locations = _.cloneDeep(this.state.locations);
        let index = _.findIndex(locations, {_key: location._key});
        if(index >= 0){
            locations[index] = location;
        }
        return locations;
    }

    next() {
        return new Promise(
            (resolve, reject) => {
                let locations = _.cloneDeep(this.state.locations);
                if(locations.length === 0){
                    Notify.showError("There should be at least one location");
                    reject(false);
                    return;
                }
                if(this.state.locationToEdit){
                    Notify.showError("Please save the location you are editing");
                    reject(false);
                    return;
                }
                this.props.handleSave && this.props.handleSave(locations);
                resolve(true);
            });
    }
    renderLocationEdit(){
        return(
            <Grid>
                <GridCell width="1-1">
                    <CustomsLocation place={this.state.locationToEdit}
                                     ref = {c => this.placeLocation = c}
                                     locations = {this.state.locations}
                                     onSave = {data => this.handleSaveLocation(data)}
                                     onCancel = {() => this.handleCancelLocation()}>
                    </CustomsLocation>
                </GridCell>
            </Grid>
        );
    }
    render() {
        if (!this.state.locations || !this.state.countries) {
            return <Loader title="Fetching location data"/>;
        }

        if(this.state.locationToEdit){
            return this.renderLocationEdit();
        }

        return (
            <Grid>
                <GridCell width="1-1">
                    <CardHeader title="Locations"/>
                </GridCell>
                <GridCell width="1-1">
                    <div className = "uk-align-right">
                        <Button label="New Location" flat = {true} size = "small" style = "success"
                                onclick = {() => this.handleNewLocationClick()} />
                    </div>
                </GridCell>
                <GridCell width="1-1">
                    <Grid>
                        <GridCell width="1-1" noMargin={true}>
                            <DataTable.Table data={this.state.locations} filterable={false} sortable={true} insertable={false}
                                             editable={false}>
                                <DataTable.Text width="20" field="name" header="Name"/>
                                <DataTable.Text width="20" field="localName" header="Local Name" />
                                <DataTable.Bool width="10" field="office" header="Office"/>
                                <DataTable.Text width="10" header="Phone Numbers"
                                                reader = {new PhoneNumberListReader()}
                                                printer={new ListPrinter()} />
                                <DataTable.Text width="10" field="postalCode" header="Postal Code" />
                                <DataTable.Bool width="10" field="active" header="Active" />

                                <DataTable.ActionColumn width="20">
                                    <DataTable.ActionWrapper track="onclick"
                                                             onaction={(data) => this.handleClickEdit(data)}>
                                        <Button label="Edit" flat={true} style="success" size="small"/>
                                    </DataTable.ActionWrapper>
                                    <DataTable.ActionWrapper track="onclick"
                                                             onaction={(data) => this.handleClickDelete(data)}>
                                        <Button label="Delete" flat={true} style="danger" size="small"/>
                                    </DataTable.ActionWrapper>
                                </DataTable.ActionColumn>
                            </DataTable.Table>
                        </GridCell>
                    </Grid>
                </GridCell>
            </Grid>
        );
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
        if(row.phoneNumbers){
            row.phoneNumbers.forEach(item => {
                let phoneNumber = item.phoneNumber;
                if(phoneNumber){
                    formattedPhones.push(PhoneNumberUtils.format(phoneNumber));
                }
            });
        }

        return formattedPhones;
    };

    readSortValue(row) {
        return "";
    };
}