import React from "react";

import {AddressForm} from '../addressTypes';
import {AddressAppender} from './AddressAppender';
import {AddressGeneral} from './AddressGeneral';
import {AddressForAny} from './AddressForAny';
export class AddressForSK extends AddressGeneral {

    constructor(){
        let addressForAny = new AddressForAny();
        let config = addressForAny.config;
        config.premise = {field: "premise.long_name"};

        let mergeConfig = addressForAny.mergeConfig;
        mergeConfig.streetName = (data) => {
            return new AddressAppender()
                .append(data.route).append(" ")
                .append(data.premise).append("/")
                .append(data.street_number)
                .value();
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