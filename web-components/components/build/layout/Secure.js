'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Secure = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _layout = require('../layout');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Secure = exports.Secure = function (_React$Component) {
    _inherits(Secure, _React$Component);

    function Secure(props) {
        _classCallCheck(this, Secure);

        var _this = _possibleConstructorReturn(this, (Secure.__proto__ || Object.getPrototypeOf(Secure)).call(this, props));

        var p = {};
        for (var key in props) {
            if (!["operations", "readOnly", "message", "children"].includes(key)) {
                p[key] = props[key];
            }
        }
        _this.state = { prop: p };
        return _this;
    }

    _createClass(Secure, [{
        key: 'isAuthorizedOperation',
        value: function isAuthorizedOperation() {
            if (_.isUndefined(this.props.operations)) {
                return false;
            }
            var operations = _.isArray(this.props.operations) ? this.props.operations : [this.props.operations];
            var permissions = _.intersection(this.context.operations, operations);
            if (permissions === undefined) {
                return null;
            }
            return permissions.length > 0;
        }
    }, {
        key: 'isAuthorizedUser',
        value: function isAuthorizedUser() {
            var _this2 = this;

            var users = this.props.users;

            if (_.isUndefined(users)) {
                return false;
            }
            var key = this.props.usersKey || 'username';
            return 0 <= _.findIndex(users, function (i) {
                return i === _.get(_this2.context.user, key);
            });
        }
    }, {
        key: 'isAuthorized',
        value: function isAuthorized() {
            if (_.isUndefined(this.props.users) && _.isUndefined(this.props.operations)) {
                return true;
            } else if (_.isUndefined(this.props.users) && this.isAuthorizedOperation()) {
                return true;
            } else if (_.isUndefined(this.props.operations) && this.isAuthorizedUser()) {
                return true;
            } else if (this.isAuthorizedUser() || this.isAuthorizedOperation()) {
                return true;
            }
            return false;
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            if (this.isAuthorized()) {
                var children = _react2.default.Children.map(this.props.children, function (child, index) {
                    return _react2.default.cloneElement(child, Object.assign({}, _this3.state.prop, { key: index }));
                });
                return 1 === children.length ? children[0] : _react2.default.createElement(
                    'span',
                    null,
                    children
                );
            } else if (this.props.readOnly) {
                return _react2.default.createElement(
                    'span',
                    null,
                    _react2.default.Children.map(this.props.children, function (child) {
                        return _react2.default.cloneElement(child, { readOnly: _this3.props.readOnly });
                    })
                );
            } else if (this.props.message) {
                return _react2.default.createElement(_layout.Alert, { message: this.props.message, translate: true, type: 'danger' });
            }
            return null;
        }
    }]);

    return Secure;
}(_react2.default.Component);

Secure.contextTypes = {
    user: _propTypes2.default.object,
    operations: _propTypes2.default.array
};