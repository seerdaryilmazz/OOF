import _ from "lodash";
import {StepValidationResult} from "./StepValidationResult";
import {EquipmentRequirementValidator} from "./EquipmentRequirementValidator";


export class DocumentValidator{

    static validate(value){
        let result = new StepValidationResult();
        if(!value){
            result.addMessage("Please select a type and upload a document");
        }else{
            if(!value.types || value.types.length === 0){
                result.addMessage("Please select a document type");
            }
            if(!value.document){
                result.addMessage("Please upload a file");
            }
            if(_.find(value.types, {code: "OTH"}) && !value.description){
                result.addMessage("Please enter a description");
            }
        }
        return result;
    }
}

export class DocumentListValidator{
    static validate(value){
        let result = new StepValidationResult();
        value.forEach(value => {
            result.addItemResult(DocumentValidator.validate(value));
        });

        return result;
    }
}