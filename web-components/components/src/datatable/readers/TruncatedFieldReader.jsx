import React from 'react';
import _ from 'lodash';

export class TruncatedFieldReader {

    constructor(field, wordCount) {
        this.field = field;
        this.wordCount = wordCount || 3;
    };

    readCellValue(rowData){
        let data = _.get(rowData, this.field);
        return this.truncate(data);
    }
    readSortValue(rowData){
        return this.readCellValue(rowData);
    }

    truncate(str){
        let split = str.split(" ");
        return split.splice(0, this.wordCount).join(" ") + (split.length > this.wordCount ? "..." : "");
    }
}