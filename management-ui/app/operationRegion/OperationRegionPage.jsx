import React from "react";
import _ from "lodash";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, Wizard, Loader, Tab} from "susam-components/layout";
import {Notify, TextInput, Button, Span} from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';

import {ZoneService} from '../services/ZoneService';

export class OperationRegionPage extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            operationRegions: []
        };
    }

    componentDidMount() {
        this.getOperationRegions((operationRegions) => {
            this.setState({operationRegions: operationRegions});
        });
    }

    getOperationRegions(callbackFunction) {
        ZoneService.getOperationRegionListAccordingToQueryTwo().then(response => {
            callbackFunction(response.data);
        }).catch(e => {
            Notify.showError(e);
        });
    }

    handleCreateNewClick() {
        window.location = "/ui/management/operation-region-edit";
    }

    handleEditClick(value) {
        window.location = "/ui/management/operation-region-edit?id=" + value.id;
    }

    handleDeleteClick(value) {
        Notify.confirm("Are you sure you want to delete operation region with name " + value.name + "?", () => {
            ZoneService.deleteOperationRegion(value.id).then(response => {
                Notify.showSuccess("Operation region deleted.");
                this.getOperationRegions((operationRegions) => {
                    this.setState({operationRegions: operationRegions});
                });
            }).catch(e => {
                Notify.showError(e);
            });
        });
    }

    render() {
        return(
            <div>
                <PageHeader title="Operation Regions"/>
                <Card>
                    <Grid>
                        <GridCell width="1-1">
                            <Button label="Create New" style="success" size="small" waves = {true} onclick = {() => this.handleCreateNewClick()} />
                        </GridCell>
                        <GridCell width="1-1">
                            <DataTable.Table data={this.state.operationRegions} sortable = {true}>
                                <DataTable.Text width="20" header="Name" field="name" sortable={true}/>
                                <DataTable.ActionColumn >
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
            </div>
        );
    }
}