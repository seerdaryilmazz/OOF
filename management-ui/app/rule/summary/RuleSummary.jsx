import React from "react";
import * as axios from 'axios';
import uuid from "uuid";

import {TranslatingComponent} from 'susam-components/abstract';
import {PageHeader, Card, Grid, GridCell, CardHeader} from "susam-components/layout";
import {DropDown, Notify} from "susam-components/basic";
import {Chip} from "susam-components/advanced";

import {RuleService} from '../../services';

import {RuleSummaryCard} from './RuleSummaryCard';
import {RuleTest} from './RuleTest';


export class RuleSummary extends TranslatingComponent {


    constructor(props) {
        super(props);
        this.state = {data: {}}
        this.ruleConstants = [
            {
                identifier: "productRuleSet",
                title: "Product Rule Set",
                homeUrl: "/ui/management-/product-rules"
            },
            {
                identifier: "packageRuleSet",
                title: "Package Group Rule Set",
                homeUrl: "/ui/management/packages-rules"
            },
            {
                identifier: "warehouseRuleSet",
                title: "Warehouse Rule Set",
                homeUrl: "/ui/management/warehouses-rules"
            },
            {
                identifier: "truckLoadTypeRuleSet",
                title: "Truck Load Type Rule Set",
                homeUrl: "/ui/management/loadtypes-rules"
            },
            {
                identifier: "loadSpecRuleSet",
                title: "Load Specifications Rule Set",
                homeUrl: "/ui/management/loadspecs-rules"
            },
            {
                identifier: "carrierUnitModelRuleSet",
                title: "Carrier Unit Model Rule Set",
                homeUrl: "/ui/management/carrierunitmodel-rules"
            },
            {
                identifier: "countryPlanningRuleSet",
                title: "Country Planning Rule Set",
                homeUrl: "/ui/management/countryplanning-rules"
            },
            {
                identifier: "customerWarehouseRuleSet",
                title: "Customer Warehouse Rule Set",
                homeUrl: "/ui/management/customerwarehouses-rules"
            },
            {
                identifier: "incotermsRuleSet",
                title: "Incoterm Rule Set",
                homeUrl: "/ui/management/incoterms-rules"
            },
            {
                identifier: "motorVehicleProfileRuleSet",
                title: "Motor Vehicle Profile Rule Set",
                homeUrl: "/ui/management/motor-vehicle-profile-rules"
            },
            {
                identifier: "motorVehicleTypeRuleSet",
                title: "Motor Vehicle Type Rule Set",
                homeUrl: "/ui/management/motor-vehicle-type-rules"
            },
            {
                identifier: "senderRuleSet",
                title: "Sender Rule Set",
                homeUrl: "/ui/management/sender-rules"
            },
            {
                identifier: "trailerRuleSet",
                title: "Trailer Rule Set",
                homeUrl: "/ui/management/trailer-rules"
            },
            {
                identifier: "assignmentPlanningRuleSet",
                title: "Assignment Plan Rule Set",
                homeUrl: "/ui/management/assignmentplanning-rules"
            },
            {
                identifier: "collectionScheduleRuleSet",
                title: "Collection Schedule Rule Set",
                homeUrl: "/ui/management/collection-schedule-rules"
            },
            {
                identifier: "distributionScheduleRuleSet",
                title: "Distribution Schedule Rule Set",
                homeUrl: "/ui/management/distribution-schedule-rules"
            }
        ];

    }

    componentDidMount() {
        RuleService.retrieveRuleSummary().then(response => {
                this.setState({data: response.data});
            }
        ).catch((error) => {
            Notify.showError("An Error Occured While Loading Rules", error);
            console.log("Error:" + error);
        });
    }

    constructRuleCards() {

        let data = this.state.data;

        return this.ruleConstants.map(ruleConstant => {
            return (
                <RuleSummaryCard key={ruleConstant.homeUrl + ruleConstant.title} title={ruleConstant.title}
                                 url={ruleConstant.homeUrl}
                                 data={data[ruleConstant.identifier]}/>
            );
        });
    }

    render() {

        return (
            <div>
                <PageHeader title="Rule Summary"/>
                <RuleTest></RuleTest>
                <Grid>
                    {this.constructRuleCards()}
                </Grid>
            </div>
        );
    }
}