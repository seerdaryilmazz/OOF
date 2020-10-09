import React from "react";
import * as axios from "axios";

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell} from "susam-components/layout";
import {Notify, ReadOnlyDropDown, Form, Span} from 'susam-components/basic';
import {LocationService, LookupService} from '../services';
import {NumberInput, Chip} from "susam-components/advanced";
import {CompanySearchAutoComplete} from 'susam-components/oneorder';

import {withReadOnly, PotentialUtils} from "../utils";

export class CustomsPotential extends TranslatingComponent{

    static defaultProps = {
        potential: PotentialUtils.getEmptyPotential("CCL")
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
    }

    initializeLookups(){
        axios.all([
            LookupService.getCustomsTypes(),
            LookupService.getFrequencyTypes(),
            LocationService.retrieveCustomsOffices()
        ]).then(axios.spread((customsTypes, frequencyTypes, customsOffices) => {
            this.setState({customsTypes: customsTypes.data, frequencyTypes: frequencyTypes.data, customsOffices: customsOffices.data});
        })).catch(error => {
            Notify.showError(error);
        })
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

    handleCustomsOfficeChange(currentCustomsOffices){
        let customsOffices;
        if(currentCustomsOffices){
            customsOffices = [];
            currentCustomsOffices.forEach(currentCustomsOffice => {
                let customsOffice;
                if(this.props.potential.customsOffices){
                    customsOffice = _.find(this.props.potential.customsOffices, {office: {id: currentCustomsOffice.id}});
                }
                customsOffices.push(customsOffice ? customsOffice : {office : currentCustomsOffice});
            });
        }
        this.handleChange("customsOffices", customsOffices);
    }

    render(){
        if(!this.props.potential){
            return null;
        }
        return(
            <Form ref = {c => this.form = c}>
                <Grid widthLarge={true} divider={true}>
                    <GridCell width="1-2">
                        <ReadOnlyDropDown options = {this.state.customsTypes} label="Import/Export"
                                  value = {this.props.potential.customsType} required={true} uppercase = {{locale: "en"}}
                                  readOnly = {this.props.readOnly}
                                  translate={true}
                                  onchange = {(value) => this.handleChange("customsType", value)} />
                    </GridCell>
                    <GridCell width="1-2">
                        <ReadOnlyChip options = {this.state.customsOffices} label="Customs Office" hideSelectAll = {true}
                                      value = {this.props.potential.customsOffices ? this.props.potential.customsOffices.map(item => item.office) : null} required={true}
                                      readOnly = {this.props.readOnly}
                                      onchange = {(value) => {value ? this.handleCustomsOfficeChange(value) : null}}/>
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
