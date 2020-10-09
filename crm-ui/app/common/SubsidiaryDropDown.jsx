import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {DropDown, Notify} from 'susam-components/basic';

import {AuthorizationService} from '../services';

export class SubsidiaryDropDown extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            ready: false,
            options: []
        };
    }

    componentDidMount() {
        AuthorizationService.getSubsidiaries().then(response => {
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