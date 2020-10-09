import _ from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, DropDown, Notify, Span, TextInput } from 'susam-components/basic';
import { Alert, Grid, GridCell, Modal } from 'susam-components/layout';
import { calculateDeliveryDate, getDateAndTime } from '../Helper';
import { OrderService } from "../services";
import { MiniLoader } from './MiniLoader';

export class ServiceType extends TranslatingComponent{

    state = {
        pageIndex: 0,
        newDeliveryDates: {},
        changeRequest: {
            unloadingAppointments: []
        }
    };

    componentDidMount(){
        this.loadServiceTypes();
    }

    createChangeRequest(){
        let changeRequest = {};
        let unloadingAppointments = [];
        this.filterShipmentsWithUnloadingAppointment().forEach(shipment => {
            let shipmentAndAppointment = {
                shipmentId: shipment.id,
                appointment: {}
            };
            shipmentAndAppointment.appointment.startDateTime = getDateAndTime(shipment.unloadingAppointment.startDateTime);
            if(shipment.unloadingAppointment.endDateTime){
                shipmentAndAppointment.appointment.endDateTime = getDateAndTime(shipment.unloadingAppointment.endDateTime);
            }
            unloadingAppointments.push(shipmentAndAppointment);
        });

        changeRequest.unloadingAppointments = unloadingAppointments;
        changeRequest.serviceType = this.props.value;
        return changeRequest;
    }

    loadServiceTypes(){
        OrderService.getServiceTypes().then(response => {
            this.setState({serviceTypes: response.data});
        }).catch(error => Notify.showError(error));
    }

    handleMouseOver(){
        if(this.props.editable){
            this.setState({isMouseOver: true});
        }
    }

    handleMouseLeave(){
        if(this.props.editable) {
            this.setState({isMouseOver: false});
        }
    }

    handleClick(){
        if(this.props.editable) {
            this.setState({changeRequest: this.createChangeRequest(), pageIndex: 0}, () => {
                this.editModal.open();
            });
        }
    }

    handleChangeServiceType(value){
        let changeRequest = _.cloneDeep(this.state.changeRequest);
        changeRequest.serviceType = value;
        this.setState({changeRequest: changeRequest});
    }
    handleChangeAppointment(shipment, key, value){
        let changeRequest = _.cloneDeep(this.state.changeRequest);
        let appointmentIndex = _.findIndex(changeRequest.unloadingAppointments, {shipmentId: shipment.id});
        if(appointmentIndex === -1) {
            return;
        }
        changeRequest.unloadingAppointments[appointmentIndex].appointment[key] = value;
        this.setState({changeRequest: changeRequest});
    }

    handleDeleteAppointment(shipment, value){
        let changeRequest = _.cloneDeep(this.state.changeRequest);
        let appointmentIndex = _.findIndex(changeRequest.unloadingAppointments, {shipmentId: shipment.id});
        if(appointmentIndex === -1) {
            return;
        }
        changeRequest.unloadingAppointments[appointmentIndex].deleted = value;
        this.setState({changeRequest: changeRequest});
    }

    handleClickDeleteAppointment(shipment){
        this.handleDeleteAppointment(shipment, true);
    }
    handleClickUndoDelete(shipment){
        this.handleDeleteAppointment(shipment, false);
    }

    buildStyle(){
        let style = {
        };
        if(this.props.editable){
            style.cursor = "pointer"
        }
        return style;
    }

    getTitle(){
        return this.props.editable ? super.translate("Click to edit") : "";
    }

    filterShipmentsWithUnloadingAppointment(){
        return _.filter(this.props.shipments, shipment => {
            return shipment.unloadingAppointment && shipment.unloadingAppointment.startDateTime;
        })
    }
    validateDateRange(appointment){
        if(!appointment.startDateTime){
            Notify.showError("Appointment start date time should be entered");
            return false;
        }
        let startDate = moment(appointment.startDateTime, "DD/MM/YYYY HH:mm Z");
        let startIsValid = startDate.isValid();
        if(!startIsValid){
            Notify.showError("Start date time is not valid");
            return false;
        }
        if(appointment.endDateTime){
            let endDate = moment(appointment.endDateTime, "DD/MM/YYYY HH:mm Z");
            let endIsValid = endDate.isValid();
            if(!endIsValid){
                Notify.showError("End date time is not valid");
                return false;
            }
            if(startDate.isAfter(endDate)){
                Notify.showError("Start date should be before end date");
                return false;
            }
        }
        return true;
    }
    validateAppointment(shipment){
        let unloadingAppointment = _.find(this.state.changeRequest.unloadingAppointments, {shipmentId: shipment.id});
        if(unloadingAppointment){
            if(unloadingAppointment.deleted) {
                return true;
            }
            if(!this.validateDateRange(unloadingAppointment.appointment)){
                return false;
            }

            if(!this.state.newDeliveryDates[shipment.id]){
                return true;
            }

            let startDateTime = moment(unloadingAppointment.appointment.startDateTime, "DD/MM/YYYY HH:mm Z");
            let deliveryDate = moment(this.state.newDeliveryDates[shipment.id], "DD/MM/YYYY HH:mm Z");
            deliveryDate.startOf('date');
            if(deliveryDate.isAfter(startDateTime)){
                Notify.showError("Appointment date should be after delivery date");
                return false;
            }
        }

        return true;
    }

