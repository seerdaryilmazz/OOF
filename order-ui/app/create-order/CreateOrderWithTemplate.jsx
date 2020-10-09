import * as axios from 'axios';
import _ from 'lodash';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Notify } from 'susam-components/basic';
import { Loader } from 'susam-components/layout';
import uuid from 'uuid';
import * as Customs from "../Customs";
import { AuthorizationService, Kartoteks, LocationService, OrderService, ProjectService } from "../services";
import { CreateOrderForm } from './CreateOrderForm';




export class CreateOrderWithTemplate extends TranslatingComponent{
    state = {senderTemplate: {}};

    componentDidMount(){
        this.load();
    }
    prepareTemplateDetails(template){
        this.assignKeyForCustomizations(template);
        this.addCurrencyIdForCustomizations(template);
    }
    createOrderWithTemplate(state){
        state.order = this.createOrder(state.template);
        state.order.subsidiaries = state.lookup.subsidiaries;
        state.order.truckLoadTypes = this.getDefaultsLookup(state.template, "loadTypes") || state.lookup.truckLoadTypes;
        state.order.serviceTypes = this.getDefaultsLookup(state.template, "serviceTypes") || state.lookup.serviceTypes;
        state.order.originalCustomers = this.getDefaultsLookup(state.template, "originalCustomers") || [];
        this.setSingleItemLookupValuesToOrder(state.order);
        this.createShipmentWithTemplate(state);
    }
    createShipmentWithTemplate(state){
        let shipment = this.createShipment(state.template, state.order.shipments.length);
        shipment.lookup.incoterms = this.getDefaultsLookup(state.template, "incoterms") || state.lookup.incoterms;
        shipment.lookup.paymentTypes = this.getDefaultsLookup(state.template, "paymentTypes") || state.lookup.paymentTypes;
        shipment.lookup.currencies = this.getDefaultsLookup(state.template, "currencies") || state.lookup.currencies;

        shipment.askForShipmentUnits = this.getDefaultsValue(state.template, "shipmentUnit");
        if(shipment.askForShipmentUnits && shipment.askForShipmentUnits.code !== "ALWAYS"){
            shipment.shipmentUnitDetails = [];
        }
        let insured = this.getDefaultsValue(state.template, "insurance");
        if(insured){
            shipment.askForInsurance = false;
            shipment.insured = insured.code === "YES";
        }else{
            shipment.askForInsurance = true;
        }
        this.setSingleItemLookupValuesToShipment(shipment);
        state.order.shipments.push(shipment);
    }
    setSingleItemLookupValuesToOrder(order){
        order.subsidiary = order.subsidiaries.length > 0 ? order.subsidiaries[0] : null;
        order.truckLoadType = order.truckLoadTypes.length === 1 ? order.truckLoadTypes[0] : null;
        order.serviceType = order.serviceTypes.length === 1 ? order.serviceTypes[0] : null;
        order.originalCustomer = order.originalCustomers.length === 1 ? order.originalCustomers[0] : null;
    }
    setSingleItemLookupValuesToShipment(shipment){
        shipment.incoterm = shipment.lookup.incoterms.length === 1 ? shipment.lookup.incoterms[0] : null;
        shipment.paymentType = shipment.lookup.paymentTypes.length === 1 ? shipment.lookup.paymentTypes[0] : null;
    }
    getDefaultsValue(template, key){
        return this.isDefaultsValueExists(template, key) ? template.defaults[key] : null;
    }
    isDefaultsValueExists(template, key){
        return template.defaults && template.defaults[key];
    }
    isCustomizedValueExists(customization, key){
        return customization.customizedDefaults && customization.customizedDefaults[key];
    }

    getDefaultsLookup(template, key){
        return this.isDefaultsLookupExists(template, key) ? template.defaults[key] : null;
    }
    isDefaultsLookupExists(template, key){
        return template.defaults && template.defaults[key] && template.defaults[key].length > 0;
    }
    isCustomizedLookupExists(customization, key){
        return customization.customizedDefaults && customization.customizedDefaults[key];
    }
    isCustomizedLookupHasItems(customization, key){
        return this.isCustomizedLookupExists(customization, key) && customization.customizedDefaults[key].length > 0;
    }

