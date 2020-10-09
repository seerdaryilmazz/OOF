import React from "react";
import _ from "lodash";

import {TranslatingComponent} from 'susam-components/abstract';
import {DropDown, Notify} from 'susam-components/basic';

import {TranslatorService} from '../services';

export class SupportedLocaleDropDown extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            ready: false,
            options: []
        };
    }

    componentDidMount() {
        TranslatorService.findActiveSupportedLocales().then(response => {
            this.setState({options: _.sortBy(response.data, ["name"]), ready: true});
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