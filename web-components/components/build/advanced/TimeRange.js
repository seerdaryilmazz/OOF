'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TimeRange = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Time = require('./Time');

var _Grid = require('../layout/Grid');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TimeRange = exports.TimeRange = function (_React$Component) {
    _inherits(TimeRange, _React$Component);

    function TimeRange(props) {
        _classCallCheck(this, TimeRange);

        var _this = _possibleConstructorReturn(this, (TimeRange.__proto__ || Object.getPrototypeOf(TimeRange)).call(this, props));

        _this.state = { start: { from: _this.props.from, to: _this.props.to }, end: { from: _this.props.from, to: _this.props.to } };
        if (_this.props.value) {
            _this.setStartTime(_this.state, _this.props.value.startTime);
            _this.setEndTime(_this.state, _this.props.value.endTime);
        }
        return _this;
    }

    _createClass(TimeRange, [{
        key: 'componentDidMount',
        value: function componentDidMount() {}
    }, {
        key: 'handleStartTimeChange',
        value: function handleStartTimeChange(value) {
            var state = _.cloneDeep(this.state);
            this.setStartTime(state, value);
            this.setState(state);
            this.handleOnChange();
        }
    }, {
        key: 'setStartTime',
        value: function setStartTime(state, value) {
            state.end.from = value;
            state.start.value = value;
        }
    }, {
        key: 'setEndTime',
        value: function setEndTime(state, value) {
            state.start.to = value;
            state.end.value = value;
        }
    }, {
        key: 'handleEndTimeChange',
        value: function handleEndTimeChange(value) {
            var state = _.cloneDeep(this.state);
            this.setEndTime(state, value);
            this.setState(state);
            this.handleOnChange();
        }
    }, {
        key: 'handleOnChange',
        value: function handleOnChange() {
            var result = {};
            if (this.state.start.value || this.state.end.value) {
                result.startTime = this.state.start.value;
                result.endTime = this.state.end.value;
                this.props.onchange && this.props.onchange(result);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var style = {};
            if (this.props.hidden) {
                style.display = 'none';
            }
            return _react2.default.createElement(
                _Grid.Grid,
                { collapse: true },
                _react2.default.createElement(
                    _Grid.GridCell,
                    { width: '3-5' },
                    _react2.default.createElement(_Time.Time, { required: this.props.required, hideIcon: this.props.hideIcon, step: this.props.step, from: this.state.start.from, to: this.state.start.to,
                        label: this.props.startTimeLabel, onchange: function onchange(value) {
                            return _this2.handleStartTimeChange(value);
                        }, value: this.state.start.value })
                ),
                _react2.default.createElement(
                    _Grid.GridCell,
                    { width: '2-5' },
                    _react2.default.createElement(_Time.Time, { required: this.props.required, hideIcon: true, step: this.props.step, from: this.state.end.from, to: this.state.end.to,
                        label: this.props.endTimeLabel, onchange: function onchange(value) {
                            return _this2.handleEndTimeChange(value);
                        }, value: this.state.end.value })
                )
            );
        }
    }]);

    return TimeRange;
}(_react2.default.Component);