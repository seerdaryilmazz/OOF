'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.FilterWrapper = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var FilterWrapper = exports.FilterWrapper = function (_React$Component) {
    _inherits(FilterWrapper, _React$Component);

    function FilterWrapper(props) {
        _classCallCheck(this, FilterWrapper);

        var _this = _possibleConstructorReturn(this, (FilterWrapper.__proto__ || Object.getPrototypeOf(FilterWrapper)).call(this, props));

        _this.state = {
            internalValue: null
        };
        return _this;
    }

    _createClass(FilterWrapper, [{
        key: 'componentDidMount',
        value: function componentDidMount() {}
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {}
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {}
    }, {
        key: 'updateData',
        value: function updateData(value) {
            var _this2 = this;

            this.setState({ internalValue: value }, function () {
                var targetValue = value;
                if (_this2.props.target && value) {
                    targetValue = value[_this2.props.target];
                }
                if (!targetValue) {
                    targetValue = "";
                }
                _this2.props.onchange && _this2.props.onchange(targetValue);
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var components = _react2.default.Children.map(this.props.children, function (component) {
                return _react2.default.cloneElement(component, {
                    value: _this3.state.internalValue,
                    onchange: function onchange(value) {
                        return _this3.updateData(value);
                    },
                    appendToBody: true
                });
            });

            return _react2.default.createElement(
                'div',
                null,
                components
            );
        }
    }]);

    return FilterWrapper;
}(_react2.default.Component);