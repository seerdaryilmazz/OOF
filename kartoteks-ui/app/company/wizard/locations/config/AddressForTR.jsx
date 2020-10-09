import React from "react";
import { AddressFormWithDistrict } from '../addressTypes';
import { AddressAppender } from './AddressAppender';
import { AddressGeneral } from './AddressGeneral';

export class AddressForTR extends AddressGeneral {

    constructor(){
        let config = {
            country_name: {field: "country.long_name"},
            country_code: {field: "country.short_name"},
            administrative_area_level_1: {field: "administrative_area_level_1.long_name"},
            administrative_area_level_2: {field: "administrative_area_level_2.long_name"},
            administrative_area_level_3: {field: "administrative_area_level_3.long_name"},
            postal_code: {field: "postal_code.long_name"},
            route: {field: "route.long_name"},
            street_number: {field: "street_number.short_name"},
            administrative_area_level_4: {field: "administrative_area_level_4.long_name"}
        };
        let mergeConfig = {
            countryName: (data) => {return data.country_name},
            countryCode: (data) => {return data.country_code},
            city: (data) => {return data.administrative_area_level_1},
            district: (data) => {
                return new AddressAppender()
                    .append(data.administrative_area_level_3)
                    .append("/")
                    .append(data.administrative_area_level_2)
                    .value();
            },
            postalCode: (data) => {return data.postal_code},
            streetName: (data) => {
                return new AddressAppender()
                    .append(data.administrative_area_level_4)
                    .append(", ")
                    .append(data.route)
                    .append(" No:")
                    .append(data.street_number)
                    .value();
            }
        };

        super(config, mergeConfig);
    }
    formattedAddress(location){
        return new AddressAppender()
            .append(location.streetName).append(", ")
            .append(location.postalCode).append(" ")
            .append(location.district).append("/").append(location.city).append(", ")
            .append(location.country && location.country.countryName ? location.country.countryName : location.countryName).value();
    }

    component(){
        return <AddressFormWithDistrict districtRequired = {true} />;
    }

    cleanUnusedFields(location){
        location.region = "";
    }
}