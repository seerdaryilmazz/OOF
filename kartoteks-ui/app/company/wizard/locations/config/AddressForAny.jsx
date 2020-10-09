import React from "react";

import {AddressForm} from '../addressTypes';
import {AddressAppender} from './AddressAppender';
import {AddressGeneral} from './AddressGeneral';
export class AddressForAny extends AddressGeneral{

    constructor(){

        let config = {
            country_name: {field: "country.long_name"},
            country_code: {field: "country.short_name"},
            locality: {field: "locality.long_name"},
            postal_code: {field: "postal_code.long_name"},
            route: {field: "route.long_name"},
            street_number: {field: "street_number.short_name"}
        };


        let mergeConfig = {
            countryName: (data) => {return data.country_name},
            countryCode: (data) => {return data.country_code},
            city: (data) => {return data.locality},
            postalCode: (data) => {return data.postal_code},
            streetName: (data) => {
                return new AddressAppender()
                    .append(data.route)
                    .append(" ")
                    .append(data.street_number)
                    .value()
            }
        };

        super(config, mergeConfig);
    }
    formattedAddress(location){
        return new AddressAppender()
            .append(location.streetName).append(", ")
            .append(location.postalCode).append(" ")
            .append(location.city).append(", ")
            .append(location.country && location.country.countryName ? location.country.countryName : location.countryName)
            .value();
    }

    component(){
        return <AddressForm />;
    }

    cleanUnusedFields(location){
        location.region = "";
        location.district = "";
    }
}