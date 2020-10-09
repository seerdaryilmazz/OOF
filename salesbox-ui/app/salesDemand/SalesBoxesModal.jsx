import React from "react";
import _ from "lodash";
import uuid from 'uuid';
import * as axios from "axios";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, CardHeader, Loader, Modal} from "susam-components/layout";
import {Notify, TextInput, Button, DropDown, Span, Checkbox} from 'susam-components/basic';
import {Date, NumericInput} from 'susam-components/advanced';
import * as DataTable from 'susam-components/datatable';

import {SalesboxService} from '../services';

export class SalesBoxesModal extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    open(salesDemandId) {
        this.findSalesBoxesForSalesDemand(salesDemandId, (response) => {
            this.setState({salesBoxes: response.data});
        });
        this.modalReference.open();
    }

    findSalesBoxesForSalesDemand(id, callback) {
        SalesboxService.findSalesBoxesForSalesDemand(id).then(response => {
            callback(response);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    renderModalContent() {
        return (
            <Grid>
                <GridCell width="1-1">
                    <DataTable.Table title="Sales Boxes" data={this.state.salesBoxes} showRowCount={true}>
                        <DataTable.Text header="Demand No" field="salesDemandNo"/>
                        <DataTable.Text header="Account" field="account.name"/>
                        <DataTable.Text header="From - To" printer={new FromToPrinter()}/>
                        <DataTable.Text header="Shipment Loading Types" printer={new ShipmentLoadingTypesPrinter()}/>
                        <DataTable.Text header="Load Weight Types" printer={new LoadWeightTypesPrinter()}/>
                        <DataTable.Text header="Status" field="status.name"/>
                        <DataTable.Numeric header="Quote No" field="quoteNumber"/>
                        <DataTable.Text header="Cancel Reason" field="cancelReason.name"/>
                    </DataTable.Table>
                </GridCell>
                <GridCell width="1-1">
                    <div className="uk-align-right">
                        <Button label="Close" waves={true} onclick={() => this.modalReference.close()}/>
                    </div>
                </GridCell>
            </Grid>
        );
    }

    render() {
        return (
            <Modal large={true}
                   ref={(c) => this.modalReference = c}>
                {this.renderModalContent()}
            </Modal>
        );
    }
}

class FromToPrinter {
    printUsingRow(row) {
        return row.fromCountry.name + " " + row.fromPostalCode.code + " - " + row.toCountry.name + " " + row.toPostalCode.code;
    }
}

class ShipmentLoadingTypesPrinter {
    printUsingRow(row) {
        if (_.isEmpty(row.shipmentLoadingTypes)) {
            return null;
        } else {
            let array = [];
            row.shipmentLoadingTypes.forEach((item) => {
                array.push(item.name);
            });
            return _.sortBy(array).join(", ");
        }
    }
}

class LoadWeightTypesPrinter {
    printUsingRow(row) {
        if (_.isEmpty(row.loadWeightTypes)) {
            return null;
        } else {
            let array = [];
            row.loadWeightTypes.forEach((item) => {
                array.push(item.name);
            });
            return _.sortBy(array).join(", ");
        }
    }
}

