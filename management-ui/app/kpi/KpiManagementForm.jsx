import _ from "lodash";
import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, CardHeader} from "susam-components/layout";
import {Notify, DropDown, Form, Span, TextInput} from "susam-components/basic";
import {NumericInput} from "susam-components/advanced";

export class KpiManagementForm extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {}
    }

    componentDidMount(){
        this.initialize(this.props);
    }

    componentWillReceiveProps(nextProps){
        this.initialize(nextProps);
    }

    initialize(props) {
        if (props) {
            this.setState({activePeriod: props.selectedItem.code, activeLabel: props.selectedItem.name});
        }else{
            this.setState({activePeriod: "", activeLabel: ""});
        }
    }

    updateState(key, value){
        this.props.onchange && this.props.onchange(key, value);
    }

    validate(){
        return this.form.validate();
    }

    reset(){
        return this.form.reset();
    }

    render(){
        if(!this.props.selectedItem){
            return null;
        }

        return (
        <div>
                <Grid>
                    <GridCell width="1-1" noMargin={true}>
                        <CardHeader title="KPI Form"/>
                    </GridCell>
                </Grid>
                <Grid>
                    <GridCell width="1-1" noMargin={true}>
                        <Form ref = {(form) => {this.form = form}} >
                            <Grid>
                                <GridCell width="1-4">
                                    <DropDown options = {this.props.collectors}
                                              label="Collector"
                                              value = {this.props.selectedItem.collector}
                                              onchange = {(value) => this.updateState("collector", value)}
                                              required={true}/>
                                </GridCell>
                                <GridCell width="1-4">
                                    <Grid collapse = {true}>
                                        <GridCell noMargin = {true} width="1-6">
                                            <NumericInput label="Period"
                                                          value = {this.props.selectedItem.period.value}
                                                          onchange = {(value) => this.updateState("period.value", value)}
                                                          required={true}/>

                                        </GridCell>
                                        <GridCell noMargin = {true} width="5-6">

                                            <DropDown options = {this.props.periods}
                                                      value = {this.props.selectedItem.period.period}
                                                      onchange = {(value) => this.updateState("period.period", value)}
                                                      required={true}/>

                                        </GridCell>
                                    </Grid>
                                </GridCell>
                                <GridCell width="1-6">
                                    <Grid collapse = {true}>

                                        <GridCell noMargin = {true} width="1-2">
                                            <DropDown options = {this.props.operators}
                                                      label="Objective"
                                                      value = {this.props.selectedItem.objective.operator}
                                                      onchange = {(value) => this.updateState("objective.operator", value)}
                                                      required={true}/>
                                        </GridCell>

                                        <GridCell noMargin = {true} width="1-2">
                                            <NumericInput value = {this.props.selectedItem.objective.value}
                                                          onchange = {(value) => this.updateState("objective.value", value)}
                                                          required={true}/>
                                        </GridCell>

                                    </Grid>
                                </GridCell>
                                <GridCell width="2-6">
                                    <TextInput label="Description"
                                               value={this.props.selectedItem.description}
                                               onchange = {(value) => this.updateState("description", value)}
                                               required={true}/>
                                </GridCell>
                            </Grid>
                        </Form>
                    </GridCell>
                </Grid>
        </div>

        );
    }
}
