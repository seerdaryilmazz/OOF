import React from "react";
import uuid from "uuid";
import PropTypes from 'prop-types';
import _ from 'lodash';

import {Date} from "./Date";
import {TextInput} from '../basic';
import {Time} from "./Time";


export class DateTime extends React.Component {
    constructor(props) {
        super(props);
        if (props.id) {
            this.state = {id: props.id};
        } else {
            this.state = {id: uuid.v4()};
        }
    }

    getParsedDateTime(value) {
        if (value) {
            let dateMatch = value.match(/(\d{2}\/\d{2}\/\d{4})/);
            let timeMatch = value.match(/(\d{2}:\d{2})/);
            let timeZoneMatch = value.match(/\d{2}:\d{2} (.+)/);
            let result = [
                dateMatch == null ? "" : dateMatch[0],
                timeMatch == null ? "" : timeMatch[0],
                timeZoneMatch == null ? "" : timeZoneMatch[1]
            ];

            return result;
        } else {
            return ["", "", ""];
        }
    }

    getParsedTime(value) {
        if (value) {
            let timeMatch = value.match(/(\d{2}:\d{2})/);
            let timeZoneMatch = value.match(/\d{2}:\d{2} (.+)/);
            let result = [
                timeMatch == null ? "" : timeMatch[0],
                timeZoneMatch == null ? "" : timeZoneMatch[1]
            ];
            return result;
        } else {
            return ["", ""];
        }
    }

    handleDateChange(value) {
        let parsedDateTime = this.getParsedDateTime(this.props.value);
        parsedDateTime[0] = value;
        let result = "";
        if (!_.isEmpty(parsedDateTime[0])) {
            result = parsedDateTime[0];
            if (!_.isEmpty(parsedDateTime[1])) {
                result = result + " " + parsedDateTime[1]
                    + (this.props.hideTimezone ? "" : " " + (!_.isEmpty(parsedDateTime[2]) ? parsedDateTime[2] : this.getDefaultTimeZone()));
            }
            result = _.trim(result);
        } else {
            result = null;
        }
        this.props.onchange && this.props.onchange(result);
    }

    handleTimeChange(value) {
        let parsedDateTime = this.getParsedDateTime(this.props.value);
        parsedDateTime[1] = this.getParsedTime(value)[0];
        let result = "";
        if (!_.isEmpty(parsedDateTime[0])) {
            result = parsedDateTime[0];
        }
        if (!_.isEmpty(parsedDateTime[1])) {
            result = result + " " + parsedDateTime[1]
                + (this.props.hideTimezone ? "" : " " + (!_.isEmpty(parsedDateTime[2]) ? parsedDateTime[2] : this.getDefaultTimeZone()));
        }
        result = _.trim(result);
        this.props.onchange && this.props.onchange(result);
    }

    getDefaultTimeZone() {
        return this.props.timezone ? this.props.timezone : (this.context.user ? this.context.user.timeZoneId : "");
    }

    render() {
        let dateId = this.state.id + "-date";
        let timeId = this.state.id + "-time";
        let [date, time, timezone] = this.getParsedDateTime(this.props.value);

        if(this.props.hideTimezone){
            timezone = "";
        }else if(!timezone){
            timezone = this.getDefaultTimeZone();
        }

        let maskSettings = "'showMaskOnFocus':'true', 'mask':'h:s'";

        let timeComponent = this.props.timeAsTextInput ?
            <TextInput id={timeId}
                       helperText = {timezone}
                       mask = {maskSettings}
                       onchange={(value) => this.handleTimeChange(value)}
                       value={time}
                       hidden={this.props.hidden}
                       required={this.props.required}/> :
            <Time id={timeId} hideIcon={true}
                  hideTimezone={this.props.hideTimezone}
                  timezone = {timezone}
                  onchange={(value) => this.handleTimeChange(value)}
                  value={time}
                  hidden={this.props.hidden}
                  from={this.props.from} to={this.props.to} step={this.props.step}
                  required={this.props.required}/>;


        return (
            <div className="uk-grid uk-grid-collapse">
                <div className="uk-width-medium-3-5">
                    <Date id={dateId} onchange={(value) => this.handleDateChange(value)} value={date}
                          hidden={this.props.hidden}
                          label={this.props.label} required={this.props.required} format={this.props.format}
                          hideIcon = {this.props.hideIcon}
                          minDate = {this.props.minDate} maxDate = {this.props.maxDate}
                          placeholder={this.props.placeholder}/>
                </div>
                <div className="uk-width-medium-2-5">
                    {timeComponent}
                </div>
            </div>
        );
    }
}
DateTime.contextTypes = {
    user: PropTypes.object
};