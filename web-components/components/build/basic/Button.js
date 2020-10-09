'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Button = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _abstract = require('../abstract/');

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Button = exports.Button = function (_TranslatingComponent) {
    _inherits(Button, _TranslatingComponent);

    function Button(props) {
        _classCallCheck(this, Button);

        var _this = _possibleConstructorReturn(this, (Button.__proto__ || Object.getPrototypeOf(Button)).call(this, props));

        _this.clickTime = 0;
        _this.clickCooldown = 1000;
        return _this;
    }

    _createClass(Button, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            $(this._input).on('click', function (event) {
                var time = new Date().getTime();
                var allowClickAfter = _this2.clickTime + _this2.clickCooldown;
                if (_this2.props.onclick && (_this2.props.disableCooldown || time > allowClickAfter)) {
                    _this2.props.onclick(event);
                    _this2.clickTime = time;
                }
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var className = "md-btn md-btn-wave waves-effect waves-button";
            if (this.props.flat) {
                className += " md-btn-flat";
            }
            if (this.props.icon) {
                className += " md-btn-icon";
            }
            if (this.props.style) {
                className += this.props.flat ? " md-btn-flat-" + this.props.style : " md-btn-" + this.props.style;
            }
            if (this.props.textColor) {
                className = className + " " + this.props.textColor;
            }
            if (this.props.size) {
                className += " md-btn-" + this.props.size;
            }
            if (this.props.disabled) {
                className += " disabled";
            }
            if (this.props.active) {
                className += " uk-active";
            }
            if (this.props.float) {
                className += " uk-float-" + this.props.float;
            }
            if (this.props.fullWidth) {
                className += " md-btn-block";
            }
            var icon;
            if (this.props.icon || this.props.mdIcon) {
                var iconClassName = void 0;
                if (this.props.icon) {
                    iconClassName = "uk-icon-medsmall uk-icon-" + this.props.icon;
                } else if (this.props.mdIcon) {
                    iconClassName = "material-icons";
                }

                if (this.props.iconColorClass) {
                    iconClassName = iconClassName + " " + this.props.iconColorClass;
                }
                var noMarginRight = this.props.label ? {} : { marginRight: "0px" };
                var tooltip = this.props.tooltip ? _get(Button.prototype.__proto__ || Object.getPrototypeOf(Button.prototype), 'translate', this).call(this, this.props.tooltip) : null;
                icon = _react2.default.createElement(
                    'i',
                    { className: iconClassName, style: noMarginRight, title: tooltip, 'data-uk-tooltip': '{pos:\'bottom\'}' },
                    this.props.mdIcon
                );
            }
            var type = this.props.type;
            if (!type) {
                type = "button";
            }

            var labelWrapper = void 0;
            if (this.props.label) {
                if (_lodash2.default.isString(this.props.label)) {
                    labelWrapper = _react2.default.createElement(
                        'span',
                        { style: this.props.labelStyle },
                        _get(Button.prototype.__proto__ || Object.getPrototypeOf(Button.prototype), 'translate', this).call(this, this.props.label)
                    );
                } else if (_lodash2.default.isArray(this.props.label)) {
                    // multiple line label
                    if (this.props.label.length == 1) {
                        labelWrapper = _get(Button.prototype.__proto__ || Object.getPrototypeOf(Button.prototype), 'translate', this).call(this, this.props.label[0]);
                    } else if (this.props.label.length > 1) {
                        labelWrapper = _react2.default.createElement(
                            'div',
                            null,
                            this.props.label.map(function (item, index) {
                                return _react2.default.createElement(
                                    'div',
                                    { key: "div-for-label-" + index, style: _this3.props.labelStyle },
                                    _get(Button.prototype.__proto__ || Object.getPrototypeOf(Button.prototype), 'translate', _this3).call(_this3, item)
                                );
                            })
                        );
                    }
                }
            }

            var id = this.props.id ? this.props.id : _uuid2.default.v4();

            return _react2.default.createElement(
                'button',
                { id: id, ref: function ref(c) {
                        return _this3._input = c;
                    }, className: className, type: type },
                icon,
                labelWrapper
            );
        }
    }]);

    return Button;
}(_abstract.TranslatingComponent);

Button.contextTypes = {
    translator: _propTypes2.default.object
};