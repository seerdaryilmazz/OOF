import _ from 'lodash';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { DropDown, Notify, RadioGroup } from 'susam-components/basic';
import { Grid, GridCell, Modal } from 'susam-components/layout';
import { CompanySearchAutoComplete } from 'susam-components/oneorder';
import { Kartoteks, WarehouseService } from '../services';



const LOCATION_SELECTION_MODE_SAME_COMPANY = {id: 1, name: "Location Of Same Company"};
const LOCATION_SELECTION_MODE_ANOTHER_COMPANY = {id: 2, name: "Location Of Another Company"};
const LOCATION_SELECTION_MODE_WAREHOUSE = {id: 3, name: "Cross Dock"};

// Domain entity olan SenderOrReceiver'a denk geliyor.
export class ParticipantSelector extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            originalParticipant: null,
            company: null,
            companyContact: null,
            locationOwnerCompany: null,
            location: null,
            locationContact: null,
            locationIsAWarehouse: null,
            warehouse: null,
            locationSelectionMode: null,
            companyContacts: []
        };
        this.locationSelectionModes = [
            LOCATION_SELECTION_MODE_SAME_COMPANY,
            LOCATION_SELECTION_MODE_ANOTHER_COMPANY,
            LOCATION_SELECTION_MODE_WAREHOUSE
        ];
    }

    componentDidMount() {
    }

    componentWillReceiveProps(nextProps) {
    }

    open(participant, projectParticipantData) {
        let isCreation;
        let participantCopy;
        if (participant) {
            isCreation = false;
            participantCopy = _.cloneDeep(participant);
        } else {
            isCreation = true;
            participantCopy = {};
        }
        this.prepareState(isCreation, participantCopy);
        this.modal.open();
    }

    close() {
        this.modal.close();
    }

    prepareState(isCreation, participant) {

        let originalParticipant = participant;
        let company = participant.company;
        let companyContact = participant.companyContact;
        let locationOwnerCompany = participant.locationOwnerCompany;
        let location = participant.location;
        let locationContact = participant.locationContact;
        let locationIsAWarehouse = participant.locationIsAWarehouse;
        let warehouse = participant.warehouse;
        let locationSelectionMode;

        if (isCreation) {
            locationSelectionMode = LOCATION_SELECTION_MODE_SAME_COMPANY;
        } else {
            if (locationIsAWarehouse) {
                locationSelectionMode = LOCATION_SELECTION_MODE_WAREHOUSE;
            } else {
                if (company.id == locationOwnerCompany.id) {
                    locationSelectionMode = LOCATION_SELECTION_MODE_SAME_COMPANY;
                } else {
                    locationSelectionMode = LOCATION_SELECTION_MODE_ANOTHER_COMPANY;
                }
            }
        }

        let callback = (companyContacts) => {
            this.setState({
                originalParticipant: originalParticipant,
                company: company,
                companyContact: companyContact ? companyContact : (companyContacts.length == 1 ? companyContacts[0] : null),
                locationOwnerCompany: locationOwnerCompany,
                location: location,
                locationContact: locationContact,
                locationIsAWarehouse: locationIsAWarehouse,
                warehouse: warehouse,
                locationSelectionMode: locationSelectionMode,
                companyContacts: companyContacts
            });
        };

        if (isCreation) {
            callback([]);
        } else {
            this.loadCompanyContacts(company.id, callback);
        }
    }

    loadCompanyContacts(companyId, callback) {
        Kartoteks.getCompanyContacts(companyId).then((response) => {
            callback(_.sortBy(response.data, ["fullname"]));
        }).catch((error) => {
            Notify.showError(error);
        });
    }

    updateCompany(value) {

        let locationSelectionMode = this.state.locationSelectionMode;

        if (value) {

            if (locationSelectionMode.id == LOCATION_SELECTION_MODE_SAME_COMPANY.id) {

                let company = _.cloneDeep(value);

                let callback = (companyContacts) => {
                    this.setState({
                        company: company,
                        companyContact: companyContacts.length == 1 ? companyContacts[0] : null,
                        locationOwnerCompany: company,
                        location: null,
                        locationContact: null,
                        companyContacts: companyContacts
                    });
                };

                this.loadCompanyContacts(company.id, callback);

            } else {

                let company = _.cloneDeep(value);

                let callback = (companyContacts) => {
                    this.setState({
                        company: company,
                        companyContact: companyContacts.length == 1 ? companyContacts[0] : null,
                        companyContacts: companyContacts
                    });
                };

                this.loadCompanyContacts(company.id, callback);
            }

        } else {
            if (locationSelectionMode.id == LOCATION_SELECTION_MODE_SAME_COMPANY.id) {
                this.setState({
                    company: null,
                    companyContact: null,
                    locationOwnerCompany: null,
                    location: null,
                    locationContact: null,
                    companyContacts: []
                });
            } else {
                this.setState({
                    company: null,
                    companyContact: null,
                    companyContacts: []
                });
            }
        }
    }

    updateCompanyContact(value) {
        this.setState({companyContact: _.cloneDeep(value)});
    }

    updateLocationSelectionMode(value) {
        if (value.id == LOCATION_SELECTION_MODE_SAME_COMPANY.id) {
            this.setState({
                locationOwnerCompany: this.state.company ? _.cloneDeep(this.state.company) : null,
                location: null,
                locationContact: null,
                warehouse: null,
                locationSelectionMode: value
            });
        } else {
            this.setState({
                locationOwnerCompany: null,
                location: null,
                locationContact: null,
                warehouse: null,
                locationSelectionMode: value
            });
        }
    }

    handleSave() {

        let goon = true;
        let company = this.state.company ? _.cloneDeep(this.state.company) : null;
        let companyContact = this.state.companyContact ? _.cloneDeep(this.state.companyContact) : null;
        let locationSelectionMode = this.state.locationSelectionMode;

        if (!company || !companyContact) {
            goon = false;
            Notify.showError("Please fill all fields before saving.");
        }

        if (goon) {

            let locationOwnerCompany = null;
            let location = null;
            let locationContact = null;
            let locationIsAWarehouse = false;
            let warehouse = null;
            let updatedData = this.locationSelectionComponent.getUpdatedData();

            if (locationSelectionMode.id == LOCATION_SELECTION_MODE_SAME_COMPANY.id) {

                locationOwnerCompany = _.cloneDeep(this.state.locationOwnerCompany);
                location = updatedData.location;
                locationContact = updatedData.locationContact;

                if (!location || !locationContact) {
                    goon = false;
                    Notify.showError("Please fill all fields before saving.");
                }

            } else if (locationSelectionMode.id == LOCATION_SELECTION_MODE_ANOTHER_COMPANY.id) {

                locationOwnerCompany = updatedData.locationOwnerCompany;
                location = updatedData.location;
                locationContact = updatedData.locationContact;

                if (!locationOwnerCompany || !location || !locationContact) {
                    goon = false;
                    Notify.showError("Please fill all fields before saving.");
                }

            } else if (locationSelectionMode.id == LOCATION_SELECTION_MODE_WAREHOUSE.id) {

                locationOwnerCompany = updatedData.locationOwnerCompany;
                location = updatedData.location;
                locationContact = updatedData.locationContact;
                locationIsAWarehouse = true;
                warehouse = updatedData.warehouse;

                if (!warehouse || !locationContact) {
                    goon = false;
                    Notify.showError("Please fill all fields before saving.");
                }
            }

            if (goon) {

                let originalParticipant = _.cloneDeep(this.state.originalParticipant);

                originalParticipant.companyId = company.id;
                originalParticipant.company = company;

                originalParticipant.companyContactId = companyContact.id;
                originalParticipant.companyContact = companyContact;

                originalParticipant.locationOwnerCompanyId = locationOwnerCompany.id;
                originalParticipant.locationOwnerCompany = locationOwnerCompany;

                originalParticipant.locationId = location.id;
                originalParticipant.location = location;

                originalParticipant.locationContactId = locationContact.id;
                originalParticipant.locationContact = locationContact;

                originalParticipant.locationIsAWarehouse = locationIsAWarehouse;
                originalParticipant.warehouse = warehouse;

                this.props.onsave(originalParticipant);
                this.close();
            }
        }
    }

    renderLocationSelection() {

        let locationSelectionMode = this.state.locationSelectionMode;

        if (locationSelectionMode) {
            if (locationSelectionMode.id == LOCATION_SELECTION_MODE_SAME_COMPANY.id) {
                return (
                    <LocationSelectionForModeSameCompany ref={(c) => this.locationSelectionComponent = c}
                                                         locationOwnerCompany={this.state.locationOwnerCompany}
                                                         location={this.state.location}
                                                         locationContact={this.state.locationContact}/>
                );
            } else if (locationSelectionMode.id == LOCATION_SELECTION_MODE_ANOTHER_COMPANY.id) {
                return (
                    <LocationSelectionForModeAnotherCompany ref={(c) => this.locationSelectionComponent = c}
                                                            locationOwnerCompany={this.state.locationOwnerCompany}
                                                            location={this.state.location}
                                                            locationContact={this.state.locationContact}/>
                );
            } if (locationSelectionMode.id == LOCATION_SELECTION_MODE_WAREHOUSE.id) {
                return (
                    <LocationSelectionForModeWarehouse ref={(c) => this.locationSelectionComponent = c}
                                                       warehouse={this.state.warehouse}
                                                       locationContact={this.state.locationContact}/>
                );
            }
        } else  {
            return null;
        }
    }

    render() {
        return (
            <Modal ref={(c) => this.modal = c}
                   large={true}
                   title={this.props.title}
                   actions={[
                       {label: "Close", action: () => this.close()},
                       {label: "Save", buttonStyle: "primary", action: () => this.handleSave()}
                   ]}>
                <Grid>
                    <GridCell width="1-1" noMargin={true}>
                        <Grid>
                            <GridCell width="3-5" noMargin={true}>
                                <CompanySearchAutoComplete label="Company"
                                                           required={true}
                                                           value={this.state.company}
                                                           onchange={(value) => this.updateCompany(value)}
                                                           onclear={() => this.updateCompany(null)}/>
                            </GridCell>
                            <GridCell width="2-5" noMargin={true}>
                                <DropDown label="Contact Person"
                                          required={true}
                                          value={this.state.companyContact}
                                          onchange={(value) => this.updateCompanyContact(value)}
                                          labelField="fullname"
                                          emptyText="No contacts"
                                          options={this.state.companyContacts}/>
                            </GridCell>
                        </Grid>
                    </GridCell>
                    <GridCell width="1-1">
                        <RadioGroup value={this.state.locationSelectionMode}
                                    onchange={(value) => this.updateLocationSelectionMode(value)}
                                    options={this.locationSelectionModes}/>
                    </GridCell>
                    <GridCell width="1-1">
                        {this.renderLocationSelection()}
                    </GridCell>
                </Grid>
            </Modal>
        );
    }
}

