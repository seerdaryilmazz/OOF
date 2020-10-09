import * as axios from 'axios';
import _ from 'lodash';
import React from 'react';
import { TranslatingComponent } from '../abstract/';
import { Notify } from '../basic';
export class Menu extends TranslatingComponent {
    state = {};

    constructor(props) {
        super(props);
        this.getMenuItems();
    };

    getMenuItems() {
        axios.get('/user-service/uimenu/usermenu').then(response => {
            this.setState({ items: response.data })
        }).catch((error) => {
            Notify.showError(error);
        });
    }

    componentDidMount() {
        this.mountMenu();
    }

    componentDidUpdate(prevProps, prevState) {
        if (!_.isEqual(prevState.items, this.state.items)) {
            this.mountMenu();
        }
    }

    mountMenu() {
        let $sidebar_main = $('#sidebar_main');
        // check for submenu
        $sidebar_main.find('.menu_section > ul').find('li').each(function () {
            var hasChildren = $(this).children('ul').length;
            if (hasChildren) {
                $(this).addClass('submenu_trigger')
            }
        });
        // toggle sections
        $('.submenu_trigger > a').on('click', function (e) {
            e.preventDefault();
            var $this = $(this);
            var slideToogle = $this.next('ul').is(':visible') ? 'slideUp' : 'slideDown';
            // accordion mode
            var accordion_mode = $sidebar_main.hasClass('accordion_mode');
            $this.next('ul')
                .velocity(slideToogle, {
                    duration: 400,
                    easing: easing_swiftOut,
                    begin: function () {
                        if (slideToogle == 'slideUp') {
                            $(this).closest('.submenu_trigger').removeClass('act_section')
                        } else {
                            if (accordion_mode) {
                                $this.closest('li').siblings('.submenu_trigger').each(function () {
                                    $(this).children('ul').velocity('slideUp', {
                                        duration: 400,
                                        easing: easing_swiftOut,
                                        begin: function () {
                                            $(this).closest('.submenu_trigger').removeClass('act_section')
                                        }
                                    })
                                })
                            }
                            $(this).closest('.submenu_trigger').addClass('act_section')
                        }
                    },
                    complete: function () {
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
        $sidebar_main
            .find('.act_item')
            .addClass('current_section')
            .parents('.submenu_trigger')
            .addClass('act_section')
            .children('a')
            .trigger('click');

    }

    render() {
        if (!this.state.items) {
            return (<div></div>);
        }
        let menuBody = this.createMenu(this.state.items, 0);
        return (
            <div className="menu_section">
                {menuBody}
            </div>
        );
    }

    createMenu(data, level) {
        let body = data.map((elem) => {
            let elemTitle = elem.name;
            let elemHref = "#";
            if (elem.url) {
                elemHref = elem.url;
            }
            let selfChild = null;
            let activeClassName = "";
            if (elem.children && elem.children.length > 0) {
                selfChild = this.createMenu(elem.children, level + 1);
            } else {
                let activeUrlToCheck = elemHref.indexOf("#") > 0 ? elemHref.substring(elemHref.indexOf("#") + 1) : elemHref;
                if (this.context.router.isActive(activeUrlToCheck, true)) {
                    activeClassName = "act_item";
                }
            }
            let padding = ((level + 1) * 12) + "px";
            return (
                <li key={elem.key} title={elemTitle} className={activeClassName}>
                    <a href={elemHref} className="waves-effect" style={{ paddingLeft: padding }}>
                        <span className="menu_title">{super.translate(elemTitle)}</span>
                    </a>
                    {selfChild}
                </li>
            );
        });
        return (
            <ul>
                {body}
            </ul>
        );
    }
}
Menu.contextTypes = {
    router: React.PropTypes.object,
    translator: React.PropTypes.object
};
