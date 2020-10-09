import React from 'react';
import _ from "lodash";

import {TranslatingComponent} from 'susam-components/abstract';
import {Button, TextInput, Span, Notify} from 'susam-components/basic';
import {Grid, GridCell, Modal, Alert} from 'susam-components/layout';

import {getDateAndTime, calculateDeliveryDate} from '../Helper';
import moment from "moment/moment";

export class LoadingAppointmentEditModal extends TranslatingComponent{
    state = {page: 0, loadingAppointment: {}};

    constructor(props){
        super(props);
    }
    componentWillReceiveProps(nextProps){
        if(nextProps.editable && nextProps.shipment){
            let state = _.cloneDeep(this.state);
            state.loadingAppointment = {};
            if(nextProps.shipment.loadingAppointment){
                if(nextProps.shipment.loadingAppointment.startDateTime){
                    state.loadingAppointment.startDateTime = getDateAndTime(nextProps.shipment.loadingAppointment.startDateTime);
                }
                if(nextProps.shipment.loadingAppointment.endDateTime){
                    state.loadingAppointment.endDateTime = getDateAndTime(nextProps.shipment.loadingAppointment.endDateTime);
                }
            }
            state.unloadingAppointment = null;
            if(nextProps.shipment.unloadingAppointment){
                state.unloadingAppointment = {};
                if(nextProps.shipment.unloadingAppointment.startDateTime){
                    state.unloadingAppointment.startDateTime = getDateAndTime(nextProps.shipment.unloadingAppointment.startDateTime);
                }
                if(nextProps.shipment.unloadingAppointment.endDateTime){
                    state.unloadingAppointment.endDateTime = getDateAndTime(nextProps.shipment.unloadingAppointment.endDateTime);
                }
            }
            this.setState(state);
        }
    }
    open(){
        this.modal && this.modal.open();
    }
    close(){
        this.modal && this.modal.close();
        setTimeout(() => this.setState({page: 0}), 200);
    }
    handleClickSave(){
        let request = {};
        if(this.state.loadingAppointment){
            request.loadingAppointment = {};
            if(this.state.loadingAppointment.startDateTime) {
                request.loadingAppointment.startDateTime =
                    `${this.state.loadingAppointment.startDateTime} ${this.props.shipment.sender.handlingLocationTimezone}`;
            }
            if(this.state.loadingAppointment.endDateTime) {
                request.loadingAppointment.endDateTime =
                    `${this.state.loadingAppointment.endDateTime} ${this.props.shipment.sender.handlingLocationTimezone}`;
            }
        }
        if(this.state.unloadingAppointment && !this.state.unloadingAppointment.deleted){
            request.unloadingAppointment = {};
            if(this.state.unloadingAppointment.startDateTime) {
                request.unloadingAppointment.startDateTime =
                    `${this.state.unloadingAppointment.startDateTime} ${this.props.shipment.consignee.handlingLocationTimezone}`;
            }
            if(this.state.unloadingAppointment.endDateTime) {
                request.unloadingAppointment.endDateTime =
                    `${this.state.unloadingAppointment.endDateTime} ${this.props.shipment.consignee.handlingLocationTimezone}`;
            }
        }
        this.props.onSave(request);
        this.close();
    }
    handleClickSetReadyDate() {
        this.close();
        this.props.onSetReadyDate();
    }
    handleChangeLoadingAppointment(key, value){
        let loadingAppointment = _.cloneDeep(this.state.loadingAppointment);
        loadingAppointment[key] = value;
        this.setState({loadingAppointment: loadingAppointment});
    }
    handleChangeUnloadingAppointment(key, value){
        let unloadingAppointment = _.cloneDeep(this.state.unloadingAppointment);
        unloadingAppointment[key] = value;
        this.setState({unloadingAppointment: unloadingAppointment});
    }
    handleClickNext(){
        this.setState({page: 1}, () => this.getNewDeliveryDate());
    }
    handleClickDeleteAppointment(){
        let unloadingAppointment = _.cloneDeep(this.state.unloadingAppointment);
        unloadingAppointment.deleted = true;
        this.setState({unloadingAppointment: unloadingAppointment});
    }

    checkFutureDateAlert(value){
        let withTimezone = value ? value + " " + this.props.timezone : "";
        let readyDate = moment(withTimezone, "DD/MM/YYYY HH:mm Z");
        return moment().add(30, 'days').isBefore(readyDate);
    }

    checkWorkingHoursAlert(value){
        let withTimezone = value ? value + " " + this.props.shipment.sender.handlingLocationTimezone : "";
        let readyDate = moment(withTimezone, "DD/MM/YYYY HH:mm Z");
        let weekday = readyDate.format("dddd");
        if(this.props.senderWarehouse){
            let workingHours = this.props.senderWarehouse.establishment.workingHours;
            if(!_.isEmpty(workingHours)){
                let day = _.find(workingHours, w=>_.isEqual(_.lowerCase(w.day.code), _.lowerCase(weekday)));
                if(!day || _.isEmpty(day.timeWindows)){
                    return "According to Location Definitions, loading location does not work on entered date";
                }
                let isWorking = false;
                day.timeWindows.forEach(timeWindow=>{
                    let [startHour, startMinute] = timeWindow.startTime.split(":");
                    let [endHour, endMinute] = timeWindow.endTime.split(":");
                    let start = _.cloneDeep(readyDate).set({hour: startHour, minute: startMinute});
                    let end = _.cloneDeep(readyDate).set({hour: endHour, minute: endMinute});
                    if(readyDate.isBetween(start,end, null, "[]")){
                        isWorking = true;
                    }
                });
                if(!isWorking){
                    return "According to Location Definitions, entered time is out of working hours.";
                }
            }
            
        }
    }

