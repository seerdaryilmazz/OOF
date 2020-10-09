import React from "react";

import {AddressFormWithDistrictAndRegion} from '../addressTypes';
import {AddressAppender} from './AddressAppender';
import {AddressGeneral} from './AddressGeneral';
import {AddressForAny} from './AddressForAny';
export class AddressForIR extends AddressGeneral {

    constructor(){
        let addressForAny = new AddressForAny();
        let config = addressForAny.config;
        config.administrative_area_level_1 = {field: "administrative_area_level_1.long_name"};
        config.sublocality_level_1 = {field: "sublocality_level_1.long_name"};

        let mergeConfig = addressForAny.mergeConfig;
        mergeConfig.district = (data) => {return data.sublocality_level_1};
        mergeConfig.region = (data) => {return data.administrative_area_level_1};
        mergeConfig.streetName = (data) => {
            return new AddressAppender()
                .append(data.route).append(" No. ")
                .append(data.street_number)
                .value();
        };

        super(config, mergeConfig);
        this.addressForAny = addressForAny;
    }
    formattedAddress(location){
        return new AddressAppender()
            .append(location.region).append(", ")
            .append(location.city).append(", ")
            .append(location.district).append(", ")
            .append(location.streetName).append(", ")
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