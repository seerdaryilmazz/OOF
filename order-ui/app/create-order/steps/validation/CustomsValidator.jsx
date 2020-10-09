import {StepValidationResult} from "./StepValidationResult";
import * as Customs from '../../../Customs';

export class CustomsDepartureTRValidator{

    static validate(value){
        let result = new StepValidationResult();
        if(!value){
            result.addMessage("Please enter customs information");
            return result;
        }

        if(!value.customsOffice){
            result.addMessage("Please select an customs office");
        }
        if(!value.customsAgent){
            result.addMessage("Please select customs agent");
        }
        return result;
    }
}

export class CustomsArrivalTRValidator{

    static validate(value){
        let result = new StepValidationResult();
        if(!value){
            result.addMessage("Please enter customs information");
            return result;
        }

        if(!value.customsOffice){
            result.addMessage("Please select an customs office");
        }
        if(!value.customsType){
            result.addMessage("Please select a customs type");
        }
        if(!Customs.isCustomsTypeFreeZone(value.customsType) && !value.customsLocation){
            result.addMessage("Please select a customs location");
        }
        if(!value.customsAgent){
            result.addMessage("Please select customs agent");
        }
        return result;
    }
}

export class CustomsAgentAndLocationValidator{

    static validate(value){
        let result = new StepValidationResult();
        if(!value){
            result.addMessage("Please enter customs information");
            return result;
        }

        if(!value.customsAgent){
            result.addMessage("Please select customs agent");
        }
        if(!value.customsAgentLocation){
            result.addMessage("Please select customs agent location");
        }
        return result;
    }
}