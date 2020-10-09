import React from "react";
import _ from "lodash";

import {GooglePlaceResultBuilder, GoogleComponentsReader} from './GooglePlaceResult';
export class AddressGeneral {

    constructor(config, mergeConfig){
        this.data = {};
        this.config = config;
        this.googleBuilder = new GooglePlaceResultBuilder(this.config);
        this.mergeConfig = mergeConfig;
    }
    formattedAddress(location){
        return "";
    }
    parse(addressComponents){
        return this.googleBuilder.parse(addressComponents);
    }
    parseAndSave(addressComponents){
        this.data = this.parse(addressComponents);
    }
    parseAndMerge(addressComponents){
        let newData = this.parse(addressComponents);
        _.forEach(this.config, (value, key) => {
            if(!this.data[key]){
                this.data[key] = newData[key];
            }
        })
    }
    asLocation(){
        return this.buildLocation(this.data);
    }
    parseToLocation(addressComponents){
        let data = this.parse(addressComponents);
        return this.buildLocation(data);
    }
    buildLocation(data){
        let result = {};
        _.forEach(this.mergeConfig, (value, key) => {
            result[key] = value(data);
        });
        result.formattedAddress = this.formattedAddress(result);
        return result;
    }

    isSufficient(addressComponents){
        let validated = true;

        _.forEach(this.config, (value, key) => {
            if(!value.optional){
                let fieldValue = GoogleComponentsReader.read(addressComponents, value.field);
                if(!fieldValue){
                    validated = false;
                }
            }
        });
        return validated;
    }

    component(){
        return null;
    }

}