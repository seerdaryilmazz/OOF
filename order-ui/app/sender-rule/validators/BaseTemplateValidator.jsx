import React from "react";

export class BaseTemplateValidator {

    static validate(value){
        let errorMessage;

        if(value.sender == null){
            return("Please select sender");
        }

        errorMessage = this.validateSenderLocations(value.senderLocations);

        return errorMessage

    }


    static validateSenderLocations(value){
        let errorMessage = null;
        if(value == null){
            return("Please add loading locations")
        }else if(value.length != 0){
            value.find(senderLocation => {
                errorMessage = this.validateSenderLocation(senderLocation);
                if(errorMessage)
                    return;
            });
        }
        return errorMessage;
    }

    static validateSenderLocation(value){
        if(!(value.loadingCompany && value.loadingCompany.id) ||
            !(value.loadingLocation && value.loadingLocation.id)
        ){
            return("Loading company and location should not be empty");
        }

    }

}