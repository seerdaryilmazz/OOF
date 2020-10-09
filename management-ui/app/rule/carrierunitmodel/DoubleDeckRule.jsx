import React from "react";
import uuid from "uuid";

import {TranslatingComponent} from 'susam-components/abstract';
import {Button, DropDown, Checkbox} from 'susam-components/basic';
import {NumericInput} from 'susam-components/advanced';

import {Card, Grid, GridCell, CardHeader} from "susam-components/layout";

export class DoubleDeckRule extends TranslatingComponent {


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
        let data = {}
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
            <Card title="Double Deck Rule" toolbarItems={[{icon: this.retrieveShowHideIcon(), action: () => this.handleShowHideClick()}]}>
                <Grid hidden={this.state.isHidden}>
                    <GridCell width="1-1">
                        Loads which are planned for upper deck can not exceed:
                    </GridCell>
                    <GridCell width="1-5">
                        <NumericInput value={data.weightPerLdm} onchange={(data) => {this.updateData("weightPerLdm", data)}} unit="kg/ldm"/>
                    </GridCell>
                    <GridCell width="4-5"/>
                    <GridCell >
                        <Button label="Save" flat={true} style="success" size="large"
                                onclick={() => {this.props.saveHandler(this.state.data)}}/>
                    </GridCell>
                </Grid>
            </Card>
        );
    }
}