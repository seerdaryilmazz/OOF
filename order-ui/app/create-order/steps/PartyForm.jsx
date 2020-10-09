import React from 'react';
import uuid from 'uuid';
import * as axios from 'axios';
import _ from 'lodash';

import {Grid, GridCell} from 'susam-components/layout'
import {Span, TextInput, DropDown, Button, Notify} from 'susam-components/basic'
import {CompanySearchAutoComplete} from 'susam-components/oneorder';
import {handleTabPress, DefaultInactiveElement} from './OrderSteps';

import {Kartoteks} from '../../services';
import {convertLocationsWithPostalCodes} from "../../Helper";

export class PartyForm extends React.Component {

    constructor(props){
        super(props);
        this.state = {};
        this.elementIdsForTabSequence = ["company","handlingCompany","handlingLocation"];
        this.focusedElementId = null;
    }

    componentDidMount(){
        if(this.props.active){
            document.addEventListener('keyup', this.handleKeyPress);
            this.focusOn("company");
        }
    }
    componentWillReceiveProps(nextProps){
        if(nextProps.active){
            document.addEventListener('keyup', this.handleKeyPress);
        }
    }
    componentWillUnmount(){
        document.removeEventListener('keyup', this.handleKeyPress);
    }
    handleKeyPress = (e) => {

        handleTabPress(e, () => this.focusNext(), () => this.focusPrev());
    };
    focusNext(){
        if(!this.focusedElementId){
            this.focusOn(this.elementIdsForTabSequence[0]);
        }else{
            let nextIndex = this.elementIdsForTabSequence.findIndex(item => item === this.focusedElementId) + 1;
            if(nextIndex >= this.elementIdsForTabSequence.length){
                this.props.onNext();
            }else{
                this.focusOn(this.elementIdsForTabSequence[nextIndex]);
            }
        }
    }
    focusPrev(){
        if(!this.focusedElementId){
            this.focusOn(this.elementIdsForTabSequence[0]);
        }else{
            let prevIndex = this.elementIdsForTabSequence.findIndex(item => item === this.focusedElementId) - 1;
            if(prevIndex < 0){
                this.props.onPrev();
            }else{
                this.focusOn(this.elementIdsForTabSequence[prevIndex]);
            }
        }
    }
    focusOn(elementId){
        document.getElementById(elementId).focus();
        this.focusedElementId = elementId;
    }

    updateState(key, value){
        let state = _.cloneDeep(this.state);
        state[key] = value;
        this.setState(state);
    }

    updateCompany(value){
        this.updateState("company", value);
        this.focusOn("handlingCompany");
    }
    updateHandlingLocation(value){
        let state = _.cloneDeep(this.state);
        state.handlingLocation = value;
        state._key = uuid.v4();
        this.setState(state, () => {
            this.props.onChange && this.props.onChange(this.state);
            this.props.onNext && this.props.onNext();
        });
    }

    handleHandlingCompanySelect(company){
        Kartoteks.getCompanyLocations(company.id).then(response => {
            this.setState({handlingCompany: company, locations: response.data.map(item => convertLocationsWithPostalCodes(item))}, () =>
                this.focusOn("handlingLocation"));
        }).catch(error => {
            Notify.showError(error);
        })
    }
    handleSeHandlingCompanyAsCompany(){
        if(this.state.company){
            this.handleHandlingCompanySelect(this.state.company);
        }
    }
    handleSetCompanyAsCustomer(){
        if(this.props.customer){
            this.updateState("company", this.props.customer);
            this.focusOn("handlingCompany");
        }
    }
    render(){
        return this.props.active ? this.renderActive() : this.renderInactive();
    }

    renderInactive(){
        if(!this.props.value){
            return <DefaultInactiveElement value="No selection" />;
        }
        return null;
    }
    renderActive(){
        return(
            <Grid>
                <GridCell width = "2-3">
                    <CompanySearchAutoComplete id = "company" label = "Company" value = {this.state.company}
                                               required = {true} ref = {c => this.company = c}
                                               onchange = {(value) => this.updateCompany(value)} />
                </GridCell>
                <GridCell width = "1-3">
                    <div className = "uk-margin-top">
                        <Button label="use customer" flat = {true} size = "small" style = "success"
                                onclick = {() => this.handleSetCompanyAsCustomer()} />
                    </div>
                </GridCell>
                <GridCell width = "2-3">
                    <CompanySearchAutoComplete id = "handlingCompany" label = "Handling Company" value = {this.state.handlingCompany}
                                               required = {true} ref = {c => this.handlingCompany = c}
                                               onchange = {(value) => this.handleHandlingCompanySelect(value)} />
                </GridCell>
                <GridCell width = "1-3">
                    <div className = "uk-margin-top">
                        <Button label="use company" flat = {true} size = "small" style = "success"
                                onclick = {() => this.handleSeHandlingCompanyAsCompany()} />
                    </div>
                </GridCell>
                <GridCell width = "2-3">
                    <DropDown id = "handlingLocation" label = "Handling Location" options = {this.state.locations}
                              emptyText = "No locations..." uninitializedText = "Select handling company..."
                              ref = {c => this.handlingLocation = c}
                              value = {this.state.handlingLocation} required = {true}
                              onchange = {(value) => this.updateHandlingLocation(value)} />
                </GridCell>

            </Grid>
        );

    }


}