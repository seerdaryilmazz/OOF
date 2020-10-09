'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DateWithTimeRange = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _Date = require('./Date');

var _TimeRange = require('./TimeRange');

var _layout = require('../layout');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DateWithTimeRange = exports.DateWithTimeRange = function (_React$Component) {
    _inherits(DateWithTimeRange, _React$Component);

    function DateWithTimeRange(props) {
        _classCallCheck(this, DateWithTimeRange);

        var _this = _possibleConstructorReturn(this, (DateWithTimeRange.__proto__ || Object.getPrototypeOf(DateWithTimeRange)).call(this, props));

        if (props.id) {
            _this.state = { id: props.id };
        } else {
            _this.state = { id: _uuid2.default.v4() };
        }
        _this.state.value = {};
        if (_this.props.value) {
            _this.state.value = { date: _this.props.value.date, time: _this.props.value.time };
        }

        return _this;
    }

    _createClass(DateWithTimeRange, [{
        key: 'componentDidMount',
        value: function componentDidMount() {}
    }, {
        key: 'handleDateChange',
        value: function handleDateChange(value) {
            var state = _lodash2.default.cloneDeep(this.state);
            state.value.date = value;
            this.handleOnChange(state);
            this.setState(state);
        }
    }, {
        key: 'handleTimeChange',
        value: function handleTimeChange(value) {
            var state = _lodash2.default.cloneDeep(this.state);
            state.value.time = value;
            this.handleOnChange(state);
            this.setState(state);
        }
    }, {
        key: 'handleOnChange',
        value: function handleOnChange(state) {
            if (state.value.date || state.value.time) {
                this.props.onchange && this.props.onchange(state.value);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var date = this.state.value ? this.state.value.date : "";
            var time = this.state.value ? this.state.value.time : {};

            return _react2.default.createElement(
                _layout.Grid,
                { collapse: true },
                _react2.default.createElement(
                    _layout.GridCell,
                    { width: '1-2' },
                    _react2.default.createElement(_Date.Date, { onchange: function onchange(value) {
                            return _this2.handleDateChange(value);
                        }, value: date, hidden: this.props.hidden,
                        label: this.props.label, required: this.props.required, format: this.props.format,
                        placeholder: this.props.placeholder })
                ),
                _react2.default.createElement(
                    _layout.GridCell,
                    { width: '1-2' },
                    _react2.default.createElement(_TimeRange.TimeRange, { hideIcon: true, onchange: function onchange(value) {
                            return _this2.handleTimeChange(value);
                        }, value: time, hidden: this.props.hidden,
                        from: this.props.from, to: this.props.to, step: this.props.step, required: this.props.required })
                )
            );
        }
    }]);

    return DateWithTimeRange;
}(_react2.default.Component);