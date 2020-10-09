import {StepValidationResult} from "./StepValidationResult";
import _ from 'lodash';

export class SpecialLoadTypeValidator{
    static validate(value){
        let result = new StepValidationResult();

        if(!(value && _.isArray(value) && value.length > 0)){
            result.addMessage("Please select an option");
        }else{
            let hasHangingLoad = _.find(value, {id: "HANGER"});
            let hasLongLoad = _.find(value, {id: "LONG_LOAD"});
            if(hasHangingLoad && hasLongLoad){
                result.addMessage("Hanging loads and long loads should not be selected together");
            }
        }
        return result;
    }
}