    load(){
        let calls = [
            AuthorizationService.getSubsidiariesOfCurrentUser(),
            OrderService.getLookupsForCreateOrder(),
            LocationService.listCustomsOffices(),
            ProjectService.getTemplateById(this.props.templateId)
        ];
        axios.all(calls).then(axios.spread(
            (subsidiaries, createOrderLookups, customsOffices, template) => {
                let state = _.cloneDeep(this.state);
                state.lookup = {
                    subsidiaries: subsidiaries.data,
                    truckLoadTypes: createOrderLookups.data.loadTypes,
                    serviceTypes: createOrderLookups.data.serviceTypes,
                    paymentTypes: createOrderLookups.data.paymentMethods,
                    incoterms: createOrderLookups.data.incoterms,
                    currencies: createOrderLookups.data.currencyTypes,
                    packageTypes: createOrderLookups.data.packageTypes,
                    adrPackageTypes: createOrderLookups.data.adrPackageTypes,
                    vehicleFeatures: createOrderLookups.data.vehicleFeatures,
                    equipmentTypes: createOrderLookups.data.equipmentTypes,
                    documentTypes: createOrderLookups.data.otherDocumentTypes,
                    customsOffices: customsOffices.data,
                    customsTypes: createOrderLookups.data.customsOperationTypes
                };
                state.template = template.data;
                this.prepareTemplateDetails(state.template);
                this.createOrderWithTemplate(state);
                this.setState(state, () => {
                    let {order, template} = this.state;
                    this.isCompanyPartner(order.customer.id);
                    if(template.customizations.length === 1){
                        this.selectFirstCustomization(template.customizations[0]);
                    }else if(template.customizations.length === 0){
                        if(order.shipments[0].sender){
                            this.loadSenderSettings(0);
                        }else if(order.shipments[0].consignee){
                            this.loadConsigneeSettings(0);
                        }
                    }
                });

            }
        )).catch(error => Notify.showError(error));
    }
    selectFirstCustomization(customization){
        let state = _.cloneDeep(this.state);
        this.updateOrderWithCustomization(state.order, state.template, customization);
        this.updateShipmentWithCustomization(state.order.shipments[0], state.template, customization);
        this.setState(state, () => {
            this.loadConsigneeSettings(0);
            this.loadSenderSettings(0);
        });
    }
    selectCustomization(customization, shipmentIndex){
        let state = _.cloneDeep(this.state);
        this.updateShipmentWithCustomization(state.order.shipments[shipmentIndex], state.template, customization);
        this.setState(state, () => {
            this.loadConsigneeSettings(shipmentIndex);
            this.loadSenderSettings(shipmentIndex);
        });
    }
    updateOrderWithCustomization(order, template, customization){
        if(this.isCustomizedLookupExists(customization, "loadTypes")){
            order.truckLoadTypes = this.isCustomizedLookupHasItems(customization, "loadTypes") ?
                customization.customizedDefaults.loadTypes : this.state.lookup.truckLoadTypes;
        }else{
            order.truckLoadTypes = this.isDefaultsLookupExists(template, "loadTypes") ?
                this.getDefaultsLookup(template, "loadTypes") : this.state.lookup.truckLoadTypes;
        }
        if(this.isCustomizedLookupExists(customization, "serviceTypes")){
            order.serviceTypes = this.isCustomizedLookupHasItems(customization, "serviceTypes") ?
                customization.customizedDefaults.serviceTypes : this.state.lookup.serviceTypes;
        }else{
            order.serviceTypes = this.isDefaultsLookupExists(template, "serviceTypes") ?
                this.getDefaultsLookup(template, "serviceTypes") : this.state.lookup.serviceTypes;
        }
        if(this.isCustomizedLookupExists(customization, "originalCustomers")){
            order.originalCustomers = this.isCustomizedLookupHasItems(customization, "originalCustomers") ?
                customization.customizedDefaults.originalCustomers : this.getDefaultsLookup(template, "originalCustomers");
        }else{
            order.originalCustomers = this.isDefaultsLookupExists(template, "originalCustomers") ?
                this.getDefaultsLookup(template, "originalCustomers") : [];
        }
        this.setSingleItemLookupValuesToOrder(order);
    }
    updateShipmentWithCustomization(shipment, template, customization){
        if(template.pivot.type === "SENDER") {
            shipment.consignee = customization;
            shipment.askConsigneeOrderNumbers = customization.askOrderNumbers;
        }else if(template.pivot.type === "CONSIGNEE") {
            shipment.sender = customization;
            shipment.askSenderOrderNumbers = customization.askOrderNumbers;
        }

        if(this.isCustomizedLookupExists(customization, "paymentTypes")){
            shipment.lookup.paymentTypes = this.isCustomizedLookupHasItems(customization, "paymentTypes") ?
                customization.customizedDefaults.paymentTypes : this.state.lookup.paymentTypes;
        }else{
            shipment.lookup.paymentTypes = this.isDefaultsLookupExists(template, "paymentTypes") ?
                this.getDefaultsLookup(template, "paymentTypes") : this.state.lookup.paymentTypes;
        }
        if(this.isCustomizedLookupExists(customization, "incoterms")){
            shipment.lookup.incoterms = this.isCustomizedLookupHasItems(customization, "incoterms") ?
                customization.customizedDefaults.incoterms : this.state.lookup.incoterms;
        }else{
            shipment.lookup.incoterms = this.isDefaultsLookupExists(template, "incoterms") ?
                this.getDefaultsLookup(template, "incoterms") : this.state.lookup.incoterms;
        }
        if(this.isCustomizedLookupExists(customization, "currencies")){
            shipment.lookup.currencies = this.isCustomizedLookupHasItems(customization, "currencies") ?
                customization.customizedDefaults.currencies : this.state.lookup.currencies;
        }else{
            shipment.lookup.currencies = this.isDefaultsLookupExists(template, "currencies") ?
                this.getDefaultsLookup(template, "currencies") : this.state.lookup.currencies;
        }

        let customizedAskShipmentUnit = this.isCustomizedLookupExists(customization, "shipmentUnit");
        let askShipmentUnit = this.getDefaultsValue(template, "shipmentUnit");
        shipment.askForShipmentUnits = customizedAskShipmentUnit ? customizedAskShipmentUnit : askShipmentUnit;
        if(shipment.askForShipmentUnits && shipment.askForShipmentUnits.code !== "ALWAYS"){
            shipment.shipmentUnitDetails = [];
        }

        let customizedInsured = this.isCustomizedLookupExists(customization, "insurance");
        let insured = this.getDefaultsValue(template, "insurance");
        if(customizedInsured){
            shipment.askForInsurance = false;
            shipment.insured = customizedInsured.code === "YES";
        }else{
            if(insured){
                shipment.askForInsurance = false;
                shipment.insured = insured.code === "YES";
            }else{
                shipment.askForInsurance = true;
            }
        }

        this.setSingleItemLookupValuesToShipment(shipment);
    }

