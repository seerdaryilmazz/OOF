import {StepValidationResult} from "./StepValidationResult";

export class ShipmentUnitTotalsValidator{

    static validate(value, minLdm, minVolume, minQuantity, unitTypes){
        let result = new StepValidationResult();
        if(!value){
            result.addMessage("Please enter total values for shipment");
        }else{
            if(!(value.grossWeight || value.volume || value.ldm)){
                result.addMessage("Please enter at least one of Gross Weight, Volume or LDM");
            }
            if(value.grossWeight && value.netWeight && parseInt(value.grossWeight) < parseInt(value.netWeight)){
                result.addMessage("Gross weight should be greater than net weight");
            }
            if(value.ldm && parseFloat(value.ldm) < minLdm){
                result.addMessage(`LDM should not be smaller than ${minLdm} `);
            }
            if(value.volume && parseFloat(value.volume) < minVolume){
                result.addMessage(`Volume should not be smaller than ${minVolume} m³`);
            }
            if(value.totalQuantity && parseFloat(value.totalQuantity) < minQuantity){
                result.addMessage(`Total quantity should not be smaller than ${minQuantity}`);
            }
            if(unitTypes && unitTypes.length > 0){
                unitTypes.forEach(type => {
                    if(!_.find(value.packageTypes, {id: type.id})){
                        result.addMessage(`Package type ${type.name} should be selected`);
                    }
                });
            }
        }

        return result;
    }
}