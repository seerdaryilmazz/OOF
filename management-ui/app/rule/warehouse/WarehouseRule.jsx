import React from "react";
import * as axios from 'axios';
import uuid from "uuid";

import {TranslatingComponent} from 'susam-components/abstract';
import {PageHeader, Card, Grid, GridCell, CardHeader} from "susam-components/layout";
import {DropDown, Notify} from "susam-components/basic";
import {Chip} from "susam-components/advanced";

import {WarehouseRuleService, WarehouseService, CommonService} from '../../services';

import {PackageHandlingRule} from './PackageHandlingRule';
import {RFUsageRule} from './RFUsageRule';
import {DSLRule} from '../common/DSLRule';

export class WarehouseRule extends TranslatingComponent {


    constructor(props) {
        super(props);
        this.state = {data: {}, lookup: {}}
    }

    componentDidMount() {
        axios.all([
            WarehouseService.retrieveWarehousesNameIdPair(),
            CommonService.retrievePackageGroups(),
            CommonService.retrieveWarehouseZoneTypes(),
            CommonService.retrieveWarehousePackageHandlingTypes(),
            CommonService.retrieveRangeTypes(),
            CommonService.retrieveDSLTypes()
        ])
            .then(axios.spread((warehouses, packageGroups, warehouseZoneTypes, warehousePackageHandlingTypes, rangeTypes, dslTypes) => {
                let state = _.cloneDeep(this.state);

                state.lookup.warehouse = warehouses.data;
                state.lookup.packageGroup = packageGroups.data;
                state.lookup.warehouseZoneType = warehouseZoneTypes.data;
                state.lookup.warehousePackageHandlingType = warehousePackageHandlingTypes.data;
                state.lookup.rangeType = rangeTypes.data;
                state.lookup.dslType = dslTypes.data;

                this.setState(state);
            })).catch((error) => {
            Notify.showError(error);
            console.log("Error:" + error);
        });
    }

    handleWarehouseSelection(value) {
        this.setState({warehouse: value}, () => {
            this.loadWarehouseRules()
        });
    }


    loadWarehouseRules() {

        let warehouse = this.state.warehouse;

        if (warehouse && warehouse.id) {
            WarehouseRuleService.retrieveWarehouseRule(warehouse.id).then(response => {
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
            packageHandlingRule: [],
            rfUsageRule: {},
            dslRule: []
        });
    }

    handleRenderData(data) {
        data.packageHandlingRule.forEach(d => d._uikey = uuid.v4());
        data.dslRule.forEach(d => d._uikey = uuid.v4());

        this.setState({
            packageHandlingRule: data.packageHandlingRule,
            rfUsageRule: data.rfUsageRule,
            dslRule: data.dslRule
        });
    }
    
    handleSavePackageHandlingRule(data) {
        WarehouseRuleService.savePackageHandlingRule(
            this.state.warehouse.id,
            data
        ).then(response => {
                let data = response.data;
                data.forEach(d => d._uikey = uuid.v4());
                this.setState({packageHandlingRule: data}, Notify.showSuccess("Package Handling Rules were saved successfully"));
            }
        ).catch((error) => {
            Notify.showError(error);
            console.log("Error:" + error);
        });
    }

    handleSaveRFUsageRule(data) {
        WarehouseRuleService.saveRFUsageRule(
            this.state.warehouse.id,
            data
        ).then(response => {
                this.setState({rfUsageRule: response.data}, Notify.showSuccess("RF Usage Rule were saved successfully"));
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

    render() {

        let lookup = this.state.lookup;
        let warehouse = this.state.warehouse;

        let warehouseSelection = [];

        let pageContent = [];


        warehouseSelection.push(
            <GridCell key="pgs" width="1-5" noMargin={true}>
                <DropDown label="Warehouse" options={lookup.warehouse} value={warehouse}
                          onchange={(e) => this.handleWarehouseSelection(e)}/>
            </GridCell>);

        if (warehouse) {

            pageContent.push(
                <GridCell key="whhr" width="1-1">
                    <PackageHandlingRule lookup={lookup} data={this.state.packageHandlingRule}
                                         saveHandler={(data) => {this.handleSavePackageHandlingRule(data)}}></PackageHandlingRule>
                </GridCell>);

            pageContent.push(
                <GridCell key="rfur" width="1-1">
                    <RFUsageRule
                        data={this.state.rfUsageRule}
                        saveHandler={(data) => {this.handleSaveRFUsageRule(data)}}>
                    </RFUsageRule>
                </GridCell>
            );

            pageContent.push(
                <GridCell key="dslr" width="1-1">
                    <DSLRule lookup={lookup} data={this.state.dslRule}
                             saveHandler={(data) => {this.handleSaveAdvancedRule(data)}}
                             schemaServiceUrlPrefix={"/order-service/schema?className="}
                             rootClass={"ekol.orders.domain.TransportOrder"}>

                    </DSLRule>
                </GridCell>
            );
        }

        let pageContentElem = null;

        if (pageContent.length > 0) {
            pageContentElem =
                <Grid>
                    {pageContent}
                </Grid>
        }

        return (
            <div>
                <PageHeader title="Warehouse Rule Set Management"/>
                <Card>
                    <Grid>
                        {warehouseSelection}
                    </Grid>
                </Card>
                {pageContentElem}
            </div>
        );
    }
}