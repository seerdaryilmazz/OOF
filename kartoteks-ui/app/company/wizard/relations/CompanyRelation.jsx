import React from "react";
import _ from "lodash";
import uuid from "uuid";
import * as axios from "axios";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, CardHeader, Wizard, Loader} from "susam-components/layout";
import {Notify, TextInput, Button, DropDown, Checkbox, CheckboxGroup, Span, Form} from 'susam-components/basic';
import {CompanySearchAutoComplete} from 'susam-components/oneorder';
import {LookupService} from '../../../services/KartoteksService';


export class CompanyRelation extends TranslatingComponent {

    constructor(props){
        super(props);
        this.state = {};
    }

    initializeState(props){
        let state = _.cloneDeep(this.state);
        state.relation = props.relation;
        this.setState(state);
    }

    initializeLookups(){
        LookupService.getCompanyRelationTypes().then(response => {
            let relationTypes = [];
            response.data.forEach(item => {
                relationTypes.push({
                    id: item.id,
                    code:item.code,
                    name:item.name,
                    altName: item.altName,
                    uniqueId: '' + item.id,
                    type: "HAS"
                });
                relationTypes.push({
                    id: item.id,
                    code:item.code,
                    name:item.altName,
                    altName: item.name,
                    uniqueId: '!' + item.id,
                    type: "IS"
                });
            });
            this.setState({relationTypes: relationTypes});

        }).catch(error => {
            Notify.showError(error);
        })
    }

    componentDidMount(){
        this.initializeLookups();
        this.initializeState(this.props);
        this.validate();
    }
    componentWillReceiveProps(nextProps){
        this.initializeState(nextProps);
        this.validate();
    }

    updateState(key, value){
        let relation = _.cloneDeep(this.state.relation);
        _.set(relation, key, value);
        this.setState({relation: relation});
    }


    handleCancelClick(){
        this.props.oncancel && this.props.oncancel();
    }
    handleSaveClick(){
        if(this.validate()){
            this.props.onsave && this.props.onsave(this.state.relation);
        }
    }
    validate(){
        return this.form && this.form.validate();
    }

    render(){
        if(!this.state.relation){
            return <Loader />;
        }
        let companySelection = null;
        if(_.get(this.state, "relation.relationType.type") == "HAS"){
            companySelection = <CompanySearchAutoComplete label="Company"
                                                          value={this.state.relation.passiveCompany}
                                                          onchange={(company) => this.updateState("passiveCompany", company)}/>;
        } else if(_.get(this.state, "relation.relationType.type") == "IS"){
            companySelection = <CompanySearchAutoComplete label="Company"
                                                          value={this.state.relation.activeCompany}
                                                          onchange={(company) => this.updateState("activeCompany", company)}/>;
        }
        return (
            <Grid>
                <GridCell width="1-1">
                    <CardHeader title="Relation Information"/>
                </GridCell>
                <GridCell width="1-1">
                    <Form ref = {(c) => this.form = c}>
                        <Grid>
                            <GridCell width="1-4">
                                <DropDown label="Relation Type" required = {true}
                                          options = {this.state.relationTypes}
                                          valueField="uniqueId" labelField="name"
                                          value = {this.state.relation.relationType}
                                          onchange = {(value) => this.updateState("relationType", value)} />
                            </GridCell>
                            <GridCell width="1-4">
                                {companySelection}
                            </GridCell>


                            <GridCell width="1-1" noMargin = {true}>
                                <div className="uk-align-right">
                                    <Button label="cancel" waves = {true} onclick = {() => this.handleCancelClick()}/>
                                    <Button label="Save" waves = {true} style = "primary" onclick = {() => this.handleSaveClick()}/>
                                </div>
                            </GridCell>
                        </Grid>
                    </Form>
                </GridCell>
            </Grid>
        );
    }
}