import React from "react";

export default class NotAuthorized extends React.Component {
    render(){
        return <div className="uk-text-danger uk-text-upper">
            <span data-uk-tooltip="{cls:'long-text'}" title = {this.props.operationNames}>Not Authorized</span>
        </div>;
    }
}