import React from "react";

import {TranslatingComponent} from '../abstract';
import {DropDown, Notify} from '../basic';

import {SalesboxService} from '../services';

export class SalesBoxCancelReasonDropDown extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            ready: false,
            options: []
        };
    }

    componentDidMount() {
        SalesboxService.findSalesBoxCancelReasons().then(response => {
            this.setState({options: response.data, ready: true});
        }).catch(error => {
            Notify.showError(error);
        });
    }

    render() {

        if (!this.state.ready) {
            return null;
        }

        return (
            <DropDown {...this.props} options={this.state.options}/>
        );
    }
}