import _ from "lodash";
import * as axios from 'axios';
import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card, Loader, PageHeader, CardHeader} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown, Form} from "susam-components/basic";
import {NumericInput} from "susam-components/advanced";

import {MotorVehicleProfileRuleService} from "../../services";

export class AgeRule extends TranslatingComponent {

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

        let hasConflictingRule = false;
        rules.forEach(item => {
            if(item.ageOperatorType.id == this.state.rule.ageOperatorType.id){
                hasConflictingRule = true;
            }else{
                if(this.state.rule.ageOperatorType.id == "OLDER"){
                    if(this.state.rule.age >= item.age){
                        hasConflictingRule = true;
                    }
                }else{
                    if(this.state.rule.age <= item.age) {
                        hasConflictingRule = true;
                    }
                }
            }
        });

        if(hasConflictingRule){
            Notify.showError("There is a conflicting rule");
            return;
        }

        if(this.state.rule.id){
            let index = _.findIndex(rules, {id: this.state.rule.id});
            rules[index] = this.state.rule;
        }else{
            rules.push(this.state.rule);
        }
        MotorVehicleProfileRuleService.saveAgeRule(this.props.type, rules).then(response => {
            Notify.showSuccess("Motor vehicle age rule saved");
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
            MotorVehicleProfileRuleService.saveAgeRule(this.props.type, rules).then(response => {
                Notify.showSuccess("Motor vehicle age rule deleted");
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
                let text = "Vehicles {0} than {1} years are recommended";
                return (
                    <li key = {item.id}>
                        <span className="md-list-heading">
                            <a href="#" onClick = {(e) => this.handleSelectRule(e, item)}>
                                {this.context.translator.mf.compile(text)([item.ageOperatorType.name, item.age])}
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
                    <CardHeader title="Motor Vehicle Age"/>
                </GridCell>
                <GridCell width="1-1">
                    <Form ref = {(c) => this.form = c}>
                        <table className="uk-table">
                            <tbody>
                            <tr>
                                <td className="uk-vertical-align-bottom" style = {style}>
                                    <span className="uk-text-large">{super.translate("Vehicles, ")}</span>
                                </td>
                                <td className="uk-vertical-align-bottom" style = {style} width="20%">
                                    <DropDown options = {this.props.lookups.operatorTypes}
                                              value = {this.state.rule.ageOperatorType}
                                              onchange = {(value) => this.updateState("ageOperatorType", value)}
                                              required = {true} />

                                </td>
                                <td className="uk-vertical-align-bottom uk-text-large" style = {style}>
                                    <span className="uk-text-large">{super.translate(" than ")}</span>
                                </td>
                                <td className="uk-vertical-align-bottom" style = {style} width="15%">
                                    <NumericInput value = {this.state.rule.age}
                                                  onchange = {(value) => this.updateState("age", value)}
                                                  required={true} digits="0" />
                                </td>
                                <td className="uk-vertical-align-bottom uk-text-large" style = {style}>
                                    <span className="uk-text-large">{super.translate(" are recommended. ")}</span>
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

AgeRule.contextTypes = {
    translator: React.PropTypes.object,
};