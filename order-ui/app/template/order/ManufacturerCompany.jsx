import * as axios from 'axios';
import PropTypes from 'prop-types';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, DropDown, Form, Notify } from 'susam-components/basic';
import * as DataTable from "susam-components/datatable";
import { Grid, GridCell } from 'susam-components/layout';
import { CompanySearchAutoComplete } from 'susam-components/oneorder';
import { convertLocationsWithPostalCodes } from '../../Helper';
import { Kartoteks } from '../../services';

export class ManufacturerCompany extends TranslatingComponent {
    state = {
        manufacturer: {}
    };

    filterContactsByLocation(contacts, location) {
        return _.filter(contacts, c => c.companyLocation.id === location.id).map(c => { return { id: c.id, name: c.firstName + " " + c.lastName } })
    }

    handleCompanyChange(value) {
        if (value) {
            Kartoteks.getCompanyLocations(value.id).then(response => {
                let manufacturer = _.cloneDeep(this.state.manufacturer);
                _.set(manufacturer, 'company', value);
                _.set(manufacturer, 'companyLocation', null);
                _.set(manufacturer, 'companyContact', null);
                this.setState({
                    locations: response.data.map(item=>convertLocationsWithPostalCodes(item)),
                    manufacturer: manufacturer
                }, () => {
                    if (this.state.locations && 1 === this.state.locations.length) {
                        this.handleLocationChange(_.first(this.state.locations));
                    }
                });
            });
        } else {
            this.setState({ locations: null });
        }
    }
    handleLocationChange(value) {
        if (value) {
            Kartoteks.getCompanyContacts(this.state.manufacturer.company.id).then(response => {
                let manufacturer = _.cloneDeep(this.state.manufacturer);
                _.set(manufacturer, 'companyLocation', value);
                _.set(manufacturer, 'companyContact', null);
                this.setState({
                    contacts: this.filterContactsByLocation(response.data, value),
                    manufacturer: manufacturer
                }, ()=>{
                    if(this.state.contacts && 1 == this.state.contacts.length){
                        this.handleContactChange(_.first(this.state.contacts));
                    }
                });
            });
        } else {
            this.setState({ contacts: null });
        }
    }
    handleContactChange(value) {
        let manufacturer = _.cloneDeep(this.state.manufacturer);
        _.set(manufacturer, 'companyContact', value);
        this.setState({
            manufacturer: manufacturer
        });
    }

    handleAddManufacturer() {
        if (!this.manufacturerForm.validate()) {
            return;
        }
        let manufacturers = _.cloneDeep(this.props.manufacturers || []);
        if(this.state.editItem){
            _.remove(manufacturers, t=>_.isEqual(t, this.state.editItem));
        } else {
            let exist = _.find(this.props.manufacturers, { company: { id: this.state.manufacturer.company.id }, companyLocation: { id: this.state.manufacturer.companyLocation.id } })
            if (exist) {
                Notify.showError("This manufacturer record is exist");
                return;
            }
        }
        manufacturers.push(this.state.manufacturer);
        this.props.onchange && this.props.onchange(manufacturers);
        this.setState({ manufacturer: {}, locations: null, contacts: null, editItem: null })
    }

    handleEditClick(item) {
        axios.all([
            Kartoteks.getCompanyLocations(item.company.id),
            Kartoteks.getCompanyContacts(item.company.id)
        ]).then(axios.spread((locations, contacts) => {
            let manufacturers = _.cloneDeep(this.props.manufacturers);
            let editItem = _.find(manufacturers, { company: { id: item.company.id }, companyLocation: { id: item.companyLocation.id } })
            this.setState({
                locations: locations.data.map(item=>convertLocationsWithPostalCodes(item)),
                contacts: this.filterContactsByLocation(contacts.data, item.companyLocation),
                manufacturer: item,
                editItem: editItem
            });
            this.props.onchange && this.props.onchange(manufacturers);
        })).catch(error => Notify.showError(error));
    }

