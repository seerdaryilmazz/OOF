import React from "react";
import * as axios from "axios";

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell} from "susam-components/layout";
import {Notify, ReadOnlyDropDown, Form, Span} from 'susam-components/basic';
import {LookupService} from '../services';
import {NumberInput, Chip} from "susam-components/advanced";
import {CompanySearchAutoComplete} from 'susam-components/oneorder';

import {withReadOnly, PotentialUtils} from "../utils";
import { CountryPoint } from "./CountryPoint";

export class SeaPotential extends TranslatingComponent{

    static defaultProps = {
        potential: PotentialUtils.getEmptyPotential("SEA")
    };

    constructor(props){
        super(props);
        this.state = {
            from: {},
            to: {}
        };
    }

    componentDidMount(){
        this.initializeLookups();
        this.retrieveCountryPointsIfNecessary(null, this.props);
    }

    initializeLookups(){
        axios.all([
            LookupService.getCountries(),
            LookupService.getShipmentLoadingType('SEA'),
            LookupService.getChargeableVolumes(),
            LookupService.getContainerTypes(),
            LookupService.getIncoterms(),
            LookupService.getIncotermExplanation(),
            LookupService.getFrequencyTypes()
        ]).then(axios.spread((countries, shipmentLoadingTypes, chargeableVolumes,
                              containerTypes, incoterms, incotermExplanations, frequencyTypes) => {
            this.setState({
                countries: countries.data,
                shipmentLoadingTypes: shipmentLoadingTypes.data,
                chargeableVolumes: chargeableVolumes.data,
                containerTypes: containerTypes.data,
                incoterms: incoterms.data,
                incotermExplanations: incotermExplanations.data,
                frequencyTypes: frequencyTypes.data});
        })).catch(error => {
            Notify.showError(error);
        })
    }
    componentDidUpdate(prevProps) {
        this.retrieveCountryPointsIfNecessary(prevProps, this.props);
    }

    retrieveCountryPointsIfNecessary(previousProps, currentProps) {

        let previousFromCountryIso = _.get(previousProps, "potential.fromCountry.iso", "");
        let currentFromCountryIso = _.get(currentProps, "potential.fromCountry.iso", "");

        let previousToCountryIso = _.get(previousProps, "potential.toCountry.iso", "");
        let currentToCountryIso = _.get(currentProps, "potential.toCountry.iso", "");

        if (!_.isEqual(previousFromCountryIso, currentFromCountryIso)) {
            this.retrieveCountryPoints(currentFromCountryIso, 'from');
        }

        if (!_.isEqual(previousToCountryIso, currentToCountryIso)) {
            this.retrieveCountryPoints(currentToCountryIso, 'to');
        }
    }

    retrieveCountryPoints(countryIso, direction){
        let callback = (newCountryPoitnts) => {
            if (direction == "from") {
                let from = _.cloneDeep(this.state.from);
                from.countryPoints = newCountryPoitnts;
                this.setState({from: from});
            } else {
                let to = _.cloneDeep(this.state.to);
                to.countryPoints = newCountryPoitnts;
                this.setState({to: to});
            }
        };
        if (countryIso) {
            LookupService.getCountyPoints(countryIso, 'PORT').then(response => {
                callback(response.data);
            }).catch(error => {
                console.log(error);
                Notify.showError(error);
            });
        } else {
            callback([]);
        }
    }

    validate(){
        if(!this.form.validate()){
            return false;
        }
        if(this.props.potential.frequencyType){
            if(!this.props.potential.frequency){
                Notify.showError("if frequency type exists, frequency should not be empty");
                return false;
            }
        }
        return true;
    }

    handleChange(key, value){
        let potential = _.cloneDeep(this.props.potential);
        potential[key] = value;
        if(key === "shipmentLoadingType"){
            potential.chargeableVolumes = null;
            potential.containerTypes = null;
        }else if(key === 'fromCountry'){
            potential.fromPoint = null;
        }
        else if(key === 'toCountry'){
            potential.toPoint = null;
        }
        else if(key === 'shipmentLoadingTypes'){
            potential.shipmentLoadingTypes = [value];
        }
        this.props.onChange(potential);
    }

    renderChargeableVolume(){
        let chargeableVolumes = [];
        let readOnly;
        if(this.state.chargeableVolumes){
            let shipmentLoadingType = this.props.potential.shipmentLoadingType ? this.props.potential.shipmentLoadingType.code : 'FCL'
            chargeableVolumes = this.state.chargeableVolumes.filter(payWeight => payWeight.shipmentLoadingType.code === shipmentLoadingType);
        }
        if(!chargeableVolumes || chargeableVolumes.length == 1){
            readOnly = true;
        }
        return(
            <ReadOnlyChip options = {chargeableVolumes} label="Chargeable Volumes" labelField="name" hideSelectAll = {true}
                          value = {this.props.potential.chargeableVolumes} required={true} readOnly={readOnly || this.props.readOnly}
                          onchange = {(chargeableVolume) => {chargeableVolume ? this.handleChange("chargeableVolumes", chargeableVolume) : null}}/>
        );
    }

    renderContainerType(){
        let containerTypes = [];
        let readOnly;
        if(this.state.containerTypes){
            let shipmentLoadingType = this.props.potential.shipmentLoadingType ? this.props.potential.shipmentLoadingType.code : 'FCL'
            if(shipmentLoadingType === 'FCL'){
                containerTypes = this.state.containerTypes;
            }

            if(!containerTypes || containerTypes.length == 1){
                readOnly = true;
            }
        }
        return(
            <ReadOnlyChip options = {containerTypes} label="Container Types" labelField="name" hideSelectAll = {true}
                          value = {this.props.potential.containerTypes} required={true} readOnly={readOnly || this.props.readOnly} translate={true}
                          onchange = {(containerType) => {containerType ? this.handleChange("containerTypes", containerType) : null}}/>
        );
    }

