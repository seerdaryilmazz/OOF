"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DateTime = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _uuid = require("uuid");

var _uuid2 = _interopRequireDefault(_uuid);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _Date = require("./Date");

var _basic = require("../basic");

var _Time = require("./Time");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DateTime = exports.DateTime = function (_React$Component) {
    _inherits(DateTime, _React$Component);

    function DateTime(props) {
        _classCallCheck(this, DateTime);

        var _this = _possibleConstructorReturn(this, (DateTime.__proto__ || Object.getPrototypeOf(DateTime)).call(this, props));

        if (props.id) {
            _this.state = { id: props.id };
        } else {
            _this.state = { id: _uuid2.default.v4() };
        }
        return _this;
    }

    _createClass(DateTime, [{
        key: "getParsedDateTime",
        value: function getParsedDateTime(value) {
            if (value) {
                var dateMatch = value.match(/(\d{2}\/\d{2}\/\d{4})/);
                var timeMatch = value.match(/(\d{2}:\d{2})/);
                var timeZoneMatch = value.match(/\d{2}:\d{2} (.+)/);
                var result = [dateMatch == null ? "" : dateMatch[0], timeMatch == null ? "" : timeMatch[0], timeZoneMatch == null ? "" : timeZoneMatch[1]];

                return result;
            } else {
                return ["", "", ""];
            }
        }
    }, {
        key: "getParsedTime",
        value: function getParsedTime(value) {
            if (value) {
                var timeMatch = value.match(/(\d{2}:\d{2})/);
                var timeZoneMatch = value.match(/\d{2}:\d{2} (.+)/);
                var result = [timeMatch == null ? "" : timeMatch[0], timeZoneMatch == null ? "" : timeZoneMatch[1]];
                return result;
            } else {
                return ["", ""];
            }
        }
    }, {
        key: "handleDateChange",
        value: function handleDateChange(value) {
            var parsedDateTime = this.getParsedDateTime(this.props.value);
            parsedDateTime[0] = value;
            var result = "";
            if (!_lodash2.default.isEmpty(parsedDateTime[0])) {
                result = parsedDateTime[0];
                if (!_lodash2.default.isEmpty(parsedDateTime[1])) {
                    result = result + " " + parsedDateTime[1] + (this.props.hideTimezone ? "" : " " + (!_lodash2.default.isEmpty(parsedDateTime[2]) ? parsedDateTime[2] : this.getDefaultTimeZone()));
                }
                result = _lodash2.default.trim(result);
            } else {
                result = null;
            }
            this.props.onchange && this.props.onchange(result);
        }
    }, {
        key: "handleTimeChange",
        value: function handleTimeChange(value) {
            var parsedDateTime = this.getParsedDateTime(this.props.value);
            parsedDateTime[1] = this.getParsedTime(value)[0];
            var result = "";
            if (!_lodash2.default.isEmpty(parsedDateTime[0])) {
                result = parsedDateTime[0];
            }
            if (!_lodash2.default.isEmpty(parsedDateTime[1])) {
                result = result + " " + parsedDateTime[1] + (this.props.hideTimezone ? "" : " " + (!_lodash2.default.isEmpty(parsedDateTime[2]) ? parsedDateTime[2] : this.getDefaultTimeZone()));
            }
            result = _lodash2.default.trim(result);
            this.props.onchange && this.props.onchange(result);
        }
    }, {
        key: "getDefaultTimeZone",
        value: function getDefaultTimeZone() {
            return this.props.timezone ? this.props.timezone : this.context.user ? this.context.user.timeZoneId : "";
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            var dateId = this.state.id + "-date";
            var timeId = this.state.id + "-time";

            var _getParsedDateTime = this.getParsedDateTime(this.props.value),
                _getParsedDateTime2 = _slicedToArray(_getParsedDateTime, 3),
                date = _getParsedDateTime2[0],
                time = _getParsedDateTime2[1],
                timezone = _getParsedDateTime2[2];

            if (this.props.hideTimezone) {
                timezone = "";
            } else if (!timezone) {
                timezone = this.getDefaultTimeZone();
            }

            var maskSettings = "'showMaskOnFocus':'true', 'mask':'h:s'";

            var timeComponent = this.props.timeAsTextInput ? _react2.default.createElement(_basic.TextInput, { id: timeId,
                helperText: timezone,
                mask: maskSettings,
                onchange: function onchange(value) {
                    return _this2.handleTimeChange(value);
                },
                value: time,
                hidden: this.props.hidden,
                required: this.props.required }) : _react2.default.createElement(_Time.Time, { id: timeId, hideIcon: true,
                hideTimezone: this.props.hideTimezone,
                timezone: timezone,
                onchange: function onchange(value) {
                    return _this2.handleTimeChange(value);
                },
                value: time,
                hidden: this.props.hidden,
                from: this.props.from, to: this.props.to, step: this.props.step,
                required: this.props.required });

            return _react2.default.createElement(
                "div",
                { className: "uk-grid uk-grid-collapse" },
                _react2.default.createElement(
                    "div",
                    { className: "uk-width-medium-3-5" },
                    _react2.default.createElement(_Date.Date, { id: dateId, onchange: function onchange(value) {
                            return _this2.handleDateChange(value);
                        }, value: date,
                        hidden: this.props.hidden,
                        label: this.props.label, required: this.props.required, format: this.props.format,
                        hideIcon: this.props.hideIcon,
                        minDate: this.props.minDate, maxDate: this.props.maxDate,
                        placeholder: this.props.placeholder })
                ),
                _react2.default.createElement(
                    "div",
                    { className: "uk-width-medium-2-5" },
                    timeComponent
                )
            );
        }
    }]);

    return DateTime;
}(_react2.default.Component);

DateTime.contextTypes = {
    user: _propTypes2.default.object
};