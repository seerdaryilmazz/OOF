import React from "react";
import uuid from "uuid";

import {TranslatingComponent} from 'susam-components/abstract';
import {Button, DropDown, Checkbox} from 'susam-components/basic';

import {Card, Grid, GridCell, CardHeader} from "susam-components/layout";

export class RFUsageRule extends TranslatingComponent {


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
            <Card title="RF Usage Rule" toolbarItems={[{icon: this.retrieveShowHideIcon(), action: () => this.handleShowHideClick()}]}>
                <Grid hidden={this.state.isHidden}>
                    <GridCell width="1-1">
                        <span>RF have to be used for chosen operations: </span>
                    </GridCell>
                    <GridCell width="1-1">
                        <Checkbox label="Loading" checked={data.loading} onchange={(data) => {this.updateData("loading", data)}}/>
                        <Checkbox label="Unloading" checked={data.unloading} onchange={(data) => {this.updateData("unloading", data)}}/>
                    </GridCell>
                    <GridCell >
                        <Button label="Save" flat={true} style="success" size="large"
                                onclick={() => {this.props.saveHandler(this.state.data)}}/>
                    </GridCell>
                </Grid>
            </Card>
        );
    }
}