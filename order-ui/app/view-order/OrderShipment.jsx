import * as axios from "axios";
import _ from "lodash";
import moment from "moment";
import PropTypes from 'prop-types';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, Notify, Span } from 'susam-components/basic';
import { Card, CardSubHeader, Grid, GridCell } from 'susam-components/layout';
import { Kartoteks, OrderService } from "../services";
import { AdrClassDetails } from "./AdrClassDetails";
import { ArrivalTRCustomsDetails } from "./ArrivalTRCustomsDetails";
import { ContactDetailsModal } from "./ContactDetailsModal";
import { DefinitionOfGoods } from './DefinitionOfGoods';
import { DepartureTRCustomsDetails } from "./DepartureTRCustomsDetails";
import { DocumentModal } from "./DocumentModal";
import { EquipmentRequirements } from "./EquipmentRequirements";
import { GeneralCustomsDetails } from "./GeneralCustomsDetails";
import { HealthCertificates } from "./HealthCertificates";
import { Incoterm } from "./Incoterm";
import { Insurance } from "./Insurance";
import { LoadingAppointmentEditModal } from "./LoadingAppointmentEditModal";
import { MiniLoader } from "./MiniLoader";
import { OrderNumbersModal } from "./OrderNumbersModal";
import { Path } from "./Path";
import { PaymentMethod } from "./PaymentMethod";
import { ReadyDateEditModal } from "./ReadyDateEditModal";
import { ShipmentUnitDetails } from "./ShipmentUnitDetails";
import { TemperatureLimits } from "./TemperatureLimits";
import { UnloadingAppointmentEditModal } from "./UnloadingAppointmentEditModal";
import { ValueOfGoods } from "./ValueOfGoods";
import { VehicleRequirements } from "./VehicleRequirements";
import { Manufacturer } from "./Manufacturer";
export class OrderShipment extends TranslatingComponent{

    shipmentDetails = [
        {
            label: "Shipment Details",
            render: (shipment)=>this.renderShipmentDetails(shipment)
        },
        {
            label: "Additional Info",
            render: (shipment)=>this.renderAdditionalDetails(shipment)
        }
    ];

    state = {lookup: {}, selectedContact: {}, contactDetails: {}, savingStatus: {}, detailsIndex: 0};

    formatter = new Intl.NumberFormat('tr-TR', {
        maximumFractionDigits: 2, minimumFractionDigits: 2
    });
    formatterNoFraction = new Intl.NumberFormat('tr-TR', {
        maximumFractionDigits: 0, minimumFractionDigits: 0
    });

    constructor(props){
        super(props);
    }

    componentDidMount(){

        let calls = [
            OrderService.getPaymentMethods(),
            OrderService.getDocumentTypesFiltered(null, 'HEALTH_CERTIFICATE,DANGEROUS_GOODS'),
            OrderService.getDocumentTypesFiltered('DANGEROUS_GOODS', null),
            OrderService.getDocumentTypesFiltered('HEALTH_CERTIFICATE', null)
        ];
        axios.all(calls).then(axios.spread((paymentTypes, documentTypes, dangerousLoadDocumentTypes, healthCertificateLoadDocumentTypes) => {
                let state = _.cloneDeep(this.state);
                state.lookup = {
                    paymentTypes: paymentTypes.data,
                    documentTypes: documentTypes.data,
                    dangerousLoadDocumentTypes: dangerousLoadDocumentTypes.data,
                    healthCertificateLoadDocumentTypes: healthCertificateLoadDocumentTypes.data
                };
                this.setState(state);
            }
        )).catch(error => Notify.showError(error));
    }

    componentWillReceiveProps(nextProps){
        if(this.props.shipment.id !== nextProps.shipment.id){
            this.clean();
        }
    }

    clean(){
        this.setState({
            selectedContact: {}, 
            contactDetails: {}, 
            customerOrderNumbers: null, 
            consigneeOrderNumbers: null, 
            senderOrderNumbers: null, 
            loadingOrderNumbers: null, 
            unloadingOrderNumbers: null, 
            shipmentDocuments: null
        });
    }

    filterHealthCertificateDocuments(){
        if(this.state.shipmentDocuments){
            return _.filter(this.state.shipmentDocuments, item => item.group.id === "HEALTH_CERTIFICATE");
        }
        return null;
    }

    handleNextDetails(){
        this.setState(prevState=>({detailsIndex: (prevState.detailsIndex + 1) % this.shipmentDetails.length}));
    }

    handlePreviosDetails(){
        this.setState(prevState=>({detailsIndex: (prevState.detailsIndex + this.shipmentDetails.length - 1) % this.shipmentDetails.length}));
    }

    getDetails(index){
        if(index){
            return this.shipmentDetails[(this.state.detailsIndex + this.shipmentDetails.length + index) % this.shipmentDetails.length];
        } else {
            return this.shipmentDetails[this.state.detailsIndex];
        }
    }

    handleClickCustomerOrderNumbers(){
        if(this.state.customerOrderNumbers){
            this.customerOrderNumbers.open();
            return;
        }
        OrderService.getCustomerOrderNumbers(this.props.shipment.id).then(response => {
            this.setState({customerOrderNumbers: response.data}, () => this.customerOrderNumbers.open());
        }).catch(error => Notify.showError(error));
    }

    handleClickSenderOrderNumbers(){
        if(this.state.senderOrderNumbers){
            this.senderOrderNumbers.open();
            return;
        }
        OrderService.getSenderOrderNumbers(this.props.shipment.id).then(response => {
            this.setState({senderOrderNumbers: response.data}, () => this.senderOrderNumbers.open());
        }).catch(error => Notify.showError(error));
    }

    handleClickLoadingOrderNumbers(){
        if(this.state.loadingOrderNumbers){
            this.loadingOrderNumbers.open();
            return;
        }
        OrderService.getLoadingOrderNumbers(this.props.shipment.id).then(response => {
            this.setState({loadingOrderNumbers: response.data}, () => this.loadingOrderNumbers.open());
        }).catch(error => Notify.showError(error));
    }
    
