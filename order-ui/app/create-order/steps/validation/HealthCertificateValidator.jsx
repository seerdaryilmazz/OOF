import {StepValidationResult} from "./StepValidationResult";

export class HealthCertificateValidator{

    static validate(value, message) {
        let result = new StepValidationResult();
        let valid = value && (
            (value.manualTypes && value.manualTypes.length > 0) ||
                (value.uploadTypes && value.uploadTypes.length > 0));
        if(!valid){
            result.addMessage(message || "Please select an option");
        }
        return result;
    }
}