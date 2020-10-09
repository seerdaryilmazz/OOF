'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Switch = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _abstract = require('../abstract/');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Switch = exports.Switch = function (_TranslatingComponent) {
    _inherits(Switch, _TranslatingComponent);

    function Switch(props) {
        _classCallCheck(this, Switch);

        var _this = _possibleConstructorReturn(this, (Switch.__proto__ || Object.getPrototypeOf(Switch)).call(this, props));

        _this.color = {
            primary: '#1e88e5',
            danger: '#d32f2f',
            warning: '#ffb300',
            success: '#7cb342'
        };

        if (props.id) {
            _this.state = { id: props.id };
        } else {
            _this.state = { id: _uuid2.default.v4() };
        }
        return _this;
    }

    _createClass(Switch, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            var this_size = $(this._input).attr('data-switchery-size');
            var this_color = $(this._input).attr('data-switchery-color');
            var this_secondary_color = $(this._input).attr('data-switchery-secondary-color');

            this.switchery = new Switchery(this._input, {
                disabled: this.props.disabled,
                color: typeof this_color !== 'undefined' ? hex2rgba(this_color, 50) : hex2rgba('#009688', 50),
                jackColor: typeof this_color !== 'undefined' ? hex2rgba(this_color, 100) : hex2rgba('#009688', 100),
                secondaryColor: typeof this_secondary_color !== 'undefined' ? hex2rgba(this_secondary_color, 50) : 'rgba(0, 0, 0,0.26)',
                jackSecondaryColor: typeof this_secondary_color !== 'undefined' ? hex2rgba(this_secondary_color, 50) : '#fafafa',
                className: 'switchery' + (typeof this_size !== 'undefined' ? ' switchery-' + this_size : '')
            });

            this._input.onchange = function () {
                _this2.props.onChange && _this2.props.onChange(_this2._input.checked);
            };
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var input = _react2.default.createElement('input', { id: this.state.id,
                ref: function ref(c) {
                    return _this3._input = c;
                },
                type: 'checkbox',
                className: 'switchery',
                'data-switchery': 'true',
                'data-switchery-size': this.props.size,
                'data-switchery-color': this.color[this.props.style],
                defaultChecked: this.props.value });

            var label = _react2.default.createElement(
                'label',
                { htmlFor: this.state.id, className: 'inline-label' },
                this.props.translate ? _get(Switch.prototype.__proto__ || Object.getPrototypeOf(Switch.prototype), 'translate', this).call(this, this.props.label) : this.props.label
            );
            var helpText = _react2.default.createElement(
                'span',
                { className: 'uk-form-help-block' },
                this.props.translate ? _get(Switch.prototype.__proto__ || Object.getPrototypeOf(Switch.prototype), 'translate', this).call(this, this.props.helpText) : this.props.helpText
            );
            return _react2.default.createElement(
                'div',
                { className: 'checkbox-margin' },
                input,
                label,
                helpText
            );
        }
    }]);

    return Switch;
}(_abstract.TranslatingComponent);

Switch.contextTypes = {
    translator: _propTypes2.default.object
};