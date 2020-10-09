'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DayAndTimeRange = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _DayAndTime = require('./DayAndTime');

var _layout = require('../layout');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DayAndTimeRange = exports.DayAndTimeRange = function (_React$Component) {
    _inherits(DayAndTimeRange, _React$Component);

    function DayAndTimeRange(props) {
        _classCallCheck(this, DayAndTimeRange);

        var _this = _possibleConstructorReturn(this, (DayAndTimeRange.__proto__ || Object.getPrototypeOf(DayAndTimeRange)).call(this, props));

        _this.moment = require("moment");
        return _this;
    }

    _createClass(DayAndTimeRange, [{
        key: 'handleStartChange',
        value: function handleStartChange(value) {
            var existingValue = _lodash2.default.cloneDeep(this.props.value);
            existingValue.start = value;
            existingValue.duration = this.convertToMinutes(existingValue);
            this.props.onchange && this.props.onchange(existingValue);
        }
    }, {
        key: 'handleEndChange',
        value: function handleEndChange(value) {
            var existingValue = _lodash2.default.cloneDeep(this.props.value);
            existingValue.end = value;
            existingValue.duration = this.convertToMinutes(existingValue);
            this.props.onchange && this.props.onchange(existingValue);
        }
    }, {
        key: 'convertToMinutes',
        value: function convertToMinutes(existingValue) {
            var result = 0;
            if (existingValue && existingValue.start && existingValue.start.day && existingValue.start.time && existingValue.end && existingValue.end.day && existingValue.end.time) {
                var days = existingValue.end.day.dayIndex - existingValue.start.day.dayIndex;
                var startTime = void 0,
                    endTime = "";
                if (existingValue.start.time) {
                    startTime = this.moment(existingValue.start.time.split(" ")[0], 'HH:mm');
                }
                if (existingValue.end.time) {
                    endTime = this.moment(existingValue.end.time.split(" ")[0], 'HH:mm');
                }
                if (startTime && endTime) {
                    var duration = this.moment.duration(endTime.diff(startTime));

                    var weekDiff = existingValue.end.weekOffset - existingValue.start.weekOffset;

                    days = days + weekDiff * 7;

                    result = days * 24 * 60 + duration.asMinutes();
                }
            }
            return result;
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var value = this.props.value;

            var fromTime = null;
            var startDayId = _lodash2.default.get(this.props.value, "start.day.id");
            var startWeekOffset = _lodash2.default.get(this.props.value, "start.weekOffset");
            var endDayId = _lodash2.default.get(this.props.value, "end.day.id");
            var endWeekOffset = _lodash2.default.get(this.props.value, "end.weekOffset");
            if (startDayId === endDayId && startWeekOffset === endWeekOffset) {
                fromTime = _lodash2.default.get(this.props.value, "start.time");
            }
            return _react2.default.createElement(
                _layout.Grid,
                null,
                _react2.default.createElement(
                    _layout.GridCell,
                    { width: '1-2' },
                    _react2.default.createElement(_DayAndTime.DayAndTime, { days: this.props.days,
                        label: this.props.startLabel,
                        hideTimezone: this.props.hideTimezone,
                        onchange: function onchange(value) {
                            return _this2.handleStartChange(value);
                        },
                        value: value ? value.start : null,
                        required: this.props.required })
                ),
                _react2.default.createElement(
                    _layout.GridCell,
                    { width: '1-2' },
                    _react2.default.createElement(_DayAndTime.DayAndTime, { days: this.props.days,
                        label: this.props.endLabel,
                        hideTimezone: this.props.hideTimezone, showWeeks: 2,
                        onchange: function onchange(value) {
                            return _this2.handleEndChange(value);
                        },
                        value: value ? value.end : null,
                        fromDay: value ? value.start ? value.start.day : null : null,
                        fromTime: fromTime,
                        required: this.props.required })
                )
            );
        }
    }]);

    return DayAndTimeRange;
}(_react2.default.Component);