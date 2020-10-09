import React from "react";
import PropTypes from 'prop-types';
import {TranslatingComponent} from "../abstract/";
import {Button} from "../basic";

export class StateTrackerButton extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {
            disabled: true,
        }
    };

    componentDidMount() {
        if (this.context.stateTrackerRegistry) {
            this.context.stateTrackerRegistry.registerStateTracker(
                this.props.component,
                this.props.propsToCheck,
                this.props.options,
                this.props.initialState,
                () => this.onStateChanged(),
                () => this.onStateUnchanged())
        }
    }

    changeButtonDisabled(disabled) {
        this.setState({disabled: disabled});

        if (disabled) {
            $(window).off("beforeunload");
        } else {
            $(window).on("beforeunload", () => {
                return "There are unsaved changes";
            });
        }
    }

    onStateChanged() {
        this.changeButtonDisabled(false);
    }

    onStateUnchanged() {
        this.changeButtonDisabled(true);
    }

    render() {
        return <Button disabled={this.state.disabled} {...this.props} />;
    }
}

StateTrackerButton.contextTypes = {
    stateTrackerRegistry: PropTypes.object
};