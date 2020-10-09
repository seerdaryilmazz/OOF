import React from 'react';
import uuid from 'uuid';
import _ from 'lodash';

import {DayAndTime} from './DayAndTime';
import {Grid, GridCell} from '../layout';


export class DayAndTimeRange extends React.Component{
    constructor(props){
        super(props);
        this.moment = require("moment");
    }

    handleStartChange(value){
        let existingValue = _.cloneDeep(this.props.value);
        existingValue.start = value;
        existingValue.duration = this.convertToMinutes(existingValue);
        this.props.onchange && this.props.onchange(existingValue);
    }
    handleEndChange(value){
        let existingValue = _.cloneDeep(this.props.value);
        existingValue.end = value;
        existingValue.duration = this.convertToMinutes(existingValue);
        this.props.onchange && this.props.onchange(existingValue);
    }

    convertToMinutes(existingValue){
        let result = 0;
        if(existingValue
            && existingValue.start && existingValue.start.day && existingValue.start.time
            && existingValue.end && existingValue.end.day && existingValue.end.time
        ){
            let days = existingValue.end.day.dayIndex  - existingValue.start.day.dayIndex;
            let startTime, endTime = "";
            if(existingValue.start.time){
                startTime = this.moment(existingValue.start.time.split(" ")[0], 'HH:mm');
            }
            if(existingValue.end.time){
                endTime = this.moment(existingValue.end.time.split(" ")[0], 'HH:mm');
            }
            if(startTime && endTime){
                let duration = this.moment.duration(endTime.diff(startTime));

                let weekDiff = existingValue.end.weekOffset - existingValue.start.weekOffset;

                days = days + (weekDiff * 7);

                result = (days * 24 * 60) + duration.asMinutes();

            }
        }
        return result;
    }

    render(){

        let value = this.props.value;

        let fromTime = null;
        let startDayId = _.get(this.props.value, "start.day.id");
        let startWeekOffset = _.get(this.props.value, "start.weekOffset");
        let endDayId = _.get(this.props.value, "end.day.id");
        let endWeekOffset = _.get(this.props.value, "end.weekOffset");
        if(startDayId === endDayId && startWeekOffset === endWeekOffset){
            fromTime = _.get(this.props.value, "start.time");
        }
        return(
            <Grid>
                <GridCell width="1-2">
                    <DayAndTime days = {this.props.days}
                                label = {this.props.startLabel}
                                hideTimezone = {this.props.hideTimezone}
                                onchange = {(value) => this.handleStartChange(value)}
                                value = {value ? value.start : null}
                                required = {this.props.required}/>
                </GridCell>
                <GridCell width="1-2">
                    <DayAndTime days = {this.props.days}
                                label = {this.props.endLabel}
                                hideTimezone = {this.props.hideTimezone} showWeeks={2}
                                onchange = {(value) => this.handleEndChange(value)}
                                value = {value ? value.end : null}
                                fromDay = {value ? (value.start ? value.start.day : null) : null}
                                fromTime = {fromTime}
                                required = {this.props.required}/>
                </GridCell>
            </Grid>
        );
    }
}