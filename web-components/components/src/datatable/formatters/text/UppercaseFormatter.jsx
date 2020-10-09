import React from 'react';
import uuid from 'uuid';
import _ from 'lodash';

export class UppercaseFormatter {

    constructor() {
        this.id = "uppercaseformatter";
    };

    format(value){
        if(_.isObject(value)){
            value.text = _.toUpper(value.text);
            return value;
        }else{
            return _.toUpper(value);
        }

    }

    parse(value){
        if(_.isObject(value)){
            return _.toLower(value.text);
        }else{
            return _.toLower(value);
        }

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