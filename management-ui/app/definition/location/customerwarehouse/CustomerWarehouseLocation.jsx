import _ from "lodash";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { DropDown, Notify } from 'susam-components/basic';
import { Grid, GridCell } from "susam-components/layout";
import { CompanyLocationSearchAutoComplete } from 'susam-components/oneorder/CompanyLocationSearchAutoComplete';
import { CustomerWarehouseService, CustomsService } from '../../../services/LocationService';
import { PlaceLocation } from '../place/PlaceLocation';
import { CustomsAndLocation } from './CustomsAndLocation';




export class CustomerWarehouseLocation extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
        }
    }

    componentDidMount() {
        let value = {company: this.props.place.company, location: this.props.place.companyLocation};
        if(this.props.searchByLocation && this.props.place.companyType.id === 'COMPANY'){
            this.handleSelectCompanyLocation(value);
        } else if(this.props.searchByLocation && this.props.place.companyType.id === 'CUSTOMS'){
            this.handleCustomsLocationSelection(value);
        }
    }

    componentWillReceiveProps(nextProps) {
    }

    handleSelectCompanyLocation(value){
        let place = _.cloneDeep(this.props.place);
        place.company = value.company;
        place.companyLocation = value.location;
        console.log("handleSelectCompanyLocation", place);
        if(place.companyLocation){
            this.loadCustomerWarehouse(place);
        }else{
            this.props.handleSave(place);
        }

    }

    handleCompanySelection(value) {
        let place = this.props.place;
        place.company = value;
        place.companyLocation = null;
        this.props.handleSave(place);
    }
    handleCompanyType(value) {
        let place = _.cloneDeep(this.props.place);
        place.companyType = value;
        place.companyLocation = null;
        place.company = null;
        this.props.handleSave(place);

    }

    loadCustomerWarehouse(place){
        CustomsService.getByLocationId(place.companyLocation.id, place.companyType.id).then(response => {
            if (response.data && response.data.id) {
                Notify.showError("Location is already defined as Cross-dock or General Location");
                place.companyLocation = null;
                this.props.handleSave(place);
            } else {
                if (!place.establishment) {
                    place.establishment = {address: {}};
                }
                if (!place.location) {
                    place.location = {};
                }
                place.name = place.companyLocation.name;
                place.localName = place.companyLocation.name;
                place.timezone = place.companyLocation.timezone;
                place.establishment.address.streetAddress = place.companyLocation.postaladdress.formattedAddress;
                place.establishment.address.country = place.companyLocation.postaladdress.country;
                place.establishment.address.postalCode = place.companyLocation.postaladdress.postalCode;
                place.location.pointOnMap = place.companyLocation.postaladdress.pointOnMap;
                place.location.phoneNumbers = place.companyLocation.phoneNumbers;
                place.location.googlePlaceId = place.companyLocation.googlePlaceId;
                place.location.googlePlaceUrl = place.companyLocation.googlePlaceUrl;

                place.companyLocation = {id: place.companyLocation.id, name: place.companyLocation.name};

                this.props.handleSave(place);
            }

        }).catch((error) => {
            Notify.showError("Error occured while validating Company Location selection.: " + error);
        });
    }
    handleLocationSelection(value) {
        let place = _.cloneDeep(this.props.place);
        if (!value) {
            place.companyLocation = null;
            this.props.handleSave(place);
        } else {

        }

    }

    handleCustomsLocationSelection(value) {
        let place = _.cloneDeep(this.props.place);
        if (!value) {
            place.companyLocation = null;
            this.props.handleSave(place);
        } else {
            CustomerWarehouseService.getCustomerWarehouseByCompanyLocationAndType(value.id, place.companyType.id).then((response) => {

                if (response.data && response.data.id) {
                    Notify.showError("Customer Warehouse is already defined for " + place.company.name + "-" + value.name);
                    place.companyLocation = null;
                    this.props.handleSave(place);
                } else {
                    if (!place.establishment) {
                        place.establishment = {address: {}};
                    }
                    if (!place.location) {
                        place.location = {};
                    }
                    place.companyLocation = {id: value.id, name: value.name};

                    place.name = value.name;
                    place.localName = value.localName;
                    place.timezone = value.timezone;
                    place.establishment.address.streetAddress = value.address;
                    place.establishment.address.country = value.country;
                    place.establishment.address.postalCode = value.postalCode;
                    place.location.pointOnMap = value.pointOnMap;
                    place.location.phoneNumbers = value.phoneNumbers;
                    place.location.googlePlaceId = value.googlePlaceId;
                    place.location.googlePlaceUrl = value.googlePlaceUrl;

                    this.props.handleSave(place);
                }

            }).catch((error) => {
                Notify.showError("Error occured while validating Company Location selection.: " + error);
            });
        }

    }

    next() {
        let place = this.props.place;
        if(!place.company || !place.companyLocation) {
            Notify.showError("Company and Company Location should be selected first.");
        } else {
            return this.placeLocation.next();
        }
    }

    renderLocationComponent() {
        let place = this.props.place;

        if(place.companyLocation) {
            return (
                <PlaceLocation ref={(c) => this.placeLocation = c}
                               readOnly={this.props.readOnly}
                               place={this.props.place}
                               handleSave={data => this.props.handleSave(data)}>
                </PlaceLocation>
            )
        } else {
            return null;
        }
    }

    render() {
        let place = this.props.place;
        let locationSelection = null;
        if(place.companyType && place.companyType.id === "COMPANY"){
            locationSelection = <CompanyLocationSearchAutoComplete inline={true} readOnly={(place && place.id) || this.props.searchByLocation}
                                                                   companyLabel="Customer Company" locationLabel="Warehouse Location"
                                                                   value={{company: place.company, location: place.companyLocation}}
                                                                   onChange = {value => this.handleSelectCompanyLocation(value)}/>;
        }
        if(place.companyType && place.companyType.id === "CUSTOMS"){
            locationSelection = <CustomsAndLocation customs={place.company} readOnly = {(place && place.id) || this.props.searchByLocation}
                                                    location={place.companyLocation}
                                                    onCustomsChange = {value => this.handleCompanySelection(value)}
                                                    onLocationChange = {value => this.handleCustomsLocationSelection(value)}/>
        }
        return (
            <Grid>
                <GridCell width="1-1">
                    <DropDown label = "Location Type" readOnly={(place && place.id) || this.props.searchByLocation}
                              options = {[{id:"COMPANY", name: "Company & locations"}, {id: "CUSTOMS", name: "Customs & Location"}]}
                              value = {place.companyType} onchange = {value => this.handleCompanyType(value)} />
                </GridCell>
                <GridCell width="1-2">
                    {locationSelection}
                </GridCell>
                <GridCell>
                    {this.renderLocationComponent()}
                </GridCell>
            </Grid>

        );
    }
}