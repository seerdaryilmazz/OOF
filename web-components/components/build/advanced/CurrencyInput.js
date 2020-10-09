'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.CurrencyInput = undefined;

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

var CurrencyInput = exports.CurrencyInput = function (_React$Component) {
    _inherits(CurrencyInput, _React$Component);

    function CurrencyInput(props) {
        _classCallCheck(this, CurrencyInput);

        var _this = _possibleConstructorReturn(this, (CurrencyInput.__proto__ || Object.getPrototypeOf(CurrencyInput)).call(this, props));

        _this.state = { currency: {}, amount: 0 };
        _this.groupSeparator = ".";
        _this.radixPoint = ",";
        return _this;
    }

    _createClass(CurrencyInput, [{
        key: 'componentDidMount',
        value: function componentDidMount() {}
    }, {
        key: 'handleCurrencyChange',
        value: function handleCurrencyChange(value) {
            var state = _lodash2.default.cloneDeep(this.state);
            state.currency = value;
            this.handleChange(state.currency, state.amount);
            this.setState(state);
        }
    }, {
        key: 'handleAmountChange',
        value: function handleAmountChange(value) {
            var state = _lodash2.default.cloneDeep(this.state);
            state.amount = value;
            this.handleChange(state.currency, state.amount);
            this.setState(state);
        }
    }, {
        key: 'handleChange',
        value: function handleChange(currency, amount) {
            if (amount) {
                amount = amount.replace(new RegExp("\\" + this.groupSeparator, "g"), "").replace(new RegExp("\\" + this.radixPoint, "g"), ".");
            }
            var value = { currency: currency, amount: amount };
            this.props.onchange && this.props.onchange(value);
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var value = nextProps.value;
            if (value) {
                this.state.currency = value.currency;
                this.state.amount = value.amount;
            } else {
                this.state = { currency: {}, amount: 0 };
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var maskSettings = "'alias': 'numeric', 'radixPoint': '" + this.radixPoint + "', 'groupSeparator': '" + this.groupSeparator + "', 'autoGroup': true, 'digits': 2, 'digitsOptional': false, 'suffix': '', 'placeholder': '0'";
            var currencies = [{ id: "EUR", name: "EUR" }, { id: "USD", name: "USD" }, { id: "TRY", name: "TRY" }];
            return _react2.default.createElement(
                _layout.Grid,
                { collapse: true },
                _react2.default.createElement(
                    _layout.GridCell,
                    { width: '1-2' },
                    _react2.default.createElement(_basic.TextInput, { mask: maskSettings, label: this.props.label,
                        onchange: function onchange(value) {
                            return _this2.handleAmountChange(value);
                        }, value: this.state.amount, required: this.props.required })
                ),
                _react2.default.createElement(
                    _layout.GridCell,
                    { width: '1-2' },
                    _react2.default.createElement(_basic.DropDown, { options: currencies, onchange: function onchange(value) {
                            return _this2.handleCurrencyChange(value);
                        }, required: this.props.required,
                        value: this.state.currency, placeholder: '...', label: 'Currency' })
                )
            );
        }
    }]);

    return CurrencyInput;
}(_react2.default.Component);