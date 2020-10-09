import React from "react";
import PropTypes from 'prop-types';
import _ from "lodash";
import uuid from "uuid";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader} from "susam-components/layout";
import {Notify, TextInput, Button, DropDown} from 'susam-components/basic';
import {CompanySearchAutoComplete} from "susam-components/oneorder";
import * as DataTable from 'susam-components/datatable';

import {ExportQueueService} from '../services/KartoteksService';
import {withAuthorization} from '../security';
import {JsonViewerModal} from '../common/JsonViewerModal';

const SecuredSearchResults = withAuthorization(Grid, "kartoteks.export-queue.list");
const SecuredExecuteButton = withAuthorization(Button, "kartoteks.export-queue.execute", {hideWhenNotAuthorized: true});

export class ExportQueue extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {params: {size:25, page:1}};
    }

    componentDidMount(){
        this.init();
        this.search();
    }

    init(){
        ExportQueueService.queueStatus().then(response => {
            this.setState({statuses: response.data.map(item => {return {id: item, name: item}})});
        }).catch(error => {
            Notify.showError(error);
        })
    }
    search(){
        let params = {
            status: this.state.params.status ? this.state.params.status.id : null,
            applicationCompanyId: this.state.params.applicationCompanyId,
            companyId: this.state.params.company ? this.state.params.company.id : null,
            size: this.state.params.size,
            page: this.state.params.page
        };
        ExportQueueService.list(params).then(response => {
            this.setState({searchResults: response.data});
        }).catch(error => {
            Notify.showError(error);
        });
    }
    handleClickSearch(){
        this.search();
    }

    handleExecuteClick(item){
        ExportQueueService.execute(item.id).then(response => {
            Notify.showSuccess("Execute scheduled");
        }).catch(error => {
            Notify.showError(error);
        });
    }

    handleShowData(item) {
        this.setState({selectedItem: item}, () => this.modal.open());
    }

    updateParamState(key, value){
        let params = _.cloneDeep(this.state.params);
        params[key] = value;
        this.setState({params: params});
    }

    nextPage(){
        let params = _.cloneDeep(this.state.params);
        params.page++;
        this.setState({params: params}, () => this.search());
    }
    prevPage(){
        if(this.state.params.page > 1){
            let params = _.cloneDeep(this.state.params);
            params.page--;
            this.setState({params: params}, () => this.search());
        }
    }

    render(){
        let nextPage = null;
        if(this.state.searchResults && this.state.searchResults.length == this.state.params.size){
            nextPage = <Button label="next page" style="primary"
                               onclick = {() => this.nextPage()} />;
        }

        let prevPage = null;
        if(this.state.params.page > 1){
            prevPage = <Button label="prev page" style="primary"
                               onclick = {() => this.prevPage()} />;
        }

        return (
            <div>
                <PageHeader title="Export Queue"/>

                <Card>
                    <SecuredSearchResults>
                        <GridCell width="1-4">
                            <DropDown label="Status" options = {this.state.statuses} value = {this.state.params.status}
                                      onchange = {(value) => this.updateParamState("status", value)}/>
                        </GridCell>
                        <GridCell width="1-4">
                            <TextInput label="Remote System Company Id" value = {this.state.params.applicationCompanyId}
                                       onchange = {(value) => this.updateParamState("applicationCompanyId", value)} />
                        </GridCell>
                        <GridCell width="1-4">
                            <CompanySearchAutoComplete label="Company"
                                                       value={this.state.params.company}
                                                       onchange={(value) => this.updateParamState("company", value)}
                                                       onclear={() => this.updateParamState("company", null)}/>
                        </GridCell>
                        <GridCell width="1-4">
                            <Button label="search" style="primary" size="small" onclick = {() => this.handleClickSearch()} />
                        </GridCell>
                        <GridCell width="1-1">
                            <DataTable.Table data={this.state.searchResults}
                                             editable = {false} insertable = {false} filterable = {false} sortable = {false}>
                                <DataTable.Text field="company.name" header="Company"/>
                                <DataTable.Text field="applicationCompanyId" header="Remote System Company Id"/>
                                <DataTable.Text field="status" header="Status" printer = {new StatusPrinter()}/>
                                <DataTable.Text field="latestExecuteDate" header="Execution Date"/>
                                <DataTable.ActionColumn width="10">
                                    <DataTable.ActionWrapper track="onclick" onaction = {(data) => this.handleExecuteClick(data)}>
                                        <SecuredExecuteButton label="execute" flat = {true} size="small" style="primary"/>
                                    </DataTable.ActionWrapper>
                                </DataTable.ActionColumn>
                                <DataTable.ActionColumn width="10">
                                    <DataTable.ActionWrapper track="onclick" onaction = {(data) => this.handleShowData(data)}>
                                        <Button label="data" flat = {true} style="success" size="small"/>
                                    </DataTable.ActionWrapper>
                                </DataTable.ActionColumn>
                            </DataTable.Table>
                        </GridCell>
                        <GridCell width="1-1">
                            <Grid>
                                <GridCell width="1-2"  textCenter = {true}>
                                    {prevPage}
                                </GridCell>
                                <GridCell width="1-2"  textCenter = {true}>
                                    {nextPage}
                                </GridCell>
                            </Grid>
                        </GridCell>
                    </SecuredSearchResults>
                    <JsonViewerModal ref={(c) => this.modal = c} title="Export Data" data={this.state.selectedItem ? this.state.selectedItem.data : null}/>
                </Card>
            </div>
        );
    }
}
class StatusPrinter{
    print(data){
        let classNames = ["uk-badge"];
        if(data === "SUCCESSFUL"){
            classNames.push("uk-badge-success");
        } else if(data === "FAILED" || data === "CONSECUTIVE_FAILURE"){
            classNames.push("uk-badge-danger");
        } else if(data === "IGNORED" || data === "SKIPPED"){
            classNames.push("uk-badge-warning");
        }

        return <i className={classNames.join(" ")}>{data}</i>
    }
}