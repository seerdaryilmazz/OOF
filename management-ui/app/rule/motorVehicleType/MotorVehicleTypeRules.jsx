import _ from "lodash";
import * as axios from 'axios';
import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card, Loader, PageHeader, CardHeader} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown, Form} from "susam-components/basic";
import {NumericInput} from "susam-components/advanced";
import {GpsRule} from './GpsRule';
import {CouplingRule} from './CouplingRule';
import {UsabilityRule} from './UsabilityRule';

import {MotorVehicleTypeRuleService} from "../../services";

export class MotorVehicleTypeRules extends TranslatingComponent {

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
        MotorVehicleTypeRuleService.getRuleSetForVehicleType(type).then(response => {
            let state = _.cloneDeep(this.state);
            state.ruleSet = response.data;
            if(!state.ruleSet.id){
                state.ruleSet.motorVehicleTypeId = type.id;
            }
            if(type.canDriverSleepIn && !state.ruleSet.doubleDriverRule){
                state.ruleSet.doubleDriverRule = {};
            }
            this.setState(state);
        }).catch((error) => {
            Notify.showError(error);
        });
    }

    componentDidMount(){
        axios.all([
            MotorVehicleTypeRuleService.listMotorVehicleTypes(),
            MotorVehicleTypeRuleService.listInspectionTypes(),
            MotorVehicleTypeRuleService.listServiceTypes(),
            MotorVehicleTypeRuleService.listTrailerTypes(),
            MotorVehicleTypeRuleService.listTripTypes()
        ]).then(axios.spread((vehicleTypes, inspectionTypes, serviceTypes, trailerTypes, tripTypes) => {
            let state = _.cloneDeep(this.state);
            state.lookups = {};
            state.lookups.vehicleTypes = vehicleTypes.data;
            state.lookups.inspectionTypes = inspectionTypes.data;
            state.lookups.serviceTypes = serviceTypes.data;
            state.lookups.trailerTypes = trailerTypes.data;
            state.lookups.tripTypes = tripTypes.data;
            this.setState(state);
        })).catch((error) => {
            Notify.showError(error);
        });
    }

    updateDoubleDriverRule(key, value){
        let ruleSet = _.cloneDeep(this.state.ruleSet);
        if(!ruleSet.doubleDriverRule){
            ruleSet.doubleDriverRule = {};
        }
        ruleSet.doubleDriverRule[key] = value;
        this.setState({ruleSet: ruleSet});
    }
    handleDoubleDriverRuleSave(){
        if(!this.form.validate()){
            return;
        }
        MotorVehicleTypeRuleService.saveRuleSet(this.state.selectedType, this.state.ruleSet).then(response => {
            Notify.showSuccess("Double driver rule saved");

        }).catch(error => {
            Notify.showError(error);
        });
    }
    handleDoubleDriverRuleClean(){
        let ruleSet = _.cloneDeep(this.state.ruleSet);
        ruleSet.doubleDriverRule = {};
        this.setState({ruleSet: ruleSet});
        MotorVehicleTypeRuleService.saveRuleSet(this.state.selectedType, ruleSet).then(response => {
            Notify.showSuccess("Double driver rule removed");
        }).catch(error => {
            Notify.showError(error);
        });
    }
    renderDoubleDriverRules(){
        if(!(this.state.selectedType && this.state.selectedType.canDriverSleepIn)){
            return null;
        }
        if(!(this.state.ruleSet && this.state.ruleSet.doubleDriverRule)){
            return null;
        }
        let style = {borderBottom: "none"};
        return (
            <Grid>
                <GridCell width="1-1">
                    <CardHeader title="Double Driver Rules"/>
                </GridCell>
                <GridCell width="1-1">
                    <Form ref = {(c) => this.form = c}>
                    <table className="uk-table">
                        <tbody>
                        <tr>
                            <td className="uk-vertical-align-bottom" style = {style}>
                                <span className="uk-text-large">{super.translate("If trip length is higher than ")}</span>
                            </td>
                            <td className="uk-vertical-align-bottom" style = {style}>
                                <NumericInput value = {this.state.ruleSet.doubleDriverRule.tripLengthThreshold}
                                              onchange = {(value) => this.updateDoubleDriverRule("tripLengthThreshold", value)}
                                              required={true} digits="0" unit="km."/>
                            </td>
                            <td className="uk-vertical-align-bottom" style = {style}>
                                <span className="uk-text-large">{super.translate(" and required double driver, a motor vehicle which includes 2 beds should be assigned ")}</span>
                            </td>
                            <td className="uk-vertical-align-bottom" style = {style}>
                                <Button label="save" style="primary" waves = {true} size="small" onclick = {() => this.handleDoubleDriverRuleSave()} />
                                <Button label="clean" style="danger" waves = {true} size="small" onclick = {() => this.handleDoubleDriverRuleClean()} />
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    </Form>
                </GridCell>
            </Grid>
        );
    }

    renderGpsRules(){
        if(!this.state.selectedType){
            return null;
        }
        return <GpsRule rules = {this.state.ruleSet ? this.state.ruleSet.gpsRules : []} type = {this.state.selectedType}
                        lookups = {this.state.lookups} onchange = {() => this.getRulesSelectedType(this.state.selectedType)}/>;
    }

    renderCouplingRules(){
        if(!(this.state.selectedType && this.state.selectedType.canBeCoupledWithACarrierUnit)){
            return null;
        }
        return <CouplingRule rules = {this.state.ruleSet ? this.state.ruleSet.couplingRules : []} type = {this.state.selectedType}
                        lookups = {this.state.lookups} onchange = {() => this.getRulesSelectedType(this.state.selectedType)}/>;
    }
    renderUsabilityRules(){
        if(!this.state.selectedType){
            return null;
        }
        return <UsabilityRule rules = {this.state.ruleSet ? this.state.ruleSet.usabilityRules : []} type = {this.state.selectedType}
                             lookups = {this.state.lookups} onchange = {() => this.getRulesSelectedType(this.state.selectedType)}/>;
    }

    render(){

        return (
            <div>
                <PageHeader title="Motor Vehicle Type Rules"/>
                <Card>
                    <Grid>
                        <GridCell width="1-4">
                            <DropDown label="Motor Vehicle Type" options = {this.state.lookups.vehicleTypes} value = {this.state.selectedType}
                                      onchange = {(value) => this.updateSelectedType(value)} />
                        </GridCell>
                        <GridCell width="1-1">
                            {this.renderGpsRules()}
                        </GridCell>
                        <GridCell width="1-1">
                            {this.renderCouplingRules()}
                        </GridCell>
                        <GridCell width="1-1">
                            {this.renderDoubleDriverRules()}
                        </GridCell>
                        <GridCell width="1-1">
                            {this.renderUsabilityRules()}
                        </GridCell>
                    </Grid>
                </Card>
            </div>
        );
    }
}
MotorVehicleTypeRules.contextTypes = {
    translator: React.PropTypes.object,
};
