import React from "react";

import {AddressFormWithRegion} from '../addressTypes';
import {AddressAppender} from './AddressAppender';
import {AddressGeneral} from './AddressGeneral';
import {AddressForAny} from './AddressForAny';
export class AddressForUS extends AddressGeneral {

    constructor(){
        let addressForAny = new AddressForAny();
        let config = addressForAny.config;
        config.administrative_area_level_1 = {field: "administrative_area_level_1.short_name"};

        let mergeConfig = addressForAny.mergeConfig;
        mergeConfig.region = (data) => {return data.administrative_area_level_1};
        mergeConfig.streetName = (data) => {
            return new AddressAppender()
                .append(data.street_number).append(" ")
                .append(data.route)
                .value();
        };
        super(config, mergeConfig);
        this.addressForAny = addressForAny;
    }
    formattedAddress(location){
        return new AddressAppender()
            .append(location.streetName).append(", ")
            .append(location.city).append(", ")
            .append(location.region).append(" ")
            .append(location.postalCode).append(", ")
            .append(location.country && location.country.iso ? location.country.iso : location.countryCode).value();
    }

    component(){
        return <AddressFormWithRegion />;
    }

    cleanUnusedFields(location){

    }
}