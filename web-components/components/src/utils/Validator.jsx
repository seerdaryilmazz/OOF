import React from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid';
import {TranslatingComponent} from '../abstract';

export class Validator extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.errors = {};
    };

    static instance() {
        return new Validator();
    }

    resetErrors() {
        this.errors = {};
    }

    removeErrors(key) {
        this.errors[key] = [];
    }

    addError(key, code, message) {

        let error = {
            code: code,
            message: message
        }

        let errorList =  this.errors[key];

        if(!errorList) {
            errorList = [];
            this.errors[key] = errorList;
        }
        errorList.push(error);

    }

    findError(key) {
        if (this.errors) {
            return this.errors[key];
        }
        return [];
    }

    isErrorExist() {
        if (!_.isEmpty(this.errors)) {
            return true;
        }
        return false;
    }


    validate(errorKey, value, rules) {


        if (rules.minValue || rules.maxValue) {
            if (rules.type != "integer" && rules.type != "float") {
                throw new Exception("minValue, maxValue rules can only be deifned for integer and float types");
            }
        }

        if (rules.maxDecimal) {
            if (rules.type != "float") {
                throw new Exception("maxDecimal rule can only be defined for float types");
            }
        }


        let errorList = [];

        if (rules.required && !value) {
            this.addError(errorKey, "00000000","This value is required");
        }

        if (!value) {
            return;
        }


        if (rules.type == "float" || rules.type == "integer") {
            if (isNaN(value)) {
                this.addError(errorKey, "00000001","This value should be numeric");
            } else if (rules.type == "integer" && value % 1 != 0) {
                this.addError(errorKey, "00000002","This value should be number without decimal point");
            }
        }


        if (rules.minLength && value.length < rules.minLength) {
            this.addError(errorKey, "00000003","This value should be at least " + rules.minLength + " characters long");
        }
        
        if (rules.maxLength && value.length > rules.maxLength) {
            this.addError(errorKey, "00000004","This value should be at most " + rules.maxLength + " characters long");
        }


        if (rules.minValue && value < rules.minValue) {
            this.addError(errorKey, "00000005","This value should be more than " + rules.minValue);
        }

        if (rules.maxValue && value > rules.maxValue) {
            this.addError(errorKey, "00000006","This value should be less than " + rules.maxValue);
        }
        if (rules.maxDecimal) {

            let decimals = value % 1 ? value.toString().split(".")[1].length : 0;

            if (decimals > rules.maxDecimal) {
                this.addError(errorKey, "00000007","This value should have less than " + rules.maxDecimal + " decimal points");
            }
        }
        
    }
}
Validator.contextTypes = {
    translator: PropTypes.object,
    validation: PropTypes.object
};