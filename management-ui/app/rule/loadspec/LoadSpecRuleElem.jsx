import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {Button, DropDown} from 'susam-components/basic';
import {NumericInput} from 'susam-components/advanced';

import {Card, Grid, GridCell, CardHeader} from "susam-components/layout";


export class LoadSpecRuleElem extends TranslatingComponent {


    constructor(props) {
        super(props);
        this.state = {
            lookup: {},
            data: {},
            isHidden: false
        }

    }

    componentDidMount() {
        this.initializeState(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.initializeState(nextProps);
    }

    initializeState(props) {
        let data = {} ;
        let lookup = {};
        if (props.data) {
            data = props.data;
        }
        if (props.lookup) {
            lookup = props.lookup;
        }
        this.setState({data: data, lookup: lookup});
    }

    updateData(field, value) {
        console.log(field + " - " + value);
        let data = this.state.data;
        data[field] = value;
        this.setState({data: data});
    }

    handleShowHideClick() {
        if (this.state.isHidden) {
            this.setState({isHidden: false});
        } else {
            this.setState({isHidden: true});
        }
    }

    retrieveShowHideIcon() {
        if (this.state.isHidden) {
            return "angle-double-down";
        } else {
            return "angle-double-up";
        }
    }


    render() {

        let data = this.state.data;

        return (
            <Card title="Load Specification Rule"
                  toolbarItems={[{icon: this.retrieveShowHideIcon(), action: () => this.handleShowHideClick()}]}>
                <Grid hidden={this.state.isHidden}>
                    <GridCell width="1-5"><span>Long Goods: </span></GridCell>
                    <GridCell width="3-5">
                        <Grid>
                            <GridCell width="2-10" noMargin={true}>
                                <NumericInput label="Length > (cm)" value={data.lgLength}
                                              onchange={(value) => {this.updateData("lgLength", value)}}/>
                            </GridCell>
                            <GridCell width="8-10"/>
                        </Grid>
                    </GridCell>
                    <GridCell width="1-5"/>


                    <GridCell width="1-5"><span>Oversize Goods: </span></GridCell>
                    <GridCell width="3-5" >
                        <Grid>
                            <GridCell width="2-10" noMargin={true}>
                                <NumericInput label="Length > (cm)" value={data.ooggLength}
                                              onchange={(value) => {this.updateData("ooggLength", value)}}/>
                            </GridCell>
                            <GridCell width="1-10"><span>OR</span></GridCell>
                            <GridCell width="2-10" noMargin={true}>
                                <NumericInput label="Width > (cm)" value={data.ooggWidth}
                                              onchange={(value) => {this.updateData("ooggWidth", value)}}/>
                            </GridCell>
                            <GridCell width="1-10"><span>OR</span></GridCell>
                            <GridCell width="2-10" noMargin={true}>
                                <NumericInput label="Height > (cm)" value={data.ooggHeight}
                                              onchange={(value) => {this.updateData("ooggHeight", value)}}/>
                            </GridCell>
                            <GridCell width="2-10"/>
                        </Grid>
                    </GridCell>
                    <GridCell width="1-5"/>

                    <GridCell width="1-5"><span>Heavy Goods: </span></GridCell>
                    <GridCell width="3-5" >
                        <Grid>
                            <GridCell width="2-10" noMargin={true}>
                                <NumericInput label="Weight per LDM > (kg/ldm)" value={data.hgWeightPerLdm}
                                              onchange={(value) => {this.updateData("hgWeightPerLdm", value)}}/>
                            </GridCell>
                            <GridCell width="8-10"/>
                        </Grid>
                    </GridCell>
                    <GridCell width="1-5"/>

                    <GridCell width="1-5"><span>Valuable Goods: </span></GridCell>
                    <GridCell width="3-5" >
                        <Grid>
                            <GridCell width="2-10" noMargin={true}>
                                <NumericInput label="Total Value is greater than" value={data.vgTotalValue} unit="€"
                                              onchange={(value) => {this.updateData("vgTotalValue", value)}}/>
                            </GridCell>
                            <GridCell width="1-10"><span> OR </span></GridCell>
                            <GridCell width="2-10" noMargin={true}>
                                <NumericInput label="Value per weight is greater than" value={data.vgValuePerWeight} unit = "€/kg"
                                              onchange={(value) => {this.updateData("vgValuePerWeight", value)}}/>
                            </GridCell>
                            <GridCell width="1-2"/>
                        </Grid>
                    </GridCell>
                    <GridCell width="1-5"/>

                    <GridCell width="1-10">
                        <Button label={"Save"} onclick={() => { this.props.saveHandler(this.state.data);}}/>
                    </GridCell>
                </Grid>
            </Card>
        );
    }
}