    loadConsigneeSettings(shipmentIndex){
        let shipment = this.state.order.shipments[shipmentIndex];
        this.loadHandlingLocationDetails(shipment.consignee.handlingLocation.id, (details) => {
            let order = _.cloneDeep(this.state.order);
            order.shipments[shipmentIndex].consignee.handlingLocationTimezone = details.timezone;
            order.shipments[shipmentIndex].consignee.handlingLocationCountry = details.postaladdress.country.iso;
            order.shipments[shipmentIndex].consignee.handlingLocationPostalCode = details.postaladdress.postalCode;
            this.setCustomsArrivalData(order.shipments[shipmentIndex]);
            this.getConsigneeEUMembership(details.postaladdress.country.iso, shipmentIndex);
            this.setState({order: order});
        });

        this.loadHandlingLocationCrossDockDetails(shipment.consignee.handlingLocation.id, crossDockDetail =>{
            let askForHandlingLocationAppointment = _.isEmpty(crossDockDetail), haveHandlingAppointment = false;
            this.loadHandlingLocationWhDetails(shipment.consignee.handlingLocation.id, warehouseDetail => {
                let order = _.cloneDeep(this.state.order);
                let bookingUnloading = warehouseDetail.bookingUnloading
                if(bookingUnloading && bookingUnloading.bookingOption){
                    let bookingOptionId = bookingUnloading.bookingOption.id;
                    let bookingTypeId = bookingUnloading.bookingType ? bookingUnloading.bookingType.id : "";
                    askForHandlingLocationAppointment = bookingOptionId === "ASK";
                    haveHandlingAppointment = bookingOptionId === "ALWAYS" && bookingTypeId === "ORDER_REQUEST";
                }
                if(!askForHandlingLocationAppointment && !haveHandlingAppointment){
                    order.shipments[shipmentIndex].unloadingAppointment = null;
                }
                order.shipments[shipmentIndex].askForUnloadingAppointment = askForHandlingLocationAppointment;
                order.shipments[shipmentIndex].haveUnloadingAppointment = haveHandlingAppointment;
                order.shipments[shipmentIndex].consignee.handlingLocationDetail = crossDockDetail || warehouseDetail;

                this.setState({order: order});
            });
        });

        this.loadCustomsDetails(shipment.consignee.handlingLocation.id, customsDetails => {
            let order = _.cloneDeep(this.state.order);
            if(customsDetails && customsDetails.customsType && customsDetails.customsType.id !== "NON_BONDED_WAREHOUSE"){
                order.shipments[shipmentIndex].consignee.handlingLocationCustomsDetails = _.cloneDeep(customsDetails);
            }
            this.setCustomsArrivalData(order.shipments[shipmentIndex]);
            this.setState({order: order});

        });
        this.loadConsigneeWarehouseRules(shipment.consignee.handlingLocation.id, shipmentIndex);
        this.loadConsigneeCustomsRules(shipment.consignee.company.id, shipment.consignee.handlingLocation.id, shipmentIndex);
    }
    loadSenderSettings(shipmentIndex){
        let shipment = this.state.order.shipments[shipmentIndex];
        this.loadSenderTemplate(shipmentIndex, shipment.sender);
        this.loadHandlingLocationDetails(shipment.sender.handlingLocation.id, (details) => {
            let order = _.cloneDeep(this.state.order);
            order.shipments[shipmentIndex].sender.handlingLocationTimezone = details.timezone;
            order.shipments[shipmentIndex].sender.handlingLocationCountry = details.postaladdress.country.iso;
            order.shipments[shipmentIndex].sender.handlingLocationPostalCode = details.postaladdress.postalCode;
            this.getSenderEUMembership(details.postaladdress.country.iso, shipmentIndex);
            this.setState({order: order});
        });
        this.loadHandlingLocationCrossDockDetails(shipment.sender.handlingLocation.id, crossDockDetail => {
            let askForHandlingLocationAppointment = _.isEmpty(crossDockDetail), haveHandlingAppointment = false;
            this.loadHandlingLocationWhDetails(shipment.sender.handlingLocation.id, (warehouseDetail, customsDetails) => {
                let order = _.cloneDeep(this.state.order);
                let bookingLoading = warehouseDetail.bookingLoading;
                if (bookingLoading && bookingLoading.bookingOption) {
                    let bookingOptionId = bookingLoading.bookingOption.id;
                    let bookingTypeId = bookingLoading.bookingType ? bookingLoading.bookingType.id : "";
                    askForHandlingLocationAppointment = bookingOptionId === "ASK";
                    haveHandlingAppointment = bookingOptionId === "ALWAYS" && bookingTypeId === "ORDER_REQUEST";
                }
                if(!askForHandlingLocationAppointment){
                    if(haveHandlingAppointment){
                        order.shipments[shipmentIndex].readyDateTime = null;
                    } else {
                        order.shipments[shipmentIndex].loadingAppointment = null;
                    }
                }
                order.shipments[shipmentIndex].askForLoadingAppointment = askForHandlingLocationAppointment;
                order.shipments[shipmentIndex].haveLoadingAppointment = haveHandlingAppointment;
                order.shipments[shipmentIndex].sender.handlingLocationDetail = crossDockDetail || warehouseDetail;
                
                if (customsDetails && customsDetails.customsType && customsDetails.customsType.id !== "NON_BONDED_WAREHOUSE") {
                    order.shipments[shipmentIndex].sender.handlingLocationCustomsDetails = _.cloneDeep(customsDetails);
                }
                this.setState({ order: order });
            });
        });
        this.loadSenderWarehouseRules(shipment.sender.handlingLocation.id, shipmentIndex);
        this.loadSenderCustomsRules(shipment.sender.company.id, shipment.sender.handlingLocation.id, shipmentIndex);
    }

    getConsigneeEUMembership(isoCode, shipmentIndex){
        LocationService.getCountry(isoCode).then(response => {
            let order = _.cloneDeep(this.state.order);
            order.shipments[shipmentIndex].consignee.handlingLocationInEU = response.data.euMember;
            this.setCustomsNeeded(order.shipments[shipmentIndex]);
            if(!order.shipments[shipmentIndex].askCustomsInfo){
                order.shipments[shipmentIndex].arrivalCustoms = null;
            }
            this.setState({order: order});
        })
    }
    getSenderEUMembership(isoCode, shipmentIndex){
        LocationService.getCountry(isoCode).then(response => {
            let order = _.cloneDeep(this.state.order);
            order.shipments[shipmentIndex].sender.handlingLocationInEU = response.data.euMember;
            this.setCustomsNeeded(order.shipments[shipmentIndex]);
            if(!order.shipments[shipmentIndex].askCustomsInfo){
                order.shipments[shipmentIndex].departureCustoms = null;
            }
            this.setState({order: order});
        })
    }
    setCustomsArrivalData(shipment){
        if(!shipment.consignee || !shipment.consignee.handlingLocationCustomsDetails || !shipment.consignee.handlingLocationCountry){
            return;
        }
        if(shipment.consignee.customsDefinitions && shipment.consignee.customsDefinitions.length > 0){
            //there are customs definitions from rules, don't set default customs
            return;
        }
        if(shipment.consignee.handlingLocationCountry === "TR") {
            shipment.arrivalCustomsFromConsignee = {
                _key: uuid.v4(),
                customsOffice: shipment.consignee.handlingLocationCustomsDetails.customsOffice,
                customsType: shipment.consignee.handlingLocationCustomsDetails.customsType,
                customsLocation: {
                    id: shipment.consignee.handlingLocationCustomsDetails.id,
                    name: shipment.consignee.handlingLocationCustomsDetails.name
                },
                usedForDangerousGoods: shipment.consignee.handlingLocationCustomsDetails.usedForDangerousGoods,
                usedForTempControlledGoods: shipment.consignee.handlingLocationCustomsDetails.usedForTempControlledGoods,
                readOnly: true
            }
            shipment.arrivalCustoms = _.cloneDeep(shipment.arrivalCustomsFromConsignee);
        }
    }

