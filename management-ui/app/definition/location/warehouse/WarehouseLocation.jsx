import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { DropDown, Notify, RadioGroup, Span } from 'susam-components/basic';
import { Grid, GridCell } from "susam-components/layout";
import { KartoteksService } from '../../../services';
import { CustomsService } from "../../../services/LocationService";
import { PlaceLocation } from '../place/PlaceLocation';




export class WarehouseLocation extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
        }

        this.WAREHOUSE_OWNER_TYPE_EKOL = "EKOL_WAREHOUSE";
        this.WAREHOUSE_OWNER_TYPE_PARTNER = "PARTNER_WAREHOUSE";
        this.WAREHOUSE_OWNER_TYPE_OTHERS = "OTHERS";
    }

    componentDidMount() {
    }

    componentWillReceiveProps(nextProps) {
    }

    handleCompanySelection(value) {
        let place = this.props.place;

        place._company = value;
        this.props.handleSave(place);

    }

    handleLocationSelection(value) {
        let place = this.props.place;

        if (!value) {
            place.companyLocation = null;
            this.props.handleSave(place);
        } else {
            CustomsService.getByLocationId(value.id).then(response=>{
                if (response.data && response.data.id) {
                    Notify.showError("Location is already defined as Cross-dock or General Location");
                    place.companyLocation = null;
                    this.props.handleSave(place);
                } else  {
                    if (!place.establishment) {
                        place.establishment = {address: {}};
                    }
                    if (!place.location) {
                        place.location = {};
                    }
                    place.companyLocation = {id: value.id, name: value.name};
                    place.company = value.company;

                    place.name = value.name;
                    place.localName = value.name;

                    place.establishment.address.streetAddress = value.postaladdress.formattedAddress;
                    place.establishment.address.country = value.postaladdress.country;
                    place.establishment.address.postalCode = value.postaladdress.postalCode;
                    place.location.pointOnMap = value.postaladdress.pointOnMap;
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

    handlePartnerCompanySelect(partnerCompany) {
        let place = this.props.place;
        place._partnerCompany = partnerCompany;
        this.props.handleSave(place)
        this.loadCompanyLocations(partnerCompany.id);

    }

    loadCompanyLocations(companyId) {
        KartoteksService.retrieveCompanyLocations(companyId).then(response => {
            this.setState({partnerCompanyLocations: response.data});
        }).catch((error) => {
            Notify.showError(error);
        });
    }

    next() {
        let place = this.props.place;
        if(!place.warehouseOwnerType) {
            Notify.showError("Warehouse Owner Type should be selected first.");
            reject();
        }else if(!place.companyLocation) {
            Notify.showError("Company Location should be selected first.");
            reject();
        } else {
            return this.placeLocation.next();
        }
    }

    updateState(field, value) {
        let data = this.props.place;
        data[field] = value;
        this.props.handleSave(data);
    }

    renderLocationComponent() {

        if(this.props.place.companyLocation) {
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


    renderWarehouseSelectionContent() {
        if (!this.props.place.warehouseOwnerType) {
            return null;
        }

        if(this.props.place && this.props.place.id) {
            return (
                <Span label="Location" value={this.props.place.companyLocation ? this.props.place.companyLocation.name : ""}/>
            )
        }

        let content = null;
        if (this.props.place.warehouseOwnerType.id == this.WAREHOUSE_OWNER_TYPE_EKOL) {
            content = this.renderEkolOptions();
        } else if (this.props.place.warehouseOwnerType.id == this.WAREHOUSE_OWNER_TYPE_PARTNER) {
            content = this.renderPartnerOptions();
        } else if (this.props.place.warehouseOwnerType.id == this.WAREHOUSE_OWNER_TYPE_OTHERS) {
            content = this.renderOtherOptions();
        }

        return (
            <Grid>
                <GridCell width="4-5">
                    {content}
                </GridCell>
            </Grid>
        );
    }

    renderEkolOptions() {
        return (
            <Grid>
                <GridCell width="1-2" noMargin={true}>
                    <DropDown label="Warehouse" options={this.props.lookup.ekolLocation}
                              value={this.props.place.companyLocation} required = {true}
                              onchange={(value) => this.handleLocationSelection(value)}/>
                </GridCell>
            </Grid>
        );
    }

    renderPartnerOptions() {
        let companySelectionElem =
            <GridCell width="1-2" noMargin={true}>
                <DropDown label="Partner Company" options={this.props.lookup.partnerCompany}
                          value={this.props.place._partnerCompany} required = {true}
                          onchange={(value) => this.handlePartnerCompanySelect(value)}/>
            </GridCell>

        let locationSelectionElem = null;

        if(this.state.partnerCompanyLocations) {
            locationSelectionElem =
                <GridCell width="1-2" noMargin={true}>
                    <DropDown label="Location" options={this.state.partnerCompanyLocations}
                              value={this.props.place.companyLocation} required = {true}
                              onchange={(value) => this.handleLocationSelection(value)}/>
                </GridCell>
        }

        return (
            <Grid>
                {companySelectionElem}
                {locationSelectionElem}
            </Grid>
        );
    }

    renderOtherOptions() {
        return (
            <Grid>
                <GridCell width="1-1" noMargin={true}>
                    Other selection -> Warehouse selection
                </GridCell>
            </Grid>
        );
    }

    renderOwnerType() {

        if(this.props.place && this.props.place.id) {
            return (
                <Span label="Owner Type" value={this.props.place.warehouseOwnerType ? this.props.place.warehouseOwnerType.name : ""}/>
            )
        }

        return (
            <RadioGroup required = {true}
                    options={this.props.lookup.warehouseOwnerType}
                    value={this.props.place.warehouseOwnerType}
                    onchange={(value) => { this.updateState("warehouseOwnerType", value) }}>
            </RadioGroup>
        )
    }


    render() {

        let place = this.props.place;
        let lookup = this.props.lookup;

        if(!place || !lookup) {
            return null;
        }

        return (
            <Grid>
                <GridCell>
                    <Grid>
                        <GridCell width="1-5">
                            {this.renderOwnerType()}
                        </GridCell>
                        <GridCell width="4-5">
                            {this.renderWarehouseSelectionContent()}
                        </GridCell>
                    </Grid>
                </GridCell>
                <GridCell>
                    {this.renderLocationComponent()}
                </GridCell>
            </Grid>

        );
    }
}