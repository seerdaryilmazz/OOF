import React from "react";
import _ from 'lodash';
import uuid from 'uuid';

import {Notify, Span} from "susam-components/basic";
import {Grid, GridCell, Loader} from "susam-components/layout";
import {TranslatingComponent} from 'susam-components/abstract';
import * as DataTable from 'susam-components/datatable';

import {OrderService, WarehouseService} from '../services';


export class ShipmentBarcodeDetails extends TranslatingComponent{

    constructor(props){
        super(props);
        this.state = {barcodeList: []};
    }
    componentDidMount(){
        if(this.props.shipmentId){
            this.loadBarcodes(this.props.shipmentId);
            this.loadPrintHistory(this.props.shipmentId);
        }
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.shipmentId){
            this.loadBarcodes(nextProps.shipmentId);
            this.loadPrintHistory(nextProps.shipmentId);
        }
    }

    loadPrintHistory(shipmentId){
        WarehouseService.getBarcodePrinting(shipmentId).then(response => {
            this.setState({barcodePrinting: response.data});
        }).catch(error => {
            Notify.showError(error);
        })
    }

    loadInventoryItem(shipmentId, warehouseId){
        WarehouseService.getInventoryItem(shipmentId, warehouseId).then(response => {
            this.setState({inbound: response.data.inboundOperation, outbound: response.data.outboundOperation});
        }).catch(error => {
            Notify.showError(error);
        });
    }

    loadBarcodes(shipmentId){
        this.setState({busy: true});
        OrderService.getBarcodes(shipmentId).then(response => {;
            this.setState({barcodeList: response.data},
                () => this.loadBarcodeHistory(shipmentId));

        }).catch(error => {
            this.setState({busy: false});
            Notify.showError(error);
        });

    }

    loadBarcodeHistory(shipmentId){
        WarehouseService.getBarcodeHistory(shipmentId).then(response => {
            let historyItemsGroupedByWarehouse = _.groupBy(response.data, item => item.warehouse.id + ";" + item.warehouse.name);
            let warehouses = Object.keys(historyItemsGroupedByWarehouse);
            warehouses.forEach(item => {
                let consolidated = [];
                this.state.barcodeList.forEach(eachBarcode => {
                    let row = {
                        packageNo: eachBarcode.packageNo,
                        barcode: eachBarcode.barcode
                    };

                    let loadBarcodeRead = _.find(historyItemsGroupedByWarehouse[item], item => item.barcode == eachBarcode.barcode && item.handleType == "LOAD");
                    if(loadBarcodeRead){
                        row.goodsOutBy = loadBarcodeRead.createdBy;
                        row.goodsOutDate = loadBarcodeRead.createdAt;
                    }
                    let unloadBarcodeRead = _.find(historyItemsGroupedByWarehouse[item], item => item.barcode == eachBarcode.barcode && item.handleType == "UNLOAD");
                    if(unloadBarcodeRead){
                        row.goodsInBy = unloadBarcodeRead.createdBy;
                        row.goodsInDate = unloadBarcodeRead.createdAt;
                    }
                    consolidated.push(row);
                });
                historyItemsGroupedByWarehouse[item] = consolidated;
            });
            let selectedWarehouse =  warehouses ? warehouses[0] : "";
            this.setState({
                busy: false, barcodeHistory: historyItemsGroupedByWarehouse,
                warehouses: warehouses, selectedWarehouse: selectedWarehouse
            }, () => {
                if(selectedWarehouse){
                    this.loadInventoryItem(shipmentId, selectedWarehouse.split(";")[0]);
                }
            });
        }).catch(error => {
            this.setState({busy: true});
            Notify.showError(error);
        })
    }

    handleSelectWarehouse(e, warehouse){
        e.preventDefault();
        this.setState({selectedWarehouse: warehouse});
        this.loadInventoryItem(this.props.shipmentId, warehouse.split(";")[0]);
    }

    render(){
        if(this.state.busy){
            return <Loader title="Loading Barcode History" />
        }
        if(!this.state.warehouses){
            return null;
        }
        let data = this.state.barcodeHistory[this.state.selectedWarehouse];
        if(!data){
            data = [];
            this.state.barcodeList.forEach(eachBarcode => {
                data.push({
                    packageNo: eachBarcode.packageNo,
                    barcode: eachBarcode.barcode
                });
            });
        }
        let selectedWarehouseName = this.state.selectedWarehouse ? this.state.selectedWarehouse.split(";")[1] : "";

        let inboundData = this.state.inbound ? this.state.inbound.tripPlanCode + " " + this.state.inbound.vehiclePlateNo : "";
        let outboundData = this.state.outbound ? this.state.outbound.tripPlanCode + " " + this.state.outbound.vehiclePlateNo : "";

        let barcodePrintedAt = _.get(this.state, 'barcodePrinting.printedAt');
        let barcodePrintedBy = _.get(this.state, 'barcodePrinting.printedBy.name');
        let barcodePrintedWarehouse = _.get(this.state, 'barcodePrinting.warehouse.name');
        return (
            <Grid>
                <GridCell width="1-1">
                    <Grid>
                        <GridCell width="1-4" noMargin = {true}>
                            <Span label="Printed On" value = {barcodePrintedAt} />
                        </GridCell>
                        <GridCell width="1-4" noMargin = {true}>
                            <Span label="Printed By" value = {barcodePrintedBy} />
                        </GridCell>
                        <GridCell width="1-4" noMargin = {true}>
                            <Span label="Warehouse" value = {barcodePrintedWarehouse} />
                        </GridCell>
                    </Grid>
                </GridCell>
                <GridCell width="1-1">
                    <ul className="uk-subnav uk-subnav-pill">
                        {
                            this.state.warehouses.map(item => {
                                let name = item.split(";")[1];
                                return <li key = {item} className={selectedWarehouseName == name ? 'uk-active' : ''}>
                                    <a href="#" onClick = {(e) => this.handleSelectWarehouse(e, item)}>{name}</a>
                                </li>
                            })
                        }
                    </ul>
                </GridCell>
                <GridCell width="1-1">
                    <Grid>
                        <GridCell width="1-4" noMargin = {true}>
                            <Span label="Goods In" value = {inboundData} />
                        </GridCell>
                        <GridCell width="1-4" noMargin = {true}>
                            <Span label="Goods Out" value = {outboundData} />
                        </GridCell>
                    </Grid>
                </GridCell>
                <GridCell width="1-1">
                    <DataTable.Table data={data} filterable={false} sortable={false}
                                     insertable={false} editable={false}>
                        <DataTable.Text header="Package No" field="packageNo" sortable={true} filterable={true}/>
                        <DataTable.Text header="Barcode" field="barcode" sortable={true} filterable={true}/>
                        <DataTable.Text header="Goods In By" field="goodsInBy" sortable={true} filterable={true}/>
                        <DataTable.Text header="Goods In Date" field="goodsInDate" sortable={true} filterable={true}/>
                        <DataTable.Text header="Goods Out By" field="goodsOutBy" sortable={true} filterable={true}/>
                        <DataTable.Text header="Goods Out Date" field="goodsOutDate" sortable={true} filterable={true}/>
                    </DataTable.Table>
                </GridCell>

            </Grid>
        );
    }
}