    handleClickConsigneeOrderNumbers(){
        if(this.state.consigneeOrderNumbers){
            this.consigneeOrderNumbers.open();
            return;
        }
        OrderService.getConsigneeOrderNumbers(this.props.shipment.id).then(response => {
            this.setState({consigneeOrderNumbers: response.data}, () => this.consigneeOrderNumbers.open());
        }).catch(error => Notify.showError(error));
    }

    handleClickUnloadingOrderNumbers() {
        if (this.state.unloadingOrderNumbers) {
            this.unloadingOrderNumbers.open();
            return;
        }
        OrderService.getUnloadingOrderNumbers(this.props.shipment.id).then(response => {
            this.setState({ unloadingOrderNumbers: response.data }, () => this.unloadingOrderNumbers.open());
        }).catch(error => Notify.showError(error));
    }

    handleClickShipmentDocuments(){
        if(this.state.shipmentDocuments){
            this.shipmentDocuments.open();
            return;
        }
        OrderService.getShipmentDocuments(this.props.shipment.id).then(response => {
            this.setState({shipmentDocuments: response.data}, () => this.shipmentDocuments.open());
        }).catch(error => Notify.showError(error));
    }

    handleClickContact(contact){
        if(this.state.contactDetails[contact.id]){
            this.setState({selectedContact: contact}, () => this.contactDetailsModal.open());
            return;
        }
        Kartoteks.getContactDetails(contact.id).then(response => {
            let contactDetails = _.cloneDeep(this.state.contactDetails) || {};
            contactDetails[response.data.id] = response.data;
            this.setState({contactDetails: contactDetails, selectedContact: contact}, () => this.contactDetailsModal.open());
        }).catch(error => Notify.showError(error));
    }

    handleSaveCustomerOrderNumbers(value){
        this.setState({savingStatus: {customerOrderNumbers: true}});
        OrderService.updateCustomerOrderNumbers(this.props.shipment.id, value).then(response => {
            Notify.showSuccess("Customer order numbers saved");
            this.setState({
                customerOrderNumbers: response.data
            });
        }).catch(error => Notify.showError(error)).then(() => this.setState({savingStatus: {}}));
    }
    handleSaveSenderOrderNumbers(value){
        this.setState({savingStatus: {senderOrderNumbers: true}});
        OrderService.updateSenderOrderNumbers(this.props.shipment.id, value).then(response => {
            Notify.showSuccess("Sender order numbers saved");
            this.setState({
                senderOrderNumbers: response.data
            });
        }).catch(error => Notify.showError(error)).then(() => this.setState({savingStatus: {}}));
    }

    handleSaveLoadingOrderNumbers(value){
        this.setState({savingStatus: {loadingOrderNumbers: true}});
        OrderService.updateLoadingOrderNumbers(this.props.shipment.id, value).then(response => {
            Notify.showSuccess("Loading order numbers saved");
            this.setState({
                loadingOrderNumbers: response.data
            });
        }).catch(error => Notify.showError(error)).then(() => this.setState({savingStatus: {}}));
    }

    handleSaveConsigneeOrderNumbers(value){
        this.setState({savingStatus: {consigneeOrderNumbers: true}});
        OrderService.updateConsigneeOrderNumbers(this.props.shipment.id, value).then(response => {
            Notify.showSuccess("Consignee order numbers saved");
            this.setState({
                consigneeOrderNumbers: response.data
            });
        }).catch(error => Notify.showError(error)).then(() => this.setState({savingStatus: {}}));
    }
    
    handleSaveUnloadingOrderNumbers(value){
        this.setState({savingStatus: {unloadingOrderNumbers: true}});
        OrderService.updateUnloadingOrderNumbers(this.props.shipment.id, value).then(response => {
            Notify.showSuccess("Unloading order numbers saved");
            this.setState({
                unloadingOrderNumbers: response.data
            });
        }).catch(error => Notify.showError(error)).then(() => this.setState({savingStatus: {}}));
    }

    handleDeleteDocument(document){
        this.setState({savingStatus: {shipmentDocuments: true}});
        OrderService.deleteOrderShipmentDocument(this.props.shipment.id, document.id).then(response => {
            this.setState({shipmentDocuments: response.data}, () => Notify.showSuccess("Document deleted"));
        }).catch(error => Notify.showError(error)).then(() => this.setState({savingStatus: {}}));
    }
    handleSaveDocument(documents){
        this.setState({savingStatus: {shipmentDocuments: true}});
        OrderService.saveOrderShipmentDocuments(this.props.shipment.id, documents).then(response => {
            this.setState({shipmentDocuments: response.data}, () => Notify.showSuccess("Document saved"));
        }).catch(error => Notify.showError(error)).then(() => this.setState({savingStatus: {}}));
    }
    handleSaveReadyDate(value){
        this.props.onSaveReadyDate(value);
    }
    handleSaveLoadingAppointment(value){
        this.props.onSaveLoadingAppointment(value);
    }
    handleSetReadyDate(){
        this.readyDateModal.open();
    }
    handleDeleteUnloadingAppointment(){
        this.props.onDeleteUnloadingAppointment();
    }
    handleSaveUnloadingAppointment(value){
        this.props.onSaveUnloadingAppointment(value);
    }
    handleClickReadyDateEdit(){
        this.readyDateModal.open();
    }
    handleSetAppointment(){
        this.loadingAppointmentModal.open();
    }
    handleClickLoadingAppointmentEdit(){
        this.loadingAppointmentModal.open();
    }
    handleClickCreateUnloadingAppointment(){
        this.unloadingAppointmentModal.open();
    }
    handleClickUnloadingAppointmentEdit(){
        this.unloadingAppointmentModal.open();
    }

    handleSaveIncoterm(value){
        this.props.onSaveIncoterm(value);
    }
    handleSavePaymentMethod(value){
        this.props.onSavePaymentMethod(value);
    }
    handleSaveInsurance(value){
        this.props.onSaveInsurance(value);
    }
    handleSaveValueOfGoods(value){
        this.props.onSaveValueOfGoods(value);
    }

    handleSaveShipmentUnitDetails(request){
        this.props.onSaveUnitDetails(request);
    }
    handleDeleteShipmentUnitDetails(details){
        console.log("handleDeleteShipmentUnitDetails", details);
    }

