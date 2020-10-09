import React from "react";

export class ResponsiveFrame extends React.Component {
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
        let data = JSON.parse(event.data)
        if('success' === data.status){
            this.props.onSuccess && this.props.onSuccess(data.data);
        } else if('error' === data.status){
            this.props.onError && this.props.onError(data.data);
        } else if('cancel' === data.status){
            this.props.onCancel && this.props.onCancel();
        } else {
            console.log("modal warning", event.data);
        }
    }

    render() {
        const { src, style } = this.props;
        return (
            <iframe
                ref={el => {
                    this._frame = el;
                }}
                src = {src}
                style = {style}
                allowFullScreen = {this.props.allowFullScreen || false}
                frameBorder = {this.props.frameBorder || 0}
            />
        );
    }
}