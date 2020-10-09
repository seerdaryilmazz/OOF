import React from 'react';
import uuid from 'uuid';
import * as axios from 'axios';
import _ from 'lodash';

import {Grid, GridCell} from 'susam-components/layout'
import {Span, TextInput, DropDown, Button, Notify} from 'susam-components/basic'
import {CompanySearchAutoComplete} from 'susam-components/oneorder';
import {handleTabPress, DefaultInactiveElement} from './OrderSteps';

import {LocationService} from '../../services';

export class CustomsAgentAndLocationForm extends React.Component {

    constructor(props){
        super(props);
        this.state = {data: {}};
        this.elementIdsForTabSequence = ["customsAgent","customsAgentLocation"];
        this.focusedElementId = null;
    }

    componentDidMount(){
        if(this.props.active){
            this.loadCustomsCompanies();
            document.addEventListener('keyup', this.handleKeyPress);
            this.focusOn("customsAgent");
        }
        if(this.props.value){
            this.setState({data: _.cloneDeep(this.props.value)}, () => this.loadAgentLocations());
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
        let element = document.getElementById(elementId);
        if(element){
            element.focus();
        }
        this.focusedElementId = elementId;
    }

    updateCustomsAgentLocation(value){
        let data = _.cloneDeep(this.state.data);
        data.customsAgentLocation = value;
        data._key = uuid.v4();
        this.setState({data: data}, () => {
            this.props.onChange && this.props.onChange(this.state.data);
            this.props.onNext && this.props.onNext();
        });
    }

    updateCustomsAgent(value){
        let data = _.cloneDeep(this.state.data);
        data.customsAgent = value;
        this.setState({data: data}, () => this.loadAgentLocations());

    }
    loadCustomsCompanies(){
        LocationService.listCompaniesWithEuropeanCustomsLocations().then(response => {
            this.setState({customsAgents: response.data});
        }).catch(error => Notify.showError(error));
    }
    loadAgentLocations(){
        if(!this.state.data.customsAgent){
            return;
        }
        LocationService.findEuropeanCustomsLocations(this.state.data.customsAgent.id, this.state.data.customsAgent.type).then(response => {
            if(!response.data || response.data.length === 0){
                Notify.showError("There is no customs location of chosen company");
                return;
            }
            this.setState({locations: response.data}, () => this.focusOn("customsAgentLocation"));
        }).catch(error => Notify.showError(error));
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
                <GridCell width = "1-1">
                    <DropDown id = "customsAgent" label = "Customs Agent" required = {true}
                              options = {this.state.customsAgents} value = {this.state.data.customsAgent}
                              readOnly = {this.state.data.readOnly} onchange = {(value) => this.updateCustomsAgent(value)} />
                </GridCell>
                <GridCell width = "1-1">
                    <DropDown id = "customsAgentLocation" label = "Customs Agent Location" required = {true}
                              options = {this.state.locations} readOnly = {this.state.data.readOnly}
                              emptyText = "No locations..." uninitializedText = "Select customs agent..."
                              value = {this.state.data.customsAgentLocation}
                              onchange = {value => this.updateCustomsAgentLocation(value)} />
                </GridCell>
            </Grid>
        );

    }


}