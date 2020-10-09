import React from "react";
import {Grid, GridCell, Card} from "susam-components/layout";
import {ZoneZipCodesTable} from "./ZoneZipCodesTable";
import {ZoneZipCodesForm} from "./ZoneZipCodesForm";

export class ZoneZipCodes extends React.Component {

    constructor(props) {
        super(props);
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

    getZoneZipCode() {
        return this._zoneZipCodesForm.getZoneZipCode();
    }

    validateZoneZipCodesForm() {
        return this._zoneZipCodesForm.validateZoneZipCodesForm();
    }

    onCountryChange(country) {
        this.props.onCountryChange(country);
    }

    render() {
        return (
            <Card title="Zip Codes">
                <Grid>
                    <GridCell noMargin="true" width="1-1">
                        <ZoneZipCodesForm countries={this.props.countries}
                                          zoneZipCodeTypes={this.props.zoneZipCodeTypes}
                                          zoneZipCode={this.props.zoneZipCode}
                                          onSaveZoneZipCode={() => this.onSaveZoneZipCode()}
                                          ref={(c) => this._zoneZipCodesForm = c}
                                          onCountryChange={(country) => this.onCountryChange(country)}/>
                    </GridCell>
                    <GridCell width="1-1">
                        <ZoneZipCodesTable zipCodes={this.props.zone ? this.props.zone.zipCodes : []}
                                           onEditZoneZipCode={(values) => this.onEditZoneZipCode(values)}
                                           onDeleteZoneZipCode={(values) => this.onDeleteZoneZipCode(values)}/>
                    </GridCell>
                </Grid>
            </Card>
        );
    }
}