export class LocationSelectionForModeSameCompany extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            location: null,
            locationContact: null,
            locations: [],
            locationContacts: []
        };
    }

    componentDidMount() {
        this.init(this.props.locationOwnerCompany, this.props.location, this.props.locationContact);
    }

    componentWillReceiveProps(nextProps) {
        if (!_.isEqual(this.props.locationOwnerCompany, nextProps.locationOwnerCompany)
            || !_.isEqual(this.props.location, nextProps.location)
            || !_.isEqual(this.props.locationContact, nextProps.locationContact)) {
            this.init(nextProps.locationOwnerCompany, nextProps.location, nextProps.locationContact);
        }
    }

    init(locationOwnerCompany, location, locationContact) {
        if (locationOwnerCompany) {
            let callback1 = (locations) => {
                this.setState({
                    location: location ? _.cloneDeep(location) : (locations.length == 1 ? locations[0] : null),
                    locations: locations
                });
            };
            let callback2 = (locationContacts) => {
                this.setState({
                    locationContact: locationContact ? _.cloneDeep(locationContact) : (locationContacts.length == 1 ? locationContacts[0] : null),
                    locationContacts: locationContacts
                });
            };
            this.loadLocations(locationOwnerCompany.id, callback1);
            this.loadLocationContacts(locationOwnerCompany.id, callback2);
        } else {
            this.setState({
                location: null,
                locationContact: null,
                locations: [],
                locationContacts: []
            });
        }
    }

    loadLocations(locationOwnerCompanyId, callback) {
        Kartoteks.getCompanyLocations(locationOwnerCompanyId).then((response) => {
            callback(_.sortBy(response.data, ["name"]));
        }).catch((error) => {
            Notify.showError(error);
        });
    }

    loadLocationContacts(locationOwnerCompanyId, callback) {
        Kartoteks.getCompanyContacts(locationOwnerCompanyId).then((response) => {
            callback(_.sortBy(response.data, ["fullname"]));
        }).catch((error) => {
            Notify.showError(error);
        });
    }

    updateLocation(value) {
        this.setState({location: _.cloneDeep(value)});
    }

    updateLocationContact(value) {
        this.setState({locationContact: _.cloneDeep(value)});
    }

    getUpdatedData() {
        let location = this.state.location ? _.cloneDeep(this.state.location) : null;
        let locationContact = this.state.locationContact ? _.cloneDeep(this.state.locationContact) : null;
        return {
            location: location,
            locationContact: locationContact
        };
    }

    render() {
        return (
            <Grid>
                <GridCell width="2-5" noMargin={true}>
                    <DropDown label="Location"
                              required={true}
                              value={this.state.location}
                              onchange={(value) => this.updateLocation(value)}
                              emptyText="No locations"
                              options={this.state.locations}/>
                </GridCell>
                <GridCell width="1-5" noMargin={true}>
                    <DropDown label="Contact Person"
                              required={true}
                              value={this.state.locationContact}
                              onchange={(value) => this.updateLocationContact(value)}
                              labelField="fullname"
                              emptyText="No contacts"
                              options={this.state.locationContacts}/>
                </GridCell>
                <GridCell width="1-1">
                    <span className="uk-text-small uk-text-muted">
                        {this.state.location ? this.state.location.postaladdress.formattedAddress : ""}
                    </span>
                </GridCell>
            </Grid>
        );
    }
}

