import _ from "lodash";
import * as axios from 'axios';
import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card, Loader, PageHeader, CardHeader} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown, Form} from "susam-components/basic";
import {NumericInput} from "susam-components/advanced";

import {MotorVehicleTypeRuleService} from "../../services";

export class UsabilityRule extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {rule: {}};
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
            if(_.find(rules, {inspectionType: {code: this.state.rule.inspectionType.code}, tripType: {code: this.state.rule.tripType.code}})){
                Notify.showError("There is already a rule for " + this.state.rule.inspectionType.name + " and " + this.state.rule.tripType.name);
                return;
            }else{
                rules.push(this.state.rule);
            }
        }

        MotorVehicleTypeRuleService.saveUsabilityRule(this.props.type, rules).then(response => {
            Notify.showSuccess("Usability rule saved");
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
            MotorVehicleTypeRuleService.saveUsabilityRule(this.props.type, rules).then(response => {
                Notify.showSuccess("Usability rule deleted");
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
                let text = "If {0} will be expired in {1} days, vehicle can not be used for {2} trips";
                return (
                    <li key = {item.id}>
                        <span className="md-list-heading">
                            <a href="#" onClick = {(e) => this.handleSelectRule(e, item)}>
                                {this.context.translator.mf.compile(text)([item.inspectionType.name, item.daysDue, item.tripType.name])}
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
                <CardHeader title="Usability Rules"/>
            </GridCell>
            <GridCell width="1-1">
                <Form ref = {(c) => this.form = c}>
                <table className="uk-table">
                    <tbody>
                    <tr>
                        <td className="uk-vertical-align-bottom" style = {style}>
                            <span className="uk-text-large">{super.translate("If ")}</span>
                        </td>
                        <td className="uk-vertical-align-bottom" style = {style} width="20%">
                            <DropDown options = {this.props.lookups.inspectionTypes} value = {this.state.rule.inspectionType}
                                      onchange = {(value) => this.updateState("inspectionType", value)}
                                      required = {true}/>
                        </td>
                        <td className="uk-vertical-align-bottom" style = {style}>
                            <span className="uk-text-large">{super.translate(" will be expired in ")}</span>
                        </td>
                        <td className="uk-vertical-align-bottom" style = {style} width="5%">
                            <NumericInput value = {this.state.rule.daysDue}
                                          onchange = {(value) => this.updateState("daysDue", value)}
                                          required={true} digits="0"/>
                        </td>
                        <td className="uk-vertical-align-bottom" style = {style}>
                            <span className="uk-text-large">{super.translate(" days, vehicle can not be used for ")}</span>
                        </td>
                        <td className="uk-vertical-align-bottom" style = {style} width="12%">
                            <DropDown options = {this.props.lookups.tripTypes} value = {this.state.rule.tripType}
                                      onchange = {(value) => this.updateState("tripType", value)}
                                      required = {true}/>
                        </td>
                        <td className="uk-vertical-align-bottom" style = {style}>
                            <span className="uk-text-large">{super.translate(" trips ")}</span>
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

UsabilityRule.contextTypes = {
    translator: React.PropTypes.object,
};