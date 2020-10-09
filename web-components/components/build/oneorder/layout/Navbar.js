'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Navbar = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _utils = require('../../utils');

var _Notification = require('../Notification');

var _UserImage = require('./UserImage');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Navbar = exports.Navbar = function (_React$Component) {
    _inherits(Navbar, _React$Component);

    function Navbar(props) {
        _classCallCheck(this, Navbar);

        var _this = _possibleConstructorReturn(this, (Navbar.__proto__ || Object.getPrototypeOf(Navbar)).call(this, props));

        _this.state = {
            eventCount: 0,
            latestEvent: "",
            messages: [],
            warnings: [],
            alerts: []
        };
        _this.csrfToken = _utils.CookieUtils.getCookie("XSRF-TOKEN");
        return _this;
    }

    _createClass(Navbar, [{
        key: 'loadLocales',
        value: function loadLocales() {
            var _this2 = this;

            $.ajax({
                url: '/translator-service/locale/by-status?status=ACTIVE',
                dataType: 'json',
                success: function success(data) {
                    _this2.setState({
                        locales: data
                    });
                },
                error: function error(xhr, status, err) {
                    console.error("locale hata", status, err.toString());
                }
            });
        }
    }, {
        key: 'loadEvents',
        value: function loadEvents() {
            var _this3 = this;

            $.ajax({
                url: '/task-service/event/myevents',
                dataType: 'json',
                success: function success(data) {
                    _this3.setState({
                        eventCount: data.length,
                        messages: data.filter(function (event) {
                            return event.eventSpec.eventSeverity === "INFO";
                        }),
                        warnings: data.filter(function (event) {
                            return event.eventSpec.eventSeverity === "WARNING";
                        }),
                        alerts: data.filter(function (event) {
                            return event.eventSpec.eventSeverity === "ALARM";
                        }),
                        latestEvent: data[data.length - 1]
                    });
                },
                error: function error(xhr, status, err) {
                    console.error("hata", status, err.toString());
                }
            });
        }
    }, {
        key: 'loadEventsAfter',
        value: function loadEventsAfter() {
            var _this4 = this;

            $.ajax({
                url: '/task-service/event/eventsfrom/' + this.state.latestEvent.id,
                dataType: 'json',
                success: function success(data) {
                    if (data.length > 0) {
                        var params = { timeout: 0 };
                        if (data[0].eventSpec.eventSeverity === "WARNING") {
                            params.status = 'warning';
                        }
                        UIkit.notify("<i class='uk-icon-check'></i> " + data[0].eventSpec.eventType, params);
                        _this4.setState({
                            eventCount: _this4.state.eventCount + data.length,
                            messages: _this4.state.messages.concat(data.filter(function (event) {
                                return event.eventSpec.eventSeverity === "INFO";
                            })),
                            warnings: _this4.state.warnings.concat(data.filter(function (event) {
                                return event.eventSpec.eventSeverity === "WARNING";
                            })),
                            alerts: _this4.state.alerts.concat(data.filter(function (event) {
                                return event.eventSpec.eventSeverity === "ALARM";
                            })),
                            latestEvent: data[0]
                        });
                    }
                },
                error: function error(xhr, status, err) {
                    console.error("hata", status, err.toString());
                }
            });
        }
    }, {
        key: 'refreshEvents',
        value: function refreshEvents() {
            if (this.state.latestEvent) {
                this.loadEventsAfter();
            } else {
                this.loadEvents();
            }
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.loadLocales();
            // this.loadEvents();
            // this.loadEventsHandle = setInterval(this.refreshEvents.bind(this), 60000);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            // clearInterval(this.loadEventsHandle);
        }
    }, {
        key: 'handleSettingsClick',
        value: function handleSettingsClick(e) {
            e.preventDefault();
            this.context.router.push('/settings');
        }
    }, {
        key: 'handleChangeLanguage',
        value: function handleChangeLanguage(value) {
            this.context.translator.setLocale(value);
        }
    }, {
        key: 'handleLogoutClick',
        value: function handleLogoutClick(e) {
            e.preventDefault();
            $("#logout").submit();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this5 = this;

            return _react2.default.createElement(
                'ul',
                { className: 'uk-navbar-nav user_actions' },
                _react2.default.createElement(
                    'li',
                    null,
                    _react2.default.createElement(
                        'a',
                        { href: '#', id: 'main_search_btn', className: 'user_action_icon' },
                        _react2.default.createElement(
                            'i',
                            { className: 'material-icons md-24 md-light' },
                            '\uE8B6'
                        )
                    )
                ),
                _react2.default.createElement(
                    'li',
                    null,
                    _react2.default.createElement(
                        'a',
                        { href: '/', id: 'main_home_btn', className: 'user_action_icon' },
                        _react2.default.createElement(
                            'i',
                            { className: 'material-icons md-24 md-light' },
                            'home'
                        )
                    )
                ),
                _react2.default.createElement(
                    'li',
                    null,
                    _react2.default.createElement(
                        'a',
                        { href: '/ui/kpi/', id: 'my_kpi_btn', className: 'user_action_icon' },
                        _react2.default.createElement('i', { className: 'uk-icon-line-chart uk-icon-medsmall2', style: { color: "white" } })
                    )
                ),
                _react2.default.createElement(
                    'li',
                    null,
                    _react2.default.createElement(
                        'a',
                        { href: '#', id: 'full_screen_toggle', className: 'user_action_icon uk-visible-large' },
                        _react2.default.createElement(
                            'i',
                            { className: 'material-icons md-24 md-light' },
                            '\uE5D0'
                        )
                    )
                ),
                _react2.default.createElement(_Notification.Notification, null),
                _react2.default.createElement(
                    'li',
                    { 'data-uk-dropdown': '{mode:\'click\',pos:\'bottom-right\'}' },
                    _react2.default.createElement(
                        'a',
                        { href: '#', className: 'user_action_image', style: { padding: "2px 0" } },
                        _react2.default.createElement(_UserImage.UserImage, null)
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'uk-dropdown uk-dropdown-small' },
                        _react2.default.createElement(
                            'form',
                            { id: 'logout', action: '/logout', method: 'POST', encType: 'multipart/form-data' },
                            _react2.default.createElement('input', { type: 'hidden', name: '_csrf', value: this.csrfToken })
                        ),
                        _react2.default.createElement(
                            'ul',
                            { className: 'uk-nav js-uk-prevent' },
                            _react2.default.createElement(
                                'li',
                                null,
                                _react2.default.createElement(
                                    'a',
                                    { href: '/profile' },
                                    'My profile'
                                )
                            ),
                            _react2.default.createElement(
                                'li',
                                null,
                                _react2.default.createElement(
                                    'a',
                                    { href: '#', onClick: function onClick(e) {
                                            return _this5.handleSettingsClick(e);
                                        } },
                                    'Settings'
                                )
                            ),
                            _react2.default.createElement(
                                'li',
                                null,
                                _react2.default.createElement(
                                    'a',
                                    { href: '#', onClick: function onClick(e) {
                                            return _this5.handleLogoutClick(e);
                                        } },
                                    'Logout'
                                )
                            )
                        )
                    )
                ),
                _react2.default.createElement(
                    'li',
                    { 'data-uk-dropdown': '{mode:\'click\',pos:\'bottom-right\'}' },
                    _react2.default.createElement(
                        'a',
                        { href: '#', className: 'user_action_image' },
                        _react2.default.createElement(
                            'i',
                            { className: 'material-icons md-24 md-light' },
                            'language'
                        ),
                        ' ',
                        this.context.translator.getLanguage()
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'uk-dropdown uk-dropdown-small uk-dropdown-scrollable' },
                        _react2.default.createElement(
                            'ul',
                            { className: 'uk-nav js-uk-prevent' },
                            this.state.locales && this.state.locales.map(function (locale) {
                                return _react2.default.createElement(
                                    'li',
                                    { key: locale.id },
                                    _react2.default.createElement(
                                        'a',
                                        { href: 'javascript:;', onClick: function onClick(e) {
                                                e.preventDefault();_this5.handleChangeLanguage(locale.isoCode);
                                            } },
                                        locale.originalName
                                    )
                                );
                            })
                        )
                    )
                )
            );
        }
    }]);

    return Navbar;
}(_react2.default.Component);

Navbar.contextTypes = {
    translator: _propTypes2.default.object,
    router: _propTypes2.default.object.isRequired
};