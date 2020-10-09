import React from "react";

import {TranslatingComponent} from '../abstract';
import {NumberDropDown} from './';

export class YearDropDown extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    getOptions(startYear, endYear) {
        let array = [];
        for (let i = startYear; i <= endYear; i++) {
            array.push(i);
        }
        return array;
    }

    render() {
        return (
            <NumberDropDown {...this.props} options={this.getOptions(this.props.startYear, this.props.endYear)}/>
        );
    }
}