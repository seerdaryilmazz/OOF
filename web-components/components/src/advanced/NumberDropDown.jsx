import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

import {TranslatingComponent} from '../abstract/'
import {DropDown} from '../basic';

export class NumberDropDown extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {};
    }

    handleOnChange(value) {
        if (this.props.onchange) {
            if (_.isNil(value)) {
                this.props.onchange(null);
            } else {
                this.props.onchange(value.id);
            }
        }
    }

    render() {

        let options = [];

        if (!_.isNil(this.props.options)) {
            this.props.options.forEach((option) => {
                options.push({
                    id: option,
                    name: "" + option
                });
            });
        }

        let value = null;

        if (!_.isNil(this.props.value)) {
            value = {
                id: this.props.value,
                name: "" + this.props.value
            };
        }

        return (
            <DropDown {...this.props} options={options} value={value} onchange={(value) => this.handleOnChange(value)}/>
        );
    }
}

NumberDropDown.contextTypes = {
    translator: PropTypes.object
};