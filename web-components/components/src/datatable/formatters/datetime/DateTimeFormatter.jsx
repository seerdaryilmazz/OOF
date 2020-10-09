import React from 'react';
import uuid from 'uuid';
import _ from 'lodash';

export class DateTimeFormatter {

    constructor(pattern) {
        this.pattern = pattern;
        this.id = "datetimeformatter";
        this.moment = require('moment');
        require('moment-timezone');
    };

    format(value){
        return value;
    }

    parse(value){
        return value;
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