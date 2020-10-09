import React from 'react';
import { Button, Notify } from 'susam-components/basic';
import { PageHeader } from 'susam-components/layout';
import { NotificationService } from './service/NotificationService';

var markAsRead = null;
var readItemId = null;

export default class Home extends React.Component {

    state = {
        notifications: []
    };

    constructor(props) {
        super(props);
        this.list();
    }

    list() {
        NotificationService.list().then(response => {
            this.setState({
                notifications: response.data
            });
        })
    }

    readAll() {
        NotificationService.readAll().then(response => {
            this.list();
        });
    }

    read(notification, redirect) {
        NotificationService.read(notification.id).then(response => {
            this.list();
            if (redirect) {
                window.location = notification.url;
            }
        });
    }

    isItemShown(item){
        let itemShown = readItemId === item.id ? 'item-shown' : "";
        let selected = item.read ? "":"md-card-list-item-selected";
        return itemShown + " " + selected;
    }

    componentDidMount() {

        markAsRead = (notification) => this.read(notification);

        var $mailbox = $("#mailbox");
        $mailbox.on("click", ".md-card-list ul > li", function (i) {
            if (!$(i.target).closest(".md-card-list-item-menu").length && !$(i.target).closest(".md-card-list-item-select").length) {
                var t = $(this);
                if (!t.hasClass("item-shown")) {
                    markAsRead({ id: t.attr("id") });
                    readItemId = t.attr("id");
                    var e = t.height() + t.children(".md-card-list-item-content-wrapper").actual("height");
                    $mailbox.find(".item-shown").velocity("reverse", {
                        begin: function (i) {
                            $(i).removeClass("item-shown").children(".md-card-list-item-content-wrapper").hide().velocity("reverse")
                        }
                    });
                    t.velocity({
                        marginTop: 40,
                        marginBottom: 40,
                        marginLeft: -20,
                        marginRight: -20,
                        minHeight: e
                    },
                        {
                            duration: 300,
                            easing: easing_swiftOut,
                            begin: function (i) {
                                $(i).addClass("item-shown")
                            },
                            complete: function (i) {
                                $(i).children(".md-card-list-item-content-wrapper").show().velocity({
                                    opacity: 1
                                });
                                var x = $("body")
                                    , e = $(i);
                                x.animate({
                                    scrollTop: e.offset().top - $page_content.offset().top - 8
                                }, 1e3, bez_easing_swiftOut)
                            }
                        });
                }
            }
        });
        $(document).on("click keydown", function (i) {
            $(i.target).closest("li.item-shown").length && 27 != i.which || $mailbox.find(".item-shown").velocity("reverse", {
                begin: function (i) {
                    $(i).removeClass("item-shown").children(".md-card-list-item-content-wrapper").hide().velocity("reverse")
                }
            })
        });
    }

    render() {
        return (
            <div>
                <PageHeader title="Notifications" />
                <div className="md-card-list-wrapper" id="mailbox">
                    <div className="uk-width-large-8-10 uk-container-center">
                        <div className="md-card-list">
                            <div className="uk-text-right">
                                <Button size="small" flat={true} style="primary" label="Mark All as Read" onclick={() => Notify.confirm("All notifications will be marked as read. Are you sure?", () => this.readAll())} />
                            </div>
                            <ul>
                                {this.state.notifications.map((item, index) => {
                                    return (
                                        <li key={item.id} className={this.isItemShown(item)} id={item.id}>
                                            <div className="md-card-list-item-menu">
                                                <Button icon="" flat={true} size="mini" style="primary" mdIcon="drafts" onclick={() => this.read(item)} />
                                            </div>
                                            <div className="md-card-list-item-avatar-wrapper">
                                                <span className="md-user-letters" style={JSON.parse(item.template.addonClass)}>{item.template.addonText}</span>
                                            </div>
                                            <span className="md-card-list-item-date">{item.createdAt}</span>
                                            <div className="md-card-list-item-sender">
                                                <a href="javascript:;" onClick={() => this.read(item, true)}>{item.subject}</a>
                                            </div>
                                            <div className="md-card-list-item-subject">
                                                <div className="md-card-list-item-sender-small">
                                                    <a href="javascript:;" onClick={() => this.read(item, true)}>{item.subject}</a>
                                                </div>
                                                <span className="uk-text-small uk-text-muted" style={{whiteSpace: "pre-wrap"}}>{item.content}</span>
                                            </div>
                                            <div className="md-card-list-item-content-wrapper">
                                                <div className="md-card-list-item-content">
                                                    <div className="uk-text-small" style={{whiteSpace: "pre-wrap"}}>{item.body}</div>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
}