'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.NumberPrinter = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NumberPrinter = exports.NumberPrinter = function () {
    function NumberPrinter(numberOfDecimalDigits) {
        _classCallCheck(this, NumberPrinter);

        this.numberOfDecimalDigits = numberOfDecimalDigits;
    }

    _createClass(NumberPrinter, [{
        key: 'print',
        value: function print(value) {
            var valueToBeDisplayed = null;
            if (value || value === 0) {
                if (this.numberOfDecimalDigits || this.numberOfDecimalDigits === 0) {
                    valueToBeDisplayed = new Number(value).toFixed(this.numberOfDecimalDigits);
                } else {
                    valueToBeDisplayed = value;
                }
            }
            return _react2.default.createElement(
                'span',
                { className: 'uk-align-right' },
                valueToBeDisplayed
            );
        }
    }]);

    return NumberPrinter;
}();