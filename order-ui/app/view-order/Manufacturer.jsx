import * as axios from 'axios';
import PropTypes from 'prop-types';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, DropDown, Form, Notify } from 'susam-components/basic';
import { CardSubHeader, Grid, GridCell, Loader, Modal } from 'susam-components/layout';
import { CompanySearchAutoComplete } from 'susam-components/oneorder';
import { OptionList } from '../create-order/steps/OptionList';
import { convertLocationsWithPostalCodes } from '../Helper';
import { Kartoteks } from '../services';
import { ContactDetailsModal } from './ContactDetailsModal';


export class Manufacturer extends TranslatingComponent {

    state = {};

    filterContactsByLocation(contacts, location) {
        if (!location) {
            return;
        }
        return _.filter(contacts, c => c.companyLocation.id === location.id).map(c => { return { id: c.id, name: c.firstName + " " + c.lastName } })
    }

    handleClickContact(contact) {
        Kartoteks.getContactDetails(contact.id).then(response => {
            this.setState({ contactDetails: response.data }, () => this.contactDetailsModal.open());
        }).catch(error => Notify.showError(error));
    }

    componentDidUpdate(prevProps, prevState) {
        if (!_.isEqual(_.get(prevState.manufacturerToEdit, "company"), _.get(this.state.manufacturerToEdit, "company")) && _.get(this.state.manufacturerToEdit, 'company.id')) {
            axios.all([
                Kartoteks.getCompanyLocations(this.state.manufacturerToEdit.company.id),
                Kartoteks.getCompanyContacts(this.state.manufacturerToEdit.company.id),
            ]).then(axios.spread((locations, contacts) => {
                this.setState({
                    locations: locations.data.map(i => convertLocationsWithPostalCodes(i)),
                    contacts: this.filterContactsByLocation(contacts.data, this.state.manufacturerToEdit.companyLocation)
                });
            }));
        }
    }

    shouldDelete() {
        let code = _.get(this.props.options, 'manufacturerOption.code');
        if ('ASK' === code) {
            return true;
        } else if ('DONT_ASK' === code) {
            return true;
        }
        return false;
    }

    showEditModal() {
        this.editModal.open();
    }

    hideEditModal() {
        this.setState({ manufacturerToEdit: null }, () => this.editModal.close());
    }

    handleClickDeleteManufacturer() {
        Notify.confirm("Manufacturer will be deleted from shipment. Are you sure?", () => {
            this.props.onDelete && this.props.onDelete();
        })
    }

    handleClickEditManufacturer() {
        let manufacturerToEdit = null;
        if (_.isEmpty(this.props.options.manufacturers)) {
            manufacturerToEdit = this.props.value;
        } else {
            manufacturerToEdit = _.find(this.props.options.manufacturers, {
                company: {
                    id: _.get(this.props.value, 'company.id')
                },
                companyLocation: {
                    id: _.get(this.props.value, 'companyLocation.id')
                }
            });
        }
        if(1 === this.props.options.manufacturers.length && _.isEqual(manufacturerToEdit, _.first(this.props.options.manufacturers))){
            Notify.showError("There is one manufacturer defined in template. It can not be edited");
            return;
        }
        this.setState({ manufacturerToEdit: manufacturerToEdit }, () => this.showEditModal());
    }

    handleClickSave() {
        if(!this.form || this.form.validate()){
            this.props.onSave && this.props.onSave(this.state.manufacturerToEdit);
            this.hideEditModal()
        } 
    }

    handleCompanyChange(value) {
        if (value) {
            Kartoteks.getCompanyLocations(value.id).then(response => {
                let state = _.cloneDeep(this.state);
                _.set(state, 'manufacturerToEdit.company', value);
                _.set(state, 'manufacturerToEdit.companyLocation', null);
                _.set(state, 'manufacturerToEdit.companyContact', null);

                _.set(state, 'locations', response.data.map(item => convertLocationsWithPostalCodes(item)));

                this.setState(state, () => {
                    if (this.state.locations && 1 === this.state.locations.length) {
                        this.handleLocationChange(_.first(this.state.locations));
                    }
                });
            });
        } else {
            this.setState({ locations: null, contacts: null, manufacturerToEdit: {} });
        }
    }
    handleLocationChange(value) {
        if (value) {
            Kartoteks.getCompanyContacts(this.state.manufacturerToEdit.company.id).then(response => {
                let state = _.cloneDeep(this.state);
                _.set(state, 'manufacturerToEdit.companyLocation', value);
                _.set(state, 'manufacturerToEdit.companyContact', null);

                _.set(state, 'contacts', this.filterContactsByLocation(response.data, value));

                this.setState(state, () => {
                    if (this.state.contacts && 1 == this.state.contacts.length) {
                        this.handleContactChange(_.first(this.state.contacts));
                    }
                });
            });
        } else {
            this.setState({ contacts: null, manufacturerToEdit: { company: this.state.manufacturerToEdit && this.state.manufacturerToEdit.company } });
        }
    }
    handleContactChange(value) {
        let state = _.cloneDeep(this.state);
        _.set(state, 'manufacturerToEdit.companyContact', value);
        this.setState(state);
    }

