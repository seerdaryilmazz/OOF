'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.MonthDropDown = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _abstract = require('../abstract');

var _basic = require('../basic');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MonthDropDown = exports.MonthDropDown = function (_TranslatingComponent) {
    _inherits(MonthDropDown, _TranslatingComponent);

    function MonthDropDown(props) {
        _classCallCheck(this, MonthDropDown);

        var _this = _possibleConstructorReturn(this, (MonthDropDown.__proto__ || Object.getPrototypeOf(MonthDropDown)).call(this, props));

        _this.state = {
            ready: false,
            options: []
        };
        return _this;
    }

    _createClass(MonthDropDown, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            // super.translate metodunu constructor içinde çağırdığımızda hata oluştuğundan listeyi burada dolduruyoruz.
            this.setState({
                ready: true,
                options: [{
                    id: 1,
                    name: _get(MonthDropDown.prototype.__proto__ || Object.getPrototypeOf(MonthDropDown.prototype), 'translate', this).call(this, "January")
                }, {
                    id: 2,
                    name: _get(MonthDropDown.prototype.__proto__ || Object.getPrototypeOf(MonthDropDown.prototype), 'translate', this).call(this, "February")
                }, {
                    id: 3,
                    name: _get(MonthDropDown.prototype.__proto__ || Object.getPrototypeOf(MonthDropDown.prototype), 'translate', this).call(this, "March")
                }, {
                    id: 4,
                    name: _get(MonthDropDown.prototype.__proto__ || Object.getPrototypeOf(MonthDropDown.prototype), 'translate', this).call(this, "April")
                }, {
                    id: 5,
                    name: _get(MonthDropDown.prototype.__proto__ || Object.getPrototypeOf(MonthDropDown.prototype), 'translate', this).call(this, "May")
                }, {
                    id: 6,
                    name: _get(MonthDropDown.prototype.__proto__ || Object.getPrototypeOf(MonthDropDown.prototype), 'translate', this).call(this, "June")
                }, {
                    id: 7,
                    name: _get(MonthDropDown.prototype.__proto__ || Object.getPrototypeOf(MonthDropDown.prototype), 'translate', this).call(this, "July")
                }, {
                    id: 8,
                    name: _get(MonthDropDown.prototype.__proto__ || Object.getPrototypeOf(MonthDropDown.prototype), 'translate', this).call(this, "August")
                }, {
                    id: 9,
                    name: _get(MonthDropDown.prototype.__proto__ || Object.getPrototypeOf(MonthDropDown.prototype), 'translate', this).call(this, "September")
                }, {
                    id: 10,
                    name: _get(MonthDropDown.prototype.__proto__ || Object.getPrototypeOf(MonthDropDown.prototype), 'translate', this).call(this, "October")
                }, {
                    id: 11,
                    name: _get(MonthDropDown.prototype.__proto__ || Object.getPrototypeOf(MonthDropDown.prototype), 'translate', this).call(this, "November")
                }, {
                    id: 12,
                    name: _get(MonthDropDown.prototype.__proto__ || Object.getPrototypeOf(MonthDropDown.prototype), 'translate', this).call(this, "December")
                }]
            });
        }
    }, {
        key: 'handleOnChange',
        value: function handleOnChange(value) {
            if (this.props.onchange) {
                if (value) {
                    this.props.onchange(value.id);
                } else {
                    this.props.onchange(null);
                }
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            if (!this.state.ready) {
                return null;
            }

            return _react2.default.createElement(_basic.DropDown, _extends({}, this.props, { options: this.state.options, value: { id: this.props.value }, onchange: function onchange(value) {
                    return _this2.handleOnChange(value);
                } }));
        }
    }]);

    return MonthDropDown;
}(_abstract.TranslatingComponent);