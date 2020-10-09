import React from 'react';
import _ from "lodash";

import {TranslatingComponent} from 'susam-components/abstract';
import {Button, TextInput, Span} from 'susam-components/basic';
import {Grid, GridCell, Modal} from 'susam-components/layout';

export class UnloadingAppointmentEditModal extends TranslatingComponent{
    state = {start: {}, end: {}}

    constructor(props){
        super(props);
    }
    componentWillReceiveProps(nextProps){
        if(nextProps.value){
            let state = {};
            if(nextProps.value.startDateTime){
                let [startDate, startTime] = nextProps.value.startDateTime.split(" ");
                state.start = {datetime: startDate + " " + startTime};
            }
            if(nextProps.value.endDateTime){
                let [endDate, endTime] = nextProps.value.endDateTime.split(" ");
                state.end = {datetime: endDate + " " + endTime}
            }
            this.setState(state);
        }
    }
    open(){
        this.modal && this.modal.open();
    }
    handleClickSave(){
        let appointment = {};
        if(this.state.start.datetime){
            appointment.startDateTime = this.state.start.datetime + " " + this.props.timezone;
        }
        if(this.state.end.datetime){
            appointment.endDateTime = this.state.end.datetime + " " + this.props.timezone
        }
        this.props.onSave(appointment);
        this.modal.close();
    }
    handleClickDelete() {
        this.modal.close();
        this.props.onDelete();
    }

    handleStartDateChange(value){
        let startDateTime = _.cloneDeep(this.state.start);
        startDateTime.datetime = value;
        this.setState({start: startDateTime});
    }
    handleEndDateChange(value){
        let endDateTime = _.cloneDeep(this.state.end);
        endDateTime.datetime = value;
        this.setState({end: endDateTime});
    }
    render(){
        return(
            <Modal ref={(c) => this.modal = c}
                   title= "Unloading Appointment"
                   closeOtherOpenModals = {false}
                   actions={[
                       {label:"Save", buttonStyle: "primary", action:() => this.handleClickSave()},
                       {label:"Close", action:() => this.modal.close()}
                   ]}>
                <Grid>
                    <GridCell width = "1-1">
                        <Span label = "Delivery Date" value = {this.props.deliveryDate} />
                    </GridCell>
                    <GridCell width = "1-2">
                        <TextInput label="From" mask = "'showMaskOnFocus':'false', 'alias': 'datetime', 'clearIncomplete': 'true'"
                                   onchange={(value) => this.handleStartDateChange(value)}
                                   helperText = {this.props.timezone}
                                   value = {this.state.start.datetime}/>
                    </GridCell>
                    <GridCell width = "1-2">
                        <TextInput label="To" mask = "'showMaskOnFocus':'false', 'alias': 'datetime', 'clearIncomplete': 'true'"
                                   onchange={(value) => this.handleEndDateChange(value)}
                                   helperText = {this.props.timezone}
                                   value = {this.state.end.datetime}/>
                    </GridCell>
                    <GridCell width = "1-1">
                        <Button label = "delete appointment" style = "danger" flat = {true} size = "mini"
                                onclick = {() => this.handleClickDelete()} />
                    </GridCell>
                </Grid>
            </Modal>
        )
    }

}