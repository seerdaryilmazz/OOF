'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Menu = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _axios = require('axios');

var axios = _interopRequireWildcard(_axios);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _abstract = require('../abstract/');

var _basic = require('../basic');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Menu = exports.Menu = function (_TranslatingComponent) {
    _inherits(Menu, _TranslatingComponent);

    function Menu(props) {
        _classCallCheck(this, Menu);

        var _this = _possibleConstructorReturn(this, (Menu.__proto__ || Object.getPrototypeOf(Menu)).call(this, props));

        _this.state = {};

        _this.getMenuItems();
        return _this;
    }

    _createClass(Menu, [{
        key: 'getMenuItems',
        value: function getMenuItems() {
            var _this2 = this;

            axios.get('/user-service/uimenu/usermenu').then(function (response) {
                _this2.setState({ items: response.data });
            }).catch(function (error) {
                _basic.Notify.showError(error);
            });
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.mountMenu();
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps, prevState) {
            if (!_lodash2.default.isEqual(prevState.items, this.state.items)) {
                this.mountMenu();
            }
        }
    }, {
        key: 'mountMenu',
        value: function mountMenu() {
            var $sidebar_main = $('#sidebar_main');
            // check for submenu
            $sidebar_main.find('.menu_section > ul').find('li').each(function () {
                var hasChildren = $(this).children('ul').length;
                if (hasChildren) {
                    $(this).addClass('submenu_trigger');
                }
            });
            // toggle sections
            $('.submenu_trigger > a').on('click', function (e) {
                e.preventDefault();
                var $this = $(this);
                var slideToogle = $this.next('ul').is(':visible') ? 'slideUp' : 'slideDown';
                // accordion mode
                var accordion_mode = $sidebar_main.hasClass('accordion_mode');
                $this.next('ul').velocity(slideToogle, {
                    duration: 400,
                    easing: easing_swiftOut,
                    begin: function begin() {
                        if (slideToogle == 'slideUp') {
                            $(this).closest('.submenu_trigger').removeClass('act_section');
                        } else {
                            if (accordion_mode) {
                                $this.closest('li').siblings('.submenu_trigger').each(function () {
                                    $(this).children('ul').velocity('slideUp', {
                                        duration: 400,
                                        easing: easing_swiftOut,
                                        begin: function begin() {
                                            $(this).closest('.submenu_trigger').removeClass('act_section');
                                        }
                                    });
                                });
                            }
                            $(this).closest('.submenu_trigger').addClass('act_section');
                        }
                    },
                    complete: function complete() {
                        if (slideToogle !== 'slideUp') {
                            var scrollContainer = $sidebar_main.find(".scroll-content").length ? $sidebar_main.find(".scroll-content") : $sidebar_main.find(".scrollbar-inner");
                            $this.closest('.act_section').velocity("scroll", {
                                duration: 500,
                                easing: easing_swiftOut,
                                container: scrollContainer
                            });
                        }
                    }
                });
            });

            // open section/add classes if children has class .act_item
            $sidebar_main.find('.act_item').addClass('current_section').parents('.submenu_trigger').addClass('act_section').children('a').trigger('click');
        }
    }, {
        key: 'render',
        value: function render() {
            if (!this.state.items) {
                return _react2.default.createElement('div', null);
            }
            var menuBody = this.createMenu(this.state.items, 0);
            return _react2.default.createElement(
                'div',
                { className: 'menu_section' },
                menuBody
            );
        }
    }, {
        key: 'createMenu',
        value: function createMenu(data, level) {
            var _this3 = this;

            var body = data.map(function (elem) {
                var elemTitle = elem.name;
                var elemHref = "#";
                if (elem.url) {
                    elemHref = elem.url;
                }
                var selfChild = null;
                var activeClassName = "";
                if (elem.children && elem.children.length > 0) {
                    selfChild = _this3.createMenu(elem.children, level + 1);
                } else {
                    var activeUrlToCheck = elemHref.indexOf("#") > 0 ? elemHref.substring(elemHref.indexOf("#") + 1) : elemHref;
                    if (_this3.context.router.isActive(activeUrlToCheck, true)) {
                        activeClassName = "act_item";
                    }
                }
                var padding = (level + 1) * 12 + "px";
                return _react2.default.createElement(
                    'li',
                    { key: elem.key, title: elemTitle, className: activeClassName },
                    _react2.default.createElement(
                        'a',
                        { href: elemHref, className: 'waves-effect', style: { paddingLeft: padding } },
                        _react2.default.createElement(
                            'span',
                            { className: 'menu_title' },
                            _get(Menu.prototype.__proto__ || Object.getPrototypeOf(Menu.prototype), 'translate', _this3).call(_this3, elemTitle)
                        )
                    ),
                    selfChild
                );
            });
            return _react2.default.createElement(
                'ul',
                null,
                body
            );
        }
    }]);

    return Menu;
}(_abstract.TranslatingComponent);

Menu.contextTypes = {
    router: _react2.default.PropTypes.object,
    translator: _react2.default.PropTypes.object
};