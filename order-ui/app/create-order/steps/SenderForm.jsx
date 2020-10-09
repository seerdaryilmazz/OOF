import React from 'react';
import uuid from 'uuid';
import * as axios from 'axios';
import _ from 'lodash';

import {Grid, GridCell} from 'susam-components/layout'
import {Span, TextInput, DropDown, Button, Notify} from 'susam-components/basic'
import {CompanySearchAutoComplete} from 'susam-components/oneorder';
import {handleTabPress, DefaultInactiveElement} from './OrderSteps';

import {Kartoteks} from '../../services';

export class SenderForm extends React.Component {

    constructor(props){
        super(props);
        this.state = {};
        this.elementIdsForTabSequence = ["senderCompany","loadingCompany","loadingLocation"];
        this.focusedElementId = null;
    }

    componentDidMount(){
        if(this.props.active){
            document.addEventListener('keyup', this.handleKeyPress);
            this.focusOn("senderCompany");
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

    updateSenderCompany(value){
        this.updateState("senderCompany", value);
        this.focusOn("loadingCompany");
    }
    updateLoadingLocation(value){
        let state = _.cloneDeep(this.state);
        state.loadingLocation = value;
        state._key = uuid.v4();
        this.setState(state, () => {
            this.props.onChange && this.props.onChange(this.state);
            this.props.onNext && this.props.onNext();
        });
    }

    handleLoadingCompanySelect(company){
        Kartoteks.getCompanyLocations(company.id).then(response => {
            this.setState({loadingCompany: company, locations: response.data}, () =>
                this.focusOn("loadingLocation"));
        }).catch(error => {
            Notify.showError(error);
        })
    }
    handleSeUnlLoadingAsSenderCompany(){
        if(this.state.senderCompany){
            this.handleLoadingCompanySelect(this.state.senderCompany);
        }
    }
    handleSetSenderAsCustomerCompany(){
        if(this.props.customer){
            this.updateState("senderCompany", this.props.customer);
            this.focusOn("loadingCompany");
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
                    <CompanySearchAutoComplete id = "senderCompany" label = "Sender Company" value = {this.state.senderCompany}
                                               required = {true} ref = {c => this.senderCompany = c}
                                               onchange = {(value) => this.updateSenderCompany(value)} />
                </GridCell>
                <GridCell width = "1-3">
                    <div className = "uk-margin-top">
                        <Button label="use customer" flat = {true} size = "small" style = "success"
                                onclick = {() => this.handleSetSenderAsCustomerCompany()} />
                    </div>
                </GridCell>
                <GridCell width = "2-3">
                    <CompanySearchAutoComplete id = "loadingCompany" label = "Loading Company" value = {this.state.loadingCompany}
                                               required = {true} ref = {c => this.loadingCompany = c}
                                               onchange = {(value) => this.handleLoadingCompanySelect(value)} />
                </GridCell>
                <GridCell width = "1-3">
                    <div className = "uk-margin-top">
                        <Button label="use sender company" flat = {true} size = "small" style = "success"
                                onclick = {() => this.handleSeUnlLoadingAsSenderCompany()} />
                    </div>
                </GridCell>
                <GridCell width = "2-3">
                    <DropDown id = "loadingLocation" label = "Loading Location" options = {this.state.locations}
                              emptyText = "No locations..." uninitializedText = "Select oading company..."
                              ref = {c => this.loadingLocation = c}
                              value = {this.state.loadingLocation} required = {true}
                              onchange = {(value) => this.updateLoadingLocation(value)} />
                </GridCell>

            </Grid>
        );

    }


}