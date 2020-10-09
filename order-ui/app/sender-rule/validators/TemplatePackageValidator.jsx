import React from "react";
import {BaseTemplateValidator} from "./BaseTemplateValidator";

export class TemplatePackageValidator {

    static validate(value){
        let errorMessage;

        errorMessage = BaseTemplateValidator.validate(value)

        if(errorMessage){
            return errorMessage;
        }

        errorMessage = this.validatePackageDetails(value.packageDetails);

        return errorMessage;
    }

    static validatePackageDetails(value){
        let errorMessage = null;
        if(value == null || value.length == 0){
            return("Please add package details");
        }else{
            value.find(packageDetail => {
                errorMessage = this.validatePackageDetail(packageDetail);
                if(errorMessage)
                    return;
            });
        }
        return errorMessage;
    }

    static validatePackageDetail(value){
        if(!(value.packageType && value.packageType.id)){
            return("Please select a package type");
        }

        if(value.width && value.length &&
            parseFloat(value.width) > parseFloat(value.length)){
            return("Width should be smaller than or equal to length");
        }

        if((value.width && !value.length) || (!value.width && value.length)){
            return("Width and length should be entered together");
        }

    }


}