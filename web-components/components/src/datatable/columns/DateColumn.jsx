import React from 'react';
import uuid from 'uuid';
import _ from 'lodash';

import {Date} from '../../advanced';
import {Column} from './Column'
import {DateFormatter} from '../formatters/datetime/DateFormatter'
import {DateReader} from '../readers/DateReader'
import {SimplePrinter} from '../printers/SimplePrinter'
import {DateFilter} from '../filters/DateFilter';

export class DateColumn extends Column{

    constructor(props) {
        super(props);
        this.formatter = props.formatter;
        if(!this.formatter){
            this.formatter = new DateFormatter("DD/MM/YYYY");
        }
        this.reader = props.reader;
        if(!this.reader){
            this.reader = new DateReader(props.field, "DD/MM/YYYY");
        }
        this.printer = props.printer;
        if(!this.printer){
            this.printer = new SimplePrinter();
        }

        this.defaultEditComponent = <Date />;
        this.defaultFilterComponent = <DateFilter />;
    };
}