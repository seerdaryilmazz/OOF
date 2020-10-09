import * as axios from 'axios';
import _ from 'lodash';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Notify } from 'susam-components/basic';
import { Loader } from 'susam-components/layout';
import uuid from 'uuid';
import * as Customs from "../Customs";
import { convertEnumToLookup, newPromise } from '../Helper';
import { Kartoteks, LocationService, OrderService, ProjectService } from "../services";
import { CreateOrderFormMulti } from './CreateOrderFormMulti';

export class CreateOrderWithTemplateMulti extends TranslatingComponent {
    state = { senderTemplate: {} };

    componentDidMount() {
        this.load();
    }
    prepareTemplateDetails(template) {
        this.assignKeyForCustomizations(template);
        if(template.defaults && template.defaults.currencies){
            template.defaults.currencies.forEach(currency => currency.id = currency.code);
        }
    }
    createOrderWithTemplate(state) {
        state.order = this.createOrder(state.template);
        state.order.subsidiaries = state.lookup.subsidiaries;
        this.createShipmentWithTemplate(state);
    }
    createShipmentWithTemplate(state) {
        let shipment = this.createShipment(state.template, state.order.shipments.length);
        shipment.senderCustomizations = this.filterCustomizationsByOrderInfo(state.order, state.template["senderCustomizations"], shipment.index);
        state.order.shipments.push(shipment);
        return shipment;
    }

    hasEmptyField(customization){
        let emptyKeys = [];
        _.each(customization.customizedDefaults, (value, key) => {
            if(value && _.isArray(value) && 0 === value.length){
                emptyKeys.push(key);
            }
        })
        return !_.isEmpty(emptyKeys);
    }

