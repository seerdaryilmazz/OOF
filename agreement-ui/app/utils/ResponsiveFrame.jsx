import React from "react";
import PropTypes from 'prop-types';
import {TranslatingComponent} from 'susam-components/abstract';

export class ResponsiveFrame extends TranslatingComponent {
    constructor() {
        super();
        this.onReceiveMessage = this.onReceiveMessage.bind(this);
    }


    componentDidMount() {
        window.addEventListener("message", this.onReceiveMessage);
    }
    componentWillUnmount() {
        window.removeEventListener("message", this.onReceiveMessage, false);
    }

    onReceiveMessage(event) {
        const { onReceiveMessage } = this.props;
        if (onReceiveMessage) {
            let data = JSON.parse(event.data)
            onReceiveMessage(data);
        }
    }

    render() {
        const { attributes } = this.props;
        const defaultAttributes = {
            allowFullScreen: false,
            frameBorder: 0
        };
        const mergedAttributes = Object.assign(
            {},
            defaultAttributes,
            attributes
        );
        return (
            <iframe
                ref={el => {
                    this._frame = el;
                }}
                {...mergedAttributes}
            />
        );
    }
}