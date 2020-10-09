import React from 'react';
import uuid from 'uuid';
import _ from 'lodash';

import {DropDown} from '../../basic';
import {Column} from './Column';
import {LookupFormatter} from '../formatters/lookup/LookupFormatter';
import {LookupReader} from '../readers/LookupReader';
import {BadgePrinter} from '../printers/BadgePrinter';
import {TextFilter} from '../filters/TextFilter';

export class LookupColumn extends Column{

    constructor(props) {
        super(props);
        this.formatter = props.formatter;
        if(!this.formatter){
            this.formatter = new LookupFormatter();
        }
        this.reader = props.reader;
        if(!this.reader){
            this.reader = new LookupReader(props.field);
        }
        this.printer = props.printer;
        if(!this.printer){
            this.printer = new BadgePrinter();
        }

        this.defaultEditComponent = <DropDown options = {props.options} translate = {props.translate} postTranslationCaseConverter={props.postTranslationCaseConverter}/>;
        this.defaultFilterComponent = <DropDown options = {props.options} translate = {props.translate} postTranslationCaseConverter={props.postTranslationCaseConverter}/>;

    };

}