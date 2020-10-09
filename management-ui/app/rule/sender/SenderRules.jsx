import React from "react";
import _ from "lodash";
import * as axios from 'axios';

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, Wizard, Loader, Tab} from "susam-components/layout";
import {Notify, TextInput, Button, Span} from 'susam-components/basic';

import {SenderRulesList} from './SenderRulesList';
import {SenderRuleSetForm} from './SenderRuleSetForm';

import {CommonService, SenderRuleService} from '../../services';

export class SenderRules extends TranslatingComponent {

    constructor(props){
        super(props);
        this.state = {selectedRule: this.createNewRule()};
    }

    componentDidMount(){
        this.getSenderRules();
    }

    createNewRule(){
        return {};
    }

    getSenderRules(){
        SenderRuleService.getRuleSet().then(response => {
            this.setState({senderRules: response.data})
        }).catch(error => {
            Notify.showError(error);
        })
    }

    handleSelectFromList(value){
        this.setState({selectedRule: _.cloneDeep(value)});
    }

    handleDelete(value){
        UIkit.modal.confirm("Are you sure?", () => {
            SenderRuleService.deleteRuleSet(value).then(response => {
                Notify.showSuccess("Sender rule deleted");
                this.getSenderRules();
                this.setState({selectedRule: this.createNewRule()});
            }).catch(e => {
                Notify.showError(e);
            });
        });
    }
    handleNewRuleClick(){
        this.setState({selectedRule: this.createNewRule()});
    }

    handleRuleSetChange(value){
        this.getSenderRules();
        if(value.id){
            this.setState({selectedRule: this.createNewRule()});
        }else{
            this.setState({selectedRule: value});
        }
    }

    render() {
        return (
            <div>
                <PageHeader title="Sender Rules"/>
                <Card>
                    <Grid divider={true}>
                        <GridCell width="1-3" noMargin={true}>
                            <Grid>
                                <GridCell width="1-1">
                                    <div className="uk-align-right">
                                        <Button label="Create New" style="success" waves={true}
                                                flat={true} onclick={() => this.handleNewRuleClick()}/>
                                    </div>
                                </GridCell>
                                <GridCell width="1-1" noMargin={true}>
                                    <SenderRulesList
                                        data={this.state.senderRules}
                                        onselect={(value) => this.handleSelectFromList(value)}
                                        ondelete = {(value) => this.handleDelete(value)}/>
                                </GridCell>

                            </Grid>
                        </GridCell>
                        <GridCell width="2-3" noMargin={true}>
                            <SenderRuleSetForm ruleSet={this.state.selectedRule}
                                               onchange={(value) => this.handleRuleSetChange(value)}/>
                        </GridCell>
                    </Grid>
                </Card>
            </div>
        );
    }
}