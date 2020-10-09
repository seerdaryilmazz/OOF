import React from 'react';
import uuid from 'uuid';
import _ from 'lodash';

import {Grid, GridCell} from 'susam-components/layout';
import {DayAndTime} from 'susam-components/advanced';


export class TimeSelections extends React.Component{
    constructor(props){
        super(props);
        this.moment = require("moment");
    }

    handleReadyDateChange(value){
        let existingValue = _.cloneDeep(this.props.value);
        existingValue.readyDate = value;
        this.props.onchange && this.props.onchange(existingValue);
    }

    handlePlanCompletionDateChange(value){
        let existingValue = _.cloneDeep(this.props.value);
        existingValue.planCompletionDate = value;
        this.props.onchange && this.props.onchange(existingValue);
    }

    handleShipmentArrivalDateChange(value){
        let existingValue = _.cloneDeep(this.props.value);
        existingValue.shipmentArrivalDate = value;
        this.props.onchange && this.props.onchange(existingValue);
    }

    render(){

        let value = this.props.value;

        let fromTime = null;
        let toTime = null;
        let readyDateDayId = _.get(this.props.value, "readyDate.day.id");
        let planCompletionDateDayId = _.get(this.props.value, "planCompletionDate.day.id");
        let shipmentArrivalDate = _.get(this.props.value, "shipmentArrivalDate.day.id");

        if(readyDateDayId == planCompletionDateDayId){
            toTime = _.get(this.props.value, "readyDate.time");
        }

        if(readyDateDayId == shipmentArrivalDate){
            fromTime = _.get(this.props.value, "readyDate.time");
        }

        return(
            <Grid>
                <GridCell width="1-1">
                    <DayAndTime days = {this.props.days}
                                label = "Ready Date"
                                hideTimezone = {this.props.hideTimezone}
                                onchange = {(value) => this.handleReadyDateChange(value)}
                                value = {value ? value.readyDate : null}
                                required = {this.props.required}/>
                </GridCell>
                <GridCell width="1-1">
                    <DayAndTime days = {this.props.days}
                                label = "Collection Plan Should Be Completed Until"
                                hideTimezone = {this.props.hideTimezone} showWeeks={-1}
                                onchange = {(value) => this.handlePlanCompletionDateChange(value)}
                                value = {value ? value.planCompletionDate : null}
                                toDay = {value ? (value.readyDate ? value.readyDate.day : null) : null}
                                toTime = {toTime}
                                required = {this.props.required}/>
                </GridCell>
                <GridCell width="1-1">
                    <DayAndTime days = {this.props.days}
                                label = "Shipment Should Be Arrived To Related Terminal"
                                hideTimezone = {this.props.hideTimezone} showWeeks={2}
                                onchange = {(value) => this.handleShipmentArrivalDateChange(value)}
                                value = {value ? value.shipmentArrivalDate : null}
                                fromDay = {value ? (value.readyDate ? value.readyDate.day : null) : null}
                                fromTime = {fromTime}
                                required = {this.props.required}/>
                </GridCell>
            </Grid>
        );
    }
}