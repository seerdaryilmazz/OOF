import _ from "lodash";
import * as axios from 'axios';
import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card, Loader, PageHeader, CardHeader} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown, Form} from "susam-components/basic";
import {NumericInput} from "susam-components/advanced";

import {MotorVehicleProfileRuleService} from "../../services";

export class FuelEconomyRule extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {rule: {}};
    }
    componentWillReceiveProps(nextProps){
        if(!_.isEqual(this.props.type, nextProps.type)){
            this.setState({rule:{}});
        }
    }

    updateState(key, value){
        let rule = _.cloneDeep(this.state.rule);
        rule[key] = value;
        this.setState({rule: rule});
    }
    handleCleanRule(){
        this.setState({rule: {}});
    }
    handleSaveRule(){
        if(!this.form.validate()){
            return;
        }
        let rules = _.cloneDeep(this.props.rules);
        if(this.state.rule.id){
            let index = _.findIndex(rules, {id: this.state.rule.id});
            rules[index] = this.state.rule;
        }else{
            if(_.find(rules, {consumptionType: {id: this.state.rule.consumptionType.id}})){
                Notify.showError("There is already a rule for " + this.state.rule.consumptionType.name);
                return;
            }else{
                rules.push(this.state.rule);
            }
        }
        MotorVehicleProfileRuleService.saveFuelEconomyRule(this.props.type, rules).then(response => {
            Notify.showSuccess("Fuel economy rule saved");
            this.props.onchange && this.props.onchange();
        }).catch(error => {
            Notify.showError(error);
        })
    }
    handleSelectRule(e, item){
        e.preventDefault();
        let state = _.cloneDeep(this.state);
        state.rule = item;
        this.setState(state);
    }
    handleDeleteRule(item){
        UIkit.modal.confirm("Are you sure?", () => {
            let rules = _.cloneDeep(this.props.rules);
            _.remove(rules, {id: item.id});
            MotorVehicleProfileRuleService.saveFuelEconomyRule(this.props.type, rules).then(response => {
                Notify.showSuccess("Fuel economy rule deleted");
                this.props.onchange && this.props.onchange();
            }).catch(error => {
                Notify.showError(error);
            })
        });
    }

    render(){
        if(!this.props.type){
            return null;
        }
        let rules = "There are no saved rules";
        if(this.props.rules && this.props.rules.length > 0){
            let list = this.props.rules.map(item => {
                let text = "For profile assignment, {0} fuel consumption should be less than {1} liters.";
                return (
                    <li key = {item.id}>
                        <span className="md-list-heading">
                            <a href="#" onClick = {(e) => this.handleSelectRule(e, item)}>
                                {this.context.translator.mf.compile(text)([item.consumptionType.name, item.consumptionRate])}
                            </a>
                        </span>
                        <div className="uk-align-right">
                            <Button label="Delete" style="danger" flat = {true} waves = {true} size="small"
                                    onclick = {() => this.handleDeleteRule(item)} />
                        </div>
                    </li>
                );
            });
            rules = <ul className="md-list">{list}</ul>;
        }
        let style = {borderBottom: "none"};
        return (
            <Grid>
                <GridCell width="1-1">
                    <CardHeader title="Fuel Economy"/>
                </GridCell>
                <GridCell width="1-1">
                    <Form ref = {(c) => this.form = c}>
                        <table className="uk-table">
                            <tbody>
                                <tr>
                                    <td className="uk-vertical-align-bottom" style = {style}>
                                        <span className="uk-text-large">{super.translate("For profile assignment, ")}</span>
                                    </td>
                                    <td className="uk-vertical-align-bottom" style = {style} width="20%">
                                        <DropDown options = {this.props.lookups.fuelConsumptionTypes}
                                                  value = {this.state.rule.consumptionType}
                                                  onchange = {(value) => this.updateState("consumptionType", value)}
                                                  required = {true} />
                                    </td>
                                    <td className="uk-vertical-align-bottom uk-text-large" style = {style}>
                                        <span className="uk-text-large">{super.translate(" fuel consumption should be less than ")}</span>
                                    </td>
                                    <td className="uk-vertical-align-bottom" style = {style} width="15%">
                                        <NumericInput value = {this.state.rule.consumptionRate}
                                                      onchange = {(value) => this.updateState("consumptionRate", value)}
                                                      required={true} digits="0" />
                                    </td>
                                    <td className="uk-vertical-align-bottom uk-text-large" style = {style}>
                                        <span className="uk-text-large">{super.translate(" liters. ")}</span>
                                    </td>
                                    <td className="uk-vertical-align-bottom" style = {style}>
                                        <Button label="Save" style="primary" waves = {true} size="small" onclick = {() => this.handleSaveRule()} />
                                        <Button label="new" style="success" waves = {true} size="small" onclick = {() => this.handleCleanRule()} />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </Form>
                </GridCell>
                <GridCell width="1-2">
                    {rules}
                </GridCell>
            </Grid>
        );
    }

}

FuelEconomyRule.contextTypes = {
    translator: React.PropTypes.object,
};