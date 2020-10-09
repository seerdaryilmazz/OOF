import _ from "lodash";
import * as axios from 'axios';
import uuid from "uuid";

import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {Page, Grid, GridCell, Card, Loader, PageHeader, CardHeader} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown} from "susam-components/basic";

import {AssignmentPlanningRuleService} from "../../../services";

export class ResponsibilityRuleForm extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {
            lookup: {},
            selectedItem: {}
        };
    };

    componentDidMount() {
        this.findRegionAndType(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.findRegionAndType(nextProps);
    }

    findRegionAndType(props) {
        let data = props.data;
        let lookup = props.lookup;

        if (data && data.operationRegion && lookup && lookup.operationRegion) {
            let operationRegion = _.find(lookup.operationRegion, {id: data.operationRegion.id});
            this.setState({colDistRegion: operationRegion.distributionRegions});

        }
    }

    updateOperationRegion(value) {
        let selectedItem = _.cloneDeep(this.state.selectedItem);
        selectedItem.operationRegion = value;
        this.setState({selectedItem: selectedItem}, () => {
            if (value) {
                let operationRegion = _.find(this.props.lookup.operationRegion, {id: value.id});
                this.setState({regionOptions: operationRegion})
            } else {
                this.setState({regionOptions: null})
            }
        });
    }

    selectHandler(item) {
        this.setState({selectedItem: item})
    }

    renderCommonElements() {

        let data = this.props.data;
        let lookup = this.props.lookup;

        return (
            <GridCell width="1-2" noMargin={true}>
                <Grid>
                    <GridCell width="1-2">
                        <DropDown options={lookup.subsidiaries}
                                  label="Owner of Order"
                                  value={data.orderOwner}
                                  onchange={(value) => this.props.ruleDataUpdateHandler("orderOwner", value)}
                                  required={true}/>
                    </GridCell>
                    <GridCell width="1-2">
                        <DropDown options={lookup.subsidiaries}
                                  label="Responsible"
                                  value={data.responsible}
                                  onchange={(value) => this.props.ruleDataUpdateHandler("responsible", value)}
                                  required={true}/>
                    </GridCell>
                </Grid>
            </GridCell>
        )
    }

    renderLinehaulElements() {

        let ruleType = this.props.ruleType;

        if (ruleType.id != AssignmentPlanningRuleService.RULETYPE_LINEHAUL_ID) {
            return null;
        }

        let data = this.props.data;
        let lookup = this.props.lookup;

        return (
            <GridCell width="1-2" noMargin={true}>
                <Grid>
                    <GridCell width="1-2">
                        <DropDown options={lookup.operationRegion}
                                  label="To Operation Region"
                                  value={data.operationRegion}
                                  onchange={(value) => this.props.ruleDataUpdateHandler("operationRegion", value)}
                                  required={true}/>
                    </GridCell>
                    <GridCell width="1-2">
                        <DropDown options={this.state.colDistRegion}
                                  label="To Region"
                                  value={data.region}
                                  onchange={(value) => this.props.ruleDataUpdateHandler("region", value)}
                                  required={true}/>
                    </GridCell>
                </Grid>
            </GridCell>
        )
    }

    renderNonLinehaulElements() {

        let ruleType = this.props.ruleType;

        if (ruleType.id == AssignmentPlanningRuleService.RULETYPE_LINEHAUL_ID) {
            return null;
        }

        let data = this.props.data;
        let lookup = this.props.lookup;

        return (
            <GridCell width="1-2" noMargin={true}>
                <Grid>
                    <GridCell width="1-2">
                        <DropDown options={lookup.warehouse}
                                  label="Warehouse"
                                  value={data.warehouse}
                                  onchange={(value) => this.props.ruleDataUpdateHandler("warehouse", value)}
                                  required={true}/>
                    </GridCell>
                </Grid>
            </GridCell>
        )
    }

    render() {

        let data = this.props.data;
        let lookup = this.props.lookup;
        let ruleType = this.props.ruleType;

        if (!ruleType || !data || !lookup) {
            return null;
        }

        return (
            <Grid>
                {this.renderLinehaulElements()}
                {this.renderCommonElements()}
                {this.renderNonLinehaulElements()}
            </Grid>
        )
    }
}
