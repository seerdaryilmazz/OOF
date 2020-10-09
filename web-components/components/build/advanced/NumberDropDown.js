'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.NumberDropDown = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _abstract = require('../abstract/');

var _basic = require('../basic');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var NumberDropDown = exports.NumberDropDown = function (_TranslatingComponent) {
    _inherits(NumberDropDown, _TranslatingComponent);

    function NumberDropDown(props) {
        _classCallCheck(this, NumberDropDown);

        var _this = _possibleConstructorReturn(this, (NumberDropDown.__proto__ || Object.getPrototypeOf(NumberDropDown)).call(this, props));

        _this.state = {};
        return _this;
    }

    _createClass(NumberDropDown, [{
        key: 'handleOnChange',
        value: function handleOnChange(value) {
            if (this.props.onchange) {
                if (_lodash2.default.isNil(value)) {
                    this.props.onchange(null);
                } else {
                    this.props.onchange(value.id);
                }
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var options = [];

            if (!_lodash2.default.isNil(this.props.options)) {
                this.props.options.forEach(function (option) {
                    options.push({
                        id: option,
                        name: "" + option
                    });
                });
            }

            var value = null;

            if (!_lodash2.default.isNil(this.props.value)) {
                value = {
                    id: this.props.value,
                    name: "" + this.props.value
                };
            }

            return _react2.default.createElement(_basic.DropDown, _extends({}, this.props, { options: options, value: value, onchange: function onchange(value) {
                    return _this2.handleOnChange(value);
                } }));
        }
    }]);

    return NumberDropDown;
}(_abstract.TranslatingComponent);

NumberDropDown.contextTypes = {
    translator: _propTypes2.default.object
};