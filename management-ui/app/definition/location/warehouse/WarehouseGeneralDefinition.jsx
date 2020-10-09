import React from "react";
import _ from "lodash";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, CardHeader, Loader} from "susam-components/layout";
import {Notify, TextInput, Button, DropDown, Checkbox, CheckboxGroup, Span, Form, RadioGroup} from 'susam-components/basic';
import {Chip, NumericInput, WorkingHour} from 'susam-components/advanced';
import {CompanySearchAutoComplete} from 'susam-components/oneorder';

import {CustomsDetails} from "../place/CustomsDetails";

export class WarehouseGeneralDefinition extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            data: {}
        }

    }


    componentDidMount() {
        this.initializeState(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.initializeState(nextProps);
    }

    initializeState(props) {
        let state = _.cloneDeep(this.state);
        if (props.data) {
            state.data = _.cloneDeep(props.data);
        }
        if (props.lookup) {
            state.lookup = props.lookup;
        }
        if(!state.data.customsDetails){
            state.data.customsDetails = {
                customsType: {id: "NON_BONDED_WAREHOUSE"}
            }
        }

        this.setState(state);
    }

    updateState(field, value) {
        console.log(field, value);
        let data = this.state.data;
        data[field] = value;
        this.updateData(data);
    }

    updateData(data) {
        this.setState({data: data});
    }

    next() {
        let data = this.state.data;
        return new Promise(
            (resolve, reject) => {
                if (!this.generalDefinitionForm.validate() || !this.customsDetails.validate()) {
                    Notify.showError("There are eori problems");
                    reject();
                    return;
                }

                this.props.handleSave(data);
                resolve(true);
            });
    }

    render() {

        let data = this.state.data;

        if (!data) {
            return null;
        }

        return (
            <Grid>
                <GridCell width="1-1">
                    <CardHeader title="General Definition"/>
                </GridCell>
                <GridCell width="1-1">
                    <Form ref={(c) => this.generalDefinitionForm = c}>
                        <Grid>
                            <GridCell width="2-10">
                                <TextInput label="Name" value={data.name} onchange={(data) => {
                                    this.updateState("name", data)
                                }}/>
                            </GridCell>
                            <GridCell width="1-10" nomargin={true}>
                                <NumericInput label="Area(m2)" value={data.area} onchange={(data) => {
                                    this.updateState("area", data)
                                }}/>
                            </GridCell>
                            <GridCell width="2-10" nomargin={true}>
                                <NumericInput label="Storage Volume(m3)" value={data.storageVolume} onchange={(data) => {
                                    this.updateState("storageVolume", data)
                                }}/>
                            </GridCell>
                            <GridCell width="1-10" nomargin={true}>
                                <NumericInput label="# of Floors" value={data.numberOfFloors} onchange={(data) => {
                                    this.updateState("numberOfFloors", data)
                                }}/>
                            </GridCell>
                            <GridCell width="1-10" nomargin={true}>
                                <NumericInput label="# of Docks" value={data.numberOfRamps} onchange={(data) => {
                                    this.updateState("numberOfRamps", data)
                                }}/>
                            </GridCell>
                            <GridCell width="3-10" nomargin={true}/>
                            <GridCell width="1-1" nomargin={true}>
                                <TextInput label="Dock Numbers" readOnly={true}
                                           value={data.rampNumbers ? data.rampNumbers : "-"}/>
                            </GridCell>
                        </Grid>
                    </Form>
                </GridCell>
                <GridCell width="1-1">
                    <CustomsDetails ref = {c => this.customsDetails = c}
                                    customsTypes = {this.props.customsTypes}
                                    customsOffices = {this.props.customsOffices}
                                    countryCode = {data.establishment ? data.establishment.address.country.iso : ""}
                                    details = {data.customsDetails}
                                    onChange = {value => this.updateState("customsDetails", value)}
                                    externalIds = {data.externalIds}
                                    onExternalIdsChange = {value => this.updateState("externalIds", value)} />
                </GridCell>
            </Grid>
        );
    }
}