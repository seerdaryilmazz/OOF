'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.RadioButton = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _abstract = require('../abstract/');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var RadioButton = exports.RadioButton = function (_TranslatingComponent) {
    _inherits(RadioButton, _TranslatingComponent);

    function RadioButton(props) {
        _classCallCheck(this, RadioButton);

        var _this = _possibleConstructorReturn(this, (RadioButton.__proto__ || Object.getPrototypeOf(RadioButton)).call(this, props));

        if (props.id) {
            _this.state = { id: props.id };
        } else {
            _this.state = { id: _uuid2.default.v4() };
        }
        return _this;
    }

    _createClass(RadioButton, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            $(this._input).iCheck({
                radioClass: 'iradio_md',
                increaseArea: '20%'
            });
            $(this._input).on('ifChanged', function (e) {
                return _this2.ifChanged(e);
            });
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps, prevState) {
            $(this._input).iCheck('update');
        }
    }, {
        key: 'ifChanged',
        value: function ifChanged(event) {
            if (this.props.required) {
                $(this._input).parsley().validate();
            }

            if (this.props.onchange) {
                this.props.onchange(event.target.checked);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var input = _react2.default.createElement('input', { ref: function ref(c) {
                    return _this3._input = c;
                }, key: this.props.value,
                type: 'radio', id: this.state.id, name: this.props.name, required: this.props.required,
                'data-md-icheck': true, checked: this.props.checked, value: this.props.value, disabled: this.props.disabled });
            var label = _react2.default.createElement(
                'label',
                { htmlFor: this.state.id, className: 'inline-label' },
                _get(RadioButton.prototype.__proto__ || Object.getPrototypeOf(RadioButton.prototype), 'translate', this).call(this, this.props.label)
            );
            if (this.props.inline) {
                var className = "icheck-inline";
                if (this.props.noMargin === true) {
                    className += " uk-margin-remove";
                }
                return _react2.default.createElement(
                    'span',
                    { className: className, key: this.props.value },
                    input,
                    label
                );
            } else {
                return _react2.default.createElement(
                    'p',
                    null,
                    input,
                    label
                );
            }
        }
    }]);

    return RadioButton;
}(_abstract.TranslatingComponent);

RadioButton.contextTypes = {
    translator: _propTypes2.default.object
};