    setCustomsNeeded(shipment){
        if(shipment.sender && shipment.consignee && shipment.sender.handlingLocationCountry !== shipment.consignee.handlingLocationCountry) {
            shipment.transportToOtherCountry = true;
            shipment.askCustomsInfo = !(shipment.sender.handlingLocationInEU && shipment.consignee.handlingLocationInEU);
        }
    }
    loadCustomsDetails(locationId, onSuccess){
        LocationService.getCustomsLocationByLocationId(locationId).then(response => {
            onSuccess(response.data);
        }).catch(error => Notify.showError(error));
    }
    loadHandlingLocationCrossDockDetails(locationId, onSuccess){
        LocationService.getWarehouseDetails(locationId).then(response => {
            onSuccess(response.data);
        }).catch(error => Notify.showError(error));
    }
    loadHandlingLocationWhDetails(locationId, onSuccess){
        LocationService.getCustomerWarehouseDetails(locationId).then(response => {
            onSuccess(response.data);
        }).catch(error => Notify.showError(error));
    }
    loadHandlingLocationDetails(locationId, onSuccess){
        Kartoteks.getCompanyLocation(locationId).then(response => {
            onSuccess(response.data);
        }).catch(error => Notify.showError(error));
    }
    loadSenderTemplate(shipmentIndex, sender){
        ProjectService.searchSenderTemplates(sender.company.id, sender.handlingCompany.id, sender.handlingLocation.id)
            .then(response => {
                let order = _.cloneDeep(this.state.order);
                let shipment = order.shipments[shipmentIndex];
                shipment.lookup.packageDetails = [];
                shipment.lookup.loadRequirements = [
                    {id: "ADR", icon: "alert-octagon", text: "Dangerous (ADR)"},
                    {id: "CERTIFICATE", icon: "certificate", text: "Certificated"},
                    {id: "FRIGO", icon: "thermometer", text: "Temperature Controlled"},
                    {id: "NONE", icon: "check-circle", text: "None"}
                ];
                shipment.lookup.certificateTypes = [];
                shipment.lookup.healthCheckCustoms = [];
                shipment.lookup.adrUnDetails = [];
                shipment.askHealthCheckAtBorder = true;
                shipment.lookup.goods = [];

                if(response.data){
                    shipment.lookup.loadRequirements = [];
                    if(response.data.shouldDangerousGoodsBeAsked){
                        shipment.lookup.loadRequirements.push({id: "ADR", icon: "alert-octagon", text: "Dangerous (ADR)"});
                    }
                    if(response.data.shouldCertificatedGoodsBeAsked){
                        shipment.lookup.loadRequirements.push({id: "CERTIFICATE", icon: "certificate", text: "Certificated"});
                    }
                    if(response.data.shouldTemperatureControlledGoodsBeAsked){
                        shipment.lookup.loadRequirements.push({id: "FRIGO", icon: "thermometer", text: "Temperature Controlled"});
                    }
                    if(shipment.lookup.loadRequirements.length > 0){
                        shipment.lookup.loadRequirements.push({id: "NONE", icon: "check-circle", text: "None"});
                    }
                    if(response.data.shouldCertificatedGoodsBeAsked) {
                        shipment.lookup.certificateTypes = response.data.healthCertificates;
                    }
                    shipment.askHealthCheckAtBorder = response.data.shouldHealthCheckBeAsked;
                    if(shipment.askHealthCheckAtBorder){
                        shipment.lookup.healthCheckCustoms = response.data.borderCustoms;
                    }

                    if(response.data.shouldDangerousGoodsBeAsked && response.data.unIds.length > 0) {
                        this.loadAdrUnIdDetails(response.data.unIds, shipmentIndex);
                    }

                    shipment.lookup.packageDetails = response.data.packageDetails;

                    shipment.lookup.packageDetails.forEach(details => {
                        details._key = uuid.v4();
                    });
                    
                    shipment.lookup.goods = response.data.goods;

                    shipment.lookup.goods.forEach(details => {
                        details._key = uuid.v4();
                    });
                }
                this.setState({order: order});
        }).catch(error => Notify.showError(error));
    }

    loadAdrUnIdDetails(idList, shipmentIndex){
        OrderService.getAdrUNIdDetails(idList).then(response => {
            let order = _.cloneDeep(this.state.order);
            let shipment = order.shipments[shipmentIndex];
            shipment.lookup.adrUnDetails = response.data;
            this.setState({order: order});
        }).catch(error => Notify.showError(error));
    }

    loadSenderWarehouseRules(locationId, shipmentIndex){
        ProjectService.executeWarehouseRulesForLocation(locationId).then(response => {
            let order = _.cloneDeep(this.state.order);
            order.shipments[shipmentIndex].vehicleRequirements.requiredByWarehouseForLoading = response.data.requiredForLoading;
            if(response.data.requiredEquipments){
                order.shipments[shipmentIndex].equipmentRequirements =
                    Object.keys(response.data.requiredEquipments).map(key => {
                        return {
                            equipmentType: _.find(this.state.lookup.equipmentTypes, item => item.id == key),
                            equipmentCount: response.data.requiredEquipments[key],
                            equipmentCountRequiredByWarehouse: response.data.requiredEquipments[key],
                        };
                    });
            }

            this.setState({order: order});
        }).catch(error => Notify.showError(error));
    }

