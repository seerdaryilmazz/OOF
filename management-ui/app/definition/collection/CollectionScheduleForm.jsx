import _ from "lodash";
import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card, Loader, CardHeader, PageHeader} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown, Form, Span} from "susam-components/basic";
import {Chip} from "susam-components/advanced";

import {CollectionScheduleDetails} from './CollectionScheduleDetails';

import {RuleService, ZoneService} from "../../services";

export class CollectionScheduleForm extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {schedule: {}, warehouse: ""};
    }

    componentDidMount(){
        this.initialize(this.props);
    }

    componentWillReceiveProps(nextProps){
        this.initialize(nextProps);
    }

    initialize(props) {

        let schedule = props.data;
        let collectionRegion = null;
        let operationRegion = null;

        if (props.data && props.data.collectionRegion && props.data.collectionRegion.id) {
            collectionRegion = props.data.collectionRegion;
            operationRegion = ZoneService.findOperationRegionByCollectionRegionId(props.lookups.operationRegions, collectionRegion.id);
            schedule.operationRegion = operationRegion;
        }

        this.setState({schedule: schedule});
        this.resolveWarehouse(collectionRegion);
    }

    updateState(key, value){
        let schedule = _.cloneDeep(this.state.schedule);
        _.set(schedule, key, value);
        this.setState({schedule: schedule});
    }

    handleOperationRegionSelect(value) {
        let state = _.cloneDeep(this.state);
        state.schedule.operationRegion = value;
        state.schedule.collectionRegion = null;
        state.warehouse = null;
        this.setState(state);
    }

    handleCollectionRegionSelect(value) {
        this.updateState("collectionRegion", value);
        this.resolveWarehouse(value);
    }

    resolveWarehouse(collectionRegion) {

        if (!collectionRegion || !collectionRegion.id) {
            this.setState({warehouse: null});
        } else {

            let data = {
                regionId: collectionRegion.id,
                type: {id: "COLLECTION"}
            };

            RuleService.executeScheduleRuleExecutor(data).then(response => {
                let warehouseName = response && response.data && response.data.warehouse ? response.data.warehouse.name : "-";
                this.setState({warehouse: warehouseName});
            }).catch(error => {
                Notify.showError(error);
            });
        }
    }

    handleSaveSchedule(){
        if(!this.form.validate()){
            return;
        }
        this.props.onsave && this.props.onsave(this.state.schedule);
    }

    handleDeleteSchedule(){
        this.props.ondelete && this.props.ondelete(this.state.schedule);
    }

    render(){
        if(!this.state.schedule || !this.props.lookups){
            return null;
        }
        return (
            <Grid>
                <GridCell width="1-1">
                    <Form ref = {(c) => this.form = c} >
                        <Grid>
                            <GridCell width="1-3">
                                <DropDown label="Operation Region"
                                          options = {this.props.lookups.operationRegions}
                                          value = {this.state.schedule.operationRegion}
                                          onchange = {(value) => this.handleOperationRegionSelect(value)}/>
                            </GridCell>
                            <GridCell width="1-3">
                                <DropDown label="Collection Region"
                                          options = {this.state.schedule.operationRegion ? this.state.schedule.operationRegion.collectionRegions : []}
                                          value = {this.state.schedule.collectionRegion}
                                          onchange = {(value) => this.handleCollectionRegionSelect(value)}/>
                            </GridCell>
                            <GridCell width="1-3">
                                <Span label="Warehouse" value = {this.state.warehouse} />
                            </GridCell>
                            <GridCell width="1-3">
                                <DropDown label="Category"
                                          options = {this.props.lookups.categories}
                                          value = {this.state.schedule.category}
                                          onchange = {(value) => this.updateState("category", value)}
                                          required = {true} />
                            </GridCell>
                            <GridCell width="1-3">
                                <Chip label="Service Type"
                                          options = {this.props.lookups.serviceTypes}
                                          value = {this.state.schedule.serviceTypes}
                                          onchange = {(value) => this.updateState("serviceTypes", value)}
                                          required = {true} />
                            </GridCell>
                        </Grid>
                    </Form>
                </GridCell>
                <GridCell width="1-1">
                    <CollectionScheduleDetails data = {this.state.schedule.details}
                                               lookups = {this.props.lookups}
                                               onchange = {(value) => this.updateState("details", value)}/>
                </GridCell>
                <GridCell width="1-1">
                    <div className="uk-align-left">
                        <Button label="delete" waves = {true} style="danger" disabled = {!this.state.schedule.id}
                                onclick = {() => {this.handleDeleteSchedule()}} />
                    </div>
                    <div className="uk-align-right">
                        <Button label="save" waves = {true} style="primary"
                                onclick = {() => {this.handleSaveSchedule()}} />
                    </div>
                </GridCell>
            </Grid>
        );
    }
}

