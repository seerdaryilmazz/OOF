"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TextInput = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _uuid = require("uuid");

var _uuid2 = _interopRequireDefault(_uuid);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _Grid = require("../layout/Grid");

var _abstract = require("../abstract/");

var _RenderingComponent = require("../oneorder/RenderingComponent");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TextInput = exports.TextInput = function (_TranslatingComponent) {
    _inherits(TextInput, _TranslatingComponent);

    function TextInput(props) {
        _classCallCheck(this, TextInput);

        var _this = _possibleConstructorReturn(this, (TextInput.__proto__ || Object.getPrototypeOf(TextInput)).call(this, props));

        if (props.id) {
            _this.state = { id: props.id };
        } else {
            _this.state = { id: _uuid2.default.v4() };
        }
        return _this;
    }

    _createClass(TextInput, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            var _this2 = this;

            $(this._input).on('focus', function () {
                $(this).closest('.md-input-wrapper').addClass('md-input-focus');
            });
            $(this._input).on('blur', function (e) {
                $(e.target).closest('.md-input-wrapper').removeClass('md-input-focus');
                _this2.handleOnBlur(e);
            });

            if (this.props.mask) {
                $(this._input).inputmask();
                $(this._input).on('change', function (e) {
                    _this2.handleOnChange(e);
                });
                $(this._input).on('input', function (e) {
                    _this2.handleOnInput(e);
                });
            }
        }
    }, {
        key: "componentDidUpdate",
        value: function componentDidUpdate() {
            if (this.context.validation) {
                this.context.validation.cleanPreviousCustomValidationErrors(this._input);
                if (this.props.errors) {
                    this.context.validation.addCustomValidationErrors(this._input, this.props.errors);
                }
            }
        }
    }, {
        key: "componentWillReceiveProps",
        value: function componentWillReceiveProps(nextProps) {
            if (nextProps.errors) {
                this.context.validation.addCustomValidationErrors(this._input, nextProps.errors);
            }
        }
    }, {
        key: "handleOnChange",
        value: function handleOnChange(event) {
            if (this.props.onchange) {
                var value = event.target.value;
                if (this.props.uppercase) {
                    var locale = this.props.uppercase.locale || "en";
                    value = value.toLocaleUpperCase(locale);
                }
                this.props.onchange(value);
            }
        }
    }, {
        key: "handleOnInput",
        value: function handleOnInput(event) {
            if (this.props.oninput) {
                var value = event.target.value;
                if (this.props.uppercase) {
                    var locale = this.props.uppercase.locale || "en";
                    value = value.toLocaleUpperCase(locale);
                }
                this.props.oninput(value);
            }
        }
    }, {
        key: "handleOnBlur",
        value: function handleOnBlur(event) {
            if (this.props.onblur) {
                this.props.onblur(event.target.value);
            }
        }
    }, {
        key: "createInlineButton",
        value: function createInlineButton(key, style, label, icon, onClickFunction) {

            var inlineButton = void 0;
            var buttonStyle = "primary";

            if (style) {
                buttonStyle = style;
            }

            var styleClassName = "md-btn-flat-" + buttonStyle;
            var iconComponent = null;

            if (icon) {
                iconComponent = _react2.default.createElement("i", { className: "uk-icon-medsmall uk-icon-" + icon });
            }

            var space = null;

            if (icon && label) {
                space = _react2.default.createElement(
                    "span",
                    null,
                    "\xA0"
                );
            }

            inlineButton = _react2.default.createElement(
                "a",
                { key: key,
                    href: "",
                    onClick: function onClick(e) {
                        e.preventDefault();onClickFunction();
                    },
                    className: "md-btn md-btn-flat md-btn-mini " + styleClassName },
                iconComponent,
                space,
                label
            );

            return inlineButton;
        }
    }, {
        key: "wrapInlineButtons",
        value: function wrapInlineButtons(inlineButtons) {
            return _react2.default.createElement(
                "span",
                { className: "uk-form-password-toggle" },
                inlineButtons
            );
        }
    }, {
        key: "renderStandard",
        value: function renderStandard() {
            var _this3 = this;

            var hidden = this.props.hidden;
            var style = this.props.style || {};
            if (hidden) {
                style.display = 'none';
            }

            var value = "";
            if (this.props.value || _lodash2.default.isNumber(this.props.value)) {
                value = this.props.value;
            }

            var wrapperClassName = "md-input-wrapper";
            if (value !== "" || this.props.placeholder || this.props.labelAlwaysRaised === true) {
                wrapperClassName += " md-input-filled";
            }
            var inputClassName = "md-input";
            if (value !== "" || this.props.placeholder) {
                inputClassName += " label-fixed";
            }
            if (this.props.danger) {
                inputClassName += " md-input-danger";
                wrapperClassName += " md-input-wrapper-danger";
            }
            var inputMaskSettings = "";
            if (this.props.mask) {
                inputClassName += " masked_input";
                inputMaskSettings = this.props.mask;
            }
            var inputBarClassName = "md-input-bar";
            if (this.props.size) {
                inputClassName += " uk-form-width-" + this.props.size;
                inputBarClassName += " uk-form-width-" + this.props.size;
            }
            var label = "";
            if (!this.props.hideLabel) {
                label = _get(TextInput.prototype.__proto__ || Object.getPrototypeOf(TextInput.prototype), "translate", this).call(this, this.props.label);
            }
            var requiredForLabel = "";
            if (this.props.required && label) {
                requiredForLabel = _react2.default.createElement(
                    "span",
                    { className: "req" },
                    "*"
                );
            }
            if (this.props.disabled) {
                wrapperClassName += " md-input-wrapper-disabled";
            }
            var rowClassName = "uk-form-row parsley-row";
            var addon = "";
            if (this.props.ukIcon) {
                rowClassName += " uk-input-group";
                addon = _react2.default.createElement(
                    "span",
                    { className: "uk-input-group-addon" },
                    _react2.default.createElement("i", { className: "uk-input-group-icon uk-icon-" + this.props.ukIcon })
                );
            } else if (this.props.mdIcon) {
                rowClassName += " uk-input-group";
                addon = _react2.default.createElement(
                    "span",
                    { className: "uk-input-group-addon" },
                    _react2.default.createElement(
                        "i",
                        { className: "material-icons md-24" },
                        this.props.mdIcon
                    )
                );
            } else if (this.props.mdiIcon) {
                rowClassName += " uk-input-group";
                addon = _react2.default.createElement(
                    "span",
                    { className: "uk-input-group-addon" },
                    _react2.default.createElement("i", { className: "mdi mdi-24px mdi-" + this.props.mdiIcon })
                );
            }

            var inlineButton = null;
            if (this.props.button) {
                var actualButton = this.createInlineButton(_uuid2.default.v4(), this.props.button.style, this.props.button.label, this.props.button.icon, this.props.button.onclick);
                inlineButton = this.wrapInlineButtons([actualButton]);
            }

            var inlineButtons = null;
            if (this.props.buttons) {
                var actualButtons = [];
                this.props.buttons.forEach(function (button) {
                    actualButtons.push(_this3.createInlineButton(_uuid2.default.v4(), button.style, button.label, button.icon, button.onclick));
                });
                inlineButtons = this.wrapInlineButtons(actualButtons);
            }

            var unit = null;
            if (this.props.unit) {
                unit = _react2.default.createElement(
                    "span",
                    { className: "uk-badge uk-badge-outline textinput-unit" },
                    this.props.unit
                );
            }

            var inputType = "text";
            if (this.props.password) {
                inputType = "password";
            }

            var helperComponent = "";
            if (this.props.helperText) {
                helperComponent = _react2.default.createElement(
                    "span",
                    { className: "uk-form-help-block" },
                    this.props.helperText
                );
            }

            if (this.props.unit) {
                style.paddingRight = this.props.unit.length * 8 + 8 + 2 + "px";
            }

            var autocomplete = undefined;
            if (this.props.disableAutocomplete) {
                autocomplete = "no";
            }

            var labelClassName = "";
            if (this.props.noWrapLabel === true) {
                labelClassName = "uk-text-nowrap";
            }

            return _react2.default.createElement(
                "div",
                { className: rowClassName },
                addon,
                _react2.default.createElement(
                    "div",
                    { className: wrapperClassName },
                    _react2.default.createElement(
                        "label",
                        { className: labelClassName },
                        label,
                        requiredForLabel
                    ),
                    _react2.default.createElement("input", { ref: function ref(c) {
                            return _this3._input = c;
                        },
                        id: this.state.id,
                        type: inputType,
                        className: inputClassName,
                        style: style,
                        value: value,
                        onChange: function onChange(e) {
                            return _this3.handleOnChange(e);
                        },
                        onInput: function onInput(e) {
                            return _this3.handleOnInput(e);
                        },
                        placeholder: _get(TextInput.prototype.__proto__ || Object.getPrototypeOf(TextInput.prototype), "translate", this).call(this, this.props.placeholder),
                        required: this.props.required,
                        disabled: this.props.disabled,
                        maxLength: this.props.maxLength,
                        "data-inputmask": inputMaskSettings,
                        "data-inputmask-showmaskonhover": false,
                        "data-parsley-group": this.props.validationGroup,
                        "data-parsley-required-message": _get(TextInput.prototype.__proto__ || Object.getPrototypeOf(TextInput.prototype), "translate", this).call(this, "This value is required."),
                        autoComplete: autocomplete
                    }),
                    inlineButton,
                    inlineButtons,
                    unit,
                    _react2.default.createElement("span", { className: inputBarClassName })
                ),
                helperComponent
            );
        }
    }, {
        key: "renderReadOnly",
        value: function renderReadOnly() {
            var selectedValue = "";

            var label = "";
            if (!this.props.hideLabel) {
                label = _get(TextInput.prototype.__proto__ || Object.getPrototypeOf(TextInput.prototype), "translate", this).call(this, this.props.label);
            }

            var labelClassName = "";
            if (this.props.noWrapLabel === true) {
                labelClassName = "uk-text-nowrap";
            }

            return _react2.default.createElement(
                _Grid.Grid,
                null,
                _react2.default.createElement(
                    _Grid.GridCell,
                    { width: "1-1", noMargin: true },
                    _react2.default.createElement(
                        "div",
                        { className: "uk-form-row" },
                        _react2.default.createElement(
                            "div",
                            { className: "md-input-wrapper md-input-filled" },
                            _react2.default.createElement(
                                "label",
                                { className: labelClassName },
                                label
                            )
                        )
                    )
                ),
                _react2.default.createElement(
                    _Grid.GridCell,
                    { width: "1-1" },
                    _react2.default.createElement(
                        "span",
                        { className: "uk-text-padding" },
                        this.props.value
                    )
                )
            );
        }
    }, {
        key: "render",
        value: function render() {
            return _RenderingComponent.RenderingComponent.render(this);
        }
    }]);

    return TextInput;
}(_abstract.TranslatingComponent);

TextInput.contextTypes = {
    translator: _propTypes2.default.object,
    validation: _propTypes2.default.object
};