import _ from "lodash";
import * as axios from 'axios';
import React from "react";
import uuid from 'uuid';

import {TranslatingComponent} from 'susam-components/abstract';
import {Page, Grid, GridCell, Card, Loader, PageHeader} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown} from "susam-components/basic";

import {AssignmentPlanningRuleService, CommonService, ZoneService, AuthorizationService, WarehouseService} from "../../services";

import {AssignmentPlanningList} from './AssignmentPlanningList';
import {AssignmentPlanningForm} from './AssignmentPlanningForm';

import {ResponsibilityRule} from "./rule/ResponsibilityRule";
import {BaseResponsibilityRuleSingle} from "./baserulesingle/BaseResponsibilityRuleSingle";
import {BaseResponsibilityRuleMultiple} from "./baserulemultiple/BaseResponsibilityRuleMultiple";


export class AssignmentPlanningRule extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {
            lookup: {},
            selectedItem: this.createNew(),
            defaultRuleId: props.location.query.id ? props.location.query.id : null,
            defaultRuleTypeId: props.location.query.ruleTypeId ? props.location.query.ruleTypeId : null,
            defaultOperationRegionId: props.location.query.operationRegionId ? props.location.query.operationRegionId : null,
            defaultRegionId: props.location.query.regionId ? props.location.query.regionId : null,
        };
    };

    componentDidMount() {
        this.loadPageData();
    }

    findOperationRegionAndRegion(operationRegions, ruleTypes) {

        let ruleTypeId = this.state.defaultRuleTypeId;
        let operationRegionId = this.state.defaultOperationRegionId;
        let regionId = this.state.defaultRegionId;


        let ruleType = ruleTypes.find(rt => rt.id == ruleTypeId);
        if (!ruleType) {
            return null;
        }

        let operationRegion = operationRegions.find(or => or.id == operationRegionId);
        if (!operationRegion) {
            return null
        }

        let region;

        if (ruleTypeId == AssignmentPlanningRuleService.RULETYPE_COLLECTION_ID) {
            region = operationRegion.collectionRegions.find(r => r.id == regionId);
        } else if (ruleTypeId == AssignmentPlanningRuleService.RULETYPE_DISTRIBUTION_ID) {
            region = operationRegion.distributionRegions.find(r => r.id == regionId);
        }

        let data = {};
        data.ruleType = ruleType;
        data.operationRegion = operationRegion;
        data.region = region;

        return data;
    }

    loadPageData() {
        axios.all([
            AssignmentPlanningRuleService.assingmentPlanRuleTypes(),
            CommonService.getTruckLoadTypes(),
            ZoneService.getOperationRegionListAccordingToQueryThree(),
            AuthorizationService.getSubsidiaries(),
            WarehouseService.retrieveWarehousesNameIdPair()
        ]).then(axios.spread((types, loadTypes, operationRegions, subsidiaries, warehouse) => {
            let state = _.cloneDeep(this.state);
            state.lookup.types = types.data;
            state.lookup.loadTypes = loadTypes.data;
            state.lookup.operationRegion = operationRegions.data;
            state.lookup.subsidiaries = subsidiaries.data;
            state.lookup.warehouse = warehouse.data;

            let selectedRegionData = this.findOperationRegionAndRegion(state.lookup.operationRegion, state.lookup.types);

            if(selectedRegionData) {
                state.selectedItem = this.createNew(selectedRegionData.ruleType, selectedRegionData.operationRegion, selectedRegionData.region);
            }

            this.setState(state, () => {
                this.loadList(this.state.defaultRuleId);
            });
        })).catch(error => {
            Notify.showError(error);
        });
    }

    loadList(defaultRuleId) {
        AssignmentPlanningRuleService.assignmentPlanningList().then((response) => {
            let selectedItem;
            let state = _.cloneDeep(this.state);
            state.ruleSets = response.data;
            state.ruleSets.forEach(ruleSet => {
                ruleSet._key = uuid.v4();
                if(ruleSet.assignmentPlanningRules) {
                    ruleSet.assignmentPlanningRules.forEach(rule => {
                        rule._key = uuid.v4();
                    })
                }
                if(ruleSet.id == defaultRuleId) {
                    selectedItem = ruleSet;
                }
            });
            this.setState(state, () => {
                if(selectedItem) {
                    this.handleSelectFromList(selectedItem);
                }
            });
        }).catch(error => {
            Notify.showError(error);
        });
    }

    createNew(ruleType, operationRegion, region) {
        let newItem = {};
        newItem._key = uuid.v4();
        if(ruleType) {
            newItem.ruleType = ruleType;
        }
        if(operationRegion) {
            newItem.operationRegion = operationRegion;
        }
        if(region) {
            newItem.region = region;
        }
        newItem.assignmentPlanningRules = [];
        newItem.baseAssignmentPlanningRules = [];
        return newItem;
    }

    handleSelectFromList(item) {
        this.setState({selectedItem: _.cloneDeep(item)});
    }

    handleRuleSetDataUpdate(key, value) {
        let selectedItem;
        if(key == "ruleType") {
            selectedItem = this.createNew();
        } else {
            selectedItem = _.cloneDeep(this.state.selectedItem);
        }
        _.set(selectedItem, key, value);
        this.setState({selectedItem: selectedItem});
    }

    handleCreate() {
        this.setState({
            selectedItem: this.createNew()
        })
    }

    handleSave() {
        let item = _.cloneDeep(this.state.selectedItem);
        AssignmentPlanningRuleService.save(item).then(response => {
            Notify.showSuccess("Assignment Planning Rule saved successfully");
            this.handleCreate();
            this.loadList(item.id);
        }).catch(error => {
            Notify.showError(error);
        })
    }

    handleDelete() {
        let item = _.cloneDeep(this.state.selectedItem);
        if (item.id) {
            UIkit.modal.confirm("Are you sure?", () => {
                AssignmentPlanningRuleService.delete(item.id).then(response => {
                    Notify.showSuccess("Assignment Planning Rule deleted");
                    this.loadList();
                    this.handleCreate();
                }).catch(error => {
                    Notify.showError(error);
                });
            });
        }
        else {
            Notify.showError("You need to choose an item first");
        }
    }

    handleChangeBaseRuleOfSingleBaseRuleset(data) {
        let selectedItem = this.state.selectedItem;
        selectedItem.baseAssignmentPlanningRules = [];
        if(data) {
            selectedItem.baseAssignmentPlanningRules.push(data);
        }
        this.setState({selectedItem: selectedItem});
    }

    handleSaveRuleOfSelectedBaseRuleset(ruleItem, callback) {
        let selectedItem = this.state.selectedItem;

        let index = selectedItem.baseAssignmentPlanningRules.findIndex(r => {return r._key == ruleItem._key});
        if(index > -1) {
            selectedItem.baseAssignmentPlanningRules.splice(index, 1, ruleItem);
        } else {
            selectedItem.baseAssignmentPlanningRules.push(ruleItem);
        }
        this.setState({selectedItem: selectedItem}, () => {callback()});
    }

    handleDeleteRuleOfSelectedBaseRuleset(rule) {
        Notify.confirm("Are you sure?", () => {
            let selectedItem = this.state.selectedItem;
            let index = selectedItem.baseAssignmentPlanningRules.findIndex(r => {return r._key == rule._key});
            selectedItem.baseAssignmentPlanningRules.splice(index, 1);
            this.setState({selectedItem: selectedItem});
        });
    }

    handleSaveRuleOfSelectedRuleset(ruleItem, callback) {
        let selectedItem = this.state.selectedItem;

        let index = selectedItem.assignmentPlanningRules.findIndex(r => {return r._key == ruleItem._key});
        if(index > -1) {
            selectedItem.assignmentPlanningRules.splice(index, 1, ruleItem);
        } else {
            selectedItem.assignmentPlanningRules.push(ruleItem);
        }
        this.setState({selectedItem: selectedItem}, () => {callback()});
    }


    handleDeleteRuleOfSelectedRuleSet(rule) {
        Notify.confirm("Are you sure?", () => {
            let selectedItem = this.state.selectedItem;
            let index = selectedItem.assignmentPlanningRules.findIndex(r => {return r._key == rule._key});
            selectedItem.assignmentPlanningRules.splice(index, 1);
            this.setState({selectedItem: selectedItem});
        });
    }

    renderRuleList() {
        return  <AssignmentPlanningList data={this.state.ruleSets}
                                        types={this.state.lookup.types}
                                        selectedItem={this.state.selectedItem}
                                        onselect={(value) => this.handleSelectFromList(value)}
                                        height={this.state.height}/>;
    }

    renderRuleForm() {
        return <AssignmentPlanningForm lookup={this.state.lookup}
                                       data={this.state.selectedItem}
                                       ruleSetDataUpdateHandler={(key, value) => this.handleRuleSetDataUpdate(key, value)}/>;
    }

    renderBaseRule() {
        let selectedItem = this.state.selectedItem;

        if (!selectedItem.ruleType) {
            return null;
        }

        if (selectedItem.ruleType.id == AssignmentPlanningRuleService.RULETYPE_LINEHAUL_ID) {
            return <BaseResponsibilityRuleMultiple ruleType={selectedItem ? selectedItem.ruleType : null}
                                               dataKey={selectedItem._key}
                                               lookup={this.state.lookup}
                                               data={selectedItem ? selectedItem.baseAssignmentPlanningRules : null}
                                               saveHandler={(ruleItem, callback) => this.handleSaveRuleOfSelectedBaseRuleset(ruleItem, callback)}
                                               deleteHandler={(ruleItem) => this.handleDeleteRuleOfSelectedBaseRuleset(ruleItem)}/>
        } else {
            return <BaseResponsibilityRuleSingle ruleType={selectedItem ? selectedItem.ruleType : null}
                                                 dataKey={selectedItem._key}
                                                 lookup={this.state.lookup}
                                                 data={selectedItem ? selectedItem.baseAssignmentPlanningRules : null}
                                                 dataUpdateHandler={(ruleItem) => this.handleChangeBaseRuleOfSingleBaseRuleset(ruleItem)}/>
        }

    }

    renderResponsibilityRule() {
        let selectedItem = this.state.selectedItem;
        return <ResponsibilityRule ruleType={selectedItem ? selectedItem.ruleType : null}
                                   dataKey={selectedItem._key}
                                   lookup={this.state.lookup}
                                   data={selectedItem ? selectedItem.assignmentPlanningRules : null}
                                   saveHandler={(ruleItem, callback) => this.handleSaveRuleOfSelectedRuleset(ruleItem, callback)}
                                   deleteHandler={(ruleItem) => this.handleDeleteRuleOfSelectedRuleSet(ruleItem)}/>
    }

    render() {
        let title = super.translate("Warehouse and Planning Assignment Rules");

        return (
            <div>
                <Page title={title} toolbarItems={[
                    {
                        name: "Create",
                        library: "material",
                        icon: "note_add",
                        onclick: () => this.handleCreate(),
                        inDropdown: false
                    },
                    {
                        name: "Save",
                        library: "material",
                        icon: "save",
                        onclick: () => this.handleSave(),
                        inDropdown: false
                    },
                    {
                        name: "Delete",
                        library: "material",
                        icon: "delete",
                        onclick: () => this.handleDelete(),
                        inDropdown: true
                    }]}>

                    <Grid divider={true}>
                        <GridCell width="1-5" noMargin={true}>
                            <Grid >
                                <GridCell width="1-1" noMargin={true}>
                                    {this.renderRuleList()}
                                </GridCell>
                            </Grid>
                        </GridCell>
                        <GridCell width="4-5" noMargin={true}>
                            <Grid >
                                <GridCell width="1-1" noMargin={true}>
                                    {this.renderRuleForm()}
                                </GridCell>
                                <GridCell width="1-1">
                                    {this.renderBaseRule()}
                                </GridCell>
                                <GridCell width="1-1">
                                    {this.renderResponsibilityRule()}
                                </GridCell>
                            </Grid>
                        </GridCell>
                    </Grid>
                </Page>
            </div>
        );
    }
}
