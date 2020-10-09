import React from 'react';
import { Notify } from 'susam-components/basic';

export class LoadingIndicator extends React.Component {

    state = { };

    componentWillReceiveProps(nextProps) {
        if (nextProps.busy != this.props.busy) {
            nextProps.busy ? this.open() : this.close();
        }
    }

    open() {
        this.setState({blocker: Notify.blockUI()})
    }

    close() {
        if(this.state.blocker && this.state.blocker.isActive()){
            this.state.blocker.hide();
        }
    }

    render() {
        return null;
    }
}