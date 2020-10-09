import React from 'react';
import uuid from 'uuid';
import _ from 'lodash';

import {TextInput} from '../../basic';
import {Column} from './Column'
import {UppercaseFormatter} from '../formatters/text/UppercaseFormatter'
import {SimpleFieldReader} from '../readers/SimpleFieldReader'
import {BadgePrinter} from '../printers/BadgePrinter'
import {TextFilter} from '../filters/TextFilter';

export class BadgeColumn extends Column{

    constructor(props) {
        super(props);
        this.formatter = props.formatter;
        if(!this.formatter){
            this.formatter = new UppercaseFormatter();
        }
        this.reader = props.reader;
        if(!this.reader){
            this.reader = new SimpleFieldReader(props.field);
        }
        this.printer = props.printer;
        if(!this.printer){
            this.printer = new BadgePrinter();
        }

        this.defaultEditComponent = <TextInput />;
        this.defaultFilterComponent = <TextFilter />;

    };

}