import React from "react";
import _ from "lodash";
import uuid from 'uuid';
import * as axios from "axios";
import PropTypes from "prop-types";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, HeaderWithBackground, Loader, Pagination} from "susam-components/layout";
import {Notify, TextInput, Button, DropDown, Span, Checkbox} from 'susam-components/basic';
import {Date as DateSelector, DateTime, NumericInput} from 'susam-components/advanced';

import {
    QuoteStatusDropDown,
    QuoteTypeDropDown,
    QuoteTypePrinter,
    UserDropDown,
    ShipmentLoadingTypeDropDown,
    CountryPointDropDown,
    CountryDropDown

} from '../common';

export class QuoteSearchPanel extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {
            ready: false,
        };
        this.idForSearchPanel = "quoteSearchPanel" + uuid.v4(); 
        
    }


    showOrHideSearchPanel() {
        $("#" + this.idForSearchPanel).slideToggle("slow");
    }

    updateSearchParams(propertyKey, propertyValue) {
        let searchParams = _.cloneDeep(this.props.searchParams);
        _.set(searchParams, propertyKey, propertyValue);
        this.props.onSearchParamsChange(searchParams);
    }

    clearSearchParams() {
        this.props.onSearchParamsClear();
    }

    getCountryPointType() {
        let serviceArea = this.props.serviceArea;
        let countryPointType = null;
        if (serviceArea) {
            if (serviceArea == "ROAD" || serviceArea == "DTR") {
                countryPointType = "POSTAL";
            } else if (serviceArea == "SEA") {
                countryPointType = "PORT";
            } else if (serviceArea == "AIR") {
                countryPointType = "AIRPORT";
            }
        }
        return countryPointType;
    }

    render(){
        return (
            <div style={{display: "none"}} id={this.idForSearchPanel}>
                <Grid removeTopMargin={true}>
                    <GridCell width="1-1" noMargin={true}>
                        <HeaderWithBackground title="Quote Search" icon="close"
                                              onIconClick={() => this.showOrHideSearchPanel()}/>
                    </GridCell>
                    <GridCell width="1-6">
                        <NumericInput label="Number"
                                      value={this.props.searchParams.number}
                                      onchange={(value) => this.updateSearchParams("number", value)}
                                      allowMinus={false}/>
                    </GridCell>
                    <GridCell width="1-6">
                            <CountryDropDown label="From Country"
                                                 value={this.props.searchParams.fromCountry}
                                                 translate={true}
                                                 onchange={(value) => this.updateSearchParams("fromCountry", value)}/>
                        </GridCell>
                        <GridCell width="1-6">
                            <CountryPointDropDown label="From Point" 
                                                country={this.props.searchParams.fromCountry}
                                                type={this.getCountryPointType()}
                                                value={this.props.searchParams.fromPoint}
                                                translate={true} multiple={false} 
                                                onchange={(value) => this.updateSearchParams("fromPoint", value)}/>
                        </GridCell>
                 
                        <GridCell width="1-6">
                            <CountryDropDown label="To Country"
                                                 value={this.props.searchParams.toCountry}
                                                 translate={true}
                                                 onchange={(value) => this.updateSearchParams("toCountry", value)}/>
                        </GridCell>
                        <GridCell width="1-6">
                            <CountryPointDropDown label="To Point"
                                                country={this.props.searchParams.toCountry}
                                                type={this.getCountryPointType()}
                                                value={this.props.searchParams.toPoint}
                                                translate={true} multiple={false} 
                                                onchange={(value) => this.updateSearchParams("toPoint", value)}/>
                        </GridCell>
                        <GridCell width="1-6">
                            <ShipmentLoadingTypeDropDown label="Shipment Loading Type" serviceArea= {this.props.serviceArea}
                                          value={this.props.searchParams.shipmentLoadingType}
                                          translate={true} shortenForRoad={true}
                                          onchange={value =>this.updateSearchParams("shipmentLoadingType", value)}/>
                        </GridCell>
                        <GridCell width="1-5">
                        <QuoteStatusDropDown label="Status"
                                             value={this.props.searchParams.status}
                                             translate={true}
                                             onchange={(value) => this.updateSearchParams("status", value)}/>
                    </GridCell>
                    <GridCell width="1-5">
                        <QuoteTypeDropDown label="Type"
                                           value={this.props.searchParams.type}
                                           translate={true}
                                           onchange={(value) => this.updateSearchParams("type", value)}/>
                    </GridCell>
                    <GridCell width="1-5">
                        <UserDropDown label="Created By"
                                      value={this.props.searchParams.createdBy}
                                      translate={true}
                                      valueField="username"
                                      labelField="displayName"
                                      onchange={(value) => this.updateSearchParams("createdBy", value)}/>
                    </GridCell>
                   
                    <GridCell width="1-5">
                        <DateSelector label="Min Update Date"
                                      value={this.props.searchParams.minUpdateDate}
                                      onchange={(value) => this.updateSearchParams("minUpdateDate", value)}/>
                    </GridCell>
                    <GridCell width="1-5">
                        <DateSelector label="Max Update Date"
                                      value={this.props.searchParams.maxUpdateDate}
                                      onchange={(value) => this.updateSearchParams("maxUpdateDate", value)}/>
                    </GridCell>
                    <GridCell width="1-5">
                        <DateSelector label="Min Created Date"
                                      value={this.props.searchParams.minCreatedAt}
                                      onchange={(value) => this.updateSearchParams("minCreatedAt", value)}/>
                    </GridCell>
                    <GridCell width="1-5">
                        <DateSelector label="Max Created Date"
                                      value={this.props.searchParams.maxCreatedAt}
                                      onchange={(value) => this.updateSearchParams("maxCreatedAt", value)}/>
                     </GridCell>
                    <GridCell width="1-1">
                        <div className="uk-align-right">
                            <Button label="Clear" onclick={() => this.clearSearchParams()}/>
                            <Button label="Search" onclick={() => this.props.onSearchClick()}/>
                        </div>
                    </GridCell>
                </Grid>
            </div>
        );
    }


}

