import React from "react";
import _ from "lodash";

import {TranslatingComponent} from 'susam-components/abstract';
import {ReadOnlyDropDown, Notify} from 'susam-components/basic';

import {LookupService} from '../services';
import { CountryPoint } from "../potential/CountryPoint";

export class CountryPointDropDown extends TranslatingComponent {

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
        LookupService.getCountyPoints(countryIso, type).then(response => {
            callback(response);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    render() {
        let multiple =false;
        if(_.isUndefined(this.props.multiple)){
            multiple = this.props.type === 'POSTAL';
        } else {
            multiple = this.props.multiple;
        }
        return (
            <CountryPoint {...this.props} multiple={multiple} options={this.state.options}/>
        );
    }
}