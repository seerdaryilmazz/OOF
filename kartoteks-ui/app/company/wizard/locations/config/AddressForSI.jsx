import React from "react";

import {AddressForm} from '../addressTypes';
import {AddressGeneral} from './AddressGeneral';
import {AddressForAny} from './AddressForAny';
export class AddressForSI extends AddressGeneral{

    constructor(){
        let addressForAny = new AddressForAny();
        let config = addressForAny.config;
        config.locality = {field: "postal_town.long_name"};

        let mergeConfig = addressForAny.mergeConfig;
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
