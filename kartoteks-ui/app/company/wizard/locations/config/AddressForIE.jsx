import React from "react";

import {AddressFormWithDistrict} from '../addressTypes';
import {AddressAppender} from './AddressAppender';
import {AddressGeneral} from './AddressGeneral';
import {AddressForAny} from './AddressForAny';
export class AddressForIE extends AddressGeneral {

    constructor(){
        let addressForAny = new AddressForAny();
        let config = addressForAny.config;
        config.neighborhood = {field: "neighborhood.long_name"};
        config.postal_town = {field: "postal_town.long_name"};

        let mergeConfig = addressForAny.mergeConfig;
        mergeConfig.district = (data) => {return data.neighborhood};
        mergeConfig.city = (data) => {return data.postal_town ? data.postal_town : data.locality};
        mergeConfig.streetName = (data) => {
            return new AddressAppender()
                .append(data.street_number).append(" ")
                .append(data.route).append(" ")
                .value();
        };
        super(config, mergeConfig);
        this.addressForAny = addressForAny;
    }
    formattedAddress(location){
        return new AddressAppender()
            .append(location.streetName).append(", ")
            .append(location.district).append(", ")
            .append(location.city).append(", ")
            .append(location.postalCode).append(", ")
            .append(location.country && location.country.countryName ? location.country.countryName : location.countryName).value();
    }

    component(){
        return <AddressFormWithDistrict />;
    }

    cleanUnusedFields(location){
        location.region = "";
    }
}