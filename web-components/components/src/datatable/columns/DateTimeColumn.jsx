import React from 'react';
import uuid from 'uuid';
import _ from 'lodash';

import {DateTime} from '../../advanced';
import {Column} from './Column'
import {DateTimeFormatter} from '../formatters/datetime/DateTimeFormatter'
import {DateTimeReader} from '../readers/DateTimeReader'
import {SimplePrinter} from '../printers/SimplePrinter'
import {DateTimeFilter} from '../filters/DateTimeFilter';

export class DateTimeColumn extends Column{

    constructor(props) {
        super(props);
        this.formatter = props.formatter;
        if(!this.formatter){
            this.formatter = new DateTimeFormatter("DD/MM/YYYY HH:mm");
        }
        this.reader = props.reader;
        if(!this.reader){
            this.reader = new DateTimeReader(props.field, "DD/MM/YYYY HH:mm");
        }
        this.printer = props.printer;
        if(!this.printer){
            this.printer = new SimplePrinter();
        }

        this.defaultEditComponent = <DateTime />;
        this.defaultFilterComponent = <DateTimeFilter />;
    };

}