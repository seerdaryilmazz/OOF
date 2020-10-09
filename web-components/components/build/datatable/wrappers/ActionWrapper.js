'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ActionWrapper = undefined;

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

var ActionWrapper = exports.ActionWrapper = function (_React$Component) {
    _inherits(ActionWrapper, _React$Component);

    function ActionWrapper(props) {
        _classCallCheck(this, ActionWrapper);

        return _possibleConstructorReturn(this, (ActionWrapper.__proto__ || Object.getPrototypeOf(ActionWrapper)).call(this, props));
    }

    _createClass(ActionWrapper, [{
        key: 'componentDidMount',
        value: function componentDidMount() {}
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {}
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps() {}
    }, {
        key: 'handleTrackingAction',
        value: function handleTrackingAction(value) {
            this.props.onaction && this.props.onaction(this.props.data, value);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            if (this.props.shouldRender && !this.props.shouldRender(this.props.data)) {
                return null;
            }
            var children = _react2.default.Children.map(this.props.children, function (child) {
                var props = _this2.props.childProps ? _this2.props.childProps(_this2.props.data) : {};
                props[_this2.props.track] = function (value) {
                    return _this2.handleTrackingAction(value);
                };
                props.disabled = _this2.props.shouldDisable && _this2.props.shouldDisable(_this2.props.data);
                return _react2.default.cloneElement(child, props);
            });
            if (children.length == 1) {
                return children[0];
            } else {
                return _react2.default.createElement(
                    'div',
                    null,
                    children
                );
            }
        }
    }]);

    return ActionWrapper;
}(_react2.default.Component);