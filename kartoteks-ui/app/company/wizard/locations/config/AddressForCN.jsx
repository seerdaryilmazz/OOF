import React from "react";

import {AddressFormWithDistrictAndRegion} from '../addressTypes';
import {AddressAppender} from './AddressAppender';
import {AddressGeneral} from './AddressGeneral';
import {AddressForAny} from './AddressForAny';
export class AddressForCN extends AddressGeneral {

    constructor(){
        let addressForAny = new AddressForAny();
        let config = addressForAny.config;
        config.sublocality_level_1 = {field: "sublocality_level_1.long_name"};
        config.administrative_area_level_1 = {field: "administrative_area_level_1.long_name"};

        let mergeConfig = addressForAny.mergeConfig;
        mergeConfig.district = (data) => {return data.sublocality_level_1};
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
            .append(location.district).append(", ")
            .append(location.city).append(", ")
            .append(location.region).append(", ")
            .append(location.country && location.country.countryName ? location.country.countryName : location.countryName).append(", ")
            .append(location.postalCode)
            .value();
    }

    component(){
        return <AddressFormWithDistrictAndRegion />;
    }

    cleanUnusedFields(location){

    }
}