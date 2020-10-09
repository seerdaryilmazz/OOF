import React from 'react';
import { TextInput } from "susam-components/basic";
import { Column } from "susam-components/datatable";
import { TextFilter } from 'susam-components/datatable/filters/TextFilter';
import { SimpleTextFormatter } from 'susam-components/datatable/formatters/text/SimpleTextFormatter';
import { SimpleFieldReader } from 'susam-components/datatable/readers/SimpleFieldReader';
import { TranslateValue } from './TranslateValue';

export class TranslateColumn extends Column{
    constructor(props) {
        super(props);
        this.formatter = props.formatter;
        if(!this.formatter){
            this.formatter = new SimpleTextFormatter();
        }
        this.reader = props.reader;
        if(!this.reader){
            this.reader = new SimpleFieldReader(props.field);
        }
        this.printer = props.printer;
        if(!this.printer){
            this.printer = new TranslateColumnPrinter(props.sLng, props.tLng, props.ondataupdate);
        }

        this.defaultEditComponent = <TextInput />;
        this.defaultFilterComponent = <TextFilter />;
    };
}

export class TranslateColumnPrinter {

    constructor(from='en', to, onTranslate) {
        this.sLng = from;
        this.tLng = to;
        this.onTranslate = onTranslate;
    };

    printUsingRow(row, value){
        return <TranslateValue rowData={row} value={value} toLng={this.tLng} onchange={value=>this.onTranslate(value)} />
    }
}