import React from "react";
import _ from "lodash";
import {TranslatingComponent} from 'susam-components/abstract';
import {CompanyService} from '../services';

export class FormattedAddress extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.initFormattedAddress(null);
    }

    componentDidUpdate(prevProps) {
        this.initFormattedAddress(prevProps.location);
    }

    initFormattedAddress(locationFromPrevProps) {
        if (!_.isEqual(locationFromPrevProps, this.props.location)) {
            let formattedAddress = this.getFormattedAddress(this.props.location);
            if (formattedAddress) {
                this.setState({formattedAddress: formattedAddress});
            } else{
                if (this.props.location && this.props.location.id) {
                    this.getLocation(this.props.location.id, (response) => {
                        let formattedAddress = this.getFormattedAddress(response.data);
                        this.setState({formattedAddress: formattedAddress});
                    });
                } else {
                    this.setState({formattedAddress: null});
                }
            }
        }
    }

    getFormattedAddress(location) {
        let formattedAddress = location && location.postaladdress ? location.postaladdress.formattedAddress : null;
        return formattedAddress;
    }

    getLocation(id, callback) {
        CompanyService.getLocationById(id).then(response => {
            callback(response);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    render() {
        let formattedAddress = this.state.formattedAddress ? this.state.formattedAddress : "";
        return (
            <span className="uk-text-small uk-text-muted uk-text-bold">{formattedAddress}</span>
        );
    }
}