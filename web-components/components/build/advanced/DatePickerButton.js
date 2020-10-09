'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DatePickerButton = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Date2 = require('./Date');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DatePickerButton = exports.DatePickerButton = function (_Date) {
    _inherits(DatePickerButton, _Date);

    function DatePickerButton() {
        _classCallCheck(this, DatePickerButton);

        return _possibleConstructorReturn(this, (DatePickerButton.__proto__ || Object.getPrototypeOf(DatePickerButton)).apply(this, arguments));
    }

    _createClass(DatePickerButton, [{
        key: 'getDatepickerSettings',
        value: function getDatepickerSettings() {
            var settings = {
                format: this.getFormat(),
                i18n: this.i18n[this.context.translator.locale],
                addClass: 'dropdown-modal'
            };
            return JSON.stringify(settings);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            return _react2.default.createElement(
                'a',
                { href: 'javascript:;', ref: function ref(c) {
                        return _this2.calendar = c;
                    }, id: this.state.id, className: 'uk-position-relative md-btn-icon md-btn-flat md-btn-' + this.props.size, style: { overflow: "hidden" } },
                _react2.default.createElement('i', { className: 'uk-input-group-icon uk-icon-calendar md-color-' + this.props.color }),
                _react2.default.createElement('input', { ref: function ref(c) {
                        return _this2._input = c;
                    },
                    className: 'unselectable uk-position-absolute',
                    style: { color: "transparent", border: "none", background: "none", width: "100%", height: "100%", right: "-2px", bottom: "-2px", cursor: "pointer" },
                    type: 'text', readOnly: true,
                    onChange: function onChange(e) {
                        return _this2.handleOnChangeInternal(e);
                    },
                    'data-uk-datepicker': this.getDatepickerSettings() })
            );
        }
    }]);

    return DatePickerButton;
}(_Date2.Date);

DatePickerButton.contextTypes = {
    translator: _react2.default.PropTypes.object
};