import React from 'react';
import uuid from 'uuid';
import _ from 'lodash';

export class CustomReader {

    constructor(func) {
        this.func = func;
    };

    read(rowData){
        if(!rowData){
            return "";
        }
        return this.func(rowData);
    }
}