    handleClickNextShipment(){
        let shipment = this.filterShipmentsWithUnloadingAppointment()[this.state.pageIndex-1];
        if(!this.validateAppointment(shipment)){
            return;
        }
        this.setState({pageIndex: this.state.pageIndex+1});
    }
    handleClickNext(){
        this.filterShipmentsWithUnloadingAppointment().forEach(shipment => {
            this.getNewDeliveryDate(shipment);
        });
        this.setState({pageIndex: this.state.pageIndex+1});
    }

    handleClickSave(){
        if(this.filterShipmentsWithUnloadingAppointment().length > 0){
            let shipment = this.filterShipmentsWithUnloadingAppointment()[this.state.pageIndex-1];
            if(!this.validateAppointment(shipment)){
                return;
            }
        }

        this.state.changeRequest.unloadingAppointments.forEach(shipmentAndAppointment => {
            if(!shipmentAndAppointment.deleted){
                shipmentAndAppointment.appointment.startDateTime =
                    `${shipmentAndAppointment.appointment.startDateTime} ${this.props.timezone}`;
                if(shipmentAndAppointment.appointment.endDateTime){
                    shipmentAndAppointment.appointment.endDateTime =
                        `${shipmentAndAppointment.appointment.endDateTime} ${this.props.timezone}`;
                }
            }else{
                shipmentAndAppointment.appointment = null;
            }
        });
        this.props.onSave(this.state.changeRequest);
    }

    getNewDeliveryDate(shipment){
        let readyDate = getDateAndTime(shipment.loadingAppointment ? shipment.loadingAppointment.startDateTime : shipment.readyAtDate);
        calculateDeliveryDate(
            this.props.customer,
            this.state.changeRequest.serviceType,
            this.props.truckLoadType,
            readyDate,
            shipment.sender,
            shipment.consignee,
            (deliveryDate) => {
                let newDeliveryDates = _.cloneDeep(this.state.newDeliveryDates);
                newDeliveryDates[shipment.id] = deliveryDate ? (deliveryDate + " " + this.props.timezone) : null;
                this.setState({newDeliveryDates: newDeliveryDates});
            });
    }

    handleCloseModal(){
        this.editModal.close();
    }

    getAvailableOptions(){
        let availableOptions = this.props.template.getAvailableServiceTypes(this.state.serviceTypes);
        return availableOptions ? availableOptions.map(item => _.find(this.state.serviceTypes, {code: item.code})) : this.state.serviceTypes;
    }

    render(){
        if(this.props.busy){
            return <MiniLoader title="saving..."/>
        }
        let classes = {
            STANDARD: "md-bg-grey-400", EXPRESS: "md-bg-red-300", SUPER_EXPRESS: "md-bg-red-500", SPEEDY: "md-bg-red-700", SPEEDYXL: "md-bg-red-900"
        };
        let classNames = ["large-badge", this.state.isMouseOver ? "md-bg-brown-900" : classes[this.props.value.id]];

        return(
            <div>
                <span className={classNames.join(" ")}
                      style = {this.buildStyle()}
                      title = {this.getTitle()} data-uk-tooltip="{pos:'top'}"
                      onMouseOver={() => this.handleMouseOver()}
                      onMouseLeave={() => this.handleMouseLeave()}
                      onClick = {() => this.handleClick()}>
                    {this.props.value.name}
                </span>
                {this.renderModal()}
            </div>
        );
    }

