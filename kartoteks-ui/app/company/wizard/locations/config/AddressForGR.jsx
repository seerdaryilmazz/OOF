import React from "react";

import {AddressForm} from '../addressTypes';
import {AddressAppender} from './AddressAppender';
import {AddressGeneral} from './AddressGeneral';
import {AddressForAny} from './AddressForAny';
export class AddressForGR extends AddressGeneral{

    constructor(){
        let addressForAny = new AddressForAny();
        let config = addressForAny.config;
        let mergeConfig = addressForAny.mergeConfig;
        super(config, mergeConfig);
        this.addressForAny = addressForAny;
    }
    formattedAddress(location){
        return new AddressAppender()
            .append(location.streetName).append(", ")
            .append(location.city).append(" ")
            .append(location.postalCode).append(", ")
            .append(location.country && location.country.countryName ? location.country.countryName : location.countryName)
            .value();
    }

    component(){
        return <AddressForm />;
    }

    cleanUnusedFields(location){
        this.addressForAny.cleanUnusedFields(location);
    }
}