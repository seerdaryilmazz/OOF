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


        let shipmentDeliveryDateDayId = _.get(this.props.value, "shipmentDeliveryDate.day.id");
        let arrivalToWHDateDayId = _.get(this.props.value, "linehaulArrivalDate.day.id");
        let planCompletionDateDayId = _.get(this.props.value, "planCompletionDate.day.id");

        let shipmentDeliveryWeekOffset = _.get(this.props.value, "shipmentDeliveryDate.weekOffset");
        let arrivalToWHDateWeekOffset = _.get(this.props.value, "linehaulArrivalDate.weekOffset");
        let planCompletionDateWeekOffset = _.get(this.props.value, "planCompletionDate.weekOffset");

        let arrivalToTime = null;
        let planToTime = null;

        //If it is the same day, apply time limit.
        if(shipmentDeliveryDateDayId
            && arrivalToWHDateDayId == shipmentDeliveryDateDayId
            && arrivalToWHDateWeekOffset == shipmentDeliveryWeekOffset ){
            arrivalToTime = _.get(this.props.value, "shipmentDeliveryDate.time");
        }

        if(shipmentDeliveryDateDayId
            && planCompletionDateDayId == shipmentDeliveryDateDayId
            && planCompletionDateWeekOffset == shipmentDeliveryWeekOffset){
            planToTime = _.get(this.props.value, "shipmentDeliveryDate.time");
        }
        return(
            <Grid>
                <GridCell width="1-1">
                    <DayAndTime days = {this.props.days}
                                label = "Shipment should be delivered until"
                                hideTimezone = {this.props.hideTimezone}
                                onchange = {(value) => this.handleShipmentDeliveryDateChange(value)}
                                value = {value ? value.shipmentDeliveryDate : null}
                                required = {this.props.required}/>
                </GridCell>
                <GridCell width="1-1">
                    <DayAndTime days = {this.props.days}
                                label = "Distribution plan should be completed until"
                                hideTimezone = {this.props.hideTimezone} showWeeks={-1}
                                onchange = {(value) => this.handlePlanCompletionDateChange(value)}
                                value = {value ? value.planCompletionDate : null}
                                toDay = {value ? (value.shipmentDeliveryDate ? value.shipmentDeliveryDate.day : null) : null}
                                toTime = {planToTime}
                                required = {this.props.required}/>
                </GridCell>
                <GridCell width="1-1">
                    <DayAndTime days = {this.props.days}
                                label = "Shipment should arrive distribution WH until"
                                hideTimezone = {this.props.hideTimezone} showWeeks={-1}
                                onchange = {(value) => this.handleLinehaulArrivalDateChange(value)}
                                value = {value ? value.linehaulArrivalDate : null}
                                toDay = {value ? (value.shipmentDeliveryDate ? value.shipmentDeliveryDate.day : null) : null}
                                toTime = {arrivalToTime}
                                required = {this.props.required}/>
                </GridCell>
            </Grid>
        );
    }
}