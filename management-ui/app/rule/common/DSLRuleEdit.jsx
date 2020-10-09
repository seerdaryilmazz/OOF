import React from "react";
import _ from 'lodash';

import {TranslatingComponent} from 'susam-components/abstract';
import {TextInput, Button, DropDown, Checkbox, TextArea, Notify} from 'susam-components/basic';
import {Card, Grid, GridCell, CardHeader} from "susam-components/layout";

import {DSLRuleService} from '../../services//DSLRuleService';

import {AdvancedDSLScriptEditor} from './AdvancedDSLScriptEditor';

export class DSLRuleEdit extends TranslatingComponent {


    constructor(props) {
        super(props);
        this.state = {
            data: {},
            lookup: {}
        }
    }

    componentDidMount() {
        if (this.props.data) {
            this.setState({data: _.cloneDeep(this.props.data)});
        } else {
            this.setState({data: {}, scriptError: null});
        }
        if (this.props.lookup) {
            this.setState({lookup: this.props.lookup});
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.data) {
            this.setState({data: _.cloneDeep(nextProps.data)});
        } else {
            this.setState({data: {}, scriptError: null});
        }
        if (nextProps.lookup) {
            this.setState({lookup: nextProps.lookup});
        }
    }

    updateData(field, value) {
        let data = this.state.data;
        data[field] = value;
        this.setState({data: data})
    }

    handleSave() {

        let data = this.state.data;

        if (data.type && data.type.id) {

            if (data.type.id == "ANTLR_SPELL") {

                DSLRuleService.validateAntlrSpelDSLScript({script: data.dslScript}).then(response => {
                        this.props.saveClickHandler(data);
                        this.setState({scriptError: null});
                    }
                ).catch((error) => {
                    this.handleCompileError(error);
                });

            } else if (data.type.id == "GROOVY") {

                DSLRuleService.validateGroovyDSLScript({script: data.dslScript}).then(response => {
                        this.props.saveClickHandler(data);
                        this.setState({scriptError: null});
                    }
                ).catch((error) => {
                    this.handleCompileError(error);
                });

            } else {
                Notify.showError("Unknown DSL type.");
            }

        } else {
            Notify.showError("Please specify DSL type.");
        }
    }

    handleCompileError(error) {
        let message = "An Error Ocured While Validating Syntax";
        if(error.response && error.response.data) {
            message = error.response.data;
        }
        this.setState({scriptError: message});
        console.log(message);
    }

    openAdvancedDSLScriptEdit() {
        this.setState({scriptError: null});
        this.advdslscriptedtr.show();
    }


    render() {
        let data = this.state.data;
        let lookup = this.state.lookup;

        let savebuttonLabel;
        if(data._uikey) {
            savebuttonLabel = "Save";
        } else {
            savebuttonLabel = "Add";
        }

        let errorBody = null;
        if(this.state.scriptError) {
            errorBody = <GridCell><span style={{color: 'red'}}>{this.state.scriptError}</span></GridCell>
        }

        return (
            <div>
            <Grid>
                <GridCell width="1-5" noMargin={true}>
                    <TextInput label="Rule Name" value={data.name} onchange={(e) => this.updateData("name", e)}/>
                </GridCell>
                <GridCell width="1-5" noMargin={true}>
                    <DropDown label="DSL Type" options={lookup.dslType} value={data.type} onchange={(e) => this.updateData("type", e)}/>
                </GridCell>
                <GridCell width="3-5" noMargin={true}/>
                <GridCell width="1-1">
                    <TextInput label="Rule Description" value={data.description} onchange={(e) => this.updateData("description", e)}/>
                </GridCell>
                <GridCell width="1-1">
                    <TextArea label="Rule (DSL Script)" value={data.dslScript} onchange={(e) => this.updateData("dslScript", e)}/>
                </GridCell>
                {errorBody}
                <GridCell width="1-1">
                    <Button flat="true" style="success" size="medium" label={"Advanced DSL Edit"} onclick={() => {this.openAdvancedDSLScriptEdit()}}/>
                </GridCell>
                <GridCell width="1-1">
                    <Button label={savebuttonLabel} onclick={() => {this.handleSave()}}/>
                </GridCell>
            </Grid>
                <AdvancedDSLScriptEditor ref = {(c) => this.advdslscriptedtr = c}
                                         data={data.dslScript}
                                         handleDataChange={(e) => this.updateData("dslScript", e)}
                                         schemaServiceUrlPrefix={this.props.schemaServiceUrlPrefix}
                                         rootClass={this.props.rootClass}
                                         dslType={this.state.data.type}>
                </AdvancedDSLScriptEditor>
                </div>
        );
    }
}