import React from "react";
import _ from "lodash";
import uuid from 'uuid';
import * as axios from "axios";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, CardHeader, Loader} from "susam-components/layout";
import {Notify, TextInput, Button, DropDown, Span, Checkbox} from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';

import {SalesboxService} from '../services';

import {RegionModal} from './RegionModal';

export class Regions extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            ready: false
        };
    }

    componentDidMount() {
        this.loadRegions();
    }

    loadRegions() {
        this.findRegions((response) => {
            this.setState({regions: response.data, ready: true});
        });
    }

    findRegions(callback) {
        SalesboxService.findRegions().then(response => {
            callback(response);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    findRegion(id, callback) {
        SalesboxService.findRegion(id).then(response => {
            callback(response);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    saveRegion(data, callback) {
        SalesboxService.saveRegion(data).then(response => {
            callback(response);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    deleteRegion(id, callback) {
        SalesboxService.deleteRegion(id).then(response => {
            callback(response);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    setSelectedData(data, key) {
        this.setState({selectedData: data, keyForSelectedData: key});
    }

    addNew() {
        this.setSelectedData({}, uuid.v4());
    }

    edit(data) {
        this.findRegion(data.id, (response) => {
            this.setSelectedData(response.data, uuid.v4());
        });
    }

    delete(data) {
        Notify.confirm("Are you sure?", () => {
            this.deleteRegion(data.id, (response) => {
                this.loadRegions();
            });
        });
    }

    save(data) {
        this.saveRegion(data, (response) => {
            Notify.showSuccess("Region saved.");
            this.setSelectedData(null, null);
            this.loadRegions();
        });
    }

    renderRegions() {

        let regions = this.state.regions;

        if (_.isEmpty(regions)) {
            return null;
        } else {

            let components = [];

            regions.forEach((region) => {
                components.push(
                    <GridCell width="1-1" key={uuid.v4()}>
                        <Card>
                            <Grid>
                                <GridCell width="1-2" noMargin={true}>
                                    {region.name}
                                </GridCell>
                                <GridCell width="1-2" noMargin={true}>
                                    <div className="uk-align-right">
                                        <Button label="Edit" style="success" flat={true} size="small" onclick={() => this.edit(region)}/>
                                        <Button label="Delete" style="danger" flat={true} size="small" onclick={() => this.delete(region)}/>
                                    </div>
                                </GridCell>
                                <GridCell width="1-1" noMargin={true}>
                                    <DataTable.Table data={_.sortBy(region.countryRegions, ["country.name"])}>
                                        <DataTable.Text header="Country Name" field="country.name" width={15}/>
                                        <DataTable.Text header="Country Iso" field="country.iso" width={5}/>
                                        <DataTable.Text header="Postal Codes" field="postalCodes" printer={new PostalCodesPrinter()}/>
                                    </DataTable.Table>
                                </GridCell>
                            </Grid>
                        </Card>
                    </GridCell>
                );
            });

            return components;
        }
    }

    renderModal() {
        if (!_.isNil(this.state.selectedData)) {
            return (
                <RegionModal key={this.state.keyForSelectedData}
                             data={this.state.selectedData}
                             onSave={(data) => this.save(data)}
                             onCancel={() => this.setSelectedData(null, null)}/>
            );
        } else {
            return null;
        }
    }

    render() {

        if (!this.state.ready) {
            return null;
        }

        return (
            <Grid>
                <GridCell width="1-1">
                    <PageHeader title="Regions"/>
                </GridCell>
                <GridCell width="1-1">
                    <div className="uk-align-right">
                        <Button label="New Region" style="success" onclick={() => this.addNew()}/>
                    </div>
                </GridCell>
                {this.renderRegions()}
                {this.renderModal()}
            </Grid>
        );
    }
}

class PostalCodesPrinter {
    print(data) {
        let str = "";
        let postalCodeObjects = data;
        if (!_.isNil(postalCodeObjects)) {
            let postalCodes = [];
            postalCodeObjects = _.sortBy(postalCodeObjects, ["code"]);
            postalCodeObjects.forEach((elem) => {
                postalCodes.push(elem.code);
            });
            str = postalCodes.join(",");
        }
        return str;
    }
}

