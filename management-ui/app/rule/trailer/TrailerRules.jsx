import _ from "lodash";
import * as axios from 'axios';
import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card, Loader, PageHeader, CardHeader} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown, Form} from "susam-components/basic";
import {NumericInput} from "susam-components/advanced";

import {GpsRule} from './GpsRule';
import {UsabilityRule} from './UsabilityRule';

import {MotorVehicleTypeRuleService, TrailerRuleService, VehicleService} from "../../services";

export class TrailerRules extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {lookups: {}};
    }

    refreshRules(){
        TrailerRuleService.getRuleSetForTrailers().then(response => {
            let state = _.cloneDeep(this.state);
            state.ruleSet = response.data;
            this.setState(state);
        }).catch(error => {
            Notify.showError(error);
        })
    }

    componentDidMount(){
        axios.all([
            TrailerRuleService.getTrailerDocumentTypes(),
            MotorVehicleTypeRuleService.listServiceTypes(),
            MotorVehicleTypeRuleService.listTripTypes(),
            TrailerRuleService.getRuleSetForTrailers()
        ]).then(axios.spread((documentTypes, serviceTypes, tripTypes, rules) => {
            let state = _.cloneDeep(this.state);
            state.lookups = {};
            state.lookups.documentTypes = documentTypes.data;
            state.lookups.serviceTypes = serviceTypes.data;
            state.lookups.tripTypes = tripTypes.data;
            state.ruleSet = rules.data;
            this.setState(state);
        })).catch((error) => {
            Notify.showError(error);
        });
    }


    render(){

        return (
            <div>
                <PageHeader title="Trailer Rules"/>
                <Card>
                    <Grid>
                        <GridCell width="1-1" noMargin = {true}>
                            <GpsRule rules = {this.state.ruleSet ? this.state.ruleSet.gpsRules : []}
                                     lookups = {this.state.lookups} onchange = {() => this.refreshRules()}/>
                        </GridCell>
                        <GridCell width="1-1">
                            <UsabilityRule rules = {this.state.ruleSet ? this.state.ruleSet.usabilityRules : []}
                                           lookups = {this.state.lookups} onchange = {() => this.refreshRules()}/>
                        </GridCell>
                    </Grid>
                </Card>
            </div>
        );
    }
}
TrailerRules.contextTypes = {
    translator: React.PropTypes.object,
};
