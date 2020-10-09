import React from "react";

import {AddressForm} from '../addressTypes';
import {AddressAppender} from './AddressAppender';
import {AddressGeneral} from './AddressGeneral';
import {AddressForAny} from './AddressForAny';
export class AddressForFR extends AddressGeneral{

    constructor(){
        let addressForAny = new AddressForAny();
        let config = addressForAny.config;
        let mergeConfig = addressForAny.mergeConfig;
        mergeConfig.streetName = (data) => {
            return new AddressAppender()
                .append(data.street_number)
                .append(" ")
                .append(data.route)
                .value()
        };
        super(config, mergeConfig);
        this.addressForAny = addressForAny;
    }
    formattedAddress(location){
        return this.addressForAny.formattedAddress(location);
    }

    component(){
        return <AddressForm />;
    }

    cleanUnusedFields(location){
        this.addressForAny.cleanUnusedFields(location);
    }
}