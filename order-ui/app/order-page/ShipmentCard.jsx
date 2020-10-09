import _ from 'lodash';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, Notify } from 'susam-components/basic';
import { Grid, GridCell } from 'susam-components/layout';
import { Table } from 'susam-components/table';
import uuid from 'uuid';
import { DateFormatter } from '../common/DateFormatter';
import { OrderService } from '../services';
import { AppointmentModal } from './AppointmentModal';
import { CertificatesModal } from './CertificatesModal';
import { ParticipantSelector } from './ParticipantSelector';
import { ReadyDateModal } from './ReadyDateModal';
import { ShipmentCardCopyModal } from './ShipmentCardCopyModal';
import { ShipmentUnitModal } from './ShipmentUnitModal';





export class ShipmentCard extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.moment = require("moment");
        this.state = {
            shipment: {
                code: null,
                readyAtDate: null,
                sender: null,
                pickupAppointment: null,
                receiver: null,
                deliveryAppointment: null,
                adrClass: null,
                certificatedLoad: null,
                specialLoad: null,
                shipmentUnits: []
            },
            projectData: {},
            timezone: null
        };

        if(props.projectData){
            this.state.projectData = props.projectData;
        }

        this.tableHeaders = [
            {
                name: "Row Id",
                data: "rowId",
                hidden: true
            },
            {
                name: "Total Count",
                data: "totalCount",
                render: (value) => {
                    let totalCount = 0;
                    value.shipmentUnitPackages.forEach(item => {
                        totalCount = totalCount + item.count;
                    });
                    return totalCount + " " + value.type.code;
                }
            },
            {
                name: "Total LDM",
                data: "totalLdm"
            }
        ];

        this.tableActions = {
            actionButtons: [
                {
                    icon: "pencil",
                    action: (elem) => this.handleEditShipmentUnitClick(elem),
                    title: "Edit"
                }
            ],
            rowDelete: {
                icon: "close",
                action: (elem) => this.handleDeleteShipmentUnitClick(elem),
                title: "Delete",
                confirmation: "Are you sure you want to delete?"
            }
        };
    }

    static PARTICIPANT_TYPE_SENDER = "sender";
    static PARTICIPANT_TYPE_RECEIVER = "receiver";

    loadCard(){
        var $md_card = $(this.card);

        // replace toggler icon (x) when overlay is active
        $md_card.each(function() {
            var $this = $(this);
            if($this.hasClass('md-card-overlay-active')) {
                $this.find('.md-card-overlay-toggler').html('&#xE5CD;')
            }
        });

        // toggle card overlay
        $md_card.on('click','.md-card-overlay-toggler', function(e) {
            e.preventDefault();
            if(!$(this).closest('.md-card').hasClass('md-card-overlay-active')) {
                $(this)
                    .html('&#xE5CD;')
                    .closest('.md-card').addClass('md-card-overlay-active');

            } else {
                $(this)
                    .html('&#xE5D4;')
                    .closest('.md-card').removeClass('md-card-overlay-active');
            }
        })
    }
    componentDidMount(){
        this.loadCard();
        if (this.props.value) {
            this.prepareState(this.props.value, this.props.projectData);
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.value) {
            this.prepareState(nextProps.value, nextProps.projectData);
        }
    }

    updateShipmentState(key, value){
        let shipment = _.cloneDeep(this.state.shipment);
        shipment[key] = value;
        this.setState({shipment: shipment});
    }

    calculateShipmentPayWeight(shipment, callback) {

        if(!shipment.shipmentUnits ||  shipment.shipmentUnits.length == 0) {
            return 0;
        }

        let totalGrossWeightInKilograms = 0;
        let totalVolumeInCubicMeters = 0;
        let totalLdm = 0;

        shipment.shipmentUnits.forEach(item => {

            totalGrossWeightInKilograms += item.totalGrossWeightInKilograms;
            totalVolumeInCubicMeters += item.totalVolumeInCubicMeters;
            totalLdm += item.totalLdm;
        });

        OrderService.calculatePayWeight(totalGrossWeightInKilograms, totalVolumeInCubicMeters, totalLdm).then(response => {
            callback(response.data);
        }).catch (e => {
            Notify.showError("Error occured while calculating Pay Weight.");
        })

    }

    handleClickAddShipmentUnit(event){

        event.preventDefault();

        if (!this.state.shipment.sender || !this.state.shipment.receiver) {
            Notify.showError("Please select sender and consignee first.");
        } else {
            this.shipmentUnitSelector.openForAdd(
                this.state.projectData.shipmentProperties, this.state.shipment.sender, this.state.shipment.receiver);
        }
    }

    handleShipmentUnitSave(shipmentUnit) {
        let shipment = _.cloneDeep(this.state.shipment);
        if (shipmentUnit.rowId) {
            let index = _.findIndex(shipment.shipmentUnits, item => {
                return item.rowId == shipmentUnit.rowId;
            });
            shipment.shipmentUnits.splice(index, 1, shipmentUnit);
        } else {
            shipmentUnit.rowId = uuid.v4();
            shipment.shipmentUnits.push(shipmentUnit);
        }

        this.calculateShipmentPayWeight(shipment, (payweight) => {
            shipment.payWeight = payweight;
            this.setState({shipment: shipment});
            this.props.onupdate && this.props.onupdate(this.state.shipment);
        })
    }

    handleEditShipmentUnitClick(elem) {

        if (!this.state.shipment.sender || !this.state.shipment.receiver) {
            Notify.showError("Please select sender and consignee first.");
        } else {
            this.shipmentUnitSelector.openForEdit(
                {shipmentUnit: elem}, this.state.projectData.shipmentProperties, this.state.shipment.sender, this.state.shipment.receiver);
        }
    }

    handleDeleteShipmentUnitClick(elem) {
        let shipment = _.cloneDeep(this.state.shipment);
        _.remove(shipment.shipmentUnits, item => {
            return item.rowId == elem.rowId;
        });

        this.calculateShipmentPayWeight(shipment, (payweight) => {
            shipment.payWeight = payweight;
            this.setState({shipment: shipment});
            this.props.onupdate && this.props.onupdate(this.state.shipment);
        })
    }

    handleSelectSenderSave(sender){
        let shipment = _.cloneDeep(this.state.shipment);
        let timezone = sender && sender.location ? sender.location.timezone :"";
        shipment.sender = _.cloneDeep(sender);
        this.updateReadyAtDateWithTimeZone(shipment, timezone);
        this.setState({shipment: shipment,
            timezone: timezone});
        this.props.onupdate && this.props.onupdate(this.state.shipment);
    }
    updateReadyAtDateWithTimeZone(shipment, timezone) {
       let dateTimeArr = shipment._defaultReadyAtDate.split(" ");
       shipment.readyAtDate = null;
       shipment._defaultReadyAtDate = dateTimeArr[0] + " " + dateTimeArr[1] + (timezone ? " " + timezone : "");
    }
    handleSelectReceiverSave(receiver){
        let shipment = _.cloneDeep(this.state.shipment);
        shipment.receiver = _.cloneDeep(receiver);
        this.setState({shipment: shipment});
        this.props.onupdate && this.props.onupdate(this.state.shipment);
    }
    handleSelectSenderClick(event){
        event.preventDefault();
        this.senderSelector.open(this.state.shipment.sender, this.state.projectData.senders);
    }
    handleUpdateSenderClick(event){
        event.preventDefault();
        this.senderSelector.open(this.state.shipment.sender, this.state.projectData.senders);
    }
    handleSelectReceiverClick(event){
        event.preventDefault();
        this.receiverSelector.open(this.state.shipment.receiver, this.state.projectData.receivers);
    }
    handleUpdateReceiverClick(event){
        event.preventDefault();
        this.receiverSelector.open(this.state.shipment.receiver, this.state.projectData.receivers);
    }
    handleSenderAppointmentClick(event){
        event.preventDefault();
        this.senderAppointmentSelector.show();
    }
    handleReceiverAppointmentClick(event){
        event.preventDefault();
        this.receiverAppointmentSelector.show();
    }
    handleSenderAppointmentSave(dateTimeRange){
        let shipment = _.cloneDeep(this.state.shipment);

        if(!ShipmentCard.validatePickupDates(shipment.readyAtDate, dateTimeRange)) {
            return;
        }

        shipment.pickupAppointment = dateTimeRange;
        this.setState({shipment: shipment}, () => {
            this.props.onupdate && this.props.onupdate(this.state.shipment);
        });
    }

    handleReceiverAppointmentSave(dateTimeRange) {
        let state = _.cloneDeep(this.state);

        let shipment = state.shipment;
        let rddErrorExist = state.rddErrorExist;
        if (state.shipment.requestedDeliveryDate && !ShipmentCard.validateDeliveryDates(state.shipment.requestedDeliveryDate, dateTimeRange)) {
            return;
        } else {
            shipment._rddErrorExist = null;
            rddErrorExist = null;
        }

        shipment.deliveryAppointment = dateTimeRange;
        this.setState({shipment: shipment, rddErrorExist: rddErrorExist}, () => {
            this.props.onupdate && this.props.onupdate(this.state.shipment);
        });
    }

    static validatePickupDates(readyAtDate, dateTimeRange) {
        if(readyAtDate) {
            let errorMessage = null;
            let requestedDeliveryDateMoment = null;
            if(readyAtDate) {
                requestedDeliveryDateMoment = moment(readyAtDate, 'DD/MM/YYYY');
            }

            let appStartMoment = null;
            if(dateTimeRange.start) {
                appStartMoment = moment(dateTimeRange.start, 'DD/MM/YYYY');
            }
            let appEndMoment = null;
            if(dateTimeRange.end) {
                appEndMoment = moment(dateTimeRange.end, 'DD/MM/YYYY');
            }

            if(appStartMoment) {
                if (appStartMoment < requestedDeliveryDateMoment) {
                    Notify.showError("'Pick Up Appointment Start Day' should be on the same day or later with 'Shipment Ready Date'.");
                    return false;
                }
                if (appEndMoment && appEndMoment < appStartMoment) {
                    Notify.showError("'Pick Up Appointment End Date' should be after 'Pick Up Appointment Start Date'");
                    return false;
                }
            } else if (appEndMoment && appEndMoment < requestedDeliveryDateMoment) {
                Notify.showError("'Pick Up Appointment End Day' should be on the same day or later with 'Shipment Ready Date'.");
                return false;
            }
        }

        return true;
    }

    static validateDeliveryDates(requestedDeliveryDate, dateTimeRange) {

        if (requestedDeliveryDate && dateTimeRange) {

            let requestedDeliveryDateMoment = null;
            if (requestedDeliveryDate) {
                requestedDeliveryDateMoment = moment(requestedDeliveryDate, 'DD/MM/YYYY');
            }

            let appStartMoment = null;
            if (dateTimeRange.start) {
                appStartMoment = moment(dateTimeRange.start, 'DD/MM/YYYY');
            }
            let appEndMoment = null;
            if (dateTimeRange.end) {
                appEndMoment = moment(dateTimeRange.end, 'DD/MM/YYYY');
            }

            if (appStartMoment) {
                if (appStartMoment < requestedDeliveryDateMoment) {
                    Notify.showError("'Delivery Appointment Start Day' should be on the same day or later with 'Requested Delivery Date'.");
                    return false;
                }
                if (appEndMoment && appEndMoment < appStartMoment) {
                    Notify.showError("'Delivery End Date' should be after 'Delivery Start Date'");
                    return false;
                }
            } else if (appEndMoment && appEndMoment < requestedDeliveryDateMoment) {
                Notify.showError("'Delivery Appointment End Day' should be on the same day or later with 'Requested Delivery Date'.");
                return false;
            }
        }
        return true;
    }

    handleSenderAppointmentDelete(event) {
        event.preventDefault();
        let shipment = _.cloneDeep(this.state.shipment);
        shipment.pickupAppointment = null;
        this.setState({shipment: shipment}, () => {
            this.props.onupdate && this.props.onupdate(this.state.shipment);
        });

    }
    handleReceiverAppointmentDelete(event) {
        event.preventDefault();
        let shipment = _.cloneDeep(this.state.shipment);
        shipment.deliveryAppointment = null;
        this.setState({shipment: shipment}, () => {
            this.props.onupdate && this.props.onupdate(this.state.shipment);
        });
    }

    handleReadyAtDateClick(event){
        event.preventDefault();
        this.readyDateSelector.show();
    }

    handleCertificatesClick(value) {
        this.certificatesSelector.show(value);
    }

    handleReadyAtDateSave(value){
        let shipment = _.cloneDeep(this.state.shipment);
        shipment.readyAtDate = value;
        this.setState({shipment: shipment});
        this.props.onupdate && this.props.onupdate(this.state.shipment);
    }

    handleCertificatesSave(value){
        let shipment = _.cloneDeep(this.state.shipment);
        shipment.adrClass = value.adrClass;
        shipment.certificatedLoad = value.certificatedLoad;
        shipment.specialLoad = value.specialLoad;
        this.setState({shipment: shipment});
        if (this.props.onupdate) {
            this.props.onupdate(this.state.shipment);
        } else {
            Notify.showError("No onupdate function");
        }
    }

    handleDeleteClick(event){
        event.preventDefault();
        if (this.props.ondelete) {
            Notify.confirm("Are you sure you want to delete shipment with code " + this.state.shipment.code + "?", () => this.props.ondelete(this.state.shipment));
        } else {
            Notify.showError("No ondelete function");
        }
    }

    handleCopyClick(event){
        event.preventDefault();
        this.copySelector.show();
    }

    handleCopyClickCallback(data) {
        OrderService.getNewShipmentCode().then(response => {
            let code = response.data;
            let shipment = _.cloneDeep(this.state.shipment);
            shipment.code = code;
            if (!data.copyReadyDate) {
                shipment.readyAtDate = null;
            }
            if (!data.copySender) {
                shipment.sender = null;
            }
            if (!data.copyPickupAppointment) {
                shipment.pickupAppointment = null;
            }
            if (!data.copyConsignee) {
                shipment.receiver = null;
            }
            if (!data.copyDeliveryAppointment) {
                shipment.deliveryAppointment = null;
            }
            if (!data.copyAdrAndCertificates) {
                shipment.adrClass = null;
                shipment.certificatedLoad = null;
                shipment.specialLoad = null;
            }
            if (!data.copyShipmentUnits) {
                shipment.shipmentUnits = [];
            }
            this.props.oncopy && this.props.oncopy(shipment);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    prepareState(shipment, projectData) {
        let state = {};
        state.shipment = shipment;
        state.projectData = projectData;
        if (!state.shipment.shipmentUnits) {
            state.shipment.shipmentUnits = [];
        } else {
            state.shipment.shipmentUnits.forEach(item => {
                if (!item.rowId) {
                    item.rowId = uuid.v4();
                }
            });
        }
        if (!state.projectData) {
            state.projectData = {};
        }
        state.rddErrorExist = shipment._rddErrorExist;

        this.setState(state);
    }

    renderDatesForAppointment(participantType, participantAppointment, handleAppointmentClick, handleAppointmentDelete) {

        let dateContent = "";
        let timezoneContent = "";

        let startDateFormatter = new DateFormatter(participantAppointment.start);

        dateContent = startDateFormatter.format(false, true, true, true, true, false, false);
        timezoneContent = startDateFormatter.timezone;

        let appEndDate;
        let endTZ;
        if (participantAppointment.end) {
            let endDateFormatter = new DateFormatter(participantAppointment.end);

            dateContent = dateContent + " - " + endDateFormatter.format(false, true, true, true, true, false, false);
            if (startDateFormatter.timezone != endDateFormatter.timezone ) {
                Notify.showError("Appointment timezones does not match");
                timezoneContent = timezoneContent + ", " + endDateFormatter.timezone;
            }
        }

        let errorContent = null;
            if(participantType == ShipmentCard.PARTICIPANT_TYPE_RECEIVER && this.state.rddErrorExist) {
                errorContent = <span className="uk-text-danger uk-text-bold uk-text-large">!!!</span>;
            }

        return (
            <Grid>
                <GridCell width="1-1" noMargin={true}>
                    <div className="uk-align-right">
                        <a href="#" onClick={(e) => handleAppointmentClick(e)}>{dateContent}</a>
                        {errorContent}
                    </div>
                </GridCell>
                <GridCell width="1-1" noMargin={true}>
                    <div className="uk-align-right">
                        <a href="#" onClick={(e) => handleAppointmentClick(e)}>{timezoneContent}</a>
                    </div>
                </GridCell>
                <GridCell width="1-1" noMargin={true}>
                    <div className="uk-align-right">
                        <a  className="uk-text-danger" href="#" onClick={(e) => handleAppointmentDelete(e)}>{super.translate("Delete Appointment")}</a>
                    </div>
                </GridCell>
            </Grid>
        )
    }

    renderDatesForReadyDate(handleAppointmentClick) {

        let shipment = this.state.shipment;


        let readyAtDateTimeContent;
        let readyAtDateTimeTZContent;

        if (shipment.readyAtDate) {
            let readyDateFormatted = new DateFormatter(shipment.readyAtDate);

            return (
                <Grid>
                    <GridCell width="1-1" noMargin={true}>
                        <div className="uk-align-right">
                            <span>{super.translate("Ready Date") + ": "}</span>
                            <a href="#" onClick={(e) => this.handleReadyAtDateClick(e)}>{readyDateFormatted.format(false, true, true, true, true, false, false)}</a>
                        </div>
                    </GridCell>
                    <GridCell width="1-1" noMargin={true}>
                        <div className="uk-align-right">
                            <a href="#" onClick={(e) => this.handleReadyAtDateClick(e)}>{readyDateFormatted.timezone}</a>
                        </div>
                    </GridCell>
                    <GridCell width="1-1" noMargin={true}>
                        <div className="uk-align-right">
                            <a href="#" onClick={(e) => handleAppointmentClick(e)}>{super.translate("Set Appointment")}</a>
                        </div>
                    </GridCell>
                </Grid>
            )
        } else {
            return (
                <Grid>
                    <GridCell width="1-1" noMargin={true}>
                        <div className="uk-align-right">
                            <a href="#" onClick={(e) => this.handleReadyAtDateClick(e)}>{"Set Ready Date"}</a>
                        </div>
                    </GridCell>
                </Grid>
            )
        }
    }

    renderDatesForRequestedDeliveryDate(handleAppointmentClick) {


        let shipment = this.state.shipment;

        if(!shipment.requestedDeliveryDate) {
            return <Grid>
                <GridCell width="1-1" noMargin={true}>
                    <div className="uk-align-right">
                        <a href="#" onClick={(e) => handleAppointmentClick(e)}>{super.translate("Set Appointment")}</a>
                    </div>
                </GridCell>
            </Grid>
        }

        let requestedDeliveryDate = new DateFormatter(shipment.requestedDeliveryDate);

        return (
            <Grid>
                <GridCell width="1-1" noMargin={true}>
                    <div className="uk-align-right">
                        <span>{super.translate("RDD") + ": "}</span>
                        <span>{requestedDeliveryDate.format(false, true, true, true, true, false, false)}</span>
                    </div>
                </GridCell>
                <GridCell width="1-1" noMargin={true}>
                    <div className="uk-align-right">
                        <span>{requestedDeliveryDate.timezone}</span>
                    </div>
                </GridCell>
                <GridCell width="1-1" noMargin={true}>
                    <div className="uk-align-right">
                        <a href="#" onClick={(e) => handleAppointmentClick(e)}>{super.translate("Set Appointment")}</a>
                    </div>
                </GridCell>
            </Grid>
        )
    }


    renderDates(participantType, participantAppointment, handleAppointmentClick, handleAppointmentDelete) {

        let content = null;

        if(participantAppointment && participantAppointment.start){
            return this.renderDatesForAppointment(participantType, participantAppointment, handleAppointmentClick, handleAppointmentDelete);
        } else {
            if(participantType == ShipmentCard.PARTICIPANT_TYPE_SENDER) {
               return this.renderDatesForReadyDate(handleAppointmentClick);
            } else if(participantType == ShipmentCard.PARTICIPANT_TYPE_RECEIVER) {
                return this.renderDatesForRequestedDeliveryDate(handleAppointmentClick);
            }
        }
        return null

    }

    generateLocationSummary(location){
        if(location){
            let countryCode = _.get(location, "postaladdress.country.iso") || "";
            let postalCode = _.get(location, "postaladdress.postalCode") || "";
            return location.name + "(" + countryCode + "-" + postalCode + ")";
        }else{
            return "...";
        }
    }
    renderParticipantItem(participantType, emptyText, handleSelectClick, handleUpdateClick, handleAppointmentClick, handleAppointmentDelete){

        let shipment = this.state.shipment;
        let participant = null;
        let participantAppointment = null;

        if(participantType == ShipmentCard.PARTICIPANT_TYPE_SENDER) {
            participant = shipment.sender;
            participantAppointment = shipment.pickupAppointment;
        } else if(participantType == ShipmentCard.PARTICIPANT_TYPE_RECEIVER) {
            participant = shipment.receiver;
            participantAppointment = shipment.deliveryAppointment;
        }

        let item = <a href="#" onClick = {(event) => handleSelectClick(event)}>{super.translate(emptyText)}</a>;
        if(participant){
            let company = participant.company ? participant.company.name : "";
            let contact = participant.companyContact ? participant.companyContact.fullname : "";
            let location = "";
            if (participant.locationOwnerCompany) {
                location = participant.locationOwnerCompany.name + " - " + this.generateLocationSummary(participant.location);
            }

            item = (<Grid>
                <GridCell width="1-1" noMargin = {true}>
                    <span className="md-list-heading"><a href="#" onClick = {(event) => handleUpdateClick(event)}>{company}</a></span>
                </GridCell>
                <GridCell width="1-1" noMargin = {true}>
                    <span className="uk-text-small uk-text-muted">{location}</span>
                </GridCell>
                <GridCell width="1-1" noMargin = {true}>
                    <span className="uk-text-small uk-text-muted">{contact}</span>
                </GridCell>
                <GridCell width="1-1" noMargin = {true}>
                        {this.renderDates(participantType, participantAppointment, handleAppointmentClick, handleAppointmentDelete)}
                </GridCell>
            </Grid>);
        }
        return item;
    }

    renderSpecialLoadAndCertificate(shipment){

        let certificates = super.translate("Select ADR & Certificates");

        if (shipment.adrClass) {
            certificates = shipment.adrClass.name;
        }

        let value = {
            adrClass: shipment.adrClass,
            certificatedLoad: shipment.certificatedLoad,
            specialLoad: shipment.specialLoad
        };

        return <a href="#" onClick = {() => this.handleCertificatesClick(value)}>{certificates}</a>;
    }

    renderShipmentUnitsSummary(shipment) {

        let shipmentUnitCount = 0;
        let totalCount = 0;
        let totalGrossWeightInKilograms = 0;
        let totalNetWeightInKilograms = 0;
        let totalVolumeInCubicMeters = 0;
        let totalLdm = 0;

        shipment.shipmentUnits.forEach(item => {

            shipmentUnitCount += 1;

            item.shipmentUnitPackages.forEach(sup => {
                totalCount += sup.count;
            });

            totalGrossWeightInKilograms += item.totalGrossWeightInKilograms;
            totalNetWeightInKilograms += item.totalNetWeightInKilograms;
            totalVolumeInCubicMeters += item.totalVolumeInCubicMeters;
            totalLdm += item.totalLdm;
        });

        if (shipmentUnitCount > 0) {
            return (
                <ul className="md-list">
                    <li>
                        <div className="md-list-content">
                            <span className="md-list-heading">{totalCount} Packages</span>
                        <span className="uk-text-small uk-text-muted">
                            <Grid>
                                <GridCell width="1-1" noMargin = {true}>
                                    <Grid>
                                        <GridCell width="1-2" noMargin = {true}>
                                            <span className="uk-text-small uk-text-muted">Gross Weight: {totalGrossWeightInKilograms} kg</span>
                                        </GridCell>
                                        <GridCell width="1-2" noMargin = {true}>
                                            <span className="uk-text-small uk-text-muted">Net Weight: {totalNetWeightInKilograms} kg</span>
                                        </GridCell>
                                        <GridCell width="1-2" noMargin = {true}>
                                            <span className="uk-text-small uk-text-muted">Volume: {totalVolumeInCubicMeters} m3</span>
                                        </GridCell>
                                        <GridCell width="1-2" noMargin = {true}>
                                            <span className="uk-text-small uk-text-muted">Ldm: {totalLdm} ldm</span>
                                        </GridCell>
                                         <GridCell width="1-2" noMargin = {true}>
                                            <span className="uk-text-small uk-text-muted">PayW: {shipment.payWeight}</span>
                                        </GridCell>
                                        <GridCell width="1-2" noMargin = {true}/>
                                        </Grid>
                                </GridCell>
                            </Grid>
                        </span>
                        </div>
                    </li>
                </ul>
            );
        } else {
            return ("");
        }
    }

    renderShipmentUnits(shipmentUnits) {
        if (_.size(shipmentUnits) > 0) {
            return (
                <Table headers={this.tableHeaders}
                       data={shipmentUnits}
                       actions={this.tableActions}
                       hover={true} />
            );
        } else {
            return ("");
        }
    }

    render() {
        let senderItem = this.renderParticipantItem(ShipmentCard.PARTICIPANT_TYPE_SENDER, "Select Sender", (e) => this.handleSelectSenderClick(e), (e) => this.handleUpdateSenderClick(e), (e) => this.handleSenderAppointmentClick(e), (e) => this.handleSenderAppointmentDelete(e));
        let receiverItem = this.renderParticipantItem(ShipmentCard.PARTICIPANT_TYPE_RECEIVER, "Select Consignee", (e) => this.handleSelectReceiverClick(e), (e) => this.handleUpdateReceiverClick(e), (e) => this.handleReceiverAppointmentClick(e), (e) => this.handleReceiverAppointmentDelete(e));
        let specialLoadAndCertificate = this.renderSpecialLoadAndCertificate(this.state.shipment);
        let shipmentUnitsSummary = this.renderShipmentUnitsSummary(this.state.shipment);
        let shipmentUnits = this.renderShipmentUnits(this.state.shipment.shipmentUnits);

        return (<div className="md-card md-card-hover md-card-overlay" ref = {(c) => this.card = c}>
            <div className="md-card-head md-bg-light-blue-600" style = {{height: "auto"}}>
                <div className="md-card-head-menu" data-uk-dropdown="{pos:'bottom-right'}">
                    <i className="md-icon material-icons md-icon-light">&#xE5D4;</i>
                    <div className="uk-dropdown uk-dropdown-small">
                        <ul className="uk-nav">
                            <li><a href="#" onClick = {(e) => this.handleCopyClick(e)}>{super.translate("Copy")}</a></li>
                            <li><a href="#" className="uk-text-danger" onClick = {(e) => this.handleDeleteClick(e)}>{super.translate("Delete")}</a></li>
                        </ul>
                    </div>
                </div>

                <h3 className="md-card-head-text md-color-white">
                    {super.translate("Shipment")} #{this.state.shipment.code}
                </h3>
            </div>
            <div className="md-card-content" style = {{height: "auto"}}>
                <ul className="md-list md-list-addon">
                    <li>
                        <div className="md-list-addon-element">
                            <i className="mdi mdi-36px mdi-ray-start-arrow"/>
                        </div>
                        <div className="md-list-content">
                            <Grid>
                                <GridCell width="1-1" noMargin = {true}>
                                    {senderItem}
                                </GridCell>
                            </Grid>
                        </div>
                    </li>
                    <li>
                        <div className="md-list-addon-element">
                            <i className="mdi mdi-36px mdi-ray-end"/>
                        </div>
                        <div className="md-list-content">
                            <Grid>
                                <GridCell width="1-1" noMargin = {true}>
                                    {receiverItem}
                                </GridCell>
                            </Grid>
                        </div>
                    </li>
                    <li>
                        <div className="md-list-addon-element">
                            <i className="mdi mdi-36px mdi-certificate"/>
                        </div>
                        <div className="md-list-content">
                            <Grid>
                                <GridCell width="1-1" noMargin = {true}>
                                    <Grid>
                                        <GridCell width="1-1" noMargin = {true}>
                                            {specialLoadAndCertificate}
                                        </GridCell>
                                    </Grid>
                                </GridCell>
                            </Grid>
                        </div>
                    </li>
                </ul>
                {shipmentUnitsSummary}
            </div>
            <div className="md-card-overlay-content">
                <div className="uk-clearfix md-card-overlay-header">
                    <i className="md-icon md-icon material-icons md-card-overlay-toggler"></i>
                    <h3>
                        <span className="uk-margin-large-right">{super.translate("Shipment Units")}</span>
                        <Button label="add new" style="success" size="small" waves = {true} onclick={(event) => this.handleClickAddShipmentUnit(event)}/>
                    </h3>

                </div>
                <div>
                    <Grid>
                        <GridCell width="1-1" noMargin = {true}>
                            <ul className="md-list">
                                {shipmentUnits}
                            </ul>
                        </GridCell>
                    </Grid>
                </div>
            </div>

            <ParticipantSelector ref={(c) => this.senderSelector = c}
                                 title="Select Sender"
                                 onsave={(sender) => this.handleSelectSenderSave(sender) }/>

            <ParticipantSelector ref={(c) => this.receiverSelector = c}
                                 title="Select Consignee"
                                 onsave={(receiver) => this.handleSelectReceiverSave(receiver) }/>

            <ShipmentUnitModal ref={(c) => this.shipmentUnitSelector = c}
                               onsave={(shipmentUnit) => this.handleShipmentUnitSave(shipmentUnit) }/>

            <AppointmentModal ref={(c) => this.senderAppointmentSelector = c}
                              timezone={this.state.shipment.sender ? this.state.shipment.sender.location.timezone : ""}
                              baseValue={{title: "Ready Date", value:this.state.shipment.readyAtDate}}
                              value={this.state.shipment.sender ? this.state.shipment.pickupAppointment : {}}
                              onsave={(value) => this.handleSenderAppointmentSave(value) }/>

            <AppointmentModal ref={(c) => this.receiverAppointmentSelector = c}
                              timezone={this.state.shipment.receiver ? this.state.shipment.receiver.location.timezone : ""}
                              baseValue={{title: "RDD", value:this.state.shipment.requestedDeliveryDate}}
                              value={this.state.shipment.receiver ? this.state.shipment.deliveryAppointment : {}}
                              onsave={(value) => this.handleReceiverAppointmentSave(value) }/>

            <ReadyDateModal ref={(c) => this.readyDateSelector = c}
                            timezone={this.state.timezone}
                            value={this.state.shipment.readyAtDate ? this.state.shipment.readyAtDate : this.state.shipment._defaultReadyAtDate}
                            onsave={(value) => this.handleReadyAtDateSave(value) }/>

            <CertificatesModal ref={(c) => this.certificatesSelector = c}
                               value={{
                                        adrClass: this.state.shipment.adrClass,
                                        certificatedLoad: this.state.shipment.certificatedLoad,
                                        specialLoad: this.state.shipment.specialLoad
                                      }}
                               onsave={(value) => this.handleCertificatesSave(value) }/>

            <ShipmentCardCopyModal ref={(c) => this.copySelector = c}
                                   onsave={(data) => this.handleCopyClickCallback(data) }/>

        </div>);
    }
}
ShipmentCard.contextTypes = {
    translator: React.PropTypes.object
};