    loadConsigneeWarehouseRules(locationId, shipmentIndex){
        ProjectService.executeWarehouseRulesForLocation(locationId).then(response => {
            let order = _.cloneDeep(this.state.order);
            order.shipments[shipmentIndex].vehicleRequirements.requiredByWarehouseForUnloading = response.data.requiredForUnloading;
            this.setState({order: order});
        }).catch(error => Notify.showError(error));
    }

    loadConsigneeCustomsRules(companyId, locationId, shipmentIndex){
        if(this.state.order.shipments[shipmentIndex].askCustomsInfo === false){
            return;
        }
        ProjectService.getConsigneeCustomsForCompanyAndLocation(companyId, locationId).then(response => {
            let order = _.cloneDeep(this.state.order);
            order.shipments[shipmentIndex].consignee.customsDefinitions =
                _.flatten(response.data.map(customsDefinition => customsDefinition.outputList.map(output => {
                    let data = _.cloneDeep(output);
                    data.dangerousGoods = customsDefinition.dangerousGoods;
                    data.temperatureControlledGoods = customsDefinition.temperatureControlledGoods;
                    data._key = uuid.v4();
                    return data;
                })));
            if(order.shipments[shipmentIndex].consignee.handlingLocationCountry === "TR"){
                this.filterCustomsDefinitions(order, shipmentIndex);
            }else{
                order.shipments[shipmentIndex].consignee.filteredCustomsDefinitions =
                    order.shipments[shipmentIndex].consignee.customsDefinitions;
            }

            if(order.shipments[shipmentIndex].consignee.filteredCustomsDefinitions &&
                order.shipments[shipmentIndex].consignee.filteredCustomsDefinitions.length === 1){
                order.shipments[shipmentIndex].arrivalCustoms = order.shipments[shipmentIndex].consignee.filteredCustomsDefinitions[0];
            }else{
                order.shipments[shipmentIndex].arrivalCustoms = null;
            }
            this.setState({order: order});
        });
    }

    loadSenderCustomsRules(companyId, locationId, shipmentIndex){
        if(this.state.order.shipments[shipmentIndex].askCustomsInfo === false){
            return;
        }
        ProjectService.getSenderCustomsForCompanyAndLocation(companyId, locationId).then(response => {
            let order = _.cloneDeep(this.state.order);
            order.shipments[shipmentIndex].askDepartureCustoms = true;
            if(_.isEmpty(response.data) || 0 <= _.findIndex(response.data, i=>_.isEmpty(i.option) || i.option.code === 'ASK')){
                order.shipments[shipmentIndex].sender.customsDefinitions = _.flatten(response.data.map(item => item.outputList));
                order.shipments[shipmentIndex].sender.customsDefinitions.forEach(item => item._key = uuid.v4());
                if(order.shipments[shipmentIndex].sender.customsDefinitions.length === 1){
                    order.shipments[shipmentIndex].departureCustoms = order.shipments[shipmentIndex].sender.customsDefinitions[0];
                } else{
                    order.shipments[shipmentIndex].departureCustoms = null;
                }
            } else {
                order.shipments[shipmentIndex].askDepartureCustoms = false;
            }
            this.setState({order: order});
        });
    }

    handleCustomizationSelect(customization, shipmentIndex){
        if(shipmentIndex === 0){
            this.selectFirstCustomization(customization);
        }else{
            this.selectCustomization(customization, shipmentIndex);
        }
    }

    isCompanyPartner(companyId){
        Kartoteks.isCompanyPartner(companyId).then(response => {
            let order = _.cloneDeep(this.state.order);
            order.customerIsPartner = response.data;
            this.setState({order: order});
        }).catch(error => Notify.showError(error));
    }

    createOrder(template){
        return {
            customer: template.customer,
            confirmed: template.ordersAreConfirmed,
            allowMultipleShipments: template.allowMultipleShipments,
            allowOrderReplication: template.allowOrderReplication,
            shipments: [],
            orderDocuments: [],
            lookup: {
                truckLoadTypes: [],
                serviceTypes: []
            }
        };
    }
    createShipment(template, index){
        let shipment = {
            definitionOfGoods: [],
            shipmentUnitDetails: [],
            adrDetails: [],
            vehicleRequirements: {
                requiredForLoading: [],
                requiredForUnloading: [],
                requiredByWarehouseForLoading: [],
                requiredByWarehouseForUnloading: [],
                requiredByLoad: []
            },
            equipmentRequirements: [],
            shipmentDocuments: [],
            healthDocuments: [],
            adrDocuments: [],
            lookup: {
                paymentTypes: [],
                incoterms: [],
                currencies: [],
                loadRequirements: [],
                certificateTypes: [],
                adrUnIds: [],
                goods: []
            }
        };
        if(template.pivot.type === "SENDER") {
            shipment.sender = template.pivot;
            shipment.askSenderOrderNumbers = template.pivot.askOrderNumbers;
        }else if(template.pivot.type === "CONSIGNEE") {
            shipment.consignee = template.pivot;
            shipment.askConsigneeOrderNumbers = template.pivot.askOrderNumbers;
        }
        shipment.askCustomerOrderNumbers = template.askOrderNumbers;
        shipment.index = index;
        return shipment;
    }
    assignKeyForCustomizations(template){
        template.customizations.forEach(customization => {
            customization._key = uuid.v4();
            customization.manufacturers && customization.manufacturers.forEach(m=>m._key=uuid.v4());
        });
    }

    addCurrencyIdForCustomizations(template){
        if(template.defaults && template.defaults.currencies){
            template.defaults.currencies.forEach(currency => currency.id = currency.code);
        }
        template.customizations.forEach(customization => {
            if(customization.customizedDefaults && customization.customizedDefaults.currencies){
                customization.customizedDefaults.currencies.forEach(currency => currency.id = currency.code);
            }
        });
    }

