'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Span = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _abstract = require('../abstract/');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Span = exports.Span = function (_TranslatingComponent) {
    _inherits(Span, _TranslatingComponent);

    function Span(props) {
        _classCallCheck(this, Span);

        return _possibleConstructorReturn(this, (Span.__proto__ || Object.getPrototypeOf(Span)).call(this, props));
    }

    _createClass(Span, [{
        key: 'renderAsLinkOrNormal',
        value: function renderAsLinkOrNormal(className, value) {
            var tooltip = this.props.tooltip;

            var style = { padding: "12px 4px", display: "block" };
            if (this.props.onclick) {
                return _react2.default.createElement(
                    'a',
                    { className: className, style: style,
                        'data-uk-tooltip': '{pos:\'' + (tooltip.position || 'top') + '\'}',
                        title: tooltip.title,
                        href: 'javascript:;', onClick: this.props.onclick },
                    value
                );
            } else {
                return _react2.default.createElement(
                    'span',
                    { className: className, style: style,
                        'data-uk-tooltip': '{pos:\'' + (tooltip.position || 'top') + '\'}',
                        title: tooltip.title },
                    value
                );
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var label = "";
            if (!this.props.hideLabel) {
                label = _get(Span.prototype.__proto__ || Object.getPrototypeOf(Span.prototype), 'translate', this).call(this, this.props.label);
            }
            var value = this.props.translate ? _get(Span.prototype.__proto__ || Object.getPrototypeOf(Span.prototype), 'translate', this).call(this, this.props.value) : this.props.value;
            var className = "";
            if (this.props.uppercase) {
                className += " uk-text-upper";
            }
            if (this.props.bold) {
                className += " uk-text-bold";
            }
            if (this.props.textStyle) {
                className += ' uk-text-' + this.props.textStyle;
            }

            var helperComponent = "";
            if (this.props.helperText) {
                helperComponent = _react2.default.createElement(
                    'span',
                    { className: 'uk-form-help-block' },
                    this.props.helperText
                );
            }

            return _react2.default.createElement(
                'div',
                { className: 'uk-form-row' },
                _react2.default.createElement(
                    'div',
                    { className: 'md-input-wrapper md-input-filled' },
                    _react2.default.createElement(
                        'label',
                        null,
                        label
                    ),
                    this.renderAsLinkOrNormal(className, value)
                ),
                helperComponent
            );
        }
    }]);

    return Span;
}(_abstract.TranslatingComponent);

Span.defaultProps = { tooltip: {} };

Span.contextTypes = {
    translator: _propTypes2.default.object
};