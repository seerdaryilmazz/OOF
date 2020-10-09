import React from 'react';
import uuid from 'uuid';
import _ from 'lodash';

export class SimpleTextFormatter {

    constructor() {
        this.id = "simpletextformatter";
    };


    format(unformattedData){
        return unformattedData;
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