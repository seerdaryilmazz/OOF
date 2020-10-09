import React from "react";
import {Zones} from "./Zones";
import {Zone} from "./Zone";
import {Grid, GridCell} from "susam-components/layout";
import {ZoneService} from "../services";
import {Notify} from "susam-components/basic";
import _ from "lodash";
import uuid from "uuid";

export class ZoneManagement extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            zones: null,
            selectedZone: null,
            zoneTypes: null,
            zoneTags: null,
            selectedZoneZipCode: {},
            countries: null,
            zoneZipCodeTypes: null,
            zoneLoading: false,
        }
    }

    componentWillMount() {
        this.loadZones();
        this.loadZoneTypes();
        this.loadZoneTags();
        this.loadCountries();
        this.loadZoneZipCodeTypes();
    }

    loadZones() {
        ZoneService.getZones().then(response => {
            this.setState({zones: response.data, selectedZone: null});
        }).catch(error => {
            Notify.showError(error);
        });
    }

    loadZoneTypes() {
        ZoneService.getZoneTypes().then(response => {
            this.setState({zoneTypes: response.data});
        }).catch(error => {
            Notify.showError(error);
        });
    }

    loadZone(id) {
        this.setState({selectedZone: null, zoneLoading: true}, () => {
            ZoneService.getZone(id).then(response => {
                this.setState({selectedZone: response.data, zoneLoading: false});
            }).catch(error => {
                Notify.showError(error);
            });
        });
    }

    onZoneSelected(zone) {
        this.loadZone(zone.id);
    }

    loadZoneTags() {
        ZoneService.getZoneTags().then(response => {
            this.setState({allTags: response.data ? response.data : []});
        }).catch(error => {
            this.setState({allTags: []});
            Notify.showError(error);
        });
    }

    loadCountries() {
        ZoneService.getCountries().then(response => {
            this.setState({countries: response.data});
        }).catch(error => {
            Notify.showError(error);
        });
    }

    loadZoneZipCodeTypes() {
        ZoneService.getZoneZipCodeTypes().then(response => {
            this.setState({zoneZipCodeTypes: response.data});
        }).catch(error => {
            Notify.showError(error);
        });
    }

    getSelectedZoneCopy() {
        let selectedZone = _.cloneDeep(this.state.selectedZone);
        _.assign(selectedZone, this._zone.getZone());
        return selectedZone;
    }

    getSelectedZoneZipCodeCopy() {
        let selectedZoneZipCode = _.cloneDeep(this.state.selectedZoneZipCode);
        _.assign(selectedZoneZipCode, this._zone.getZoneZipCode());
        return selectedZoneZipCode;
    }

    onSaveZoneZipCode() {
        if (!this.validateZoneZipCodesForm()) {
            return;
        }

        let selectedZone = this.getSelectedZoneCopy();
        let selectedZoneZipCode = this.getSelectedZoneZipCodeCopy();

        if (!selectedZoneZipCode.id && !selectedZoneZipCode.dummyId) {
            selectedZoneZipCode.dummyId = uuid.v4();
        }

        let found = false;

        for (let i = 0; i < selectedZone.zipCodes.length; i++) {
            let zipCode = selectedZone.zipCodes[i];

            if ((zipCode.dummyId && zipCode.dummyId == selectedZoneZipCode.dummyId)
                || (zipCode.id && zipCode.id == selectedZoneZipCode.id)) {
                this._zone.updateZoneZipCode(selectedZone.zipCodes[i], selectedZoneZipCode);
                selectedZone.zipCodes[i] = selectedZoneZipCode;
                found = true;
            }
        }

        if (!found) {
            this._zone.addZoneZipCode(selectedZoneZipCode);
            selectedZone.zipCodes.push(selectedZoneZipCode);
        }

        this.setState({selectedZone: selectedZone, selectedZoneZipCode: {}});
    }

    onEditZoneZipCode(values) {
        this.setState({selectedZoneZipCode: values});
    }

    onDeleteZoneZipCode(values) {
        this._zone.deleteZoneZipCode(values);

        let selectedZone = this.getSelectedZoneCopy();

        _.remove(selectedZone.zipCodes, zipCode => {
            return _.isEqual(zipCode, values);
        });

        this.setState({selectedZone: selectedZone});
    }

    onSaveZone() {
        if (!this.validateZoneForm()) {
            return;
        }

        let selectedZone = this.getSelectedZoneCopy();
        selectedZone.polygonRegions = this._zone.getPolygonData();

        ZoneService.saveZone(selectedZone).then(response => {
            this.setState({selectedZone: null, selectedZoneZipCode: {}});
            this.loadZones();
        }).catch(error => {
            Notify.showError(error);
        });
    }

    onDeleteZone() {
        UIkit.modal.confirm("Zone will be deleted. Are you sure?",
            () => {
                ZoneService.deleteZone(this.getSelectedZoneCopy().id).then(response => {
                    this.setState({selectedZone: null, selectedZoneZipCode: {}});
                    this.loadZones();
                }).catch(error => {
                    Notify.showError(error);
                });
            }
        );
    }

    onAddZone() {
        let selectedZone = {zipCodes: []};
        this.setState({selectedZone: selectedZone});
    }

    validateZoneForm() {
        return this._zone.validateZoneForm();
    }

    validateZoneZipCodesForm() {
        return this._zone.validateZoneZipCodesForm();
    }

    render() {
        return (
            <Grid>
                <GridCell noMargin="true" width="1-6">
                    <Zones zones={this.state.zones}
                           onZoneSelected={(values) => this.onZoneSelected(values)}
                           onAddZone={() => this.onAddZone()}/>
                </GridCell>
                <GridCell noMargin="true" width="5-6">
                    <Zone zone={this.state.selectedZone}
                          zoneTypes={this.state.zoneTypes}
                          zoneTags={this.state.zoneTags}
                          countries={this.state.countries}
                          zoneZipCode={this.state.selectedZoneZipCode}
                          zoneZipCodeTypes={this.state.zoneZipCodeTypes}
                          onSaveZoneZipCode={() => this.onSaveZoneZipCode()}
                          onEditZoneZipCode={(values) => this.onEditZoneZipCode(values)}
                          onDeleteZoneZipCode={(values) => this.onDeleteZoneZipCode(values)}
                          onSaveZone={() => this.onSaveZone()}
                          mergeSelectedZone={(zone) => this.mergeSelectedZone(zone)}
                          onDeleteZone={() => this.onDeleteZone()}
                          ref={(c) => this._zone = c}
                          zoneLoading={this.state.zoneLoading}/>
                </GridCell>
            </Grid>
        );
    }
}