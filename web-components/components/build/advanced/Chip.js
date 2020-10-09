'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ReadOnlyChip = exports.Chip = undefined;

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

var _RenderingComponent = require('../oneorder/RenderingComponent');

var _withReadOnly = require('../abstract/withReadOnly');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Chip = exports.Chip = function (_TranslatingComponent) {
    _inherits(Chip, _TranslatingComponent);

    function Chip(props) {
        _classCallCheck(this, Chip);

        var _this = _possibleConstructorReturn(this, (Chip.__proto__ || Object.getPrototypeOf(Chip)).call(this, props));

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
        _this.state.readOnly = _this.props.readOnly;
        _this.selectAllKey = "__SELECT_ALL__";
        _this.minOptionCountToDisplaySelectAll = 3;
        return _this;
    }

    _createClass(Chip, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.loadSelectize();
        }
    }, {
        key: 'componentWillUpdate',
        value: function componentWillUpdate(nextProps, nextState) {
            var _this2 = this;

            var options = this.props.options ? this.props.options.map(function (item) {
                return _lodash2.default.get(item, _this2.state.valueField, item);
            }) : [];
            var nextOptions = nextProps.options ? nextProps.options.map(function (item) {
                return _lodash2.default.get(item, _this2.state.valueField, item);
            }) : [];

            if (!_lodash2.default.isEqual(options, nextOptions)) {
                this.unloadSelectize();
            }
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps, prevState) {
            var _this3 = this;

            var prevOptions = prevProps.options ? prevProps.options.map(function (item) {
                return _lodash2.default.get(item, _this3.state.valueField, item);
            }) : [];
            var options = this.props.options ? this.props.options.map(function (item) {
                return _lodash2.default.get(item, _this3.state.valueField, item);
            }) : [];

            if (!_lodash2.default.isEqual(prevOptions, options) && options.length > 0) {
                this.loadSelectize();
            }

            if (options.length > 0) {

                var prevSelectedOptions = prevProps.value ? prevProps.value.map(function (item) {
                    return _lodash2.default.get(item, _this3.state.valueField, item);
                }) : [];
                var selectedOptions = this.props.value ? this.props.value.map(function (item) {
                    return _lodash2.default.get(item, _this3.state.valueField, item);
                }) : [];

                if (!_lodash2.default.isEqual(prevSelectedOptions, selectedOptions)) {
                    this.selectize[0].selectize.clear(true);
                    this.selectize[0].selectize.clearCache();
                    selectedOptions.forEach(function (selectedOption) {
                        _this3.selectize[0].selectize.addItem(selectedOption, true);
                    });
                }
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.unloadSelectize();
        }
    }, {
        key: 'loadSelectize',
        value: function loadSelectize() {
            var _this4 = this;

            this.selectize = $('#' + this.state.id).selectize({
                plugins: {
                    'remove_button': {
                        label: ''
                    }
                },

                maxItems: null,
                valueField: 'id',
                labelField: 'title',
                searchField: 'title',
                create: this.props.create ? this.props.create : false,
                render: {
                    option: function option(data, escape) {
                        var optionStyle = data.id === _this4.selectAllKey ? "font-weight: bold;" : "";
                        return '<div style="' + optionStyle + '">' + '<span>' + escape(data.title) + '</span>' + '</div>';
                    }

                },
                onChange: function onChange(value) {
                    return _this4.handleChange(value);
                },
                onInitialize: function onInitialize() {
                    return _this4.handleInitialize();
                },
                onDropdownOpen: function onDropdownOpen($dropdown) {
                    $dropdown.hide().velocity('slideDown', {
                        begin: function begin() {
                            $dropdown.css({ 'margin-top': '0' });
                        },
                        duration: 200,
                        easing: easing_swiftOut
                    });
                },
                onDropdownClose: function onDropdownClose($dropdown) {
                    $dropdown.show().velocity('slideUp', {
                        complete: function complete() {
                            $dropdown.css({ 'margin-top': '' });
                        },
                        duration: 200,
                        easing: easing_swiftOut
                    });
                }
            });
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
        key: 'unloadSelectize',
        value: function unloadSelectize() {
            if (this.selectize && this.selectize[0] && this.selectize[0].selectize) {
                this.selectize[0].selectize.destroy();
            }
        }
    }, {
        key: 'fakeOnChange',
        value: function fakeOnChange() {}
    }, {
        key: 'selectAll',
        value: function selectAll() {
            var allValues = _lodash2.default.pull(_lodash2.default.keys(this.selectize[0].selectize.options), this.selectAllKey);
            this.selectize[0].selectize.setValue(allValues);
        }
    }, {
        key: 'handleChange',
        value: function handleChange(value) {
            var _this5 = this;

            if (value && _lodash2.default.isArray(value) && _lodash2.default.indexOf(value, this.selectAllKey) >= 0) {
                this.selectAll();
                return;
            }

            var options = this.props.options;
            if (this.props.required && value) {
                $(this._input).parsley().validate();
            }
            if (this.props.onchange) {
                if (value) {
                    var result = [];
                    value.forEach(function (item) {
                        var selectedOption = _lodash2.default.find(options, function (option) {
                            return _lodash2.default.get(option, _this5.state.valueField, option) == item;
                        });
                        if (selectedOption) {
                            result.push(selectedOption);
                        } else if (_this5.props.create) {
                            result.push(item);
                        }
                    });
                    this.props.onchange(result);
                } else {
                    this.props.onchange([]);
                }
            }
        }
    }, {
        key: 'appendToSelectedValue',
        value: function appendToSelectedValue(item, selectedValue) {
            if (item instanceof Object && _lodash2.default.get(item, this.state.valueField, item)) {
                selectedValue.push(_lodash2.default.get(item, this.state.valueField, item));
            } else {
                selectedValue.push(item);
            }
        }
    }, {
        key: 'renderStandard',
        value: function renderStandard() {
            var _this6 = this;

            var options = this.props.options;

            var label = "";
            if (!this.props.hideLabel) {
                label = _get(Chip.prototype.__proto__ || Object.getPrototypeOf(Chip.prototype), 'translate', this).call(this, this.props.label);
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
            if (options == null || typeof options === 'undefined') {
                placeholder = "Loading...";
                if (this.props.uninitializedText) {
                    placeholder = this.props.uninitializedText;
                }
            } else if (options.length == 0) {
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
            var selectedValue = [];
            if (_lodash2.default.isArray(this.props.value)) {
                this.props.value.forEach(function (item) {
                    _this6.appendToSelectedValue(item, selectedValue);
                });
            } else {
                if (this.props.value != null) {
                    this.appendToSelectedValue(this.props.value, selectedValue);
                }
            }

            var elements = null;

            if (options) {
                elements = options.map(function (option) {
                    return _react2.default.createElement(
                        'option',
                        { key: _lodash2.default.get(option, _this6.state.valueField, option),
                            value: _lodash2.default.get(option, _this6.state.valueField, option) },
                        _this6.props.translate ? _get(Chip.prototype.__proto__ || Object.getPrototypeOf(Chip.prototype), 'translate', _this6).call(_this6, _lodash2.default.get(option, _this6.state.labelField, option), null, _this6.props.postTranslationCaseConverter) : _lodash2.default.get(option, _this6.state.labelField, option)
                    );
                });
            }

            var selectAllOption = null;
            if (options && options.length >= this.minOptionCountToDisplaySelectAll && !this.props.hideSelectAll) {
                selectAllOption = _react2.default.createElement(
                    'option',
                    { value: this.selectAllKey },
                    _get(Chip.prototype.__proto__ || Object.getPrototypeOf(Chip.prototype), 'translate', this).call(this, "Select All")
                );
            }
            if (this.props.options && this.props.options.length > 0) {
                return _react2.default.createElement(
                    'div',
                    { className: 'parsley-row' },
                    _react2.default.createElement(
                        'div',
                        { className: 'md-input-wrapper md-input-filled' },
                        _react2.default.createElement(
                            'label',
                            null,
                            label,
                            requiredForLabel
                        ),
                        _react2.default.createElement(
                            'select',
                            { id: this.state.id, name: this.state.id, ref: function ref(c) {
                                    return _this6._input = c;
                                },
                                required: this.props.required, value: selectedValue,
                                onChange: function onChange(e) {
                                    return _this6.fakeOnChange();
                                }, multiple: true },
                            _react2.default.createElement(
                                'option',
                                { value: '' },
                                _get(Chip.prototype.__proto__ || Object.getPrototypeOf(Chip.prototype), 'translate', this).call(this, placeholder)
                            ),
                            selectAllOption,
                            elements
                        )
                    )
                );
            } else {
                return _react2.default.createElement(
                    'div',
                    { className: 'md-input-wrapper md-input-filled' },
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
                            _react2.default.createElement('input', { type: 'text', autoComplete: 'off', tabIndex: '', placeholder: _get(Chip.prototype.__proto__ || Object.getPrototypeOf(Chip.prototype), 'translate', this).call(this, placeholder),
                                style: { opacity: 1, position: "relative", left: "0px" } })
                        )
                    )
                );
            }
        }
    }, {
        key: 'renderReadOnly',
        value: function renderReadOnly() {
            var _this7 = this;

            var selectedValue = "";
            if (_lodash2.default.isArray(this.props.value)) {
                this.props.value.forEach(function (item) {
                    if (selectedValue.length > 0) selectedValue += ", ";
                    var label = _lodash2.default.get(item, _this7.state.labelField, item);
                    selectedValue += _this7.props.translate ? _get(Chip.prototype.__proto__ || Object.getPrototypeOf(Chip.prototype), 'translate', _this7).call(_this7, label, null, _this7.props.postTranslationCaseConverter) : label;
                });
            } else {
                if (this.props.value != null) {
                    var _label = _lodash2.default.get(this.props.value, this.state.labelField, this.props.value);
                    selectedValue = this.props.translate ? _get(Chip.prototype.__proto__ || Object.getPrototypeOf(Chip.prototype), 'translate', this).call(this, _label, null, this.props.postTranslationCaseConverter) : _label;
                }
            }

            var label = "";
            if (!this.props.hideLabel) {
                label = _get(Chip.prototype.__proto__ || Object.getPrototypeOf(Chip.prototype), 'translate', this).call(this, this.props.label);
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

    return Chip;
}(_abstract.TranslatingComponent);

Chip.contextTypes = {
    translator: _propTypes2.default.object
};

var ReadOnlyChip = exports.ReadOnlyChip = (0, _withReadOnly.withReadOnly)(Chip);