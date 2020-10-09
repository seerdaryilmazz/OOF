'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Notification = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Button = require('../basic/Button');

var _NotificationService = require('../services/NotificationService');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Push = require("push.js");

var Notification = exports.Notification = function (_React$Component) {
    _inherits(Notification, _React$Component);

    function Notification(props) {
        _classCallCheck(this, Notification);

        var _this = _possibleConstructorReturn(this, (Notification.__proto__ || Object.getPrototypeOf(Notification)).call(this, props));

        _this.state = {
            my: {
                unreadCount: 0,
                newNotifications: [],
                lastNotifications: []
            },
            ignore: true,
            title: ''
        };
        _this.checkNotifications();
        _this.handleNotification = setInterval(function () {
            return _this.checkNotifications();
        }, 60000);
        return _this;
    }

    _createClass(Notification, [{
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            clearInterval(this.handleNotification);
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            if (!Push.Permission.has()) {
                Push.Permission.request(function () {
                    console.log("push granted");
                }, function () {
                    console.log("push denied");
                });
            }
        }
    }, {
        key: 'handleRecievedNotification',
        value: function handleRecievedNotification(data) {
            var newNotifications = _.get(data, 'newNotifications');
            if (!_.isEmpty(newNotifications)) {
                newNotifications.forEach(function (newOne) {
                    if (_.find(data.activeConcerns, function (i) {
                        return i.code === newOne.template.concern.code;
                    })) {
                        Push.create(newOne.subject, {
                            tag: newOne.id,
                            body: newOne.content,
                            onClick: function onClick() {
                                _NotificationService.NotificationService.read(newOne.id).then(function (response) {
                                    window.open(newOne.url, "_blank");
                                });
                                this.close();
                            }
                        });
                    }
                });
            }
            this.setState({ my: data });
        }
    }, {
        key: 'checkNotifications',
        value: function checkNotifications() {
            var _this2 = this;

            _NotificationService.NotificationService.my().then(function (response) {
                _this2.handleRecievedNotification(response.data);
            });
        }
    }, {
        key: 'read',
        value: function read(notification, redirect) {
            var _this3 = this;

            _NotificationService.NotificationService.read(notification.id).then(function (response) {
                _this3.handleRecievedNotification(response.data);
                if (redirect) {
                    window.location = notification.url;
                }
            });
        }
    }, {
        key: 'readAll',
        value: function readAll() {
            var _this4 = this;

            _NotificationService.NotificationService.readAll().then(function (response) {
                _this4.handleRecievedNotification(response.data);
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this5 = this;

            return _react2.default.createElement(
                'li',
                { 'data-uk-dropdown': '{mode:\'click\',pos:\'bottom-right\'}' },
                _react2.default.createElement(
                    'a',
                    { href: 'javascript:;', className: 'user_action_icon' },
                    _react2.default.createElement(
                        'i',
                        { className: 'material-icons md-24 md-light' },
                        'notifications'
                    ),
                    _react2.default.createElement(
                        'span',
                        { className: 'uk-badge' },
                        this.state.my.unreadCount
                    )
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'uk-dropdown uk-dropdown-xlarge' },
                    _react2.default.createElement(
                        'div',
                        { className: 'uk-text-right' },
                        _react2.default.createElement(_Button.Button, { icon: '', 'data-uk-tooltip': '{pos:\'bottom\'}', title: 'Preferences', mdIcon: 'settings', flat: true, size: 'small', style: 'primary', onclick: function onclick() {
                                return window.location = "/ui/notification/user-preferences";
                            } }),
                        _react2.default.createElement(_Button.Button, { icon: '', 'data-uk-tooltip': '{pos:\'bottom\'}', title: 'Mark All as Read', mdIcon: 'drafts', iconColorClass: 'md-color-blue-500', flat: true, size: 'small', style: 'primary', onclick: function onclick() {
                                return _this5.readAll();
                            } })
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'md-card-content' },
                        _react2.default.createElement(
                            'ul',
                            { id: 'header_alerts', className: 'uk-switcher uk-margin' },
                            _react2.default.createElement(
                                'li',
                                { 'aria-hidden': 'false', className: 'uk-active', style: { animationDuration: "200ms" } },
                                _react2.default.createElement(
                                    'ul',
                                    { className: 'md-list md-list-addon' },
                                    this.state.my.lastNotifications.map(function (i) {
                                        return _react2.default.createElement(
                                            'li',
                                            { key: i.id, className: i.read ? null : 'active-list-element' },
                                            _react2.default.createElement(
                                                'div',
                                                { className: 'md-list-addon-element' },
                                                _react2.default.createElement(
                                                    'span',
                                                    { className: 'md-user-letters', style: JSON.parse(i.template.addonClass) },
                                                    i.template.addonText
                                                )
                                            ),
                                            _react2.default.createElement(
                                                'div',
                                                { className: 'md-list-content' },
                                                _react2.default.createElement(
                                                    'div',
                                                    { className: 'md-list-action' },
                                                    _react2.default.createElement(_Button.Button, { icon: '', flat: true, size: 'mini', style: 'primary', mdIcon: 'drafts', onclick: function onclick() {
                                                            return _this5.read(i);
                                                        } })
                                                ),
                                                _react2.default.createElement(
                                                    'span',
                                                    { className: 'md-list-heading' },
                                                    _react2.default.createElement(
                                                        'a',
                                                        { href: 'javascript:;', onClick: function onClick() {
                                                                return _this5.read(i, true);
                                                            } },
                                                        i.subject
                                                    )
                                                ),
                                                _react2.default.createElement(
                                                    'span',
                                                    { className: 'uk-text-small', style: { whiteSpace: "pre-wrap" } },
                                                    i.body
                                                ),
                                                _react2.default.createElement(
                                                    'span',
                                                    { className: 'uk-text-small uk-text-muted', style: { whiteSpace: "pre-wrap" } },
                                                    i.content
                                                )
                                            )
                                        );
                                    })
                                )
                            )
                        )
                    ),
                    _react2.default.createElement(_Button.Button, { label: 'view all notifications', fullWidth: true, flat: true, size: 'small', style: 'primary', onclick: function onclick() {
                            return window.location = "/ui/notification/";
                        } })
                )
            );
        }
    }]);

    return Notification;
}(_react2.default.Component);