    handleSaveDefinitionOfGoods(request){
        this.props.onSaveDefinitionOfGoods(request);
    }

    handleSaveAdrDetails(shipmentAdrDetails){
        this.props.onSaveAdrDetails(shipmentAdrDetails);
    }

    handleDeleteAdrDetails(shipmentAdrDetailsId){
        this.props.onDeleteAdrDetails(shipmentAdrDetailsId);
    }

    handleSaveDepartureCustomsDetails(customsDetails){
        this.props.onSaveDepartureCustoms && this.props.onSaveDepartureCustoms(customsDetails);
    }

    handleSaveArrivalCustomsDetails(customsDetails){
        this.props.onSaveArrivalCustoms && this.props.onSaveArrivalCustoms(customsDetails);
    }

    handleSaveVehicleRequirements(requirements){
        this.props.onSaveVehicleRequirements && this.props.onSaveVehicleRequirements(requirements);
    }

    handleSaveEquipmentRequirement(requirement){
        this.props.onSaveEquipmentRequirement && this.props.onSaveEquipmentRequirement(requirement);
    }
    handleDeleteEquipmentRequirement(requirementId){
        this.props.onDeleteEquipmentRequirement && this.props.onDeleteEquipmentRequirement(requirementId);
    }
    handleSaveHealthCertificate(certificates){
        this.props.onSaveHealthCertificates && this.props.onSaveHealthCertificates(certificates);
    }

    handleSaveTemperatureLimits(limits){
        this.props.onSaveTemperatureLimits && this.props.onSaveTemperatureLimits(limits);
    }

    handleSaveManufacturer(manufacturer){
        this.props.onSaveManufacturer && this.props.onSaveManufacturer(manufacturer);
    }

    handleDeleteManufacturer(){
        this.props.onDeleteManufacturer && this.props.onDeleteManufacturer();
    }

    isShipmentHasDangerousLoad(shipment){
        return shipment.adrDetails && shipment.adrDetails.length > 0;
    }
    isShipmentHasHealthCertificateLoad(shipment){
        return shipment.healthCertificateTypes && shipment.healthCertificateTypes.length > 0
    }
    isShipmentHasTemperatureControlledLoad(shipment){
        return !_.isNil(shipment.temperatureMinValue);
    }

    getLatestReadyDate(readyDateText){
        let format = "DD/MM/YYYY HH:mm";

        let [date, time, timezone] = readyDateText.split(" ");
        let readyDate =  moment(readyDateText,"DD/MM/YYYY HH:mm Z");
        let workingHours = this.props.senderWarehouse && this.props.senderWarehouse.establishment.workingHours;
        if(workingHours){
            let weekDayName = readyDate.format('dddd');
            let latestTime = _.find(workingHours, i=>_.isEqual(_.lowerCase(i.day.code), _.lowerCase(weekDayName)));
            if(latestTime && !_.isEmpty(latestTime.timeWindows)){
                let [hour, minute] = _.max(latestTime.timeWindows.map(i=>i.endTime)).split(":");
                return _.cloneDeep(readyDate).set({hour: hour, minute: minute }).format(format) + " " + timezone;
            }
        }
    }

    getReadyDate(readyDate){
        return this.getAppointmentDate({startDateTime: readyDate, endDateTime: this.getLatestReadyDate(readyDate)})
    }

    getAppointmentDate(appointment){
        if(!appointment || !appointment.startDateTime){
            return "";
        }
        let result = "";
        let [startDate, startTime, startTimezone] = appointment.startDateTime.split(" ");
        if(appointment.endDateTime){
            let [endDate, endTime, endTimezone] = appointment.endDateTime.split(" ");
            if(endDate === startDate){
                result = startDate + " " + startTime + "-" + endTime;
            }else{
                result = startDate + " " + startTime + "-" + endDate + " " + endTime;
            }
        }else{
            result = startDate + " " + startTime;
        }
        result = result + " " + startTimezone;
        return result;
    }
    renderReadyDateEditButton(shipment){
        if(shipment.readyAtDate && this.props.editable){
            return <Button label = "edit ready date" style = "primary" flat = {true} size = "small"
                           onclick = {() => this.handleClickReadyDateEdit()} />
        }
        if(shipment.loadingAppointment && this.props.editable){
            return <Button label = "edit Appointment" style = "primary" flat = {true} size = "small"
                           onclick = {() => this.handleClickLoadingAppointmentEdit()} />
        }
    }
    renderDeliveryDateEditButton(shipment){
        if(this.props.editable){
            if(shipment.unloadingAppointment){
                return <Button label = "Edit Appointment" style = "primary" flat = {true} size = "small"
                               onclick = {() => this.handleClickUnloadingAppointmentEdit()} />
            }else{
                return <Button label = "Create Appointment" style = "primary" flat = {true} size = "small"
                               onclick = {() => this.handleClickCreateUnloadingAppointment()} />
            }
        }
        return null;
    }
    renderReadyDate(shipment){
        if(this.props.savingStatus.readyDate){
            return (
                <div style = {{clear: "both", marginTop: "12px"}}>
                    <div style = {{width: "24px", float: "left", marginRight: "8px"}}>
                        <i className = "material-icons" >date_range</i>
                    </div>
                    <div style = {{marginLeft: "32px"}}>
                        <MiniLoader title="saving..."/>
                    </div>
                </div>
            );
        }
        let dateTime = shipment.loadingAppointment ? this.getAppointmentDate(shipment.loadingAppointment) : this.getReadyDate(shipment.readyAtDate);
        return(
            <div style = {{clear: "both", marginTop: "12px"}}>
                <div style = {{width: "24px", float: "left", marginRight: "8px"}}>
                    <i className = "material-icons" >date_range</i>
                </div>
                <div style = {{marginLeft: "32px"}}>
                    <span>{dateTime}</span>
                    {shipment.loadingAppointment ? <i className="material-icons uk-margin-small-left" style={{ color: "red" }}
                                                          title = {super.translate("Has appointment")} data-uk-tooltip="{pos:'bottom'}">alarm</i> : ""}
                </div>
                <div style = {{marginLeft: "32px", marginTop: "12px"}}>
                    {this.renderReadyDateEditButton(shipment)}
                </div>
            </div>
        );
    }
    renderDeliveryDate(shipment){
        if(this.props.savingStatus.deliveryDate){
            return (
                <div style = {{clear: "both", marginTop: "12px"}}>
                    <div style = {{width: "24px", float: "left", marginRight: "8px"}}>
                        <i className = "material-icons" >date_range</i>
                    </div>
                    <div style = {{marginLeft: "32px"}}>
                        <MiniLoader title="saving..."/>
                    </div>
                </div>
            );
        }
        let dateTime = shipment.unloadingAppointment ? this.getAppointmentDate(shipment.unloadingAppointment) : shipment.deliveryDate;
        return(
            <div style = {{clear: "both", marginTop: "12px"}}>
                <div style = {{width: "24px", float: "left", marginRight: "8px"}}>
                    <i className = "material-icons" >date_range</i>
                </div>
                <div style = {{marginLeft: "32px"}}>
                    <span>{dateTime}</span>
                    {shipment.unloadingAppointment ? <i className="material-icons uk-margin-small-left" style={{ color: "red" }}
                                                            title={super.translate("Has Appointment")} data-uk-tooltip="{pos:'bottom'}">alarm</i> : ""}
                </div>
                <div style = {{marginLeft: "32px", marginTop: "12px"}}>
                    {this.renderDeliveryDateEditButton(shipment)}
                </div>
            </div>
        );
    }

