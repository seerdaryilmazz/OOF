import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {TextInput, Button, DropDown, Checkbox, TextArea, Notify} from 'susam-components/basic';
import {Card, Grid, GridCell, CardHeader, Modal} from "susam-components/layout";

import {DSLRuleService} from '../../services/DSLRuleService';

import {JsonSchemaBrowser} from '../../JsonSchemaBrowser';

export class AdvancedDSLScriptEditor extends TranslatingComponent {


    constructor(props) {
        super(props);
        this.state = {
            data: {},
        }
    }

    componentDidMount() {
    }

    componentWillReceiveProps(nextProps) {
    }

    handleClose() {
        this.modal.close();
    }

    show() {
        this.setState({scriptError: null, scriptSuccess: null});
        this.modal.open();
    }

    updateData(field, value) {
        let data = this.state.data;
        data[field] = value;
        this.setState({data: data})
    }

    compile() {

        if (this.props.dslType && this.props.dslType.id) {

            if (this.props.dslType.id == "ANTLR_SPELL") {

                DSLRuleService.validateAntlrSpelDSLScript({script: this.props.data}).then(response => {
                        this.setState({scriptError: null, scriptSuccess: "Compile Successful"});

                    }
                ).catch((error) => {
                    this.handleCompileError(error);
                });

            } else if (this.props.dslType.id == "GROOVY") {

                DSLRuleService.validateGroovyDSLScript({script: this.props.data}).then(response => {
                        this.setState({scriptError: null, scriptSuccess: "Compile Successful"});

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
        if (error.response && error.response.data) {
            message = error.response.data;
        }
        this.setState({scriptError: message, scriptSuccess: null});
        console.log(message);
    }

    retrieveCompileMessage() {
        let errorBody = null;
        if(this.state.scriptError) {
            errorBody = <GridCell><span style={{color: 'red'}}>{this.state.scriptError}</span></GridCell>
        } else  if(this.state.scriptSuccess) {
            errorBody = <GridCell><span style={{color: 'green'}}>{this.state.scriptSuccess}</span></GridCell>
        }
        return errorBody;
    }

    handleObjectSelect(data) {
        let prevString = (this.props.data ? this.props.data : "");
        var regexpENdsWithWhitespace = /\s$/;
        if(!regexpENdsWithWhitespace.test(prevString)) {
            prevString = prevString + " ";
        }
        this.props.handleDataChange(prevString + data.map((e) => { return e._name}).join(".") + " ");
    }

    render() {

        return (
            <Modal ref={(c) => this.modal = c} title="Advanced DSL Script Editor"
                   large="true"
                   actions={[{label: "Close", action: () => this.handleClose()}]}>
                <Grid>
                    <GridCell width="1-1">
                        <JsonSchemaBrowser presentationMode={2}
                                           schemaServiceUrlPrefix={this.props.schemaServiceUrlPrefix}
                                           rootClass={this.props.rootClass}
                                           onSelect={(data) => {this.handleObjectSelect(data)}}>
                        </JsonSchemaBrowser>
                    </GridCell>
                    <GridCell width="1-1">
                        <TextArea label="Rule (DSL Script)" value={this.props.data}
                                  onchange={(e) => this.props.handleDataChange(e)}/>
                    </GridCell>
                    {this.retrieveCompileMessage()}
                    <GridCell width="1-1">
                        <Button label={"Compile"} onclick={() => {this.compile()}}/>
                    </GridCell>
                </Grid>
            </Modal>
        );
    }
}