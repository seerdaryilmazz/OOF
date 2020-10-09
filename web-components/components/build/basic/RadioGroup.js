'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.RadioGroup = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _abstract = require('../abstract/');

var _RadioButton = require('./RadioButton');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var RadioGroup = exports.RadioGroup = function (_TranslatingComponent) {
    _inherits(RadioGroup, _TranslatingComponent);

    function RadioGroup(props) {
        _classCallCheck(this, RadioGroup);

        var _this = _possibleConstructorReturn(this, (RadioGroup.__proto__ || Object.getPrototypeOf(RadioGroup)).call(this, props));

        if (props.id) {
            _this.state = { id: props.id };
        } else {
            _this.state = { id: _uuid2.default.v4() };
        }
        return _this;
    }

    _createClass(RadioGroup, [{
        key: 'componentDidMount',
        value: function componentDidMount() {}
    }, {
        key: 'handleOnChange',
        value: function handleOnChange(option, value) {
            if (value) {
                this.props.onchange && this.props.onchange(option);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var valueField = this.props.valueField;
            if (!valueField) {
                valueField = "id";
            }
            var labelField = this.props.labelField;
            if (!labelField) {
                labelField = "name";
            }
            var options = this.props.options ? _.clone(this.props.options) : [];

            if (this.props.value) {
                options.map(function (option) {
                    var val = "";
                    if (_this2.props.value instanceof Object) {
                        val = _this2.props.value[valueField];
                    } else {
                        val = _this2.props.value;
                    }
                    option.checked = option[valueField] === val;
                });
            } else {
                options.map(function (option) {
                    option.checked = false;
                });
            }
            return _react2.default.createElement(
                'div',
                { className: 'parsley-row' },
                options.map(function (option) {
                    return _react2.default.createElement(_RadioButton.RadioButton, { key: option[valueField], id: option[valueField], label: option[labelField], inline: _this2.props.inline, name: _this2.props.name,
                        required: _this2.props.required, value: option[valueField],
                        checked: option.checked, onchange: function onchange(value) {
                            return _this2.handleOnChange(option, value);
                        } });
                })
            );
        }
    }]);

    return RadioGroup;
}(_abstract.TranslatingComponent);

RadioGroup.childContextTypes = {
    translator: _propTypes2.default.object
};