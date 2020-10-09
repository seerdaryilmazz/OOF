import React from "react";
import * as axios from 'axios';
import uuid from "uuid";

import {TranslatingComponent} from 'susam-components/abstract';
import {PageHeader, Card, Grid, GridCell, CardHeader} from "susam-components/layout";
import {DropDown, Notify, Button} from "susam-components/basic";
import {Chip} from "susam-components/advanced";


export class RuleSummaryCard extends TranslatingComponent {


    constructor(props) {
        super(props);
        this.state = {}

    }

    componentDidMount() {

        let title = this.state.title;
        let url = this.state.url;
        let data = this.state.data;

        if(this.props.title) {
            title = this.props.title;
        }
        if(this.props.url) {
            url = this.props.url;
        }
        if(this.props.data) {
            data = this.props.data;
        }

        this.setState({title: title, url: url, data: data});
    }

    componentWillReceiveProps(nextProps) {
        let title = this.state.title;
        let url = this.state.url;
        let data = this.state.data;

        if(nextProps.title) {
            title = nextProps.title;
        }
        if(nextProps.url) {
            url = nextProps.url;
        }
        if(nextProps.data) {
            data = nextProps.data;
        }

        this.setState({title: title, url: url, data: data});
    }

    detailsClicked(url) {
        window.open(url);
    }

    retrieveDetailsButton(url) {
        if(url) {
            return (
                <GridCell>
                    <Button label="Details" flat={true} style="success" size="small"
                            onclick={() => {this.detailsClicked(url)}}/>
                </GridCell>
            );
        }
        else {
            return null;
        }
    }

    render() {

        let data = this.state.data;
        if(!data) {
            return null;
        }

        return (
            <GridCell width="1-4">
                <Card title={this.state.title}>
                    <Grid>
                        <GridCell width="2-5">
                            <div className="md-input-filled">
                                <label>Total Rules: </label>
                            </div>
                        </GridCell>
                        <GridCell width="3-5">
                            {data.totalRuleCount}
                        </GridCell>
                        <GridCell width="2-5" noMargin={true}>
                            <div className="md-input-filled">
                                <label>Total Basic Rules: </label>
                            </div>
                        </GridCell>
                        <GridCell width="3-5" noMargin={true}>
                            {data.totalBasicRuleCount}
                        </GridCell>
                        <GridCell width="2-5" noMargin={true}>
                            <div className="md-input-filled">
                                <label>Total DSL Rules: </label>
                            </div>
                        </GridCell>
                        <GridCell width="3-5" noMargin={true}>
                            {data.totalDSLRuleCount}
                        </GridCell>
                        <GridCell width="2-5">
                            <div className="md-input-filled">
                                <label>Last Updated By: </label>
                            </div>
                        </GridCell>
                        <GridCell width="3-5">
                            {data.lastUpdatedBy ? data.lastUpdatedBy  : "-"}
                        </GridCell>
                        <GridCell width="2-5" noMargin={true}>
                            <div className="md-input-filled">
                                <label>Last Update Date: </label>
                            </div>
                        </GridCell>
                        <GridCell width="3-5" noMargin={true}>
                            {data.lastUpdateDateString ? data.lastUpdateDateString  : "-"}
                        </GridCell>
                        {this.retrieveDetailsButton(this.state.url)}
                    </Grid>
                </Card>
            </GridCell>
        );
    }
}