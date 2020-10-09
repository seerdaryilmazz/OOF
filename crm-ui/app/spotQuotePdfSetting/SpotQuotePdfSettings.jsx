import React from "react";
import _ from "lodash";
import uuid from 'uuid';
import * as axios from "axios";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, Pagination} from "susam-components/layout";
import {Notify, Button} from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';

import {CrmQuoteService} from '../services';

import {SpotQuotePdfSetting} from './SpotQuotePdfSetting';
import {PdfSettingSearchPanel} from "./PdfSettingSearchPanel";
import {SearchUtils} from "susam-components/utils/SearchUtils";

export class SpotQuotePdfSettings extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            pageNumber:1,
            pageSize: 20,
            searchParams:{},
            ready: false
        };
    }

    componentDidMount() {
        this.loadSettings();
    }

    componentDidUpdate(prevProps){
        if(!_.isEqual(this.props.location, prevProps.location) && _.isEmpty(this.props.location.hash)){
            this.setSelectedData(null, null, false);
        }
    }

    calculatePageNumber(settings) {
        let arr = settings || [];
        for(let key in this.state.searchParams) {
            arr = new SearchUtils([`${key}.name`]).translator(this.context.translator).search(_.get(this.state.searchParams[key], 'name'), arr);
        }
        let {pageNumber, pageSize} = this.state;
        let paging = {
            totalElements: arr.length
        };
        paging.content = _.slice(arr,(pageNumber-1)*pageSize, pageNumber*pageSize );
        paging.pageCount = Math.floor(paging.totalElements / pageSize) + ((paging.totalElements % pageSize) > 0 ? 1 : 0);
        return paging;
    }

    loadSettings() {
        this.findSettings((response) => {
            this.setState({settings: response.data, ready: true});
        });
    }

    findSettings(callback) {
        CrmQuoteService.findSpotQuotePdfSettings().then(response => {
            callback(response);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    findSetting(id, callback) {
        CrmQuoteService.findSpotQuotePdfSetting(id).then(response => {
            callback(response);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    saveSetting(data, callback) {
        CrmQuoteService.saveSpotQuotePdfSetting(data).then(response => {
            callback(response);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    deleteSetting(id, callback) {
        CrmQuoteService.deleteSpotQuotePdfSetting(id).then(response => {
            callback(response);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    setSelectedData(data, key, readOnly) {
        this.setState({selectedData: data, keyForSelectedData: key, searchParams:{}, pageNumber:1, isSelectedDataReadOnly: readOnly});
    }

    addNew() {
        this.setSelectedData({}, uuid.v4(), false);
        this.context.router.push(`${this.props.location.pathname}#add`);
    }

    view(data, readOnly) {
        this.findSetting(data.id, (response) => {
            this.setSelectedData(response.data, uuid.v4(), readOnly);
            this.context.router.push(`${this.props.location.pathname}#${readOnly?'view':'edit'}`);
        });
    }

    delete(data) {
        Notify.confirm("Are you sure?", () => {
            this.deleteSetting(data.id, (response) => {
                this.loadSettings();
            });
        });
    }

    cancel() {
        this.context.router.goBack();
        this.setSelectedData(null, null, null);
        this.loadSettings();
    }

    save(data) {
        this.saveSetting(data, (response) => {
            Notify.showSuccess("Setting saved.");
            this.setSelectedData(null, null, null);
            this.loadSettings();
        });
    }

    renderSettings() {
        let sortedSettings = _.sortBy(this.state.settings, ["subsidiary.name", "serviceArea.name", "language.name"]);
        let paging = this.calculatePageNumber(sortedSettings);
        return (
            <Grid>
                <GridCell width="1-1">
                    <DataTable.Table data={paging.content}>
                        <DataTable.Text header="Subsidiary" field="subsidiary.name" width="25"/>
                        <DataTable.Text header="Service Area" field="serviceArea.name" width="25" />
                        <DataTable.Text header="Language" field="language.name" width="25" />
                        <DataTable.ActionColumn width="25">
                            <DataTable.ActionWrapper track="onclick" onaction={(data) => this.view(data, true)}>
                                <Button label="View" flat={true} style="success" size="small"/>
                            </DataTable.ActionWrapper>
                            <DataTable.ActionWrapper track="onclick" onaction={(data) => this.view(data, false)}>
                                <Button label="Edit" flat={true} style="success" size="small"/>
                            </DataTable.ActionWrapper>
                            <DataTable.ActionWrapper track="onclick" onaction={(data) => this.delete(data)}>
                                <Button label="Delete" flat={true} style="danger" size="small"/>
                            </DataTable.ActionWrapper>
                        </DataTable.ActionColumn>
                    </DataTable.Table>
                </GridCell>
                <GridCell>
                    <GridCell width="1-1" noMargin={true}>
                        <Pagination totalElements={paging.totalElements}
                                    totalPages={paging.pageCount}
                                    page={this.state.pageNumber}
                                    range={this.state.pageSize}
                                    onPageChange={(pageNumber) => this.setState({pageNumber: pageNumber})}/>
                    </GridCell>
                </GridCell>
            </Grid>
        );

    }

    render() {

        if (!this.state.ready) {
            return null;
        }

        if (!_.isNil(this.state.selectedData)) {
            return (
                <SpotQuotePdfSetting key={this.state.keyForSelectedData}
                                     data={this.state.selectedData}
                                     onSave={(data) => this.save(data)}
                                     onCancel={() => this.cancel()}
                                     readOnly={this.state.isSelectedDataReadOnly}/>
            );
        } else {
            return (
                <Grid>
                    <GridCell width="1-1">
                        <PageHeader title="Spot Quote Pdf Settings"/>
                    </GridCell>
                    <GridCell width="1-1">
                        <div className="uk-align-right">
                            <Button label="New Setting" style="success" onclick={() => this.addNew()}/>
                        </div>
                    </GridCell>
                    <GridCell width="1-1">
                        <Card>
                            <PdfSettingSearchPanel list={this.state.settings} searchParams={this.state.searchParams}
                                                   onChange={searchParams => this.setState({searchParams:searchParams, pageNumber:1})} />
                            {this.renderSettings()}
                        </Card>
                    </GridCell>
                </Grid>
            );
        }
    }
}

SpotQuotePdfSettings.contextTypes = {
    router: React.PropTypes.object.isRequired,
    translator: React.PropTypes.object
};

