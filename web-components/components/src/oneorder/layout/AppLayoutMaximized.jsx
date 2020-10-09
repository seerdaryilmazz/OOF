import React from 'react';
import { Menu } from '../../layout';
import { Navbar } from './Navbar';
import { SecondarySidebar } from './SecondarySidebar';


export class AppLayoutMaximized extends React.Component{

    constructor(){
        super();
        this.state = {};
        $('body').removeClass('sidebar_main_active sidebar_main_open');
    }


    testLocalStorage(){
        var test = 'test';
        try {
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch(e) {
            return false;
        }
    }

    slimSidebar() {
        this.$sidebarMainToggle.hide();

        this.$body.addClass('sidebar_slim sidebar_slim_inactive')
            .removeClass('sidebar_main_active sidebar_main_open sidebar_main_swipe');

        this.$sidebarMain
            .mouseenter(function() {
                this.$body.removeClass('sidebar_slim_inactive');
                this.$body.addClass('sidebar_slim_active');
            })
            .mouseleave(function() {
                this.$body.addClass('sidebar_slim_inactive');
                this.$body.removeClass('sidebar_slim_active');
            })
    }

    miniSidebar(){
        this.$sidebarMainToggle.hide();
        this.$sidebarMain.find('.menu_section > ul').children('li').each(function() {
            var hasChildren = $(this).children('ul').length;
            if(hasChildren) {
                $(this).addClass('sidebar_submenu');
                if($(this).find('.act_item').length) {
                    $(this).addClass('current_section');
                }
            } else {
                $(this).attr({
                    'data-uk-tooltip': "{pos:'right'}"
                });
            }
        });
    }
    customScrollbar($object){
        if(!$object.children('.scrollbar-inner').length) {
            $object.wrapInner("<div className='scrollbar-inner'></div>");
        }
        if(Modernizr.touch) {
            $object.children('.scrollbar-inner').addClass('touchscroll');
        } else {
            $object.children('.scrollbar-inner').scrollbar({
                disableBodyScroll: true,
                scrollx: false,
                duration: 100
            });
        }
    }

    sidebarMenu(){
        this.$sidebarMain.find('.menu_section > ul').find('li').each(function() {
            var hasChildren = $(this).children('ul').length;
            if(hasChildren) {
                $(this).addClass('submenu_trigger')
            }
        });
        // toggle sections
        let self = this;
        $('.submenu_trigger > a').on('click',function(e) {
            e.preventDefault();
            var $this = $(this);
            var slideToogle = $this.next('ul').is(':visible') ? 'slideUp' : 'slideDown';
            // accordion mode
            var accordion_mode = self.$sidebarMain.hasClass('accordion_mode');
            $this.next('ul')
                .velocity(slideToogle, {
                    duration: 400,
                    easing: easing_swiftOut,
                    begin: function() {
                        if(slideToogle == 'slideUp') {
                            $(this).closest('.submenu_trigger').removeClass('act_section')
                        } else {
                            if(accordion_mode) {
                                $this.closest('li').siblings('.submenu_trigger').each(function() {
                                    $(this).children('ul').velocity('slideUp', {
                                        duration: 400,
                                        easing: easing_swiftOut,
                                        begin: function() {
                                            $(this).closest('.submenu_trigger').removeClass('act_section')
                                        }
                                    })
                                })
                            }
                            $(this).closest('.submenu_trigger').addClass('act_section')
                        }
                    },
                    complete: function() {
                        if(slideToogle !== 'slideUp') {
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
        this.$sidebarMain
            .find('.act_item')
            .closest('.submenu_trigger')
            .addClass('act_section current_section')
            .children('a')
            .trigger('click');
    }
    hideSidebar(){
        this.$body.addClass('sidebar_main_hiding').removeClass('sidebar_main_active sidebar_main_open');
        if( this.$window.width() < 1220 ) {
            this.showContentSidebar();
        }
        setTimeout(() => {
            this.$body.removeClass('sidebar_main_hiding');
            this.$window.resize();
        },290);
    }
    showSidebar(){
        this.$body.addClass('sidebar_main_active');
        if( this.$window.width() < 1220 ) {
            this.hideContentSidebar();
        }
        setTimeout(function() {
            this.$window.resize();
        },290);
    }
    hideContentSidebar(){
        if(!this.$body.hasClass('header_double_height')) {
            this.$html.css({
                'paddingRight': scrollbarWidth(),
                'overflow': 'hidden'
            });
        }
    }
    showContentSidebar(){
        if(!this.$body.hasClass('header_double_height')) {
            this.$html.css({
                'paddingRight': '',
                'overflow': ''
            });
        }
    }
    swipeOpen(){
        if( this.$body.hasClass('sidebar_main_swipe') && Modernizr.touch) {
            this.$body.append('<div id="sidebar_swipe_area" style="position: fixed;left: 0;top:0;z-index:1000;width:16px;height:100%"></div>');

            let mc = new Hammer.Manager(document.getElementById("sidebar_swipe_area"));
            mc.add(new Hammer.Swipe({
                threshold: 0,
                pointers: 2,
                velocity: 0
            }));
            mc.on("swiperight", () => {
                if (!this.$body.hasClass('sidebar_main_active')) {
                    this.showSidebar();
                }
            });
        }
    }

    init(){
        this.$sidebarMain = $('#sidebar_main');
        this.$sidebarMainToggle = $('#sidebar_main_toggle');
        this.$headerMain = $('#header_main');
        this.$body = $('body');
        this.$html = $('html');
        this.$window = $(window);
        this.$document = $(document);
    }

    componentDidMount(){
        this.init();
        this.mountSearch();
        if(this.$sidebarMain.length) {
            // check if browser support localstorage
            if(this.testLocalStorage()) {
                // check if mini sidebar is enabled
                if(localStorage.getItem("oneorder_sidebar_mini") !== null) {
                    this.$body.addClass('sidebar_mini');
                }
                if(localStorage.getItem("oneorder_sidebar_slim") !== null) {
                    this.$body.addClass('sidebar_slim');
                }
            }

            if (this.$body.hasClass('sidebar_mini')) {
                // small sidebar
                this.miniSidebar();

                this.$body
                    .addClass('sidebar_mini')
                    .removeClass('sidebar_main_active sidebar_main_open sidebar_main_swipe');

                setTimeout(() => {
                    this.$window.resize();
                }, 280);

            } else if(this.$body.hasClass('sidebar_slim')) {
                // slim sidebar
                this.slimSidebar();

                // custom scroller
                this.customScrollbar(this.$sidebarMain);

                // menu
                this.sidebarMenu();

                setTimeout(() => {
                    this.$window.resize();
                }, 280);

            } else {
                this.$sidebarMainToggle.on('click', (e) => {
                    e.preventDefault();
                    ( this.$body.hasClass('sidebar_main_active') || (this.$body.hasClass('sidebar_main_open') && this.$window.width() >= 1220) ) ? this.hideSidebar() : this.showSidebar();
                });
                // hide sidebar (outside click/esc key pressed)
                this.$document.on('click keyup', (e) => {
                    if( this.$body.hasClass('sidebar_main_active') && this.$window.width() < 1220 ) {
                        if (
                            ( !$(e.target).closest(this.$sidebarMain).length && !$(e.target).closest(this.$sidebarMainToggle).length )
                            || ( e.keyCode == 27 )
                        ) {
                            this.hideSidebar();
                        }
                    }
                });

                // custom scroller
                this.customScrollbar(this.$sidebarMain);

                if(this.$body.hasClass('sidebar_main_active') && this.$window.width() < 1220 ) {
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
        new SecondarySidebar().init();

    }

    mountSearch(){
        $('#main_search_btn').on('click', (e) => {
            e.preventDefault();
            this.showSearchBar();
        });
        this.$document.on('click keydown', (e) => {
            if( this.$body.hasClass('main_search_active') ) {
                if (
                    (!$(e.target).closest('.header_main_search_form').length &&
                    !$(e.target).closest('#main_search_btn').length ) ||
                    ( e.which == 27 )) {
                    this.hideSearchBar();
                }
            }
        });
        $('.header_main_search_close').on('click', () => {
            this.hideSearchBar();
        })
    }
    showSearchBar(){
        this.$headerMain
            .children('.header_main_content')
            .velocity("transition.slideUpBigOut", {
                duration: 280,
                easing: easing_swiftOut,
                begin: () => {
                    this.$body.addClass('main_search_active');
                },
                complete: () => {
                    this.$headerMain
                        .children('.header_main_search_form')
                        .velocity("transition.slideDownBigIn", {
                            duration: 280,
                            easing: easing_swiftOut,
                            complete: () => {
                                $('.header_main_search_input').focus();
                            }
                        })
                }
            });

        $('#searchbox').bind("enterKey", () => {
            this.doSearch();
        });
        $('#searchbox').keyup(function(e){
            if(e.keyCode == 13) {
                $(this).trigger("enterKey");
            }
        });
    }
    hideSearchBar() {
        this.$headerMain
            .children('.header_main_search_form')
            .velocity("transition.slideUpBigOut", {
                duration: 280,
                easing: easing_swiftOut,
                begin: () => {
                    this.$headerMain.velocity("reverse");
                    this.$body.removeClass('main_search_active');
                },
                complete: () => {
                    this.$headerMain
                        .children('.header_main_content')
                        .velocity("transition.slideDownBigIn", {
                            duration: 280,
                            easing: easing_swiftOut,
                            complete: () => {
                                $('.header_main_search_input').blur().val('');
                            }
                        })
                }
            });
    }

    doSearch(){
        if(this.state.query){
            this.context.router.push("/search/" + encodeURIComponent(this.state.query));
        }
    }

    render(){
        let title = "one order";
        if(this.props.route && this.props.route.title){
            title = this.props.route.title;
        }

        let backgroundColorStyle = {};
        if(BACKGROUND_COLOR){
            _.set(backgroundColorStyle, 'backgroundColor', BACKGROUND_COLOR);
        }

        return(
            <div>
                <header id="header_main" style={backgroundColorStyle}>
                    <div className="header_main_content">
                        <nav className="uk-navbar">
                            <div className="main_logo_top">
                                <a href="/"><span className="logo md-color-white">{title}</span></a>
                            </div>

                            <a href="#" id="sidebar_main_toggle" className="sSwitch sSwitch_left">
                                <span className="sSwitchIcon"></span>
                            </a>{/*
                         <a href="#" id="sidebar_secondary_toggle" className="sSwitch sSwitch_right uk-hidden-large">
                         <span className="sSwitchIcon"></span>
                         </a>*/}
                            <div id="menu_top_dropdown" className="uk-float-left uk-hidden-small">
                                <div className="uk-button-dropdown" data-uk-dropdown="{mode:'click'}" aria-haspopup="true" aria-expanded="false">
                                    <a href="#" className="top_menu_toggle"><i className="material-icons md-24"></i></a>
                                    <div className="uk-dropdown uk-dropdown-width-3">
                                        <div className="uk-grid uk-dropdown-grid">
                                            <div className="uk-width-2-3">
                                                <div className="uk-grid uk-grid-width-medium-1-3 uk-margin-bottom uk-text-center">
                                                    <a href="page_mailbox.html" className="uk-margin-top">
                                                        <i className="material-icons md-36 md-color-light-green-600"></i>
                                                        <span className="uk-text-muted uk-display-block">Mailbox</span>
                                                    </a>
                                                    <a href="page_invoices.html" className="uk-margin-top">
                                                        <i className="material-icons md-36 md-color-purple-600"></i>
                                                        <span className="uk-text-muted uk-display-block">Invoices</span>
                                                    </a>
                                                    <a href="page_chat.html" className="uk-margin-top">
                                                        <i className="material-icons md-36 md-color-cyan-600"></i>
                                                        <span className="uk-text-muted uk-display-block">Chat</span>
                                                    </a>
                                                    <a href="page_scrum_board.html" className="uk-margin-top">
                                                        <i className="material-icons md-36 md-color-red-600"></i>
                                                        <span className="uk-text-muted uk-display-block">Scrum Board</span>
                                                    </a>
                                                    <a href="page_snippets.html" className="uk-margin-top">
                                                        <i className="material-icons md-36 md-color-blue-600"></i>
                                                        <span className="uk-text-muted uk-display-block">Snippets</span>
                                                    </a>
                                                    <a href="page_user_profile.html" className="uk-margin-top">
                                                        <i className="material-icons md-36 md-color-orange-600"></i>
                                                        <span className="uk-text-muted uk-display-block">User profile</span>
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="uk-width-1-3">
                                                <ul className="uk-nav uk-nav-dropdown uk-panel">
                                                    <li className="uk-nav-header">Components</li>
                                                    <li><a href="components_accordion.html">Accordions</a></li>
                                                    <li><a href="components_buttons.html">Buttons</a></li>
                                                    <li><a href="components_notifications.html">Notifications</a></li>
                                                    <li><a href="components_sortable.html">Sortable</a></li>
                                                    <li><a href="components_tabs.html">Tabs</a></li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="uk-navbar-flip">
                                <Navbar/>
                            </div>
                        </nav>
                    </div>
                    <div className="header_main_search_form">
                        <i className="md-icon header_main_search_close material-icons md-24">&#xE5CD;</i>
                        <input type="text" id="searchbox" name="q" className="header_main_search_input" value = {this.state.query} autoComplete="off" onChange = {(event) => this.setState({query: event.target.value})} />
                        <button className="header_main_search_btn uk-button-link" onClick = {() => this.doSearch()}><i className="md-icon material-icons md-24">&#xE8B6;</i></button>
                    </div>
                </header>
                <aside id="sidebar_main">
                    <Menu/>
                </aside>
                <div id="page_content">
                    <div id="page_content_inner" style = {{padding:"0px"}}>
                        {this.props.children}
                    </div>
                </div>
            </div>
        );
    }
}

AppLayoutMaximized.contextTypes = {
    appName: React.PropTypes.string,
    translator: React.PropTypes.object,
    router: React.PropTypes.object.isRequired
};