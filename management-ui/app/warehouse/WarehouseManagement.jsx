import React from "react";
import {Grid, GridCell, PageHeader} from "susam-components/layout";
import {Warehouses} from "./Warehouses";
import {Warehouse} from "./Warehouse";
import {WarehouseService, KartoteksService, ZoneService} from "../services";
import {Notify} from "susam-components/basic";
import * as axios from "axios";

export class WarehouseManagement extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            warehouses: [],
            selectedWarehouse: null,
            selectedCompany: null,
            selectedCompanyLocations: [],
            selectedCompanyLocation: null,
            zones: [],
            selectedZone: null,
            zoneLoading: false,
        };
    }

    componentDidMount() {
        this.loadWarehouses();
        this.loadZones();
    }

    loadZones() {
        ZoneService.getZones().then(response => {
            this.setState({
                zones: response.data,
            });
        }).catch(error => {
            Notify.showError(error);
        });
    }

    loadWarehouses() {
        WarehouseService.list().then(response => {
            this.setState({
                warehouses: response.data,
                selectedWarehouse: null,
                selectedCompany: null,
                selectedCompanyLocations: [],
                selectedCompanyLocation: null,
                selectedZone: null,
                zoneLoading: false,
            });
        }).catch(error => {
            Notify.showError(error);
        });
    }

    loadWarehouse(warehouse) {
        axios.all([
            WarehouseService.get(warehouse.id),
            KartoteksService.getCompany(warehouse.companyId),
            KartoteksService.getWarehouses(warehouse.companyId),
        ]).then(axios.spread((warehouseResponse, companyResponse, locationResponse) => {
            let selectedCompanyLocation = null;
            locationResponse.data.forEach(d => {
                if (d.id == warehouse.locationId) {
                    selectedCompanyLocation = d;
                }
            });

            this.setState({
                selectedWarehouse: warehouseResponse.data,
                selectedCompany: companyResponse.data,
                selectedCompanyLocations: locationResponse.data,
                selectedCompanyLocation: selectedCompanyLocation,
                selectedZone: null,
                zoneLoading: false,
            });
        })).catch(error => {
            Notify.showError(error);
        });
    }

    onSelectWarehouse(warehouse) {
        this.loadWarehouse(warehouse);
    }

    onNewWarehouse() {
        this.setState({selectedWarehouse: {}, selectedCompany: null});
    }

    onSelectedCompanyChange(selectedCompany) {
        KartoteksService.getWarehouses(selectedCompany.id).then(response => {
            this.setState({
                selectedCompany: selectedCompany,
                selectedCompanyLocations: response.data,
                selectedCompanyLocation: null,
            });
        }).catch(error => {
            Notify.showError(error);
        });
    }

    onSelectedCompanyClear() {
        this.setState({
            selectedCompany: null,
            selectedCompanyLocations: [],
            selectedCompanyLocation: null,
        });
    }

    onSelectedCompanyLocationChange(location) {
        this.setState({selectedCompanyLocation: location})
    }

    onSaveWarehouse() {
        let selectedWarehouse = _.cloneDeep(this.state.selectedWarehouse);
        selectedWarehouse.companyId = this.state.selectedCompany ? this.state.selectedCompany.id : null;
        selectedWarehouse.companyName = this.state.selectedCompany ? this.state.selectedCompany.name : null;
        selectedWarehouse.locationId = this.state.selectedCompanyLocation ? this.state.selectedCompanyLocation.id : null;
        selectedWarehouse.locationName = this.state.selectedCompanyLocation ? this.state.selectedCompanyLocation.name : null;

        if (!selectedWarehouse.companyId || !selectedWarehouse.companyName) {
            Notify.showError("Company not selected");
            return;
        }

        if (!selectedWarehouse.locationId || !selectedWarehouse.locationName) {
            Notify.showError("Location not selected");
            return;
        }

        let f = selectedWarehouse.id ? WarehouseService.update(selectedWarehouse.id, selectedWarehouse) : WarehouseService.save(selectedWarehouse);
        f.then(response => {
            this.loadWarehouses();
        }).catch(error => {
            Notify.showError(error);
        });
    }

    onDeleteWarehouse() {
        WarehouseService.delete(this.state.selectedWarehouse.id).then(response => {
            this.loadWarehouses();
        }).catch(error => {
            Notify.showError(error);
        });
    }

    onSelectZone(zone) {
        if (zone && zone.id) {
            this.setState({zoneLoading: true}, () => {
                ZoneService.getZone(zone.id).then(response => {
                    this.setState({selectedZone: response.data, zoneLoading: false});
                }).catch(error => {
                    Notify.showError(error);
                    this.setState({zoneLoading: false});
                });
            });
        }
    }

    onAddZone() {
        if (!this.state.selectedZone) {
            Notify.showError("Select a zone first");
            return;
        }

        let selectedWarehouse = _.cloneDeep(this.state.selectedWarehouse);
        let zones = selectedWarehouse.zones ? selectedWarehouse.zones : [];
        let found = false;
        zones.forEach(zone => {
            if (zone.zoneId == this.state.selectedZone.id) {
                found = true;
            }
        });

        if (found) {
            Notify.showError("Zone is already in the list");
            return;
        }

        zones.push({
            zoneId: this.state.selectedZone.id,
            zoneName: this.state.selectedZone.name,
        });

        this.setState({selectedWarehouse: selectedWarehouse});
    }

    onDeleteZone(zone) {
        let selectedWarehouse = _.cloneDeep(this.state.selectedWarehouse);
        _.remove(selectedWarehouse.zones, z => {
            return z.zoneId == zone.zoneId;
        });
        this.setState({selectedWarehouse: selectedWarehouse});
    }

    render() {
        return (
            <div>
                <PageHeader title="Warehouses for Order Planning"/>
                <Grid>
                    <GridCell noMargin="true" width="1-6">
                        <Warehouses warehouses={this.state.warehouses}
                                    onSelectWarehouse={(warehouse) => this.onSelectWarehouse(warehouse)}
                                    onNewWarehouse={() => this.onNewWarehouse()}/>
                    </GridCell>
                    <GridCell noMargin="true" width="5-6">
                        <Warehouse warehouse={this.state.selectedWarehouse}
                                   company={this.state.selectedCompany}
                                   companyLocations={this.state.selectedCompanyLocations}
                                   companyLocation={this.state.selectedCompanyLocation}
                                   onSelectedCompanyChange={(selectedCompany) => this.onSelectedCompanyChange(selectedCompany)}
                                   onSelectedCompanyClear={() => this.onSelectedCompanyClear()}
                                   onSelectedCompanyLocationChange={(location) => this.onSelectedCompanyLocationChange(location)}
                                   onSaveWarehouse={() => this.onSaveWarehouse()}
                                   onDeleteWarehouse={() => this.onDeleteWarehouse()}
                                   zones={this.state.zones}
                                   zone={this.state.selectedZone}
                                   onSelectZone={(zone) => this.onSelectZone(zone)}
                                   onAddZone={() => this.onAddZone()}
                                   zoneLoading={this.state.zoneLoading}
                                   onDeleteZone={(zone) => this.onDeleteZone(zone)}/>
                    </GridCell>
                </Grid>
            </div>
        );
    }
}