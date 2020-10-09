'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Password = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Password = exports.Password = function (_React$Component) {
    _inherits(Password, _React$Component);

    function Password(props) {
        _classCallCheck(this, Password);

        var _this = _possibleConstructorReturn(this, (Password.__proto__ || Object.getPrototypeOf(Password)).call(this, props));

        if (props.id) {
            _this.state = { id: props.id };
        } else {
            _this.state = { id: _uuid2.default.v4() };
        }
        return _this;
    }

    _createClass(Password, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            $(this._input).on('focus', function () {
                $(this).closest('.md-input-wrapper').addClass('md-input-focus');
            });
        }
    }, {
        key: 'handleOnChange',
        value: function handleOnChange(event) {
            if (this.props.onchange) {
                this.props.onchange(event.target.value);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var hidden = this.props.hidden;
            var style = {};
            if (hidden) {
                style.display = 'none';
            }
            var wrapperClassName = "md-input-wrapper";
            if (this.props.value || this.props.placeholder) {
                wrapperClassName += " md-input-filled";
            }
            var inputClassName = "md-input";
            if (this.props.placeholder) {
                inputClassName += " label-fixed";
            }
            var label = this.props.label;
            if (this.props.hideLabel) {
                label = "";
            }
            var requiredForLabel = "";
            if (this.props.required && label) {
                requiredForLabel = _react2.default.createElement(
                    'span',
                    { className: 'req' },
                    '*'
                );
            }
            return _react2.default.createElement(
                'div',
                { className: wrapperClassName },
                _react2.default.createElement(
                    'label',
                    null,
                    label,
                    requiredForLabel
                ),
                _react2.default.createElement('input', { ref: function ref(c) {
                        return _this2._input = c;
                    },
                    id: this.state.id,
                    type: 'password', className: inputClassName,
                    onChange: function onChange(e) {
                        return _this2.handleOnChange(e);
                    },
                    placeholder: this.props.placeholder,
                    required: this.props.required }),
                _react2.default.createElement('span', { className: 'md-input-bar ' })
            );
        }
    }]);

    return Password;
}(_react2.default.Component);