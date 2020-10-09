import _ from "lodash";
import * as axios from 'axios';
import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card, Loader, PageHeader, CardHeader} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown, Form} from "susam-components/basic";
import {NumericInput} from "susam-components/advanced";

import {TrailerRuleService} from "../../services";

export class GpsRule extends TranslatingComponent {

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
            if(_.find(rules, {serviceType: {code: this.state.rule.serviceType.code}})){
                Notify.showError("There is already a rule for " + this.state.rule.serviceType.name);
                return;
            }else{
                rules.push(this.state.rule);
            }
        }
        TrailerRuleService.saveGpsRule(rules).then(response => {
            Notify.showSuccess("GPS rule saved");
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
            TrailerRuleService.saveGpsRule(rules).then(response => {
                Notify.showSuccess("GPS rule deleted");
                this.props.onchange && this.props.onchange();
            }).catch(error => {
                Notify.showError(error);
            })
        });
    }

    render(){

        let rules = "There are no saved rules";
        if(this.props.rules && this.props.rules.length > 0){
            let list = this.props.rules.map(item => {
                let text = "If GPS info could not be received more than {0} hours, vehicle can not be used for {1}";
                return (
                    <li key = {item.id}>
                        <span className="md-list-heading">
                            <a href="#" onClick = {(e) => this.handleSelectRule(e, item)}>
                                {this.context.translator.mf.compile(text)([item.gpsInfoThresholdHours, item.serviceType.name])}
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
                <GridCell width="1-1" noMargin = {true}>
                    <CardHeader title="GPS Rules"/>
                </GridCell>
                <GridCell width="1-1">
                    <Form ref = {(c) => this.form = c}>
                    <table className="uk-table">
                        <tbody>
                        <tr>
                            <td className="uk-vertical-align-bottom" style = {style}>
                                <span className="uk-text-large">{super.translate("If GPS info could not be received more than ")}</span>
                            </td>
                            <td className="uk-vertical-align-bottom" style = {style}>
                                <NumericInput value = {this.state.rule.gpsInfoThresholdHours}
                                              onchange = {(value) => this.updateState("gpsInfoThresholdHours", value)}
                                              required={true} digits="0" />
                            </td>
                            <td className="uk-vertical-align-bottom uk-text-large" style = {style}>
                                <span className="uk-text-large">{super.translate(" hours, vehicle can not be used for ")}</span>
                            </td>
                            <td className="uk-vertical-align-bottom" style = {style} width="15%">
                                <DropDown options = {this.props.lookups.serviceTypes} value = {this.state.rule.serviceType}
                                          onchange = {(value) => this.updateState("serviceType", value)}
                                          required = {true}/>
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

GpsRule.contextTypes = {
    translator: React.PropTypes.object,
};