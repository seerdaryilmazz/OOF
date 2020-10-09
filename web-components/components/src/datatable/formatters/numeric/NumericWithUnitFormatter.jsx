import React from 'react';
import uuid from 'uuid';
import _ from 'lodash';

import {SimpleNumericFormatter} from './SimpleNumericFormatter'

export class NumericWithUnitFormatter {

    constructor() {
        this.id = "numericwithunitformatter";
    };

    format(value){
        return new SimpleNumericFormatter().format(value.amount) + " " + value.unit;
    }

    parse(value){
        return new SimpleNumericFormatter(this.props).parse(value);
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