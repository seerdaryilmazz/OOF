import _ from "lodash";
import React from "react";
import uuid from 'uuid';

import {TranslatingComponent} from 'susam-components/abstract';
import {Page, Grid, GridCell, Card, Loader, CardHeader} from "susam-components/layout";
import {Button, Notify} from "susam-components/basic";

import {AssignmentPlanningRuleService} from "../../services";

import {RegionCard} from './RegionCard';


export class OperationRegionSection extends TranslatingComponent {
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
        state.operationRegion = props.operationRegion;
        state.rules = props.rules;
        state.lookup = props.lookup;

        this.setState(state);
    }

    renderRegions(regions, rules, ruleType) {

        let regionCards = [];

        let operationRegion = this.state.operationRegion;

        regions.forEach(region => {

            let relatedRuleArr = rules.filter(rule => rule.ruleType.id == ruleType.id && rule.operationRegion.id == operationRegion.id && rule.region.id == region.id)

            let relatedRule = null;
            let exception = null;

            if (relatedRuleArr.length == 1) {
                relatedRule = relatedRuleArr[0];
            } else if (relatedRuleArr.length > 1) {
                exception = "Multiple Rules Found for this region!";
            }

            regionCards.push(
                <GridCell key={"cardcell" + region.id} width="1-3">
                    <RegionCard
                        operationRegionId={operationRegion.id}
                        region={region}
                        ruleType={ruleType}
                        rule={relatedRule}
                        exception={exception}
                    />
                </GridCell>
            )
        });

        return regionCards;

    }

    render() {

        let operationRegion = this.state.operationRegion;


        if (!operationRegion) {
            return null;
        }

        let collectionRegions = operationRegion.collectionRegions ? operationRegion.collectionRegions : [];
        let distributionRegions = operationRegion.distributionRegions ? operationRegion.distributionRegions : [];
        let rules = this.state.rules;
        let ruleType = this.state.lookup.ruleType;

        return (
            <div>

                <Grid>
                    <GridCell width="1-1">
                        <CustomCardHeader title={operationRegion.name} >
                            <Button label="edit" size="mini" flat = {true} style="primary"
                                    onclick={() => {window.location = "/ui/management/operation-region-edit?id=" + operationRegion.id}}/>
                            <Button label="delete" size="mini" flat = {true} style="danger"
                                    onclick={() => {this.props.operationRegionDeleteHandler(operationRegion)}}/>
                        </CustomCardHeader>
                    </GridCell>
                    <GridCell width="1-1">
                        <Grid divider = {true}>
                            {this.renderRegions(collectionRegions, rules, ruleType.find(r => r.id == AssignmentPlanningRuleService.RULETYPE_COLLECTION_ID))}
                            {this.renderRegions(distributionRegions, rules, ruleType.find(r => r.id == AssignmentPlanningRuleService.RULETYPE_DISTRIBUTION_ID))}
                        </Grid>
                    </GridCell>
                </Grid>
            </div>
        );
    }
}

export class CustomCardHeader extends TranslatingComponent{

    render(){
        return(
                <h3 className="full_width_in_card md-bg-grey-50" style = {{borderBottom: "1px solid #e0e0e0"}}>
                    {super.translate(this.props.title)}
                    <div className="uk-align-right">
                        {this.props.children}
                    </div>
                </h3>

        );

    }

}