    renderCompetitorCompany(){
        if(this.props.readOnly){
            return(
                <Span label="Competitor Company"
                      value = {(this.props.potential.competitor || {}).name}/>
            );
        }else{
            return(
                <CompanySearchAutoComplete label="Competitor Company"
                                           value={this.props.potential.competitor}
                                           onchange={(value) => this.handleChange("competitor", value)}
                                           onclear={() => this.handleChange("competitor", {})}/>
            );
        }
    }

    renderValidityStartDate(){
        if(this.props.readOnly){
            return(
                <Span label="Validity Start Date" value={this.props.potential.validityStartDate}/>
            );
        }
    }
    renderValidityEndDate(){
        if(this.props.readOnly){
            return(
                <Span label="Validity End Date" value={this.props.potential.validityEndDate}/>
            );
        }
    }

    render(){
        if(!this.props.potential){
            return null;
        }
        return(
            <Form ref = {c => this.form = c}>
                <Grid widthLarge={true} divider={true}>
                    <GridCell width="1-2">
                        <ReadOnlyDropDown options = {this.state.countries} label="From Country" valueField="iso"
                                          value = {this.props.potential.fromCountry} required={true} uppercase = {{locale: "en"}}
                                          readOnly = {this.props.readOnly}
                                          translate={true}
                                          onchange = {(value) => this.handleChange("fromCountry", value)} />
                    </GridCell>
                    <GridCell width="1-2">
                        <CountryPoint options = {this.state.from.countryPoints} label="From Port" multiple={false}
                                          value = {this.props.potential.fromPoint} required={true} uppercase = {{locale: "en"}}
                                          readOnly = {this.props.readOnly}
                                          onchange = {(value) => this.handleChange("fromPoint", value?[value]:[])}/>
                    </GridCell>
                    <GridCell width="1-2">
                        <ReadOnlyDropDown options = {this.state.countries} label="To Country" valueField="iso"
                                          value = {this.props.potential.toCountry} required={true} uppercase = {{locale: "en"}}
                                          readOnly = {this.props.readOnly}
                                          translate={true}
                                          onchange = {(value) => this.handleChange("toCountry", value)} />
                    </GridCell>
                    <GridCell width="1-2">
                        <CountryPoint options = {this.state.to.countryPoints} label="To Port" multiple={false}
                                          value = {this.props.potential.toPoint} required={true} uppercase = {{locale: "en"}}
                                          readOnly = {this.props.readOnly}
                                          onchange = {(value) => this.handleChange("toPoint", value?[value]:[])}/>
                    </GridCell>
                    <GridCell width="1-4">
                        <ReadOnlyDropDown options = {this.state.shipmentLoadingTypes} label="FCL/LCL" required={true}
                                          value = {this.props.potential.shipmentLoadingTypes ? this.props.potential.shipmentLoadingTypes[0] : null}
                                          readOnly = {this.props.readOnly}
                                          onchange = {(value) => this.handleChange("shipmentLoadingTypes", value)}/>
                    </GridCell>
                    <GridCell width="1-4">
                        {this.renderChargeableVolume()}
                    </GridCell>
                    <GridCell width="1-2">
                        {this.renderContainerType()}
                    </GridCell>
                    <GridCell width="1-2">
                        <ReadOnlyDropDown options={this.state.incoterms} label="Incoterm"  labelField = "name"
                                          valueField="code" value={this.props.potential.incoterm} required={true}
                                          readOnly = {this.props.readOnly}
                                          onchange = {(incoterm) => {incoterm ? this.handleChange("incoterm", incoterm.code) : null}}/>
                    </GridCell>
                    <GridCell width="1-2">
                        <ReadOnlyDropDown options = {this.state.incotermExplanations} label="Incoterm Explanation"
                                          value = {this.props.potential.incotermExplanation} required={true}
                                          readOnly = {this.props.readOnly}
                                          translate={true}
                                          onchange = {(incotermExplanation) => this.handleChange("incotermExplanation", incotermExplanation)}/>
                    </GridCell>
                    <GridCell width="1-2">
                        {this.renderCompetitorCompany()}
                    </GridCell>
                    <GridCell width="1-2"/>
                    <GridCell width="1-2">
                        <ReadOnlyDropDown options = {this.state.frequencyTypes} label="Frequency Type"
                                          value = {this.props.potential.frequencyType} required={true}
                                          readOnly = {this.props.readOnly}
                                          translate={true}
                                          onchange = {(frequencyType) => this.handleChange("frequencyType", frequencyType)}/>
                    </GridCell>
                    <GridCell width="1-2">
                        <NumberInput label="Frequency"
                                     value = {this.props.potential.frequency ? this.props.potential.frequency : " "}
                                     readOnly = {this.props.readOnly} required={true}
                                     translate={true}
                                     onchange = {(value) => this.handleChange("frequency", value)}/>
                    </GridCell>
                    <GridCell width="1-2">
                        {this.renderValidityStartDate()}
                    </GridCell>
                    <GridCell width="1-2">
                        {this.renderValidityEndDate()}
                    </GridCell>
                </Grid>
            </Form>

        );
    }
}

const ReadOnlyChip = withReadOnly(Chip);