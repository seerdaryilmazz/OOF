import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {NumericInput} from 'susam-components/advanced';
import {Button} from 'susam-components/basic';

import {Card, Grid, GridCell, CardHeader} from "susam-components/layout";

export class WeightLimitationRule extends TranslatingComponent {


    constructor(props) {
        super(props);
        this.state = {
            data: {},
            isHidden:true
        }
    }

    componentDidMount() {
        let data = {};
        if (this.props.data) {
            data = this.props.data;
        }

        this.setState({data: data});
    }

    componentWillReceiveProps(nextProps) {
        let data = {};
        if (nextProps.data) {
            data = nextProps.data;
        }
        this.setState({data: data});

    }

    updateData(field, value) {
        let data = this.state.data;
        data[field] = value;
        this.setState({data: data})
    }

    handleShowHideClick() {
        if(this.state.isHidden) {
            this.setState({isHidden: false});
        } else {
            this.setState({isHidden: true});
        }
    }

    retrieveShowHideIcon() {
        if(this.state.isHidden) {
            return "angle-double-down";
        } else {
            return "angle-double-up";
        }
    }

    render() {

        let data = this.state.data;

        return (
            <Card title="Weight Limitation Rule" toolbarItems={[{icon: this.retrieveShowHideIcon(), action: () => this.handleShowHideClick()}]}>
                <Grid hidden={this.state.isHidden}>
                    <GridCell width="1-5">
                        <NumericInput digit="2" unit="kg" label="Gross Weight"
                                      value={data.grossWeight}
                                      onchange={(val) => {this.updateData("grossWeight", val)}}></NumericInput>
                    </GridCell>
                    <GridCell width="1-5">
                        <NumericInput digit="2" unit="kg" label="Weight per Axle"
                                      value={data.weightPerAxle}
                                      onchange={(val) => {this.updateData("weightPerAxle", val)}}></NumericInput>
                    </GridCell>
                    <GridCell width="3-5"/>
                    <GridCell width="1-1">
                        <Button label="Save" flat={true} style="success" size="large"
                                onclick={() => {this.props.saveHandler(data)}}/>
                    </GridCell>
                </Grid>
            </Card>
        );
    }
}