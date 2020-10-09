import React from 'react';
import uuid from 'uuid';
import _ from 'lodash';

export class SimpleBooleanFormatter {

    constructor() {
        this.id = "simplebooleanformatter";
    };

    format(value){
        return value;
    }

    parse(value){
        return "" + value;
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