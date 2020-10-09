import _ from "lodash";
import React from "react";
import uuid from 'uuid';

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card, Loader, CardHeader, PageHeader} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown, Form, Span} from "susam-components/basic";
import {Chip, NumericInput} from 'susam-components/advanced';

import {ProductExceptionList} from './ProductExceptionList';


export class ProductException extends TranslatingComponent {

    constructor(props){
        super(props);
        this.state = { rules: []}
    }

    componentDidMount(){
        this.loadRules(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.loadRules(nextProps);
    }

    loadRules(props) {
        let rules = _.cloneDeep(props.rules);
        if (rules) {
            rules.forEach( rule => {if(!rule._guiKey) { rule._guiKey = uuid.v4();}});
            this.setState({rules: rules});
        } else {
            this.setState({rules: []});
        }
    }

    updateState(field, value) {
       this.setState({field: value});
    }

    handleAdd() {
        if (!this.form.validate()) {
            return;
        }

        let elem = {};
        elem._guiKey = uuid.v4();
        elem.operationType = this.state.operationType;
        elem.categories = this.state.categories;
        elem.additionalDay = this.state.additionalDay;

        let rules = this.state.rules;

        if(!rules) {
            rules = [];
        }

        rules.push(elem);

        this.setState({rules: rules, operationType: null, categories: null, additionalDay: null}, () => {
            this.props.onchange(this.state.rules)
        });
    }

    handleDelete(rule) {
        let rules = this.state.rules;
        let elemIndex = rules.findIndex(e => e._guiKey == rule._guiKey);
        if (elemIndex < 0) return false;
        rules.splice(elemIndex, 1);

        this.setState({rules: rules}, () => { this.props.onchange(this.state.rules)});
    }

    render() {
        let rules = this.state.rules;
        if (!rules || !this.props.lookups) {
            return null;
        }

        return (
            <Grid>
                <GridCell width="1-1">
                    <CardHeader title="Exception"/>
                </GridCell>
                <GridCell width="1-1">
                    <Form ref={(c) => this.form = c}>
                        <Grid>
                            <GridCell width="2-10">
                               <DropDown label="Type" options={this.props.lookups.orderPlanningOperationTypes}
                                         value={this.state.operationType}
                                         onchange={(value) => {this.setState({operationType: value});}}/>
                            </GridCell>
                            <GridCell width="2-10">
                                <Chip label="Category" options={this.props.lookups.regionCategories}
                                          value={this.state.categories}
                                          onchange={(value) => {this.setState({categories: value});}}/>
                            </GridCell>
                            <GridCell width="1-10">
                               <Span value="then"></Span>
                            </GridCell>
                            <GridCell width="2-10">
                                <NumericInput label="Work Day"
                                          value={this.state.additionalDay}
                                              onchange={(value) => {this.setState({additionalDay: value});}}/>
                            </GridCell>
                            <GridCell width="2-10">
                                <Span value="should be added to transit time."></Span>
                            </GridCell>
                            <GridCell width="1-10">
                                <div className="uk-align-left">
                                    <Button label="add" waves={true} style="success"
                                            onclick={(e) => {
                                                this.handleAdd();
                                            }}/>
                                </div>
                            </GridCell>
                        </Grid>
                    </Form>
                </GridCell>
                <GridCell>
                    <ProductExceptionList rules={rules} deleteHandler={(rule) => this.handleDelete(rule)}/>
                </GridCell>
            </Grid>
        );
    }
}