import React from 'react';
import uuid from 'uuid';
import _ from 'lodash';

import {NumericInput} from '../../advanced';
import {Column} from './Column'
import {SimpleNumericFormatter} from '../formatters/numeric/SimpleNumericFormatter'
import {SimpleFieldReader} from '../readers/SimpleFieldReader'
import {NumberPrinter} from '../printers/NumberPrinter'
import {NumericFilter} from '../filters/NumericFilter'

export class NumericColumn extends Column{

    constructor(props) {
        super(props);
        this.formatter = props.formatter;
        if(!this.formatter){
            this.formatter = new SimpleNumericFormatter();
        }
        this.reader = props.reader;
        if(!this.reader){
            this.reader = new SimpleFieldReader(props.field);
        }
        this.printer = props.printer;
        if(!this.printer){
            this.printer = new NumberPrinter(props.numberOfDecimalDigits);
        }

        this.defaultEditComponent = <NumericInput digits="2" digitsOptional = {true} />;
        this.defaultFilterComponent = <NumericFilter />;

    };
}