import React from "react";
import {Card, Grid, GridCell, Loader} from "susam-components/layout";
import {ZoneForm} from "./ZoneForm";
import {ZoneMap} from "./ZoneMap";
import {ZoneZipCodes} from "./ZoneZipCodes";

export class Zone extends React.Component {

    constructor(props) {
        super(props);
    }

    onSaveZone() {
        this.props.onSaveZone();
    }

    onDeleteZone() {
        this.props.onDeleteZone();
    }

    onEditZoneZipCode(values) {
        this.props.onEditZoneZipCode(values);
    }

    onDeleteZoneZipCode(values) {
        this.props.onDeleteZoneZipCode(values);
    }

    onSaveZoneZipCode() {
        this.props.onSaveZoneZipCode();
    }

    getZone() {
        return this._zoneForm.getZone();
    }

    getZoneZipCode() {
        return this._zoneZipCodes.getZoneZipCode();
    }

    validateZoneForm() {
        return this._zoneForm.validateZoneForm();
    }

    validateZoneZipCodesForm() {
        return this._zoneZipCodes.validateZoneZipCodesForm();
    }

    onCountryChange(country) {
        if (this._zoneMap) {
            this._zoneMap.updateCountry(country);
        }
    }

    getPolygonData() {
        return this._zoneMap.getPolygonData();
    }

    addZoneZipCode(zoneZipCode) {
        this._zoneMap.addZoneZipCode(zoneZipCode);
    }

    updateZoneZipCode(oldZoneZipCode, newZoneZipCode) {
        this._zoneMap.updateZoneZipCode(oldZoneZipCode, newZoneZipCode);
    }

    deleteZoneZipCode(zoneZipCode) {
        this._zoneMap.deleteZoneZipCode(zoneZipCode);
    }

    render() {
        let display = this.props.zone ? true : false;

        let toolbarItems = [{icon: "save", action: () => this.onSaveZone()}];
        if (this.props.zone && this.props.zone.id) {
            toolbarItems.push({icon: "trash-o", action: () => this.onDeleteZone()});
        }

        return (
            <div>
                <div style={{display: (this.props.zoneLoading ? "block" : "none")}}>
                    <Loader />
                </div>
                <div style={{visibility: (display ? "visible" : "hidden")}}>
                    <Card title="Zone Details" toolbarItems={toolbarItems}>
                        <Grid>
                            <GridCell noMargin="true" width="1-1">
                                <ZoneForm zone={this.props.zone}
                                          zoneTypes={this.props.zoneTypes}
                                          zoneTags={this.props.zoneTags}
                                          ref={(c) => this._zoneForm = c}/>
                            </GridCell>
                            <GridCell width="4-6">
                                <ZoneMap zone={this.props.zone}
                                         ref={(c) => this._zoneMap = c}
                                         editable={true}/>
                            </GridCell>
                            <GridCell width="2-6">
                                <ZoneZipCodes onEditZoneZipCode={(values) => this.onEditZoneZipCode(values)}
                                              onDeleteZoneZipCode={(values) => this.onDeleteZoneZipCode(values)}
                                              onSaveZoneZipCode={() => this.onSaveZoneZipCode()}
                                              countries={this.props.countries}
                                              zoneZipCodeTypes={this.props.zoneZipCodeTypes}
                                              zoneZipCode={this.props.zoneZipCode}
                                              zone={this.props.zone}
                                              ref={(c) => this._zoneZipCodes = c}
                                              onCountryChange={(country) => this.onCountryChange(country)}/>
                            </GridCell>
                        </Grid>
                    </Card>
                </div>
            </div>
        );
    }
}