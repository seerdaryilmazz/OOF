import React from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid';

import {DropDown} from '../basic'

export class Time extends React.Component{
    constructor(props){
        super(props);
        if(props.id){
            this.state = {id:props.id};
        }else {
            this.state = {id:uuid.v4()};
        }

    }
    componentDidMount(){

    }
    handleChange(timezone, value){
        let result = "";
        if(value){
            result = value.id;
            if(!this.props.hideTimezone){
                result = result + " " + timezone;
            }
        }
        this.props.onchange && this.props.onchange(result);
    }
    addMinutes(time, step){
        let newMinutes = time.minutes + step;
        let newHours = time.hours;
        let newDay = time.day;
        if(newMinutes >= 60){
            newMinutes = newMinutes % 60;
            newHours++;
        }else if(newMinutes < 0){
            newMinutes = 60 + newMinutes;
            newHours--;
        }
        if(newHours >= 24){
            newHours = newHours % 24;
            newDay++;
        }else if(newHours < 0){
            newHours = 24 + newHours;
            newDay--;
        }
        return {day: newDay, hours: newHours, minutes: newMinutes};
    }
    isGreaterThanOrEqual(time1, time2){
        if(time1.day > time2.day){
            return true;
        }else if(time1.day < time2.day){
            return false;
        }

        if(time1.hours > time2.hours){
            return true;
        }else if(time1.hours < time2.hours){
            return false;
        }

        if(time1.minutes >= time2.minutes){
            return true;
        }else{
            return false;
        }

    }
    printTime(time){
        let hours = time.hours < 10 ? ("0" + time.hours) : ("" + time.hours);
        let minutes = time.minutes < 10 ? ("0" + time.minutes) : ("" + time.minutes);
        return hours + ":" + minutes;

    }
    generateOptions(){
        let startTime = this.props.from ? this.props.from : "00:00";
        let endTime = this.props.to ? this.props.to : "00:00";

        let [startHours, startMinutes] = startTime.split(":").map((item) => Number.parseInt(item));
        let start = {day: 0, hours: startHours, minutes: startMinutes};

        let [endHours, endMinutes] = endTime.split(":").map((item) => Number.parseInt(item));
        let end = {day: 0, hours: endHours, minutes: endMinutes};
        if(this.isGreaterThanOrEqual(start, end)){
            end.day = 1;
        }

        if(startTime == endTime){
            end = this.addMinutes(end, -1);
        }


        let step = this.props.step ? Number.parseInt(this.props.step) : 30;
        let options = [];
        let time = start;
        while(this.isGreaterThanOrEqual(end, time)){
            let printed = this.printTime(time);
            options.push({id: printed, name: printed});
            time = this.addMinutes(time, step);
        }
        return options;
    }

    render(){
        var style = {};
        if(this.props.hidden){
            style.display= 'none';
        }
        let hideIcon = false;
        if(this.props.hideIcon){
            hideIcon = true;
        }
        var wrapperClassName = "";
        //var wrapperClassName = "md-input-wrapper";
        if(this.props.value || this.props.placeholder){
            wrapperClassName += " md-input-filled";
        }

        let timezone = "UTC";
        if(this.props.hideTimezone){
            timezone = "";
        }else{
            if(this.props.timezone){
                timezone = this.props.timezone;
            }else if(this.context.user){
                timezone = this.context.user.timeZoneId;
            }
        }

        let value = this.props.value;
        if(value){
            value = value.split(" ")[0];
        }

        let timezoneInfo = null;
        if(!this.props.hideTimezone){
            timezoneInfo = <span className="uk-form-help-block">{timezone}</span>;
        }


        let options = this.generateOptions();

        let dropDown = <DropDown id = {this.state.id} label={this.props.label}
                                 options = {options} onchange = {(value) => this.handleChange(timezone, value)} required = {this.props.required}
                                 value = {value} placeholder = 'hh:mm' />;


        if(!hideIcon){
            dropDown = <div className="uk-input-group" style={style}>
                            <span className="uk-input-group-addon">
                                <i className="uk-input-group-icon uk-icon-clock-o"/>
                            </span>{dropDown}
            </div>;
        }
        let dropDownInfo = null;
        if(!this.props.hideTime){
            dropDownInfo = <div className="uk-width-medium-1-1">
                <div className="parsley-row" style={style}>
                    <div className={wrapperClassName}>
                        {dropDown}
                    </div>
                    {timezoneInfo}
                </div>
            </div>;
        }

        return (<div className="uk-grid uk-grid-collapse">
                {dropDownInfo}
            </div>
        );

    }
}
Time.contextTypes = {
    user: PropTypes.object
};