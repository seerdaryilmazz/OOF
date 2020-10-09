import * as axios from 'axios';
import _ from 'lodash';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Notify } from 'susam-components/basic';
import { Loader } from 'susam-components/layout';
import uuid from 'uuid';
import { Kartoteks, LocationService, OrderRequestService, OrderService, ProjectService, TaskService } from "../services";
import { CreateOrderForm } from './CreateOrderForm';




export class CreateOrderWithRequest extends TranslatingComponent{
    state = {};

    componentDidMount(){
        this.load();
    }
    load(){
        let calls = [
            OrderService.getTruckLoadTypes(),
            OrderService.getServiceTypes(),
            OrderService.getPaymentMethods(),
            OrderService.getIncoTerms(),
            OrderService.getCurrencies(),
            OrderService.getPackageTypes(),
            OrderService.getPackageGroups(),
            OrderService.getDocumentTypes(),
            TaskService.getTaskDetails(this.props.taskId)
        ];
        axios.all(calls).then(axios.spread(
            (truckLoadTypes, serviceTypes, paymentTypes, incoterms, currencies, packageTypes, packageGroups, documentTypes, taskDetails) => {
                let state = _.cloneDeep(this.state);
                state.lookup = {
                    truckLoadTypes: truckLoadTypes.data,
                    serviceTypes: serviceTypes.data,
                    paymentTypes: paymentTypes.data,
                    incoterms: incoterms.data,
                    currencies: currencies.data,
                    packageTypes: packageTypes.data,
                    packageGroups: packageGroups.data,
                    documentTypes: documentTypes.data
                };
                this.setState(state, () => {
                    this.loadDataUsingOrderRequestId(taskDetails.data.params.orderRequest.id);
                });
            }
        )).catch(error => Notify.showError(error));
    }
    isCompanyPartner(companyId){
        Kartoteks.isCompanyPartner(companyId).then(response => {
            let order = _.cloneDeep(this.state.order);
            order.customerIsPartner = response.data;
            this.setState({order: order});
        }).catch(error => Notify.showError(error));
    }
    createOrder(state, orderRequest){
        return {
            customer: orderRequest.customer,
            shipments: [],
            orderDocuments: [],
            truckLoadTypes: state.lookup.truckLoadTypes,
            serviceTypes: state.lookup.serviceTypes
        };
    }
    createEmptyShipment(){
        return {
            askSenderOrderNumbers: true,
            askConsigneeOrderNumbers: true,
            askCustomerOrderNumbers: true,
            shipmentUnitDetails: [],
            adrDetails: [],
            vehicleRequirements: [],
            equipmentRequirements: [],
            shipmentDocuments: [],
            healthDocuments: [],
            adrDocuments: [],
            lookup: {
                paymentTypes: [],
                incoterms: [],
                currencies: []
            }
        };
    }
    createShipment(state, orderRequest){
        let shipment = this.createEmptyShipment();
        shipment.lookup.incoterms = state.lookup.incoterms;
        shipment.lookup.paymentTypes = state.lookup.paymentTypes;
        shipment.lookup.currencies = state.lookup.currencies;
        shipment.readyDateTime = orderRequest.readyAtDate;
        state.order.shipments.push(shipment);
    }

    loadDataUsingOrderRequestId(orderRequestId) {
        OrderRequestService.get(orderRequestId).then(response => {
            let state = _.cloneDeep(this.state);
            state.orderRequest = response.data;

            state.order = this.createOrder(state, state.orderRequest);

            this.createShipment(state, state.orderRequest);

            this.setState(state, () => {
                this.isCompanyPartner(this.state.order.customer.id);
            });
        }).catch(error => {
            Notify.showError(error);
        });
    }
    loadHandlingLocationDetails(locationId, onSuccess){
        LocationService.getCustomerWarehouseDetails(locationId).then(response => {
            onSuccess(response.data.bookingLoading, response.data.bookingUnloading);
        }).catch(error => Notify.showError(error));
    }
    loadHandlingLocationTimezone(locationId, onSuccess){
        Kartoteks.getCompanyLocation(locationId).then(response => {
            onSuccess(response.data.timezone);
        }).catch(error => Notify.showError(error));
    }
    loadSenderTemplate(sender){
        ProjectService.getTemplatesForSender(sender.company.id, sender.handlingCompany.id, sender.handlingLocation.id).then(response => {
            let state = _.cloneDeep(this.state);
            state.senderTemplate = response.data;
            state.senderTemplate.forEach(template => template._key = uuid.v4());
            this.setState(state);
        }).catch(error => Notify.showError(error));
    }
    loadConsigneeSettings(shipmentIndex){
        let shipment = this.state.order.shipments[shipmentIndex];
        this.loadHandlingLocationTimezone(shipment.consignee.handlingLocation.id, (timezone) => {
            let order = _.cloneDeep(this.state.order);
            order.shipments[shipmentIndex].consignee.handlingLocationTimezone = timezone;
            this.setState({order: order});
        });
        this.loadHandlingLocationDetails(shipment.consignee.handlingLocation.id, (bookingLoading, bookingUnloading) => {
            let order = _.cloneDeep(this.state.order);
            order.shipments[shipmentIndex].consignee.handlingLocationHasBooking = bookingUnloading;
            this.setState({order: order});
        });
    }
    loadSenderSettings(shipmentIndex){
        let shipment = this.state.order.shipments[shipmentIndex];
        this.loadSenderTemplate(shipment.sender);
        this.loadHandlingLocationTimezone(shipment.sender.handlingLocation.id, (timezone) => {
            let order = _.cloneDeep(this.state.order);
            order.shipments[shipmentIndex].sender.handlingLocationTimezone = timezone;
            this.setState({order: order});
        });
        this.loadHandlingLocationDetails(shipment.sender.handlingLocation.id, (bookingLoading, bookingUnloading) => {
            let order = _.cloneDeep(this.state.order);
            order.shipments[shipmentIndex].sender.handlingLocationHasBooking = bookingLoading;
            this.setState({order: order});
        });
    }

