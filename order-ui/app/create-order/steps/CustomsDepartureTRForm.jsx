import React from 'react';
import uuid from 'uuid';
import * as axios from 'axios';
import _ from 'lodash';

import {Grid, GridCell} from 'susam-components/layout'
import {Span, TextInput, DropDown, Button, Notify} from 'susam-components/basic'
import {CompanySearchAutoComplete} from 'susam-components/oneorder';
import {handleTabPress, DefaultInactiveElement} from './OrderSteps';

import {LocationService} from '../../services';

export class CustomsDepartureTRForm extends React.Component {

    constructor(props){
        super(props);
        this.state = {data: {}};
        this.elementIdsForTabSequence = ["customsOffice","customsAgent"];
        this.focusedElementId = null;
    }

    componentDidMount(){
        if(this.props.active){
            document.addEventListener('keyup', this.handleKeyPress);
            this.focusOn("customsOffice");
        }
        if(this.props.value){
            this.setState({data: _.cloneDeep(this.props.value)});
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

    updateState(key, value){
        let data = _.cloneDeep(this.state.data);
        data[key] = value;
        this.setState({data: data}, () => {
            if(this.state.data.customsOffice && this.state.data.customsAgent){
                let data = _.cloneDeep(this.state.data);
                data._key = uuid.v4();
                this.props.onChange && this.props.onChange(data);
                this.props.onNext && this.props.onNext();
            }
        });
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
                    <DropDown id = "customsOffice" label = "Customs Office" required = {true}
                              options = {this.props.customsOffices} readOnly = {this.state.data.readOnly}
                              value = {this.state.data.customsOffice}
                              onchange = {value => this.updateState("customsOffice", value)} />
                </GridCell>
                <GridCell width = "1-1">
                    <CompanySearchAutoComplete id = "customsAgent" label = "Customs Agent" required = {true}
                                               value = {this.state.data.customsAgent}
                                               onchange = {(value) => this.updateState("customsAgent", value)} />
                </GridCell>
            </Grid>
        );

    }


}