    render() {
        return (
            <div>
                <Grid>
                    <GridCell width="1-1" noMargin={true}>
                        <CardSubHeader title="Manufacturer" />
                    </GridCell>
                    {this.renderContent()}
                </Grid>
                {this.renderEditModal()}
                {this.state.contactDetails && <ContactDetailsModal ref={c => this.contactDetailsModal = c} data={this.state.contactDetails} />}
            </div>
        );
    }
    renderContent() {
        if (this.props.busy) {
            return <GridCell width="1-1" noMargin={true}><Loader title="Saving..." size="M" /></GridCell>;
        }

        if (_.isEmpty(this.props.value) || _.isEmpty(this.props.value.company)) {
            return (
                <GridCell width="1-1">
                    <div className="uk-margin-left uk-text-muted">
                        {super.translate("No manufacturer")}
                    </div>
                    <div className="uk-margin-left uk-text-muted">
                        {this.props.editable && <Button label="add manufacturer" style="primary" flat={true} size="mini" onclick={() => this.handleClickEditManufacturer()}/>}
                    </div>
                </GridCell>
            );
        } else {
            return (
                <GridCell width="1-1">
                    <div className="uk-margin-left" title="Company" data-uk-tooltip="{pos:'bottom'}">{_.get(this.props.value, 'company.name')}</div>
                    <div className="uk-margin-left uk-text-small" title="Company Location" data-uk-tooltip="{pos:'bottom'}">{_.get(this.props.value, 'companyLocation.name')}</div>
                    <div className="uk-margin-left" title="Company Contact" data-uk-tooltip="{pos:'bottom'}">
                        {this.renderContact(_.get(this.props.value, "companyContact"))}
                    </div>
                    {this.props.editable && (
                        <div style={{ textAlign: "right" }}>
                            {this.shouldDelete() && <Button label="delete" style="danger" flat={true} size="mini" onclick={() => this.handleClickDeleteManufacturer()} />}
                            {<Button label="edit" style="primary" flat={true} size="mini" onclick={() => this.handleClickEditManufacturer()} />}
                        </div>)}
                </GridCell>
            );
           
        }
    }

    renderContact(contact) {
        if (!contact) {
            return null;
        }
        return (
            <div style={{ clear: "both" }}>
                <div style={{ width: "24px", float: "left", marginRight: "8px" }}>
                    <i className="material-icons" >perm_contact_calendar</i>
                </div>
                <div style={{ marginLeft: "32px" }}>
                    <span><a href="javascript:;" onClick={() => this.handleClickContact(contact)}>{contact.name}</a></span>
                </div>
            </div>
        );
    }

    renderEditModal() {
        let actions = [
            { label: "Close", action: () => this.hideEditModal() },
            { label: "Save", buttonStyle: "primary", action: () => this.handleClickSave() }
        ];

        return (
            <Modal title="Edit Manufacturer" ref={c => this.editModal = c}
                large={!_.isEmpty(_.get(this.props.options, 'manufacturers'))}
                closeOtherOpenModals={false}
                actions={actions}>
                {this.renderEditModalContent()}
            </Modal>
        );

    }

    renderBox(option) {
        return (
            <Grid>
                <GridCell width="1-1" noMargin={true}>
                    <span className="uk-text-truncate uk-text-bold">{option.company ? option.company.name : ""}</span>
                </GridCell>
                <GridCell width="1-1" noMargin={true}>
                    <span className="uk-text-truncate" style={{ opacity: .8 }}>{option.companyLocation ? option.companyLocation.name : ""}</span>
                </GridCell>
            </Grid>
        );
    }

    renderEditModalContent() {
        if(_.isEmpty(this.props.options)){
            return;
        }
        if (_.isEmpty(this.props.options.manufacturers)) {
            return (
                <Form ref={c => this.form = c}>
                    <Grid>
                        <GridCell>
                            <CompanySearchAutoComplete
                                label="Company"
                                required={true}
                                value={_.get(this.state.manufacturerToEdit, 'company')}
                                onchange={value => this.handleCompanyChange(value)}
                                onclear={() => this.handleCompanyChange()}
                            />
                        </GridCell>
                        <GridCell>
                            <DropDown
                                label="Location"
                                required={true}
                                emptyText="No locations..."
                                uninitializedText="Select company..."
                                options={this.state.locations}
                                value={_.get(this.state.manufacturerToEdit, 'companyLocation')}
                                onchange={value => this.handleLocationChange(value)}
                            />
                        </GridCell>
                        <GridCell>
                            <DropDown
                                label="Contact"
                                emptyText="No contacts..."
                                uninitializedText="Select location..."
                                options={this.state.contacts}
                                value={_.get(this.state.manufacturerToEdit, 'companyContact')}
                                onchange={value => this.handleContactChange(value)}
                            />
                        </GridCell>
                    </Grid>
                </Form>
            );
        } else {
            return (
                <OptionList options={this.props.options.manufacturers} value={this.state.manufacturerToEdit}
                    keyField="key" unselectable={'REQUIRED' !== _.get(this.props.options, 'manufacturerOption.code')}
                    onChange={(value) => this.setState({ manufacturerToEdit: value })}
                    onRender={(option) => this.renderBox(option)}
                    showSearchInput={true}
                    searchFields={['company.name', 'companyLocation.name']}
                    size={6} active={true}
                />
            );
        }
    }
}

Manufacturer.contextTypes = {
    translator: PropTypes.object
};