import React from "react";
import _ from 'lodash';

import {TranslatingComponent} from 'susam-components/abstract';
import {Button, DropDown, TextInput} from 'susam-components/basic';
import {NumericInput} from 'susam-components/advanced';

import {Card, Grid, GridCell, CardHeader} from "susam-components/layout";

export class RampNumberEdit extends TranslatingComponent {


    constructor(props) {
        super(props);
        this.state = {
            data:{}
        }
    }

    componentWillMount() {
        this.initializeState(this.props);
    }

    componentDidMount() {
        this.initializeState(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.initializeState(nextProps);
    }

    initializeState(props) {
        let data = props.value;
        if(data) {
            if (!data.selectionType) {
                if (data.rampFrom || _.isNumber(data.rampFrom) || data.rampTo || _.isNumber(data.rampTo)) {
                    if (data.rampFrom == data.rampTo) {
                        data.selectionType = "EQUALS";
                    } else {
                        data.selectionType = "RANGE";
                    }
                    this.props.onchange(data);
                }

            }
        }

    }

    selectionChangeHandler(data, updatedData) {
        if(!updatedData) return;

        data.selectionType = updatedData.id;

        data.rampFrom = null;
        data.rampTo = null;

        this.props.onchange(data);
    }

    renderNumericInputContent(data) {

        let content = null;
        if (data) {
            if (data.selectionType == "EQUALS") {
                content =
                    <Grid>
                        <GridCell width="1-2" noMargin={true}>
                            <NumericInput
                                label="Ramp No"
                                value={data.rampFrom}
                                onchange={(incData) => { data.rampFrom = incData;data.rampTo = incData; this.props.onchange(data)}}/>
                        </GridCell>
                        <GridCell width="1-2">
                        </GridCell>
                    </Grid>
            }
            if (data.selectionType == "RANGE") {

                content =
                    <Grid>
                        <GridCell width="1-2" noMargin={true}>
                            <NumericInput
                                label="Ramp Interval - From"
                                value={data.rampFrom}
                                onchange={(incData) => { data.rampFrom = incData; this.props.onchange(data)}}/>
                        </GridCell>
                        <GridCell width="1-2" noMargin={true}>
                            <NumericInput
                                label="Ramp Interval - To"
                                value={data.rampTo}
                                onchange={(incData) => { data.rampTo = incData; this.props.onchange(data)}}/>
                        </GridCell>
                    </Grid>
            }
        }
        return content;
    }

    render () {

        let data = this.props.value;

        return (
            <Grid>
                <GridCell width="1-3" noMargin={true}>
                    <DropDown options={[{id:"EQUALS", name: "Equals"}, {id:"RANGE", name:"Range"}]}
                              value={data.selectionType}
                              onchange={(updatedData) => {this.selectionChangeHandler(data, updatedData)}}/>
                </GridCell>
                <GridCell width="2-3" noMargin={true}>
                {this.renderNumericInputContent(data)}
               </GridCell>
            </Grid>
        )
    }
}