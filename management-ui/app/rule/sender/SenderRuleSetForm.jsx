import React from "react";
import _ from "lodash";
import * as axios from 'axios';

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, Loader, CardHeader} from "susam-components/layout";
import {Notify, TextInput, Button, Form, DropDown} from 'susam-components/basic';
import {CompanySearchAutoComplete} from 'susam-components/oneorder';

import {CommonService, SenderRuleService} from '../../services';

import {SenderRuleForm} from './SenderRuleForm';

import {SenderDSLRule} from './SenderDSLRule';


export class SenderRuleSetForm extends TranslatingComponent {

    constructor(props){
        super(props);
        this.state = {ruleSet: {rules: []}, lookup: {}};
    }

    componentDidMount(){
        axios.all([
            CommonService.retrieveDSLTypes(),
        ]).then(axios.spread((dslTypes) => {
            let state = _.cloneDeep(this.state);
            state.lookup.dslType = dslTypes.data;
            this.setState(state, () => {this.initialize(this.props);});
        })).catch((error) => {
            Notify.showError(error);
            console.log("Error:" + error);
        });

    }

    componentWillReceiveProps(nextProps){
        this.initialize(nextProps);
    }

    initialize(props){
        this.setState({ruleSet: props.ruleSet});
    }

    updateRuleState(key, value){
        let ruleSet = _.cloneDeep(this.state.ruleSet);
        ruleSet[key] = value;
        this.setState({ruleSet: ruleSet});
    }

    updateSender(value){
        let ruleSet = _.cloneDeep(this.state.ruleSet);
        ruleSet.sender = _.cloneDeep(value);
        this.setState({ruleSet: ruleSet});
    }

    handleSaveRuleSetClick(){
        if(!this.form.validate()){
            return;
        }
        if(this.state.ruleSet.rules && this.state.ruleSet.rules.length == 0){
            Notify.showError("Please add at least one rule");
            return;
        }
        SenderRuleService.saveRuleSet(this.state.ruleSet).then(response => {
            Notify.showSuccess("Sender rule saved");
            this.props.onchange && this.props.onchange(this.state.ruleSet);
        }).catch(e => {
            Notify.showError(e);
        });

    }

    handleSaveAdvancedRule(data) {

    }

    render(){

        return(
            <Grid>
                <GridCell width="1-1">
                    <Form ref = {(c) => this.form = c}>
                        <Grid>
                            <GridCell width="1-2">
                                <CompanySearchAutoComplete label = "Sender"
                                                           value = {this.state.ruleSet.sender}
                                                           onchange = {(value) => this.updateSender(value)}
                                                           required = {true} />
                            </GridCell>
                        </Grid>
                    </Form>
                </GridCell>
                <GridCell width="1-1">
                    <SenderRuleForm ruleSet = {this.state.ruleSet}
                                    onchange = {(value) => this.updateRuleState("rules", value)}/>
                </GridCell>
                <GridCell key="dslr" width="1-1">
                    <SenderDSLRule lookup={this.state.lookup} data={this.state.ruleSet.dslRule}
                             updateHandler={(value) => this.updateRuleState("dslRule", value)}
                             schemaServiceUrlPrefix={"/order-service/schema?className="}
                             rootClass={"ekol.orders.domain.TransportOrder"}>
                    </SenderDSLRule>
                </GridCell>
                <GridCell width="1-1">
                    <div className="uk-align-right">
                        <Button label="save" style="primary" waves = {true} onclick = {() => this.handleSaveRuleSetClick()}  />
                    </div>
                </GridCell>

            </Grid>

        );
    }

}