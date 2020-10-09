'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Validator = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _abstract = require('../abstract');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Validator = exports.Validator = function (_TranslatingComponent) {
    _inherits(Validator, _TranslatingComponent);

    function Validator(props) {
        _classCallCheck(this, Validator);

        var _this = _possibleConstructorReturn(this, (Validator.__proto__ || Object.getPrototypeOf(Validator)).call(this, props));

        _this.errors = {};
        return _this;
    }

    _createClass(Validator, [{
        key: 'resetErrors',
        value: function resetErrors() {
            this.errors = {};
        }
    }, {
        key: 'removeErrors',
        value: function removeErrors(key) {
            this.errors[key] = [];
        }
    }, {
        key: 'addError',
        value: function addError(key, code, message) {

            var error = {
                code: code,
                message: message
            };

            var errorList = this.errors[key];

            if (!errorList) {
                errorList = [];
                this.errors[key] = errorList;
            }
            errorList.push(error);
        }
    }, {
        key: 'findError',
        value: function findError(key) {
            if (this.errors) {
                return this.errors[key];
            }
            return [];
        }
    }, {
        key: 'isErrorExist',
        value: function isErrorExist() {
            if (!_.isEmpty(this.errors)) {
                return true;
            }
            return false;
        }
    }, {
        key: 'validate',
        value: function validate(errorKey, value, rules) {

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

            var errorList = [];

            if (rules.required && !value) {
                this.addError(errorKey, "00000000", "This value is required");
            }

            if (!value) {
                return;
            }

            if (rules.type == "float" || rules.type == "integer") {
                if (isNaN(value)) {
                    this.addError(errorKey, "00000001", "This value should be numeric");
                } else if (rules.type == "integer" && value % 1 != 0) {
                    this.addError(errorKey, "00000002", "This value should be number without decimal point");
                }
            }

            if (rules.minLength && value.length < rules.minLength) {
                this.addError(errorKey, "00000003", "This value should be at least " + rules.minLength + " characters long");
            }

            if (rules.maxLength && value.length > rules.maxLength) {
                this.addError(errorKey, "00000004", "This value should be at most " + rules.maxLength + " characters long");
            }

            if (rules.minValue && value < rules.minValue) {
                this.addError(errorKey, "00000005", "This value should be more than " + rules.minValue);
            }

            if (rules.maxValue && value > rules.maxValue) {
                this.addError(errorKey, "00000006", "This value should be less than " + rules.maxValue);
            }
            if (rules.maxDecimal) {

                var decimals = value % 1 ? value.toString().split(".")[1].length : 0;

                if (decimals > rules.maxDecimal) {
                    this.addError(errorKey, "00000007", "This value should have less than " + rules.maxDecimal + " decimal points");
                }
            }
        }
    }], [{
        key: 'instance',
        value: function instance() {
            return new Validator();
        }
    }]);

    return Validator;
}(_abstract.TranslatingComponent);

Validator.contextTypes = {
    translator: _propTypes2.default.object,
    validation: _propTypes2.default.object
};