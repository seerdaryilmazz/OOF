import React from "react";
import {TextInput, DropDown, Button, Notify} from "susam-components/basic";
import {Grid, GridCell} from "susam-components/layout";

export class ZoneZipCodesForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = this.extractStateFromProps(props);
    }

    componentWillReceiveProps(nextProps) {
        this.setState(this.extractStateFromProps(nextProps))
    }

    extractStateFromProps(props) {
        return {
            value1: props.zoneZipCode.value1,
            value2: props.zoneZipCode.value2,
            country: props.zoneZipCode.country,
            zoneZipCodeType: props.zoneZipCode.zoneZipCodeType,
            id: props.zoneZipCode.id,
            dummyId: props.zoneZipCode.dummyId
        }
    }

    setStateProp(key, value) {
        let prop = {};
        prop[key] = value;
        this.setState(prop);

        if (key == "country") {
            this.props.onCountryChange(value);
        }
    }

    getZoneZipCode() {
        return this.state;
    }

    onSaveZoneZipCode() {
        this.props.onSaveZoneZipCode();
    }

    validateZoneZipCodesForm() {
        let valid = true;

        if (!this.state.country) {
            Notify.showError("Country is required!")
            valid = false;
        }

        if (!this.state.zoneZipCodeType) {
            Notify.showError("Type is required!")
            valid = false;
        } else {
            if (this.state.zoneZipCodeType.id == "RANGE") {
                if (!this.state.value1 && !this.state.value2) {
                    Notify.showError("Either From or To is required!")
                    valid = false;
                }
            } else {
                if (!this.state.value1) {
                    Notify.showError("Value is required!")
                    valid = false;
                }
            }
        }

        return valid;
    }

    render() {
        let zoneZipCodeValue = null;

        if (this.state.zoneZipCodeType) {
            if (this.state.zoneZipCodeType.id == "RANGE") {
                zoneZipCodeValue =
                    <Grid>
                        <GridCell noMargin="true" width="1-2">
                            <TextInput label="From"
                                       value={this.state.value1}
                                       onchange={(value) => this.setStateProp("value1", value)}/>
                        </GridCell>
                        <GridCell noMargin="true" width="1-2">
                            <TextInput label="To"
                                       value={this.state.value2}
                                       onchange={(value) => this.setStateProp("value2", value)}/>
                        </GridCell>
                    </Grid>;
            } else {
                zoneZipCodeValue =
                    <Grid>
                        <GridCell noMargin="true" width="1-1">
                            <TextInput label="Value"
                                       value={this.state.value1}
                                       onchange={(value) => this.setStateProp("value1", value)}/>
                        </GridCell>
                    </Grid>;
            }
        }

        return (
            <Grid>
                <GridCell noMargin="true" width="2-3">
                    <DropDown label="Country"
                              onchange={(value) => this.setStateProp("country", value)}
                              options={this.props.countries}
                              valueField="id"
                              labelField="iso"
                              value={this.state.country}/>
                </GridCell>
                <GridCell noMargin="true" width="1-3">
                </GridCell>
                <GridCell width="1-3">
                    <Grid>
                        <GridCell width="1-1" noMargin="true">
                            <DropDown label="Type"
                                      onchange={(value) => this.setStateProp("zoneZipCodeType", value)}
                                      options={this.props.zoneZipCodeTypes}
                                      valueField="id"
                                      labelField="name"
                                      value={this.state.zoneZipCodeType}/>
                        </GridCell>
                    </Grid>
                </GridCell>
                <GridCell width="2-3">
                    {zoneZipCodeValue}
                </GridCell>
                <GridCell width="1-1">
                    <div className="uk-float-right">
                        <Button
                            label={this.state.id || this.state.dummyId ? "UPDATE" : "ADD"}
                            waves={true}
                            onclick={() => this.onSaveZoneZipCode()}/>
                    </div>
                </GridCell>
            </Grid>
        );
    }
}