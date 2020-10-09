import * as axios from 'axios';
import _ from 'lodash';
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Notify } from "susam-components/basic";
import { Card, Grid, GridCell, PageHeader } from "susam-components/layout";
import { CompanyLocationSearchAutoComplete } from "susam-components/oneorder";
import uuid from "uuid";
import { VehicleService, CommonService, CustomerWarehouseRuleService, KartoteksService } from '../../services';
import { DSLRule } from '../common/DSLRule';
import { CarrierRule } from './CarrierRule';
import { DriverRule } from './DriverRule';
import { EquipmentRule } from './EquipmentRule';
import { VehicleRule } from './VehicleRule';

export class CustomerWarehouseRule extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {data: {}, lookup: {}}
    }

    componentDidMount() {
        let locationId = this.props.location.query.locationId;

        let calls = [
            // VehicleService.retrieveMotorVehicleBrands(),
            CommonService.getEquipmentTypes(),
            CommonService.retrieveVehicleFeaturesForCarrier(),
            CommonService.retrieveDSLTypes()];
        if(locationId){
            calls.push(KartoteksService.getCompanyByLocationId(locationId));
        }
        axios.all(calls)
            .then(axios.spread((vehicleEquipmentTypes, vehicleFeatures, dslTypes, company) => {
            let state = _.cloneDeep(this.state);
            state.lookup.motorVehicleBrand = [];
            state.lookup.vehicleEquipmentType = vehicleEquipmentTypes.data;
            state.lookup.vehicleFeature = vehicleFeatures.data;
            state.lookup.dslType = dslTypes.data;
            if(company){
                state.company = {id: company.data.id, name: company.data.name};
                let location = _.find(company.data.companyLocations, (item) => item.id == locationId);
                if(location){
                    state.warehouse = {id: location.id, name: location.name};
                }
            }
            this.setState(state, () => {
                if(company){
                    this.loadWarehouseRules();
                }
            });
        })).catch((error) => {
            Notify.showError(error);
            console.log("Error:" + error);
        });
    }

    handleCompanyAndWarehouseSelection(value) {
        if (value && value.company && value.company.ownedByEkol) {
            Notify.showError("Ekol Companies can not be selected.")
            this.setState({company: this.state.company, warehouse: this.state.warehouse});
        } else {
            this.setState({company: value.company, warehouse: value.location}, () => {
                if(value.location){
                    this.loadWarehouseRules();
                }
            });
        }
    }


    loadWarehouseRules() {

        let warehouse = this.state.warehouse;

        if (warehouse && warehouse.id) {
            CustomerWarehouseRuleService.retrieveCustomerWarehouseRule(warehouse.id).then(response => {
                    let data = response.data;
                    if (data == null || data == "") {
                        this.initializeRuleData();
                    } else {
                        this.handleRenderData(data);
                    }
                }
            ).catch((error) => {
                Notify.showError(error);
                console.log("Error:" + error);
            });
        }
    }

    initializeRuleData() {
        this.setState({
            vehicleRule: {},
            driverRule: {},
            carrierRule: {},
            equipmentRule: [],
            dslRule: []
        });
    }

    handleRenderData(data) {
        data.equipmentRule.forEach(d => d._key = uuid.v4());
        data.dslRule.forEach(d => d._key = uuid.v4());

        this.setState({
            vehicleRule: data.vehicleRule,
            driverRule: data.driverRule,
            equipmentRule: data.equipmentRule,
            carrierRule: data.carrierRule,
            dslRule: data.dslRule
        });
    }

    handleSaveVehicleRule(data) {
        CustomerWarehouseRuleService.saveVehicleRule(
            this.state.warehouse.id,
            data
        ).then(response => {
                this.setState({vehicleRule: response.data}, Notify.showSuccess("Vehicle Rule was saved successfully"));
            }
        ).catch((error) => {
            Notify.showError(error);
            console.log("Error:" + error);
        });
    }
    handleSaveCarrierRule(data) {
        CustomerWarehouseRuleService.saveCarrierRule(
            this.state.warehouse.id,
            data
        ).then(response => {
                this.setState({carrierRule: response.data}, Notify.showSuccess("Carrier Rule was saved successfully"));
            }
        ).catch((error) => {
            Notify.showError(error);
            console.log("Error:" + error);
        });
    }

    handleSaveDriverRule(data) {
        CustomerWarehouseRuleService.saveDriverRule(
            this.state.warehouse.id,
            data
        ).then(response => {
                this.setState({driverRule: response.data}, Notify.showSuccess("Driver Rule was saved successfully"));
            }
        ).catch((error) => {
            Notify.showError(error);
            console.log("Error:" + error);
        });
    }

    handleSaveEquipmentRule(data) {
        CustomerWarehouseRuleService.saveEquipmentRule(
            this.state.warehouse.id,
            data
        ).then(response => {
                let data = response.data;
                data.forEach(d => d._uikey = uuid.v4());
                this.setState({equipmentRule: response.data}, Notify.showSuccess("Equipment Rules were saved successfully"));
            }
        ).catch((error) => {
            Notify.showError(error);
            console.log("Error:" + error);
        });
    }

    handleSaveAdvancedRule(data) {
        WarehouseRuleService.saveAdvancedRule(
            this.state.warehouse.id,
            data
        ).then(response => {
                let data = response.data;
                data.forEach(d => d._uikey = uuid.v4());
                this.setState({dslRule: data}, Notify.showSuccess("Advanced Rules were saved successfully"));
            }
        ).catch((error) => {
            Notify.showError(error);
            console.log("Error:" + error);
        });
    }

    renderRules(){
        let lookup = this.state.lookup;
        if(!this.state.warehouse){
            return null;
        }
        return(
            <Card>
                <Grid>
                    <GridCell width = "1-1" noMargin = {true}>
                        <CarrierRule lookup = {lookup}
                                     data = {this.state.carrierRule}
                                     onSave={data => this.handleSaveCarrierRule(data)} />
                    </GridCell>
                    <GridCell width = "1-1">
                        <EquipmentRule lookup={lookup}
                                       data={this.state.equipmentRule}
                                       saveHandler={data => this.handleSaveEquipmentRule(data)} />
                    </GridCell>
                    {/* <GridCell width = "1-1">
                        <VehicleRule lookup={lookup}
                                     data={this.state.vehicleRule}
                                     saveHandler={data => this.handleSaveVehicleRule(data)} />
                    </GridCell>
                    <GridCell width = "1-1">
                        <DriverRule data={this.state.driverRule}
                                    lookup = {lookup}
                                    saveHandler={data => this.handleSaveDriverRule(data)} />
                    </GridCell> */}
                </Grid>
            </Card>
        );
    }
    renderDslRules(){
        let lookup = this.state.lookup;
        if(!this.state.warehouse){
            return null;
        }
        return(
            <DSLRule lookup={lookup} data={this.state.dslRule}
                     saveHandler={(data) => {
                         this.handleSaveAdvancedRule(data)
                     }}
                     schemaServiceUrlPrefix={"/order-service/schema?className="}
                     rootClass={"ekol.orders.domain.TransportOrder"}>
            </DSLRule>
        );
    }

    render() {
        let company = this.state.company;
        let warehouse = this.state.warehouse;
        return (
            <div>
                <PageHeader title="General Location Rules"/>
                <Card>
                    <Grid>
                        <GridCell width="2-3" noMargin={true} >
                            <CompanyLocationSearchAutoComplete
                                readOnly={this.props.location.query && this.props.location.query.locationId}
                                companyLabel="Company" locationLabel="Location" inline={true}
                                value={{company: company, location: warehouse}}
                                onChange = {value => this.handleCompanyAndWarehouseSelection(value)} />
                        </GridCell>
                        <GridCell width="1-2" noMargin={true} />
                    </Grid>
                </Card>
                {this.renderRules()}
                {/* {this.renderDslRules()} */}
            </div>
        );
    }
}