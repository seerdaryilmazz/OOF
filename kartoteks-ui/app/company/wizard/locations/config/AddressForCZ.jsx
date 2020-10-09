import React from "react";

import {AddressFormWithDistrict} from '../addressTypes';
import {AddressAppender} from './AddressAppender';
import {AddressGeneral} from './AddressGeneral';
import {AddressForAny} from './AddressForAny';
export class AddressForCZ extends AddressGeneral {

    constructor(){
        let addressForAny = new AddressForAny();
        let config = addressForAny.config;
        config.sublocality_level_1 = {field: "sublocality_level_1.long_name"};
        config.premise = {field: "premise.long_name"};
        config.neighborhood = {field: "neighborhood.long_name"};

        let mergeConfig = addressForAny.mergeConfig;
        mergeConfig.district = (data) => {return data.sublocality_level_1};
        mergeConfig.streetName = (data) => {
            return new AddressAppender()
                .append(data.neighborhood).append(" ")
                .append(data.route).append(" ")
                .append(data.premise).append(", ")
                .append(data.street_number)
                .value();
        };
        super(config, mergeConfig);
        this.addressForAny = addressForAny;
    }
    formattedAddress(location){
        return new AddressAppender()
            .append(location.streetName).append(", ")
            .append(location.postalCode).append(" ")
            .append(location.district).append(" ")
            .append(location.city).append(", ")
            .append(location.country && location.country.countryName ? location.country.countryName : location.countryName).value();
    }

    component(){
        return <AddressFormWithDistrict />;
    }

    cleanUnusedFields(location){
        location.region = "";
    }
}