    updateSender(sender, shipmentIndex){
        let state = _.cloneDeep(this.state);
        state.order.shipments[shipmentIndex].sender = sender;
        this.setState(state, () => this.loadSenderSettings(shipmentIndex));
    }
    updateConsignee(consignee, shipmentIndex){
        let state = _.cloneDeep(this.state);
        state.order.shipments[shipmentIndex].consignee = consignee;
        this.setState(state, () => this.loadConsigneeSettings(shipmentIndex));
    }
    updateOrder(order, onUpdate){
        this.setState({order: order}, () => {
            onUpdate && onUpdate();
        });
    }
    handleLoadRequirementsChange(shipmentIndex, order){
        this.updateOrder(order, () => {
            if(_.find(order.shipments[shipmentIndex].loadRequirements, {id: "ADR"})){
                OrderService.getAdrDocumentTypes().then(response => {
                    let lookup = _.cloneDeep(this.state.lookup);
                    lookup.adrDocumentTypes = response.data;
                    this.setState({lookup: lookup});
                }).catch(error => Notify.showError(error));
            }
            if(_.find(order.shipments[shipmentIndex].loadRequirements, {id: "CERTIFICATE"})){
                OrderService.getHealthCertificateTypes().then(response => {
                    let lookup = _.cloneDeep(this.state.lookup);
                    lookup.certificateTypes = response.data;
                    this.setState({lookup: lookup});
                }).catch(error => Notify.showError(error));
                LocationService.getBorderCustoms().then(response => {
                    let lookup = _.cloneDeep(this.state.lookup);
                    lookup.borderCustoms = response.data;
                    this.setState({lookup: lookup});
                }).catch(error => Notify.showError(error));
            }
        });
    }
    handleEquipmentRequirementsChange(shipmentIndex, order){
        this.updateOrder(order, () => {
            if(_.find(order.shipments[shipmentIndex].requirements, {id: "VEHICLE"})){
                OrderService.getVehicleFeatures().then(response => {
                    let lookup = _.cloneDeep(this.state.lookup);
                    lookup.vehicleFeatures = response.data;
                    this.setState({lookup: lookup});
                }).catch(error => Notify.showError(error));
                OrderService.getPermissionTypes().then(response => {
                    let lookup = _.cloneDeep(this.state.lookup);
                    lookup.permissionTypes = response.data;
                    this.setState({lookup: lookup});
                }).catch(error => Notify.showError(error));
            }
            if(_.find(order.shipments[shipmentIndex].requirements, {id: "EQUIPMENT"})){
                OrderService.getEquipmentTypes().then(response => {
                    let lookup = _.cloneDeep(this.state.lookup);
                    lookup.equipmentTypes = response.data;
                    this.setState({lookup: lookup});
                }).catch(error => Notify.showError(error));
            }
        });
    }
    handleAddNewShipment(){
        let state = _.cloneDeep(this.state);
        this.createShipment(state, state.orderRequest);
        this.setState(state);
    }
    handleSaveOrder(){
        this.props.onSave(this.state.order);
    }

    render(){
        if(!this.state.orderRequest){
            return <Loader title="Loading order form" />
        }
        return <CreateOrderForm order = {this.state.order}
                                lookup = {this.state.lookup} senderTemplate = {this.state.senderTemplate}
                                onChange = {(order) => this.updateOrder(order)}
                                onSenderChange = {(shipmentIndex, sender) => this.updateSender(sender, shipmentIndex) }
                                onConsigneeChange = {(shipmentIndex, consignee) => this.updateConsignee(consignee, shipmentIndex) }
                                onCreateNewShipment = {() => this.handleAddNewShipment()}
                                onLoadRequirementsChange = {(shipmentIndex, order) => this.handleLoadRequirementsChange(shipmentIndex, order)}
                                onEquipmentRequirementsChange = {(shipmentIndex, order) => this.handleEquipmentRequirementsChange(shipmentIndex, order)}
                                onSave = {() => this.handleSaveOrder()}/>

    }


}