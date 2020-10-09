import React from 'react';
import uuid from 'uuid';
import _ from 'lodash';

import {Checkbox} from '../../basic'
import {Column} from './Column'
import {SimpleBooleanFormatter} from '../formatters/boolean/SimpleBooleanFormatter'
import {SimpleFieldReader} from '../readers/SimpleFieldReader'
import {CheckIconPrinter} from '../printers/CheckIconPrinter'
import {CheckboxFilter} from '../filters/CheckboxFilter'

export class BooleanColumn extends Column{

    constructor(props) {
        super(props);
        this.formatter = props.formatter;
        if(!this.formatter){
            this.formatter = new SimpleBooleanFormatter();
        }
        this.reader = props.reader;
        if(!this.reader){
            this.reader = new SimpleFieldReader(props.field);
        }
        this.printer = props.printer;
        if(!this.printer){
            this.printer = new CheckIconPrinter();
        }

        this.defaultEditComponent = <Checkbox />;
        this.defaultFilterComponent = <CheckboxFilter />;

    };

}