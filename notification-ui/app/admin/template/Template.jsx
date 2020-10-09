import React from 'react';
import { EmailNotificationTemplate } from './EmailNotificationTemplate';
import { WebNotificationTemplate } from './WebNotificationTemplate';

const components = {
    EMAIL: EmailNotificationTemplate,
    WEB_PUSH: WebNotificationTemplate
};

export class Template extends React.Component {
    render() {
        if (this.props.channel && this.props.concern) {
            return React.createElement(components[this.props.channel.channel.code], this.props);
        }
        return null;
    }
}