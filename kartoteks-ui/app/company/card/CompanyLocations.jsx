import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button } from "susam-components/basic";
import { Grid, GridCell, Modal } from "susam-components/layout";
import uuid from 'uuid';
import { EditCompanyLocation } from '../../company/EditCompanyLocation';
import { withAuthorization } from '../../security';
import { PhoneNumberUtils } from '../../utils/PhoneNumberUtils';
import { BasicMap } from '../wizard/locations/BasicMap';

const SecureEditCompanyButton = withAuthorization(Button, ["kartoteks.company.edit-temp-company","kartoteks.company.edit-company"], { hideWhenNotAuthorized: true });

export class CompanyLocations extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {};
    }
    handleExpandClick(e, item) {
        e.preventDefault();
        this.props.onExpand && this.props.onExpand(item);
    }

    handleSaveLocation(location){
        this.props.onSave && this.props.onSave(location, this.editLocationModal);
    }

    render() {
        let center = this.props.company.companyLocations[0].postaladdress.pointOnMap;
        let pins = this.props.company.companyLocations.map(item => {
            return { name: item.name, draggable: false, position: item.postaladdress.pointOnMap }
        });
        let locations = this.props.company.companyLocations.map(item => {
            let expandLink = item._expand ?
                <a href="#" onClick={(e) => this.handleExpandClick(e, item)} className="md-list-action"><i className="md-icon uk-icon-chevron-up" /></a> :
                <a href="#" onClick={(e) => this.handleExpandClick(e, item)} className="md-list-action"><i className="md-icon uk-icon-chevron-down" /></a>;
            let isDefault = item.default ? <i className="uk-badge uk-text-small uk-badge-success uk-margin-left">{super.translate("Default")}</i> : "";
            let isTemp = item.temp ? <i className="uk-badge uk-text-small uk-badge-danger uk-margin-left">{super.translate("Temp")}</i> : "";
            let googlePlace = item.googlePlaceUrl ? <a href={item.googlePlaceUrl} target="_blank">{super.translate("Open in Google Places")}</a> : "";
            let phoneNumbers = "";

            let editButton = <SecureEditCompanyButton icon="pencil" flat={true} size="mini" title="edit" onclick={() => this.setState({ selectedLocation: item }, () => this.editLocationModal.open())} />
            if (item._expand) {
                phoneNumbers = super.translate("No phone numbers");
                if (item.phoneNumbers.length > 0) {
                    let counter = 0;
                    let phoneNumberList = item.phoneNumbers.map(phone => {
                        let isPhoneDefault = phone.default ? <i className="uk-badge uk-text-small uk-badge-success uk-margin-left">{super.translate("Default")}</i> : "";
                        let numberType = "";
                        if (phone.numberType.code == "FAX") {
                            numberType = <i className="md-list-addon-icon uk-icon-fax " style={{ fontSize: "120%" }} title="Fax" data-uk-tooltip="{pos:'bottom'}" />;
                        } else if (phone.numberType.code == "PHONE") {
                            numberType = <i className="md-list-addon-icon uk-icon-phone " style={{ fontSize: "120%" }} title="Phone" data-uk-tooltip="{pos:'bottom'}" />;
                        }
                        return (
                            <li key={counter++}>
                                <div className="md-list-addon-element">
                                    {numberType}
                                </div>
                                <div className="md-list-content">
                                    <span className="md-list-heading">{PhoneNumberUtils.format(phone.phoneNumber)}
                                        {isPhoneDefault}
                                    </span>
                                </div>
                            </li>
                        );
                    });
                    phoneNumbers = <div className="md-list-content"><ul className="md-list md-list-addon">{phoneNumberList}</ul></div>;
                }
            }
            return (
                <li key={item.id} className="">
                    <div className="md-list-content">
                        {expandLink}
                        <span className="md-list-heading">{item.name} {isDefault} {isTemp} {editButton}</span>
                        <span className="uk-text-small uk-text-muted uk-margin-small-top">
                            {item.postaladdress.formattedAddress}
                        </span>
                        <span>{googlePlace}</span>
                    </div>
                    {phoneNumbers}
                </li>
            );
        });
        return (
            <Grid>
                <GridCell width="1-1">
                    <BasicMap id={uuid.v4()} height="300px"
                        map={{ zoom: 10, disableDefaultUI: false, center: center }}
                        dropPins={pins} />
                </GridCell>
                <GridCell width="1-1" style={{ textAlign: "right" }}>
                    <SecureEditCompanyButton label="Add Location" style="primary" size="mini" onclick={() => this.setState({ selectedLocation: {} }, () => this.editLocationModal.open())} />
                </GridCell>
                <GridCell width="1-1">
                    <ul className="md-list">
                        {locations}
                    </ul>
                </GridCell>
                <Modal ref={c => this.editLocationModal = c} 
                    onclose={() => this.setState({ selectedLocation: null })}
                    large={true}  closeOnBackgroundClicked={false} >
                    {this.state.selectedLocation && <EditCompanyLocation
                        location={this.state.selectedLocation}
                        company={this.props.company}
                        onCancel={() => this.editLocationModal.close()}
                        onSave={location => this.handleSaveLocation(location)} />}
                </Modal>
            </Grid>
        );
    }
}