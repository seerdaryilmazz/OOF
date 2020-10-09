import {StepValidationResult} from "./StepValidationResult";
import _ from 'lodash';

export class ShipmentUnitValidator{

    static validate(value){
        let result = new StepValidationResult();
        if(!value.quantity){
            result.addMessage("Please enter a quantity");
        }
        if(!(value.packageType && value.packageType.code)){
            result.addMessage("Please select a package type");
        }
        if(value.width && value.length &&
            parseFloat(value.width) > parseFloat(value.length)){
            result.addMessage("Width should be smaller than or equal to length");
        }
        if((value.width && !value.length) || (!value.width && value.length)){
            result.addMessage("Width and length should be entered together");
        }
        if(_.isEmpty(value.stackability)){
            result.addMessage("Please select stackability");
        }
        if(value.restrictions && value.restrictions.heightRangeInCentimeters){
            let errorMessage = new RangeValueChecker(value.restrictions.heightRangeInCentimeters).check("Height", value.height);
            if(errorMessage){
                result.addMessage(errorMessage);
            }
        }
        if(value.restrictions && value.restrictions.lengthRangeInCentimeters){
            let errorMessage = new RangeValueChecker(value.restrictions.lengthRangeInCentimeters).check("Length", value.length);
            if(errorMessage){
                result.addMessage(errorMessage);
            }
        }
        if(value.restrictions && value.restrictions.widthRangeInCentimeters){
            let errorMessage = new RangeValueChecker(value.restrictions.widthRangeInCentimeters).check("Width", value.width);
            if(errorMessage){
                result.addMessage(errorMessage);
            }
        }
        return result;
    }
}
export class ShipmentUnitListValidator{
    static validate(value){
        let result = new StepValidationResult();
        if(!value || !_.isArray(value) || value.length === 0){
            result.addMessage("There should be at least one shipment unit detail");
        }
        let hasHangingLoad = _.find(value, {isHangingLoad: true});
        let hasLongLoad = _.find(value, {isLongLoad: true});
        if(hasHangingLoad && hasLongLoad){
            result.addMessage("Hanging loads and long loads should not be selected together");
        }
        value.forEach(value => {
            result.addItemResult(ShipmentUnitValidator.validate(value));
        });

        return result;
    }
}

class RangeValueChecker{
    constructor(range){
        this.minValue = range.minValue;
        this.maxValue = range.maxValue;
    }
    check(name, value){
        let errorMessage = "";
        if(_.isNil(value)){
            return;
        }
        if(this.minValue && this.maxValue){
            if(parseFloat(value) > this.maxValue || parseFloat(value) < this.minValue){
                errorMessage = `${name} should be in range of ${this.minValue} - ${this.maxValue} cm`;
            }
        }else if(this.minValue){
            if(parseFloat(value) < this.minValue){
                errorMessage = `${name} should be greater than ${this.minValue} cm`;
            }
        }else if(this.maxValue){
            if(parseFloat(value) > this.maxValue){
                errorMessage = `${name} should be smaller than ${this.maxValue} cm`;
            }
        }
        return  errorMessage;
    }
}