'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.NumericInputWithUnit = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _basic = require('../basic');

var _layout = require('../layout');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var NumericInputWithUnit = exports.NumericInputWithUnit = function (_React$Component) {
    _inherits(NumericInputWithUnit, _React$Component);

    function NumericInputWithUnit(props) {
        _classCallCheck(this, NumericInputWithUnit);

        var _this = _possibleConstructorReturn(this, (NumericInputWithUnit.__proto__ || Object.getPrototypeOf(NumericInputWithUnit)).call(this, props));

        _this.state = { unit: {}, amount: 0 };
        _this.groupSeparator = ".";
        _this.radixPoint = ",";
        if (_this.props.value) {
            _this.state.unit = _this.props.value.unit;
            _this.state.amount = _this.props.value.amount;
        }
        return _this;
    }

    _createClass(NumericInputWithUnit, [{
        key: 'componentDidMount',
        value: function componentDidMount() {}
    }, {
        key: 'handleUnitChange',
        value: function handleUnitChange(value) {
            var state = _lodash2.default.cloneDeep(this.state);
            state.unit = value;
            this.handleChange(state.unit, state.amount);
            this.setState(state);
        }
    }, {
        key: 'handleAmountChange',
        value: function handleAmountChange(value) {
            var state = _lodash2.default.cloneDeep(this.state);
            state.amount = value;
            this.handleChange(state.unit, state.amount);
            this.setState(state);
        }
    }, {
        key: 'handleChange',
        value: function handleChange(unit, amount) {
            var parsedAmount = amount;
            if (amount && typeof amount === 'string') {
                amount = amount.replace(new RegExp("\\" + this.groupSeparator, "g"), "").replace(new RegExp("\\" + this.radixPoint, "g"), ".");
                if (amount.indexOf(".") != -1) {
                    parsedAmount = parseFloat(amount);
                } else {
                    parsedAmount = parseInt(amount);
                }
            }
            var value = { unit: unit, amount: parsedAmount };
            this.props.onchange && this.props.onchange(value);
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var value = nextProps.value;
            if (value) {
                this.state.unit = value.unit;
                this.state.amount = value.amount;
            } else {
                this.state = { unit: {}, amount: 0 };
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var unitLabel = this.props.label ? "Unit" : "";
            var allowMinus = this.props.allowMinus ? true : false;
            var maskSettings = "'alias': 'numeric', 'allowMinus': " + allowMinus + ", 'radixPoint': '" + this.radixPoint + "', 'groupSeparator': '" + this.groupSeparator + "', 'autoGroup': true, 'digits': " + this.props.digits + ", 'digitsOptional': " + this.props.digitsOptional + ", 'suffix': '', 'placeholder': '0'";
            return _react2.default.createElement(
                _layout.Grid,
                { collapse: true },
                _react2.default.createElement(
                    _layout.GridCell,
                    { width: '1-2' },
                    _react2.default.createElement(_basic.TextInput, _extends({ id: this.props.id, mask: maskSettings }, this.props, {
                        onchange: function onchange(value) {
                            return _this2.handleAmountChange(value);
                        }, value: this.state.amount }))
                ),
                _react2.default.createElement(
                    _layout.GridCell,
                    { width: '1-2' },
                    _react2.default.createElement(_basic.DropDown, { id: this.props.id + "-unit",
                        options: this.props.units,
                        onchange: function onchange(value) {
                            return _this2.handleUnitChange(value);
                        },
                        required: this.props.required,
                        value: this.state.unit,
                        placeholder: '...',
                        label: unitLabel,
                        labelField: this.props.unitLabelField,
                        appendToBody: this.props.appendToBody })
                )
            );
        }
    }]);

    return NumericInputWithUnit;
}(_react2.default.Component);