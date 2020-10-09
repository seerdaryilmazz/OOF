import React from 'react';
import * as axios from 'axios';
import _ from 'lodash';

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card, Section} from 'susam-components/layout';
import {Notify, DropDown, Checkbox} from 'susam-components/basic';
import {CurrencyInput} from 'susam-components/advanced';

import {OrderService} from '../services';

export class OrderGeneralInfo extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {};
        if (props.data) {
            this.state.orderGeneralInfo = props.data;
        } else {
            this.state.orderGeneralInfo = {};
        }
        this.applyProjectFilter(this.state, this.props.project);
    }


    componentDidMount() {
        axios.all([OrderService.getServiceTypes(),
            OrderService.getIncoTerms(),
            OrderService.getTruckLoadTypes()])
            .then(axios.spread((serviceTypes, incoterms, truckLoadTypes) => {
                let state = _.cloneDeep(this.state);
                state.orderGeneralInfo = this.props.data;
                state.serviceTypes = serviceTypes.data;
                state.incoterms = incoterms.data;
                state.truckLoadTypes = truckLoadTypes.data;
                state.ready = true;
                this.applyProjectFilter(state, this.props.project);
                this.setState(state);
            })).catch(error => {
            Notify.showError(error);
        });

    }

    componentWillReceiveProps(nextProps) {
        let state = _.cloneDeep(this.state);
        state.orderGeneralInfo = nextProps.data;
        this.applyProjectFilter(state, nextProps.project);
        this.setState(state);
    }

    updateState(field, value) {
        let orderGeneralInfo = _.cloneDeep(this.state.orderGeneralInfo);
        orderGeneralInfo[field] = value;
        this.setState({orderGeneralInfo: orderGeneralInfo});
        this.props.onupdate && this.props.onupdate(orderGeneralInfo);
    }

    applyProjectFilter(state, project) {

        if (!project || state.filtered || !state.ready) return;

        if (project.serviceTypes) {
            state.serviceTypes = this.retrieveFilteredResult(state.serviceTypes, project.serviceTypes.data, "code");
        }
        if (project.incoterms) {
            state.incoterms = this.retrieveFilteredResult(state.incoterms, project.incoterms.data, "code");
        }
        if (project.truckLoadTypes) {
            state.truckLoadTypes = this.retrieveFilteredResult(state.truckLoadTypes, project.truckLoadTypes.data, "code");
        }

        if (project.insuredByEkol) {
            if (project.insuredByEkol.data.code == "1") {
                state.orderGeneralInfo.insuredByEkol = true;
                state.hideInsuranceField = true;
            } else if (project.insuredByEkol.data.code == "0") {
                state.orderGeneralInfo.insuredByEkol = false;
                state.hideInsuranceField = true;
            } else {
                state.orderGeneralInfo.insuredByEkol = null;
                state.hideInsuranceField = false;
            }
        } else {
            state.hideInsuranceField = false;
        }
        this.handleAutoSelect(state);
        state.filtered = true;
    }

    handleAutoSelect(state) {
        let orderGeneralInfo = state.orderGeneralInfo;

        if (!orderGeneralInfo.serviceType && state.serviceTypes && state.serviceTypes.length == 1) {
            orderGeneralInfo.serviceType = state.serviceTypes[0];
        }
        if (!orderGeneralInfo.incoterm && state.incoterms && state.incoterms.length == 1) {
            orderGeneralInfo.incoterm = state.incoterms[0];
        }
        if (!orderGeneralInfo.truckLoadType && state.truckLoadTypes && state.truckLoadTypes.length == 1) {
            orderGeneralInfo.truckLoadType = state.truckLoadTypes[0];
        }
    }

    retrieveFilteredResult(array, filterObj, field) {

        if (array == null || !Array.isArray(array) || array.length == 0) return [];
        if (filterObj == null) return array;

        if (Array.isArray(filterObj)) {
            if (filterObj.length == 0) return array;
            else {
                return array.filter(elem1 => {
                    return filterObj.map(elem2 => {
                        return elem2[field]
                    }).includes(elem1[field]);
                })
            }
        }
        else {
            return array.filter(elem1 => {
                return (elem1[field] == filterObj[field]);
            })
        }

    }

    render() {
        return (
            <Card title={super.translate("Order General Information")}>
                <Grid>
                    <GridCell width="1-2">
                        <DropDown label="Service Type" required={true} autoSelect={true}
                                  onchange={(value) => this.updateState("serviceType", value)}
                                  value={this.state.orderGeneralInfo.serviceType}
                                  options={this.state.serviceTypes}/>
                    </GridCell>
                    <GridCell width="1-2">
                        <DropDown label="Incoterms" required={true} autoSelect={true}
                                  onchange={(value) => this.updateState("incoterm", value)}
                                  value={this.state.orderGeneralInfo.incoterm}
                                  options={this.state.incoterms}/>
                    </GridCell>
                    <GridCell width="1-2">
                        <DropDown label="FTL/LTL" required={true} autoSelect={true}
                                  onchange={(value) => this.updateState("truckLoadType", value)}
                                  value={this.state.orderGeneralInfo.truckLoadType}
                                  options={this.state.truckLoadTypes}/>
                    </GridCell>
                    <GridCell width="1-2">
                        <Grid hidden={this.state.hideInsuranceField} >
                            <GridCell width="1-2" noMargin={true}>
                                <Checkbox label="Order will be insured by Ekol"
                                          onchange={(value) => this.updateState("insuredByEkol", value)}
                                          checked={this.state.orderGeneralInfo.insuredByEkol}/>
                            </GridCell>
                        </Grid>
                    </GridCell>
                </Grid>
            </Card>
        );
    }
}

OrderGeneralInfo.contextTypes = {
    translator: React.PropTypes.object
};
