import React from "react";
import * as axios from 'axios';
import uuid from "uuid";

import {TranslatingComponent} from 'susam-components/abstract';
import {PageHeader, Card, Grid, GridCell, CardHeader} from "susam-components/layout";
import {DropDown, Notify, RadioGroup} from "susam-components/basic";
import {Chip} from "susam-components/advanced";

import {CarrierUnitModelRuleService, CommonService, VehicleService} from '../../services';

import {DoubleDeckRule} from './DoubleDeckRule';
import {DSLRule} from '../common/DSLRule';

export class CarrierUnitModelRule extends TranslatingComponent {


    constructor(props) {
        super(props);
        this.state = {data: {}, lookup: {carrierUnitModel:[]}}
        this.CARRIER_TYPE_TRAILER_ID="TRAILER";
        this.CARRIER_TYPE_CONTAINER_ID="CONTAINER";
    }

    componentDidMount() {
        axios.all([
            VehicleService.retrieveCarrierTypes(),
            VehicleService.retrieveTrailerModels(),
            VehicleService.retrieveContainerModels(),
            CommonService.retrieveDSLTypes()
        ])
            .then(axios.spread((carrierTypes, trailerModels, containerModels, dslTypes) => {
                let state = _.cloneDeep(this.state);

                state.lookup.carrierType = carrierTypes.data;
                state.lookup.trailerModel = trailerModels.data.map(d => {
                    return this.formatCarrierUnitModel(d)
                });
                state.lookup.containerModel = containerModels.data.map(d => {
                    return this.formatCarrierUnitModel(d)
                });
                state.lookup.dslType = dslTypes.data;

                this.setState(state);
            })).catch((error) => {
            Notify.showError(error);
            console.log("Error:" + error);
        });
    }

    formatCarrierUnitModel(carrierUnitModel) {
        return {
            id: carrierUnitModel.id,
            name: (carrierUnitModel.brandName + " - " + carrierUnitModel.modelName),
            carrierType: carrierUnitModel.carrier.carrierType
        };
    }

    handleCarrierUnitModelSelection(value) {
        this.setState({selectedCarrierUnitModel: value}, () => {
            this.loadCarrierUnitModelRules()
        });
    }


    loadCarrierUnitModelRules() {

        let selectedCarrierUnitModel = this.state.selectedCarrierUnitModel;

        if (selectedCarrierUnitModel && selectedCarrierUnitModel.id) {
            CarrierUnitModelRuleService.retrieveCarrierUnitModelRule(selectedCarrierUnitModel.carrierType.id, selectedCarrierUnitModel.id).then(response => {
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
            doubleDeckRule: {},
            dslRule: []
        });
    }

    handleRenderData(data) {
        data.dslRule.forEach(d => d._uikey = uuid.v4());

        this.setState({
            doubleDeckRule: data.doubleDeckRule,
            dslRule: data.dslRule
        });
    }


    handleSaveDoubleDeckRule(data) {
        CarrierUnitModelRuleService.saveDoubleDeckRule(
            this.state.selectedCarrierUnitModel.carrierType.id,
            this.state.selectedCarrierUnitModel.id,
            data
        ).then(response => {
                this.setState({doubleDeckRule: response.data}, Notify.showSuccess("Double Deck Rule were saved successfully"));
            }
        ).catch((error) => {
            Notify.showError(error);
            console.log("Error:" + error);
        });
    }

    handleSaveAdvancedRule(data) {
        CarrierUnitModelRuleService.saveAdvancedRule(
            this.state.selectedCarrierUnitModel.carrierType.id,
            this.state.selectedCarrierUnitModel.id,
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

    handleCarrierTypeSelection(carrierType) {

        let lookup = this.state.lookup;

        this.setState({selectedCarrierType: carrierType}, () => {

            let models = [];

            if (carrierType && carrierType.id == this.CARRIER_TYPE_TRAILER_ID) {
                if (lookup.trailerModel) {
                    lookup.carrierUnitModel = lookup.trailerModel;
                    this.setState({lookup: lookup, selectedCarrierUnitModel: null});
                }
            } else if (carrierType && carrierType.id == this.CARRIER_TYPE_CONTAINER_ID) {
                if (lookup.containerModel) {
                    lookup.carrierUnitModel = lookup.containerModel;
                    this.setState({lookup: lookup, selectedCarrierUnitModel: null});
                }
            }
        });

    }
    render() {

        let lookup = this.state.lookup;
        let selectedCarrierUnitModel = this.state.selectedCarrierUnitModel;

        let pageContent = [];

        if (selectedCarrierUnitModel) {

            pageContent.push(
                <GridCell key="rfur" width="1-1">
                    <DoubleDeckRule
                        data={this.state.doubleDeckRule}
                        saveHandler={(data) => {this.handleSaveDoubleDeckRule(data)}}>
                    </DoubleDeckRule>
                </GridCell>
            );

            pageContent.push(
                <GridCell key="dslr" width="1-1">
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
                <PageHeader title="Carrier Unit Model Rule Set Management"/>
                <Card>
                    <Grid>
                        <GridCell key="rgcts" width="1-5" noMargin={true}>
                            <RadioGroup options={this.state.lookup.carrierType}
                                        inline={true} value={this.state.selectedCarrierType}
                                        onchange={(val) => this.handleCarrierTypeSelection(val)}/>
                        </GridCell>
                        <GridCell width="1-1"/>
                        <GridCell key="ddcums" width="1-5" hidden={!this.state.selectedCarrierType} noMargin={true}>
                            <DropDown label="Carrier Unit Model" options={lookup.carrierUnitModel} value={selectedCarrierUnitModel}
                                      onchange={(e) => this.handleCarrierUnitModelSelection(e)}/>
                        </GridCell>
                    </Grid>
                </Card>
                {pageContentElem}
            </div>
        );
    }
}