    renderCustomerOrderNumbers(){
        if(this.state.savingStatus.customerOrderNumbers){
            return (
                <div className="uk-margin-top">
                    <MiniLoader title="saving..."/>
                </div>
            );
        }
        return  <Button label = "#Customer" flat = {true} style = "primary" onclick = {() => this.handleClickCustomerOrderNumbers()}/>;
    }
    renderSenderOrderNumbers(){
        if(this.state.savingStatus.senderOrderNumbers){
            return (
                <div className="uk-margin-top">
                    <MiniLoader title="saving..."/>
                </div>
            );
        }
        return (
            <div className="uk-margin-top">
                <Button label = "#Sender" flat = {true} style = "primary" onclick = {() => this.handleClickSenderOrderNumbers()}/>
            </div>
        );
    }
    renderLoadingOrderNumbers(){
        if(this.state.savingStatus.loadingOrderNumbers){
            return (
                <div className="uk-margin-top">
                    <MiniLoader title="saving..."/>
                </div>
            );
        }
        return (
            <div className="uk-margin-top">
                <Button label = "#Loading" flat = {true} style = "primary" onclick = {() => this.handleClickLoadingOrderNumbers()}/>
            </div>
        );
    }
    renderConsigneeOrderNumbers(){
        if(this.state.savingStatus.consigneeOrderNumbers){
            return (
                <div className="uk-margin-top">
                    <MiniLoader title="saving..."/>
                </div>
            );
        }
        return (
            <div className="uk-margin-top">
                <Button label = "#Consignee" flat = {true} style = "primary" onclick = {() => this.handleClickConsigneeOrderNumbers()}/>
            </div>
        );
    }
    renderUnloadingOrderNumbers() {
        if (this.state.savingStatus.unloadingOrderNumbers) {
            return (
                <div className="uk-margin-top">
                    <MiniLoader title="saving..." />
                </div>
            );
        }
        return (
            <div className="uk-margin-top">
                <Button label="#Unloading" flat={true} style="primary" onclick={() => this.handleClickUnloadingOrderNumbers()} />
            </div>
        );
    }

    renderParty(party){
        if(!party){
            return null;
        }
        let handlingCompanyComponent = _.get(party, "company.id") !== _.get(party, "handlingCompany.id") && <div className = "uk-text-truncate uk-text-small">{_.get(party, "handlingCompany.name")}</div>;
        let companyLocationComponent = _.get(party, "companyLocation.id") !== _.get(party, "handlingLocation.id") && <div className = "uk-text-truncate uk-text-small">{_.get(party, "companyLocation.name")}</div>;
        return (
            <div style = {{position: "relative"}}>
                <div className = "uk-text-bold">
                    <div className = "uk-text-truncate">{_.get(party, "company.name")}</div>
                    {companyLocationComponent}
                </div>
                {this.renderContact(party.companyContact)}
                <div style = {{clear: "both", marginTop: "12px"}}>
                    <div style = {{width: "24px", float: "left", marginRight: "8px"}}>
                        <i className = "material-icons" >place</i>
                    </div>
                    <div style = {{marginLeft: "32px", width: "90%"}}>
                        <span className = "uk-text-truncate" style = {{opacity: .8}}>{_.get(party, "handlingLocation.name")}</span>
                        <span className = "uk-text-truncate">{handlingCompanyComponent}</span>
                    </div>
                </div>
                {this.renderContact(party.handlingContact)}
            </div>
        );
    }
    renderContact(contact){
        if(!contact){
            return null;
        }
        return(
            <div style = {{clear: "both"}}>
                <div style = {{width: "24px", float: "left", marginRight: "8px"}}>
                    <i className = "material-icons" >perm_contact_calendar</i>
                </div>
                <div style = {{marginLeft: "32px"}}>
                    <span><a href = "#" onClick = {() => this.handleClickContact(contact)}>{contact.name}</a></span>
                </div>
            </div>
        );
    }
    renderSender(shipment){
        return (
            <div style = {{border: "1px solid #c0c0c0", borderRadius: "3px", padding: "12px", background: "rgb(250, 250, 250)", minHeight: "180px"}}>
                <div style = {{width: "36px", float: "left", marginRight: "8px"}}>
                    <i className="material-icons md-36">file_upload</i>
                </div>
                <div style = {{marginLeft: "44px", width: "90%"}}>
                    {this.renderParty(shipment.sender)}
                    {this.renderReadyDate(shipment)}
                </div>

            </div>
        );
    }
    renderConsignee(shipment){
        return (
            <div style = {{border: "1px solid #c0c0c0", borderRadius: "3px", padding: "12px", background: "rgb(250, 250, 250)", minHeight: "180px"}}>
                <div style = {{width: "36px", float: "left", marginRight: "8px"}}>
                    <i className="material-icons md-36">file_download</i>
                </div>
                <div style = {{marginLeft: "44px", width: "90%"}}>
                    {shipment.consignee ? this.renderParty(shipment.consignee) : "Not Selected"}
                    {this.renderDeliveryDate(shipment)}
                </div>
            </div>
        );
    }
    renderIncoterm(shipment){
        return (
            <Incoterm value = {shipment.incoterm} shipmentId = {shipment.id}
                      editable = {this.props.editable}
                      template = {this.props.template}
                      onSave = {(value) => this.handleSaveIncoterm(value)} />
        );
    }
    renderValueOfGoods(shipment){
        return(
            <ValueOfGoods amount = {shipment.valueOfGoods} currency = {shipment.valueOfGoodsCurrency}
                          shipmentId = {shipment.id}
                          editable = {this.props.editable}
                          template = {this.props.template}
                          onSave = {(value) => this.handleSaveValueOfGoods(value)} />
        );
    }
    renderInsurance(shipment){
        return(
            <Insurance value = {shipment.insured} shipmentId = {shipment.id}
                       editable = {this.props.editable}
                       onSave = {(value) => this.handleSaveInsurance(value)}/>
        );
    }
    renderPaymentMethod(shipment){
        return (
            <PaymentMethod value = {shipment.paymentMethod} shipmentId = {shipment.id}
                           editable = {this.props.editable}
                           template = {this.props.template}
                           onSave = {(value) => this.handleSavePaymentMethod(value)} />
        );
    }

