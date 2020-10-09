import React from 'react';
import uuid from 'uuid';
import _ from 'lodash';

import {TextInput, DropDown} from '../../basic';
import {DateTime, DateTimeRange} from '../../advanced';
import {Modal, Grid, GridCell} from '../../layout';

export class DateTimeFilter extends React.Component {

    constructor(props) {
        super(props);
        this.state = {value: this.props.value, op: "="};
        this.moment = require('moment');
        require('moment-timezone');
    };

    componentDidMount(){

    }
    componentDidUpdate(){

    }
    componentWillReceiveProps(){

    }
    handleValueChange(value){
        let state = _.cloneDeep(this.state);
        state.value = value;
        this.setState(state);
        this.props.onchange && this.props.onchange(this.concatenateValue(state));
    }
    handleOpChange(value){
        let state = _.cloneDeep(this.state);
        state.op = value.id;
        this.setState(state);
        this.props.onchange && this.props.onchange(this.concatenateValue(state));
    }
    concatenateValue(state){
        if(!state.value){
            return "";
        }else{
            let value = state.value.trim();
            console.log(value);
            let tz = value.substring(value.lastIndexOf(" ")+1);
            let dt = value.substring(0, value.lastIndexOf(" "));
            let parsed =  this.moment.tz(dt, "DD/MM/YYYY HH:mm", tz).tz("UTC").format("X");
            return state.op + parsed;
        }
    }

    render(){
        return(
            <Grid collapse = {true}>
                <GridCell width="1-3" noMargin = {true}>
                    <DropDown options = {[{id:"=", name:"eq"},{id:"<", name:"lt"},{id:">", name:"gt"}, {id:"<=", name:"lte"}, {id:">=", name:"gte"}]}
                              placeholder = ".."
                              onchange = {(value) => this.handleOpChange(value)}
                              value = {this.state.op} />
                </GridCell>
                <GridCell width="2-3" noMargin = {true}>
                    <DateTime onchange = {(value) => this.handleValueChange(value)} value = {this.state.value} hideIcon = {true}/>
                </GridCell>
            </Grid>

        );
    }
}