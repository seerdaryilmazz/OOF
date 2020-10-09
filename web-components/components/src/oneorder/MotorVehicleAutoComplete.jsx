import React from 'react';
import {AutoComplete} from '../advanced';
import {Notify} from '../basic';
import uuid from 'uuid';
import * as axios from 'axios';

export class MotorVehicleAutoComplete extends React.Component {
    constructor(props){
        super(props);
        var id = this.props.id ? this.props.id : uuid.v4();
        this.state = {id: id};
    }

    componentDidMount(){

    }

    handleOnChange(item){
        this.props.onchange && this.props.onchange(item);
    }

    handleOnClear() {
        this.props.onclear && this.props.onclear();
    }

    autocompleteCallback = (val) => {
        return axios.get('/vehicle-service/motor-vehicle/search?plateNumber=' + encodeURIComponent(val));
    };
    render(){
        return(
            <AutoComplete id={this.state.id} label={this.props.label} valueField="id" labelField="plateNumber"
                          readOnly={this.props.readOnly}
                          onchange = {(item) => this.handleOnChange(item)}
                          onclear = {() => this.handleOnClear()}
                          promise={this.autocompleteCallback} value = {this.props.value}
                          flipDropdown = {this.props.flipDropdown}
                          hideLabel = {this.props.hideLabel}
                          required={this.props.required} placeholder="Search for plate number..."
                          ukIcon={this.props.ukIcon}
                          iconColorClass={this.props.iconColorClass}
                          minLength = {2}
            />
        );
    }
}