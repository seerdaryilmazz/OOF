import _ from "lodash";
import PropTypes from 'prop-types';
import React from "react";
import { DateRange } from 'susam-components/advanced';
import { Button, DropDown, Notify, TextInput } from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';
import { Card, CardHeader, Grid, GridCell, LoaderWrapper, PageHeader } from "susam-components/layout";
import { JsonViewerModal } from '../common/JsonViewerModal';
import { withAuthorization } from '../security';
import { ImportQueueService, LookupService } from '../services/KartoteksService';




const SecuredImportButton = withAuthorization(Button, "kartoteks.import-queue.import-company");
const SecuredCard = withAuthorization(Card, "kartoteks.import-queue.list");

export class ImportQueue extends React.Component {
    constructor(props) {
        super(props);
        this.state = {filter: {}, queue: []};
        this.queueFilterSettings = {name: "queueFilterSettings"}
    }

    componentDidMount(){
        this.listQueueStatus();
        this.listRoleTypes();
        let filter = {};
        let savedFilter = this.context.storage.read(this.queueFilterSettings.name);
        if(savedFilter){
            filter = JSON.parse(savedFilter);
            filter.page = 1;
            filter.size = 20;
        }else{
            filter = this.createInitialFilter();
        }
        let dateRange = {startDate: filter.startDate, endDate: filter.endDate};
        this.setState({filter: filter, dateRange: dateRange});
        this.search(filter, false);
    }

    createInitialFilter(){
        let filter = {};
        let moment = require("moment");
        filter.status = 'PENDING';
        filter.startDate = moment().format("DD/MM/YYYY");
        filter.type = "CUSTOMER";
        filter.page = 1;
        filter.size = 20;
        return filter;
    }
    listQueueStatus(){
        ImportQueueService.queueStatus().then(response => {
            this.setState({queueStatus: response.data});
        }).catch(error => {
            Notify.showError(error);
        })
    }
    listRoleTypes(){
        LookupService.getCompanyRoleTypes().then(response => {
            this.setState({roleTypes: response.data});
        }).catch(error => {
            Notify.showError(error);
        })
    }
    search(filter, append){
        this.setState({busy: filter.page === 1 ? 'new-search' : 'next-page'});
        ImportQueueService.list(filter).then(response => {
            this.context.storage.write(this.queueFilterSettings.name, JSON.stringify(filter));
            let pageSizeEquals = response.data.length === filter.size;
            let queue = append ? _.cloneDeep(this.state.queue).concat(response.data) : response.data;
            this.setState({queue: queue, busy: false, searchedFilter: filter, mayHaveNextPage: pageSizeEquals});
        }).catch(error => {
            this.setState({busy: false});
            Notify.showError(error);
        });
    }
    handleMoreClick(){
        let filter = _.cloneDeep(this.state.searchedFilter);
        filter.page = filter.page + 1;
        this.setState({searchedFilter: filter}, this.search(filter, true));
    }
    handleSearchClick(){
        let filter = _.cloneDeep(this.state.filter);
        filter.page = 1;
        this.setState({filter: filter}, this.search(filter, false));
    }
    handleImportClick(queue){
        if(queue.companyId){
            this.context.router.push('/ui/kartoteks/company/' + queue.companyId + '/merge-with-queue/' + queue.id);
        }else{
            this.context.router.push('/ui/kartoteks/import-queue/' + queue.id);
        }

    }
    handleShowData(item) {
        this.setState({selectedItem: item}, () => this.modal.open());
    }
    updateDateRange(value){
        let filter = _.cloneDeep(this.state.filter);
        filter.startDate = value.startDate;
        filter.endDate = value.endDate;
        this.setState({dateRange: value, filter: filter});
    }
    updateFilter(key, value){
        let filter = _.cloneDeep(this.state.filter);
        filter[key] = value;
        this.setState({filter:filter});
    }
    updateStatusFilter(value){
        let filter = _.cloneDeep(this.state.filter);
        filter.status = value ? value.id : null;
        this.setState({filter:filter});
    }
    updateTypeFilter(value){
        let filter = _.cloneDeep(this.state.filter);
        console.log(value);
        filter.type = value ? value.code : null;
        this.setState({filter:filter});
    }
    renderResults(){

        return (
            <LoaderWrapper busy = {this.state.busy === 'new-search'} title = "Searching import queue">
                <DataTable.Table data={this.state.queue} title="Queue"
                                 editable = {false} insertable = {false} filterable = {false} sortable = {true}>
                    <DataTable.DateTime field="createDate" header="Created At" width="10" sortable = {true} />
                    <DataTable.Lookup field="status" header="Status" width="15" sortable = {true} />
                    <DataTable.Badge header="Operation" width="15" sortable = {true} reader = {new QueueOpReader()}/>
                    <DataTable.Text field="companyName" header="Company Name" width="30" sortable = {true} />
                    <DataTable.Text header="Quadro Info" width="30" reader={new QuadroInfoReader()} printer={new QuadroInfoPrinter()}/>
                    <DataTable.ActionColumn width="10">
                        <DataTable.ActionWrapper track="onclick" shouldRender = {(data) => data.status.code === 'PENDING'} onaction = {(data) => this.handleImportClick(data)}>
                            <SecuredImportButton label="import" flat = {true} style="primary" size="small"/>
                        </DataTable.ActionWrapper>
                    </DataTable.ActionColumn>
                    <DataTable.ActionColumn width="10">
                        <DataTable.ActionWrapper track="onclick" onaction = {(data) => this.handleShowData(data)}>
                            <Button label="data" flat = {true} style="success" size="small"/>
                        </DataTable.ActionWrapper>
                    </DataTable.ActionColumn>
                </DataTable.Table>
            </LoaderWrapper>
        );

    }

