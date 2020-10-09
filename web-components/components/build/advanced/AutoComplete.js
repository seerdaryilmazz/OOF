'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.AutoComplete = undefined;

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AutoComplete = exports.AutoComplete = function (_TranslatingComponent) {
    _inherits(AutoComplete, _TranslatingComponent);

    function AutoComplete(props) {
        _classCallCheck(this, AutoComplete);

        var _this = _possibleConstructorReturn(this, (AutoComplete.__proto__ || Object.getPrototypeOf(AutoComplete)).call(this, props));

        _this.autocompleteCallback = function (release) {
            if (_this.props.promise) {
                _this.props.promise($(_this._input).val()).then(function (response) {
                    _this.options = response.data;
                    release(response.data);
                }).catch(function (error) {
                    console.log(error);
                });
            } else if (_this.props.callback) {
                _this.props.callback(release, $(_this._input).val());
            } else {
                var results = _this.props.source.filter(function (item) {
                    return item[_this.labelField].toUpperCase().startsWith($(_this._input).val().toUpperCase());
                });
                release(results);
            }
        };

        var minLength = _this.props.minLength ? _this.props.minLength : 3;
        var id = _this.props.id ? _this.props.id : _uuid2.default.v4();
        _this.state = { id: id, minLength: minLength, value: "" };

        _this.valueField = _this.props.valueField;
        if (!_this.valueField) {
            _this.valueField = "id";
        }
        _this.labelField = _this.props.labelField;
        if (!_this.labelField) {
            _this.labelField = "name";
        }
        _this.state.readOnly = _this.props.readOnly;

        return _this;
    }

    _createClass(AutoComplete, [{
        key: 'mountAutocomplete',
        value: function mountAutocomplete() {
            var _this2 = this;

            $(this._input).on('focus', function () {
                $(this).closest('.md-input-wrapper').addClass('md-input-focus');
            });

            var resultsTemplate = '<ul class="uk-nav uk-nav-autocomplete uk-autocomplete-results">{{~items}} ' + '<li data-id="{{ $item.' + this.valueField + ' }}" data-value="{{ $item.' + this.labelField + ' }}" data-' + this.labelField + '="{{ $item.' + this.labelField + ' }}" data-' + this.valueField + '="{{ $item.' + this.valueField + ' }}"> <a tabindex="-1" href="javascript:void()">{{ $item.' + this.labelField + ' }}</a> </li>{{/items}} </ul>';

            if (this.props.template) {
                resultsTemplate = this.props.template;
            }

            var autocomplete = UIkit.autocomplete($(this._input).closest(".uk-autocomplete"), {
                source: this.autocompleteCallback,
                minLength: this.state.minLength,
                delay: 300,
                flipDropdown: this.props.flipDropdown,
                template: resultsTemplate
            });
            autocomplete.on('selectitem.uk.autocomplete', function (event, selectedItem, obj) {
                if (selectedItem && _this2.props.onchange) {
                    if (_this2.options) {
                        var selectedOption = _lodash2.default.find(_this2.options, [_this2.valueField, selectedItem.id]);
                        _this2.props.onchange(selectedOption);
                    } else {
                        _this2.props.onchange(selectedItem);
                    }
                }
            });
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.mountAutocomplete();
            this.updateStateFromProps(this.props);
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            this.updateStateFromProps(nextProps);
        }
    }, {
        key: 'updateStateFromProps',
        value: function updateStateFromProps(props) {
            var value = "";
            var valueObj = props.value;
            if (valueObj) {
                value = valueObj[this.labelField];
            }

            var state = _lodash2.default.cloneDeep(this.state);
            state.value = value;
            state.readOnly = props.readOnly;
            this.setState(state);
        }
    }, {
        key: 'handleChange',
        value: function handleChange(value) {
            var state = _lodash2.default.cloneDeep(this.state);
            state.value = value;
            this.setState(state);
            if (!value && this.props.onclear) {
                this.props.onclear();
            }
        }
    }, {
        key: 'getInputValue',
        value: function getInputValue() {
            return this._input.value;
        }
    }, {
        key: 'renderStandard',
        value: function renderStandard() {
            var _this3 = this;

            var hidden = this.props.hidden;
            var style = {};
            if (hidden) {
                style.display = 'none';
            }
            var placeholder = this.props.placeholder;
            if (!placeholder) {
                placeholder = "Min. " + this.state.minLength + " characters";
            }
            var wrapperClassName = "md-input-wrapper";
            if (this.props.value !== null || placeholder) {
                wrapperClassName += " md-input-filled";
            }
            var inputClassName = "md-input";
            if (this.props.value !== null || placeholder) {
                inputClassName += " label-fixed";
            }
            var label = "";
            if (!this.props.hideLabel) {
                label = _get(AutoComplete.prototype.__proto__ || Object.getPrototypeOf(AutoComplete.prototype), 'translate', this).call(this, this.props.label);
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

            return _react2.default.createElement(
                'div',
                { className: rowClassName },
                addon,
                _react2.default.createElement(
                    'div',
                    { className: 'uk-autocomplete uk-position-relative', 'data-uk-autocomplete': true },
                    _react2.default.createElement(
                        'div',
                        { className: wrapperClassName },
                        _react2.default.createElement(
                            'label',
                            { htmlFor: this.state.id },
                            label,
                            requiredForLabel
                        ),
                        _react2.default.createElement('input', { id: this.state.id, ref: function ref(c) {
                                return _this3._input = c;
                            },
                            type: 'text', className: inputClassName,
                            value: this.state.value,
                            onChange: function onChange(e) {
                                return _this3.handleChange(e.target.value);
                            },
                            placeholder: _get(AutoComplete.prototype.__proto__ || Object.getPrototypeOf(AutoComplete.prototype), 'translate', this).call(this, placeholder), required: this.props.required,
                            disabled: this.props.disabled
                        }),
                        _react2.default.createElement('span', { className: 'md-input-bar ' })
                    )
                )
            );
        }
    }, {
        key: 'renderReadOnly',
        value: function renderReadOnly() {

            var label = "";
            if (!this.props.hideLabel) {
                label = _get(AutoComplete.prototype.__proto__ || Object.getPrototypeOf(AutoComplete.prototype), 'translate', this).call(this, this.props.label);
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
                    this.state.value
                )
            );
        }
    }, {
        key: 'render',
        value: function render() {
            return _RenderingComponent.RenderingComponent.render(this);
        }
    }]);

    return AutoComplete;
}(_abstract.TranslatingComponent);

AutoComplete.contextTypes = {
    translator: _propTypes2.default.object
};