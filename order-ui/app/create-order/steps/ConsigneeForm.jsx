import React from 'react';
import uuid from 'uuid';
import * as axios from 'axios';
import _ from 'lodash';

import {Grid, GridCell} from 'susam-components/layout'
import {Span, TextInput, DropDown, Button, Notify} from 'susam-components/basic'
import {CompanySearchAutoComplete} from 'susam-components/oneorder';
import {handleTabPress, DefaultInactiveElement} from './OrderSteps';

import {Kartoteks} from '../../services';

export class ConsigneeForm extends React.Component {

    constructor(props){
        super(props);
        this.state = {};
        this.elementIdsForTabSequence = ["consigneeCompany","unloadingCompany","unloadingLocation"];
        this.focusedElementId = null;
    }

    componentDidMount(){
        if(this.props.active){
            document.addEventListener('keyup', this.handleKeyPress);
            this.focusOn("consigneeCompany");
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

    updateConsigneeCompany(value){
        this.updateState("consigneeCompany", value);
        this.focusOn("unloadingCompany");
    }
    updateUnloadingLocation(value){
        let state = _.cloneDeep(this.state);
        state.unloadingLocation = value;
        state._key = uuid.v4();
        this.setState(state, () => {
            this.props.onChange && this.props.onChange(this.state);
            this.props.onNext && this.props.onNext();
        });
    }

    handleUnloadingCompanySelect(company){
        Kartoteks.getCompanyLocations(company.id).then(response => {
            this.setState({unloadingCompany: company, locations: response.data}, () =>
                this.focusOn("unloadingLocation"));
        }).catch(error => {
            Notify.showError(error);
        })
    }
    handleSeUnlLoadingAsConsigneeCompany(){
        if(this.state.consigneeCompany){
            this.handleUnloadingCompanySelect(this.state.consigneeCompany);
        }
    }
    handleSetConsigneeAsCustomerCompany(){
        if(this.props.customer){
            this.updateState("consigneeCompany", this.props.customer);
            this.focusOn("unloadingCompany");
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
                    <CompanySearchAutoComplete id = "consigneeCompany" label = "Consignee Company" value = {this.state.consigneeCompany}
                                               required = {true} ref = {c => this.consigneeCompany = c}
                                               onchange = {(value) => this.updateConsigneeCompany(value)} />
                </GridCell>
                <GridCell width = "1-3">
                    <div className = "uk-margin-top">
                        <Button label="use customer" flat = {true} size = "small" style = "success"
                                onclick = {() => this.handleSetConsigneeAsCustomerCompany()} />
                    </div>
                </GridCell>
                <GridCell width = "2-3">
                    <CompanySearchAutoComplete id = "unloadingCompany" label = "Unloading Company" value = {this.state.unloadingCompany}
                                               required = {true} ref = {c => this.unloadingCompany = c}
                                               onchange = {(value) => this.handleUnloadingCompanySelect(value)} />
                </GridCell>
                <GridCell width = "1-3">
                    <div className = "uk-margin-top">
                        <Button label="use consignee company" flat = {true} size = "small" style = "success"
                                onclick = {() => this.handleSeUnlLoadingAsConsigneeCompany()} />
                    </div>
                </GridCell>
                <GridCell width = "2-3">
                    <DropDown id = "unloadingLocation" label = "Unloading Location" options = {this.state.locations}
                              emptyText = "No locations..." uninitializedText = "Select unloading company..."
                              ref = {c => this.unloadingLocation = c}
                              value = {this.state.unloadingLocation} required = {true}
                              onchange = {(value) => this.updateUnloadingLocation(value)} />
                </GridCell>

            </Grid>
        );

    }


}