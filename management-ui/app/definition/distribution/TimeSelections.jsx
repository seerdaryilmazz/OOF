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

    handleLinehaulArrivalDateChange(value){
        let existingValue = _.cloneDeep(this.props.value);
        existingValue.linehaulArrivalDate = value;
        this.props.onchange && this.props.onchange(existingValue);
    }

    handlePlanCompletionDateChange(value){
        let existingValue = _.cloneDeep(this.props.value);
        existingValue.planCompletionDate = value;
        this.props.onchange && this.props.onchange(existingValue);
    }

    handleShipmentLeaveDateChange(value){
        let existingValue = _.cloneDeep(this.props.value);
        existingValue.shipmentLeaveDate = value;
        this.props.onchange && this.props.onchange(existingValue);
    }

    handleShipmentDeliveryDateChange(value){
        let existingValue = _.cloneDeep(this.props.value);
        existingValue.shipmentDeliveryDate = value;
        this.props.onchange && this.props.onchange(existingValue);
    }


    render(){

        let value = this.props.value;


        let linehaulArrivalDate = _.get(this.props.value, "linehaulArrivalDate.day.id");
        let planCompletionDateDayId = _.get(this.props.value, "planCompletionDate.day.id");
        let shipmentLeaveDate = _.get(this.props.value, "shipmentLeaveDate.day.id");
        let shipmentDeliveryDate = _.get(this.props.value, "shipmentDeliveryDate.day.id");

        let toTime = null;
        let fromTime1 = null;
        let fromTime2 = null;


        if(linehaulArrivalDate == planCompletionDateDayId){
            toTime = _.get(this.props.value, "linehaulArrivalDate.time");
        }

        if(linehaulArrivalDate == shipmentLeaveDate){
            fromTime1 = _.get(this.props.value, "linehaulArrivalDate.time");
        }

        if(shipmentLeaveDate == shipmentDeliveryDate){
            fromTime2 = _.get(this.props.value, "shipmentLeaveDate.time");
        }

        return(
            <Grid>
                <GridCell width="1-1">
                    <DayAndTime days = {this.props.days}
                                label = "Linehaul Terminal Arrival"
                                hideTimezone = {this.props.hideTimezone}
                                onchange = {(value) => this.handleLinehaulArrivalDateChange(value)}
                                value = {value ? value.linehaulArrivalDate : null}
                                required = {this.props.required}/>
                </GridCell>
                <GridCell width="1-1">
                    <DayAndTime days = {this.props.days}
                                label = "Distribution plan should be completed until"
                                hideTimezone = {this.props.hideTimezone} showWeeks={-1}
                                onchange = {(value) => this.handlePlanCompletionDateChange(value)}
                                value = {value ? value.planCompletionDate : null}
                                toDay = {value ? (value.linehaulArrivalDate ? value.linehaulArrivalDate.day : null) : null}
                                toTime = {toTime}
                                required = {this.props.required}/>
                </GridCell>
                <GridCell width="1-1">
                    <DayAndTime days = {this.props.days}
                                label = "Shipment should be left related terminal until"
                                hideTimezone = {this.props.hideTimezone} showWeeks={2}
                                onchange = {(value) => this.handleShipmentLeaveDateChange(value)}
                                value = {value ? value.shipmentLeaveDate : null}
                                fromDay = {value ? (value.linehaulArrivalDate ? value.linehaulArrivalDate.day : null) : null}
                                fromTime = {fromTime1}
                                required = {this.props.required}/>
                </GridCell>
                <GridCell width="1-1">
                    <DayAndTime days = {this.props.days}
                                label = "Shipment should be delivered until"
                                hideTimezone = {this.props.hideTimezone} showWeeks={2}
                                onchange = {(value) => this.handleShipmentDeliveryDateChange(value)}
                                value = {value ? value.shipmentDeliveryDate : null}
                                fromDay = {value ? (value.shipmentLeaveDate ? value.shipmentLeaveDate.day : null) : null}
                                fromTime = {fromTime2}
                                required = {this.props.required}/>
                </GridCell>
            </Grid>
        );
    }
}