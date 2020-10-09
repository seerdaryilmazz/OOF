import React from "react";
import {BaseTemplateValidator} from "./BaseTemplateValidator";

export class TemplateAdrDetailValidator {

    static validate(value){
        let errorMessage;

        errorMessage = BaseTemplateValidator.validate(value)

        if(errorMessage){
            return errorMessage;
        }

        errorMessage = this.validateUnIds(value.unIds);

        return errorMessage;
    }

    static validateUnIds(value){
        if(value != null && value.length != 0){
            if(_.uniq(value).length !== value.length){
                return("Duplicate ADR UN Number");
            }
        }
    }

}