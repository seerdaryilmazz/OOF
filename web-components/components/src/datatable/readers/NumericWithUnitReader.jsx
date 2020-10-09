import React from 'react';
import uuid from 'uuid';
import _ from 'lodash';

export class NumericWithUnitReader {

    constructor(field) {
        this.field = field;
    };

    readCellValue(rowData){
        return _.get(rowData, this.field);
    }
    readSortValue(rowData){
        return this.readCellValue(rowData).amount;
    }
}