    renderLoadRequirementsAndSpecs(shipment){
        let heavyLoad = shipment.heavyLoad ?
            <i className = "mdi mdi-24px mdi-weight-kilogram uk-margin-right uk-text-contrast icon-in-box"
               data-uk-tooltip="{pos:'bottom'}" title={super.translate("Heavy Load")}/> : null;
        let valuableLoad = shipment.valuableLoad ?
            <i className = "mdi mdi-24px mdi-currency-usd uk-margin-right uk-text-contrast icon-in-box"
               data-uk-tooltip="{pos:'bottom'}" title={super.translate("Valuable Load")}/> : null;
        let longLoad = null;
        if(shipment.longLoad){
            longLoad = <i className = "mdi mdi-24px mdi-arrow-expand uk-margin-right uk-text-contrast icon-in-box"
                          data-uk-tooltip="{pos:'bottom'}" title={super.translate("Long Load")}/>
        }
        let oversizeLoad = null;
        if(shipment.oversizeLoad){
            oversizeLoad = <i className = "mdi mdi-24px mdi-star-circle uk-margin-right uk-text-contrast icon-in-box"
                              data-uk-tooltip="{pos:'bottom'}" title={super.translate("Oversize")}/>
        }
        let hangingLoad = null;
        if(shipment.hangingLoad){
            hangingLoad = <i className = "mdi mdi-24px mdi-hanger uk-margin-right uk-text-contrast icon-in-box"
                             data-uk-tooltip="{pos:'bottom'}" title={super.translate("Hanging Load")}/>
        }
        return(
            <div className = "uk-text-center">
                {heavyLoad}
                {valuableLoad}
                {longLoad}
                {oversizeLoad}
                {hangingLoad}
            </div>
        );
    }
    renderLoadTotals(shipment){
        let groups = shipment.packageGroups && shipment.packageGroups.length > 0 ?
            shipment.packageGroups.map(group => group.name).map(name => <div key = {name} className = "uk-text-small">{name}</div>) :
            <div key = "type-unknown" className = "uk-text-small">Unknown</div>;
        let weight =
            <div className = "uk-float-left uk-margin-large-right">
                <i className = "mdi mdi-24px mdi-weight-kilogram uk-margin-small-right uk-text-muted"
                   title="Gross Weight" data-uk-tooltip="{pos:'bottom'}" />
                <span className = "heading_a">
                    {shipment.grossWeight ? (this.formatterNoFraction.format(shipment.grossWeight) + " kg") : "N/A"}
                    </span>
            </div>;
        let volume =
            <div className = "uk-float-left uk-margin-large-right">
                <i className = "mdi mdi-24px mdi-cube-outline uk-margin-small-right uk-text-muted"
                   title="Volume" data-uk-tooltip="{pos:'bottom'}" />
                <span className = "heading_a">
                    {shipment.totalVolume ? (this.formatter.format(shipment.totalVolume) + " m³") : "N/A"}
                    </span>
            </div>;
        let ldm =
            <div className = "uk-float-left uk-margin-large-right">
                <i className = "mdi mdi-24px mdi-cube-unfolded uk-margin-small-right uk-text-muted"
                   title="LDM" data-uk-tooltip="{pos:'bottom'}"/>
                <span className = "heading_a">
                    {shipment.totalLdm ? (this.formatter.format(shipment.totalLdm) + " ldm") : "N/A"}
                    </span>
            </div>;
        return(
            <div className = "uk-text-center">
                <div className = "uk-float-left uk-margin-large-right">
                    <span className = "heading_a">{shipment.totalQuantity || "0"}</span>
                    {groups}
                </div>
                {weight}
                {volume}
                {ldm}
            </div>
        );

    }

