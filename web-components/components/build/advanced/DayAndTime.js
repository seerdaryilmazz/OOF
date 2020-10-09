'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DayAndTime = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _basic = require('../basic');

var _Time = require('./Time');

var _layout = require('../layout');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DayAndTime = exports.DayAndTime = function (_React$Component) {
    _inherits(DayAndTime, _React$Component);

    function DayAndTime(props) {
        _classCallCheck(this, DayAndTime);

        var _this = _possibleConstructorReturn(this, (DayAndTime.__proto__ || Object.getPrototypeOf(DayAndTime)).call(this, props));

        if (props.id) {
            _this.state = { id: props.id };
        } else {
            _this.state = { id: _uuid2.default.v4() };
        }
        return _this;
    }

    _createClass(DayAndTime, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.buildDayOptions(this.props);
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            this.buildDayOptions(nextProps);
        }
    }, {
        key: 'buildDayOptions',
        value: function buildDayOptions(props) {
            var days = [];
            var startIndex = null;
            var endIndex = null;
            if (props.fromDay) {
                startIndex = _lodash2.default.findIndex(props.days, { id: props.fromDay.id });
            }
            if (props.toDay) {
                endIndex = _lodash2.default.findIndex(props.days, { id: props.toDay.id });
            }
            if (props.days) {
                props.days.forEach(function (day, index) {
                    if ((!_lodash2.default.isNumber(startIndex) || index >= startIndex) && (!_lodash2.default.isNumber(endIndex) || index <= endIndex)) {
                        days.push({ id: day.id + "#w0", name: day.name, week: "Same Week", dayIndex: index, weekOffset: 0 });
                    }
                });
                if (props.showWeeks) {
                    var weeks = parseInt(props.showWeeks);

                    if (weeks > 0) {
                        var _loop = function _loop(i) {
                            var weekLabel = i == 1 ? 'Next Week' : i + ' Weeks After';
                            props.days.forEach(function (day, index) {
                                days.push({
                                    id: day.id + "#w" + i,
                                    name: day.name,
                                    week: weekLabel,
                                    dayIndex: index,
                                    weekOffset: i
                                });
                            });
                        };

                        for (var i = 1; i <= weeks; i++) {
                            _loop(i);
                        }
                    } else if (weeks < 0) {
                        var _loop2 = function _loop2(i) {
                            var weekLabel = i == -1 ? 'Previous Week' : i * -1 + ' Weeks Before';
                            props.days.forEach(function (day, index) {
                                days.push({
                                    id: day.id + "#w" + i,
                                    name: day.name,
                                    week: weekLabel,
                                    dayIndex: index,
                                    weekOffset: i
                                });
                            });
                        };

                        for (var i = -1; i >= weeks; i--) {
                            _loop2(i);
                        }
                    }
                }
            }
            this.setState({ days: days });
        }
    }, {
        key: 'handleDayChange',
        value: function handleDayChange(value) {
            var existingValue = _lodash2.default.cloneDeep(this.props.value);
            if (!existingValue) {
                existingValue = {};
            }
            existingValue.day = _lodash2.default.cloneDeep(value);
            if (existingValue.day) {
                existingValue.day.id = existingValue.day.id.split("#w")[0];
                existingValue.dayIndex = existingValue.day.dayIndex;
                existingValue.weekOffset = existingValue.day.weekOffset;
                existingValue.weekDescription = existingValue.day.week;
            } else {
                delete existingValue.dayIndex;
                delete existingValue.weekOffset;
                delete existingValue.weekDescription;
            }

            this.props.onchange && this.props.onchange(existingValue);
        }
    }, {
        key: 'handleTimeChange',
        value: function handleTimeChange(value) {
            var existingValue = _lodash2.default.cloneDeep(this.props.value);
            if (!existingValue) {
                existingValue = {};
            }
            existingValue.time = value;
            this.props.onchange && this.props.onchange(existingValue);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var requiredForLabel = "";
            if (this.props.required && this.props.label) {
                requiredForLabel = _react2.default.createElement(
                    'span',
                    { className: 'req' },
                    '*'
                );
            }

            var value = _lodash2.default.cloneDeep(this.props.value);

            if (value && value.day) {
                value.day.id = value.day.id + "#w" + (value.weekOffset ? value.weekOffset : "0");
            }

            return _react2.default.createElement(
                'div',
                { className: 'md-input-wrapper md-input-filled' },
                _react2.default.createElement(
                    'label',
                    null,
                    this.props.label,
                    requiredForLabel
                ),
                _react2.default.createElement(
                    _layout.Grid,
                    { collapse: true },
                    _react2.default.createElement(
                        _layout.GridCell,
                        { width: '1-2' },
                        _react2.default.createElement(_basic.DropDown, { options: this.state.days,
                            value: value ? value.day : null,
                            onchange: function onchange(value) {
                                return _this2.handleDayChange(value);
                            },
                            required: this.props.required,
                            placeholder: 'Select day of week',
                            groupBy: this.props.showWeeks ? 'week' : '' })
                    ),
                    _react2.default.createElement(
                        _layout.GridCell,
                        { width: '1-2' },
                        _react2.default.createElement(_Time.Time, { value: value ? value.time : null, hideIcon: true,
                            onchange: function onchange(value) {
                                return _this2.handleTimeChange(value);
                            },
                            timezone: value ? value.timezone : null,
                            required: this.props.required,
                            hideTimezone: this.props.hideTimezone,
                            from: this.props.fromTime,
                            to: this.props.toTime })
                    )
                )
            );
        }
    }]);

    return DayAndTime;
}(_react2.default.Component);

DayAndTime.contextTypes = {
    user: _propTypes2.default.object
};