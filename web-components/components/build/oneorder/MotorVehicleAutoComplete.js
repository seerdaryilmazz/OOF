'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.MotorVehicleAutoComplete = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _advanced = require('../advanced');

var _basic = require('../basic');

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _axios = require('axios');

var axios = _interopRequireWildcard(_axios);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MotorVehicleAutoComplete = exports.MotorVehicleAutoComplete = function (_React$Component) {
    _inherits(MotorVehicleAutoComplete, _React$Component);

    function MotorVehicleAutoComplete(props) {
        _classCallCheck(this, MotorVehicleAutoComplete);

        var _this = _possibleConstructorReturn(this, (MotorVehicleAutoComplete.__proto__ || Object.getPrototypeOf(MotorVehicleAutoComplete)).call(this, props));

        _this.autocompleteCallback = function (val) {
            return axios.get('/vehicle-service/motor-vehicle/search?plateNumber=' + encodeURIComponent(val));
        };

        var id = _this.props.id ? _this.props.id : _uuid2.default.v4();
        _this.state = { id: id };
        return _this;
    }

    _createClass(MotorVehicleAutoComplete, [{
        key: 'componentDidMount',
        value: function componentDidMount() {}
    }, {
        key: 'handleOnChange',
        value: function handleOnChange(item) {
            this.props.onchange && this.props.onchange(item);
        }
    }, {
        key: 'handleOnClear',
        value: function handleOnClear() {
            this.props.onclear && this.props.onclear();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            return _react2.default.createElement(_advanced.AutoComplete, { id: this.state.id, label: this.props.label, valueField: 'id', labelField: 'plateNumber',
                readOnly: this.props.readOnly,
                onchange: function onchange(item) {
                    return _this2.handleOnChange(item);
                },
                onclear: function onclear() {
                    return _this2.handleOnClear();
                },
                promise: this.autocompleteCallback, value: this.props.value,
                flipDropdown: this.props.flipDropdown,
                hideLabel: this.props.hideLabel,
                required: this.props.required, placeholder: 'Search for plate number...',
                ukIcon: this.props.ukIcon,
                iconColorClass: this.props.iconColorClass,
                minLength: 2
            });
        }
    }]);

    return MotorVehicleAutoComplete;
}(_react2.default.Component);