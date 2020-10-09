'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ReadOnlyDropDown = exports.DropDown = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _Grid = require('../layout/Grid');

var _abstract = require('../abstract/');

var _withReadOnly = require('../abstract/withReadOnly');

var _RenderingComponent = require('../oneorder/RenderingComponent');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DropDown = exports.DropDown = function (_TranslatingComponent) {
    _inherits(DropDown, _TranslatingComponent);

    function DropDown(props) {
        _classCallCheck(this, DropDown);

        var _this = _possibleConstructorReturn(this, (DropDown.__proto__ || Object.getPrototypeOf(DropDown)).call(this, props));

        if (props.id) {
            _this.state = { id: props.id };
        } else {
            _this.state = { id: _uuid2.default.v4() };
        }
        var valueField = _this.props.valueField;
        if (!valueField) {
            valueField = "id";
        }
        var labelField = _this.props.labelField;
        if (!labelField) {
            labelField = "name";
        }
        _this.state.labelField = labelField;
        _this.state.valueField = valueField;
        return _this;
    }

    _createClass(DropDown, [{
        key: 'loadSelectize',
        value: function loadSelectize() {
            var _this2 = this;

            if (!this._input) return;

            var thisPosBottom = $(this._input).attr('data-md-selectize-bottom');
            this.selectize = $(this._input).after('<div class="selectize_fix"></div>').selectize({
                plugins: ['tooltip'],
                hideSelected: false,
                dropdownParent: this.props.appendToBody ? 'body' : null,
                onDelete: function onDelete(value) {
                    return setTimeout(function () {
                        return _this2.handleFocusEvent();
                    }, 200);
                },
                onChange: function onChange(value) {
                    return _this2.handleChange(value);
                },
                onFocus: function onFocus() {
                    return _this2.handleFocus();
                },
                onInitialize: function onInitialize() {
                    return _this2.handleInitialize();
                },
                onDropdownOpen: function onDropdownOpen($dropdown) {
                    $dropdown.hide().velocity('slideDown', {
                        begin: function begin() {
                            if (typeof thisPosBottom !== 'undefined') {
                                $dropdown.css({ 'margin-top': '0' });
                            }
                        },
                        duration: 200,
                        easing: easing_swiftOut
                    });
                },
                onDropdownClose: function onDropdownClose($dropdown) {
                    $dropdown.show().velocity('slideUp', {
                        complete: function complete() {
                            if (typeof thisPosBottom !== 'undefined') {
                                $dropdown.css({ 'margin-top': '' });
                            }
                        },
                        duration: 200,
                        easing: easing_swiftOut
                    });
                }
            });
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            if (this.props.options && this.props.options.length > 0) {
                this.loadSelectize();
                document.getElementById(this.state.id) && document.getElementById(this.state.id).addEventListener("focus", this.handleFocusEvent);
            }
        }
    }, {
        key: 'handleInitialize',
        value: function handleInitialize() {
            var inputElement = document.getElementById(this.state.id).nextElementSibling.querySelector("input");
            if (inputElement) {
                inputElement.id = this.state.id + "-text";
            }
        }
    }, {
        key: 'handleFocusEvent',
        value: function handleFocusEvent() {
            if (this.selectize && this.selectize[0].selectize) {
                this.selectize[0].selectize.focus();
            }
        }
    }, {
        key: 'componentWillUpdate',
        value: function componentWillUpdate(nextProps, nextState) {
            this.unloadSelectize();
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps, prevState) {
            if (this.props.options && this.props.options.length > 0) {
                this.loadSelectize();
            }
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var val = nextProps.value;
            if (nextProps.value instanceof Object) {
                val = _lodash2.default.get(nextProps.value, this.state.valueField);
            }
            // Aşağısını "if (!val) ..." şeklinde yaptığımızda bazı durumlar için yanlış çalışıyor. Örnek: val = 0 ise
            if (_lodash2.default.isNil(val)) {
                if (this.selectize && this.selectize[0].selectize) {
                    this.selectize[0].selectize.clear();
                }
            }
        }
    }, {
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(nextProps, nextState) {
            var propsEqual = false;
            if (this.props && nextProps) {
                propsEqual = _lodash2.default.isEqual(this.props.value, nextProps.value) && _lodash2.default.isEqual(this.props.options, nextProps.options) && _lodash2.default.isEqual(this.props.required, nextProps.required) && _lodash2.default.isEqual(this.props.label, nextProps.label) && _lodash2.default.isEqual(this.props.disabled, nextProps.disabled);
            }
            var stateEqual = _lodash2.default.isEqual(this.state, nextState);
            return !(propsEqual && stateEqual);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.unloadSelectize();
            document.getElementById(this.state.id) && document.getElementById(this.state.id).removeEventListener("focus", this.handleFocusEvent);
        }
    }, {
        key: 'unloadSelectize',
        value: function unloadSelectize() {
            if (this.selectize && this.selectize[0].selectize) {
                this.selectize[0].selectize.destroy();
            }
        }
    }, {
        key: 'handleFocus',
        value: function handleFocus() {
            this.props.onfocus && this.props.onfocus();
        }
    }, {
        key: 'fakeOnChange',
        value: function fakeOnChange() {}
    }, {
        key: 'handleChange',
        value: function handleChange(value) {
            var _this3 = this;

            if (this.props.required && value) {
                $(this._input).parsley().validate();
            }
            if (this.props.onchange) {
                if (value) {
                    var result = this.props.options.filter(function (item) {
                        return _lodash2.default.get(item, _this3.state.valueField) == value;
                    });
                    if (result.length === 1) {
                        this.props.onchange(result[0]);
                    } else {
                        console.warn("value doesn't return single object in dropdown labeled: " + this.props.label);
                    }
                } else {
                    this.props.onchange(null);
                    if (this.props.onclear) {
                        this.props.onclear();
                    }
                }
            }
        }
    }, {
        key: 'renderStandard',
        value: function renderStandard() {
            var _this4 = this;

            var label = "";
            if (!this.props.hideLabel) {
                label = _get(DropDown.prototype.__proto__ || Object.getPrototypeOf(DropDown.prototype), 'translate', this).call(this, this.props.label);
            }
            var requiredForLabel = "";
            if (this.props.required && label) {
                requiredForLabel = _react2.default.createElement(
                    'span',
                    { className: 'req' },
                    '*'
                );
            }
            var placeholder = "";
            if (this.props.options == null || typeof this.props.options === 'undefined') {
                placeholder = "Loading...";
                if (this.props.uninitializedText) {
                    placeholder = this.props.uninitializedText;
                }
            } else if (this.props.options.length == 0) {
                placeholder = "No data...";
                if (this.props.emptyText) {
                    placeholder = this.props.emptyText;
                }
            } else {
                placeholder = "";
                if (this.props.placeholder) {
                    placeholder = this.props.placeholder;
                }
            }

            var selectedValue = "";
            if (this.props.value) {
                if (this.props.value instanceof Object && !_lodash2.default.isNil(_lodash2.default.get(this.props.value, this.state.valueField))) {
                    selectedValue = _lodash2.default.get(this.props.value, this.state.valueField);
                } else {
                    selectedValue = this.props.value;
                }
            }

            var disabled = false;

            if (this.props.disabled != null && this.props.disabled) {
                disabled = true;
            }

            var wrapperClassName = "md-input-wrapper md-input-filled";

            if (disabled) {
                wrapperClassName += " md-input-wrapper-disabled";
            }

            if (this.props.options && this.props.options.length > 0) {
                var rowClassName = "uk-form-row parsley-row";
                var addon = "";
                if (this.props.ukIcon) {

                    rowClassName += " uk-input-group";
                    var iconClassName = "uk-input-group-icon uk-icon-" + this.props.ukIcon;
                    if (this.props.iconColorClass) {
                        iconClassName = iconClassName + " " + this.props.iconColorClass;
                    }
                    addon = _react2.default.createElement(
                        'span',
                        { className: 'uk-input-group-addon' },
                        _react2.default.createElement('i', { className: iconClassName })
                    );
                }
                var options = [];
                if (this.props.groupBy) {
                    var grouped = _lodash2.default.groupBy(this.props.options, this.props.groupBy);
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = Object.entries(grouped)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var _step$value = _slicedToArray(_step.value, 2),
                                groupLabel = _step$value[0],
                                groupedOptions = _step$value[1];

                            options.push(_react2.default.createElement(
                                'optgroup',
                                { key: groupLabel, label: groupLabel },
                                groupedOptions.map(function (option) {
                                    return _react2.default.createElement(
                                        'option',
                                        { key: _lodash2.default.get(option, _this4.state.valueField), value: _lodash2.default.get(option, _this4.state.valueField) },
                                        _this4.props.translate ? _get(DropDown.prototype.__proto__ || Object.getPrototypeOf(DropDown.prototype), 'translate', _this4).call(_this4, _lodash2.default.get(option, _this4.state.labelField), null, _this4.props.postTranslationCaseConverter) : _lodash2.default.get(option, _this4.state.labelField)
                                    );
                                })
                            ));
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion && _iterator.return) {
                                _iterator.return();
                            }
                        } finally {
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }
                } else {
                    options = this.props.options.map(function (option) {
                        return _react2.default.createElement(
                            'option',
                            { key: _lodash2.default.get(option, _this4.state.valueField), value: _lodash2.default.get(option, _this4.state.valueField) },
                            _this4.props.translate ? _get(DropDown.prototype.__proto__ || Object.getPrototypeOf(DropDown.prototype), 'translate', _this4).call(_this4, _lodash2.default.get(option, _this4.state.labelField), null, _this4.props.postTranslationCaseConverter) : _lodash2.default.get(option, _this4.state.labelField)
                        );
                    });
                }

                var component = void 0;

                if (disabled) {
                    component = _react2.default.createElement(
                        'select',
                        { id: this.state.id, ref: function ref(c) {
                                return _this4._input = c;
                            }, 'data-md-selectize': true, 'data-md-selectize-bottom': true, value: selectedValue,
                            required: this.props.required, onChange: function onChange(e) {
                                return _this4.fakeOnChange();
                            },
                            'data-parsley-group': this.props.validationGroup, 'data-parsley-required-message': _get(DropDown.prototype.__proto__ || Object.getPrototypeOf(DropDown.prototype), 'translate', this).call(this, "This value is required."), disabled: true },
                        _react2.default.createElement(
                            'option',
                            { value: '' },
                            _get(DropDown.prototype.__proto__ || Object.getPrototypeOf(DropDown.prototype), 'translate', this).call(this, placeholder)
                        ),
                        options
                    );
                } else {
                    component = _react2.default.createElement(
                        'select',
                        { id: this.state.id, ref: function ref(c) {
                                return _this4._input = c;
                            }, 'data-md-selectize': true, 'data-md-selectize-bottom': true, value: selectedValue,
                            required: this.props.required, onChange: function onChange(e) {
                                return _this4.fakeOnChange();
                            },
                            'data-parsley-group': this.props.validationGroup, 'data-parsley-required-message': _get(DropDown.prototype.__proto__ || Object.getPrototypeOf(DropDown.prototype), 'translate', this).call(this, "This value is required.") },
                        _react2.default.createElement(
                            'option',
                            { value: '' },
                            _get(DropDown.prototype.__proto__ || Object.getPrototypeOf(DropDown.prototype), 'translate', this).call(this, placeholder)
                        ),
                        options
                    );
                }

                return _react2.default.createElement(
                    'div',
                    { className: rowClassName },
                    addon,
                    _react2.default.createElement(
                        'div',
                        { className: wrapperClassName },
                        _react2.default.createElement(
                            'label',
                            null,
                            label,
                            requiredForLabel
                        ),
                        component,
                        _react2.default.createElement('span', { className: 'md-input-bar ' })
                    )
                );
            } else {
                return _react2.default.createElement(
                    'div',
                    { className: wrapperClassName },
                    _react2.default.createElement(
                        'label',
                        null,
                        label,
                        requiredForLabel
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'selectize-control single plugin-tooltip' },
                        _react2.default.createElement(
                            'div',
                            { className: 'selectize-input items required not-full' },
                            _react2.default.createElement('input', { type: 'text', autoComplete: 'off', tabIndex: '', placeholder: _get(DropDown.prototype.__proto__ || Object.getPrototypeOf(DropDown.prototype), 'translate', this).call(this, placeholder),
                                style: { opacity: 1, position: "relative", left: "0px" } })
                        )
                    )
                );
            }
        }
    }, {
        key: 'renderReadOnly',
        value: function renderReadOnly() {

            var selectedValue = "";
            if (this.props.value) {
                if (this.props.value instanceof Object && _lodash2.default.get(this.props.value, this.state.labelField)) {
                    selectedValue = _lodash2.default.get(this.props.value, this.state.labelField);
                } else {
                    selectedValue = this.props.value;
                }
            }

            var label = "";
            if (!this.props.hideLabel) {
                label = _get(DropDown.prototype.__proto__ || Object.getPrototypeOf(DropDown.prototype), 'translate', this).call(this, this.props.label);
            }

            return _react2.default.createElement(
                _Grid.Grid,
                null,
                _react2.default.createElement(
                    _Grid.GridCell,
                    { width: '1-1', noMargin: true },
                    _react2.default.createElement(
                        'div',
                        { className: 'uk-form-row' },
                        _react2.default.createElement(
                            'div',
                            { className: 'md-input-wrapper md-input-filled' },
                            _react2.default.createElement(
                                'label',
                                null,
                                label
                            )
                        )
                    )
                ),
                _react2.default.createElement(
                    _Grid.GridCell,
                    { width: '1-1' },
                    _react2.default.createElement(
                        'span',
                        { className: 'uk-text-padding' },
                        selectedValue
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

    return DropDown;
}(_abstract.TranslatingComponent);

DropDown.contextTypes = {
    translator: _propTypes2.default.object
};

var ReadOnlyDropDown = exports.ReadOnlyDropDown = (0, _withReadOnly.withReadOnly)(DropDown);