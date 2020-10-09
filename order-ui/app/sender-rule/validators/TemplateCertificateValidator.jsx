import React from 'react'
import {BaseTemplateValidator} from "./BaseTemplateValidator";
import _ from "lodash";

export class TemplateCertificateValidator{
    static validate(value){
        let errorMessage;

        errorMessage = BaseTemplateValidator.validate(value)

        if(errorMessage){
            return errorMessage;
        }

    }

}