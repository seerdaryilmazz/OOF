import React from "react";
import _ from "lodash";
import uuid from 'uuid';

import {TranslatingComponent} from 'susam-components/abstract';
import {Button, DropDown} from "susam-components/basic";
import {Grid, GridCell, HeaderWithBackground} from "susam-components/layout";
import {Date as DateSelector} from 'susam-components/advanced';

import {CountryDropDown, CountryPointDropDown, LoadWeightTypeDropDown, ShipmentLoadingTypeDropDown, UserDropDown} from '../common';
import * as Constants from "../common/Constants";

const ACTIVE = {
    id: 1,
    name: "Active",
    value: true
};

const PASSIVE = {
    id: 2,
    name: "Passive",
    value: false
};

export class PotentialSearchPanel extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {};
        this.idForSearchPanel = "potentialSearchPanel" + uuid.v4();
        this.initialDisplayValueForSearchPanel = props.mode === Constants.POTENTIAL_LIST_MODE_SEARCH_AND_SELECT ? "block" : "none";
    }

    showOrHideSearchPanel() {
        $("#" + this.idForSearchPanel).slideToggle("slow");
    }

    updateSearchParams(propertyKey, propertyValue) {
        let searchParams = _.cloneDeep(this.props.searchParams);
        _.set(searchParams, propertyKey, propertyValue);
        if (propertyKey == "fromCountry") {
            _.set(searchParams, "fromCountryPoint", null);
        } else if (propertyKey == "toCountry") {
            _.set(searchParams, "toCountryPoint", null);
        }
        this.props.onSearchParamsChange(searchParams);
    }

    clearSearchParams() {
        this.props.onSearchParamsClear();
    }

    getCountryPointType() {
        let serviceArea = this.props.serviceArea;
        let countryPointType = null;
        if (serviceArea) {
            if (serviceArea == "ROAD") {
                countryPointType = "POSTAL";
            } else if (serviceArea == "SEA") {
                countryPointType = "PORT";
            } else if (serviceArea == "AIR") {
                countryPointType = "AIRPORT";
            }
        }
        return countryPointType;
    }

    getCountryPointLabel(prefix) {
        let serviceArea = this.props.serviceArea;
        let label = null;
        if (serviceArea) {
            if (serviceArea == "ROAD") {
                label = prefix + " Postal";
            } else if (serviceArea == "SEA") {
                label = prefix + " Port";
            } else if (serviceArea == "AIR") {
                label = prefix + " Airport";
            }
        }
        return label;
    }

    getShipmentLoadingTypeLabel() {
        let serviceArea = this.props.serviceArea;
        let label = null;
        if (serviceArea) {
            if (serviceArea == "ROAD") {
                label = "Shipment Loading Type";
            } else if (serviceArea == "SEA") {
                label = "FCL/LCL";
            }
        }
        return label;
    }

    renderLoadWeightType() {
        if (this.props.serviceArea == "ROAD" && this.props.mode !== Constants.POTENTIAL_LIST_MODE_SEARCH_AND_SELECT) {
            return (
                <GridCell width="1-4">
                    <LoadWeightTypeDropDown label="Load Type"
                                            value={this.props.searchParams.loadWeightType}
                                            translate={true}
                                            onchange={(value) => this.updateSearchParams("loadWeightType", value)}/>
                </GridCell>
            );
        } else {
            return null;
        }
    }

    renderShipmentLoadingType() {
        if (this.props.serviceArea == "ROAD" || this.props.serviceArea == "SEA") {
            return (
                <GridCell width="1-4">
                    <ShipmentLoadingTypeDropDown label={this.getShipmentLoadingTypeLabel()}
                                                 serviceArea={this.props.serviceArea}
                                                 value={this.props.searchParams.shipmentLoadingType}
                                                 translate={true}
                                                 onchange={(value) => this.updateSearchParams("shipmentLoadingType", value)}/>
                </GridCell>
            );
        } else {
            return null;
        }
    }
    
    renderStatus() {
        if (this.props.mode !== Constants.POTENTIAL_LIST_MODE_SEARCH_AND_SELECT) {
            return (
                <GridCell width="1-4">
                    <DropDown label="Status"
                              options={[ACTIVE, PASSIVE]}
                              value={this.props.searchParams.status}
                              translate={true}
                              onchange={(value) => this.updateSearchParams("status", value)}/>
                </GridCell>
            );
        } else {
            return null;
        }
    }
    
    renderCreatedBy() {
        if (this.props.mode !== Constants.POTENTIAL_LIST_MODE_SEARCH_AND_SELECT) {
            return (
                <GridCell width="1-4">
                    <UserDropDown label="Created By"
                                  value={this.props.searchParams.createdBy}
                                  translate={true}
                                  valueField="username"
                                  labelField="displayName"
                                  onchange={(value) => this.updateSearchParams("createdBy", value)}/>
                </GridCell>
            );
        } else {
            return null;
        }
    }
    
    renderMinCreationDate() {
        if (this.props.mode !== Constants.POTENTIAL_LIST_MODE_SEARCH_AND_SELECT) {
            return (
                <GridCell width="1-4">
                    <DateSelector label="Min Creation Date"
                                  value={this.props.searchParams.minCreationDate}
                                  onchange={(value) => this.updateSearchParams("minCreationDate", value)}/>
                </GridCell>
            );
        } else {
            return null;
        }
    }
    
    renderMaxCreationDate() {
        if (this.props.mode !== Constants.POTENTIAL_LIST_MODE_SEARCH_AND_SELECT) {
            return (
                <GridCell width="1-4">
                    <DateSelector label="Max Creation Date"
                                  value={this.props.searchParams.maxCreationDate}
                                  onchange={(value) => this.updateSearchParams("maxCreationDate", value)}/>
                </GridCell>
            );
        } else {
            return null;
        }
    }
    
    renderHeader() {
        if (this.props.mode === Constants.POTENTIAL_LIST_MODE_SEARCH_AND_SELECT) {
            return (
                <GridCell width="1-1" noMargin={true}>
                    <HeaderWithBackground title="Potential Search"/>
                </GridCell>
            );
        } else {
            return (
                <GridCell width="1-1" noMargin={true}>
                    <HeaderWithBackground title="Potential Search" icon="close"
                                          onIconClick={() => this.showOrHideSearchPanel()}/>
                </GridCell>
            );
        }
    }

    render() {
        if (this.props.serviceArea == "DTR" || this.props.serviceArea == "CCL") {
            return null;
        } else {
            return (
                <div style={{display: this.initialDisplayValueForSearchPanel}} id={this.idForSearchPanel}>
                    <Grid removeTopMargin={true}>
                        {this.renderHeader()}
                        <GridCell width="1-4">
                            <CountryDropDown label="From Country"
                                             value={this.props.searchParams.fromCountry}
                                             translate={true}
                                             onchange={(value) => this.updateSearchParams("fromCountry", value)}/>
                        </GridCell>
                        <GridCell width="1-4">
                            <CountryPointDropDown label={this.getCountryPointLabel("From")}
                                                  country={this.props.searchParams.fromCountry}
                                                  type={this.getCountryPointType()}
                                                  value={this.props.searchParams.fromCountryPoint}
                                                  translate={true}
                                                  onchange={(value) => this.updateSearchParams("fromCountryPoint", value)}/>
                        </GridCell>
                        <GridCell width="1-4">
                            <CountryDropDown label="To Country"
                                             value={this.props.searchParams.toCountry}
                                             translate={true}
                                             onchange={(value) => this.updateSearchParams("toCountry", value)}/>
                        </GridCell>
                        <GridCell width="1-4">
                            <CountryPointDropDown label={this.getCountryPointLabel("To")}
                                                  country={this.props.searchParams.toCountry}
                                                  type={this.getCountryPointType()}
                                                  value={this.props.searchParams.toCountryPoint}
                                                  translate={true}
                                                  onchange={(value) => this.updateSearchParams("toCountryPoint", value)}/>
                        </GridCell>
                        {this.renderLoadWeightType()}
                        {this.renderShipmentLoadingType()}
                        {this.renderStatus()}
                        {this.renderCreatedBy()}
                        {this.renderMinCreationDate()}
                        {this.renderMaxCreationDate()}
                        <GridCell width="1-1">
                            <div className="uk-align-right">
                                <Button label="Clear" style="primary" onclick={() => this.clearSearchParams()}/>
                                <Button label="Search" style="success" onclick={() => this.props.onSearchClick()}/>
                            </div>
                        </GridCell>
                        <GridCell width="1-1"/>
                    </Grid>
                </div>
            );
        }
    }
}