'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ReadOnlyTextArea = exports.TextArea = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _abstract = require('../abstract/');

var _withReadOnly = require('../abstract/withReadOnly');

var _layout = require('../layout');

var _RenderingComponent = require('../oneorder/RenderingComponent');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TextArea = exports.TextArea = function (_TranslatingComponent) {
    _inherits(TextArea, _TranslatingComponent);

    function TextArea(props) {
        _classCallCheck(this, TextArea);

        var _this = _possibleConstructorReturn(this, (TextArea.__proto__ || Object.getPrototypeOf(TextArea)).call(this, props));

        if (props.id) {
            _this.state = { id: props.id };
        } else {
            _this.state = { id: _uuid2.default.v4() };
        }
        return _this;
    }

    _createClass(TextArea, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            $(this._input).on('focus', function () {
                $(this).closest('.md-input-wrapper').addClass('md-input-focus');
            });
            $(this._input).on('blur', function () {
                $(this).closest('.md-input-wrapper').removeClass('md-input-focus');
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
        key: 'renderStandard',
        value: function renderStandard() {
            var _this2 = this;

            var cols = this.props.cols;
            if (!cols) {
                cols = "30";
            }
            var rows = this.props.rows;
            if (!rows) {
                rows = "4";
            }
            var hidden = this.props.hidden;
            var style = this.props.style || {};
            if (hidden) {
                style.display = 'none';
            }
            var wrapperClassName = "md-input-wrapper";
            if (this.props.value || this.props.placeholder) {
                wrapperClassName += " md-input-filled";
            }
            var inputClassName = "md-input";
            if (this.props.noAutoSize === true) {
                inputClassName += " no_autosize";
            }
            if (this.props.value || this.props.placeholder) {
                inputClassName += " label-fixed";
            }

            var label = "";
            if (!this.props.hideLabel) {
                label = _get(TextArea.prototype.__proto__ || Object.getPrototypeOf(TextArea.prototype), 'translate', this).call(this, this.props.label);
            }
            var requiredForLabel = "";
            if (this.props.required && label) {
                requiredForLabel = _react2.default.createElement(
                    'span',
                    { className: 'req' },
                    '*'
                );
            }
            if (this.props.disabled) {
                wrapperClassName += " md-input-wrapper-disabled";
            }

            var value = "";
            if (this.props.value) {
                value = this.props.value;
            }

            return _react2.default.createElement(
                'div',
                { className: 'uk-form-row parsley-row' },
                _react2.default.createElement(
                    'div',
                    { className: wrapperClassName },
                    _react2.default.createElement(
                        'label',
                        null,
                        label,
                        requiredForLabel
                    ),
                    _react2.default.createElement('textarea', { id: this.state.id,
                        ref: function ref(c) {
                            return _this2._input = c;
                        },
                        cols: cols, rows: rows,
                        maxLength: this.props.maxLength,
                        className: inputClassName,
                        value: value,
                        placeholder: this.props.placeholder,
                        required: this.props.required,
                        disabled: this.props.disabled,
                        onChange: function onChange(e) {
                            return _this2.handleOnChange(e);
                        },
                        style: style
                    }),
                    _react2.default.createElement('span', { className: 'md-input-bar' })
                )
            );
        }
    }, {
        key: 'renderReadOnly',
        value: function renderReadOnly() {
            var label = "";
            if (!this.props.hideLabel) {
                label = _get(TextArea.prototype.__proto__ || Object.getPrototypeOf(TextArea.prototype), 'translate', this).call(this, this.props.label);
            }

            var labelClassName = "";
            if (this.props.noWrapLabel === true) {
                labelClassName = "uk-text-nowrap";
            }

            return _react2.default.createElement(
                _layout.Grid,
                null,
                _react2.default.createElement(
                    _layout.GridCell,
                    { width: '1-1', noMargin: true },
                    _react2.default.createElement(
                        'div',
                        { className: 'uk-form-row' },
                        _react2.default.createElement(
                            'div',
                            { className: 'md-input-wrapper md-input-filled' },
                            _react2.default.createElement(
                                'label',
                                { className: labelClassName },
                                _get(TextArea.prototype.__proto__ || Object.getPrototypeOf(TextArea.prototype), 'translate', this).call(this, label)
                            )
                        )
                    )
                ),
                _react2.default.createElement(
                    _layout.GridCell,
                    { width: '1-1' },
                    _react2.default.createElement(
                        'div',
                        { style: { overflow: "hidden", whiteSpace: "pre-wrap", textAlign: "justify" } },
                        this.props.value
                    )
                )
            );
        }
    }, {
        key: 'render',
        value: function render() {
            return _RenderingComponent.RenderingComponent.render(this);
        }
    }]);

    return TextArea;
}(_abstract.TranslatingComponent);

TextArea.contextTypes = {
    translator: _propTypes2.default.object
};

var ReadOnlyTextArea = exports.ReadOnlyTextArea = (0, _withReadOnly.withReadOnly)(TextArea);