import moment from "moment";
import PropTypes from 'prop-types';
import React from "react";
import { TranslatingComponent } from "susam-components/abstract/TranslatingComponent";
import { TextInput } from 'susam-components/basic';
import { Alert, Grid, GridCell } from 'susam-components/layout';
import uuid from "uuid";
import { DefaultInactiveElement } from "./OrderSteps";


export class LoadingAppointment extends React.Component {

    render() {
        return <Appointment {...this.props}
            showWarningAfter={moment().add(30, 'days')}
            warningMessage="You have entered a loading appointment for more than 30 days" />
    }

}
export class UnloadingAppointment extends React.Component {

    render() {
        return <Appointment {...this.props}
            showWarningAfter={moment(this.props.readyDate, "DD/MM/YYYY HH:mm Z").add(30, 'days')}
            warningMessage="According to unloading appointment date, transit time will be more than 30 days" />
    }

}
export class Appointment extends TranslatingComponent {
    state = {};

    constructor(props) {
        super(props);
        this.firstElementId = "startDateTime";
        this.lastElementId = "endDateTime";
        this.focusedElementId = null;

        this.id = uuid.v4();
    }
    componentDidMount() {
        if (this.props.active) {
            this.addKeyDownEventListener();
            this.focusOn(this.firstElementId);
        }
        if (this.props.value && this.props.value.startDateTime) {
            let startDate = moment(this.props.value.startDateTime, "DD/MM/YYYY HH:mm Z");
            this.setState({ warnings: this.validateStartDate(startDate) });
        }
    }
    componentWillUnmount() {
        this.removeKeyDownEventListener();
    }
    removeKeyDownEventListener() {
        document.removeEventListener('keydown', this.handleKeyPress);
    }
    addKeyDownEventListener() {
        document.addEventListener('keydown', this.handleKeyPress);
    }
    componentDidUpdate(prevProps, prevState) {
        if (!this.props.active && prevProps.active) {
            this.removeKeyDownEventListener();
        }

        if (this.props.active && !prevProps.active) {
            this.focusOn(this.firstElementId);
            this.addKeyDownEventListener();
        }

    }
    handleKeyPress = (e) => {
        if (e.key === "Tab") {
            e.shiftKey ? this.handleShiftTab(e) : this.handleTab(e);
        }
    };

    handleTab(e) {
        this.focusedElementId = e.target.id;
        if (this.focusedElementId === this.lastElementId) {
            setTimeout(() => this.handleNext(), 200);
        }
    }
    handleShiftTab(e) {
        this.focusedElementId = e.target.id;
        if (this.focusedElementId === this.firstElementId) {
            setTimeout(() => this.handlePrev(), 200);
        }
    }

    handleNext() {
        this.props.onNext(this.props.value);
    }
    handlePrev() {
        this.props.onPrev(this.props.value);
    }
    focusOn(elementId) {
        document.getElementById(elementId).focus();
        this.focusedElementId = elementId;
    }

    validateStartDate(startDate){
        let warnings = this.validateWorkingHours(startDate);
        if(this.props.showWarningAfter && this.props.showWarningAfter.isBefore(startDate)){
            warnings.push(this.props.warningMessage);
        }
        return warnings;
    }
    validateWorkingHours(startDate) {
        let warnings = [];
        if (this.props.workingHours) {
            let weekDayName = moment(startDate).format('dddd');
            let latestTime = _.find(this.props.workingHours, i => _.isEqual(_.lowerCase(i.day.code), _.lowerCase(weekDayName)));
            if (latestTime && !_.isEmpty(latestTime.timeWindows)) {
                let isWorking = false
                latestTime.timeWindows.forEach(w => {
                    let [startHour, startMinute] = w.startTime.split(":");
                    let [endHour, endMinute] = w.endTime.split(":");
                    let start = _.cloneDeep(startDate).set({ hour: startHour, minute: startMinute });
                    let end = _.cloneDeep(startDate).set({ hour: endHour, minute: endMinute });
                    if (startDate.isBetween(start, end, null, "[]")) {
                        isWorking = true;
                    }
                });
                if (!isWorking) {
                    warnings.push("According to Location Definitions, entered time is out of working hours.");
                }
            } else {
                warnings.push("According to Location Definitions, loading location does not work on entered date");
            }
        }
        return warnings;
    }

    handleStartDateChange(value) {
        let withTimezone = value ? value + " " + this.props.timezone : "";
        let propsValue = _.cloneDeep(this.props.value || {});
        propsValue.startDateTime = withTimezone;

        let startDate = moment(withTimezone, "DD/MM/YYYY HH:mm Z");
        this.setState({ warnings: this.validateStartDate(startDate)}, () => {
            this.props.onChange && this.props.onChange(propsValue);
        });
    }

    handleEndDateChange(value) {
        let withTimezone = value ? value + " " + this.props.timezone : "";
        let propsValue = _.cloneDeep(this.props.value || {});
        propsValue.endDateTime = withTimezone;
        this.props.onChange && this.props.onChange(propsValue);
    }
    renderActive() {
        let startValue = "";
        let split = this.props.value && this.props.value.startDateTime ? this.props.value.startDateTime.split(" ") : [];
        if (split.length === 3) {
            startValue = split[0] + " " + split[1];
        }
        let endValue = "";
        split = this.props.value && this.props.value.endDateTime ? this.props.value.endDateTime.split(" ") : [];
        if (split.length === 3) {
            endValue = split[0] + " " + split[1];
        }
        let deliveryDateHelper = null;
        if (this.props.deliveryDateTime) {
            deliveryDateHelper =
                <GridCell with="1-1">
                    <span className="uk-text-small">{`${super.translate("Delivery Date")}: ${this.props.deliveryDateTime}`}</span>
                </GridCell>
        }
        return (
            <Grid>
                {this.renderAlert()}
                {deliveryDateHelper}
                <GridCell width="1-2">
                    <TextInput id="startDateTime" mask="'showMaskOnFocus':'false', 'alias': 'datetime', 'clearIncomplete': 'true'"
                        onchange={(value) => this.handleStartDateChange(value)}
                        helperText={this.props.timezone}
                        value={startValue} />
                </GridCell>
                <GridCell width="1-2">
                    <TextInput id="endDateTime" mask="'showMaskOnFocus':'false', 'alias': 'datetime', 'clearIncomplete': 'true'"
                        onchange={(value) => this.handleEndDateChange(value)}
                        helperText={this.props.timezone}
                        value={endValue} />
                </GridCell>
            </Grid>
        );
    }
    renderInactive() {
        let startDateTime = this.props.value ? this.props.value.startDateTime : "";
        let endDateTime = this.props.value ? this.props.value.endDateTime : "";
        let value = "Not entered yet";
        if (startDateTime || endDateTime) {
            value = (startDateTime ? startDateTime : "Not entered") + (endDateTime ? " - " + endDateTime : "");
        }
        return <Grid>{this.renderAlert()}<GridCell width="1-1"><DefaultInactiveElement value={value} /></GridCell></Grid>
    }

    renderAlert() {
        if (!_.isEmpty(this.state.warnings)) {
            return (
                this.state.warnings.map(w => {
                    return (
                        <GridCell width="1-1" key={uuid.v4()}>
                            <Alert type="warning" message={w} />
                        </GridCell>
                    );
                })
            );
        }
        return null;
    }
    render() {
        return this.props.active ? this.renderActive() : this.renderInactive();
    }
}

Appointment.contextTypes = {
    translator: PropTypes.object
};