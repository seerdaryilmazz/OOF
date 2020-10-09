import _ from "lodash";
import * as axios from 'axios';
import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card, Loader, PageHeader, CardHeader} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown, Form} from "susam-components/basic";
import {NumericInput} from "susam-components/advanced";
import {FuelEconomyRule} from './FuelEconomyRule';
import {AgeRule} from './AgeRule';

import {MotorVehicleProfileRuleService} from "../../services";

export class MotorVehicleProfileRules extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {lookups: {}};
    }

    updateSelectedType(value){
        let state = _.cloneDeep(this.state);
        state.selectedType = value;
        this.setState(state);

        this.getRulesSelectedType(value);
    }

    getRulesSelectedType(type){
        MotorVehicleProfileRuleService.getRuleSetForProfile(type).then(response => {
            let state = _.cloneDeep(this.state);
            state.ruleSet = response.data;
            if(!state.ruleSet.id){
                state.ruleSet.motorVehicleProfileId = type.id;
            }
            this.setState(state);
        }).catch((error) => {
            Notify.showError(error);
        });
    }

    componentDidMount(){
        axios.all([
            MotorVehicleProfileRuleService.listVehicleProfiles(),
            MotorVehicleProfileRuleService.listFuelConsumptionTypes(),
            MotorVehicleProfileRuleService.listAgeOperatorTypes(),
        ]).then(axios.spread((vehicleProfiles, fuelConsumptionTypes, operatorTypes) => {
            let state = _.cloneDeep(this.state);
            state.lookups = {};
            state.lookups.vehicleProfiles = vehicleProfiles.data;
            state.lookups.fuelConsumptionTypes = fuelConsumptionTypes.data;
            state.lookups.operatorTypes = operatorTypes.data;
            this.setState(state);
        })).catch((error) => {
            Notify.showError(error);
        });
    }

    renderFuelEconomyRule(){
        if(!this.state.selectedType){
            return null;
        }
        return <FuelEconomyRule rules = {this.state.ruleSet ? this.state.ruleSet.fuelEconomyRules : []}
                                type = {this.state.selectedType}
                                lookups = {this.state.lookups}
                                onchange = {() => this.getRulesSelectedType(this.state.selectedType)}/>;
    }

    renderAgeRules(){
        if(!this.state.selectedType){
            return null;
        }
        return <AgeRule rules = {this.state.ruleSet ? this.state.ruleSet.ageRules : []}
                        type = {this.state.selectedType}
                        lookups = {this.state.lookups}
                        onchange = {() => this.getRulesSelectedType(this.state.selectedType)}/>;
    }

    render(){

        return (
            <div>
                <PageHeader title="Motor Vehicle Profile Assignment Rules"/>
                <Card>
                    <Grid>
                        <GridCell width="1-4">
                            <DropDown label="Motor Vehicle Profile"
                                      options = {this.state.lookups.vehicleProfiles}
                                      value = {this.state.selectedType}
                                      onchange = {(value) => this.updateSelectedType(value)} />
                        </GridCell>
                        <GridCell width="1-1">
                            {this.renderFuelEconomyRule()}
                        </GridCell>
                        <GridCell width="1-1">
                            {this.renderAgeRules()}
                        </GridCell>
                    </Grid>
                </Card>
            </div>
        );
    }
}
MotorVehicleProfileRules.contextTypes = {
    translator: React.PropTypes.object,
};