    getNewDeliveryDate(){
        let {shipment, order} = this.props;
        calculateDeliveryDate(
            order.customer,
            order.serviceType,
            order.truckLoadType,
            this.state.loadingAppointment.startDateTime,
            shipment.sender,
            shipment.consignee,
            (deliveryDate) => {
                this.setState({deliveryDate: deliveryDate ? (deliveryDate + " " + shipment.sender.handlingLocationTimezone) : null});
            });
    }
    renderUnloadingAppointmentAlert(){
        if(!this.props.shipment.unloadingAppointment){
            return null;
        }
        return(
            <GridCell width = "1-1" noMargin = {true}>
                <Alert message = "This shipment has an unloading appointment. By changing loading appointment date, probably delivery dates will change as well, and unloading appointments should have to be revisited"
                       type = "warning" />
            </GridCell>
        );

    }
    renderDateInputs(){
        if(this.state.unloadingAppointment && this.state.unloadingAppointment.deleted){
            return null;
        }

        let shipment = this.props.shipment;
        return(
            <Grid>
                <GridCell width = "1-2">
                    <TextInput label = "Unloading Appointment Start" mask = "'showMaskOnFocus':'false', 'alias': 'datetime', 'clearIncomplete': 'true'"
                               onchange={(value) => this.handleChangeUnloadingAppointment("startDateTime", value)}
                               helperText = {shipment.consignee.handlingLocationTimezone}
                               value = {this.state.unloadingAppointment ? this.state.unloadingAppointment.startDateTime : ""}/>
                </GridCell>
                <GridCell width = "1-2">
                    <TextInput label = "Unloading Appointment End" mask = "'showMaskOnFocus':'false', 'alias': 'datetime', 'clearIncomplete': 'true'"
                               onchange={(value) => this.handleChangeUnloadingAppointment("endDateTime", value)}
                               helperText = {shipment.consignee.handlingLocationTimezone}
                               value = {this.state.unloadingAppointment ? this.state.unloadingAppointment.endDateTime : ""}/>
                </GridCell>
            </Grid>
        )
    }
    renderDeleteAppointmentButton(){
        if(!this.state.unloadingAppointment){
            return null;
        }
        if(!this.state.unloadingAppointment.deleted){
            return (
                <div className = "uk-align-right">
                    <Button label = "delete appointment" style = "danger" flat = {true} size = "mini"
                            onclick = {() => this.handleClickDeleteAppointment()} />
                </div>
            );
        }
        return (
            <Button label = "Undo Delete" flat = {true} size = "small" onclick = {() => this.handleClickUndoDelete()} />
        );
    }
    renderFutureDateAlert(){
        if(this.state.loadingAppointment.startDateTime && this.checkFutureDateAlert(this.state.loadingAppointment.startDateTime)){
            return (
                <GridCell width = "1-1">
                    <Alert type="warning" message = "You have entered an appointment date for more than 30 days" />
                </GridCell>
            );
        }
        return null;
    }

    renderWorkingHoursAlert(){
        let message = this.checkWorkingHoursAlert(this.state.loadingAppointment.startDateTime);
        if(this.state.loadingAppointment.startDateTime && message){
            return (
                <GridCell width = "1-1">
                    <Alert type="warning" message = {message} />
                </GridCell>
            );
        }
        return null;
    }
    render(){
        let actions = [];
        let pages = [];

            pages.push(
                <Grid>
                    {this.renderUnloadingAppointmentAlert()}
                    {this.renderFutureDateAlert()}
                    {this.renderWorkingHoursAlert()}
                    <GridCell width="1-2">
                        <TextInput label="From"
                                   mask="'showMaskOnFocus':'false', 'alias': 'datetime', 'clearIncomplete': 'true'"
                                   onchange={(value) => this.handleChangeLoadingAppointment("startDateTime", value)}
                                   helperText={this.props.shipment.sender.handlingLocationTimezone}
                                   value={this.state.loadingAppointment.startDateTime}/>
                    </GridCell>
                    <GridCell width="1-2">
                        <TextInput label="To"
                                   mask="'showMaskOnFocus':'false', 'alias': 'datetime', 'clearIncomplete': 'true'"
                                   onchange={(value) => this.handleChangeLoadingAppointment("endDateTime", value)}
                                   helperText={this.props.shipment.sender.handlingLocationTimezone}
                                   value={this.state.loadingAppointment.endDateTime}/>
                    </GridCell>
                    <GridCell width="1-1">
                        <Button label="set ready date" style="success" flat={true} size="mini"
                                onclick={() => this.handleClickSetReadyDate()}/>
                    </GridCell>
                </Grid>
            );

        if(this.props.shipment.unloadingAppointment){
            pages.push(
                <Grid>
                    <GridCell width = "1-1">
                        <Span label = "New Delivery Date" value = {this.state.deliveryDate || this.props.shipment.deliveryDate} />
                    </GridCell>
                    <GridCell width = "1-1">
                        {this.renderDateInputs()}
                    </GridCell>
                    <GridCell width = "1-1">
                        {this.renderDeleteAppointmentButton()}
                    </GridCell>
                </Grid>
            )
        }
        if(this.props.shipment.unloadingAppointment && this.state.page === 0){
            actions.push({label:"Next", buttonStyle: "primary", action:() => this.handleClickNext()});
        }else{
            actions.push({label:"Save", buttonStyle: "primary", action:() => this.handleClickSave()});
        }
        actions.push({label:"Close", action:() => this.close()});
        return(
            <Modal ref={(c) => this.modal = c}
                   title= "Loading Appointment"
                   closeOtherOpenModals = {false}
                   actions={actions}>
                {pages[this.state.page]}
            </Modal>
        )
    }

}