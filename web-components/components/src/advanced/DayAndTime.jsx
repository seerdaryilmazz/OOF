import React from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid';
import _ from 'lodash';

import {DropDown} from '../basic';
import {Time} from './Time';
import {Grid, GridCell} from '../layout';

export class DayAndTime extends React.Component{
    constructor(props){
        super(props);
        if(props.id){
            this.state = {id:props.id};
        }else {
            this.state = {id:uuid.v4()};
        }
    }
    componentDidMount(){
        this.buildDayOptions(this.props);
    }

    componentWillReceiveProps(nextProps){
        this.buildDayOptions(nextProps);
    }

    buildDayOptions(props){
        let days = [];
        let startIndex = null;
        let endIndex = null;
        if(props.fromDay){
            startIndex = _.findIndex(props.days, {id: props.fromDay.id});
        }
        if(props.toDay){
            endIndex = _.findIndex(props.days, {id: props.toDay.id});
        }
        if(props.days){
            props.days.forEach((day, index) => {
                if((!_.isNumber(startIndex) || index >= startIndex) && (!_.isNumber(endIndex) || index <= endIndex)){
                    days.push({id: day.id + "#w0", name: day.name, week: "Same Week", dayIndex: index, weekOffset: 0});
                }
            });
            if(props.showWeeks){
                let weeks = parseInt(props.showWeeks);

                if(weeks > 0) {
                    for (let i = 1; i <= weeks; i++) {
                        let weekLabel = i == 1 ? 'Next Week' : (i + ' Weeks After');
                        props.days.forEach((day, index) => {
                            days.push({
                                id: day.id + "#w" + i,
                                name: day.name,
                                week: weekLabel,
                                dayIndex: index,
                                weekOffset: i
                            });
                        });
                    }
                } else if(weeks < 0) {
                    for (let i = -1; i >= weeks; i--) {
                        let weekLabel = i == -1 ? 'Previous Week' : ((i*-1) + ' Weeks Before');
                        props.days.forEach((day, index) => {
                            days.push({
                                id: day.id + "#w" + i,
                                name: day.name,
                                week: weekLabel,
                                dayIndex: index,
                                weekOffset: i
                            });
                        });
                    }
                }
            }
        }
        this.setState({days: days});
    }

    handleDayChange(value){
        let existingValue = _.cloneDeep(this.props.value);
        if(!existingValue) {
            existingValue = {};
        }
        existingValue.day = _.cloneDeep(value);
        if(existingValue.day) {
            existingValue.day.id = existingValue.day.id.split("#w")[0];
            existingValue.dayIndex = existingValue.day.dayIndex;
            existingValue.weekOffset = existingValue.day.weekOffset;
            existingValue.weekDescription = existingValue.day.week;

        } else {
            delete existingValue.dayIndex;
            delete existingValue.weekOffset;
            delete existingValue.weekDescription;
        }

        this.props.onchange && this.props.onchange(existingValue);
    }
    handleTimeChange(value){
        let existingValue = _.cloneDeep(this.props.value);
        if(!existingValue) {
            existingValue = {};
        }
        existingValue.time = value;
        this.props.onchange && this.props.onchange(existingValue);
    }


    render(){
        var requiredForLabel = "";
        if(this.props.required && this.props.label){
            requiredForLabel = <span className="req">*</span>;
        }

        let value = _.cloneDeep(this.props.value);

        if(value && value.day) {
            value.day.id = value.day.id + "#w" + (value.weekOffset ? value.weekOffset : "0");
        }

        return (
            <div className="md-input-wrapper md-input-filled" >
                <label>{this.props.label}{requiredForLabel}</label>
                <Grid collapse = {true}>
                    <GridCell width="1-2">
                        <DropDown options = {this.state.days}
                                  value = {value ? value.day : null}
                                  onchange = {(value) => this.handleDayChange(value)}
                                  required = {this.props.required}
                                  placeholder="Select day of week"
                                  groupBy = {this.props.showWeeks ? 'week' : ''}/>

                    </GridCell>
                    <GridCell width="1-2">
                        <Time value = {value ? value.time : null} hideIcon = {true}
                              onchange = {(value) => this.handleTimeChange(value)}
                              timezone = {value? value.timezone : null}
                              required = {this.props.required}
                              hideTimezone = {this.props.hideTimezone}
                              from={this.props.fromTime}
                              to={this.props.toTime}/>
                    </GridCell>
                </Grid>
            </div>
        );

    }
}
DayAndTime.contextTypes = {
    user: PropTypes.object
};