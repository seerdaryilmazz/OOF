import _ from 'lodash';
import uuid from 'uuid';

export class TemplateAndCustomizations{

    constructor(template){
        this.template = template;
        this.customization = {};
        console.log("template", template);
    }
    setCustomization(shipmentId, customization){
        this.customization[shipmentId] = customization;
    }
    getDefaultsLookup(key){
        return this.isDefaultsLookupExists(key) ? this.template.defaults[key] : null;
    }
    isDefaultsLookupExists(key){
        return this.template.defaults && this.template.defaults[key] && this.template.defaults[key].length > 0;
    }
    isCustomizedLookupExists(shipmentId, key){
        return this.customization[shipmentId] &&
            this.customization[shipmentId].customizedDefaults &&
            this.customization[shipmentId].customizedDefaults[key];
    }
    getCustomizedLookup(shipmentId, key){
        return this.customization[shipmentId].customizedDefaults[key];
    }

    getAvailableServiceTypes(allServiceTypes){
        return this.getAvailableOptionsForOrder("serviceTypes", allServiceTypes);
    }

    getAvailableTruckLoadTypes(allTruckLoadTypes){
        return this.getAvailableOptionsForOrder("loadTypes", allTruckLoadTypes);
    }

    getAvailableIncoterms(shipmentId){
        return this.getAvailableOptionsForShipment("incoterms", shipmentId);
    }

    getAvailableCurrencies(shipmentId){
        return this.getAvailableOptionsForShipment("currencies", shipmentId);
    }

    getAvailablePaymentMethods(shipmentId){
        return this.getAvailableOptionsForShipment("paymentTypes", shipmentId);
    }

    getManufacturerOptions(sender){
        if(!this.template){
            return;
        }
        if("MULTI_PARTY" === this.template.type){
            let senderCustomization = _.find(this.template.senderCustomizations, item=>{
                return item.company.id === sender.company.id
                    && _.get(item.companyLocation, 'id') === _.get(sender.companyLocation, 'id')
                    && item.handlingCompany.id === sender.handlingCompany.id
                    && item.handlingLocation.id === sender.handlingLocation.id
            });
            if(senderCustomization){
                if(!_.isEmpty(senderCustomization.manufacturers)){
                    senderCustomization.manufacturers.forEach(i=>i.key=uuid.v4());
                }
                return {manufacturerOption: senderCustomization.manufacturerOption, manufacturers: senderCustomization.manufacturers };
            } 
            return {manufacturerOption: {id: "DONT_ASK", code: "DONT_ASK"}, manufacturers: [] };
        } else {
            return null;
        }
    }

    getAvailableOptionsForShipment(key, shipmentId){
        //1: customized lookup does not exist, return defaults
        //2: customized lookup exists but it has length == 0, return null so that calling component can use all options
        //3: customized lookup exists and it has length > 0, return customized defaults
        if(this.isCustomizedLookupExists(shipmentId, key)){
            let customized = this.getCustomizedLookup(shipmentId, key);
            return customized.length > 0 ? customized : this.template.type === 'MULTI_PARTY' ? [] : null;
        }else{
            return this.getDefaultsLookup(key);
        }
    }

    getAvailableOptionsForOrder(key, allOptions){
        let optionsForShipments = [];
        Object.keys(this.customization).forEach(shipmentId => {
            let options = this.getAvailableOptionsForShipment(key, shipmentId);
            if(options){
                optionsForShipments.push(options);
            } else if("MULTI_PARTY" === this.template.type){
                optionsForShipments.push(allOptions);
            }
        });
        if(optionsForShipments.length > 0){
            return _.intersectionWith(...optionsForShipments, _.isEqual);
        }
        return optionsForShipments;
    }
}