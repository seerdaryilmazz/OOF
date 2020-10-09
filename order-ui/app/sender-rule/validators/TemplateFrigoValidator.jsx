import React from "react";
import {BaseTemplateValidator} from "./BaseTemplateValidator";

export class TemplateFrigoValidator {

    static validate(value){
        let errorMessage;

        errorMessage = BaseTemplateValidator.validate(value)

        return errorMessage

    }

}