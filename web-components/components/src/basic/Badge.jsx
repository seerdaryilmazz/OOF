import React from "react";
import PropTypes from "prop-types";
import {TranslatingComponent} from "../abstract/";

export class Badge extends TranslatingComponent {

    constructor(props) {
        super(props);
    }

    render() {
        let className = "uk-badge uk-badge-small uk-badge-" + this.props.type;

        return (
            <i className={className}>{super.translate(this.props.value)}</i>
        );
    }
}

Badge.contextTypes = {
    translator: PropTypes.object
};