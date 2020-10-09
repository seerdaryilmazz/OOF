import React from 'react';
import uuid from 'uuid';
import _ from 'lodash';

import {TextInput, DropDown} from '../../basic';
import {Date, DateRange} from '../../advanced';
import {Modal, Grid, GridCell} from '../../layout';

export class DateFilter extends React.Component {

    constructor(props) {
        super(props);
        this.state = {value: this.props.value, op: "="};
        this.moment = require('moment');
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
            let parsed = this.moment(state.value, "DD/MM/YYYY", true).format("X");
            return state.op + parsed;
        }
    }

    render(){
        return(
        <Grid collapse = {true}>
            <GridCell width="1-2" noMargin = {true}>
                <DropDown options = {[{id:"=", name:"eq"},{id:"<", name:"lt"},{id:">", name:"gt"}, {id:"<=", name:"lte"}, {id:">=", name:"gte"}]}
                          placeholder = ".."
                          onchange = {(value) => this.handleOpChange(value)}
                          value = {this.state.op} />
            </GridCell>
            <GridCell width="1-2" noMargin = {true}>
                <Date onchange = {(value) => this.handleValueChange(value)} value = {this.state.value} hideIcon = {true}/>
            </GridCell>
        </Grid>

        );
    }
}