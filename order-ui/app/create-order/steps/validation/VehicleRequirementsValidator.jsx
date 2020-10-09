import {StepValidationResult} from "./StepValidationResult";

export class VehicleRequirementsValidator{
    static validate(value){
        let result = new StepValidationResult();
        if(!value || !(value.requiredForLoading.length > 0 || value.requiredForUnloading.length > 0)){
            result.addMessage("There should be at least one requirement");
        } 
        if(value && value.loadingValidation) {
            result.addMessage(value.loadingValidation.message);
        }
        if(value && value.unloadingValidation) {
            result.addMessage(value.unloadingValidation.message);
        }
        return result;
    }
}