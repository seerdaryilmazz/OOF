import React from 'react';
import uuid from 'uuid';
import _ from 'lodash';

export class DateTimeReader {

    constructor(field, pattern) {
        this.field = field;
        this.pattern = pattern;
        this.moment = require('moment');
        require('moment-timezone');
    };

    readCellValue(rowData){
        return _.get(rowData, this.field);
    }
    readSortValue(rowData){
        let value = this.readCellValue(rowData);
        if(!value){
            return "";
        }
        let [date, time, zone] = value.trim().split(" ");
        let tz = _.defaultTo(zone, "UTC");
        let dt = date + " " + time;
        return this.moment.tz(dt, this.pattern, tz).tz("UTC").format("X");
    }
}

