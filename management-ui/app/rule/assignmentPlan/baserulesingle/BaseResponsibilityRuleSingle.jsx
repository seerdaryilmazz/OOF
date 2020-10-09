import _ from "lodash";
import * as axios from 'axios';
import uuid from "uuid";

import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {Page, Grid, GridCell, Card, Loader, PageHeader, CardHeader} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown} from "susam-components/basic";

import {AssignmentPlanningRuleService} from "../../../services";


export class BaseResponsibilityRuleSingle extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {
            lookup: {},
        }
    };

    componentWillReceiveProps() {
        if(this.props.data) {
            if(!this.state.dataKey) {
                this.setState({dataKey: this.props.dataKey, selectedItem: {}});
            } else if(this.state.dataKey != this.props.dataKey){
                this.setState({dataKey: this.props.dataKey, selectedItem: {}});
            }
        }
    }

    handleDataChange(field, value) {
        let data = this.props.data && this.props.data.length > 0 ? this.props.data[0] : {};

        if (!value && !data.warehouse && !data.responsible) {
            this.props.dataUpdateHandler(null);
            return;
        }

        data[field] = value;

        this.props.dataUpdateHandler(data);
    }

    render() {

        let data = this.props.data ? this.props.data[0] : [];
        let lookup = this.props.lookup;
        let ruleType = this.props.ruleType;

        if (!ruleType || !lookup) {
            return null;
        }

        return (
            <div>
                <Grid>
                    <GridCell width="1-1" noMargin={true}>
                        <CardHeader title="Base Rule"/>
                    </GridCell>
                    <GridCell width="1-4">
                        <DropDown options = {lookup.warehouse}
                                  label="Warehouse"
                                  value = {data ? data.warehouse : null}
                                  onchange = {(value) => this.handleDataChange("warehouse", value)}
                                  required={true}/>
                    </GridCell>
                    <GridCell width="1-4">
                        <DropDown options = {lookup.subsidiaries}
                                  label="Responsible"
                                  value = {data ? data.responsible : null}
                                  onchange = {(value) => this.handleDataChange("responsible", value)}
                                  required={true}/>
                    </GridCell>
                </Grid>
            </div>
        );
    }
}
