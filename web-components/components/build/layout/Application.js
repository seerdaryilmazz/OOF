'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Application = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDeviceDetect = require('react-device-detect');

var _abstract = require('../abstract');

var _basic = require('../basic');

var _AuthorizationService = require('../oneorder/AuthorizationService');

var _UserService = require('../oneorder/UserService');

var _translator = require('../translator');

var _LocalStorage = require('../utils/LocalStorage');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Application = exports.Application = function (_React$Component) {
    _inherits(Application, _React$Component);

    function Application(props) {
        _classCallCheck(this, Application);

        var _this = _possibleConstructorReturn(this, (Application.__proto__ || Object.getPrototypeOf(Application)).call(this, props));

        _this.translator = new _translator.Translator(_this.props.name);
        // TODO : Check technical debt OO-817
        _basic.Notify.translator = _this.translator;
        _this.translator.onChangeLocale = function (locale) {
            return _this.handleChangeLocale(locale);
        };
        _this.translator.onMessagesReceived = function () {
            return _this.handleMessageReceived();
        };
        _this.state = { locale: _this.translator.locale };
        _this.stateTrackerRegistry = new _abstract.StateTrackerRegistry();
        _this.storage = new _LocalStorage.LocalStorage(_this.props.name);
        return _this;
    }

    _createClass(Application, [{
        key: 'getOperations',
        value: function getOperations() {
            var _this2 = this;

            _AuthorizationService.AuthorizationService.operations().then(function (response) {
                var operations = response.data.map(function (item) {
                    return item.name;
                });
                _this2.setState({ operations: operations });
            }).catch(function (error) {
                _basic.Notify.showError(error);
            });
        }
    }, {
        key: 'getMyUser',
        value: function getMyUser() {
            var _this3 = this;

            _UserService.UserService.me().then(function (response) {
                _this3.setState({ user: response.data });
            }).catch(function (error) {
                _basic.Notify.showError(error);
            });
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
            this.getOperations();
        }
    }, {
        key: 'handleChangeLocale',
        value: function handleChangeLocale(locale) {
            var _this4 = this;

            this.setState({ locale: locale }, function () {
                return _this4.setHtmlLang();
            });
        }
    }, {
        key: 'handleMessageReceived',
        value: function handleMessageReceived() {
            this.setState({ messagesReceived: new Date() });
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.translator.loadTranslations();
            this.getMyUser();
            this.setHtmlLang();
        }
    }, {
        key: 'setHtmlLang',
        value: function setHtmlLang() {
            $("html").attr("lang", this.translator.getLanguage().toLowerCase());
        }
    }, {
        key: 'getChildContext',
        value: function getChildContext() {
            return {
                isMobile: _reactDeviceDetect.isMobile,
                appName: this.props.name,
                translator: this.translator,
                storage: this.storage,
                stateTrackerRegistry: this.stateTrackerRegistry,
                user: this.state.user,
                operations: this.state.operations
            };
        }
    }, {
        key: 'render',
        value: function render() {
            if (this.state.user && this.state.messagesReceived) {
                return _react2.default.createElement(
                    'div',
                    null,
                    this.props.children
                );
            } else {
                return null;
            }
        }
    }]);

    return Application;
}(_react2.default.Component);

Application.childContextTypes = {
    isMobile: _propTypes2.default.bool,
    appName: _propTypes2.default.string,
    translator: _propTypes2.default.object,
    storage: _propTypes2.default.object,
    user: _propTypes2.default.object,
    stateTrackerRegistry: _propTypes2.default.object,
    operations: _propTypes2.default.array
};