    handleDeleteClick(item) {
        Notify.confirm("Are you sure", () => {
            let manufacturers = _.cloneDeep(this.props.manufacturers);
            _.remove(manufacturers, { company: { id: item.company.id }, companyLocation: { id: item.companyLocation.id } });
            this.props.onchange && this.props.onchange(manufacturers);
        })
    }

    renderManufacturerForm(mode = 'all') {
        if ('all' === mode) {
            return (
                <Grid>
                    <GridCell width="1-9" style={{ paddingLeft: "45px" }}>
                        {super.translate("All Companies")}
                    </GridCell>
                    <GridCell width="8-9">
                        <Button style="success" flat={true} size="mini" label="Define Specific Company" onclick={() => this.props.onmodechange && this.props.onmodechange('specific')} />
                    </GridCell>
                </Grid>
            );
        } else if ('specific' === mode) {
            return (
                <div>
                    <Form ref={f => this.manufacturerForm = f}>
                        <Grid>
                            <GridCell>
                                <Button
                                    style="success"
                                    flat={true} size="mini"
                                    label="All Companies"
                                    onclick={() => Notify.confirm("Defined manufacturers will be deleted. Are you sure?", () => { this.props.onmodechange && this.props.onmodechange('all'); this.props.onchange && this.props.onchange([]); })} />
                            </GridCell>
                            <GridCell width="1-3">
                                <CompanySearchAutoComplete
                                    required={true}
                                    label="Company"
                                    onchange={value => this.handleCompanyChange(value)}
                                    value={this.state.manufacturer.company} />
                            </GridCell>
                            <GridCell width="1-3">
                                <DropDown
                                    uninitializedText="Select Company"
                                    required={true}
                                    label="Location"
                                    options={this.state.locations}
                                    onchange={value => this.handleLocationChange(value)}
                                    value={this.state.manufacturer.companyLocation}
                                />
                            </GridCell>
                            <GridCell width="2-9">
                                <DropDown
                                    uninitializedText="Select Location"
                                    label="Contact"
                                    options={this.state.contacts}
                                    onchange={value => this.handleContactChange(value)}
                                    value={this.state.manufacturer.companyContact}
                                />
                            </GridCell>
                            <GridCell width="1-9" style={{ textAlign: "center" }}>
                                <Button
                                    style="primary"
                                    label="Add"
                                    onclick={() => this.handleAddManufacturer()}
                                />
                            </GridCell>

                        </Grid>
                    </Form>
                    <DataTable.Table data={this.props.manufacturers}>
                        <DataTable.Text field="company.name" width="34.5%" />
                        <DataTable.Text field="companyLocation.name" width="34.5%" />
                        <DataTable.Text field="companyContact.name" width="21%" />
                        <DataTable.ActionColumn width="11%">
                            <DataTable.ActionWrapper track="onclick" onaction={(item) => { this.handleEditClick(item) }}>
                                <Button label="Edit" flat={true} style="success" size="small" />
                            </DataTable.ActionWrapper>
                            <DataTable.ActionWrapper track="onclick" onaction={(item) => { this.handleDeleteClick(item) }}>
                                <Button label="Remove" flat={true} style="danger" size="small" />
                            </DataTable.ActionWrapper>
                        </DataTable.ActionColumn>
                    </DataTable.Table>
                </div>
            )
        }
    }

    render() {
        let { option, mode } = this.props;
        if (!option || 'DONT_ASK' === option.code) {
            return null;
        }
        if (!_.isEmpty(this.props.manufacturers)) {
            mode = 'specific';
        }
        return (
            <div>
                <div className="md-input-wrapper md-input-filled">
                    <label>{super.translate("Manufacturer Options")}</label>
                </div>
                {this.renderManufacturerForm(mode)}
            </div>
        )
    }
}

ManufacturerCompany.contextTypes = {
    translator: PropTypes.object
};
