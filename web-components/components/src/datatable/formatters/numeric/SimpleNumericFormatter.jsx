import React from 'react';
import uuid from 'uuid';
import _ from 'lodash';

export class SimpleNumericFormatter {

    constructor() {
        this.id = "simplenumericformatter";
    };

    format(value){
        if(value || _.isNumber(value)){
            return ("" + value);
        }
        return "";
    }

    parse(value){
        return parseFloat(value);
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
            type: 'numeric'
        }
    }
}