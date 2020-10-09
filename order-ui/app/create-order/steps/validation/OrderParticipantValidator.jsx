import _ from "lodash";
import {StepValidationResult} from "./StepValidationResult";

export class SenderValidator{

    static validate(value){
        let result = new StepValidationResult();
        if(!value){
            result.addMessage("Please select an option");
        }else{
            if(!value.senderCompany || !value.senderCompany.id){
                result.addMessage("Please select a sender");
            }
            if(!value.loadingCompany || !value.loadingCompany.id){
                result.addMessage("Please select a loading company");
            }
            if(!value.loadingLocation || !value.loadingLocation.id){
                result.addMessage("Please select a loading location");
            }
        }
        return result;
    }
}

export class ConsigneeValidator{

    static validate(value){
        let result = new StepValidationResult();
        if(!value){
            result.addMessage("Please select an option");
        }else{
            if(!value.consigneeCompany || !value.consigneeCompany.id){
                result.addMessage("Please select a consignee");
            }
            if(!value.unloadingCompany || !value.unloadingCompany.id){
                result.addMessage("Please select a unloading company");
            }
            if(!value.unloadingLocation || !value.unloadingLocation.id){
                result.addMessage("Please select a unloading location");
            }
        }
        return result;
    }
}

export class PartyValidator{

    static validate(value, orderLoadType, orderServiceType, otherParty){
        let result = new StepValidationResult();
        if(!value){
            result.addMessage("Please select an option");
        }else{
            if(!value.company || !value.company.id){
                result.addMessage("Please select a company");
            }
            if(!value.handlingCompany || !value.handlingCompany.id){
                result.addMessage("Please select a handling company");
            }
            if(!value.handlingLocation || !value.handlingLocation.id){
                result.addMessage("Please select a handling location");
            }
            if(otherParty && otherParty.handlingLocation && value.handlingLocation &&
                otherParty.handlingLocation.id === value.handlingLocation.id){
                result.addMessage("Please select a different handling location");
            }
            if(orderLoadType && value.customizedDefaults &&
                value.customizedDefaults.loadTypes && value.customizedDefaults.loadTypes.length > 0){
                if(!_.find(value.customizedDefaults.loadTypes, {code: orderLoadType.code})){
                    result.addMessage(`${orderLoadType.name} is not available in selected customization`);
                }
            }
            if(orderServiceType && value.customizedDefaults &&
                value.customizedDefaults.serviceTypes && value.customizedDefaults.serviceTypes.length > 0){
                if(!_.find(value.customizedDefaults.serviceTypes, {code: orderServiceType.code})){
                    result.addMessage(`${orderServiceType.name} is not available in selected customization`);
                }
            }
        }
        return result;
    }
}

export class ManufacturerValidator{

    static validate(value){
        let result = new StepValidationResult();
        if(!value){
            result.addMessage("Please select an option");
        }else{
            if(!value.company || !value.company.id){
                result.addMessage("Please select a company");
            }
            if(!value.companyLocation || !value.companyLocation.id){
                result.addMessage("Please select a location");
            }
        }
        return result;
    }
}