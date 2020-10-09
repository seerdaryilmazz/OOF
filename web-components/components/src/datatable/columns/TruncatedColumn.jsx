import React from 'react';
import uuid from 'uuid';
import _ from 'lodash';

import {TextInput} from '../../basic';
import {Column} from './Column'
import {SimpleTextFormatter} from '../formatters/text/SimpleTextFormatter'
import {TruncatedFieldReader} from '../readers/TruncatedFieldReader'
import {SimplePrinter} from '../printers/SimplePrinter'
import {TextFilter} from '../filters/TextFilter';

export class TruncatedColumn extends Column{

    constructor(props) {
        super(props);
        this.formatter = props.formatter;
        if(!this.formatter){
            this.formatter = new SimpleTextFormatter();
        }
        this.reader = props.reader;
        if(!this.reader){
            this.reader = new TruncatedFieldReader(props.field, props.wordCount);
        }
        this.printer = props.printer;
        if(!this.printer){
            this.printer = new SimplePrinter();
        }

        this.defaultEditComponent = <TextInput />;
        this.defaultFilterComponent = <TextFilter />;

    };


}