import React from "react";
import _ from "lodash";
import uuid from 'uuid';
import * as axios from "axios";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, CardHeader, Loader, Pagination} from "susam-components/layout";
import {Notify, TextInput, Button, DropDown, Span, Checkbox} from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';

import {SalesboxService} from '../services';

import {RelationModal} from './RelationModal';

const PAGE_SIZE = 10;

export class Relations extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            ready: false
        };
    }

    componentDidMount() {
        this.loadRelations(0);
    }

    loadRelations(page) {
        this.findRelations(page, (response) => {
            let relations = response.data.content;
            let totalPages = response.data.totalPages;
            this.setState({relations: relations, page: page, totalPages: totalPages, ready: true});
        });
    }

    findRelations(page, callback) {
        SalesboxService.findAccountOwnerSalesBoxOwnerRelations(page, PAGE_SIZE).then(response => {
            callback(response);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    findRelation(id, callback) {
        SalesboxService.findAccountOwnerSalesBoxOwnerRelation(id).then(response => {
            callback(response);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    saveRelation(data, callback) {
        SalesboxService.saveAccountOwnerSalesBoxOwnerRelation(data).then(response => {
            callback(response);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    deleteRelation(id, callback) {
        SalesboxService.deleteAccountOwnerSalesBoxOwnerRelation(id).then(response => {
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
        this.findRelation(data.id, (response) => {
            this.setSelectedData(response.data, uuid.v4());
        });
    }

    delete(data) {
        Notify.confirm("Are you sure?", () => {
            this.deleteRelation(data.id, (response) => {
                this.loadRelations(0);
            });
        });
    }

    save(data) {
        this.saveRelation(data, (response) => {
            Notify.showSuccess("Relation saved.");
            this.setSelectedData(null, null);
            this.loadRelations(0);
        });
    }

    renderRelations() {

        let relations = this.state.relations;

        if (_.isEmpty(relations)) {
            return null;
        } else {
            return (
                <GridCell width="1-1">
                    <Card>
                        <DataTable.Table data={relations}>
                            <DataTable.Text header="Account Owner" field="accountOwner"/>
                            <DataTable.Text header="Sales Box Owner" field="salesBoxOwner"/>
                            <DataTable.ActionColumn >
                                <DataTable.ActionWrapper track="onclick" onaction={(data) => this.edit(data)}>
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

    renderPagination() {
        if (_.isEmpty(this.state.relations)) {
            return null;
        } else {
            return (
                <GridCell width="1-1">
                    <Pagination page={this.state.page + 1}
                                totalPages={this.state.totalPages}
                                onPageChange={(newPage) => this.loadRelations(newPage - 1)}/>
                </GridCell>
            );
        }
    }

    renderModal() {
        if (!_.isNil(this.state.selectedData)) {
            return (
                <RelationModal key={this.state.keyForSelectedData}
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
                    <PageHeader title="Account Owner & Sales Box Owner Relations"/>
                </GridCell>
                <GridCell width="1-1">
                    <div className="uk-align-right">
                        <Button label="New Relation" style="success" onclick={() => this.addNew()}/>
                    </div>
                </GridCell>
                {this.renderRelations()}
                {this.renderPagination()}
                {this.renderModal()}
            </Grid>
        );
    }
}

