'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.AppLayoutMaximized = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _layout = require('../../layout');

var _Navbar = require('./Navbar');

var _SecondarySidebar = require('./SecondarySidebar');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AppLayoutMaximized = exports.AppLayoutMaximized = function (_React$Component) {
    _inherits(AppLayoutMaximized, _React$Component);

    function AppLayoutMaximized() {
        _classCallCheck(this, AppLayoutMaximized);

        var _this = _possibleConstructorReturn(this, (AppLayoutMaximized.__proto__ || Object.getPrototypeOf(AppLayoutMaximized)).call(this));

        _this.state = {};
        $('body').removeClass('sidebar_main_active sidebar_main_open');
        return _this;
    }

    _createClass(AppLayoutMaximized, [{
        key: 'testLocalStorage',
        value: function testLocalStorage() {
            var test = 'test';
            try {
                localStorage.setItem(test, test);
                localStorage.removeItem(test);
                return true;
            } catch (e) {
                return false;
            }
        }
    }, {
        key: 'slimSidebar',
        value: function slimSidebar() {
            this.$sidebarMainToggle.hide();

            this.$body.addClass('sidebar_slim sidebar_slim_inactive').removeClass('sidebar_main_active sidebar_main_open sidebar_main_swipe');

            this.$sidebarMain.mouseenter(function () {
                this.$body.removeClass('sidebar_slim_inactive');
                this.$body.addClass('sidebar_slim_active');
            }).mouseleave(function () {
                this.$body.addClass('sidebar_slim_inactive');
                this.$body.removeClass('sidebar_slim_active');
            });
        }
    }, {
        key: 'miniSidebar',
        value: function miniSidebar() {
            this.$sidebarMainToggle.hide();
            this.$sidebarMain.find('.menu_section > ul').children('li').each(function () {
                var hasChildren = $(this).children('ul').length;
                if (hasChildren) {
                    $(this).addClass('sidebar_submenu');
                    if ($(this).find('.act_item').length) {
                        $(this).addClass('current_section');
                    }
                } else {
                    $(this).attr({
                        'data-uk-tooltip': "{pos:'right'}"
                    });
                }
            });
        }
    }, {
        key: 'customScrollbar',
        value: function customScrollbar($object) {
            if (!$object.children('.scrollbar-inner').length) {
                $object.wrapInner("<div className='scrollbar-inner'></div>");
            }
            if (Modernizr.touch) {
                $object.children('.scrollbar-inner').addClass('touchscroll');
            } else {
                $object.children('.scrollbar-inner').scrollbar({
                    disableBodyScroll: true,
                    scrollx: false,
                    duration: 100
                });
            }
        }
    }, {
        key: 'sidebarMenu',
        value: function sidebarMenu() {
            this.$sidebarMain.find('.menu_section > ul').find('li').each(function () {
                var hasChildren = $(this).children('ul').length;
                if (hasChildren) {
                    $(this).addClass('submenu_trigger');
                }
            });
            // toggle sections
            var self = this;
            $('.submenu_trigger > a').on('click', function (e) {
                e.preventDefault();
                var $this = $(this);
                var slideToogle = $this.next('ul').is(':visible') ? 'slideUp' : 'slideDown';
                // accordion mode
                var accordion_mode = self.$sidebarMain.hasClass('accordion_mode');
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
                            var scrollContainer = self.$sidebarMain.find(".scroll-content").length ? self.$sidebarMain.find(".scroll-content") : self.$sidebarMain.find(".scrollbar-inner");
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
            this.$sidebarMain.find('.act_item').closest('.submenu_trigger').addClass('act_section current_section').children('a').trigger('click');
        }
    }, {
        key: 'hideSidebar',
        value: function hideSidebar() {
            var _this2 = this;

            this.$body.addClass('sidebar_main_hiding').removeClass('sidebar_main_active sidebar_main_open');
            if (this.$window.width() < 1220) {
                this.showContentSidebar();
            }
            setTimeout(function () {
                _this2.$body.removeClass('sidebar_main_hiding');
                _this2.$window.resize();
            }, 290);
        }
    }, {
        key: 'showSidebar',
        value: function showSidebar() {
            this.$body.addClass('sidebar_main_active');
            if (this.$window.width() < 1220) {
                this.hideContentSidebar();
            }
            setTimeout(function () {
                this.$window.resize();
            }, 290);
        }
    }, {
        key: 'hideContentSidebar',
        value: function hideContentSidebar() {
            if (!this.$body.hasClass('header_double_height')) {
                this.$html.css({
                    'paddingRight': scrollbarWidth(),
                    'overflow': 'hidden'
                });
            }
        }
    }, {
        key: 'showContentSidebar',
        value: function showContentSidebar() {
            if (!this.$body.hasClass('header_double_height')) {
                this.$html.css({
                    'paddingRight': '',
                    'overflow': ''
                });
            }
        }
    }, {
        key: 'swipeOpen',
        value: function swipeOpen() {
            var _this3 = this;

            if (this.$body.hasClass('sidebar_main_swipe') && Modernizr.touch) {
                this.$body.append('<div id="sidebar_swipe_area" style="position: fixed;left: 0;top:0;z-index:1000;width:16px;height:100%"></div>');

                var mc = new Hammer.Manager(document.getElementById("sidebar_swipe_area"));
                mc.add(new Hammer.Swipe({
                    threshold: 0,
                    pointers: 2,
                    velocity: 0
                }));
                mc.on("swiperight", function () {
                    if (!_this3.$body.hasClass('sidebar_main_active')) {
                        _this3.showSidebar();
                    }
                });
            }
        }
    }, {
        key: 'init',
        value: function init() {
            this.$sidebarMain = $('#sidebar_main');
            this.$sidebarMainToggle = $('#sidebar_main_toggle');
            this.$headerMain = $('#header_main');
            this.$body = $('body');
            this.$html = $('html');
            this.$window = $(window);
            this.$document = $(document);
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this4 = this;

            this.init();
            this.mountSearch();
            if (this.$sidebarMain.length) {
                // check if browser support localstorage
                if (this.testLocalStorage()) {
                    // check if mini sidebar is enabled
                    if (localStorage.getItem("oneorder_sidebar_mini") !== null) {
                        this.$body.addClass('sidebar_mini');
                    }
                    if (localStorage.getItem("oneorder_sidebar_slim") !== null) {
                        this.$body.addClass('sidebar_slim');
                    }
                }

                if (this.$body.hasClass('sidebar_mini')) {
                    // small sidebar
                    this.miniSidebar();

                    this.$body.addClass('sidebar_mini').removeClass('sidebar_main_active sidebar_main_open sidebar_main_swipe');

                    setTimeout(function () {
                        _this4.$window.resize();
                    }, 280);
                } else if (this.$body.hasClass('sidebar_slim')) {
                    // slim sidebar
                    this.slimSidebar();

                    // custom scroller
                    this.customScrollbar(this.$sidebarMain);

                    // menu
                    this.sidebarMenu();

                    setTimeout(function () {
                        _this4.$window.resize();
                    }, 280);
                } else {
                    this.$sidebarMainToggle.on('click', function (e) {
                        e.preventDefault();
                        _this4.$body.hasClass('sidebar_main_active') || _this4.$body.hasClass('sidebar_main_open') && _this4.$window.width() >= 1220 ? _this4.hideSidebar() : _this4.showSidebar();
                    });
                    // hide sidebar (outside click/esc key pressed)
                    this.$document.on('click keyup', function (e) {
                        if (_this4.$body.hasClass('sidebar_main_active') && _this4.$window.width() < 1220) {
                            if (!$(e.target).closest(_this4.$sidebarMain).length && !$(e.target).closest(_this4.$sidebarMainToggle).length || e.keyCode == 27) {
                                _this4.hideSidebar();
                            }
                        }
                    });

                    // custom scroller
                    this.customScrollbar(this.$sidebarMain);

                    if (this.$body.hasClass('sidebar_main_active') && this.$window.width() < 1220) {
                        this.hideContentSidebar();
                    } else {
                        this.showContentSidebar();
                    }
                    // menu
                    this.sidebarMenu();
                    // swipe to open (touch devices)
                    this.swipeOpen();
                }
            }
            new _SecondarySidebar.SecondarySidebar().init();
        }
    }, {
        key: 'mountSearch',
        value: function mountSearch() {
            var _this5 = this;

            $('#main_search_btn').on('click', function (e) {
                e.preventDefault();
                _this5.showSearchBar();
            });
            this.$document.on('click keydown', function (e) {
                if (_this5.$body.hasClass('main_search_active')) {
                    if (!$(e.target).closest('.header_main_search_form').length && !$(e.target).closest('#main_search_btn').length || e.which == 27) {
                        _this5.hideSearchBar();
                    }
                }
            });
            $('.header_main_search_close').on('click', function () {
                _this5.hideSearchBar();
            });
        }
    }, {
        key: 'showSearchBar',
        value: function showSearchBar() {
            var _this6 = this;

            this.$headerMain.children('.header_main_content').velocity("transition.slideUpBigOut", {
                duration: 280,
                easing: easing_swiftOut,
                begin: function begin() {
                    _this6.$body.addClass('main_search_active');
                },
                complete: function complete() {
                    _this6.$headerMain.children('.header_main_search_form').velocity("transition.slideDownBigIn", {
                        duration: 280,
                        easing: easing_swiftOut,
                        complete: function complete() {
                            $('.header_main_search_input').focus();
                        }
                    });
                }
            });

            $('#searchbox').bind("enterKey", function () {
                _this6.doSearch();
            });
            $('#searchbox').keyup(function (e) {
                if (e.keyCode == 13) {
                    $(this).trigger("enterKey");
                }
            });
        }
    }, {
        key: 'hideSearchBar',
        value: function hideSearchBar() {
            var _this7 = this;

            this.$headerMain.children('.header_main_search_form').velocity("transition.slideUpBigOut", {
                duration: 280,
                easing: easing_swiftOut,
                begin: function begin() {
                    _this7.$headerMain.velocity("reverse");
                    _this7.$body.removeClass('main_search_active');
                },
                complete: function complete() {
                    _this7.$headerMain.children('.header_main_content').velocity("transition.slideDownBigIn", {
                        duration: 280,
                        easing: easing_swiftOut,
                        complete: function complete() {
                            $('.header_main_search_input').blur().val('');
                        }
                    });
                }
            });
        }
    }, {
        key: 'doSearch',
        value: function doSearch() {
            if (this.state.query) {
                this.context.router.push("/search/" + encodeURIComponent(this.state.query));
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this8 = this;

            var title = "one order";
            if (this.props.route && this.props.route.title) {
                title = this.props.route.title;
            }

            var backgroundColorStyle = {};
            if (BACKGROUND_COLOR) {
                _.set(backgroundColorStyle, 'backgroundColor', BACKGROUND_COLOR);
            }

            return _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(
                    'header',
                    { id: 'header_main', style: backgroundColorStyle },
                    _react2.default.createElement(
                        'div',
                        { className: 'header_main_content' },
                        _react2.default.createElement(
                            'nav',
                            { className: 'uk-navbar' },
                            _react2.default.createElement(
                                'div',
                                { className: 'main_logo_top' },
                                _react2.default.createElement(
                                    'a',
                                    { href: '/' },
                                    _react2.default.createElement(
                                        'span',
                                        { className: 'logo md-color-white' },
                                        title
                                    )
                                )
                            ),
                            _react2.default.createElement(
                                'a',
                                { href: '#', id: 'sidebar_main_toggle', className: 'sSwitch sSwitch_left' },
                                _react2.default.createElement('span', { className: 'sSwitchIcon' })
                            ),
                            _react2.default.createElement(
                                'div',
                                { id: 'menu_top_dropdown', className: 'uk-float-left uk-hidden-small' },
                                _react2.default.createElement(
                                    'div',
                                    { className: 'uk-button-dropdown', 'data-uk-dropdown': '{mode:\'click\'}', 'aria-haspopup': 'true', 'aria-expanded': 'false' },
                                    _react2.default.createElement(
                                        'a',
                                        { href: '#', className: 'top_menu_toggle' },
                                        _react2.default.createElement(
                                            'i',
                                            { className: 'material-icons md-24' },
                                            '\uE8F0'
                                        )
                                    ),
                                    _react2.default.createElement(
                                        'div',
                                        { className: 'uk-dropdown uk-dropdown-width-3' },
                                        _react2.default.createElement(
                                            'div',
                                            { className: 'uk-grid uk-dropdown-grid' },
                                            _react2.default.createElement(
                                                'div',
                                                { className: 'uk-width-2-3' },
                                                _react2.default.createElement(
                                                    'div',
                                                    { className: 'uk-grid uk-grid-width-medium-1-3 uk-margin-bottom uk-text-center' },
                                                    _react2.default.createElement(
                                                        'a',
                                                        { href: 'page_mailbox.html', className: 'uk-margin-top' },
                                                        _react2.default.createElement(
                                                            'i',
                                                            { className: 'material-icons md-36 md-color-light-green-600' },
                                                            '\uE158'
                                                        ),
                                                        _react2.default.createElement(
                                                            'span',
                                                            { className: 'uk-text-muted uk-display-block' },
                                                            'Mailbox'
                                                        )
                                                    ),
                                                    _react2.default.createElement(
                                                        'a',
                                                        { href: 'page_invoices.html', className: 'uk-margin-top' },
                                                        _react2.default.createElement(
                                                            'i',
                                                            { className: 'material-icons md-36 md-color-purple-600' },
                                                            '\uE53E'
                                                        ),
                                                        _react2.default.createElement(
                                                            'span',
                                                            { className: 'uk-text-muted uk-display-block' },
                                                            'Invoices'
                                                        )
                                                    ),
                                                    _react2.default.createElement(
                                                        'a',
                                                        { href: 'page_chat.html', className: 'uk-margin-top' },
                                                        _react2.default.createElement(
                                                            'i',
                                                            { className: 'material-icons md-36 md-color-cyan-600' },
                                                            '\uE0B9'
                                                        ),
                                                        _react2.default.createElement(
                                                            'span',
                                                            { className: 'uk-text-muted uk-display-block' },
                                                            'Chat'
                                                        )
                                                    ),
                                                    _react2.default.createElement(
                                                        'a',
                                                        { href: 'page_scrum_board.html', className: 'uk-margin-top' },
                                                        _react2.default.createElement(
                                                            'i',
                                                            { className: 'material-icons md-36 md-color-red-600' },
                                                            '\uE85C'
                                                        ),
                                                        _react2.default.createElement(
                                                            'span',
                                                            { className: 'uk-text-muted uk-display-block' },
                                                            'Scrum Board'
                                                        )
                                                    ),
                                                    _react2.default.createElement(
                                                        'a',
                                                        { href: 'page_snippets.html', className: 'uk-margin-top' },
                                                        _react2.default.createElement(
                                                            'i',
                                                            { className: 'material-icons md-36 md-color-blue-600' },
                                                            '\uE86F'
                                                        ),
                                                        _react2.default.createElement(
                                                            'span',
                                                            { className: 'uk-text-muted uk-display-block' },
                                                            'Snippets'
                                                        )
                                                    ),
                                                    _react2.default.createElement(
                                                        'a',
                                                        { href: 'page_user_profile.html', className: 'uk-margin-top' },
                                                        _react2.default.createElement(
                                                            'i',
                                                            { className: 'material-icons md-36 md-color-orange-600' },
                                                            '\uE87C'
                                                        ),
                                                        _react2.default.createElement(
                                                            'span',
                                                            { className: 'uk-text-muted uk-display-block' },
                                                            'User profile'
                                                        )
                                                    )
                                                )
                                            ),
                                            _react2.default.createElement(
                                                'div',
                                                { className: 'uk-width-1-3' },
                                                _react2.default.createElement(
                                                    'ul',
                                                    { className: 'uk-nav uk-nav-dropdown uk-panel' },
                                                    _react2.default.createElement(
                                                        'li',
                                                        { className: 'uk-nav-header' },
                                                        'Components'
                                                    ),
                                                    _react2.default.createElement(
                                                        'li',
                                                        null,
                                                        _react2.default.createElement(
                                                            'a',
                                                            { href: 'components_accordion.html' },
                                                            'Accordions'
                                                        )
                                                    ),
                                                    _react2.default.createElement(
                                                        'li',
                                                        null,
                                                        _react2.default.createElement(
                                                            'a',
                                                            { href: 'components_buttons.html' },
                                                            'Buttons'
                                                        )
                                                    ),
                                                    _react2.default.createElement(
                                                        'li',
                                                        null,
                                                        _react2.default.createElement(
                                                            'a',
                                                            { href: 'components_notifications.html' },
                                                            'Notifications'
                                                        )
                                                    ),
                                                    _react2.default.createElement(
                                                        'li',
                                                        null,
                                                        _react2.default.createElement(
                                                            'a',
                                                            { href: 'components_sortable.html' },
                                                            'Sortable'
                                                        )
                                                    ),
                                                    _react2.default.createElement(
                                                        'li',
                                                        null,
                                                        _react2.default.createElement(
                                                            'a',
                                                            { href: 'components_tabs.html' },
                                                            'Tabs'
                                                        )
                                                    )
                                                )
                                            )
                                        )
                                    )
                                )
                            ),
                            _react2.default.createElement(
                                'div',
                                { className: 'uk-navbar-flip' },
                                _react2.default.createElement(_Navbar.Navbar, null)
                            )
                        )
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'header_main_search_form' },
                        _react2.default.createElement(
                            'i',
                            { className: 'md-icon header_main_search_close material-icons md-24' },
                            '\uE5CD'
                        ),
                        _react2.default.createElement('input', { type: 'text', id: 'searchbox', name: 'q', className: 'header_main_search_input', value: this.state.query, autoComplete: 'off', onChange: function onChange(event) {
                                return _this8.setState({ query: event.target.value });
                            } }),
                        _react2.default.createElement(
                            'button',
                            { className: 'header_main_search_btn uk-button-link', onClick: function onClick() {
                                    return _this8.doSearch();
                                } },
                            _react2.default.createElement(
                                'i',
                                { className: 'md-icon material-icons md-24' },
                                '\uE8B6'
                            )
                        )
                    )
                ),
                _react2.default.createElement(
                    'aside',
                    { id: 'sidebar_main' },
                    _react2.default.createElement(_layout.Menu, null)
                ),
                _react2.default.createElement(
                    'div',
                    { id: 'page_content' },
                    _react2.default.createElement(
                        'div',
                        { id: 'page_content_inner', style: { padding: "0px" } },
                        this.props.children
                    )
                )
            );
        }
    }]);

    return AppLayoutMaximized;
}(_react2.default.Component);

AppLayoutMaximized.contextTypes = {
    appName: _react2.default.PropTypes.string,
    translator: _react2.default.PropTypes.object,
    router: _react2.default.PropTypes.object.isRequired
};