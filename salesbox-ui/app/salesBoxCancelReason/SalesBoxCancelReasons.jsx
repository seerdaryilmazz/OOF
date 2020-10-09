import React from "react";
import _ from "lodash";
import uuid from 'uuid';
import * as axios from "axios";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, CardHeader, Loader} from "susam-components/layout";
import {Notify, TextInput, Button, DropDown, Span, Checkbox} from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';

import {SalesboxService} from '../services';

import {SalesBoxCancelReasonModal} from './SalesBoxCancelReasonModal';

export class SalesBoxCancelReasons extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            ready: false
        };
    }

    componentDidMount() {
        this.loadReasons();
    }

    loadReasons() {
        this.findReasons((response) => {
            this.setState({reasons: response.data, ready: true});
        });
    }

    findReasons(callback) {
        SalesboxService.findSalesBoxCancelReasons().then(response => {
            callback(response);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    findReason(id, callback) {
        SalesboxService.findSalesBoxCancelReason(id).then(response => {
            callback(response);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    saveReason(data, callback) {
        SalesboxService.saveSalesBoxCancelReason(data).then(response => {
            callback(response);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    deleteReason(id, callback) {
        SalesboxService.deleteSalesBoxCancelReason(id).then(response => {
            callback(response);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    setSelectedData(data, key, readOnly) {
        this.setState({selectedData: data, keyForSelectedData: key, isSelectedDataReadOnly: readOnly});
    }

    addNew() {
        this.setSelectedData({}, uuid.v4(), false);
    }

    view(data, readOnly) {
        this.findReason(data.id, (response) => {
            this.setSelectedData(response.data, uuid.v4(), readOnly);
        });
    }

    delete(data) {
        Notify.confirm("Are you sure?", () => {
            this.deleteReason(data.id, (response) => {
                this.loadReasons();
            });
        });
    }

    save(data) {
        this.saveReason(data, (response) => {
            Notify.showSuccess("Reason saved.");
            this.setSelectedData(null, null, null);
            this.loadReasons();
        });
    }

    renderReasons() {

        let reasons = this.state.reasons;

        if (_.isEmpty(reasons)) {
            return null;
        } else {
            return (
                <GridCell width="1-1">
                    <Card>
                        <DataTable.Table data={reasons}>
                            <DataTable.Text header="Name" field="name"/>
                            <DataTable.Text header="Potential Deactivation Setting" field="potentialDeactivationSetting.name"/>
                            <DataTable.ActionColumn>
                                <DataTable.ActionWrapper track="onclick" onaction={(data) => this.view(data, false)}>
                                    <Button label="Edit" flat={true} style="success" size="small"/>
                                </DataTable.ActionWrapper>
                                <DataTable.ActionWrapper track="onclick" onaction={(data) => this.delete(data)}>
                                    <Button label="Delete" flat={true} style="danger" size="small"/>
                                </DataTable.ActionWrapper>
                            </DataTable.ActionColumn>
                        </DataTable.Table>
                    </Card>
                </GridCell>
            );
        }
    }

    renderModal() {
        if (!_.isNil(this.state.selectedData)) {
            return (
                <SalesBoxCancelReasonModal key={this.state.keyForSelectedData}
                                           data={this.state.selectedData}
                                           onSave={(data) => this.save(data)}
                                           onCancel={() => this.setSelectedData(null, null)}
                                           readOnly={this.state.isSelectedDataReadOnly}/>
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
                    <PageHeader title="Sales Box Cancel Reasons"/>
                </GridCell>
                <GridCell width="1-1">
                    <div className="uk-align-right">
                        <Button label="New Reason" style="success" onclick={() => this.addNew()}/>
                    </div>
                </GridCell>
                {this.renderReasons()}
                {this.renderModal()}
            </Grid>
        );
    }
}

