import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {Notify} from 'susam-components/basic';
import {Chip} from 'susam-components/advanced';

import {CrmAccountService} from '../services';

export class ShipmentLoadingTypeChip extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            ready: false,
            options: []
        };
    }

    componentDidMount() {
        CrmAccountService.findShipmentLoadingTypes("ROAD").then(response => {
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
            <Chip {...this.props} options={this.state.options}/>
        );
    }
}