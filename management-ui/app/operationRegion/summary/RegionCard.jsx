import _ from "lodash";
import React from "react";
import uuid from 'uuid';

import {TranslatingComponent} from 'susam-components/abstract';
import {Page, Grid, GridCell, Card, Loader, CardHeader} from "susam-components/layout";
import {Button, Notify} from "susam-components/basic";

export class RegionCard extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {};
    };

    componentDidMount() {
        this.setData(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.setData(nextProps);
    }

    setData(props) {
        let state = _.cloneDeep(this.state);
        state.region = props.region;
        state.rule = props.rule;
        state.ruleType = props.ruleType;
        state.exception = props.exception;
        state.operationRegionId = props.operationRegionId;

        this.setState(state);
    }


    renderException(title, exception) {
        return (
            <Card>
                <Page title={title} toolbarItems={[
                    {
                        name: "Edit",
                        library: "material",
                        icon: "edit",
                        onclick: () => console.log("clicked"),
                        inDropdown: false
                    }]}>
                    <Grid>
                        <GridCell width="1-1">
                            <span className="uk-text-danger">{exception}</span>
                        </GridCell>
                    </Grid>
                </Page>
            </Card>
        )
    }

    renderBaseRules(baseRule, editButtonUrl) {

        let content;
        if (baseRule) {
            content =
                <Grid>
                    <GridCell width="1-3" noMargin={true}>
                        <span className="uk-text-italic">WH: </span>
                    </GridCell>
                    <GridCell width="2-3" noMargin={true}>
                        <span>{baseRule.warehouse ? baseRule.warehouse.name : "No Warehouse Defined"}</span>
                    </GridCell>
                    <GridCell width="1-3" noMargin={true}>
                        <span className="uk-text-italic">Responsible: </span>
                    </GridCell>
                    <GridCell width="2-3" noMargin={true}>
                        <span>{baseRule.responsible ? baseRule.responsible.name : "No Responsible Defined"}</span>
                    </GridCell>

                </Grid>
        } else {
            content = <span className="uk-text-danger">Not Defined</span>
        }

        return (
            <Grid>
                <GridCell width="1-1" noMargin={true}>
                    <div>
                        <span className="uk-text-bold">Base Rule</span>
                        <div className="uk-align-right">
                            <Button label="edit rules" flat = {true} size="mini" style="warning"
                                    onclick={() => {window.location = editButtonUrl}}/>
                        </div>
                    </div>
                </GridCell>
                <GridCell width="1-1">
                    {content}
                </GridCell>
            </Grid>
        )
    }

    renderSpecificRules(rules) {
        return (
            <Grid>
                <GridCell width="1-1" noMargin={true}>
                    <span className="uk-text-bold">Rules For</span>
                </GridCell>
                <GridCell width="1-3" noMargin={true}>
                </GridCell>
                <GridCell width="2-3" noMargin={true}>
                    <Grid>
                    {rules.map(rule => {
                        return (
                                <GridCell key={"specrule" + rule.orderOwner.id}  width="1-1" noMargin={true}>
                                    <span className="uk-text-italic">{rule.orderOwner ? rule.orderOwner.name : "No Owner Defined"}</span>
                                </GridCell>
                        )
                    })}
                    </Grid>
                </GridCell>
            </Grid>
        )
    }

    render() {

        let region = this.state.region;
        let rule = this.state.rule;
        let ruleType = this.state.ruleType;
        let exception = this.state.exception;

        if (!region) {
            return null;
        }

        let title = region.name + " - " + ruleType.name;

        let baseRule;
        if (rule && rule.baseAssignmentPlanningRules) {
            if (rule.baseAssignmentPlanningRules.length == 1) {
                baseRule = rule.baseAssignmentPlanningRules[0]
            } else if (rule.baseAssignmentPlanningRules.length > 1) {
                exception = exception ? exception : "There exist more than 1 Base Rule!";
            }
        }

        let assignmentRules = (rule && rule.assignmentPlanningRules) ? rule.assignmentPlanningRules : [];

        if (exception) {
            return this.renderException(title, exception);
        }

        let editButtonUrl = "/ui/management/assignmentplanning-rules";
        if(rule) {
            editButtonUrl += "?id=" + rule.id;
        } else {
            editButtonUrl += "?ruleTypeId=" + ruleType.id + "&operationRegionId=" + this.state.operationRegionId + "&regionId=" + region.id;

        }

        return (
            <div>

                <Grid>
                    <GridCell width="1-1" noMargin={true}>
                        <CardHeader title={title}/>
                    </GridCell>
                    <GridCell width="1-1" noMargin={true}>
                        <ul className="md-list">
                            <li>
                                <div className="md-list-content">
                                    <Grid>
                                        <GridCell width="1-1" noMargin={true}>
                                            {this.renderBaseRules(baseRule, editButtonUrl)}
                                        </GridCell>
                                    </Grid>
                                </div>
                            </li>
                            <li>
                                <div className="md-list-content">
                                    <Grid>
                                        <GridCell width="1-1" noMargin={true}>
                                            {this.renderSpecificRules(assignmentRules)}
                                        </GridCell>
                                    </Grid>
                                </div>
                            </li>
                        </ul>
                    </GridCell>
                </Grid>
            </div>
        );
    }
}
