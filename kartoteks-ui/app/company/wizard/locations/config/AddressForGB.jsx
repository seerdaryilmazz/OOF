import React from "react";

import {AddressFormWithDistrict} from '../addressTypes';
import {AddressAppender} from './AddressAppender';
import {AddressGeneral} from './AddressGeneral';
export class AddressForGB extends AddressGeneral{

    constructor(){

        let config = {
            country_name: {field: "country.long_name"},
            country_code: {field: "country.short_name"},
            postal_town: {field: "postal_town.long_name"},
            locality: {field: "locality.long_name"},
            sublocality_level_1: {field: "sublocality_level_1.long_name"},
            postal_code: {field: "postal_code.long_name"},
            route: {field: "route.long_name"},
            street_number: {field: "street_number.short_name"},
            neighborhood: {field: "neighborhood.long_name"},
            premise: {field: "premise.long_name"}
        };


        let mergeConfig = {
            countryName: (data) => {return data.country_name},
            countryCode: (data) => {return data.country_code},
            city: (data) => {return data.postal_town ? data.postal_town : data.locality},
            district: (data) => {
                if(data.postal_town == data.locality){
                    return data.sublocality_level_1 ? data.sublocality_level_1 : data.neighborhood
                }else{
                    return data.locality;
                }

            },
            postalCode: (data) => {return data.postal_code},
            streetName: (data) => {
                return new AddressAppender()
                    .append(data.premise)
                    .append(" ")
                    .append(data.street_number)
                    .append(" ")
                    .append(data.route)
                    .value()
            }
        };

        super(config, mergeConfig);
    }
    formattedAddress(location){
        return new AddressAppender()
            .append(location.streetName).append(", ")
            .append(location.district).append(", ")
            .append(location.city).append(" ")
            .append(location.postalCode).append(", ")
            .append(location.country && location.country.countryName ? location.country.countryName : location.countryName).value();
    }

    component(){
        return <AddressFormWithDistrict districtRequired = {false} />;
    }

    cleanUnusedFields(location){
        location.region = "";
    }
}