    handleAddNewShipment(){
        let state = _.cloneDeep(this.state);
        this.createShipmentWithTemplate(state);
        if(state.template.customizations.length === 1){
            this.selectCustomization(state.template.customizations[0], 0);
        }
        this.setState(state);
    }
    handleDeleteShipment(shipmentIndex){
        let state = _.cloneDeep(this.state);
        if(state.order.shipments.length > shipmentIndex){
            state.order.shipments.splice(shipmentIndex, 1);
        }
        this.setState(state);
    }
    handleLoadRequirementsChange(shipmentIndex, order){
        this.filterCustomsDefinitions(order, shipmentIndex);
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
    filterCustomsDefinitions(order, shipmentIndex){
        let shipment = order.shipments[shipmentIndex];

        let hasDangerousGoods = _.isArray(shipment.loadRequirements) && _.find(shipment.loadRequirements, {id: "ADR"});
        let hasTempControlledGoods = _.isArray(shipment.loadRequirements) && _.find(shipment.loadRequirements, {id: "FRIGO"});

        shipment.consignee.filteredCustomsDefinitions =
            Customs.filterCustomsRuleResults(shipment.consignee.customsDefinitions, hasDangerousGoods, hasTempControlledGoods);;
        shipment.consignee.filteredCustomsDefinitions.forEach(item => {
            if(!item._key){
                item._key = uuid.v4();
            }
        });

        if(shipment.consignee.filteredCustomsDefinitions.length === 1){
            shipment.arrivalCustoms = order.shipments[shipmentIndex].consignee.filteredCustomsDefinitions[0];
        }else{
            if(shipment.arrivalCustoms){
                if(!shipment.arrivalCustoms.readOnly){
                    let selectedCustoms = _.find(shipment.consignee.filteredCustomsDefinitions, {_key: shipment.arrivalCustoms._key});
                    shipment.arrivalCustoms = _.cloneDeep(selectedCustoms);
                }else{
                    if(Customs.isCustomsTypeNeedsLoadTypeCheck(shipment.arrivalCustoms.customsType)){
                        if(hasDangerousGoods && !shipment.arrivalCustoms.usedForDangerousGoods){
                            shipment.arrivalCustoms = null;
                        }
                        if(hasTempControlledGoods && !shipment.arrivalCustoms.usedForTempControlledGoods){
                            shipment.arrivalCustoms = null;
                        }
                    }
                }
            }else if(shipment.arrivalCustomsFromConsignee){
                if(Customs.isCustomsTypeNeedsLoadTypeCheck(shipment.arrivalCustomsFromConsignee.customsType)){
                    let suitable = true;
                    if(hasDangerousGoods && !shipment.arrivalCustomsFromConsignee.usedForDangerousGoods){
                        suitable = false;
                    }
                    if(hasTempControlledGoods && !shipment.arrivalCustomsFromConsignee.usedForTempControlledGoods){
                        suitable = false;
                    }
                    if(suitable){
                        shipment.arrivalCustoms = _.cloneDeep(shipment.arrivalCustomsFromConsignee);
                    }
                }else{
                    shipment.arrivalCustoms = _.cloneDeep(shipment.arrivalCustomsFromConsignee);
                }
            }
        }
    }
    handleEquipmentRequirementsChange(shipmentIndex, order){
        this.updateOrder(order, () => {
            let shipment = order.shipments[shipmentIndex];
            if(_.find(shipment.requirements, {id: "VEHICLE"})){
                OrderService.getVehicleFeaturesForCreateOrder().then(response => {
                    let lookup = _.cloneDeep(this.state.lookup);
                    let filteredFeatures = response.data;
                    if(shipment.vehicleRequirements){
                        lookup.vehicleFeaturesLoading = _.filter(filteredFeatures, item => {
                            return _.findIndex(shipment.vehicleRequirements.requiredByWarehouseForLoading, {code: item.code}) === -1;
                        });
                        lookup.vehicleFeaturesUnloading = _.filter(filteredFeatures, item => {
                            return _.findIndex(shipment.vehicleRequirements.requiredByWarehouseForUnloading, {code: item.code}) === -1;
                        });
                    }else{
                        lookup.vehicleFeaturesLoading = filteredFeatures;
                        lookup.vehicleFeaturesUnloading = filteredFeatures;
                    }
                    this.setState({lookup: lookup});
                }).catch(error => Notify.showError(error));
                OrderService.getPermissionTypes().then(response => {
                    let lookup = _.cloneDeep(this.state.lookup);
                    lookup.permissionTypes = response.data;
                    this.setState({lookup: lookup});
                }).catch(error => Notify.showError(error));
            }

        });
    }

    updateSender(sender, shipmentIndex){
        let state = _.cloneDeep(this.state);
        state.order.shipments[shipmentIndex].sender = _.cloneDeep(sender);
        state.order.shipments[shipmentIndex].manufacturer = null;
        if('REQUIRED' === state.order.shipments[shipmentIndex].sender.manufacturerOption.code && 1 === state.order.shipments[shipmentIndex].sender.manufacturers.length){
            state.order.shipments[shipmentIndex].manufacturer=_.first(state.order.shipments[shipmentIndex].sender.manufacturers);
        }
        this.setState(state, () => this.loadSenderSettings(shipmentIndex));
    }
    updateConsignee(consignee, shipmentIndex){
        let state = _.cloneDeep(this.state);
        state.order.shipments[shipmentIndex].consignee = _.cloneDeep(consignee);
        this.setState(state, () => this.loadConsigneeSettings(shipmentIndex));
    }
    updateOrder(order, onUpdate){
        this.setState({order: order}, () => {
            onUpdate && onUpdate();
        });
    }
    handleSaveOrder(){
        console.log("raw order data", this.state.order);
        let createOrderRequest = {
            order: this.convertOrder(this.state.order),
            confirmed: this.state.order.confirmed,
            numberOfReplications: this.state.order.replicateOrder ? this.state.order.numberOfReplications.id : 1
        };
        this.props.onSave(createOrderRequest);
    }
    convertVehicleRequirements(shipment){

        let loadingRequirements = [];
        if(this.isShipmentHasVehicleRequirements(shipment)){
            shipment.vehicleRequirements.requiredForLoading.forEach(item => {
                loadingRequirements.push({
                    requirementReason: {code: 'BY_ORDER'},
                    requirement: item
                });
            });
        }
        shipment.vehicleRequirements.requiredByWarehouseForLoading.forEach(item => {
            loadingRequirements.push({
                requirementReason: {code: 'BY_WAREHOUSE'},
                requirement: item
            });
        });
        shipment.vehicleRequirements.requiredByLoad.forEach(item => {
            loadingRequirements.push({
                requirementReason: {code: 'BY_LOAD'},
                requirement: item
            });
        });

        let uniqueLoadingRequirements = _.uniqWith(loadingRequirements, (item1, item2) => item1.requirement.code === item2.requirement.code);
        uniqueLoadingRequirements.forEach(requirement => {
                requirement.operationType = {code: "COLLECTION"};
        });

        let unloadingRequirements = [];
        if(this.isShipmentHasVehicleRequirements(shipment)) {
            shipment.vehicleRequirements.requiredForUnloading.forEach(item => {
                unloadingRequirements.push({
                    requirementReason: {code: 'BY_ORDER'},
                    requirement: item
                });
            });
        }
        shipment.vehicleRequirements.requiredByWarehouseForUnloading.forEach(item => {
            unloadingRequirements.push({
                requirementReason: {code: 'BY_WAREHOUSE'},
                requirement: item
            });
        });
        shipment.vehicleRequirements.requiredByLoad.forEach(item => {
            unloadingRequirements.push({
                requirementReason: {code: 'BY_LOAD'},
                requirement: item
            });
        });

        let uniqueUnloadingRequirements = _.uniqWith(unloadingRequirements, (item1, item2) => item1.requirement.code === item2.requirement.code);
        uniqueUnloadingRequirements.forEach(requirement => {
            requirement.operationType = {code: "DISTRIBUTION"};
        });

        return uniqueLoadingRequirements ? uniqueLoadingRequirements.concat(uniqueUnloadingRequirements) : uniqueUnloadingRequirements;
    }
    convertEquipmentRequirements(shipment){
        if(!this.isShipmentHasEquipmentRequirements(shipment)){
            let requiredByWarehouse = _.filter(shipment.equipmentRequirements, item => !_.isNil(item.equipmentCountRequiredByWarehouse));
            if(requiredByWarehouse.length > 0){
                return requiredByWarehouse.map(requirement => {
                    return {
                        equipment: requirement.equipmentType,
                        count: requirement.equipmentCountRequiredByWarehouse
                    };
                })
            }else{
                return [];
            }
        }
        return shipment.equipmentRequirements.map(requirement => {
            return {
                equipment: requirement.equipmentType,
                count: requirement.equipmentCount
            };
        })
    }
    convertCertificateTypes(shipment){
        let certificates = [];
        if(shipment.certificateTypes){
            certificates = shipment.certificateTypes.manualTypes ?
                shipment.certificateTypes.manualTypes.concat(shipment.certificateTypes.uploadTypes) : shipment.certificateTypes.uploadTypes;
        }
        certificates = certificates.map(cert => _.find(this.state.lookup.certificateTypes, {code: cert.code}));
        return certificates;
    }
    collectAllDocuments(shipment){
        let documents = [];
        if(this.isShipmentHasADR(shipment)){
            documents = documents.concat(this.createDocuments(shipment.adrDocuments));
        }
        if(this.isShipmentHealthCertificated(shipment)){
            documents = documents.concat(this.createDocuments(shipment.healthDocuments));
        }
        documents = documents.concat(this.createDocuments(shipment.shipmentDocuments));
        return documents;
    }
    createDocuments(documents){
        let createdDocuments = [];
        if(!documents || documents.length === 0){
            return createdDocuments;
        }
        documents.forEach(document => {
            if(document.types){
                document.types.forEach(type => {
                    createdDocuments.push(this.createDocument(type, document.document.tempFileName, document.document.originalName, document.description));
                });
            }
        });
        return createdDocuments;
    }
    createDocument(type, tempFileName, originalFileName, description){
        let types = _.concat(this.state.lookup.documentTypes, _.concat(this.state.lookup.certificateTypes, this.state.lookup.adrDocumentTypes));
        return {
            type: _.find(types, {code: type.code}),
            savedFileName: tempFileName,
            originalFileName: originalFileName,
            description: description
        };
    }
    convertContact(contact){
        if(!contact){
            return null;
        }
        return {
            id: contact.id,
            name: contact.fullname
        }
    }
    isShipmentTempControlled(shipment){
        return _.find(shipment.loadRequirements, {id: "FRIGO"});
    }
    isShipmentHasADR(shipment){
        return _.find(shipment.loadRequirements, {id: "ADR"});
    }
    isShipmentHealthCertificated(shipment){
        return _.find(shipment.loadRequirements, {id: "CERTIFICATE"});
    }
    isShipmentHasVehicleRequirements(shipment){
        return _.find(shipment.requirements, {id: "VEHICLE"});
    }
    isShipmentHasEquipmentRequirements(shipment){
        return _.find(shipment.requirements, {id: "EQUIPMENT"});
    }
    convertOrder(order){
        return {
            customer: {id: order.customer.id, name: order.customer.name},
            templateId: this.state.template.id,
            templateName: this.state.template.name,
            originalCustomer: order.originalCustomer ?
                {id: order.originalCustomer.id, name: order.originalCustomer.name} : null,
            subsidiary: {id: order.subsidiary.id, name: order.subsidiary.name},
            truckLoadType: order.truckLoadType,
            serviceType: order.serviceType,
            documents: this.createDocuments(order.orderDocuments),
            shipments: order.shipments.map(shipment => {
                return {
                    incoterm: _.find(this.state.lookup.incoterms, {code: shipment.incoterm.code}),
                    readyAtDate: shipment.readyDateTime && shipment.readyDateTime.value,
                    latestReadyAtDate: shipment.readyDateTime && shipment.readyDateTime.latest,
                    deliveryDate: shipment.deliveryDateTime,
                    unloadingAppointment: shipment.unloadingAppointment,
                    loadingAppointment: shipment.loadingAppointment,
                    valueOfGoods: shipment.valueOfGoods ? shipment.valueOfGoods.amount : null,
                    valueOfGoodsCurrency: shipment.valueOfGoods && shipment.valueOfGoods.unit ? shipment.valueOfGoods.unit.code : null,
                    paymentMethod: _.find(this.state.lookup.paymentTypes, {code: shipment.paymentType.code}),
                    longLoad: _.findIndex(shipment.shipmentUnitDetails, {isLongLoad: true}) >= 0,
                    hangingLoad: _.findIndex(shipment.shipmentUnitDetails, {isHangingLoad: true}) >= 0,
                    oversizeLoad: _.findIndex(shipment.shipmentUnitDetails, {isOversizeLoad: true}) >= 0,
                    heavyLoad: shipment.isHeavyLoad,
                    valuableLoad: shipment.isValuableLoad,
                    totalQuantity: shipment.shipmentTotals.totalQuantity,
                    totalVolume: shipment.shipmentTotals.volume,
                    totalLdm: shipment.shipmentTotals.ldm,
                    grossWeight: shipment.shipmentTotals.grossWeight,
                    netWeight: shipment.shipmentTotals.netWeight,
                    packageTypes: shipment.shipmentTotals.packageTypes,
                    temperatureMinValue: this.isShipmentTempControlled(shipment) && shipment.temperatureLimits ? shipment.temperatureLimits.min : null,
                    temperatureMaxValue: this.isShipmentTempControlled(shipment) && shipment.temperatureLimits ? shipment.temperatureLimits.max : null,
                    adrDetails: this.isShipmentHasADR(shipment) && shipment.adrDetails ? shipment.adrDetails.map(details => {
                       return {
                            adrClassDetailsId: details.adrClass.id,
                            quantity: details.quantity,
                            innerQuantity: details.innerQuantity,
                            packageType: details.packageType,
                            innerPackageType: details.innerPackageType,
                            amount: details.amount,
                            unit: details.unit
                       }
                    }) : [],
                    healthCertificateTypes: this.isShipmentHealthCertificated(shipment) ? this.convertCertificateTypes(shipment) : [],
                    borderCustoms: this.isShipmentHealthCertificated(shipment) ? shipment.borderCustoms : null,
                    borderCrossingHealthCheck: this.isShipmentHealthCertificated(shipment) ? shipment.healthCheckAtBorderCrossing : null,
                    vehicleRequirements: this.convertVehicleRequirements(shipment),
                    equipmentRequirements: this.convertEquipmentRequirements(shipment),
                    departureCustoms: shipment.departureCustoms,
                    arrivalCustoms: shipment.arrivalCustoms,
                    customerOrderNumbers: shipment.customerOrderNumbers ? _.filter(shipment.customerOrderNumbers.split("\n"), item => item) : [],
                    senderOrderNumbers: shipment.senderOrderNumbers ? _.filter(shipment.senderOrderNumbers.split("\n"), item => item) : [],
                    consigneeOrderNumbers: shipment.consigneeOrderNumbers ? _.filter(shipment.consigneeOrderNumbers.split("\n"), item => item) : [],
                    insured: shipment.insured,
                    documents: this.collectAllDocuments(shipment),
                    sender: {
                        company: shipment.sender.company,
                        companyLocation: shipment.sender.companyLocation,
                        handlingCompany: shipment.sender.handlingCompany,
                        handlingLocation: shipment.sender.handlingLocation,
                        handlingLocationTimezone: shipment.sender.handlingLocationTimezone,
                        handlingLocationPostalCode: shipment.sender.handlingLocationPostalCode,
                        handlingLocationCountryCode: shipment.sender.handlingLocationCountry,
                        companyContact: this.convertContact(shipment.sender.companyContact),
                        handlingContact: this.convertContact(shipment.sender.handlingContact)
                    },
                    consignee: {
                        company: shipment.consignee.company,
                        companyLocation: shipment.consignee.companyLocation,
                        handlingCompany: shipment.consignee.handlingCompany,
                        handlingLocation: shipment.consignee.handlingLocation,
                        handlingLocationTimezone: shipment.consignee.handlingLocationTimezone,
                        handlingLocationPostalCode: shipment.consignee.handlingLocationPostalCode,
                        handlingLocationCountryCode: shipment.consignee.handlingLocationCountry,
                        companyContact: this.convertContact(shipment.consignee.companyContact),
                        handlingContact: this.convertContact(shipment.consignee.handlingContact)
                    },
                    manufacturer: shipment.manufacturer,
                    units: shipment.shipmentUnitDetails.map(shipmentUnit => {
                        return {
                            quantity: shipmentUnit.quantity,
                            packageType: shipmentUnit.packageType,
                            width: shipmentUnit.width,
                            length: shipmentUnit.length,
                            height: shipmentUnit.height,
                            stackSize: shipmentUnit.stackability ? shipmentUnit.stackability.id : null,
                            templateId: shipmentUnit.templateId
                        }
                    }),
                    definitionOfGoods: shipment.definitionOfGoods ? shipment.definitionOfGoods.map(goods=>{return {name:goods.name, code:goods.code, hscodeId:goods.id}}) :[]
                }
            })
        };
    }

    render(){
        if(!this.state.template){
            return <Loader title="Loading order form" />
        }
        return <CreateOrderForm order = {this.state.order} template = {this.state.template}
                                lookup = {this.state.lookup} senderTemplate = {this.state.senderTemplate}
                                onChange = {(order) => this.updateOrder(order)}
                                onSenderChange = {(shipmentIndex, sender) => this.updateSender(sender, shipmentIndex) }
                                onConsigneeChange = {(shipmentIndex, consignee) => this.updateConsignee(consignee, shipmentIndex) }
                                onCustomizationChange = {(shipmentIndex, customization) => this.handleCustomizationSelect(customization, shipmentIndex)}
                                onCreateNewShipment = {() => this.handleAddNewShipment()}
                                onDeleteShipment = {(shipmentIndex) => this.handleDeleteShipment(shipmentIndex)}
                                onLoadRequirementsChange = {(shipmentIndex, order) => this.handleLoadRequirementsChange(shipmentIndex, order)}
                                onEquipmentRequirementsChange = {(shipmentIndex, order) => this.handleEquipmentRequirementsChange(shipmentIndex, order)}
                                onSave = {() => this.handleSaveOrder()}/>

    }


}