    renderDepartureCustoms(shipment){
        if(!this.props.showCustomsInfo){
            return null;
        }
        let customsDetails = null;
        if(shipment.sender.handlingLocationCountryCode === "TR"){
            customsDetails = <DepartureTRCustomsDetails sender = {shipment.sender} customsDetails = {shipment.departureCustoms}
                                                        editable = {this.props.editable}
                                                        busy = {this.props.savingStatus.departureCustoms}
                                                        onSave = {(value) => this.handleSaveDepartureCustomsDetails(value)}/>
        }else{
            customsDetails = <GeneralCustomsDetails sender = {shipment.sender} customsDetails = {shipment.departureCustoms}
                                                    editable = {this.props.editable} departure = {true}
                                                    busy = {this.props.savingStatus.departureCustoms}
                                                    onSave = {(value) => this.handleSaveDepartureCustomsDetails(value)}/>
        }

        return (
            <div className="uk-margin-top">
                <span className = "label">{super.translate("Departure Customs")}</span>
                {customsDetails}
            </div>
        );
    }
    renderArrivalCustoms(shipment){
        if(!this.props.showCustomsInfo){
            return null;
        }
        let customsDetails = null;
        if(shipment.consignee.handlingLocationCountryCode === "TR"){
            customsDetails = <ArrivalTRCustomsDetails customsDetails = {shipment.arrivalCustoms} editable = {this.props.editable}
                                                      busy = {this.props.savingStatus.arrivalCustoms} consignee = {shipment.consignee}
                                                      hasDangerousLoad = {this.isShipmentHasDangerousLoad(this.props.shipment)}
                                                      hasTemperatureControlledLoad = {this.isShipmentHasTemperatureControlledLoad(this.props.shipment)}
                                                      onSave = {(value) => this.handleSaveArrivalCustomsDetails(value)}/>
        }else{
            customsDetails = <GeneralCustomsDetails customsDetails = {shipment.arrivalCustoms} editable = {this.props.editable} arrival = {true}
                                                    busy = {this.props.savingStatus.arrivalCustoms} consignee = {shipment.consignee}
                                                    onSave = {(value) => this.handleSaveArrivalCustomsDetails(value)}/>
        }
        return (
            <div className="uk-margin-top">
                <span className = "label">{super.translate("Arrival Customs")}</span>
                {customsDetails}
            </div>
        );
    }

    wrapWithCardHeader(title, content, toolbar){
        return(
            <Grid>
                <GridCell width = "1-1" noMargin = {true}>
                    <CardSubHeader title={title} toolbar = {toolbar} />
                </GridCell>
                {content}
            </Grid>
        );
    }
    renderVehicleRequirements(shipment){
        if(!shipment.vehicleRequirements){
            return this.wrapWithCardHeader("Vehicle Requirements", [<span key = "no-data" className="uk-text-muted" style = {{marginTop: "12px"}}>{super.translate("No vehicle requirements")}</span>]);
        }
        let collectionRequirements = _.filter(shipment.vehicleRequirements, item => {
            return item.operationType.id === "COLLECTION";
        });
        let distributionRequirements = _.filter(shipment.vehicleRequirements, item => {
            return item.operationType.id === "DISTRIBUTION";
        });

        if(collectionRequirements.length === 0 && distributionRequirements.length === 0){
            return this.wrapWithCardHeader("Vehicle Requirements", [<span key = "no-data" className="uk-text-muted" style = {{marginTop: "12px"}}>{super.translate("No vehicle requirements")}</span>]);
        }
        let requiredForLoading = collectionRequirements.length > 0 ?
            <span>{collectionRequirements.map(item => item.requirement.name).join(",")}</span>
            : null;

        let requiredForUnloading = distributionRequirements.length > 0 ?
            <span>{distributionRequirements.map(item => item.requirement.name).join(",")}</span>
            : null;
        return this.wrapWithCardHeader("Vehicle Requirements", [
            <GridCell key = "loading" width = "1-3">
                <span className="uk-text-bold">{super.translate("Loading")}</span>
            </GridCell>,
            <GridCell key = "required-loading" width = "2-3">
                {requiredForLoading}
            </GridCell>,
            <GridCell key = "unloading" width = "1-3">
                <span className="uk-text-bold">{super.translate("Unloading")}</span>
            </GridCell>,
            <GridCell key = "required-unloading" width = "2-3">
                {requiredForUnloading}
            </GridCell>
        ]);
    }
    renderEquipmentRequirements(shipment){
        if(!shipment.equipmentRequirements || shipment.equipmentRequirements.length === 0){
            return this.wrapWithCardHeader("Equipment Requirements", [<span key = "no-data" className="uk-text-muted" style = {{marginTop: "12px"}}>{super.translate("No equipment requirements")}</span>]);
        }
        return this.wrapWithCardHeader("Equipment Requirements",
            shipment.equipmentRequirements.map(item => this.renderEquipmentRequirementItem(item)));
    }
    renderEquipmentRequirementItem(item){
        return(
            <GridCell key = {item.equipment.id} width = "1-1">
                <span>{item.count}</span>
                <span style = {{marginLeft: "8px"}}>{item.equipment ? item.equipment.name : ""}</span>
            </GridCell>
        );
    }

    renderTempControlled(shipment){
        if(_.isNil(shipment.temperatureMinValue) && _.isNil(shipment.temperatureMaxValue)){
            return this.wrapWithCardHeader("Temperature Controlled", [<span key = "no-data" className="uk-text-muted" style = {{marginTop: "12px"}}> {super.translate("No temperature controlled load")}</span>]);
        }
        if(!_.isNil(shipment.temperatureMinValue) && _.isNil(shipment.temperatureMaxValue)){
            return this.wrapWithCardHeader("Temperature Controlled", [
                <GridCell key = "fix" width = "1-2">
                    <Span label = "Fixed" value = {shipment.temperatureMinValue + " °C"} />
                </GridCell>
            ]);
        }
        return this.wrapWithCardHeader("Temperature Controlled", [
            <GridCell key = "min" width = "1-2">
                <Span label = "Minimum" value = {shipment.temperatureMinValue + " °C"} />
            </GridCell>,
            <GridCell key = "max" width = "1-2">
                <Span label = "Maximum" value = {_.isNil(shipment.temperatureMaxValue) ? "N/A" : (shipment.temperatureMaxValue + " °C")} />
            </GridCell>
        ]);
    }

    renderApplicationIds(shipment){
        let ids = [];
        for(let key in shipment.mappedIds){
            ids.push(<h5 key={key} style={{margin: "0"}}>{ _.capitalize(key) + ": " + shipment.mappedIds[key]}</h5>);
        }
        return ids;
    }

