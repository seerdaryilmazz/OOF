import React from "react";
import _ from "lodash";
import uuid from 'uuid';

import {TranslatingComponent} from 'susam-components/abstract';
import {Notify} from 'susam-components/basic';
import {Chip} from 'susam-components/advanced';

import {CrmAccountService} from '../services';

export class CountryPointChip extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            options: []
        };
    }

    componentDidMount() {
        this.loadOptionsIfNecessary(null, null);
    }

    componentDidUpdate(prevProps) {
        this.loadOptionsIfNecessary(prevProps.country, prevProps.type);
    }

    loadOptionsIfNecessary(countryFromPrevProps, typeFromPrevProps) {

        let previousCountryIso = (!_.isNil(countryFromPrevProps) ? countryFromPrevProps.iso : null);
        let previousType = (!_.isNil(typeFromPrevProps) ? typeFromPrevProps : null);
        let newCountryIso = (!_.isNil(this.props.country) ? this.props.country.iso : null);
        let newType = (!_.isNil(this.props.type) ? this.props.type : null);

        if (!_.isEqual(previousCountryIso, newCountryIso) || !_.isEqual(previousType, newType)) {
            if (_.isNil(newCountryIso) || _.isNil(newType)) {
                this.setState({options: []});
            } else {
                this.findCountryPoints(newCountryIso, newType, (response) => {
                    this.setState({options: response.data});
                });
            }
        }
    }

    findCountryPoints(countryIso, type, callback) {
        CrmAccountService.findCountryPoints(countryIso, type).then(response => {
            callback(response);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    render() {
        return (
            <Chip {...this.props} options={this.state.options}/>
        );
    }
}