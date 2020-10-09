import React from "react";
import * as axios from 'axios';
import uuid from "uuid";

import {TranslatingComponent} from 'susam-components/abstract';
import {PageHeader, Card, Grid, GridCell, CardHeader} from "susam-components/layout";
import {DropDown, Notify} from "susam-components/basic";
import {Chip} from "susam-components/advanced";

import {CountryPlanningService, LocationService, CommonService} from '../../services';

import {RoadSizeLimitationRule} from './RoadSizeLimitationRule';
import {WeightLimitationRule} from './WeightLimitationRule';
import {ExhaustEmissionRule} from './ExhaustEmissionRule';
import {DSLRule} from '../common/DSLRule';

export class CountryPlanningRule extends TranslatingComponent {


    constructor(props) {
        super(props);
        this.state = {data: {}, lookup: {}}
    }

    componentDidMount() {
        axios.all([
            LocationService.retrieveCountries(),
            CommonService.retrieveExhaustEmissionTypes(),
            CommonService.retrieveDSLTypes()
        ])
            .then(axios.spread((countries, exhaustEmissionTypes, dslTypes) => {
                let state = _.cloneDeep(this.state);

                state.lookup.country = countries.data;
                state.lookup.exhaustEmissionType = exhaustEmissionTypes.data;
                state.lookup.dslType = dslTypes.data;

                this.setState(state);
            })).catch((error) => {
            Notify.showError(error);
            console.log("Error:" + error);
        });
    }

    handleCountrySelection(value) {
        this.setState({country: value}, () => {
            this.loadWarehouseRules()
        });
    }


    loadWarehouseRules() {

        let country = this.state.country;

        if (country && country.iso) {
            CountryPlanningService.retrieveCountryPlanningRule(country.iso).then(response => {
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
            roadSizeLimitationRule: {},
            weightLimitationRule: {},
            exhaustEmissionRule: {},
            dslRule: []
        });
    }

    handleRenderData(data) {
        data.dslRule.forEach(d => d._uikey = uuid.v4());

        this.setState({
            roadSizeLimitationRule: data.roadSizeLimitationRule,
            weightLimitationRule: data.weightLimitationRule,
            exhaustEmissionRule: data.exhaustEmissionRule,
            dslRule: data.dslRule
        });
    }

    handleSaveRoadSizeLimitationRule(data) {
        CountryPlanningService.saveRoadSizeLimitationRule(
            this.state.country.iso,
            data
        ).then(response => {
                let data = response.data;
                this.setState({roadsizeLimitationRule: data}, Notify.showSuccess("Road Size Limitation Rule was saved successfully"));
            }
        ).catch((error) => {
            Notify.showError(error);
            console.log("Error:" + error);
        });
    }

    handleSaveWeightLimitationRule(data) {
        CountryPlanningService.saveWeightLimitationRule(
            this.state.country.iso,
            data
        ).then(response => {
                let data = response.data;
                this.setState({weightLimitationRule: data}, Notify.showSuccess("Weight Limitation Rule was saved successfully"));
            }
        ).catch((error) => {
            Notify.showError(error);
            console.log("Error:" + error);
        });
    }

    handleSaveExhaustLimitationRule(data) {
        CountryPlanningService.saveExhaustEmission(
            this.state.country.iso,
            data
        ).then(response => {
                let data = response.data;
                this.setState({exhaustEmissionRule: data}, Notify.showSuccess("Exhaust Emission Limitation Rule was saved successfully"));
            }
        ).catch((error) => {
            Notify.showError(error);
            console.log("Error:" + error);
        });
    }

    handleSaveAdvancedRule(data) {
        CountryPlanningService.saveAdvancedRule(
            this.state.country.iso,
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
        let country = this.state.country;

        let pageContent = [];

        if (country) {

            pageContent.push(
                <GridCell key="rslr" width="1-1">
                    <RoadSizeLimitationRule lookup={lookup} data={this.state.roadSizeLimitationRule}
                                            saveHandler={(data) => {
                                                this.handleSaveRoadSizeLimitationRule(data)
                                            }}></RoadSizeLimitationRule>
                </GridCell>);

            pageContent.push(
                <GridCell key="wlr" width="1-1">
                    <WeightLimitationRule lookup={lookup} data={this.state.weightLimitationRule}
                                          saveHandler={(data) => {
                                              this.handleSaveWeightLimitationRule(data)
                                          }}></WeightLimitationRule>
                </GridCell>);

            pageContent.push(
                <GridCell key="eer" width="1-1">
                    <ExhaustEmissionRule lookup={lookup} data={this.state.exhaustEmissionRule}
                                         saveHandler={(data) => {
                                             this.handleSaveExhaustLimitationRule(data)
                                         }}></ExhaustEmissionRule>
                </GridCell>);


            pageContent.push(
                <GridCell key="dslr" width="1-1">
                    <DSLRule lookup={lookup} data={this.state.dslRule}
                             saveHandler={(data) => {
                                 this.handleSaveAdvancedRule(data)
                             }}
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
                <PageHeader title="Country Rule Set Management"/>
                <Card>
                    <Grid>
                        <GridCell key="pgs" width="1-5" noMargin={true}>
                            <DropDown label="Country" options={lookup.country} value={country}
                                      onchange={(e) => this.handleCountrySelection(e)}/>
                        </GridCell>
                    </Grid>
                </Card>
                {pageContentElem}
            </div>
        );
    }
}