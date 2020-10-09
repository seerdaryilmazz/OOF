'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DateTimeFilter = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _basic = require('../../basic');

var _advanced = require('../../advanced');

var _layout = require('../../layout');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DateTimeFilter = exports.DateTimeFilter = function (_React$Component) {
    _inherits(DateTimeFilter, _React$Component);

    function DateTimeFilter(props) {
        _classCallCheck(this, DateTimeFilter);

        var _this = _possibleConstructorReturn(this, (DateTimeFilter.__proto__ || Object.getPrototypeOf(DateTimeFilter)).call(this, props));

        _this.state = { value: _this.props.value, op: "=" };
        _this.moment = require('moment');
        require('moment-timezone');
        return _this;
    }

    _createClass(DateTimeFilter, [{
        key: 'componentDidMount',
        value: function componentDidMount() {}
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {}
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps() {}
    }, {
        key: 'handleValueChange',
        value: function handleValueChange(value) {
            var state = _lodash2.default.cloneDeep(this.state);
            state.value = value;
            this.setState(state);
            this.props.onchange && this.props.onchange(this.concatenateValue(state));
        }
    }, {
        key: 'handleOpChange',
        value: function handleOpChange(value) {
            var state = _lodash2.default.cloneDeep(this.state);
            state.op = value.id;
            this.setState(state);
            this.props.onchange && this.props.onchange(this.concatenateValue(state));
        }
    }, {
        key: 'concatenateValue',
        value: function concatenateValue(state) {
            if (!state.value) {
                return "";
            } else {
                var value = state.value.trim();
                console.log(value);
                var tz = value.substring(value.lastIndexOf(" ") + 1);
                var dt = value.substring(0, value.lastIndexOf(" "));
                var parsed = this.moment.tz(dt, "DD/MM/YYYY HH:mm", tz).tz("UTC").format("X");
                return state.op + parsed;
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            return _react2.default.createElement(
                _layout.Grid,
                { collapse: true },
                _react2.default.createElement(
                    _layout.GridCell,
                    { width: '1-3', noMargin: true },
                    _react2.default.createElement(_basic.DropDown, { options: [{ id: "=", name: "eq" }, { id: "<", name: "lt" }, { id: ">", name: "gt" }, { id: "<=", name: "lte" }, { id: ">=", name: "gte" }],
                        placeholder: '..',
                        onchange: function onchange(value) {
                            return _this2.handleOpChange(value);
                        },
                        value: this.state.op })
                ),
                _react2.default.createElement(
                    _layout.GridCell,
                    { width: '2-3', noMargin: true },
                    _react2.default.createElement(_advanced.DateTime, { onchange: function onchange(value) {
                            return _this2.handleValueChange(value);
                        }, value: this.state.value, hideIcon: true })
                )
            );
        }
    }]);

    return DateTimeFilter;
}(_react2.default.Component);