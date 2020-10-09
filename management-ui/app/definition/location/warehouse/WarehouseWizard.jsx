import React from "react";
import _ from "lodash";
import uuid from "uuid";
import * as axios from 'axios';


import {TranslatingComponent} from 'susam-components/abstract';
import {Page, Card, Grid, GridCell, PageHeader, CardHeader, Loader, Wizard} from "susam-components/layout";
import {Notify, TextInput, Button, DropDown, Checkbox, CheckboxGroup, Span, Form} from 'susam-components/basic';
import {Chip, WorkingHour} from 'susam-components/advanced';

import {WorkingHours} from '../place/WorkingHours';

import {WarehouseService, KartoteksService, CommonService} from '../../../services';

import {WarehouseLocation} from './WarehouseLocation';
import {WarehouseGeneralDefinition} from './WarehouseGeneralDefinition';
import {WarehouseRampAndZoneDefinition} from './WarehouseRampAndZoneDefinition';
import {CustomerWarehouseService, CustomsOfficeService} from "../../../services/LocationService";

export class WarehouseWizard extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {lookup:{}};
        this.steps = [
            {
                title: "Location",
                onNextClick: () => {
                    return this.locationStep.next()
                },
                prevButtonLabel: "Cancel",
                onPrevClick: () => {
                    this.handleCancelClick()
                }
            },
            {
                title: "Working Hours",
                onNextClick: () => {
                    return this.workingHoursStep.next()
                }
            },
            {
                title: "General Definition",
                onNextClick: () => {
                    return this.generalDefinitionStep.next()
                }
            },
            {
                title: "Dock/Zone Definition",
                onNextClick: () => {
                    return this.rampAndZoneDefinitionStep.next()
                },
                nextButtonLabel: "Save"

            }];
    }

    componentDidMount() {
        this.initializeState(this.props);
    }

    initializeState(props) {

        if (props.location.query && props.location.query.id) {
            this.loadWarehouse(props.location.query.id);
        } else {
            let state = _.cloneDeep(this.state);
            state.place = this.initializePlace();
            this.setState(state);
        }

        axios.all([
            KartoteksService.getEkolLocations(),
            WarehouseService.getWarehouseOwnerTypes(),
            KartoteksService.retrievePartnerCompanies(),
            CommonService.retrieveWarehouseZoneTypes(),
            CommonService.retrieveWarehouseRampProperties(),
            CommonService.retrieveWarehouseRampUsageTypes(),
            CommonService.retrieveWarehouseRampOperationTypes(),
            CustomerWarehouseService.listCustomsTypesForCompanies(),
            CustomsOfficeService.list()
        ]).then(axios.spread((ekolLocations, warehouseOwnerTypes, partnerCompanies, warehouseZoneTypes,
                              warehouseRampProperties, warehouseRampUsageTypes, warehouseRampOperationTypes,
                              customsTypes, customsOffices) => {
            let state = _.cloneDeep(this.state);
            state.lookup.ekolLocation = ekolLocations.data;
            state.lookup.warehouseOwnerType = warehouseOwnerTypes.data;
            state.lookup.partnerCompany = partnerCompanies.data.map(company => {
                return {id: company.id, name: company.name}
            });
            state.lookup.warehouseZoneType = warehouseZoneTypes.data;
            state.lookup.warehouseRampProperty = warehouseRampProperties.data;
            state.lookup.warehouseRampUsageType = warehouseRampUsageTypes.data;
            state.lookup.warehouseRampOperationType = warehouseRampOperationTypes.data;
            state.lookup.customsTypes = _.filter(customsTypes.data, item => {
                return item.id !== "CUSTOMER_CUSTOMS_WAREHOUSE" && item.id !== "CUSTOMS_CLEARANCE_PARK";
            });
            state.lookup.customsOffices = customsOffices.data;
            state.contentReady = true;
            this.setState(state);
        })).catch((error) => {
            Notify.showError("An Error Occured", error);
            console.log("Error:" + error);
        });

    }

    initializePlace() {
        return (
            {
                active: true,
                location: {},
                establishment: {
                    address: {},
                    workingHours: [],
                    phoneNumbers: []
                },
                assets: []
            }
        );
    }


    handleCancelClick() {
        this.props.onCancel ? this.props.onCancel() : this.context.router.push('/ui/management/warehouse-list');
    }

    loadWarehouse(id) {
        WarehouseService.get(id).then(response => {
            let state = _.cloneDeep(this.state);
            state.place = response.data;
            this.setState(state);
        }).catch(error => {
            Notify.showError(error);
        })
    }

    updateLocation(location) {
        this.setState({place: location});
    }

    updateWorkingHours(workingHours) {
        let place = _.cloneDeep(this.state.place);
        place.establishment.workingHours = workingHours;
        this.setState({place: place});
    }

    updateGeneralDefinition(warehouse) {
        this.setState({place: warehouse});
    }

    updateRampAndZoneDefinition(warehouse) {
        let place = _.cloneDeep(this.state.place);
        place.rampGroup = warehouse.rampGroup;
        place.zone = warehouse.zone;

        return new Promise(
            (resolve, reject) => {
                if(!place.id) {
                    WarehouseService.validateWarehouseRamps(place).then((response1) => {
                        WarehouseService.validateWarehouseZones(place).then((response) => {
                            this.setState({place: place}, () => this.saveWarehouse());
                            resolve(true);
                            return;
                        }).catch((e) => {
                            Notify.showError(e);
                            return reject();
                        })
                    }).catch((e) => {
                        Notify.showError(e);
                        return reject();
                    })
                } else {
                    WarehouseService.listRampsToBeRemoved(place).then((response) => {
                        if (response.data.length > 0) {
                            Notify.confirm("If warehouse is saved, Following ramps will be deleted: " + response.data.join(",") + ". Are you sure?", () => {
                                WarehouseService.validateWarehouseRamps(place).then((response1) => {
                                    WarehouseService.validateWarehouseZones(place).then((response) => {
                                        this.setState({place: place}, () => this.saveWarehouse());
                                        resolve(true);
                                        return;
                                    }).catch((e) => {
                                        Notify.showError(e);
                                        return reject();
                                    })
                                }).catch((e) => {
                                    Notify.showError(e);
                                    return reject();
                                })
                            })
                        } else {
                            WarehouseService.validateWarehouseRamps(place).then((response) => {
                                WarehouseService.validateWarehouseZones(place).then((response) => {
                                    this.setState({place: place}, () => this.saveWarehouse());
                                    resolve(true);
                                    return;
                                }).catch((e) => {
                                    Notify.showError(e);
                                    return reject();
                                })
                            }).catch((e) => {
                                Notify.showError(e);
                                return reject();
                            })
                        }
                    }).catch((e) => {
                        Notify.showError(e);
                        return reject();
                    })
                }

            }
        );
    }

    updateZoneDefinition(zone) {
        let place = _.cloneDeep(this.state.place);
        place.zone = zone;

        return new Promise(
            (resolve, reject) => {
                WarehouseService.validateWarehouseZones(place).then((response) => {
                    this.setState({place: place}, () => this.saveWarehouse());
                    resolve(true);
                    return;
                }).catch((e) => {
                    Notify.showError(e);
                    return reject();
                })
            }
        );
    }

    saveWarehouse() {
        console.log("saveWarehouse", this.state.place);
        WarehouseService.save(this.state.place).then(response => {
            Notify.showSuccess("Customer Warehouse saved");
            this.props.onSuccess ? this.props.onSuccess(response.data) : this.context.router.push('/ui/management/warehouse-list');
        }).catch(error => {
            Notify.showError(error);
            this.props.onError && this.props.onError(error);
        })
    }

    render() {
        let place = this.state.place;
        if (!place) {
            return null;
        }
        let title = super.translate("New Warehouse");
        if (place.name) {
            title = place.name;
        }

        let lookup = this.state.lookup;

        return (
            <Page title = {title}>
                <Wizard steps={this.steps}>
                    <WarehouseLocation ref={(c) => this.locationStep = c}
                                       readOnly={true}
                                       lookup={lookup}
                                       place={place}
                                       handleSave={data => this.updateLocation(data)}/>
                    <WorkingHours ref={(c) => this.workingHoursStep = c}
                                  isRequired={false}
                                  workingHours={this.state.place.establishment.workingHours}
                                  handleSave={data => this.updateWorkingHours(data)}/>
                    <WarehouseGeneralDefinition ref={(c) => this.generalDefinitionStep = c}
                                                lookup={lookup}
                                                data={place}
                                                customsOffices = {lookup.customsOffices}
                                                customsTypes = {lookup.customsTypes}
                                                handleSave={data => this.updateGeneralDefinition(data)}
                    />
                    <WarehouseRampAndZoneDefinition ref={(c) => this.rampAndZoneDefinitionStep = c}
                                             lookup={lookup}
                                             data={place}
                                             handleSave={data => this.updateRampAndZoneDefinition(data)}
                    />
                </Wizard>
            </Page>
        );
    }

}

WarehouseWizard.contextTypes = {
    router: React.PropTypes.object.isRequired
};