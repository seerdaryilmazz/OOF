import React from "react";
import * as axios from 'axios';
import uuid from "uuid";

import {TranslatingComponent} from 'susam-components/abstract';
import {PageHeader, Card, Grid, GridCell, CardHeader} from "susam-components/layout";
import {DropDown, Notify} from "susam-components/basic";
import {Chip} from "susam-components/advanced";

import {CommonService, TruckLoadTypeRuleService} from '../../services';

import {TruckLoadRuleElem} from './TruckLoadRuleElem';

import {DSLRule} from '../common/DSLRule';

export class TruckLoadTypeRule extends TranslatingComponent {


    constructor(props) {
        super(props);
        this.state = {data: {}, lookup: {}}
    }

    componentDidMount() {
        axios.all([
            CommonService.retrieveTruckLoadSubTypes(),
            CommonService.retrieveApprovalTypes(),
            CommonService.retrieveApprovalTypesExtended(),
            CommonService.retrieveApprovalWorkflows(),
            CommonService.retrieveDSLTypes()
        ])
            .then(axios.spread((truckLoadSubTypes, approvalTypes, approvalTypesExtended, approvalWorkflows, dslTypes) => {
                let state = _.cloneDeep(this.state);

                state.lookup.truckLoadSubType = truckLoadSubTypes.data;
                state.lookup.approvalType = approvalTypes.data;
                state.lookup.approvalTypeExtended = approvalTypesExtended.data;
                state.lookup.approvalWorkflow = approvalWorkflows.data;
                state.lookup.dslType = dslTypes.data;

                this.setState(state);
            })).catch((error) => {
            Notify.showError(error);
            console.log("Error:" + error);
        });
    }

    handleTruckLoadSubTypeSelection(value) {
        this.setState({truckLoadSubType: value}, () => {
            this.loadTruckLoadSubTypeRules()
        });
    }


    loadTruckLoadSubTypeRules() {

        let truckLoadSubType = this.state.truckLoadSubType;

        if (truckLoadSubType && truckLoadSubType.id) {
            TruckLoadTypeRuleService.retrieveTruckLoadTypeRule(truckLoadSubType.id).then(response => {
                    let data = response.data;
                    if (data == null || data == "") {
                        this.initializeRuleData();
                    } else {
                        this.handleRenderData(data);
                    }
                }
            ).catch((error) => {
                this.handleError("An Error Occured While Loading Rules", error);
                console.log("Error:" + error);
            });
        }

    }

    initializeRuleData() {
        this.setState({
            data: {
                truckLoadSubTypeId: this.state.truckLoadSubType? this.state.truckLoadSubType.id : null,
                ctwThirdPartyRule: {},
                dfwThirdPartyRule: {},
                combinationAtXDockRule: {},
                dslRule: []
            }
        });
    }

    handleRenderData(data) {
        data.dslRule.forEach(d => d._uikey = uuid.v4());

        this.setState({
            data: data
        });
    }

    handleSaveTruckLoadTypeRule(data) {

        let dataToBePost = _.cloneDeep(this.state.data);

        this.copyBaseParameterValues(data, dataToBePost);

        TruckLoadTypeRuleService.saveTruckLoadTypeRule(
            this.state.truckLoadSubType.id,
            dataToBePost
        ).then(response => {
                let pageData = _.cloneDeep(this.state.data);
                this.copyBaseParameterValues(response.data, pageData);
                this.setState({data: pageData}, Notify.showSuccess("Truck Load Type Rule is saved successfully"));
            }
        ).catch((error) => {
            Notify.showError(error);
        });
    }

    copyBaseParameterValues(dataToBeCopiedFrom, dataToBeCopiedTo) {
        dataToBeCopiedTo.ctwThirdPartyRule = dataToBeCopiedFrom.ctwThirdPartyRule;
        dataToBeCopiedTo.dfwThirdPartyRule = dataToBeCopiedFrom.dfwThirdPartyRule;
        dataToBeCopiedTo.combinationAtXDockRule = dataToBeCopiedFrom.combinationAtXDockRule;
    }

    handleSaveAdvancedRule(data) {
        TruckLoadTypeRuleService.saveAdvancedRule(
            this.state.truckLoadSubType.id,
            data
        ).then(response => {
                let data = response.data;
                data.forEach(d => d._uikey = uuid.v4());
                let pageData = this.state.data;
                pageData.dslRule = data;
                this.setState({data: pageData}, Notify.showSuccess("Advanced Rules were saved successfully"));
            }
        ).catch((error) => {
            Notify.showError(error);
        });
    }

    render() {


        let data = this.state.data;
        let lookup = this.state.lookup;
        let truckLoadSubType = this.state.truckLoadSubType;


        let truckLoadSubTypeSelection = [];

        let pageContent = [];


        truckLoadSubTypeSelection.push (
            <DropDown label="Load Type" options={lookup.truckLoadSubType} value={truckLoadSubType}
                      onchange={(e) => this.handleTruckLoadSubTypeSelection(e)}/>
        )

        if (truckLoadSubType) {
            pageContent.push(
                <GridCell key="trle" width="1-1">
                    <TruckLoadRuleElem  lookup={lookup}
                                        ctwThirdPartyRule={data.ctwThirdPartyRule}
                                        dfwThirdPartyRule={data.dfwThirdPartyRule}
                                        combinationAtXDockRule={data.combinationAtXDockRule}
                                        saveHandler={(data1, data2, data3) => {this.handleSaveTruckLoadTypeRule(data1, data2, data3)}}>

                    </TruckLoadRuleElem>
                </GridCell>
            );
            pageContent.push(
                <GridCell key="dslr" width="1-1">
                    <DSLRule lookup={lookup} data={data.dslRule}
                             saveHandler={(data) => {this.handleSaveAdvancedRule(data)}}
                             schemaServiceUrlPrefix={"/order-service/schema?className="}
                             rootClass={"ekol.orders.domain.TransportOrder"}>
                    </DSLRule>
                </GridCell>
            );
        }

        let pageContentElem = null;

        if (pageContent.length > 0) {
            pageContentElem =
                <Grid>
                    {pageContent}
                </Grid>
        }

        return (
            <div>
                <PageHeader title="Truck Load Type Rule Set Management"/>
                <Card>
                    <Grid>
                        <GridCell key="tlsts" width="1-5" noMargin={true}>
                            {truckLoadSubTypeSelection}
                        </GridCell>
                    </Grid>
                </Card>
                {pageContentElem}
            </div>
        );
    }
}