import React from 'react';
import {Time} from './Time';
import {Grid, GridCell} from '../layout/Grid';

export class TimeRange extends React.Component{
    constructor(props){
        super(props);
        this.state = {start: {from: this.props.from, to: this.props.to}, end: {from: this.props.from, to: this.props.to}};
        if(this.props.value){
            this.setStartTime(this.state, this.props.value.startTime);
            this.setEndTime(this.state, this.props.value.endTime);
        }
    }

    componentDidMount(){

    }
    handleStartTimeChange(value){
        let state = _.cloneDeep(this.state);
        this.setStartTime(state, value);
        this.setState(state);
        this.handleOnChange();
    }
    setStartTime(state, value){
        state.end.from = value;
        state.start.value = value;
    }
    setEndTime(state, value){
        state.start.to = value;
        state.end.value = value;
    }

    handleEndTimeChange(value){
        let state = _.cloneDeep(this.state);
        this.setEndTime(state, value);
        this.setState(state);
        this.handleOnChange();
    }
    handleOnChange(){
        let result = {};
        if(this.state.start.value || this.state.end.value){
            result.startTime = this.state.start.value;
            result.endTime = this.state.end.value;
            this.props.onchange && this.props.onchange(result);
        }
    }

    render(){
        var style = {};
        if(this.props.hidden){
            style.display= 'none';
        }
        return(
            <Grid collapse = {true}>
                <GridCell width="3-5">
                    <Time required = {this.props.required} hideIcon = {this.props.hideIcon} step = {this.props.step} from={this.state.start.from} to={this.state.start.to}
                          label = {this.props.startTimeLabel} onchange = {(value) => this.handleStartTimeChange(value)} value = {this.state.start.value}/>
                </GridCell>
                <GridCell width="2-5">
                    <Time required = {this.props.required} hideIcon = {true} step = {this.props.step} from={this.state.end.from} to={this.state.end.to}
                          label = {this.props.endTimeLabel} onchange = {(value) => this.handleEndTimeChange(value)} value = {this.state.end.value}/>
                </GridCell>
            </Grid>
        )
    }
}