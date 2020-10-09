import React from 'react';
import { Button } from "../basic/Button";
import { NotificationService } from '../services/NotificationService';
var Push = require("push.js");

export class Notification extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            my: {
                unreadCount: 0,
                newNotifications: [],
                lastNotifications: []
            },
            ignore: true,
            title: ''
        };
        this.checkNotifications();
        this.handleNotification = setInterval(() => this.checkNotifications(), 60000);
    }

    componentWillUnmount() {
        clearInterval(this.handleNotification);
    }

    componentDidMount() {
        if (!Push.Permission.has()) {
            Push.Permission.request(
                function () {
                    console.log("push granted");
                },
                function () {
                    console.log("push denied");
                });
        }
    }

    handleRecievedNotification(data) {
        let newNotifications = _.get(data, 'newNotifications');
        if (!_.isEmpty(newNotifications)) {
            newNotifications.forEach(newOne => {
                if (_.find(data.activeConcerns, i => i.code === newOne.template.concern.code)) {
                    Push.create(newOne.subject, {
                        tag: newOne.id,
                        body: newOne.content,
                        onClick: function () {
                            NotificationService.read(newOne.id).then(response => {
                                window.open(newOne.url, "_blank");
                            })
                            this.close();
                        }
                    });
                }
            })
        }
        this.setState({ my: data });
    }

    checkNotifications() {
        NotificationService.my().then(response => {
            this.handleRecievedNotification(response.data);
        });
    }

    read(notification, redirect) {
        NotificationService.read(notification.id).then(response => {
            this.handleRecievedNotification(response.data);
            if (redirect) {
                window.location = notification.url;
            }
        });
    }

    readAll() {
        NotificationService.readAll().then(response => {
            this.handleRecievedNotification(response.data);
        });
    }

    render() {
        return (
            <li data-uk-dropdown="{mode:'click',pos:'bottom-right'}">
                <a href="javascript:;" className="user_action_icon">
                    <i className="material-icons md-24 md-light">notifications</i>
                    <span className="uk-badge">{this.state.my.unreadCount}</span>
                </a>
                <div className="uk-dropdown uk-dropdown-xlarge">
                    <div className="uk-text-right">
                        <Button icon="" data-uk-tooltip="{pos:'bottom'}" title="Preferences" mdIcon="settings" flat={true} size="small" style="primary" onclick={() => window.location = "/ui/notification/user-preferences"} />
                        <Button icon="" data-uk-tooltip="{pos:'bottom'}" title="Mark All as Read" mdIcon="drafts" iconColorClass="md-color-blue-500" flat={true} size="small" style="primary" onclick={() => this.readAll()} />
                    </div>
                    <div className="md-card-content">
                        <ul id="header_alerts" className="uk-switcher uk-margin">
                            <li aria-hidden="false" className="uk-active" style={{ animationDuration: "200ms" }}>
                                <ul className="md-list md-list-addon">
                                    {this.state.my.lastNotifications.map(i => {
                                        return (<li key={i.id} className={i.read ? null : 'active-list-element'} >
                                            <div className="md-list-addon-element">
                                                <span className="md-user-letters" style={JSON.parse(i.template.addonClass)}>
                                                    {i.template.addonText}
                                                </span>
                                            </div>
                                            <div className="md-list-content">
                                                <div className="md-list-action">
                                                    <Button icon="" flat={true} size="mini" style="primary" mdIcon="drafts" onclick={() => this.read(i)} />
                                                </div>
                                                <span className="md-list-heading">
                                                    <a href="javascript:;" onClick={() => this.read(i, true)}>{i.subject}</a>
                                                </span>
                                                <span className="uk-text-small" style={{ whiteSpace: "pre-wrap" }}>{i.body}</span>
                                                <span className="uk-text-small uk-text-muted" style={{ whiteSpace: "pre-wrap" }}>{i.content}</span>
                                            </div>
                                        </li>);
                                    })}
                                </ul>
                            </li>
                        </ul>
                    </div>
                    <Button label="view all notifications" fullWidth={true} flat={true} size="small" style="primary" onclick={() => window.location = "/ui/notification/"} />
                </div>
            </li>
        );
    };
}