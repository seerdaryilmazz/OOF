import React from 'react';
import { Notify } from 'susam-components/basic';
import { Card } from 'susam-components/layout';
import { CompanyLocationService } from './../services/KartoteksService';
import { CompanyLocation } from './wizard/locations/CompanyLocation';
import { CardHeader } from 'susam-components/layout/Header';

export class EditCompanyLocation extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            location: this.adjustLocation(this.props.location)
        }
        this.loadLocation();
    }

    adjustLocation(location){
        let adjustedLocation = _.isEmpty(location) ? this.emptyLocation() : location;
        _.set(adjustedLocation, 'updated', true);
        return adjustedLocation;
    }

    emptyLocation() {
        return {
            active: true,
            company: this.props.company,
            phoneNumbers: [],
            postaladdress: {
                country: this.props.company.country,
            }
        }
    }

    loadLocation() {
        if (!_.get(this.props, 'params.locationId')) {
            return
        }
        CompanyLocationService.getCompanyLocation(this.props.params.locationId).then(response => {
            this.setState({ location: adjustLocation(response.data) });
        }).catch(error => Notify.showError(error));
    }

    handleSave(location) {
        this.props.onSave && this.props.onSave(location);
    }

    handleCancel(location) {
        this.props.onCancel && this.props.onCancel();
    }

    render() {
        let otherLocationNames = _.filter(this.props.company.companyLocations, location => location.id != this.state.location.id).map(item => item.shortName).join(",");
        return <CompanyLocation location={this.state.location} 
            mode="NewCompany"
            companyShortName={this.props.company.shortName}
            otherLocationNames={otherLocationNames}
            ref={(c) => this.form = c}
            onsave={location => this.handleSave(location)}
            oncancel={() => this.handleCancel()} />;
    }
}