    renderShipmentDetails(shipment) {
        return (
            <Grid divider={true}>
                <GridCell width="1-4">
                    <Grid>
                        <GridCell width="1-1" noMargin={true}>
                            <VehicleRequirements requirements={shipment.vehicleRequirements} editable={this.props.editable}
                                busy={this.props.savingStatus.vehicleRequirements}
                                onSave={(requirements) => this.handleSaveVehicleRequirements(requirements)} />

                        </GridCell>
                        <GridCell width="1-1">
                            <EquipmentRequirements requirements={shipment.equipmentRequirements} editable={this.props.editable}
                                equipmentRequirementsByWarehouse={this.props.equipmentRequirementsByWarehouse}
                                busy={this.props.savingStatus.equipmentRequirements}
                                onSave={(requirement) => this.handleSaveEquipmentRequirement(requirement)}
                                onDelete={(requirementId) => this.handleDeleteEquipmentRequirement(requirementId)} />
                        </GridCell>
                    </Grid>
                </GridCell>
                <GridCell width="1-4">
                    <HealthCertificates certificates={shipment.healthCertificateTypes} shipmentId={shipment.id}
                        documentTypes={this.state.lookup.healthCertificateLoadDocumentTypes}
                        documents={this.filterHealthCertificateDocuments()}
                        borderCustoms={shipment.borderCustoms}
                        borderCrossingHealthCheck={shipment.borderCrossingHealthCheck}
                        senderTemplate={this.props.senderTemplate}
                        editable={this.props.editable}
                        busy={this.props.savingStatus.healthCertificates}
                        onSave={(certificates) => this.handleSaveHealthCertificate(certificates)} />
                </GridCell>
                <GridCell width="1-4">
                    <AdrClassDetails shipment={shipment} editable={this.props.editable} busy={this.props.savingStatus.shipmentAdr}
                        senderTemplate={this.props.senderTemplate} canAddAdrDetails={this.props.dangerousSupported}
                        onSave={(shipmentAdrDetails) => this.handleSaveAdrDetails(shipmentAdrDetails)}
                        onDelete={(shipmentAdrDetailsId) => this.handleDeleteAdrDetails(shipmentAdrDetailsId)} />
                </GridCell>
                <GridCell width="1-4">
                    <TemperatureLimits minValue={shipment.temperatureMinValue} maxValue={shipment.temperatureMaxValue}
                        canAddTemperatureLimits={this.props.temperatureControlledSupported}
                        editable={this.props.editable} busy={this.props.savingStatus.temperatureLimits}
                        onSave={value => this.handleSaveTemperatureLimits(value)} />
                </GridCell>
            </Grid>
        );
    }

    renderAdditionalDetails(shipment) {
        return (
            <Grid divider={true}>
                <GridCell width="1-4">
                    <Manufacturer value={shipment.manufacturer} 
                        options = {this.props.manufacturerOptions}
                        busy={this.props.savingStatus.manufacturer}
                        editable={this.props.editable} 
                        onSave={value => this.handleSaveManufacturer(value)}
                        onDelete={()=>this.handleDeleteManufacturer()} 
                    />
                </GridCell>
            </Grid>
        );
    }

