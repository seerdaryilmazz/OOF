'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Time = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _basic = require('../basic');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Time = exports.Time = function (_React$Component) {
    _inherits(Time, _React$Component);

    function Time(props) {
        _classCallCheck(this, Time);

        var _this = _possibleConstructorReturn(this, (Time.__proto__ || Object.getPrototypeOf(Time)).call(this, props));

        if (props.id) {
            _this.state = { id: props.id };
        } else {
            _this.state = { id: _uuid2.default.v4() };
        }

        return _this;
    }

    _createClass(Time, [{
        key: 'componentDidMount',
        value: function componentDidMount() {}
    }, {
        key: 'handleChange',
        value: function handleChange(timezone, value) {
            var result = "";
            if (value) {
                result = value.id;
                if (!this.props.hideTimezone) {
                    result = result + " " + timezone;
                }
            }
            this.props.onchange && this.props.onchange(result);
        }
    }, {
        key: 'addMinutes',
        value: function addMinutes(time, step) {
            var newMinutes = time.minutes + step;
            var newHours = time.hours;
            var newDay = time.day;
            if (newMinutes >= 60) {
                newMinutes = newMinutes % 60;
                newHours++;
            } else if (newMinutes < 0) {
                newMinutes = 60 + newMinutes;
                newHours--;
            }
            if (newHours >= 24) {
                newHours = newHours % 24;
                newDay++;
            } else if (newHours < 0) {
                newHours = 24 + newHours;
                newDay--;
            }
            return { day: newDay, hours: newHours, minutes: newMinutes };
        }
    }, {
        key: 'isGreaterThanOrEqual',
        value: function isGreaterThanOrEqual(time1, time2) {
            if (time1.day > time2.day) {
                return true;
            } else if (time1.day < time2.day) {
                return false;
            }

            if (time1.hours > time2.hours) {
                return true;
            } else if (time1.hours < time2.hours) {
                return false;
            }

            if (time1.minutes >= time2.minutes) {
                return true;
            } else {
                return false;
            }
        }
    }, {
        key: 'printTime',
        value: function printTime(time) {
            var hours = time.hours < 10 ? "0" + time.hours : "" + time.hours;
            var minutes = time.minutes < 10 ? "0" + time.minutes : "" + time.minutes;
            return hours + ":" + minutes;
        }
    }, {
        key: 'generateOptions',
        value: function generateOptions() {
            var startTime = this.props.from ? this.props.from : "00:00";
            var endTime = this.props.to ? this.props.to : "00:00";

            var _startTime$split$map = startTime.split(":").map(function (item) {
                return Number.parseInt(item);
            }),
                _startTime$split$map2 = _slicedToArray(_startTime$split$map, 2),
                startHours = _startTime$split$map2[0],
                startMinutes = _startTime$split$map2[1];

            var start = { day: 0, hours: startHours, minutes: startMinutes };

            var _endTime$split$map = endTime.split(":").map(function (item) {
                return Number.parseInt(item);
            }),
                _endTime$split$map2 = _slicedToArray(_endTime$split$map, 2),
                endHours = _endTime$split$map2[0],
                endMinutes = _endTime$split$map2[1];

            var end = { day: 0, hours: endHours, minutes: endMinutes };
            if (this.isGreaterThanOrEqual(start, end)) {
                end.day = 1;
            }

            if (startTime == endTime) {
                end = this.addMinutes(end, -1);
            }

            var step = this.props.step ? Number.parseInt(this.props.step) : 30;
            var options = [];
            var time = start;
            while (this.isGreaterThanOrEqual(end, time)) {
                var printed = this.printTime(time);
                options.push({ id: printed, name: printed });
                time = this.addMinutes(time, step);
            }
            return options;
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var style = {};
            if (this.props.hidden) {
                style.display = 'none';
            }
            var hideIcon = false;
            if (this.props.hideIcon) {
                hideIcon = true;
            }
            var wrapperClassName = "";
            //var wrapperClassName = "md-input-wrapper";
            if (this.props.value || this.props.placeholder) {
                wrapperClassName += " md-input-filled";
            }

            var timezone = "UTC";
            if (this.props.hideTimezone) {
                timezone = "";
            } else {
                if (this.props.timezone) {
                    timezone = this.props.timezone;
                } else if (this.context.user) {
                    timezone = this.context.user.timeZoneId;
                }
            }

            var value = this.props.value;
            if (value) {
                value = value.split(" ")[0];
            }

            var timezoneInfo = null;
            if (!this.props.hideTimezone) {
                timezoneInfo = _react2.default.createElement(
                    'span',
                    { className: 'uk-form-help-block' },
                    timezone
                );
            }

            var options = this.generateOptions();

            var dropDown = _react2.default.createElement(_basic.DropDown, { id: this.state.id, label: this.props.label,
                options: options, onchange: function onchange(value) {
                    return _this2.handleChange(timezone, value);
                }, required: this.props.required,
                value: value, placeholder: 'hh:mm' });

            if (!hideIcon) {
                dropDown = _react2.default.createElement(
                    'div',
                    { className: 'uk-input-group', style: style },
                    _react2.default.createElement(
                        'span',
                        { className: 'uk-input-group-addon' },
                        _react2.default.createElement('i', { className: 'uk-input-group-icon uk-icon-clock-o' })
                    ),
                    dropDown
                );
            }
            var dropDownInfo = null;
            if (!this.props.hideTime) {
                dropDownInfo = _react2.default.createElement(
                    'div',
                    { className: 'uk-width-medium-1-1' },
                    _react2.default.createElement(
                        'div',
                        { className: 'parsley-row', style: style },
                        _react2.default.createElement(
                            'div',
                            { className: wrapperClassName },
                            dropDown
                        ),
                        timezoneInfo
                    )
                );
            }

            return _react2.default.createElement(
                'div',
                { className: 'uk-grid uk-grid-collapse' },
                dropDownInfo
            );
        }
    }]);

    return Time;
}(_react2.default.Component);

Time.contextTypes = {
    user: _propTypes2.default.object
};