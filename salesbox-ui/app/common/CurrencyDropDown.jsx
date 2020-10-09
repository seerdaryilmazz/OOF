import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {DropDown, Notify} from 'susam-components/basic';

import {CurrencyService} from '../services';

const CURRENCY_EUR = {
    id: "EUR",
    code: "EUR",
    name: "EUR"
};

const CURRENCY_TRY = {
    id: "TRY",
    code: "TRY",
    name: "TRY"
};

const CURRENCY_USD = {
    id: "USD",
    code: "USD",
    name: "USD"
};

const CURRENCY_GBP = {
    id: "GBP",
    code: "GBP",
    name: "GBP"
};

export class CurrencyDropDown extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.options = [CURRENCY_EUR, CURRENCY_GBP, CURRENCY_TRY, CURRENCY_USD];
    }

    render() {
        return (
            <DropDown {...this.props} options={this.options}/>
        );
    }
}