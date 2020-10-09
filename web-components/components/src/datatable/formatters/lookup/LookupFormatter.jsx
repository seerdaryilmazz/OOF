import React from 'react';
import uuid from 'uuid';
import _ from 'lodash';

export class LookupFormatter {

    constructor() {
        this.id = "lookupformatter";
    };


    format(unformattedData){
        return _.get(unformattedData, "name");
    }

    parse(value){
        return value.toLowerCase();
    }

    tableParser(){
        return {
            id: this.id,
            is: (s) => {
                return false;
            },
            format: (s) => {
                return this.parse(s);
            },
            // either numeric or text
            type: 'text'
        }
    }
}