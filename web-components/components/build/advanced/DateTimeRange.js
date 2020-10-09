'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DateTimeRange = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _DateTime = require('./DateTime');

var _Grid = require('../layout/Grid');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DateTimeRange = exports.DateTimeRange = function (_React$Component) {
    _inherits(DateTimeRange, _React$Component);

    function DateTimeRange(props) {
        _classCallCheck(this, DateTimeRange);

        var _this = _possibleConstructorReturn(this, (DateTimeRange.__proto__ || Object.getPrototypeOf(DateTimeRange)).call(this, props));

        var id = _uuid2.default.v4();
        if (_this.props.id) {
            id = _this.props.id;
        }
        _this.startId = id + "_start";
        _this.endId = id + "_end";
        return _this;
    }

    _createClass(DateTimeRange, [{
        key: 'handleStartDate',
        value: function handleStartDate(value) {
            this.handleOnChange(value, this.props.value ? this.props.value.endDateTime : null);
        }
    }, {
        key: 'handleEndDate',
        value: function handleEndDate(value) {
            this.handleOnChange(this.props.value ? this.props.value.startDateTime : null, value);
        }
    }, {
        key: 'handleOnChange',
        value: function handleOnChange(startDateTime, endDateTime) {
            this.props.onchange && this.props.onchange({ startDateTime: startDateTime, endDateTime: endDateTime });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var style = {};
            if (this.props.hidden) {
                style.display = 'none';
            }
            var startDateTime = this.props.value && this.props.value.startDateTime;
            var endDateTime = this.props.value && this.props.value.endDateTime;

            return _react2.default.createElement(
                _Grid.Grid,
                null,
                _react2.default.createElement(
                    _Grid.GridCell,
                    { width: '1-2', noMargin: true },
                    _react2.default.createElement(_DateTime.DateTime, { key: this.startId, id: this.startId, label: this.props.startDateLabel,
                        hideIcon: this.props.hideIcon, timeAsTextInput: this.props.timeAsTextInput,
                        onchange: function onchange(value) {
                            return _this2.handleStartDate(value);
                        }, value: startDateTime,
                        hideTimezone: this.props.hideTimezone, timezone: this.props.timezone,
                        maxDate: endDateTime })
                ),
                _react2.default.createElement(
                    _Grid.GridCell,
                    { width: '1-2', noMargin: true },
                    _react2.default.createElement(_DateTime.DateTime, { key: this.endId, id: this.endId, label: this.props.endDateLabel,
                        hideIcon: this.props.hideIcon, timeAsTextInput: this.props.timeAsTextInput,
                        onchange: function onchange(value) {
                            return _this2.handleEndDate(value);
                        }, value: endDateTime,
                        hideTimezone: this.props.hideTimezone, timezone: this.props.timezone,
                        minDate: startDateTime })
                )
            );
        }
    }]);

    return DateTimeRange;
}(_react2.default.Component);