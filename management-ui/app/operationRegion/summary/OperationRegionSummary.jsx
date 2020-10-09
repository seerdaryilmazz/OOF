import _ from "lodash";
import * as axios from 'axios';
import React from "react";
import uuid from 'uuid';

import {TranslatingComponent} from 'susam-components/abstract';
import {Page, Grid, GridCell, Card, Loader, PageHeader, HeaderWithBackground} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown} from "susam-components/basic";

import {AssignmentPlanningRuleService, ZoneService} from "../../services";

import {OperationRegionSection} from './OperationRegionSection';


export class OperationRegionSummary extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {
            lookup: {},
            loaded: false
        };
    };

    componentDidMount() {
        this.loadPageData();
    }

    loadPageData() {
        axios.all([
            ZoneService.getOperationRegionListAccordingToQueryThree(),
            AssignmentPlanningRuleService.assignmentPlanningList(),
            AssignmentPlanningRuleService.assingmentPlanRuleTypes()
        ]).then(axios.spread((operationRegions, rules, ruleTypes) => {
            let state = _.cloneDeep(this.state);
            state.operationRegions = operationRegions.data;
            state.rules = rules.data;
            state.lookup.ruleType = ruleTypes.data;
            state.loaded = true;
            this.setState(state)
        })).catch(error => {
            Notify.showError(error);
        });
    }

    handleCreateNewClick() {
        window.location = "/ui/management/operation-region-edit";
    }

    handleDeleteClick(operationRegion) {
        Notify.confirm("Are you sure you want to delete operation region with name " + operationRegion.name + "?", () => {
            ZoneService.deleteOperationRegion(operationRegion.id).then(response => {
                Notify.showSuccess("Operation region deleted.");
                this.loadPageData();
            }).catch(e => {
                Notify.showError(e);
            });
        });
    }

    renderContent() {

        let operationRegions = this.state.operationRegions;
        let rules = this.state.rules;
        let lookup = this.state.lookup;

        if (!operationRegions) {
            if (this.state.loaded) {
                return <span>No Data</span>
            } else {
                return <span>Loading...</span>
            }
        }

        if (!rules) {
            rules = [];
        }

        let operationRegionSections = [];

        operationRegions.forEach(operationRegion => {
            operationRegionSections.push(
                <GridCell key={"section" + operationRegion.id} width="1-1">
                    <OperationRegionSection
                        lookup={lookup}
                        operationRegion={operationRegion}
                        rules={rules.filter(rule => rule.operationRegion.id == operationRegion.id)}
                        operationRegionDeleteHandler={(operationRegionId) => this.handleDeleteClick(operationRegion)}/>
                </GridCell>
            )
        });

        return operationRegionSections;
    }


    render() {

        return (
            <Page title="Operation Regions" toolbarItems={[
                {name: "Create", library: "material", icon: "note_add", onclick: () => this.handleCreateNewClick(), inDropdown: false}
            ]}>
                {this.renderContent()}
            </Page>
        );
    }
}