    filterCustomizationsByOrderInfo(order, customizations, shipmentIndex){
        let filterdCustomizations = _.reject(customizations, o=>this.hasEmptyField(o));
        if(shipmentIndex !== 0){
            filterdCustomizations = _.filter(filterdCustomizations, customization=>{
                let loadTypeVal = (_.isEmpty(customization.customizedDefaults.loadTypes) || -1 !== _.findIndex(customization.customizedDefaults.loadTypes, o=>{
                    return o.code === order.truckLoadType.code
                }));
                let serviceTypeVal = (_.isEmpty(customization.customizedDefaults.serviceTypes) || -1 !== _.findIndex(customization.customizedDefaults.serviceTypes, o=>{
                    return o.code === order.serviceType.code
                }));
                return loadTypeVal && serviceTypeVal; 
            });
        }
        filterdCustomizations.forEach(customization=>{
            customization.manufacturers && customization.manufacturers.forEach(m=>m._key=uuid.v4());
            customization._key = uuid.v4();
            customization.customizedDefaults.currencies && customization.customizedDefaults.currencies.forEach(currency=>currency.id = currency.code);
        });
        return filterdCustomizations;
    }
    setSingleItemLookupValuesToOrder(order) {
        order.subsidiary = order.subsidiaries && order.subsidiaries.length > 0 ? order.subsidiaries[0] : order.subsidiary;
        order.truckLoadType = order.truckLoadTypes && order.truckLoadTypes.length === 1 ? order.truckLoadTypes[0] : order.truckLoadType;
        order.serviceType = order.serviceTypes && order.serviceTypes.length === 1 ? order.serviceTypes[0] : order.serviceType;
        order.originalCustomer = order.originalCustomers && order.originalCustomers.length === 1 ? order.originalCustomers[0] : order.originalCustomer;
    }
    setSingleItemLookupValuesToShipment(shipment) {
        shipment.incoterm = shipment.lookup.incoterms && shipment.lookup.incoterms.length === 1 ? shipment.lookup.incoterms[0] : null;
        shipment.paymentType = shipment.lookup.paymentTypes && shipment.lookup.paymentTypes.length === 1 ? shipment.lookup.paymentTypes[0] : null;
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

    load() {
        let calls = [
            OrderService.getLookupsForCreateOrder(),
            LocationService.listCustomsOffices(),
            ProjectService.getTemplateById(this.props.templateId)
        ];
        axios.all(calls).then(axios.spread(
            (createOrderLookups, customsOffices, template) => {
                let state = _.cloneDeep(this.state);
                state.lookup = {
                    subsidiaries: this.context.user.subsidiaries,
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
                this.isCompanyPartner(state, state=>{
                    this.setFirstCustomizations(state, 0);
                });

            }
        )).catch(error => { Notify.showError(error); console.log(error) });
    }

    setFirstCustomizations(state, shipmentIndex) {
        let shipment = state.order.shipments[shipmentIndex];
        if (shipment.senderCustomizations && shipment.senderCustomizations.length === 1) {
            shipment.sender = _.cloneDeep(_.first(shipment.senderCustomizations));
            if('REQUIRED' === shipment.sender.manufacturerOption.code && 1 === shipment.sender.manufacturers.length){
                shipment.manufacturer =_.first(shipment.sender.manufacturers);
            }
        }
        if (shipment.consigneeCustomizations && shipment.consigneeCustomizations.length === 1) {
            shipment.consignee = _.cloneDeep(_.first(shipment.consigneeCustomizations));
        }
        this.loadTemplateRules(state, shipmentIndex, (state) => {
            this.setState(state, () => {
                if(shipment.consignee && shipment.sender){
                    this.loadPartyOptions(shipmentIndex);
                } else if(shipment.sender){
                    this.updateSender(shipment.sender, shipmentIndex);
                }
            });
        });
    }

    loadPartyOptions(shipmentIndex){
        this.loadSenderOptions(shipmentIndex, order=>this.loadConsigneeOptions(shipmentIndex, undefined, order));
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
        shipment.askSenderOrderNumbers = shipment.sender.askOrderNumbers;
        shipment.askConsigneeOrderNumbers = customization.askOrderNumbers;

        shipment.askLoadingOrderNumbers = shipment.sender.askBookingOrderNumbers;
        shipment.askUnloadingOrderNumbers = customization.askBookingOrderNumbers;

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

    loadConsigneeOptions(shipmentIndex, callback, order = _.cloneDeep(this.state.order)) {
        let consignee = this.state.order.shipments[shipmentIndex].consignee;
        let handlingCompanyType = _.get(consignee, 'handlingCompany.type');

        let calls = [
            handlingCompanyType === 'COMPANY' ? Kartoteks.getCompanyLocation(consignee.handlingLocation.id) : LocationService.getCustomsOfficeLocation(consignee.handlingLocation.id),
            handlingCompanyType === 'COMPANY' ? LocationService.getWarehouseDetails(consignee.handlingLocation.id) : newPromise({}),
            LocationService.getCustomerWarehouseDetailsByType(consignee.handlingLocation.id, handlingCompanyType),
            LocationService.getCustomsLocationByLocationId(consignee.handlingLocation.id, handlingCompanyType),
            handlingCompanyType === 'COMPANY' ? ProjectService.executeWarehouseRulesForLocation(consignee.handlingLocation.id) : newPromise(undefined),
        ];

        axios.all(calls).then(axios.spread((locationDetails, crossDockDetail, warehouseDetail, customsDetails, warehouseRules) => {
            if (locationDetails) {
                order.shipments[shipmentIndex].consignee.handlingLocationTimezone = locationDetails.data.timezone;
                order.shipments[shipmentIndex].consignee.handlingLocationCountry = _.defaultTo(locationDetails.data.postaladdress, locationDetails.data).country.iso;
                order.shipments[shipmentIndex].consignee.handlingLocationPostalCode = _.defaultTo(locationDetails.data.postaladdress, locationDetails.data).postalCode;
            }

            order.shipments[shipmentIndex].consignee.handlingLocationDetail = null;
            if (crossDockDetail || warehouseDetail) {
                let askForHandlingLocationAppointment = _.isEmpty(crossDockDetail.data), haveHandlingAppointment = false;
                let bookingUnloading = warehouseDetail.data.bookingUnloading;
                if (bookingUnloading && bookingUnloading.bookingOption) {
                    let bookingOptionId = bookingUnloading.bookingOption.id;
                    let bookingTypeId = bookingUnloading.bookingType ? bookingUnloading.bookingType.id : "";
                    askForHandlingLocationAppointment = bookingOptionId === "ASK";
                    haveHandlingAppointment = bookingOptionId === "ALWAYS" && bookingTypeId === "ORDER_REQUEST";
                }
                if (!askForHandlingLocationAppointment && !haveHandlingAppointment) {
                    order.shipments[shipmentIndex].unloadingAppointment = null;
                }
                order.shipments[shipmentIndex].askForUnloadingAppointment = askForHandlingLocationAppointment;
                order.shipments[shipmentIndex].haveUnloadingAppointment = haveHandlingAppointment;
                order.shipments[shipmentIndex].consignee.handlingLocationDetail = crossDockDetail.data || warehouseDetail.data;
            }

            order.shipments[shipmentIndex].consignee.handlingLocationCustomsDetails = null;
            order.shipments[shipmentIndex].arrivalCustomsFromConsignee = null;
            order.shipments[shipmentIndex].arrivalCustoms = null;
            if (customsDetails) {
                if (customsDetails.data && customsDetails.data.customsType && customsDetails.data.customsType.id !== "NON_BONDED_WAREHOUSE") {
                    order.shipments[shipmentIndex].consignee.handlingLocationCustomsDetails = _.cloneDeep(customsDetails.data);
                }
                this.setCustomsArrivalData(order.shipments[shipmentIndex]);
            }

            order.shipments[shipmentIndex].vehicleRequirements.requiredByWarehouseForUnloading = []
            if (warehouseRules) {
                order.shipments[shipmentIndex].vehicleRequirements.requiredByWarehouseForUnloading = warehouseRules.data.requiredForUnloading;
            }
            return LocationService.getCountry(order.shipments[shipmentIndex].consignee.handlingLocationCountry);
        })).then(response => {
            order.shipments[shipmentIndex].consignee.handlingLocationInEU = response.data.euMember;
            this.setCustomsNeeded(order.shipments[shipmentIndex]);
            if (!order.shipments[shipmentIndex].askCustomsInfo) {
                order.shipments[shipmentIndex].arrivalCustoms = null;
            }
            this.setState({ order: order }, () => this.loadCustomsRules(shipmentIndex));
            callback && callback(order);
        }).catch(error => Notify.showError(error));

    }

    loadSenderOptions(shipmentIndex, callback, order=_.cloneDeep(this.state.order)) {
        let sender = this.state.order.shipments[shipmentIndex].sender;
        let handlingCompanyType = _.get(sender, 'handlingCompany.type');
        let calls = [
            handlingCompanyType === 'COMPANY' ? ProjectService.searchSenderTemplates(sender.company.id, sender.handlingCompany.id, sender.handlingLocation.id) : newPromise(undefined),
            handlingCompanyType === 'COMPANY' ? Kartoteks.getCompanyLocation(sender.handlingLocation.id) : LocationService.getCustomsOfficeLocation(sender.handlingLocation.id),
            handlingCompanyType === 'COMPANY' ? LocationService.getWarehouseDetails(sender.handlingLocation.id) : newPromise({}),
            LocationService.getCustomerWarehouseDetailsByType(sender.handlingLocation.id, handlingCompanyType),
            handlingCompanyType === 'COMPANY' ? ProjectService.executeWarehouseRulesForLocation(sender.handlingLocation.id) : newPromise(undefined),
        ];

        order.shipments[shipmentIndex].lookup.packageDetails = [];
        order.shipments[shipmentIndex].lookup.loadRequirements = [
            { id: "ADR", icon: "alert-octagon", text: "Dangerous (ADR)" },
            { id: "CERTIFICATE", icon: "certificate", text: "Certificated" },
            { id: "FRIGO", icon: "thermometer", text: "Temperature Controlled" },
            { id: "NONE", icon: "check-circle", text: "None" }
        ];

        order.shipments[shipmentIndex].lookup.certificateTypes = [];
        order.shipments[shipmentIndex].lookup.healthCheckCustoms = [];
        order.shipments[shipmentIndex].lookup.adrUnDetails = [];
        order.shipments[shipmentIndex].askHealthCheckAtBorder = true;
        order.shipments[shipmentIndex].lookup.goods = [];
        
        axios.all(calls).then(axios.spread((senderTemplate, locationDetails, crossDockDetail, warehouseDetail, warehouseRules) => {
            if (senderTemplate && senderTemplate.data) {
                order.shipments[shipmentIndex].lookup.loadRequirements = [];
                if (senderTemplate.data.shouldDangerousGoodsBeAsked) {
                    order.shipments[shipmentIndex].lookup.loadRequirements.push({ id: "ADR", icon: "alert-octagon", text: "Dangerous (ADR)" });
                }
                if (senderTemplate.data.shouldCertificatedGoodsBeAsked) {
                    order.shipments[shipmentIndex].lookup.loadRequirements.push({ id: "CERTIFICATE", icon: "certificate", text: "Certificated" });
                }
                if (senderTemplate.data.shouldTemperatureControlledGoodsBeAsked) {
                    order.shipments[shipmentIndex].lookup.loadRequirements.push({ id: "FRIGO", icon: "thermometer", text: "Temperature Controlled" });
                }
                if (order.shipments[shipmentIndex].lookup.loadRequirements.length > 0) {
                    order.shipments[shipmentIndex].lookup.loadRequirements.push({ id: "NONE", icon: "check-circle", text: "None" });
                }
                if (senderTemplate.data.shouldCertificatedGoodsBeAsked) {
                    order.shipments[shipmentIndex].lookup.certificateTypes = senderTemplate.data.healthCertificates;
                }
                order.shipments[shipmentIndex].askHealthCheckAtBorder = senderTemplate.data.shouldHealthCheckBeAsked;
                if (order.shipments[shipmentIndex].askHealthCheckAtBorder) {
                    order.shipments[shipmentIndex].lookup.healthCheckCustoms = senderTemplate.data.borderCustoms;
                }
                if (senderTemplate.data.shouldDangerousGoodsBeAsked && senderTemplate.data.unIds.length > 0) {
                    this.loadAdrDetails(senderTemplate.data.unIds, adrDetails => order.shipments[shipmentIndex].lookup.adrUnDetails = adrDetails);
                }
                if(senderTemplate.data.packageDetails){
                    order.shipments[shipmentIndex].lookup.packageDetails = senderTemplate.data.packageDetails;
                    order.shipments[shipmentIndex].lookup.packageDetails.forEach(details => details._key = uuid.v4());
                }
                if(senderTemplate.data.goods){
                    order.shipments[shipmentIndex].lookup.goods = senderTemplate.data.goods;
                    order.shipments[shipmentIndex].lookup.goods.forEach(details => details._key = uuid.v4());
                }
            }

            if (locationDetails) {
                order.shipments[shipmentIndex].sender.handlingLocationTimezone = locationDetails.data.timezone;
                order.shipments[shipmentIndex].sender.handlingLocationCountry = _.defaultTo(locationDetails.data.postaladdress, locationDetails.data).country.iso;
                order.shipments[shipmentIndex].sender.handlingLocationPostalCode = _.defaultTo(locationDetails.data.postaladdress, locationDetails.data).postalCode;
            }

            order.shipments[shipmentIndex].sender.handlingLocationDetail = null;
            if (crossDockDetail || warehouseDetail) {
                let askForHandlingLocationAppointment = _.isEmpty(crossDockDetail.data), haveHandlingAppointment = false;
                let bookingLoading = warehouseDetail.data.bookingLoading;
                if (bookingLoading && bookingLoading.bookingOption) {
                    let bookingOptionId = bookingLoading.bookingOption.id;
                    let bookingTypeId = bookingLoading.bookingType ? bookingLoading.bookingType.id : "";
                    askForHandlingLocationAppointment = bookingOptionId === "ASK";
                    haveHandlingAppointment = bookingOptionId === "ALWAYS" && bookingTypeId === "ORDER_REQUEST";
                }
                if (!askForHandlingLocationAppointment) {
                    if (haveHandlingAppointment) {
                        order.shipments[shipmentIndex].readyDateTime = null;
                    } else {
                        order.shipments[shipmentIndex].loadingAppointment = null;
                    }
                }
                order.shipments[shipmentIndex].askForLoadingAppointment = askForHandlingLocationAppointment;
                order.shipments[shipmentIndex].haveLoadingAppointment = haveHandlingAppointment;
                order.shipments[shipmentIndex].sender.handlingLocationDetail = crossDockDetail.data || warehouseDetail.data;
            }

            order.shipments[shipmentIndex].vehicleRequirements.requiredByWarehouseForLoading = [];
            order.shipments[shipmentIndex].equipmentRequirements = [];
            if (warehouseRules) {
                order.shipments[shipmentIndex].vehicleRequirements.requiredByWarehouseForLoading = warehouseRules.data.requiredForLoading;
                if (warehouseRules.data.requiredEquipments) {
                    order.shipments[shipmentIndex].equipmentRequirements =
                        Object.keys(warehouseRules.data.requiredEquipments).map(key => {
                            return {
                                equipmentType: _.find(this.state.lookup.equipmentTypes, item => item.id == key),
                                equipmentCount: warehouseRules.data.requiredEquipments[key],
                                equipmentCountRequiredByWarehouse: warehouseRules.data.requiredEquipments[key],
                            };
                        });
                }
            }
            return LocationService.getCountry(order.shipments[shipmentIndex].sender.handlingLocationCountry);
        })).then(response => {
            order.shipments[shipmentIndex].sender.handlingLocationInEU = response.data.euMember;
            this.setCustomsNeeded(order.shipments[shipmentIndex]);
            if (!order.shipments[shipmentIndex].askCustomsInfo) {
                order.shipments[shipmentIndex].departureCustoms = null;
            }
            this.setState({ order: order }, () => this.loadCustomsRules(shipmentIndex));
            callback && callback(order)
        }).catch(error => Notify.showError(error));
    }

    getConsigneeEUMembership(isoCode, shipmentIndex, callback) {
        LocationService.getCountry(isoCode).then(response => {
            let order = _.cloneDeep(this.state.order);
            order.shipments[shipmentIndex].consignee.handlingLocationInEU = response.data.euMember;
            this.setCustomsNeeded(order.shipments[shipmentIndex]);
            if (!order.shipments[shipmentIndex].askCustomsInfo) {
                order.shipments[shipmentIndex].arrivalCustoms = null;
            }
            this.setState({ order: order });
        })
    }
    getSenderEUMembership(isoCode, shipmentIndex) {
        LocationService.getCountry(isoCode).then(response => {
            let order = _.cloneDeep(this.state.order);
            order.shipments[shipmentIndex].sender.handlingLocationInEU = response.data.euMember;
            this.setCustomsNeeded(order.shipments[shipmentIndex]);
            if (!order.shipments[shipmentIndex].askCustomsInfo) {
                order.shipments[shipmentIndex].departureCustoms = null;
            }
            this.setState({ order: order });
        })
    }
    setCustomsArrivalData(shipment) {
        if (!shipment.consignee || !shipment.consignee.handlingLocationCustomsDetails || !shipment.consignee.handlingLocationCountry) {
            return;
        }
        if (shipment.consignee.customsDefinitions && shipment.consignee.customsDefinitions.length > 0) {
            //there are customs definitions from rules, don't set default customs
            return;
        }
        if (shipment.consignee.handlingLocationCountry === "TR") {
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

    setCustomsNeeded(shipment) {
        if (shipment.sender && shipment.consignee && shipment.sender.handlingLocationCountry !== shipment.consignee.handlingLocationCountry) {
            shipment.transportToOtherCountry = true;
            shipment.askCustomsInfo = !(shipment.sender.handlingLocationInEU && shipment.consignee.handlingLocationInEU);
        }
    }
    loadCustomsDetails(locationId, onSuccess) {
        LocationService.getCustomsLocationByLocationId(locationId).then(response => {
            onSuccess(response.data);
        }).catch(error => Notify.showError(error));
    }
    loadHandlingLocationCrossDockDetails(locationId, companyType, onSuccess) {
        if (companyType === 'COMPANY') {
            LocationService.getWarehouseDetails(locationId).then(response => {
                onSuccess(response.data);
            }).catch(error => Notify.showError(error));
        } else if (companyType === 'CUSTOMS') {
            onSuccess();
        }
    }
    loadHandlingLocationWhDetails(locationId, companyType,  onSuccess) {
        LocationService.getCustomerWarehouseDetailsByType(locationId, companyType).then(response => {
            onSuccess(response.data);
        }).catch(error => Notify.showError(error));
    }
    loadHandlingLocationDetails(locationId, companyType, onSuccess) {
        let call = null;
        if(companyType === 'COMPANY'){
            call = ()=>Kartoteks.getCompanyLocation(locationId);
        } else if(companyType === 'CUSTOMS'){
            call = ()=>LocationService.getCustomsOfficeLocation(locationId);
        }
        call().then(response => {
            onSuccess(response.data);
        }).catch(error => Notify.showError(error));
    }

    loadAdrUnIdDetails(idList, shipmentIndex) {
        OrderService.getAdrUNIdDetails(idList).then(response => {
            let order = _.cloneDeep(this.state.order);
            let shipment = order.shipments[shipmentIndex];
            shipment.lookup.adrUnDetails = response.data;
            this.setState({ order: order });
        }).catch(error => Notify.showError(error));
    }
    loadAdrDetails(idList, callback) {
        OrderService.getAdrUNIdDetails(idList).then(response => {
            callback && callback(response.data);
        }).catch(error => Notify.showError(error));
    }

    loadCustomsRules(shipmentIndex) {
        let shipment = this.state.order.shipments[shipmentIndex];
        if (shipment.askCustomsInfo === false) {
            return;
        }

        if (shipment.sender && shipment.consignee) {
            let calls = [
                ProjectService.getConsigneeCustomsForCompanyAndLocation(shipment.consignee.company.id, shipment.consignee.handlingLocation.id, shipment.consignee.handlingCompany.type),
                ProjectService.getSenderCustomsForCompanyAndLocation(shipment.sender.company.id, shipment.sender.handlingLocation.id, shipment.sender.handlingCompany.type)
            ];

            axios.all(calls).then(axios.spread((arrivalCustoms, departureCustoms) => {
                let order = _.clone(this.state.order);
                if (arrivalCustoms && !_.isEmpty(arrivalCustoms.data)) {
                    order.shipments[shipmentIndex].consignee.customsDefinitions =
                        _.flatten(arrivalCustoms.data.map(customsDefinition => customsDefinition.outputList.map(output => {
                            let data = _.cloneDeep(output);
                            data.dangerousGoods = customsDefinition.dangerousGoods;
                            data.temperatureControlledGoods = customsDefinition.temperatureControlledGoods;
                            data._key = uuid.v4();
                            return data;
                        })));
                    if (order.shipments[shipmentIndex].consignee.handlingLocationCountry === "TR") {
                        this.filterCustomsDefinitions(order, shipmentIndex);
                    } else {
                        order.shipments[shipmentIndex].consignee.filteredCustomsDefinitions = order.shipments[shipmentIndex].consignee.customsDefinitions;
                    }

                    if (order.shipments[shipmentIndex].consignee.filteredCustomsDefinitions && order.shipments[shipmentIndex].consignee.filteredCustomsDefinitions.length === 1) {
                        order.shipments[shipmentIndex].arrivalCustoms = order.shipments[shipmentIndex].consignee.filteredCustomsDefinitions[0];
                    } else {
                        order.shipments[shipmentIndex].arrivalCustoms = null;
                    }
                }
                order.shipments[shipmentIndex].askDepartureCustoms = true;
                if (departureCustoms && !_.isEmpty(departureCustoms.data)) {
                    if (_.isEmpty(departureCustoms.data) || 0 <= _.findIndex(departureCustoms.data, i => _.isEmpty(i.option) || i.option.code === 'ASK')) {
                        order.shipments[shipmentIndex].sender.customsDefinitions = _.flatten(departureCustoms.data.map(item => item.outputList));
                        order.shipments[shipmentIndex].sender.customsDefinitions.forEach(item => item._key = uuid.v4());
                        if (order.shipments[shipmentIndex].sender.customsDefinitions.length === 1) {
                            order.shipments[shipmentIndex].departureCustoms = order.shipments[shipmentIndex].sender.customsDefinitions[0];
                        } else {
                            order.shipments[shipmentIndex].departureCustoms = null;
                        }
                    } else {
                        order.shipments[shipmentIndex].askDepartureCustoms = false;
                    }
                }
                this.setState({order: order});
            }))
        }
    }

    handleCustomizationSelect(customization, shipmentIndex) {
        if (shipmentIndex === 0) {
            this.selectFirstCustomization(customization);
        } else {
            this.selectCustomization(customization, shipmentIndex);
        }
    }

    isCompanyPartner(state, callback) {
        Kartoteks.isCompanyPartner(state.order.customer.id).then(response => {
            state.order.customerIsPartner = response.data;
            this.setState(state, () => {
                callback && callback(state);
            });
        }).catch(error => Notify.showError(error));
    }

    createOrder(template) {
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
    createShipment(template, index) {
        let shipment = {
            senderCustomizations: [],
            consigneeCustomizations: [],
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
        shipment.askCustomerOrderNumbers = template.askOrderNumbers;
        shipment.index = index;
        return shipment;
    }
    assignKeyForCustomizations(template) {
        template.senderCustomizations.forEach(customization => {
            customization._key = uuid.v4();
        });
        template.consigneeCustomizations.forEach(customization => {
            customization._key = uuid.v4();
        });
    }

    handleAddNewShipment() {
        let state = _.cloneDeep(this.state);
        let shipment = this.createShipmentWithTemplate(state);
        this.setFirstCustomizations(state, shipment.index);
    }

    handleDeleteShipment(shipmentIndex) {
        let state = _.cloneDeep(this.state);
        if (state.order.shipments.length > shipmentIndex) {
            state.order.shipments.splice(shipmentIndex, 1);
        }
        this.setState(state);
    }
    handleLoadRequirementsChange(shipmentIndex, order) {
        this.filterCustomsDefinitions(order, shipmentIndex);
        this.updateOrder(order, () => {
            if (_.find(order.shipments[shipmentIndex].loadRequirements, { id: "ADR" })) {
                OrderService.getAdrDocumentTypes().then(response => {
                    let lookup = _.cloneDeep(this.state.lookup);
                    lookup.adrDocumentTypes = response.data;
                    this.setState({ lookup: lookup });
                }).catch(error => Notify.showError(error));
            }
            if (_.find(order.shipments[shipmentIndex].loadRequirements, { id: "CERTIFICATE" })) {
                OrderService.getHealthCertificateTypes().then(response => {
                    let lookup = _.cloneDeep(this.state.lookup);
                    lookup.certificateTypes = response.data;
                    this.setState({ lookup: lookup });
                }).catch(error => Notify.showError(error));
                LocationService.getBorderCustoms().then(response => {
                    let lookup = _.cloneDeep(this.state.lookup);
                    lookup.borderCustoms = response.data;
                    this.setState({ lookup: lookup });
                }).catch(error => Notify.showError(error));
            }
        });
    }
    filterCustomsDefinitions(order, shipmentIndex) {
        let shipment = order.shipments[shipmentIndex];

        let hasDangerousGoods = _.isArray(shipment.loadRequirements) && _.find(shipment.loadRequirements, { id: "ADR" });
        let hasTempControlledGoods = _.isArray(shipment.loadRequirements) && _.find(shipment.loadRequirements, { id: "FRIGO" });

        shipment.consignee.filteredCustomsDefinitions =
            Customs.filterCustomsRuleResults(shipment.consignee.customsDefinitions, hasDangerousGoods, hasTempControlledGoods);;
        shipment.consignee.filteredCustomsDefinitions.forEach(item => {
            if (!item._key) {
                item._key = uuid.v4();
            }
        });

        if (shipment.consignee.filteredCustomsDefinitions.length === 1) {
            shipment.arrivalCustoms = order.shipments[shipmentIndex].consignee.filteredCustomsDefinitions[0];
        } else {
            if (shipment.arrivalCustoms) {
                if (!shipment.arrivalCustoms.readOnly) {
                    let selectedCustoms = _.find(shipment.consignee.filteredCustomsDefinitions, { _key: shipment.arrivalCustoms._key });
                    shipment.arrivalCustoms = _.cloneDeep(selectedCustoms);
                } else {
                    if (Customs.isCustomsTypeNeedsLoadTypeCheck(shipment.arrivalCustoms.customsType)) {
                        if (hasDangerousGoods && !shipment.arrivalCustoms.usedForDangerousGoods) {
                            shipment.arrivalCustoms = null;
                        }
                        if (hasTempControlledGoods && !shipment.arrivalCustoms.usedForTempControlledGoods) {
                            shipment.arrivalCustoms = null;
                        }
                    }
                }
            } else if (shipment.arrivalCustomsFromConsignee) {
                if (Customs.isCustomsTypeNeedsLoadTypeCheck(shipment.arrivalCustomsFromConsignee.customsType)) {
                    let suitable = true;
                    if (hasDangerousGoods && !shipment.arrivalCustomsFromConsignee.usedForDangerousGoods) {
                        suitable = false;
                    }
                    if (hasTempControlledGoods && !shipment.arrivalCustomsFromConsignee.usedForTempControlledGoods) {
                        suitable = false;
                    }
                    if (suitable) {
                        shipment.arrivalCustoms = _.cloneDeep(shipment.arrivalCustomsFromConsignee);
                    }
                } else {
                    shipment.arrivalCustoms = _.cloneDeep(shipment.arrivalCustomsFromConsignee);
                }
            }
        }
    }
    handleEquipmentRequirementsChange(shipmentIndex, order) {
        this.updateOrder(order, () => {
            let shipment = order.shipments[shipmentIndex];
            if (_.find(shipment.requirements, { id: "VEHICLE" })) {
                OrderService.getVehicleFeaturesForCreateOrder().then(response => {
                    let lookup = _.cloneDeep(this.state.lookup);
                    let filteredFeatures = response.data;
                    if (shipment.vehicleRequirements) {
                        lookup.vehicleFeaturesLoading = _.filter(filteredFeatures, item => {
                            return _.findIndex(shipment.vehicleRequirements.requiredByWarehouseForLoading, { code: item.code }) === -1;
                        });
                        lookup.vehicleFeaturesUnloading = _.filter(filteredFeatures, item => {
                            return _.findIndex(shipment.vehicleRequirements.requiredByWarehouseForUnloading, { code: item.code }) === -1;
                        });
                    } else {
                        lookup.vehicleFeaturesLoading = filteredFeatures;
                        lookup.vehicleFeaturesUnloading = filteredFeatures;
                    }
                    this.setState({ lookup: lookup });
                }).catch(error => Notify.showError(error));
                OrderService.getPermissionTypes().then(response => {
                    let lookup = _.cloneDeep(this.state.lookup);
                    lookup.permissionTypes = response.data;
                    this.setState({ lookup: lookup });
                }).catch(error => Notify.showError(error));
            }

        });
    }

    loadTemplateRules(state, shipmentIndex, callback) {
        let sender = state.order.shipments[shipmentIndex].sender;
        let consignee = state.order.shipments[shipmentIndex].consignee;
        if(sender && consignee) {
            if(shipmentIndex === 0){
                this.updateOrderWithCustomization(state.order, state.template, consignee);
            }
            this.updateShipmentWithCustomization(state.order.shipments[shipmentIndex], state.template, consignee);
            callback && callback(state);
        } else if (sender) {
            ProjectService.getTemplateRules(this.props.templateId, sender, consignee).then(response => {
                let customizations = this.filterCustomizationsByOrderInfo(state.order, response.data.customizations, shipmentIndex);
                state.order.shipments[shipmentIndex].consigneeCustomizations = customizations;
                if(customizations.length===1){
                    consignee = _.first(customizations);
                    state.order.shipments[shipmentIndex].consignee = consignee
                    if (shipmentIndex === 0) {
                        this.updateOrderWithCustomization(state.order, state.template, consignee);
                    }
                    this.updateShipmentWithCustomization(state.order.shipments[shipmentIndex], state.template, consignee);
                }
                delete state.order.shipments[shipmentIndex]["askCustomsInfo"];
                callback && callback(state);
            }).catch(error => {
                console.log(error)
                Notify.showError(error);
                callback && callback(state);
            });
        } else {
            callback && callback(state);
        }
    }

    updateSender(sender, shipmentIndex) {
        let state = _.cloneDeep(this.state);
        state.order.shipments[shipmentIndex].sender = _.cloneDeep(sender);
        state.order.shipments[shipmentIndex].manufacturer = null;
        state.order.shipments[shipmentIndex].consignee = null;

        if('REQUIRED' === state.order.shipments[shipmentIndex].sender.manufacturerOption.code && 1 === state.order.shipments[shipmentIndex].sender.manufacturers.length){
            state.order.shipments[shipmentIndex].manufacturer=_.first(state.order.shipments[shipmentIndex].sender.manufacturers);
        }

        if(0 === shipmentIndex){
            state.order.shipments[shipmentIndex].truckLoadType = null
            state.order.shipments[shipmentIndex].serviceType = null
        }
        this.loadTemplateRules(state, shipmentIndex, (state) => {
            this.setState(state, ()=>{
                this.loadSenderOptions(shipmentIndex, order=>{
                    let shipment = order.shipments[shipmentIndex];
                    if(shipment.consigneeCustomizations && shipment.consigneeCustomizations.length===1){
                        this.loadConsigneeOptions(shipmentIndex, undefined, order)
                    }
                });
            });
        });
    }
    updateConsignee(consignee, shipmentIndex) {
        let state = _.cloneDeep(this.state);
        state.order.shipments[shipmentIndex].consignee = _.cloneDeep(consignee);
        this.loadTemplateRules(state, shipmentIndex, (state) => {
            this.setState(state, () => {
                this.loadConsigneeOptions(shipmentIndex);
            });
        });
    }
    updateOrder(order, onUpdate) {
        this.setState({ order: order }, () => {
            onUpdate && onUpdate();
        });
    }
    handleSaveOrder() {
        console.log("raw order data", this.state.order);
        let createOrderRequest = {
            order: this.convertOrder(this.state.order),
            confirmed: this.state.order.confirmed,
            numberOfReplications: this.state.order.replicateOrder ? this.state.order.numberOfReplications.id : 1
        };
        this.props.onSave(createOrderRequest);
    }
    convertVehicleRequirements(shipment) {

        let loadingRequirements = [];
        if (this.isShipmentHasVehicleRequirements(shipment)) {
            shipment.vehicleRequirements.requiredForLoading.forEach(item => {
                loadingRequirements.push({
                    requirementReason: { code: 'BY_ORDER' },
                    requirement: item
                });
            });
        }
        shipment.vehicleRequirements.requiredByWarehouseForLoading.forEach(item => {
            loadingRequirements.push({
                requirementReason: { code: 'BY_WAREHOUSE' },
                requirement: item
            });
        });
        shipment.vehicleRequirements.requiredByLoad.forEach(item => {
            loadingRequirements.push({
                requirementReason: { code: 'BY_LOAD' },
                requirement: item
            });
        });

        let uniqueLoadingRequirements = _.uniqWith(loadingRequirements, (item1, item2) => item1.requirement.code === item2.requirement.code);
        uniqueLoadingRequirements.forEach(requirement => {
            requirement.operationType = { code: "COLLECTION" };
        });

        let unloadingRequirements = [];
        if (this.isShipmentHasVehicleRequirements(shipment)) {
            shipment.vehicleRequirements.requiredForUnloading.forEach(item => {
                unloadingRequirements.push({
                    requirementReason: { code: 'BY_ORDER' },
                    requirement: item
                });
            });
        }
        shipment.vehicleRequirements.requiredByWarehouseForUnloading.forEach(item => {
            unloadingRequirements.push({
                requirementReason: { code: 'BY_WAREHOUSE' },
                requirement: item
            });
        });
        shipment.vehicleRequirements.requiredByLoad.forEach(item => {
            unloadingRequirements.push({
                requirementReason: { code: 'BY_LOAD' },
                requirement: item
            });
        });

        let uniqueUnloadingRequirements = _.uniqWith(unloadingRequirements, (item1, item2) => item1.requirement.code === item2.requirement.code);
        uniqueUnloadingRequirements.forEach(requirement => {
            requirement.operationType = { code: "DISTRIBUTION" };
        });

        return uniqueLoadingRequirements ? uniqueLoadingRequirements.concat(uniqueUnloadingRequirements) : uniqueUnloadingRequirements;
    }
    convertEquipmentRequirements(shipment) {
        if (!this.isShipmentHasEquipmentRequirements(shipment)) {
            let requiredByWarehouse = _.filter(shipment.equipmentRequirements, item => !_.isNil(item.equipmentCountRequiredByWarehouse));
            if (requiredByWarehouse.length > 0) {
                return requiredByWarehouse.map(requirement => {
                    return {
                        equipment: requirement.equipmentType,
                        count: requirement.equipmentCountRequiredByWarehouse
                    };
                })
            } else {
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
    convertCertificateTypes(shipment) {
        let certificates = [];
        if (shipment.certificateTypes) {
            certificates = shipment.certificateTypes.manualTypes ?
                shipment.certificateTypes.manualTypes.concat(shipment.certificateTypes.uploadTypes) : shipment.certificateTypes.uploadTypes;
        }
        certificates = certificates.map(cert => _.find(this.state.lookup.certificateTypes, { code: cert.code }));
        return certificates;
    }
    collectAllDocuments(shipment) {
        let documents = [];
        if (this.isShipmentHasADR(shipment)) {
            documents = documents.concat(this.createDocuments(shipment.adrDocuments));
        }
        if (this.isShipmentHealthCertificated(shipment)) {
            documents = documents.concat(this.createDocuments(shipment.healthDocuments));
        }
        documents = documents.concat(this.createDocuments(shipment.shipmentDocuments));
        return documents;
    }
    createDocuments(documents) {
        let createdDocuments = [];
        if (!documents || documents.length === 0) {
            return createdDocuments;
        }
        documents.forEach(document => {
            if (document.types) {
                document.types.forEach(type => {
                    createdDocuments.push(this.createDocument(type, document.document.tempFileName, document.document.originalName, document.description));
                });
            }
        });
        return createdDocuments;
    }
    createDocument(type, tempFileName, originalFileName, description) {
        let types = _.concat(this.state.lookup.documentTypes, _.concat(this.state.lookup.certificateTypes, this.state.lookup.adrDocumentTypes));
        return {
            type: _.find(types, { code: type.code }),
            savedFileName: tempFileName,
            originalFileName: originalFileName,
            description: description
        };
    }
    convertContact(contact) {
        if (!contact) {
            return null;
        }
        return {
            id: contact.id,
            name: contact.fullname
        }
    }
    isShipmentTempControlled(shipment) {
        return _.find(shipment.loadRequirements, { id: "FRIGO" });
    }
    isShipmentHasADR(shipment) {
        return _.find(shipment.loadRequirements, { id: "ADR" });
    }
    isShipmentHealthCertificated(shipment) {
        return _.find(shipment.loadRequirements, { id: "CERTIFICATE" });
    }
    isShipmentHasVehicleRequirements(shipment) {
        return _.find(shipment.requirements, { id: "VEHICLE" });
    }
    isShipmentHasEquipmentRequirements(shipment) {
        return _.find(shipment.requirements, { id: "EQUIPMENT" });
    }
    convertCustoms(customsData){
        if(customsData){
            let customs = _.cloneDeep(customsData);
            customs.customsAgentType = convertEnumToLookup(_.get(customsData,'customsAgent.type'));
            return customs;
        }
    }
    convertOrder(order) {
        return {
            customer: { id: order.customer.id, name: order.customer.name },
            templateId: this.state.template.id,
            templateName: this.state.template.name,
            originalCustomer: order.originalCustomer ?
                { id: order.originalCustomer.id, name: order.originalCustomer.name } : null,
            subsidiary: { id: order.subsidiary.id, name: order.subsidiary.name },
            truckLoadType: order.truckLoadType,
            serviceType: order.serviceType,
            documents: this.createDocuments(order.orderDocuments),
            shipments: order.shipments.map(shipment => {
                return {
                    incoterm: _.find(this.state.lookup.incoterms, { code: shipment.incoterm.code }),
                    readyAtDate: shipment.readyDateTime && shipment.readyDateTime.value,
                    latestReadyAtDate: shipment.readyDateTime && shipment.readyDateTime.latest,
                    deliveryDate: shipment.deliveryDateTime,
                    unloadingAppointment: shipment.unloadingAppointment,
                    loadingAppointment: shipment.loadingAppointment,
                    valueOfGoods: shipment.valueOfGoods ? shipment.valueOfGoods.amount : null,
                    valueOfGoodsCurrency: shipment.valueOfGoods && shipment.valueOfGoods.unit ? shipment.valueOfGoods.unit.code : null,
                    paymentMethod: _.find(this.state.lookup.paymentTypes, { code: shipment.paymentType.code }),
                    longLoad: _.findIndex(shipment.shipmentUnitDetails, { isLongLoad: true }) >= 0,
                    hangingLoad: _.findIndex(shipment.shipmentUnitDetails, { isHangingLoad: true }) >= 0,
                    oversizeLoad: _.findIndex(shipment.shipmentUnitDetails, { isOversizeLoad: true }) >= 0,
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
                    departureCustoms: this.convertCustoms(shipment.departureCustoms),
                    arrivalCustoms: this.convertCustoms(shipment.arrivalCustoms),
                    customerOrderNumbers: shipment.customerOrderNumbers ? _.filter(shipment.customerOrderNumbers.split("\n"), item => item) : [],
                    senderOrderNumbers: shipment.senderOrderNumbers ? _.filter(shipment.senderOrderNumbers.split("\n"), item => item) : [],
                    consigneeOrderNumbers: shipment.consigneeOrderNumbers ? _.filter(shipment.consigneeOrderNumbers.split("\n"), item => item) : [],
                    loadingOrderNumbers: shipment.loadingOrderNumbers ? _.filter(shipment.loadingOrderNumbers.split("\n"), item => item) : [],
                    unloadingOrderNumbers: shipment.unloadingOrderNumbers ? _.filter(shipment.unloadingOrderNumbers.split("\n"), item => item) : [],
                    insured: shipment.insured,
                    documents: this.collectAllDocuments(shipment),
                    sender: {
                        company: shipment.sender.company,
                        companyLocation: shipment.sender.companyLocation,
                        handlingCompany: shipment.sender.handlingCompany,
                        handlingLocation: shipment.sender.handlingLocation,
                        handlingCompanyType: convertEnumToLookup(shipment.sender.handlingCompany.type),
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
                        handlingCompanyType: convertEnumToLookup(shipment.consignee.handlingCompany.type),
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
                    definitionOfGoods: shipment.definitionOfGoods ? shipment.definitionOfGoods.map(goods => { return { name: goods.name, code: goods.code, hscodeId: goods.id } }) : []
                }
            })
        };
    }

    render() {
        if (!this.state.template) {
            return <Loader title="Loading order form" />
        }
        return <CreateOrderFormMulti order={this.state.order} template={this.state.template}
            lookup={this.state.lookup} senderTemplate={this.state.senderTemplate}
            onChange={(order) => this.updateOrder(order)}
            onSenderChange={(shipmentIndex, sender) => this.updateSender(sender, shipmentIndex)}
            onConsigneeChange={(shipmentIndex, consignee) => this.updateConsignee(consignee, shipmentIndex)}
            onCustomizationChange={(shipmentIndex, customization) => this.handleCustomizationSelect(customization, shipmentIndex)}
            onCreateNewShipment={() => this.handleAddNewShipment()}
            onDeleteShipment={(shipmentIndex) => this.handleDeleteShipment(shipmentIndex)}
            onLoadRequirementsChange={(shipmentIndex, order) => this.handleLoadRequirementsChange(shipmentIndex, order)}
            onEquipmentRequirementsChange={(shipmentIndex, order) => this.handleEquipmentRequirementsChange(shipmentIndex, order)}
            onSave={() => this.handleSaveOrder()} />
    }
}

CreateOrderWithTemplateMulti.contextTypes = {
    translator: React.PropTypes.object,
    user: React.PropTypes.object
};