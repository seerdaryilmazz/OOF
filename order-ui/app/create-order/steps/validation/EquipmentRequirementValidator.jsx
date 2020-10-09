import {StepValidationResult} from "./StepValidationResult";

export class EquipmentRequirementValidator{

    static validate(value){
        let result = new StepValidationResult();
        if(!value){
            result.addMessage("Please enter a requirement");
        }else{
            if(!value || !value.equipmentCount){
                result.addMessage("Please enter an equipment count");
            }
            if(!value.equipmentType || !value.equipmentType.id){
                result.addMessage("Please select an equipment type");
            }
        }
        return result;
    }
}

export class EquipmentRequirementListValidator{
    static validate(value){
        let result = new StepValidationResult();
        if(!value || !_.isArray(value) || value.length === 0){
            result.addMessage("There should be at least one requirement");
        }
        value.forEach(value => {
            result.addItemResult(EquipmentRequirementValidator.validate(value));
        });

        return result;
    }
}