import React from 'react';
import uuid from 'uuid';
import _ from 'lodash';

export class DateReader {

    constructor(field, pattern) {
        this.field = field;
        this.pattern = pattern;
        this.moment = require('moment');
    };

    readCellValue(rowData){
        return _.get(rowData, this.field);
    }
    readSortValue(rowData){
        return this.moment(this.readCellValue(rowData), this.pattern, true).format("X");
    }
}