export class LocationSelectionForModeAnotherCompany extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            locationOwnerCompany: null,
            location: null,
            locationContact: null,
            locations: [],
            locationContacts: []
        };
    }

    componentDidMount() {
        this.init(this.props.locationOwnerCompany, this.props.location, this.props.locationContact);
    }

    componentWillReceiveProps(nextProps) {
        if (!_.isEqual(this.props.locationOwnerCompany, nextProps.locationOwnerCompany)
            || !_.isEqual(this.props.location, nextProps.location)
            || !_.isEqual(this.props.locationContact, nextProps.locationContact)) {
            this.init(nextProps.locationOwnerCompany, nextProps.location, nextProps.locationContact);
        }
    }

    init(locationOwnerCompany, location, locationContact) {
        if (locationOwnerCompany) {
            this.setState({
                locationOwnerCompany: _.cloneDeep(locationOwnerCompany)
            });
            let callback1 = (locations) => {
                this.setState({
                    location: location ? _.cloneDeep(location) : (locations.length == 1 ? locations[0] : null),
                    locations: locations
                });
            };
            let callback2 = (locationContacts) => {
                this.setState({
                    locationContact: locationContact ? _.cloneDeep(locationContact) : (locationContacts.length == 1 ? locationContacts[0] : null),
                    locationContacts: locationContacts
                });
            };
            this.loadLocations(locationOwnerCompany.id, callback1);
            this.loadLocationContacts(locationOwnerCompany.id, callback2);
        } else {
            this.setState({
                locationOwnerCompany: null,
                location: null,
                locationContact: null,
                locations: [],
                locationContacts: []
            });
        }
    }

    loadLocations(locationOwnerCompanyId, callback) {
        Kartoteks.getCompanyLocations(locationOwnerCompanyId).then((response) => {
            callback(_.sortBy(response.data, ["name"]));
        }).catch((error) => {
            Notify.showError(error);
        });
    }

    loadLocationContacts(locationOwnerCompanyId, callback) {
        Kartoteks.getCompanyContacts(locationOwnerCompanyId).then((response) => {
            callback(_.sortBy(response.data, ["fullname"]));
        }).catch((error) => {
            Notify.showError(error);
        });
    }

    updateLocationOwnerCompany(value) {
        let locationOwnerCompany = value;
        if (locationOwnerCompany) {
            this.setState({
                locationOwnerCompany: _.cloneDeep(locationOwnerCompany)
            });
            let callback1 = (locations) => {
                this.setState({
                    location: locations.length == 1 ? locations[0] : null,
                    locations: locations
                });
            };
            let callback2 = (locationContacts) => {
                this.setState({
                    locationContact: locationContacts.length == 1 ? locationContacts[0] : null,
                    locationContacts: locationContacts
                });
            };
            this.loadLocations(locationOwnerCompany.id, callback1);
            this.loadLocationContacts(locationOwnerCompany.id, callback2);
        } else {
            this.setState({
                locationOwnerCompany: null,
                location: null,
                locationContact: null,
                locations: [],
                locationContacts: []
            });
        }
    }

    updateLocation(value) {
        this.setState({location: _.cloneDeep(value)});
    }

    updateLocationContact(value) {
        this.setState({locationContact: _.cloneDeep(value)});
    }

    getUpdatedData() {
        let locationOwnerCompany = this.state.locationOwnerCompany ? _.cloneDeep(this.state.locationOwnerCompany) : null;
        let location = this.state.location ? _.cloneDeep(this.state.location) : null;
        let locationContact = this.state.locationContact ? _.cloneDeep(this.state.locationContact) : null;
        return {
            locationOwnerCompany: locationOwnerCompany,
            location: location,
            locationContact: locationContact
        };
    }

    render() {
        return (
            <Grid>
                <GridCell width="2-5" noMargin={true}>
                    <CompanySearchAutoComplete label="Another Company"
                                               required={true}
                                               value={this.state.locationOwnerCompany}
                                               onchange={(value) => this.updateLocationOwnerCompany(value)}
                                               onclear={() => this.updateLocationOwnerCompany(null)}/>
                </GridCell>
                <GridCell width="2-5" noMargin={true}>
                    <DropDown label="Location"
                              required={true}
                              value={this.state.location}
                              onchange={(value) => this.updateLocation(value)}
                              emptyText="No locations"
                              options={this.state.locations}/>
                </GridCell>
                <GridCell width="1-5" noMargin={true}>
                    <DropDown label="Contact Person"
                              required={true}
                              value={this.state.locationContact}
                              onchange={(value) => this.updateLocationContact(value)}
                              labelField="fullname"
                              emptyText="No contacts"
                              options={this.state.locationContacts}/>
                </GridCell>
                <GridCell width="1-1">
                    <span className="uk-text-small uk-text-muted">
                        {this.state.location ? this.state.location.postaladdress.formattedAddress : ""}
                    </span>
                </GridCell>
            </Grid>
        );
    }
}

