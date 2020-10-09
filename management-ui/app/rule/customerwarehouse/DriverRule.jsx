import React from "react";
import uuid from "uuid";

import {TranslatingComponent} from 'susam-components/abstract';
import {Button, Checkbox, TextInput} from 'susam-components/basic';
import {Chip} from 'susam-components/advanced';

import {CardHeader, Grid, GridCell} from "susam-components/layout";

export class DriverRule extends TranslatingComponent {


    constructor(props) {
        super(props);
        this.state = {
            data: {}
        }
    }

    componentDidMount() {
        this.initializeState(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.initializeState(nextProps);
    }

    initializeState(props) {
        let state = this.state;
        if (props.data) {
            state.data = props.data;
        }
        this.setState(state);
    }
    updateData(field, value) {
        let data = this.state.data;
        data[field] = value;
        this.setState({data: data})
    }
    render() {
        let data = this.state.data;
        return (
            <div>
                <CardHeader title = "Driver" />
                <Grid>
                    <GridCell width="1-3" noMargin = {true}>
                        <Chip label="Language" options = {this.props.lookup.languages}
                              value = {data.languages} hideSelectAll = {true}
                              onchange={(value) => this.updateData("languages", value)} />
                    </GridCell>
                    <GridCell width="1-3" noMargin = {true}>
                        <div className = "uk-margin-top">
                            <Checkbox label="Driver is not allowed to accompany the loading/unloading operations"
                                      value={data.driverAccompanyNotAllowed}
                                      onchange={(value) => this.updateData("driverAccompanyNotAllowed", value)} />
                        </div>
                    </GridCell>
                    <GridCell width = "1-1" noMargin = {true}>
                        <div className = "uk-margin-top">
                            <Button label="Save" style="primary" size="small"
                                    onclick={() => {this.props.saveHandler(this.state.data)}}/>
                        </div>
                    </GridCell>
                </Grid>
            </div>
        );
    }
}