'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.NumericInput = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _basic = require('../basic');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var GROUP_SEPARATOR = ".";
var RADIX_POINT = ",";

var NumericInput = exports.NumericInput = function (_React$Component) {
    _inherits(NumericInput, _React$Component);

    function NumericInput(props) {
        _classCallCheck(this, NumericInput);

        var _this = _possibleConstructorReturn(this, (NumericInput.__proto__ || Object.getPrototypeOf(NumericInput)).call(this, props));

        _this.state = {};
        return _this;
    }

    _createClass(NumericInput, [{
        key: 'handleChange',
        value: function handleChange(value) {
            var amount = value && value.split(GROUP_SEPARATOR).join("").replace(RADIX_POINT, ".");
            var parsedAmount = parseFloat(amount);
            if (isNaN(parsedAmount)) {
                parsedAmount = null;
            }
            this.props.onchange && this.props.onchange(parsedAmount);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var digits = 0;
            var digitsOptional = false;
            if (this.props.digits) {
                digits = this.props.digits;
            }
            if (this.props.digitsOptional) {
                digitsOptional = this.props.digitsOptional;
            }
            var groupSeparator = "";
            if (this.props.grouping) {
                groupSeparator = GROUP_SEPARATOR;
            }
            var suffix = "";
            if (this.props.suffix) {
                suffix = this.props.suffix;
            }

            var max = undefined;
            if (this.props.maxIntegerDigit) {
                max = Math.pow(10, this.props.maxIntegerDigit) - 1;
            }

            var allowMinus = this.props.allowMinus ? true : false;
            var maskSettings = "'alias': 'numeric', 'allowMinus': " + allowMinus + ", 'radixPoint': '" + RADIX_POINT + "', 'groupSeparator': '" + groupSeparator + "', 'autoGroup': true, 'digits': " + digits + ", 'digitsOptional': " + digitsOptional + ", 'suffix': '" + suffix + "', 'max': '" + max + "'";
            return _react2.default.createElement(
                'div',
                { style: { position: "relative", width: "100%", height: "100%" } },
                _react2.default.createElement(_basic.TextInput, _extends({ mask: maskSettings }, this.props, { onchange: function onchange(value) {
                        return _this2.handleChange(value);
                    } }))
            );
        }
    }]);

    return NumericInput;
}(_react2.default.Component);