export class LocationSelectionForModeWarehouse extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            locationOwnerCompany: null,
            location: null,
            warehouse: null,
            locationContact: null,
            warehouses: [],
            locationContacts: []
        };
    }

    componentDidMount() {
        this.loadWarehouses();
        this.init(this.props.warehouse, this.props.locationContact);
    }

    componentWillReceiveProps(nextProps) {
        if (!_.isEqual(this.props.warehouse, nextProps.warehouse)
            || !_.isEqual(this.props.locationContact, nextProps.locationContact)) {
            this.init(nextProps.warehouse, nextProps.locationContact);
        }
    }

    init(warehouse, locationContact) {
        if (warehouse) {
            this.setState({
                warehouse: _.cloneDeep(warehouse)
            });
            let callback = (locationOwnerCompany, location, locationContacts) => {
                this.setState({
                    locationOwnerCompany: locationOwnerCompany,
                    location: location,
                    locationContact: locationContact ? _.cloneDeep(locationContact) : (locationContacts.length == 1 ? locationContacts[0] : null),
                    locationContacts: locationContacts
                });
            };
            this.loadWarehouseDependentData(warehouse.id, callback);
        } else {
            this.setState({
                locationOwnerCompany: null,
                location: null,
                warehouse: null,
                locationContact: null,
                locationContacts: []
            });
        }
    }

    loadWarehouses() {
        WarehouseService.retrieveWarehouses().then((response) => {
            this.setState({warehouses: _.sortBy(response.data, ["name"])});
        }).catch((error) => {
            Notify.showError(error);
        });
    }

    loadWarehouseDependentData(warehouseId, callback) {

        let locationOwnerCompany = null;
        let location = null;

        WarehouseService.getWarehouse(warehouseId).then((response) => {

            let warehouse = response.data;

            Kartoteks.getCompanyByLocation(warehouse.companyLocation.id).then((response2) => {

                Kartoteks.getCompanyLocation(warehouse.companyLocation.id).then((response3) => {

                    locationOwnerCompany = response2.data;
                    location = response3.data;

                    let callbackInner = (locationContacts) => {
                        callback(locationOwnerCompany, location, locationContacts);
                    };

                    this.loadLocationContacts(locationOwnerCompany.id, callbackInner);

                }).catch((error) => {
                    Notify.showError(error);
                });

            }).catch((error) => {
                Notify.showError(error);
            });

        }).catch((error) => {
            Notify.showError(error);
        });
    }

    loadLocationContacts(locationOwnerCompanyId, callback) {
        Kartoteks.getCompanyContacts(locationOwnerCompanyId).then((response) => {
            callback(_.sortBy(response.data, ["fullname"]));
        }).catch((error) => {
            Notify.showError(error);
        });
    }

    updateWarehouse(value) {
        let warehouse = value;
        if (warehouse) {
            this.setState({
                warehouse: _.cloneDeep(warehouse)
            });
            let callback = (locationOwnerCompany, location, locationContacts) => {
                this.setState({
                    locationOwnerCompany: locationOwnerCompany,
                    location: location,
                    locationContact: locationContacts.length == 1 ? locationContacts[0] : null,
                    locationContacts: locationContacts
                });
            };
            this.loadWarehouseDependentData(warehouse.id, callback);
        } else {
            this.setState({
                locationOwnerCompany: null,
                location: null,
                warehouse: null,
                locationContact: null,
                locationContacts: []
            });
        }
    }

    updateLocationContact(value) {
        this.setState({locationContact: _.cloneDeep(value)});
    }

    getUpdatedData() {
        let locationOwnerCompany = this.state.locationOwnerCompany ? _.cloneDeep(this.state.locationOwnerCompany) : null;
        let location = this.state.location ? _.cloneDeep(this.state.location) : null;
        let warehouse = this.state.warehouse ? _.cloneDeep(this.state.warehouse) : null;
        let locationContact = this.state.locationContact ? _.cloneDeep(this.state.locationContact) : null;
        return {
            locationOwnerCompany: locationOwnerCompany,
            location: location,
            warehouse: warehouse,
            locationContact: locationContact
        };
    }

    render() {
        return (
            <Grid>
                <GridCell width="2-5" noMargin={true}>
                    <DropDown label="Cross Dock"
                              required={true}
                              value={this.state.warehouse}
                              onchange={(value) => this.updateWarehouse(value)}
                              emptyText="No cross docks"
                              options={this.state.warehouses}/>
                </GridCell>
                <GridCell width="1-5" noMargin={true}>
                    <DropDown label="Contact Person"
                              required={true}
                              value={this.state.locationContact}
                              onchange={(value) => this.updateLocationContact(value)}
                              labelField="fullname"
                              emptyText="No contacts"
                              options={this.state.locationContacts}/>
                </GridCell>
                <GridCell width="1-1">
                    <span className="uk-text-small uk-text-muted">
                        {this.state.location ? this.state.location.postaladdress.formattedAddress : ""}
                    </span>
                </GridCell>
            </Grid>
        );
    }
}