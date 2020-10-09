import _ from "lodash";
import * as axios from 'axios';
import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card, Loader, PageHeader, CardHeader} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown, Form} from "susam-components/basic";
import {NumericInput} from "susam-components/advanced";

import {MotorVehicleTypeRuleService} from "../../services";

export class CouplingRule extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {errors: {}, rule: {}};
    }

    updateState(key, value){
        let rule = _.cloneDeep(this.state.rule);
        rule[key] = value;
        this.setState({rule: rule});
    }
    handleCleanRule(){
        this.setState({rule: {}});
    }
    validate(){
        if(!this.form.validate()){
            return false;
        }
        if(parseInt(this.state.rule.kingpinMinHeight) >= parseInt(this.state.rule.kingpinMaxHeight)){
            this.setState({
                errors: {
                kingpinMinHeight: [{code: "minHeight", message: "Must be smaller than Max height"}],
                kingpinMaxHeight: [{code: "maxHeight", message: "Must be greater than Min height"}]
                }
            });
            return false;
        }else{
            this.setState({errors:{}});
        }
        if((!this.state.rule.id) && _.find(this.props.rules, {trailerType: {code: this.state.rule.trailerType.code}})){
            Notify.showError("There is already a rule for " + this.state.rule.trailerType.name);
            return false;
        }
        return true;
    }

    handleSaveRule(){
        if(!this.validate()){
            return;
        }
        let rules = _.cloneDeep(this.props.rules);
        if(this.state.rule.id){
            let index = _.findIndex(rules, {id: this.state.rule.id});
            rules[index] = this.state.rule;
        }else{
            rules.push(this.state.rule);
        }
        MotorVehicleTypeRuleService.saveCouplingRule(this.props.type, rules).then(response => {
            Notify.showSuccess("Coupling rule saved");
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
            MotorVehicleTypeRuleService.saveCouplingRule(this.props.type, rules).then(response => {
                Notify.showSuccess("Coupling rule deleted");
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
                let text = "If KingPin height is between  {0} cm. and {1} cm. motor vehicle can be coupled with {2} trailers";
                return (
                    <li key = {item.id}>
                        <span className="md-list-heading">
                            <a href="#" onClick = {(e) => this.handleSelectRule(e, item)}>
                                {this.context.translator.mf.compile(text)([item.kingpinMinHeight, item.kingpinMaxHeight, item.trailerType.name])}
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
                    <CardHeader title="Coupling Rules"/>
                </GridCell>
                <GridCell width="1-1">
                    <Form ref = {(c) => this.form = c}>
                    <table className="uk-table">
                        <tbody>
                        <tr>
                            <td className="uk-vertical-align-bottom" style = {style}>
                                <span className="uk-text-large">{super.translate("If KingPin height is between ")}</span>
                            </td>
                            <td className="uk-vertical-align-bottom" style = {style} width="7%">
                                <NumericInput value = {this.state.rule.kingpinMinHeight}
                                              onchange = {(value) => this.updateState("kingpinMinHeight", value)}
                                              required={true} digits="0" unit="cm."
                                              errors = {this.state.errors.kingpinMinHeight}/>
                            </td>
                            <td className="uk-vertical-align-bottom" style = {style}>
                                <span className="uk-text-large">{super.translate(" and ")}</span>
                            </td>
                            <td className="uk-vertical-align-bottom" style = {style} width="7%">
                                <NumericInput value = {this.state.rule.kingpinMaxHeight}
                                              onchange = {(value) => this.updateState("kingpinMaxHeight", value)}
                                              required={true} digits="0" unit="cm."
                                              errors = {this.state.errors.kingpinMaxHeight}/>
                            </td>
                            <td className="uk-vertical-align-bottom" style = {style}>
                                <span className="uk-text-large">{super.translate(" motor vehicle can be coupled with ")}</span>
                            </td>
                            <td className="uk-vertical-align-bottom" style = {style} width="15%">
                                <DropDown options = {this.props.lookups.trailerTypes} value = {this.state.rule.trailerType}
                                          onchange = {(value) => this.updateState("trailerType", value)}
                                          required = {true}/>
                            </td>
                            <td className="uk-vertical-align-bottom" style = {style}>
                                <span className="uk-text-large">{super.translate(" trailers ")}</span>
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

CouplingRule.contextTypes = {
    translator: React.PropTypes.object,
};