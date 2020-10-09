"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Date = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _uuid = require("uuid");

var _uuid2 = _interopRequireDefault(_uuid);

var _abstract = require("../abstract/");

var _RenderingComponent = require("../oneorder/RenderingComponent");

var _Grid = require("../layout/Grid");

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DEFAULT_FORMAT = "DD/MM/YYYY";

var Date = exports.Date = function (_TranslatingComponent) {
    _inherits(Date, _TranslatingComponent);

    function Date(props) {
        _classCallCheck(this, Date);

        var _this = _possibleConstructorReturn(this, (Date.__proto__ || Object.getPrototypeOf(Date)).call(this, props));

        _this.state = {
            id: props.id ? props.id : _uuid2.default.v4(),
            internalValue: _this.normalizeValue(props.value)
        };

        _this.i18n = {
            "tr_TR": {
                months: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
                weekdays: ['Paz', 'Pts', 'Sal', 'Çar', 'Per', 'Cum', 'Cts']
            }
        };

        _this.moment = require("moment");
        return _this;
    }

    _createClass(Date, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            var _this2 = this;

            this.initInputmask();

            $(this._input).on('hide.uk.datepicker', function (e) {
                var value = $(_this2._input).val();
                if (!_lodash2.default.isEqual(value, _this2.normalizeValue(_this2.props.value))) {
                    // Gereksiz tetiklemeleri engellemek için...
                    var format = _this2.getFormat();
                    var moment = _this2.moment(value, format, true);
                    if (moment.isValid()) {
                        _this2.handleOnChange(value);
                    } else {
                        _this2.handleOnChange(_this2.normalizeValue(_this2.props.value)); // eski haline getiriyoruz
                    }
                }
            });
        }
    }, {
        key: "componentWillReceiveProps",
        value: function componentWillReceiveProps(nextProps) {
            var newInternalValue = this.normalizeValue(nextProps.value);
            if (!_lodash2.default.isEqual(this.state.internalValue, newInternalValue)) {
                this.setState({ internalValue: newInternalValue });
            }
        }
    }, {
        key: "componentDidUpdate",
        value: function componentDidUpdate() {
            this.initInputmask();
        }
    }, {
        key: "normalizeValue",
        value: function normalizeValue(value) {
            if (_lodash2.default.isNil(value)) {
                return "";
            } else {
                return value;
            }
        }
    }, {
        key: "initInputmask",
        value: function initInputmask() {
            var _this3 = this;

            var format = this.getFormat();
            var formatForInputmask = this.getFormatForInputMask(format);

            // Inputmask konfigürasyonu için https://github.com/RobinHerbots/Inputmask sayfasını gözden geçirmek lazım.
            $(this._input).inputmask({
                alias: formatForInputmask,
                showMaskOnHover: false,
                oncomplete: function oncomplete() {
                    var value = $(_this3._input).val();
                    _this3.handleOnChange(value);
                },
                onincomplete: function onincomplete() {
                    var value = $(_this3._input).val();
                    if (!_lodash2.default.isEqual(value, _this3.normalizeValue(_this3.props.value))) {
                        // Gereksiz tetiklemeleri engellemek için...
                        _this3.handleOnChange(_this3.normalizeValue(_this3.props.value)); // eski haline getiriyoruz
                    }
                },
                oncleared: function oncleared() {
                    if (!_lodash2.default.isEqual("", _this3.normalizeValue(_this3.props.value))) {
                        // Gereksiz tetiklemeleri engellemek için...
                        _this3.handleOnChange(""); // temizliyoruz
                    }
                }
            });
        }

        /**
         * Datepicker'ın kullandığı formatlar için bu sayfayı inceleyiniz: https://getuikit.com/v2/docs/datepicker.html
         */

    }, {
        key: "getFormat",
        value: function getFormat() {
            if (this.props.format) {
                return this.props.format;
            } else {
                return DEFAULT_FORMAT;
            }
        }

        /**
         * Datepicker ve Inputmask farklı formatları kullandığından aşağıdaki gibi bir metoda ihtiyaç duyduk.
         * Inputmask'ın kullandığı formatlar için jquery.inputmask.bundle.js içindeki alias'ları inceleyiniz.
         */

    }, {
        key: "getFormatForInputMask",
        value: function getFormatForInputMask(format) {
            return format.toLowerCase();
        }
    }, {
        key: "getDatepickerSettings",
        value: function getDatepickerSettings() {

            var format = this.getFormat();
            var minDate = false;
            var maxDate = false;

            if (!_lodash2.default.isNil(this.props.minDate)) {
                minDate = this.props.minDate;
            }

            if (!_lodash2.default.isNil(this.props.maxDate)) {
                maxDate = this.props.maxDate;
            }

            // Aşağıda değişiklik yaparken https://getuikit.com/v2/docs/datepicker.html sayfasını gözden geçirmek lazım.
            var settings = {
                format: format,
                i18n: this.i18n[this.context.translator.locale],
                minDate: minDate,
                maxDate: maxDate
            };

            return JSON.stringify(settings);
        }
    }, {
        key: "handleOnChange",
        value: function handleOnChange(value) {
            if (this.props.required && value) {
                $(this._input).parsley().validate();
            }
            if (this.props.onchange) {
                this.props.onchange(value);
            }
        }
    }, {
        key: "handleOnChangeInternal",
        value: function handleOnChangeInternal(e) {
            var value = $(this._input).val();
            this.setState({ internalValue: value });
        }
    }, {
        key: "renderStandard",
        value: function renderStandard() {
            var _this4 = this;

            var value = this.state.internalValue;

            var style = {};
            if (this.props.hidden) {
                style.display = 'none';
            }

            var wrapperClassName = "md-input-wrapper md-input-filled";

            var inputClassName = "md-input label-fixed";

            var label = _get(Date.prototype.__proto__ || Object.getPrototypeOf(Date.prototype), "translate", this).call(this, this.props.label);
            var requiredForLabel = "";
            if (this.props.required && label) {
                requiredForLabel = _react2.default.createElement(
                    "span",
                    { className: "req" },
                    "*"
                );
            }

            var datepickerSettings = this.getDatepickerSettings();

            var component = _react2.default.createElement(
                "div",
                { className: wrapperClassName, style: style },
                _react2.default.createElement(
                    "label",
                    { htmlFor: this.state.id },
                    label,
                    requiredForLabel
                ),
                _react2.default.createElement("input", { ref: function ref(c) {
                        return _this4._input = c;
                    },
                    className: inputClassName, type: "text",
                    id: this.state.id,
                    onChange: function onChange(e) {
                        return _this4.handleOnChangeInternal(e);
                    },
                    required: this.props.required, value: value,
                    "data-uk-datepicker": datepickerSettings }),
                _react2.default.createElement("span", { className: "md-input-bar " })
            );

            if (this.props.hideIcon) {
                component = _react2.default.createElement(
                    "div",
                    { className: "parsley-row" },
                    component
                );
            } else {
                component = _react2.default.createElement(
                    "div",
                    { className: "parsley-row" },
                    _react2.default.createElement(
                        "div",
                        { className: "uk-input-group", style: style },
                        _react2.default.createElement(
                            "span",
                            { className: "uk-input-group-addon" },
                            _react2.default.createElement("i", { className: "uk-input-group-icon uk-icon-calendar" })
                        ),
                        component
                    )
                );
            }

            return component;
        }
    }, {
        key: "renderReadOnly",
        value: function renderReadOnly() {

            var label = _get(Date.prototype.__proto__ || Object.getPrototypeOf(Date.prototype), "translate", this).call(this, this.props.label);

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
                                null,
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

    return Date;
}(_abstract.TranslatingComponent);

Date.contextTypes = {
    translator: _propTypes2.default.object
};