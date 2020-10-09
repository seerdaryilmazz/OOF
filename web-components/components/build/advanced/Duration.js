'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Duration = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _basic = require('../basic');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Duration = exports.Duration = function (_React$Component) {
    _inherits(Duration, _React$Component);

    function Duration(props) {
        _classCallCheck(this, Duration);

        var _this = _possibleConstructorReturn(this, (Duration.__proto__ || Object.getPrototypeOf(Duration)).call(this, props));

        if (props.id) {
            _this.state = { id: props.id };
        } else {
            _this.state = { id: _uuid2.default.v4() };
        }
        _this.state = { options: _this.retrieveOptions() };

        return _this;
    }

    _createClass(Duration, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.formatAndSetValue(this.props.value);
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            this.formatAndSetValue(nextProps.value);
        }
    }, {
        key: 'retrieveOptions',
        value: function retrieveOptions() {
            var options = {};
            var hours = [];
            var minutes = [];
            var seconds = [];

            var i = void 0;

            i = 0;
            for (i = 0; i <= 23; i++) {
                if (i < 10) {
                    hours.push({ id: "0" + i.toString(), name: "0" + i.toString() + " H" });
                } else {
                    hours.push({ id: i.toString(), name: i.toString() + " H" });
                }
            }

            i = 0;
            for (i = 0; i <= 59; i++) {
                if (i < 10) {
                    minutes.push({ id: "0" + i.toString(), name: "0" + i.toString() + " M" });
                } else {
                    minutes.push({ id: i.toString(), name: i.toString() + " M" });
                }
            }

            i = 0;
            for (i = 0; i <= 59; i++) {
                if (i < 10) {
                    seconds.push({ id: "0" + i.toString(), name: "0" + i.toString() + " S" });
                } else {
                    seconds.push({ id: i.toString(), name: i.toString() + " S" });
                }
            }

            options.hours = hours;
            options.minutes = minutes;
            options.seconds = seconds;

            return options;
        }
    }, {
        key: 'handleChange',
        value: function handleChange(field, value) {
            var _this2 = this;

            this.setState(_defineProperty({}, field, value.id), function () {
                _this2.props.onchange(_this2.state.hours + ":" + _this2.state.minutes + ":" + _this2.state.seconds);
            });
        }
    }, {
        key: 'formatAndSetValue',
        value: function formatAndSetValue(value) {

            if (!value) {
                this.setState({ hours: null, minutes: null, seconds: null });
            } else {
                var result = value.split(":");

                if (result.length != 3) {
                    console.error("Invalid duration format, expected format is hh:mm:ss");
                    return;
                }

                this.setState({ hours: result[0], minutes: result[1], seconds: result[2] });
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var style = {};
            if (this.props.hidden) {
                style.display = 'none';
            }
            var wrapperClassName = "md-input-filled";
            if (this.props.value || this.props.placeholder) {
                wrapperClassName += " md-input-filled";
            }
            var label = "";
            if (!this.props.hideLabel) {
                label = this.props.label;
            }

            var options = this.state.options;

            var hourDropDown = _react2.default.createElement(_basic.DropDown, { id: this.state.id, options: options.hours,
                onchange: function onchange(value) {
                    return _this3.handleChange("hours", value);
                },
                required: this.props.required,
                value: this.state.hours, placeholder: 'Hour' });

            var minDropDown = _react2.default.createElement(_basic.DropDown, { id: this.state.id, options: options.minutes,
                onchange: function onchange(value) {
                    return _this3.handleChange("minutes", value);
                },
                required: this.props.required,
                value: this.state.minutes, placeholder: 'Min' });

            var secDropDown = _react2.default.createElement(_basic.DropDown, { id: this.state.id, options: options.seconds,
                onchange: function onchange(value) {
                    return _this3.handleChange("seconds", value);
                },
                required: this.props.required,
                value: this.state.seconds, placeholder: 'Sec' });

            return _react2.default.createElement(
                'div',
                { className: 'md-input-wrapper md-input-filled' },
                _react2.default.createElement(
                    'label',
                    null,
                    label
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'uk-grid uk-grid-collapse' },
                    _react2.default.createElement(
                        'div',
                        { key: 'aa', className: 'uk-width-medium-1-3' },
                        _react2.default.createElement(
                            'div',
                            { className: 'parsley-row', style: style },
                            _react2.default.createElement(
                                'div',
                                { className: wrapperClassName },
                                hourDropDown
                            )
                        )
                    ),
                    _react2.default.createElement(
                        'div',
                        { key: 'bb', className: 'uk-width-medium-1-3' },
                        _react2.default.createElement(
                            'div',
                            { className: 'parsley-row', style: style },
                            _react2.default.createElement(
                                'div',
                                { className: wrapperClassName },
                                minDropDown
                            )
                        )
                    ),
                    _react2.default.createElement(
                        'div',
                        { key: 'cc', className: 'uk-width-medium-1-3' },
                        _react2.default.createElement(
                            'div',
                            { className: 'parsley-row', style: style },
                            _react2.default.createElement(
                                'div',
                                { className: wrapperClassName },
                                secDropDown
                            )
                        )
                    )
                )
            );
        }
    }]);

    return Duration;
}(_react2.default.Component);

Duration.contextTypes = {
    user: _propTypes2.default.object
};