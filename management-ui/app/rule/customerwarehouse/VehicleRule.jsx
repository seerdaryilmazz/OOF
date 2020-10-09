import React from "react";
import uuid from "uuid";

import {TranslatingComponent} from 'susam-components/abstract';
import {Button, Checkbox} from 'susam-components/basic';
import {Chip} from 'susam-components/advanced';

import {CardHeader, Grid, GridCell} from "susam-components/layout";

export class VehicleRule extends TranslatingComponent {


    constructor(props) {
        super(props);
        this.state = {
            data: {},
            lookup: []
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
        if (props.lookup) {
            state.lookup = props.lookup;
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
        let lookup = this.state.lookup;

        return (
            <div>
                <CardHeader title = "Motor Vehicle" />
                <Grid>
                    <GridCell width="1-3" noMargin = {true}>
                        <Chip label="Truck Brands" options={lookup.motorVehicleBrand} hideSelectAll = {true}
                              value={data.truckBrands} onchange={(value) => {this.updateData("truckBrands", value)}} />
                    </GridCell>
                    <GridCell width="1-3" noMargin = {true}>
                        <div className = "uk-margin-top">
                            <Checkbox label="Motor vehicle should be owned by Ekol" value={data.rentedTrucksProhibited} onchange={(value) => {this.updateData("rentedTrucksProhibited", value)}} />
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