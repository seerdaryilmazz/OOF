'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.CheckboxGroup = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _Checkbox = require('./Checkbox');

var _Grid = require('../layout/Grid');

var _TranslatingComponent2 = require('../abstract/TranslatingComponent');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CheckboxGroup = exports.CheckboxGroup = function (_TranslatingComponent) {
    _inherits(CheckboxGroup, _TranslatingComponent);

    function CheckboxGroup(props) {
        _classCallCheck(this, CheckboxGroup);

        return _possibleConstructorReturn(this, (CheckboxGroup.__proto__ || Object.getPrototypeOf(CheckboxGroup)).call(this, props));
    }

    _createClass(CheckboxGroup, [{
        key: 'componentDidMount',
        value: function componentDidMount() {}
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var valueField = this.props.valueField;
            if (!valueField) {
                valueField = "value";
            }
            var labelField = this.props.labelField;
            if (!labelField) {
                labelField = "name";
            }
            var label = "";
            if (!this.props.hideLabel) {
                label = _get(CheckboxGroup.prototype.__proto__ || Object.getPrototypeOf(CheckboxGroup.prototype), 'translate', this).call(this, this.props.label);
            }
            var requiredForLabel = "";
            if (this.props.required && label) {
                requiredForLabel = _react2.default.createElement(
                    'span',
                    { className: 'req' },
                    '*'
                );
            }
            var width = "1-6";
            if (this.props.width) {
                width = this.props.width;
            }
            var options = [];
            if (this.props.options) {
                options = this.props.options.map(function (option) {
                    return _react2.default.createElement(
                        _Grid.GridCell,
                        { key: _uuid2.default.v4(), width: width, noMargin: true },
                        _react2.default.createElement(_Checkbox.Checkbox, { label: option[labelField], inline: _this2.props.inline, name: _this2.props.name,
                            checked: option[valueField], required: _this2.props.required,
                            minRequired: _this2.props.minRequired })
                    );
                });
            }
            return _react2.default.createElement(
                'div',
                { className: 'parsley-row' },
                _react2.default.createElement(
                    'div',
                    { className: 'md-input-wrapper md-input-filled' },
                    _react2.default.createElement(
                        'label',
                        { className: 'uk-form-label' },
                        label,
                        requiredForLabel
                    )
                ),
                _react2.default.createElement(
                    _Grid.Grid,
                    null,
                    options
                )
            );
        }
    }]);

    return CheckboxGroup;
}(_TranslatingComponent2.TranslatingComponent);