import React from 'react';
import uuid from 'uuid';
import _ from 'lodash';

export class NumberPrinter {

    constructor(numberOfDecimalDigits) {
        this.numberOfDecimalDigits = numberOfDecimalDigits;
    };

    print(value) {
        let valueToBeDisplayed = null;
        if (value || value === 0) {
            if (this.numberOfDecimalDigits || this.numberOfDecimalDigits === 0) {
                valueToBeDisplayed = new Number(value).toFixed(this.numberOfDecimalDigits);
            } else {
                valueToBeDisplayed = value;
            }
        }
        return (
            <span className="uk-align-right">{valueToBeDisplayed}</span>
        );
    }
}