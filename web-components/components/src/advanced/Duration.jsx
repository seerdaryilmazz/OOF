import React from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid';

import {DropDown} from "../basic";

export class Duration extends React.Component {
    constructor(props) {
        super(props);
        if (props.id) {
            this.state = {id: props.id};
        } else {
            this.state = {id: uuid.v4()};
        }
        this.state = {options: this.retrieveOptions()}

    }

    componentDidMount() {
        this.formatAndSetValue(this.props.value);
    }

    componentWillReceiveProps(nextProps) {
        this.formatAndSetValue(nextProps.value);
    }

    retrieveOptions() {
        let options = {};
        let hours = [];
        let minutes = [];
        let seconds = [];

        let i;



        i = 0;
        for (i = 0; i <= 23; i++) {
            if (i < 10) {
                hours.push({id: "0" + i.toString(), name: "0" + i.toString() + " H"});
            } else {
                hours.push({id: i.toString(), name: i.toString() + " H"});
            }
        }

        i = 0;
        for (i = 0; i <= 59; i++) {
            if (i < 10) {
                minutes.push({id: "0" + i.toString(), name: "0" + i.toString() + " M"});
            } else {
                minutes.push({id: i.toString(), name: i.toString() + " M"});
            }
        }

        i = 0;
        for (i = 0; i <= 59; i++) {
            if (i < 10) {
                seconds.push({id: "0" + i.toString(), name: "0" + i.toString() + " S"});
            } else {
                seconds.push({id: i.toString(), name: i.toString() + " S"});
            }
        }

        options.hours = hours;
        options.minutes = minutes;
        options.seconds = seconds;

        return options;
    }

    handleChange(field, value) {
        this.setState({[field]: value.id}, () => {
            this.props.onchange(this.state.hours + ":" + this.state.minutes + ":" + this.state.seconds)
        });
    }

    formatAndSetValue(value) {

        if(!value) {
            this.setState({hours: null, minutes: null, seconds: null});
        } else {
            let result = value.split(":");

            if (result.length != 3) {
                console.error("Invalid duration format, expected format is hh:mm:ss");
                return;
            }

            this.setState({hours: result[0], minutes: result[1], seconds: result[2]});
        }
    }

    render() {

        var style = {};
        if (this.props.hidden) {
            style.display = 'none';
        }
        var wrapperClassName = "md-input-filled";
        if (this.props.value || this.props.placeholder) {
            wrapperClassName += " md-input-filled";
        }
        var label = "";
        if (!this.props.hideLabel) {
            label = this.props.label;
        }

        let options = this.state.options;

        let hourDropDown = <DropDown id={this.state.id} options={options.hours}
                                    onchange={(value) => this.handleChange("hours", value)}
                                    required={this.props.required}
                                    value={this.state.hours} placeholder='Hour'/>;

        let minDropDown = <DropDown id={this.state.id} options={options.minutes}
                                     onchange={(value) => this.handleChange("minutes", value)}
                                     required={this.props.required}
                                     value={this.state.minutes} placeholder='Min'/>;

        let secDropDown = <DropDown id={this.state.id} options={options.seconds}
                                    onchange={(value) => this.handleChange("seconds", value)}
                                    required={this.props.required}
                                    value={this.state.seconds} placeholder='Sec'/>;

        return (
            <div className="md-input-wrapper md-input-filled" >
                <label>{label}</label>
                <div className="uk-grid uk-grid-collapse">
                    <div key="aa" className="uk-width-medium-1-3">
                        <div className="parsley-row" style={style}>
                            <div className={wrapperClassName}>
                                {hourDropDown}
                            </div>
                        </div>
                    </div>
                    <div key="bb" className="uk-width-medium-1-3">
                        <div className="parsley-row" style={style}>
                            <div className={wrapperClassName}>
                                {minDropDown}
                            </div>
                        </div>
                    </div>
                    <div key="cc" className="uk-width-medium-1-3">
                        <div className="parsley-row" style={style}>
                            <div className={wrapperClassName}>
                                {secDropDown}</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
Duration.contextTypes = {
    user: PropTypes.object
};