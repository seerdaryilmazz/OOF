import _ from "lodash";
import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, CardHeader} from "susam-components/layout";
import {Notify, DropDown, Form, Span} from "susam-components/basic";
import {Chip} from "susam-components/advanced";

import {RuleService, ZoneService} from "../../services";

import {DistributionScheduleDetails} from './DistributionScheduleDetails';

export class DistributionScheduleForm extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {warehouse: ""};
    }

    componentDidMount(){
        this.initialize(this.props);
    }

    componentWillReceiveProps(nextProps){
        this.initialize(nextProps);
    }

    initialize(props) {

        let selectedItem = props.selectedItem;
        let distributionRegion = null;
        let operationRegion = null;

        if (props.selectedItem && props.selectedItem.distributionRegion && props.selectedItem.distributionRegion.id) {
            distributionRegion = props.selectedItem.distributionRegion;
            operationRegion = ZoneService.findOperationRegionByDistributionRegionId(props.lookups.operationRegions, distributionRegion.id);
            selectedItem.operationRegion = operationRegion;
        }

        this.resolveWarehouse(distributionRegion);
    }

    updateState(keyValuePairs) {
        this.props.onchange && this.props.onchange(keyValuePairs);
    }

    updateStateForSingleProperty(key, value) {
        let keyValuePairs = {};
        _.set(keyValuePairs, key, value);
        this.updateState(keyValuePairs);
    }

    handleOperationRegionSelect(value) {
        this.setState({warehouse: null});
        let keyValuePairs = {
            operationRegion: value,
            distributionRegion: null
        };
        this.updateState(keyValuePairs);
    }

    handleDistributionRegionSelect(value) {
        this.updateStateForSingleProperty("distributionRegion", value);
        this.resolveWarehouse(value);
    }

    resolveWarehouse(distributionRegion) {

        if (!distributionRegion || !distributionRegion.id) {
            this.setState({warehouse: null});
        } else {

            let data = {
                regionId: distributionRegion.id,
                type: {id: "DISTRIBUTION"}
            };

            RuleService.executeScheduleRuleExecutor(data).then(response => {
                let warehouseName = response && response.data && response.data.warehouse ? response.data.warehouse.name : "-";
                this.setState({warehouse: warehouseName});
            }).catch(error => {
                Notify.showError(error);
            });
        }
    }

    validate(){
        return this.form.validate();
    }

    reset(){
        return this.form.reset();
    }

    render(){

        if(!this.props.selectedItem || !this.props.lookups){
            return null;
        }

        return (
        <div>
                <Grid>
                    <GridCell width="1-1" noMargin={true}>
                        <CardHeader title="Region & Priority"/>
                    </GridCell>
                </Grid>
                <Grid>
                    <GridCell width="1-1">
                        <Form ref = {(form) => {this.form = form}} >
                            <Grid>
                                <GridCell width="1-3">
                                    <DropDown label="Operation Region"
                                              options = {this.props.lookups.operationRegions}
                                              value = {this.props.selectedItem.operationRegion}
                                              onchange = {(value) => this.handleOperationRegionSelect(value)}/>
                                </GridCell>
                                <GridCell width="1-3">
                                    <DropDown label="Distribution Region"
                                              options = {this.props.selectedItem.operationRegion ? this.props.selectedItem.operationRegion.distributionRegions : []}
                                              value = {this.props.selectedItem.distributionRegion}
                                              onchange = {(value) => this.handleDistributionRegionSelect(value)}/>
                                </GridCell>
                                <GridCell width="1-3">
                                    <Span label="Warehouse" value = {this.state.warehouse} />
                                </GridCell>
                                <GridCell width="1-3">
                                    <DropDown label="Category"
                                              options = {this.props.lookups.categories}
                                              value = {this.props.selectedItem.category}
                                              onchange = {(value) => this.updateStateForSingleProperty("category", value)}
                                              required = {true} />
                                </GridCell>
                                <GridCell width="1-3">
                                    <Chip label="Service Type"
                                              options = {this.props.lookups.serviceTypes}
                                              value = {this.props.selectedItem.serviceTypes}
                                              onchange = {(value) => this.updateStateForSingleProperty("serviceTypes", value)}
                                              required = {true} />
                                </GridCell>
                            </Grid>
                        </Form>
                    </GridCell>
                    <GridCell width="1-1">
                        <DistributionScheduleDetails data = {this.props.selectedItem.details}
                                                     lookups = {this.props.lookups}
                                                     onchange = {(value) => this.updateStateForSingleProperty("details", value)} />
                    </GridCell>
                </Grid>
        </div>

        );
    }
}

