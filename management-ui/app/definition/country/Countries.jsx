import React from "react";
import _ from "lodash";
import uuid from 'uuid';
import * as axios from "axios";

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card, Loader, CardHeader, PageHeader} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown, Form} from "susam-components/basic";
import * as DataTable from 'susam-components/datatable';

import {LocationService} from "../../services";
import {Country} from "./Country";

export class Countries extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            countries: []
        };
    }

    componentDidMount() {
        this.getCountries((countries) => {
            this.setState({countries: this.sortCountries(countries)});
        });
    }

    getCountries(callback) {
        LocationService.retrieveCountries().then(response => {
            callback(response.data);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    sortCountries(countries) {
        return _.sortBy(countries, ["name"]);
    }

    handleCreateNewClick() {
        this.countryComponentReference.open(null);
    }

    handleEditClick(data) {
        this.countryComponentReference.open(data);
    }

    handleDeleteClick(data) {
        Notify.confirm("Are you sure?", () => {
            LocationService.deleteCountry(data.id).then(response => {
                Notify.showSuccess("Country deleted.");
                let countries = _.cloneDeep(this.state.countries);
                _.remove(countries, (elem) => {
                    return elem.id == data.id;
                });
                this.setState({countries: countries});
            }).catch(error => {
                Notify.showError(error);
            });
        });
    }

    onCountrySave(country) {
        this.getCountries((countries) => {
            this.setState({countries: this.sortCountries(countries)});
        });
    }

    render() {
        return (
            <Grid>
                <GridCell width="1-1">
                    <PageHeader title="Countries"/>
                </GridCell>
                <GridCell width="1-1">
                    <Card toolbarItems={[{icon:"plus", action: () => this.handleCreateNewClick()}]}>
                        <Grid>
                            <GridCell width="1-1" noMargin={true}>
                                <DataTable.Table data={this.state.countries} filterable={true}>
                                    <DataTable.Text header="Name" field="name"/>
                                    <DataTable.Text header="ISO Code" field="iso"/>
                                    <DataTable.Text header="Phone Code" field="phoneCode"/>
                                    <DataTable.Text header="Currency" field="currency"/>
                                    <DataTable.Bool header="EU Member" field="euMember"/>
                                    <DataTable.ActionColumn>
                                        <DataTable.ActionWrapper track="onclick" onaction={(data) => {this.handleEditClick(data)}}>
                                            <Button label="Edit" flat={true} style="success" size="small"/>
                                        </DataTable.ActionWrapper>
                                        <DataTable.ActionWrapper track="onclick" onaction={(data) => {this.handleDeleteClick(data)}}>
                                            <Button label="Delete" flat={true} style="danger" size="small"/>
                                        </DataTable.ActionWrapper>
                                    </DataTable.ActionColumn>
                                </DataTable.Table>
                            </GridCell>
                        </Grid>
                    </Card>
                </GridCell>
                <GridCell width="1-1">
                    <Country ref={(c) => this.countryComponentReference = c} onSave={(country) => this.onCountrySave(country)}/>
                </GridCell>
            </Grid>
        );
    }
}

Countries.contextTypes = {
    router: React.PropTypes.object.isRequired
};