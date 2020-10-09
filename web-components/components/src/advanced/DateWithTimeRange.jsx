import React from 'react';
import uuid from 'uuid';
import _ from 'lodash';

import {Date} from './Date';
import {TimeRange} from './TimeRange';
import {Grid, GridCell} from '../layout';

export class DateWithTimeRange extends React.Component{
    constructor(props){
        super(props);
        if(props.id){
            this.state = {id:props.id};
        }else {
            this.state = {id:uuid.v4()};
        }
        this.state.value = {};
        if(this.props.value){
            this.state.value = {date: this.props.value.date, time: this.props.value.time};
        }


    }
    componentDidMount(){

    }

    handleDateChange(value){
        let state = _.cloneDeep(this.state);
        state.value.date = value;
        this.handleOnChange(state);
        this.setState(state);
    }
    handleTimeChange(value){
        let state = _.cloneDeep(this.state);
        state.value.time = value;
        this.handleOnChange(state);
        this.setState(state);
    }
    handleOnChange(state){
        if(state.value.date || state.value.time){
            this.props.onchange && this.props.onchange(state.value);
        }
    }

    render(){
        let date = this.state.value ? this.state.value.date : "";
        let time = this.state.value ? this.state.value.time : {};

        return(
            <Grid collapse = {true}>
                <GridCell width = "1-2">
                    <Date onchange = {(value) => this.handleDateChange(value)} value = {date} hidden = {this.props.hidden}
                          label = {this.props.label} required = {this.props.required} format = {this.props.format}
                          placeholder = {this.props.placeholder}/>
                </GridCell>
                <GridCell width = "1-2">
                    <TimeRange hideIcon = {true} onchange = {(value) => this.handleTimeChange(value)} value = {time} hidden = {this.props.hidden}
                          from = {this.props.from} to = {this.props.to} step = {this.props.step} required = {this.props.required}/>
                </GridCell>
            </Grid>

        );
    }
}