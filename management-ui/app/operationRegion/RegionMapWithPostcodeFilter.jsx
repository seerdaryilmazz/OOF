import React from "react";
import _ from "lodash";
import uuid from 'uuid';
import * as axios from 'axios';

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card} from "susam-components/layout";
import {Notify, TextInput, DropDown} from "susam-components/basic";
import {Map, Chip} from "susam-components/advanced";
import {RegionMap} from "./RegionMap";

import {ZoneService, LocationService} from '../services';

export class RegionMapWithPostcodeFilter extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            country: null,
            postcode: null,
            subregion: null,
            countries: [],
            subregions: []
        }
    }

    componentDidMount() {
        this.loadCountries();
    }

    componentWillReceiveProps(nextProps) {
    }

    loadCountries() {
        LocationService.retrieveCountries().then(response => {
            this.setState({countries: response.data});
        }).catch(error => {
            Notify.showError(error);
        });
    }

    updateCountry(value) {
        this.setState({country: value, postcode: null, subregion: null, subregions: []}, () => {
            this._map.onCountryChange(value);
        });
    }

    updatePostcode(value) {

        this.setState({postcode: value, subregion: null, subregions: []}, () => {

            if (value && value.length >= 2) {

                let isoAlpha3Code = this.state.country.isoAlpha3Code;
                let searchType = "STARTS";
                let postcode = value;
                let searchForDrawing = false;

                ZoneService.getPolygonRegionsByPostcode(isoAlpha3Code, searchType, postcode, searchForDrawing).then(response => {
                    let subregions = response.data;
                    subregions.forEach(elem => {
                        if (elem.parent == "/") {
                            elem.absoluteName = elem.parent + elem.name;
                        } else {
                            elem.absoluteName = elem.parent + "/" + elem.name;
                        }
                    });
                    this.setState({subregions: subregions});
                }).catch(error => {
                    Notify.showError(error);
                });
            }
        });
    }

    updateSubregion(value) {

        if (value) {
            this._map.triggerRecursiveDrillDown(value);
        }

        this.setState({subregion: value});
    }

    clearCountryPostcodeSubregion() {
        this.setState({country: null, postcode: null, subregion: null, subregions: []});
    }

    renderCountryPostcodeSubregion(state) {

        let countryComponent = (
            <DropDown label="Select country"
                      onchange={(value) => this.updateCountry(value)}
                      options={this.state.countries}
                      valueField="id"
                      labelField="name"
                      value={this.state.country}/>
        );

        let postcodeComponent = (
            <TextInput label="Type a postcode to find sub regions"
                       placeholder="Type at least 2 chars"
                       value={this.state.postcode}
                       onchange={(value) => this.updatePostcode(value)}/>
        );

        let subregionComponent = (
            <DropDown label="Select sub region"
                      onchange={(value) => this.updateSubregion(value)}
                      options={this.state.subregions}
                      valueField="id"
                      labelField="absoluteName"
                      value={this.state.subregion}/>
        );

        if (!state.country) {
            return (
                <Grid>
                    <GridCell width="1-1">
                        {countryComponent}
                    </GridCell>
                </Grid>
            );
        } else {
            if (!state.postcode) {
                return (
                    <Grid>
                        <GridCell width="1-2">
                            {countryComponent}
                        </GridCell>
                        <GridCell width="1-2">
                            {postcodeComponent}
                        </GridCell>
                    </Grid>
                );
            } else {
                return (
                    <Grid>
                        <GridCell width="1-3">
                            {countryComponent}
                        </GridCell>
                        <GridCell width="1-3">
                            {postcodeComponent}
                        </GridCell>
                        <GridCell width="1-3">
                            {subregionComponent}
                        </GridCell>
                    </Grid>
                );
            }
        }
    }

    getAddedPolygons() {
        return this._map.getAddedPolygons();
    }

    doRemove() {
        this._map.doRemove();
    }

    render() {

        let state = _.cloneDeep(this.state);

        return (
            <Grid>
                <GridCell width="1-1" noMargin="true">
                    {this.renderCountryPostcodeSubregion(state)}
                </GridCell>
                <GridCell width="1-1">
                    <RegionMap width="100%"
                               height="550px"
                               polygonRegionsThatCanBeAdded={this.props.polygonRegionsThatCanBeAdded}
                               polygonRegionsThatCannotBeAdded={this.props.polygonRegionsThatCannotBeAdded}
                               polygonRegionsThatAreAdded={this.props.polygonRegionsThatAreAdded}
                               ref={(c) => this._map = c}
                               mapId={this.props.mapId}
                               canAddCountryIfNotExists={this.props.canAddCountryIfNotExists}
                               categoriesWhenAdding={this.props.categoriesWhenAdding}
                               caller={this.props.caller}
                               getConfirmationIfNecessaryBeforeRemove={this.props.getConfirmationIfNecessaryBeforeRemove}
                               onRemove={this.props.onRemove}
                               onResize={this.props.onResize}
                               center={this.props.center}/>
                </GridCell>
            </Grid>
        );
    }
}