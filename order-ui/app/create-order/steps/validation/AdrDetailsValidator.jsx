import {StepValidationResult} from "./StepValidationResult";

export class AdrDetailsValidator{

    static validate(value){
        let result = new StepValidationResult();
        if(!value || !value.adrClass){
            result.addMessage("Please select an ADR class");
        }
        if(!value.quantity){
            result.addMessage("Please enter a quantity");
        }
        if(!value.packageType){
            result.addMessage("Please enter a package type");
        }
        if(!value.amount){
            result.addMessage("Please enter amount");
        }
        if(!value.unit || !value.unit.code){
            result.addMessage("Please select unit");
        }
        return result;
    }
}

export class AdrDetailsListValidator{
    static validate(value){
        let result = new StepValidationResult();
        if(!value || !_.isArray(value) || value.length === 0){
            result.addMessage("There should be at least one ADR detail");
        }
        value.forEach(value => {
            result.addItemResult(AdrDetailsValidator.validate(value));
        });

        return result;
    }
}