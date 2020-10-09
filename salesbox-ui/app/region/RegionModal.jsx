import React from "react";
import _ from "lodash";
import uuid from 'uuid';
import * as axios from "axios";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, CardHeader, Loader, Modal} from "susam-components/layout";
import {Notify, TextInput, Button, DropDown, Span, Checkbox} from 'susam-components/basic';

import {CountryDropDown} from '../common/CountryDropDown';
import {CountryPointChip} from '../common/CountryPointChip';

export class RegionModal extends TranslatingComponent {

    constructor(props) {
        super(props);
        let data = _.cloneDeep(props.data);
        this.prepareData(data);
        this.state = {
            name: data.name,
            countryRegions: data.countryRegions
        };
    }

    componentDidMount() {
        this.modalReference.open();
    }

    prepareData(data) {
        if (_.isEmpty(data.countryRegions)) {
            data.countryRegions = [this.getNewEmptyCountryRegion()];
        } else {
            data.countryRegions.forEach((elem) => {
                elem._key = uuid.v4();
            });
            data.countryRegions = _.sortBy(data.countryRegions, ["country.name"]);
        }
    }

    getNewEmptyCountryRegion() {
        return {
          _key: uuid.v4()
        };
    }

    updateProperty(propertyName, propertyValue) {
        this.setState({[propertyName]: propertyValue});
    }

    updateCountryRegion(index, propertyName, propertyValue) {
        let countryRegions = _.cloneDeep(this.state.countryRegions);
        _.set(countryRegions[index], propertyName, propertyValue);
        if (propertyName == "country") {
            _.set(countryRegions[index], "postalCodes", []);
        }
        this.setState({countryRegions: countryRegions});
    }

    insertCountryRegionAfterIndex(index) {
        let countryRegions = _.cloneDeep(this.state.countryRegions);
        countryRegions.splice(index + 1, 0, this.getNewEmptyCountryRegion());
        this.setState({countryRegions: countryRegions});
    }

    deleteCountryRegionAtIndex(index) {
        let countryRegions = _.cloneDeep(this.state.countryRegions);
        countryRegions.splice(index, 1);
        if (countryRegions.length == 0) {
            countryRegions.push(this.getNewEmptyCountryRegion()); // Hiç kayıt yoksa kullanıcının '+' yani ekleme butonunu görebilmesi için boş bir kayıt ekliyoruz.
        }
        this.setState({countryRegions: countryRegions});
    }

    cancel() {
        this.props.onCancel();
    }

    save() {

        let state = _.cloneDeep(this.state);

        if (_.isNil(state.name) || state.name.trim().length == 0) {
            Notify.showError("A name must be specified.");
            return;
        }

        if (_.isEmpty(state.countryRegions)) {
            Notify.showError("At least one country region must be specified.");
            return;
        }

        for (let i = 0; i < state.countryRegions.length; i++) {
            let countryRegion = state.countryRegions[i];
            if (_.isNil(countryRegion.country)) {
                Notify.showError("All country fields must be filled.");
                return;
            }
        }

        let data = _.cloneDeep(this.props.data);
        data.name = state.name;
        data.countryRegions = state.countryRegions;

        this.props.onSave(data);
    }

    getTitle() {

        let inEditMode = !_.isNil(this.props.data.id);
        let title;

        if (inEditMode) {
            title = "Edit Region";
        } else {
            title = "New Region";
        }

        return title;
    }

    renderCountryRegions() {

        let countryRegions = this.state.countryRegions;
        let cells = [];

        for (let i = 0; i < countryRegions.length; i++) {

            let countryRegion = countryRegions[i];

            cells.push(
                <GridCell width="1-1" key={countryRegion._key}>
                    <Grid>
                        <GridCell width="4-10" noMargin={true}>
                            <CountryDropDown label="Country"
                                             value={countryRegion.country}
                                             onchange={(value) => this.updateCountryRegion(i, "country", value)}
                                             required={true}/>
                        </GridCell>
                        <GridCell width="5-10" noMargin={true}>
                            <CountryPointChip label="Postal Codes"
                                              value={countryRegion.postalCodes}
                                              onchange={(value) => this.updateCountryRegion(i, "postalCodes", value)}
                                              country={countryRegion.country}
                                              type="POSTAL"/>
                        </GridCell>
                        <GridCell width="1-10" noMargin={true}>
                            <Grid>
                                <GridCell width="1-1" noMargin={true}/>
                                <GridCell width="1-1">
                                    <a href="javascript:void(null);" onClick={() => this.insertCountryRegionAfterIndex(i)}>
                                        <i className="uk-icon-plus"></i>
                                    </a>
                                    &nbsp;&nbsp;&nbsp;
                                    <a href="javascript:void(null);" onClick={() => this.deleteCountryRegionAtIndex(i)}>
                                        <i className="uk-icon-remove"></i>
                                    </a>
                                </GridCell>
                            </Grid>
                        </GridCell>
                    </Grid>
                </GridCell>
            );
        }

        return cells;
    }

    renderModalContent() {
        return (
            <Grid>
                <GridCell width="1-1">
                    <TextInput label="Name"
                               value={this.state.name}
                               onchange={(value) => this.updateProperty("name", value)}
                               required={true}/>
                </GridCell>
                {this.renderCountryRegions()}
                <GridCell width="1-1">
                    <div className="uk-align-right">
                        <Button label="Cancel" waves={true} onclick={() => this.cancel()}/>
                        <Button label="Save" style="primary" waves={true} onclick={() => this.save()}/>
                    </div>
                </GridCell>
            </Grid>
        );
    }

    render() {
        return (
            <Modal title={this.getTitle()}
                   medium={true}
                   ref={(c) => this.modalReference = c}>
                {this.renderModalContent()}
            </Modal>
        );
    }
}