    render(){
        let {shipment} = this.props;
        if(!shipment){
            return null;
        }
        let title = `Shipment #${shipment.code}`;
        return (
            <Card>
                <Grid>
                    <GridCell width = "1-2" noMargin = {true}>
                        <h3 style={{margin: "-18px 0 2px"}}>{title} {this.renderCustomerOrderNumbers()}</h3>
                        {this.renderApplicationIds(shipment)}
                    </GridCell>
                    <GridCell width = "1-2" noMargin = {true}>
                        <div className = "uk-align-right">
                            <Button label = "Shipment Documents" flat = {true} style = "primary"
                                    onclick = {() => this.handleClickShipmentDocuments()} />
                        </div>
                    </GridCell>
                    <GridCell width = "1-1">
                        <Grid collapse = {true}>
                            <GridCell width = "3-10">
                                <Grid>
                                    <GridCell width = "1-1" noMargin = {true}>
                                        {this.renderSender(shipment)}
                                    </GridCell>
                                    <GridCell width = "1-2" noMargin = {true}>
                                        {this.renderSenderOrderNumbers()}
                                    </GridCell>
                                    <GridCell width = "1-2" noMargin = {true}>
                                        {this.renderLoadingOrderNumbers()}
                                    </GridCell>
                                    <GridCell width = "1-1" noMargin = {true}>
                                        {this.renderDepartureCustoms(shipment)}
                                    </GridCell>
                                </Grid>
                            </GridCell>
                            <GridCell width = "4-10">
                                <Grid>
                                    <GridCell width = "1-2">
                                        <div className="uk-align-left uk-margin-left">
                                            {this.renderIncoterm(shipment)}
                                        </div>
                                    </GridCell>
                                    <GridCell width = "1-2">
                                        <div className = "uk-align-right uk-margin-right">
                                            {this.renderLoadRequirementsAndSpecs(shipment)}
                                        </div>
                                    </GridCell>
                                    <GridCell width = "1-1" noMargin = {true}>
                                        <Path />
                                    </GridCell>
                                    <GridCell width = "1-1" noMargin = {true}>
                                        <Grid>
                                            <GridCell width = "1-3" noMargin = {true}>
                                                <div className="uk-align-left uk-margin-left">
                                                    {this.renderPaymentMethod(shipment)}
                                                </div>

                                            </GridCell>
                                            <GridCell width = "1-3" noMargin = {true}>
                                                <div className = "uk-text-center">
                                                    {this.renderValueOfGoods(shipment)}
                                                </div>
                                            </GridCell>
                                            <GridCell width = "1-3" noMargin = {true}>
                                                <div className = "uk-align-right uk-margin-right">
                                                    {this.renderInsurance(shipment)}
                                                </div>
                                            </GridCell>
                                        </Grid>
                                    </GridCell>
                                    <GridCell width = "1-1">
                                        <ShipmentUnitDetails shipment = {this.props.shipment}
                                                             editable = {this.props.editable}
                                                             template = {this.props.template}
                                                             senderTemplate = {this.props.senderTemplate}
                                                             onSave = {(value) => this.handleSaveShipmentUnitDetails(value)}
                                                             onDelete = {(value) => this.handleDeleteShipmentUnitDetails(value)}/>

                                    </GridCell>
                                    <GridCell width = "1-1">
                                        <DefinitionOfGoods  shipment={shipment} 
                                                            editable={this.props.editable}
                                                            senderTemplate = {this.props.senderTemplate} 
                                                            onSave = {(value) => this.handleSaveDefinitionOfGoods(value)}/>
                                    </GridCell>
                                </Grid>
                            </GridCell>
                            <GridCell width = "3-10">
                                <Grid>
                                    <GridCell width = "1-1" noMargin = {true}>
                                        {this.renderConsignee(shipment)}
                                    </GridCell>
                                    <GridCell width = "1-2" noMargin = {true}>
                                        {this.renderConsigneeOrderNumbers()}
                                    </GridCell>
                                    <GridCell width = "1-2" noMargin = {true}>
                                        {this.renderUnloadingOrderNumbers()}
                                    </GridCell>
                                    <GridCell width = "1-1" noMargin = {true}>
                                        {this.renderArrivalCustoms(shipment)}
                                    </GridCell>
                                </Grid>
                            </GridCell>
                        </Grid>
                    </GridCell>
                    <GridCell width="1-10" noMargin={true}>
                        <a href="javascript:;" onClick={() => this.handlePreviosDetails()}>
                            <i className="material-icons">keyboard_arrow_left</i><span style={{ verticalAlign: "middle" }}>{super.translate(this.getDetails(-1).label)}</span>
                        </a>
                    </GridCell>
                    <GridCell width="8-10" noMargin={true} style={{ verticalAlign: "middle" }}>
                        <hr />
                    </GridCell>
                    <GridCell width="1-10" noMargin={true} style={{ textAlign: "right" }}>
                        <a href="javascript:;" onClick={() => this.handleNextDetails()}>
                            <span style={{ verticalAlign: "middle" }}>{super.translate(this.getDetails(+1).label)}</span><i className="material-icons">keyboard_arrow_right</i>
                        </a>
                    </GridCell>
                    <GridCell width = "1-1">
                        {this.getDetails().render(shipment)}
                    </GridCell>
                </Grid>
                <OrderNumbersModal ref = {c => this.customerOrderNumbers = c} value = {this.state.customerOrderNumbers} type = "Customer"
                                   editable = {this.props.editable} busy = {this.state.savingStatus.customerOrderNumbers}
                                   onSave = {value => this.handleSaveCustomerOrderNumbers(value)} />
                <OrderNumbersModal ref = {c => this.senderOrderNumbers = c} value = {this.state.senderOrderNumbers} type = "Sender"
                                   editable = {this.props.editable} busy = {this.state.savingStatus.senderOrderNumbers}
                                   onSave = {value => this.handleSaveSenderOrderNumbers(value)} />
                <OrderNumbersModal ref = {c => this.consigneeOrderNumbers = c} value = {this.state.consigneeOrderNumbers} type = "Consignee"
                                   editable = {this.props.editable} busy = {this.state.savingStatus.consigneeOrderNumbers}
                                   onSave = {value => this.handleSaveConsigneeOrderNumbers(value)}/>
                <OrderNumbersModal ref = {c => this.loadingOrderNumbers = c} value = {this.state.loadingOrderNumbers} type = "Loading"
                                   editable = {this.props.editable} busy = {this.state.savingStatus.loadingOrderNumbers}
                                   onSave = {value => this.handleSaveLoadingOrderNumbers(value)}/>
                <OrderNumbersModal ref = {c => this.unloadingOrderNumbers = c} value = {this.state.unloadingOrderNumbers} type = "Unloading"
                                   editable = {this.props.editable} busy = {this.state.savingStatus.unloadingOrderNumbers}
                                   onSave = {value => this.handleSaveUnloadingOrderNumbers(value)}/>
                <DocumentModal ref = {c => this.shipmentDocuments = c} data = {this.state.shipmentDocuments} type = "Shipment"
                               editable = {this.props.editable}
                               hasDangerousLoad = {this.isShipmentHasDangerousLoad(this.props.shipment)}
                               hasHealthCertificateLoad = {this.isShipmentHasHealthCertificateLoad(this.props.shipment)}
                               documentTypes = {this.state.lookup.documentTypes}
                               dangerousLoadDocumentTypes = {this.state.lookup.dangerousLoadDocumentTypes}
                               healthCertificateLoadDocumentTypes = {this.state.lookup.healthCertificateLoadDocumentTypes}
                               onDelete = {document => this.handleDeleteDocument(document)}
                               onSave = {document => this.handleSaveDocument(document)}/>
                <ContactDetailsModal ref = {c => this.contactDetailsModal = c} data = {this.state.contactDetails[this.state.selectedContact.id]} />
                <ReadyDateEditModal ref = {c => this.readyDateModal = c}
                                    editable = {this.props.editable}
                                    order = {this.props.order}
                                    shipment = {this.props.shipment}
                                    senderWarehouse = {this.props.senderWarehouse}
                                    onSave = {(value) => this.handleSaveReadyDate(value)}
                                    onSetAppointment = {() => this.handleSetAppointment()}/>
                <LoadingAppointmentEditModal ref = {c => this.loadingAppointmentModal = c}
                                             editable = {this.props.editable}
                                             order = {this.props.order}
                                             shipment = {this.props.shipment}
                                             senderWarehouse = {this.props.senderWarehouse}
                                             onSave = {(value) => this.handleSaveLoadingAppointment(value)}
                                             onSetReadyDate = {() => this.handleSetReadyDate()}/>
                <UnloadingAppointmentEditModal ref = {c => this.unloadingAppointmentModal = c}
                                               editable = {this.props.editable}
                                               timezone = {this.props.shipment.consignee.handlingLocationTimezone}
                                               deliveryDate = {this.props.shipment.deliveryDate}
                                               value = {this.props.shipment.unloadingAppointment}
                                               onSave = {(value) => this.handleSaveUnloadingAppointment(value)}
                                               onDelete = {() => this.handleDeleteUnloadingAppointment()}/>
            </Card>

        );
    }
}

OrderShipment.contextTypes = {
    translator: PropTypes.object
};
