import React from "react";
import * as axios from 'axios';

import {TranslatingComponent} from 'susam-components/abstract';
import {Button, DropDown, Notify} from 'susam-components/basic';

import {Card, Grid, GridCell, CardHeader, PageHeader} from "susam-components/layout";

import * as DataTable from 'susam-components/datatable';

import {WarehouseService, KartoteksService, CommonService} from '../../services';

import {WarehouseDefinitionEdit} from './WarehouseDefinitionEdit';

export class LoadSpec extends TranslatingComponent {


    constructor(props) {
        super(props);
        this.state = {
            data: [],
            lookup: {},
            selectedWarehouse: null
        }
    }

    componentDidMount() {
        this.loadLookupsAndWarehouses();
    }

    loadLookupsAndWarehouses() {
        axios.all([
            WarehouseDefinitionService.retrieveWarehouses(),
            KartoteksService.getEkolLocations(),
            CommonService.retrieveWarehouseZoneTypes(),
            CommonService.retrieveWarehouseRampProperties(),
            CommonService.retrieveWarehouseRampUsageTypes(),
            CommonService.retrieveWarehouseRampOperationTypes()
        ]).then(axios.spread((wareHouses, ekolLocations, warehouseZoneTypes, warehouseRampProperties, warehouseRampUsageTypes, warehouseRampOperationTypes) => {
            let state = _.cloneDeep(this.state);
            state.data = wareHouses.data;
            state.lookup.ekolLocation = ekolLocations.data;
            state.lookup.warehouseZoneType = warehouseZoneTypes.data;
            state.lookup.warehouseRampProperty = warehouseRampProperties.data;
            state.lookup.warehouseRampUsageType = warehouseRampUsageTypes.data;
            state.lookup.warehouseRampOperationType = warehouseRampOperationTypes.data;
            state.contentReady = true;
            this.setState(state);
        })).catch((error) => {
            this.handleError("An Error Occured", error);
            console.log("Error:" + error);
        });
    }

    handleError(preMessage, error) {
        let message = preMessage;
        if (error.response && error.response.data) {
            message = message + ": \n" + error.response.data;
        }
        Notify.showError(message);

    }


    loadWarehouseData(warehouseId) {
        WarehouseDefinitionService.retrieveWarehouses().then((response) => {
            let warehouses = response.data;

            let selectedWarehouse = this.state.selectedWarehouse;
            if(warehouseId) {
                selectedWarehouse = warehouses.find(w => { return w.id == warehouseId});
            }
            if(selectedWarehouse && selectedWarehouse.id) {
                let updated = warehouses.find(w => {return w.id == selectedWarehouse.id});
                if(updated) {
                    selectedWarehouse = updated;
                } else {
                    selectedWarehouse = null;
                }
            }
            this.setState({data: response.data, selectedWarehouse: selectedWarehouse});
        }).catch((error) => {
            Notify.showError(error);
        })
    }

    handleAddNewWarehouse() {
        this.setState({selectedWarehouse: {}});
    }

    handleWarehouseEditClose() {
        this.setState({selectedWarehouse: null});
    }

    handleEdit(value){
        this.setState({selectedWarehouse: value})
    }

    handleDelete(incData) {
        Notify.confirm("Warehouse '" + incData.name + "2 will be removed, are you sure?", () => {

            WarehouseDefinitionService.deleteWarehouse(incData.id).then((response) => {
                Notify.showSuccess("Warehouse Removed successfully.");
                this.loadWarehouseData();
            }).catch((error) => {
                Notify.showError(error);
            })
        });
    }


    renderEditForm(lookup, selectedWarehouse) {
        return (
            <WarehouseDefinitionEdit lookup={lookup} warehouse={selectedWarehouse}
                                     onClose={() => {this.handleWarehouseEditClose()}}
                                     reloadData={(warehouseId) => {this.loadWarehouseData(warehouseId)}}>
            </WarehouseDefinitionEdit>
        );
    }

    renderTable() {
        return (
            <Card>
                <Grid>
                    <GridCell width="1-1" noMargin = {true}>
                        <div className="uk-align-right">
                            <Button label="Add New Warehouse" flat={true} style="success" size="small"
                                    onclick={() => {this.handleAddNewWarehouse()}}/>
                        </div>
                    </GridCell>
                    <GridCell>
                        <DataTable.Table data={this.state.data} filterable={true} sortable={true} insertable={false}
                                         editable={false}>
                            <DataTable.Text width="25" field="name" header="Name" sortable={true} filterable={true}/>
                            <DataTable.Numeric width="10" field="area" header="Area(m2)" sortable={true} filterable={true}/>
                            <DataTable.Numeric width="10" field="numberOfFloors" header="# of Floors" sortable={true} filterable={true}/>
                            <DataTable.Numeric width="10" field="numberOfRamps" header="# of Ramps" sortable={true}
                                               filterable={true}/>
                            <DataTable.Text width="25" field="rampNumbers" header="Ramps" sortable={true}
                                            filterable={true}/>
                            <DataTable.ActionColumn width="20">
                                <DataTable.ActionWrapper track="onclick"
                                                         onaction={(data) => this.handleEdit(data)}>
                                    <Button label="Edit" flat={true} style="success" size="small"/>
                                </DataTable.ActionWrapper>
                                <DataTable.ActionWrapper track="onclick"
                                                         onaction={(data) => this.handleDelete(data)}>
                                    <Button label="Delete" flat={true} style="danger" size="small"/>
                                </DataTable.ActionWrapper>
                            </DataTable.ActionColumn>
                        </DataTable.Table>
                    </GridCell>
                </Grid>
            </Card>
        );
    }

    render() {
        let lookup = this.state.lookup;

        let selectedWarehouse = this.state.selectedWarehouse;

        let content;

        if(this.state.contentReady) {

            if (selectedWarehouse) {
                content = this.renderEditForm(lookup, selectedWarehouse);
            } else {
                content = this.renderTable();
            }
        }

        return (
            <div>
                <PageHeader title="Warehouses"/>
                {content}
            </div>
        );
    }
}