import React from "react";
import _ from "lodash";
import uuid from 'uuid';
import * as axios from "axios";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, CardHeader, Loader, Pagination} from "susam-components/layout";
import {Notify, TextInput, Button, DropDown, Span, Checkbox} from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';

import {SalesboxService} from '../services';

import {SalesDemandModal} from './SalesDemandModal';
import {SalesBoxesModal} from './SalesBoxesModal';

const PAGE_SIZE = 10;

export class SalesDemands extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            ready: false
        };
    }

    componentDidMount() {
        this.loadSalesDemands(0);
    }

    loadSalesDemands(page) {
        this.findSalesDemands(page, (response) => {
            let salesDemands = response.data.content;
            let totalPages = response.data.totalPages;
            this.setState({salesDemands: salesDemands, page: page, totalPages: totalPages, ready: true});
        });
    }

    findSalesDemands(page, callback) {
        SalesboxService.findSalesDemands(page, PAGE_SIZE).then(response => {
            callback(response);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    findSalesDemand(id, callback) {
        SalesboxService.findSalesDemand(id).then(response => {
            callback(response);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    saveSalesDemand(data, callback) {
        SalesboxService.saveSalesDemand(data).then(response => {
            callback(response);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    approveSalesDemand(id, callback) {
        SalesboxService.approveSalesDemand(id).then(response => {
            callback(response);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    createSalesBoxesForSalesDemand(id, callback) {
        SalesboxService.createSalesBoxesForSalesDemand(id).then(response => {
            callback(response);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    deleteSalesDemand(id, callback) {
        SalesboxService.deleteSalesDemand(id).then(response => {
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
        this.findSalesDemand(data.id, (response) => {
            this.setSelectedData(response.data, uuid.v4(), readOnly);
        });
    }

    copy(data) {
        let newData = {};
        newData.fromRegion = data.fromRegion;
        newData.toRegion = data.toRegion;
        newData.priority = data.priority;
        newData.shipmentLoadingTypes = data.shipmentLoadingTypes;
        newData.loadWeightType = data.loadWeightType;
        newData.validityStartDate = data.validityStartDate;
        newData.validityEndDate = data.validityEndDate;
        newData.quota = data.quota;
        newData.campaign = data.campaign;
        newData.minPrice = data.minPrice;
        newData.maxPrice = data.maxPrice;
        newData.currency = data.currency;
        this.setSelectedData(newData, uuid.v4(), false);
    }

    approve(data) {
        Notify.confirm("Are you sure?", () => {
            this.approveSalesDemand(data.id, (response) => {
                this.loadSalesDemands(0);
            });
        });
    }

    createBoxes(data) {
        Notify.confirm("Are you sure?", () => {
            this.createSalesBoxesForSalesDemand(data.id, (response) => {
                Notify.showSuccess("Number of boxes created: " + response.data);
                this.loadSalesDemands(0);
            });
        });
    }

    viewBoxes(data) {
        this.salesBoxesModalReference.open(data.id);
    }

    delete(data) {
        Notify.confirm("Are you sure?", () => {
            this.deleteSalesDemand(data.id, (response) => {
                this.loadSalesDemands(0);
            });
        });
    }

    save(data) {
        this.saveSalesDemand(data, (response) => {
            Notify.showSuccess("Sales demand saved.");
            this.setSelectedData(null, null, null);
            this.loadSalesDemands(0);
        });
    }

    renderSalesDemands() {

        let salesDemands = this.state.salesDemands;

        if (_.isEmpty(salesDemands)) {
            return null;
        } else {
            return (
                <GridCell width="1-1">
                    <Card>
                        <DataTable.Table data={salesDemands} noOverflow={true}>
                            <DataTable.Text header="No" field="no"/>
                            <DataTable.Text header="From Region" field="fromRegion.name"/>
                            <DataTable.Text header="To Region" field="toRegion.name"/>
                            <DataTable.Text header="Priority" field="priority.name"/>
                            <DataTable.Text header="Validity Start Date" field="validityStartDate"/>
                            <DataTable.Text header="Validity End Date" field="validityEndDate"/>
                            <DataTable.Bool header="Campaign" field="campaign" center={true}/>
                            <DataTable.Text header="Status" field="status.name"/>
                            <DataTable.Text printer={new MenuPrinter(this)} width={1}/>
                        </DataTable.Table>
                    </Card>
                </GridCell>
            );
        }
    }

    renderPagination() {
        if (_.isEmpty(this.state.salesDemands)) {
            return null;
        } else {
            return (
                <GridCell width="1-1">
                    <Pagination page={this.state.page + 1}
                                totalPages={this.state.totalPages}
                                onPageChange={(newPage) => this.loadSalesDemands(newPage - 1)}/>
                </GridCell>
            );
        }
    }

    renderModal() {
        if (!_.isNil(this.state.selectedData)) {
            return (
                <SalesDemandModal key={this.state.keyForSelectedData}
                                  data={this.state.selectedData}
                                  onSave={(data) => this.save(data)}
                                  onCancel={() => this.setSelectedData(null, null, null)}
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
                    <PageHeader title="Sales Demands"/>
                </GridCell>
                <GridCell width="1-1">
                    <div className="uk-align-right">
                        <Button label="New Sales Demand" style="success" onclick={() => this.addNew()}/>
                    </div>
                </GridCell>
                {this.renderSalesDemands()}
                {this.renderPagination()}
                {this.renderModal()}
                <GridCell width="1-1">
                    <SalesBoxesModal ref={(c) => this.salesBoxesModalReference = c}/>
                </GridCell>
            </Grid>
        );
    }
}

class MenuPrinter {

    constructor(callingComponent) {
        this.callingComponent = callingComponent;
    }

    printUsingRow(row) {

        let renderApprove = false;
        let renderCreateBoxes = false;
        let renderViewBoxes = false;
        let renderView = false;
        let renderEdit = false;
        let renderCopy = false;
        let renderDelete = false;

        if (row.status.code == "OPEN") {
            renderApprove = true;
            renderView = true;
            renderEdit = true;
            renderCopy = true;
            renderDelete = true;
        } else if (row.status.code == "APPROVED") {
            renderCreateBoxes = true;
            renderView = true;
            renderCopy = true;
        } else if (row.status.code == "BOX_CREATED") {
            renderViewBoxes = true;
            renderView = true;
            renderCopy = true;
        }

        return (
            <div className="md-card">
                <div className="md-card-list-item-menu" data-uk-dropdown="{mode:'click', pos:'right-bottom'}" aria-haspopup={true} aria-expanded={true}>
                    <a href="#" className="md-icon material-icons"></a>
                    <div className="uk-dropdown uk-dropdown-small">
                        <ul className="uk-nav">
                            <MenuItem name="Approve" icon="check-square" render={renderApprove} onclick={(e) => this.callingComponent.approve(row)} />
                            <MenuItem name="Create Boxes" icon="play-circle" render={renderCreateBoxes} onclick={(e) => this.callingComponent.createBoxes(row)} />
                            <MenuItem name="View Boxes" icon="square" render={renderViewBoxes} onclick={(e) => this.callingComponent.viewBoxes(row)} />
                            <MenuItem name="View" icon="eye" render={renderView} onclick={(e) => this.callingComponent.view(row, true)} />
                            <MenuItem name="Edit" icon="pencil" render={renderEdit} onclick={(e) => this.callingComponent.view(row, false)} />
                            <MenuItem name="Copy" icon="copy" render={renderCopy} onclick={(e) => this.callingComponent.copy(row)} />
                            <MenuItem name="Delete" icon="close" render={renderDelete} onclick={(e) => this.callingComponent.delete(row)} />
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}

class MenuItem extends React.Component{
    render(){
        if(!this.props.render){
            return null;
        }
        let styleClassName = this.props.style ? ("uk-text-" + this.props.style) : "";
        return(
            <li>
                <a href="javascript:;" onClick = {(e) => this.props.onclick(e)}>
                    <i className={"uk-icon-" + this.props.icon + " uk-icon-medsmall " + styleClassName}/>
                    <span className = {"uk-margin-left " + styleClassName}>{this.props.name}</span>
                </a>
            </li>
        );
    }
}