    renderMoreButton(){
        let moreButton = null;
        if(!this.state.busy && this.state.mayHaveNextPage){
            moreButton = <Button label="More" style="primary" waves = {true} onclick = {() => this.handleMoreClick()} />;
        }
        return (
            <LoaderWrapper busy = {this.state.busy == 'next-page'} title = "Loading next page">
                {moreButton}
            </LoaderWrapper>
        );

    }

    render(){

        return (
            <div>
                <PageHeader title="Import Queue"/>
                <SecuredCard>
                    <Grid>
                        <GridCell width="1-1" noMargin = {true}>
                            <CardHeader title="Filter"/>
                        </GridCell>
                        <GridCell width="3-10">
                            <DateRange startDateLabel="Start Date" endDateLabel="End Date"
                                       onchange = {(value) => this.updateDateRange(value)} value = {this.state.dateRange} noMargin = {true}/>
                        </GridCell>
                        <GridCell width="2-10">
                            <DropDown label = "Status" options = {this.state.queueStatus}
                                      onchange = {(value) => this.updateStatusFilter(value)} value = {this.state.filter.status}/>
                        </GridCell>
                        <GridCell width="1-10">
                            <DropDown label = "Role Type" options = {this.state.roleTypes} valueField="code"
                                      onchange = {(value) => this.updateTypeFilter(value)} value = {this.state.filter.type}/>
                        </GridCell>
                        <GridCell width="3-10">
                            <TextInput label = "Company"
                                      onchange = {(value) => this.updateFilter("companyName", value)} value = {this.state.filter.companyName}/>
                        </GridCell>
                        <GridCell width="3-10">
                            <TextInput label = "Quadro Customer Company Code"
                                       onchange = {(value) => this.updateFilter("customerCompanyCode", value)} value = {this.state.filter.customerCompanyCode}/>
                        </GridCell>
                        <GridCell width="3-10">
                            <TextInput label = "Quadro Reference"
                                       onchange = {(value) => this.updateFilter("orderCode", value)} value = {this.state.filter.orderCode}/>
                        </GridCell>
                        <GridCell width="1-10">
                            <div className = "uk-margin-top">
                                <Button label="Search" style="primary" waves = {true} onclick = {() => this.handleSearchClick()}/>
                            </div>
                        </GridCell>
                        <GridCell width="1-1">
                            {this.renderResults()}
                        </GridCell>
                        <GridCell width="1-1" textCenter = {true}>
                            {this.renderMoreButton()}
                        </GridCell>
                    </Grid>
                    <JsonViewerModal ref={(c) => this.modal = c} title="Import Data" data={this.state.selectedItem ? this.state.selectedItem.data : null}/>
                </SecuredCard>
            </div>
        );
    }
}
ImportQueue.contextTypes = {
    router: PropTypes.object.isRequired,
    storage: PropTypes.object
};

class QueueOpReader{
    readCellValue(row) {
        if(row.companyId){
            return {style: "success", text: "Update"};
        }else{
            return {style: "success", text: "New"};
        }
    };

    readSortValue(row) {
        if(row.companyId){
            return "UPDATE";
        }else {
            return "NEW";
        }
    };
}

class QuadroInfoReader {
    readCellValue(row){
        return {
            customerCompanyCode: row.customerCompanyCode,
            orderCode: row.orderCode
        };
    }
    readSortValue(row){
        return null;
    }
}
class QuadroInfoPrinter {
    print(data) {
        return (
            <div>
                <div>
                    <span>Reference: </span><span className = "uk-text-bold">{data.orderCode}</span>
                </div>
                <div>
                    <span>Customer Company: </span><span className = "uk-text-bold">{data.customerCompanyCode}</span>
                </div>
            </div>
        );
    }
}