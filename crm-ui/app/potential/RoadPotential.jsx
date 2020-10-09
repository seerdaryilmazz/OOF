import * as axios from "axios";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Chip, NumberInput } from "susam-components/advanced";
import { Form, Notify, ReadOnlyDropDown, Span } from 'susam-components/basic';
import { Grid, GridCell } from "susam-components/layout";
import { CompanySearchAutoComplete } from 'susam-components/oneorder';
import { LookupService } from '../services';
import { PotentialUtils, withReadOnly } from "../utils";
import { CountryPoint } from "./CountryPoint";



export class RoadPotential extends TranslatingComponent{

    static defaultProps = {
        potential: PotentialUtils.getEmptyPotential("ROAD")
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
            LookupService.getShipmentLoadingType('ROAD'),
            LookupService.getLoadWeightTypes(),
            LookupService.getFrequencyTypes()
        ]).then(axios.spread((countries, shipmentLoadingTypes, loadWeightTypes, frequencyTypes) => {
            shipmentLoadingTypes.data.forEach(shipmentLoadingType => shipmentLoadingType.name = shipmentLoadingType.name + ` / PW: ${shipmentLoadingType.payWeight}`);
            this.setState({countries: countries.data, shipmentLoadingTypes: shipmentLoadingTypes.data, loadWeightTypes: loadWeightTypes.data, frequencyTypes: frequencyTypes.data});
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
            LookupService.getCountyPoints(countryIso, 'POSTAL').then(response => {
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
        if(key === 'fromCountry'){
            potential.fromPoint = null;
        }
        else if(key === 'toCountry'){
            potential.toPoint = null;
        }
        this.props.onChange(potential);
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
                        <CountryPoint options = {this.state.from.countryPoints} label="From Postal" multiple={true}
                                  value = {this.props.potential.fromPoint} required={true} uppercase = {{locale: "en"}}
                                  readOnly = {this.props.readOnly}
                                  onchange = {(value) => {value ? this.handleChange("fromPoint", value) : null}}/>
                    </GridCell>
                    <GridCell width="1-2">
                        <ReadOnlyDropDown options = {this.state.countries} label="To Country" valueField="iso"
                                  value = {this.props.potential.toCountry} required={true} uppercase = {{locale: "en"}}
                                  readOnly = {this.props.readOnly}
                                  translate={true}
                                  onchange = {(value) => this.handleChange("toCountry", value)} />
                    </GridCell>
                    <GridCell width="1-2">
                        <CountryPoint options = {this.state.to.countryPoints} label="To Postal" multiple={true}
                                  value = {this.props.potential.toPoint} required={true} uppercase = {{locale: "en"}}
                                  readOnly = {this.props.readOnly}
                                  onchange = {(value) => {value ? this.handleChange("toPoint", value) : null}}/>
                    </GridCell>
                    <GridCell width="1-2">
                        <ReadOnlyDropDown options = {this.state.loadWeightTypes} label="Load Type"
                                  value = {this.props.potential.loadWeightType}
                                  readOnly = {this.props.readOnly}
                                  translate={true}
                                  onchange = {(loadWeightType) => this.handleChange("loadWeightType", loadWeightType)}/>
                    </GridCell>
                    <GridCell width="1-2">
                        <ReadOnlyChip options = {this.state.shipmentLoadingTypes} label="Shipment Loading Type" labelField="name" hideSelectAll = {true}
                              value = {this.props.potential.shipmentLoadingTypes} required={true}
                              readOnly = {this.props.readOnly}
                              translate={true}
                              onchange = {(value) => {value ? this.handleChange("shipmentLoadingTypes", value) : null}}/>
                    </GridCell>
                    <GridCell width="1-2">
                        {this.renderCompetitorCompany()}
                    </GridCell>
                    <GridCell width="1-2"/>
                    <GridCell width="1-2">
                        <ReadOnlyDropDown options = {this.state.frequencyTypes} label="Frequency Type"
                                  readOnly = {this.props.readOnly}
                                  translate={true}
                                  value = {this.props.potential.frequencyType} required={true}
                                  onchange = {(frequencyType) => this.handleChange("frequencyType", frequencyType)}/>
                    </GridCell>
                    <GridCell width="1-2">
                        <NumberInput label="Frequency"
                                     readOnly = {this.props.readOnly} required={true}
                                     value = {this.props.potential.frequency ? this.props.potential.frequency : " "}
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
