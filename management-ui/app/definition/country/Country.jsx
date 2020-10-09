import React from "react";
import _ from "lodash";
import uuid from 'uuid';
import * as axios from "axios";

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card, Loader, CardHeader, PageHeader, Modal} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown, Form, Checkbox} from "susam-components/basic";
import {NumericInput} from "susam-components/advanced";
import * as DataTable from 'susam-components/datatable';

import {LocationService} from "../../services";

export class Country extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            originalData: null,
            name: null,
            iso: null,
            phoneCode: null,
            currency: null,
            euMember: null
        };
    }

    componentDidMount() {
    }

    open(data) {
        let originalData = (data ? _.cloneDeep(data) : {});
        this.setState({
            originalData: originalData,
            name: originalData.name,
            iso: originalData.iso,
            phoneCode: originalData.phoneCode,
            currency: originalData.currency,
            euMember: originalData.euMember
        });
        this.modalReference.open();
    }

    updateName(value) {
        this.setState({name: value});
    }

    updateIso(value) {
        this.setState({iso: value});
    }

    updatePhoneCode(value) {
        this.setState({phoneCode: value});
    }

    updateCurrency(value) {
        this.setState({currency: value});
    }

    updateEuMember(value) {
        this.setState({euMember: value});
    }

    handleCancelClick() {
        this.modalReference.close();
    }

    handleSaveClick() {

        let goon = true;
        let state = _.cloneDeep(this.state);
        let originalData = state.originalData;
        let name = state.name;
        let iso = state.iso;
        let phoneCode = state.phoneCode;
        let currency = state.currency;
        let euMember = state.euMember;

        if (!name || name.trim().length == 0) {
            goon = false;
            Notify.showError("A name must be specified.");
        }

        if (goon && (!iso || iso.trim().length == 0)) {
            goon = false;
            Notify.showError("An iso code must be specified.");
        }

        if (goon && iso.trim().length != 2) {
            goon = false;
            Notify.showError("Iso code must consist of two letters.");
        }

        if (goon && !phoneCode) {
            goon = false;
            Notify.showError("A phone code must be specified.");
        }

        if (goon && (phoneCode < 1 || phoneCode > 999)) {
            goon = false;
            Notify.showError("Phone code must be between 1-999.");
        }

        if (goon && (!currency || currency.trim().length == 0)) {
            goon = false;
            Notify.showError("A currency must be specified.");
        }

        if (goon && currency.trim().length != 3) {
            goon = false;
            Notify.showError("Currency must consist of three letters.");
        }

        if (goon) {
            originalData.name = name;
            originalData.iso = iso;
            originalData.phoneCode = phoneCode;
            originalData.currency = currency;
            originalData.euMember = euMember;
            this.saveCountry(originalData, (responseData) => {
                this.props.onSave(responseData);
                this.modalReference.close();
            });
        }
    }

    saveCountry(country, callback) {
        LocationService.saveCountry(country).then(response => {
            callback(response.data);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    render() {
        return (
            <Modal title="Country"
                   large={false}
                   ref={(c) => this.modalReference = c}>
                <Grid>
                    <GridCell width="1-1" noMargin={true}>
                        <TextInput label="Name"
                                   value={this.state.name}
                                   onchange={(value) => this.updateName(value)}/>
                    </GridCell>
                    <GridCell width="1-1">
                        <TextInput label="ISO Code"
                                   value={this.state.iso}
                                   onchange={(value) => this.updateIso(value)}/>
                    </GridCell>
                    <GridCell width="1-1">
                        <NumericInput label="Phone Code"
                                      value={this.state.phoneCode}
                                      onchange={(value) => this.updatePhoneCode(value)}/>
                    </GridCell>
                    <GridCell width="1-1">
                        <TextInput label="Currency"
                                   value={this.state.currency}
                                   onchange={(value) => this.updateCurrency(value)}/>
                    </GridCell>
                    <GridCell width="1-1">
                        <Checkbox label="EU Member"
                                  value={this.state.euMember}
                                  onchange={(value) => this.updateEuMember(value)}/>
                    </GridCell>
                    <GridCell width="1-1">
                        <div className="uk-align-right">
                            <Button label="Cancel" waves={true} onclick={() => this.handleCancelClick()}/>
                            <Button label="Save" style="primary" waves={true} onclick={() => this.handleSaveClick()}/>
                        </div>
                    </GridCell>
                </Grid>
            </Modal>
        );
    }
}

Country.contextTypes = {
    router: React.PropTypes.object.isRequired
};