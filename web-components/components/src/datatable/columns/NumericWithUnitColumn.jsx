import React from 'react';
import uuid from 'uuid';
import _ from 'lodash';

import {NumericInputWithUnit} from '../../advanced';
import {Column} from './Column'
import {NumericWithUnitFormatter} from '../formatters/numeric/NumericWithUnitFormatter'
import {NumericWithUnitReader} from '../readers/NumericWithUnitReader'
import {SimplePrinter} from '../printers/SimplePrinter'
import {TextFilter} from '../filters/TextFilter'

export class NumericWithUnitColumn extends Column{

    constructor(props) {
        super(props);
        this.formatter = props.formatter;
        if(!this.formatter){
            this.formatter = new NumericWithUnitFormatter();
        }
        this.reader = props.reader;
        if(!this.reader){
            this.reader = new NumericWithUnitReader(props.field);
        }
        this.printer = props.printer;
        if(!this.printer){
            this.printer = new SimplePrinter();
        }

        this.defaultEditComponent = <NumericInputWithUnit digits="2" digitsOptional = {true} units = {props.units}/>;
        this.defaultFilterComponent = <TextFilter />;

    };
}