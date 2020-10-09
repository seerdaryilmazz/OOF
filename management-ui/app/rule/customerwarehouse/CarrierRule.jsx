import React from "react";
import uuid from "uuid";
import _ from "lodash";

import {TranslatingComponent} from 'susam-components/abstract';
import {Button, Checkbox, TextInput, Notify} from 'susam-components/basic';
import {Chip} from 'susam-components/advanced';

import {CardHeader, Grid, GridCell} from "susam-components/layout";
import * as axios from "axios";
import {CommonService} from "../../services";

export class CarrierRule extends TranslatingComponent {

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
        console.log("data", props.data);
        this.setState(state);
    }

    updateData(field, value) {
        let data = this.state.data;
        data[field] = value;
        this.setState({data: data})
    }

    updateLoadingType(key, value){
        let data = this.state.data;
        data[key] = value;
        this.setState({data: data});
    }

    handleSave(){
        let calls = [];
        if(_.isArray(this.state.data.requiredLoading)){
            calls.push(CommonService.validateVehicleFeatures(this.state.data.requiredLoading.map(item => item.code)));
        }
        if(_.isArray(this.state.data.requiredUnloading)){
            calls.push(CommonService.validateVehicleFeatures(this.state.data.requiredUnloading.map(item => item.code)));
        }
        axios.all(calls).then(axios.spread(() => {
                this.props.onSave(this.state.data);
            })).catch(error => Notify.showError(error));
    }
    render(){
        let {data} = this.state;

        return (
            <div>
                <CardHeader title = "Carrier" />
                <Grid>
                    <GridCell width = "1-1" noMargin = {true}>
                        <span className = "label">Handling Operation Types</span>
                    </GridCell>
                    <GridCell width = "1-1" noMargin = {true}>
                        <Grid>
                            <GridCell width="1-10" noMargin={true}>
                                <Checkbox label="Side" value={data.sideLoading}
                                          onchange={(value) => this.updateLoadingType("sideLoading", value)}/>
                            </GridCell>
                            <GridCell width="1-10" noMargin={true}>
                                <Checkbox label="Ramp" value={data.rampLoading}
                                          onchange={(value) => this.updateLoadingType("rampLoading", value)}/>
                            </GridCell>
                            <GridCell width="1-10" noMargin={true}>
                                <Checkbox label="Crane" value={data.craneLoading}
                                          onchange={(value) => this.updateLoadingType("craneLoading", value)}/>
                            </GridCell>
                        </Grid>
                    </GridCell>
                    <GridCell width = "1-1"/>
                    <GridCell width = "1-3">
                        <Chip label = "Required For Loading" options = {this.props.lookup.vehicleFeature} hideSelectAll = {true}
                              value = {data.requiredLoading} valueField = "code"
                              onchange={(value) => this.updateData("requiredLoading", value)} />
                    </GridCell>
                    <GridCell width = "1-3">
                        <Chip label = "Required For Unloading" options = {this.props.lookup.vehicleFeature} hideSelectAll = {true}
                              value = {data.requiredUnloading} valueField = "code"
                              onchange={(value) => this.updateData("requiredUnloading", value)} />
                    </GridCell>
                    <GridCell width = "1-1">
                        <div className = "uk-margin-top">
                            <Button label="Save" style="primary" size="small"
                                    onclick={() => {this.handleSave()}}/>
                        </div>
                    </GridCell>
                </Grid>
            </div>
        );
    }
}