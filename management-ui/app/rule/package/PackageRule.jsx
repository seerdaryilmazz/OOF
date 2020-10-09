import React from "react";
import * as axios from 'axios';
import uuid from "uuid";

import {TranslatingComponent} from 'susam-components/abstract';
import {PageHeader, Card, Grid, GridCell, CardHeader} from "susam-components/layout";
import {DropDown, Notify, Button} from "susam-components/basic";
import {Chip} from "susam-components/advanced";

import {PackageRuleService, KartoteksService, VehicleService, CommonService} from '../../services';

import {HandlingControl} from './HandlingControl';
import {HandlingTime} from './HandlingTime';
import {DSLRule} from '../common/DSLRule';


export class PackageRule extends TranslatingComponent {


    constructor(props) {
        super(props);
        this.state = {data: {}, lookup: {}}

    }

    componentDidMount() {
        axios.all([
            CommonService.retrievePackageGroups(),
            CommonService.retrieveRangeTypes(),
            CommonService.retrieveApprovalTypes(),
            KartoteksService.getEkolLocations(),
            CommonService.retrieveApprovalWorkflows(),
            CommonService.retrieveDSLTypes()
        ])
            .then(axios.spread((packageGroups, rangeTypes, approvalTypes, ekolLocations, approvalWorkflows, dslTypes) => {
                let state = _.cloneDeep(this.state);
                state.lookup.packageGroup = packageGroups.data;
                state.lookup.rangeType = rangeTypes.data;
                state.lookup.approvalType = approvalTypes.data;
                state.lookup.ekolLocation = ekolLocations.data;
                state.lookup.approvalWorkflow = approvalWorkflows.data;
                state.lookup.dslType = dslTypes.data;

                this.setState(state);

            })).catch((error) => {
            Notify.showError(error);
            console.log("Error:" + error);
        });
    }

    handlePackageGroupSelection(value) {
        this.setState({packageGroup: value}, () => {this.loadPackageRules()});
    }


    loadPackageRules() {

        let selectedPackageGroup = this.state.packageGroup;

        if (selectedPackageGroup && selectedPackageGroup.id) {
            let response = PackageRuleService.retrievePackageRule(selectedPackageGroup.id).then(response => {
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
    }

    initializeRuleData() {
        this.setState({
            handlingControl: [],
            handlingTime: null,
            dslRule: []
        });
    }

    handleRenderData(data) {
        data.handlingControl.forEach(d => d._uikey = uuid.v4());
        data.dslRule.forEach(d => d._uikey = uuid.v4());

        this.setState({
            handlingTime: data.handlingTime,
            handlingControl: data.handlingControl,
            dslRule: data.dslRule
        });

    }


    handleSaveHandlingControl(data) {
        PackageRuleService.saveHandlingControlRule(
            this.state.packageGroup.id,
            data
        ).then(response => {
                let data = response.data;
                data.forEach(d => d._uikey = uuid.v4());
                this.setState({handlingControl: data}, Notify.showSuccess("Handling Control Rules were saved successfully"));
            }
        ).catch((error) => {
            Notify.showError(error);
            console.log("Error:" + error);
        });
    }

  
    handleSaveHandlingTime(data) {
        PackageRuleService.saveHandlingTime(
            this.state.packageGroup.id,
            data
        ).then(response => {
                let data = response.data;
                this.setState({handlingTime: data}, Notify.showSuccess("Handling Time Rules were saved successfully"));
            }
        ).catch((error) => {
            Notify.showError(error);
            console.log("Error:" + error);
        });
    }

    handleSaveAdvancedRule(data) {
        PackageRuleService.saveAdvancedRule(
            this.state.packageGroup.id,
            data
        ).then(response => {
                let data = response.data;
                data.forEach(d => d._uikey = uuid.v4());
                this.setState({dslRule: data}, Notify.showSuccess("Advanced Rules were saved successfully"));
            }
        ).catch((error) => {
            Notify.showError(error);
            console.log("Error:" + error);
        });
    }

    render() {

        let lookup = this.state.lookup;
        let packageGroup = this.state.packageGroup;

        let packageSelection = [];

        let pageContent = [];


        packageSelection.push(
            <GridCell key="pgs" width="1-5" noMargin={true}>
                <DropDown label="Package Group" options={lookup.packageGroup} value={packageGroup}
                          onchange={(e) => this.handlePackageGroupSelection(e)}/>
            </GridCell>);
        
        if (packageGroup) {

            pageContent.push(
                <GridCell key="htc" width="1-2">
                    <HandlingTime lookup={lookup} data={this.state.handlingTime}
                                  saveHandler={(data) => {this.handleSaveHandlingTime(data)}}></HandlingTime>
                </GridCell>
            );
            pageContent.push(
                <GridCell key="hcc" width="1-1">
                    <HandlingControl lookup={lookup} data={this.state.handlingControl}
                                     saveHandler={(data) => {this.handleSaveHandlingControl(data)}}></HandlingControl>
                </GridCell>);


            pageContent.push(
                <GridCell key="arc" width="1-1">
                    <DSLRule lookup={lookup} data={this.state.dslRule}
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
                <PageHeader title="Package Group Rules"/>
                <Card>
                    <Grid>
                        {packageSelection}
                    </Grid>
                </Card>
                {pageContentElem}
            </div>
        );
    }
}