import React from "react";
import _ from "lodash";
import uuid from 'uuid';
import * as axios from "axios";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, CardHeader, Loader, Modal} from "susam-components/layout";
import {Notify, TextInput, Button, DropDown, Span, Checkbox} from 'susam-components/basic';
import {Date, NumericInput} from 'susam-components/advanced';

import {RegionDropDown} from '../common/RegionDropDown';
import {SalesDemandPriorityDropDown} from '../common/SalesDemandPriorityDropDown';
import {ShipmentLoadingTypeChip} from '../common/ShipmentLoadingTypeChip';
import {LoadWeightTypeDropDown} from '../common/LoadWeightTypeDropDown';
import {CurrencyDropDown} from '../common/CurrencyDropDown';
import {Utils} from '../common/Utils';

const PRIORITY_NORMAL = {
    id: "NORMAL",
    code: "NORMAL",
    name: "Normal"
};

const CURRENCY_EUR = {
    id: "EUR",
    code: "EUR",
    name: "EUR"
};

export class SalesDemandModal extends TranslatingComponent {

    constructor(props) {
        super(props);
        let data = _.cloneDeep(props.data);
        this.prepareData(data);
        this.state = {
            no: data.no,
            createdBy: data.createdBy,
            fromRegion: data.fromRegion,
            toRegion: data.toRegion,
            priority: data.priority,
            shipmentLoadingTypes: data.shipmentLoadingTypes,
            loadWeightType: data.loadWeightType,
            validityStartDate: data.validityStartDate,
            validityEndDate: data.validityEndDate,
            quota: data.quota,
            campaign: data.campaign,
            minPrice: data.minPrice,
            maxPrice: data.maxPrice,
            currency: data.currency
        };
    }

    componentDidMount() {
        this.modalReference.open();
    }

    prepareData(data) {
        if (!this.props.readOnly) {
            let inCreateMode = _.isNil(data.id);
            if (inCreateMode) {
                // copy işleminde inCreateMode = true oluyor ama aşağıdaki alanlar dolu olabiliyor.
                data.priority = !_.isNil(data.priority) ? data.priority : PRIORITY_NORMAL;
                data.validityStartDate = !_.isNil(data.validityStartDate) ? data.validityStartDate : Utils.formatDate(Utils.getToday());
                data.campaign = !_.isNil(data.campaign) ? data.campaign : false;
                data.currency = !_.isNil(data.currency) ? data.currency : CURRENCY_EUR;
            }
        }
    }

    updateProperty(propertyName, propertyValue) {
        this.setState({[propertyName]: propertyValue});
    }

    cancel() {
        this.props.onCancel();
    }

    save() {

        let state = _.cloneDeep(this.state);

        if (_.isNil(state.fromRegion)) {
            Notify.showError("A from region must be specified.");
            return;
        }

        if (_.isNil(state.toRegion)) {
            Notify.showError("A to region must be specified.");
            return;
        }

        if (_.isNil(state.priority)) {
            Notify.showError("A priority must be specified.");
            return;
        }

        if (_.isEmpty(state.shipmentLoadingTypes)) {
            Notify.showError("At least one shipment loading type must be specified.");
            return;
        }

        if (_.isNil(state.validityStartDate) || state.validityStartDate.length == 0) {
            Notify.showError("A validity start date must be specified.");
            return;
        }

        if (_.isNil(state.validityEndDate) || state.validityEndDate.length == 0) {
            Notify.showError("A validity end date must be specified.");
            return;
        }

        if (state.campaign) {
            if (!_.isNumber(state.minPrice)) {
                Notify.showError("A min price must be specified.");
                return;
            }
            if (!_.isNumber(state.maxPrice)) {
                Notify.showError("A max price must be specified.");
                return;
            }
            if (_.isNil(state.currency)) {
                Notify.showError("A currency must be specified.");
                return;
            }
            if (!_.isNumber(state.quota)) {
                Notify.showError("A quota must be specified.");
                return;
            }
        }

        let data = _.cloneDeep(this.props.data);
        data.fromRegion = state.fromRegion;
        data.toRegion = state.toRegion;
        data.priority = state.priority;
        data.shipmentLoadingTypes = state.shipmentLoadingTypes;
        data.loadWeightType = state.loadWeightType;
        data.validityStartDate = state.validityStartDate;
        data.validityEndDate = state.validityEndDate;
        data.quota = state.quota;
        data.campaign = state.campaign;
        data.minPrice = state.minPrice;
        data.maxPrice = state.maxPrice;
        data.currency = state.currency;

        this.props.onSave(data);
    }

    getTitle() {
        if (this.props.readOnly) {
            return "Sales Demand";
        } else {
            let inEditMode = !_.isNil(this.props.data.id);
            if (inEditMode) {
                return "Edit Sales Demand";
            } else {
                return "New Sales Demand";
            }
        }
    }

    isAlreadyCreated() {
        return !_.isNil(this.props.data.id);
    }

    isMinPriceDisabled() {
        return !this.state.campaign;
    }

    isMaxPriceDisabled() {
        return this.isMinPriceDisabled(); // koşullar aynı olduğundan...
    }

    isCurrencyDisabled() {
        return this.isMinPriceDisabled(); // koşullar aynı olduğundan...
    }

    isQuoteDisabled() {
        return this.isMinPriceDisabled(); // koşullar aynı olduğundan...
    }

