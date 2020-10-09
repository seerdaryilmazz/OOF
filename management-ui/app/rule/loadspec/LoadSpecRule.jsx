import React from "react";
import * as axios from 'axios';
import uuid from "uuid";

import {TranslatingComponent} from 'susam-components/abstract';
import {PageHeader, Card, Grid, GridCell, CardHeader} from "susam-components/layout";
import {DropDown, Notify} from "susam-components/basic";
import {Chip} from "susam-components/advanced";

import {CommonService, LoadSpecRuleService} from '../../services';

import {LoadSpecRuleElem} from './LoadSpecRuleElem';

import {DSLRule} from '../common/DSLRule';

export class LoadSpecRule extends TranslatingComponent {


    constructor(props) {
        super(props);
        this.state = {data: {}, lookup: {}}
    }

    componentDidMount() {
        axios.all([
            CommonService.retrieveDSLTypes(),

        ]).then(axios.spread((dslTypes) => {
                let state = _.cloneDeep(this.state);
                state.lookup.dslType = dslTypes.data;
                this.setState(state, () => {this.loadLoadSpecRules()});
            })).catch((error) => {
            Notify.showError(error);
            console.log("Error:" + error);
        });
    }

    loadLoadSpecRules() {

        LoadSpecRuleService.retrieveLoadSpecRule().then(response => {
                let data = response.data;
                if (data == null || data == "") {
                    this.initializeRuleData();
                } else {
                    this.handleRenderData(data);
                }
            }
        ).catch((error) => {
            Notify.showError(error);
            console.log("Error:" + error);
        });

    }

    initializeRuleData() {
        this.setState({
            data: {
                loadSpecGenericRule: {},
                dslRule: []
            }
        });
    }

    handleRenderData(data) {
        data.dslRule.forEach(d => d._uikey = uuid.v4());

        this.setState({
            loadSpecGenericRule: data.loadSpecGenericRule,
            dslRule: data.dslRule
        });
    }

    handleSaveLoadSpecGenericRule(loadSpecGenericRule) {
        LoadSpecRuleService.saveLoadSpecGenericRule(
            loadSpecGenericRule
        ).then(response => {
                this.setState({loadSpecGenericRule: response.data}, Notify.showSuccess("Load Specification Rule is saved successfully"));
            }
        ).catch((error) => {
            Notify.showError(error);
        });
    }

    handleSaveAdvancedRule(data) {
        LoadSpecRuleService.saveAdvancedRule(
            data
        ).then(response => {
                let data = response.data;
                data.forEach(d => d._uikey = uuid.v4());
                this.setState({dslRule: data}, Notify.showSuccess("Advanced Rules were saved successfully"));
            }
        ).catch((error) => {
            Notify.showError(error);
        });
    }

    render() {
        let lookup = this.state.lookup;

        return (
            <div>
                <PageHeader title="Load Specification Rules"/>
                <Grid>
                    <GridCell key="trle" width="1-1">
                        <LoadSpecRuleElem lookup={lookup}
                                          data={this.state.loadSpecGenericRule}
                                           saveHandler={(data) => {this.handleSaveLoadSpecGenericRule(data)}}>
                        </LoadSpecRuleElem>
                    </GridCell>

                    <GridCell key="dslr" width="1-1">
                        <DSLRule lookup={lookup} data={this.state.dslRule}
                                 saveHandler={(data) => {this.handleSaveAdvancedRule(data)}}
                                 schemaServiceUrlPrefix={"/order-service/schema?className="}
                                 rootClass={"ekol.orders.domain.TransportOrder"}>
                        </DSLRule>
                    </GridCell>
                </Grid>
            </div>
        );
    }
}