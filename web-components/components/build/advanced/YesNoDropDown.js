'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.YesNoDropDown = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _basic = require('../basic');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var YesNoDropDown = exports.YesNoDropDown = function (_React$Component) {
    _inherits(YesNoDropDown, _React$Component);

    function YesNoDropDown(props) {
        _classCallCheck(this, YesNoDropDown);

        var _this = _possibleConstructorReturn(this, (YesNoDropDown.__proto__ || Object.getPrototypeOf(YesNoDropDown)).call(this, props));

        var positiveLabel = "Yes";
        var negativeLabel = "No";
        _this.options = [{
            id: 1,
            name: props.positiveLabel ? props.positiveLabel : positiveLabel
        }, {
            id: 2,
            name: props.negativeLabel ? props.negativeLabel : negativeLabel
        }];
        return _this;
    }

    _createClass(YesNoDropDown, [{
        key: 'handleOnChange',
        value: function handleOnChange(val) {
            if (this.props.onchange) {
                var valueToBeSent = null;
                if (val != null) {
                    if (val.id == 1) {
                        valueToBeSent = true;
                    } else {
                        valueToBeSent = false;
                    }
                }
                this.props.onchange(valueToBeSent);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var value = null;

            if (this.props.value === true) {
                value = this.options[0];
            } else if (this.props.value === false) {
                value = this.options[1];
            }

            return _react2.default.createElement(_basic.DropDown, { label: this.props.label,
                options: this.options,
                value: value,
                onchange: function onchange(val) {
                    return _this2.handleOnChange(val);
                },
                required: this.props.required });
        }
    }]);

    return YesNoDropDown;
}(_react2.default.Component);