    renderModalContent() {
        return (
            <Grid>
                {this.renderNoAndCreatedBy()}
                <GridCell width="1-3">
                    <RegionDropDown label="From Region"
                                    value={this.state.fromRegion}
                                    onchange={(value) => this.updateProperty("fromRegion", value)}
                                    required={true}
                                    readOnly={this.props.readOnly}/>
                </GridCell>
                <GridCell width="1-3">
                    <RegionDropDown label="To Region"
                                    value={this.state.toRegion}
                                    onchange={(value) => this.updateProperty("toRegion", value)}
                                    required={true}
                                    readOnly={this.props.readOnly}/>
                </GridCell>
                <GridCell width="1-3">
                    <SalesDemandPriorityDropDown label="Priority"
                                                 value={this.state.priority}
                                                 onchange={(value) => this.updateProperty("priority", value)}
                                                 required={true}
                                                 readOnly={this.props.readOnly}/>
                </GridCell>
                <GridCell width="1-3">
                    <LoadWeightTypeDropDown label="Load Weight Type"
                                            value={this.state.loadWeightType}
                                            onchange={(value) => this.updateProperty("loadWeightType", value)}
                                            readOnly={this.props.readOnly}/>
                </GridCell>
                <GridCell width="2-3">
                    <ShipmentLoadingTypeChip label="Shipment Loading Type"
                                             value={this.state.shipmentLoadingTypes}
                                             onchange={(value) => this.updateProperty("shipmentLoadingTypes", value)}
                                             required={true}
                                             readOnly={this.props.readOnly}/>
                </GridCell>
                <GridCell width="1-3">
                    <Date label="Validity Start Date"
                          format="DD/MM/YYYY"
                          value={this.state.validityStartDate}
                          onchange={(value) => this.updateProperty("validityStartDate", value)}
                          hideIcon={true}
                          required={true}
                          readOnly={this.props.readOnly}/>
                </GridCell>
                <GridCell width="1-3">
                    <Date label="Validity End Date"
                          format="DD/MM/YYYY"
                          value={this.state.validityEndDate}
                          onchange={(value) => this.updateProperty("validityEndDate", value)}
                          hideIcon={true}
                          required={true}
                          readOnly={this.props.readOnly}/>
                </GridCell>
                <GridCell width="1-3"/>
                <GridCell width="1-1"/>
                <GridCell width="1-1">
                    <Checkbox label="Campaign"
                              value={this.state.campaign}
                              onchange={(value) => this.updateProperty("campaign", value)}
                              disabled={this.props.readOnly}/>
                </GridCell>
                <GridCell width="1-1"/>
                <GridCell width="1-4">
                    <NumericInput label="Min Price"
                                  labelAlwaysRaised={true}
                                  value={this.state.minPrice}
                                  onchange={(value) => this.updateProperty("minPrice", value)}
                                  digits="2"
                                  digitsOptional={true}
                                  disabled={this.isMinPriceDisabled()}
                                  required={true}
                                  readOnly={this.props.readOnly}/>
                </GridCell>
                <GridCell width="1-4">
                    <NumericInput label="Max Price"
                                  labelAlwaysRaised={true}
                                  value={this.state.maxPrice}
                                  onchange={(value) => this.updateProperty("maxPrice", value)}
                                  digits="2"
                                  digitsOptional={true}
                                  disabled={this.isMaxPriceDisabled()}
                                  required={true}
                                  readOnly={this.props.readOnly}/>
                </GridCell>
                <GridCell width="1-4">
                    <CurrencyDropDown label="Currency"
                                      value={this.state.currency}
                                      onchange={(value) => this.updateProperty("currency", value)}
                                      disabled={this.isCurrencyDisabled()}
                                      required={true}
                                      readOnly={this.props.readOnly}/>
                </GridCell>
                <GridCell width="1-4">
                    <NumericInput label="Quota"
                                  labelAlwaysRaised={true}
                                  value={this.state.quota}
                                  onchange={(value) => this.updateProperty("quota", value)}
                                  disabled={this.isQuoteDisabled()}
                                  readOnly={this.props.readOnly}/>
                </GridCell>
                <GridCell width="1-1">
                    <div className="uk-align-right">
                        <Button label="Cancel" waves={true} onclick={() => this.cancel()}/>
                        {this.renderSaveButton()}
                    </div>
                </GridCell>
            </Grid>
        );
    }

    renderNoAndCreatedBy() {
        if (this.isAlreadyCreated()) {
            return (
                <GridCell width="1-1">
                    <Grid>
                        <GridCell width="1-3" noMargin={true}>
                            <TextInput label="No"
                                       value={this.state.no}
                                       readOnly={true}/>
                        </GridCell>
                        <GridCell width="1-3" noMargin={true}>
                            <TextInput label="Created By"
                                       value={this.state.createdBy}
                                       readOnly={true}/>
                        </GridCell>
                    </Grid>
                </GridCell>
            );
        } else {
            return null;
        }
    }

    renderSaveButton() {
        if (this.props.readOnly) {
            return null;
        } else {
            return (
                <Button label="Save" style="primary" waves={true} onclick={() => this.save()}/>
            );
        }
    }

    render() {
        return (
            <Modal title={this.getTitle()}
                   medium={true}
                   closeOnBackgroundClicked={false}
                   ref={(c) => this.modalReference = c}>
                {this.renderModalContent()}
            </Modal>
        );
    }
}