    renderModal(){
        if(!this.props.template){
            return null;
        }

        let availableOptions = this.getAvailableOptions();
        let hasApplicableOptions = availableOptions.length > 0 && _.find(availableOptions, type => type.code !== this.props.value.code);
        let actions = [{label:"Close", action:() => this.handleCloseModal()}];
        if(hasApplicableOptions){
            let filteredShipments = this.filterShipmentsWithUnloadingAppointment();
            if(this.state.pageIndex < filteredShipments.length){
                if(this.state.pageIndex === 0){
                    actions.push({label: "Next", buttonStyle: "primary", action:() => this.handleClickNext()});
                }else{
                    actions.push({label: "Next", buttonStyle: "primary",
                        action:() => this.handleClickNextShipment()});
                }
            }else{
                actions.push({label: "Save", buttonStyle: "primary", action:() => this.handleClickSave()});
            }
        }
        return(
            <Modal title = "Edit Service Type" ref = {c => this.editModal = c}
                   closeOtherOpenModals = {false}
                   actions={actions}>
                {this.renderModalContent(availableOptions)}
            </Modal>
        );
    }

    renderModalContent(availableOptions){
        if(availableOptions.length === 0){
            return (
                <Alert message = "There is no service type available in template that fits all shipment parameters"
                       type = "danger" />
            );
        }else if(availableOptions.length === 1 && availableOptions[0].code === this.props.value.code){
            return (
                <Alert message = "There is only one service type in template that fits all shipment parameters"
                       type = "danger" />
            );
        }else{
            return this.renderServiceTypeWizard(availableOptions);
        }
    }
    renderServiceTypeWizard(availableOptions){
        let shipmentsWithUnloadingAppointment = this.filterShipmentsWithUnloadingAppointment();
        let alert = shipmentsWithUnloadingAppointment.length > 0 ?
            <GridCell width = "1-1" noMargin = {true}>
                <Alert message = "There are shipments with unloading appointment in this order. By changing service type, probably delivery dates will change as well, and unloading appointments should have to be revisited"
                   type = "warning" />
            </GridCell>: null;

        let pages = [];
        pages.push(
            <Grid>
                {alert}
                <GridCell width = "1-1">
                    <DropDown label = "Service Type" options = {availableOptions} value = {this.state.changeRequest.serviceType}
                              onchange = {(value) => this.handleChangeServiceType(value) } />
                </GridCell>
            </Grid>
        );
        shipmentsWithUnloadingAppointment.forEach(shipment => {
            let unloadingAppointment =
                _.find(this.state.changeRequest.unloadingAppointments, {shipmentId: shipment.id});
            if(unloadingAppointment){
                pages.push(
                    <Grid>
                        <GridCell width = "1-1" noMargin = {true}>
                            <span>{super.translate("Shipment")}</span>: <span className="uk-text-bold">{shipment.code}</span>
                        </GridCell>
                        <GridCell width = "1-1">
                            <Span label = "New Delivery Date" value = {this.state.newDeliveryDates[shipment.id] || "No defined delivery date for this shipment"} />
                        </GridCell>
                        <GridCell width = "1-1" noMargin = {true}>
                            {this.renderDateInputs(shipment, unloadingAppointment)}
                        </GridCell>
                        <GridCell width = "1-1">
                            {this.renderDeleteAppointmentButton(shipment, unloadingAppointment)}
                        </GridCell>
                    </Grid>
                );
            }

        });

        return pages[this.state.pageIndex];
    }

    renderDeleteAppointmentButton(shipment, unloadingAppointment){
        if(unloadingAppointment.deleted){
            return <Button label = "Undo Delete" flat = {true} size = "small"
                           onclick = {() => this.handleClickUndoDelete(shipment)} />
        }
        return (
            <div className = "uk-align-right">
                <Button label = "Delete Appointment" flat = {true} style = "danger" size = "small"
                        onclick = {() => this.handleClickDeleteAppointment(shipment)} />
            </div>
        );
    }

    renderDateInputs(shipment, unloadingAppointment){
        if(unloadingAppointment.deleted){
            return null;
        }
        return(
            <Grid>
                <GridCell width = "1-2">
                    <TextInput label = "Appointment Start Date" mask = "'showMaskOnFocus':'false', 'alias': 'datetime', 'clearIncomplete': 'true'"
                               onchange={(value) => this.handleChangeAppointment(shipment, "startDateTime", value)}
                               helperText = {this.props.timezone}
                               value = {unloadingAppointment.appointment.startDateTime}/>
                </GridCell>
                <GridCell width = "1-2">
                    <TextInput label = "Appointment End Date" mask = "'showMaskOnFocus':'false', 'alias': 'datetime', 'clearIncomplete': 'true'"
                               onchange={(value) => this.handleChangeAppointment(shipment, "endDateTime", value)}
                               helperText = {this.props.timezone}
                               value = {unloadingAppointment.appointment.endDateTime}/>
                </GridCell>
            </Grid>
        );
    }
}

ServiceType.contextTypes = {
    translator: PropTypes.object
};