import React from 'react';
import uuid from 'uuid';
import * as axios from 'axios';
import _ from 'lodash';

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Modal} from 'susam-components/layout';
import {Button, Notify, DropDown, TextInput} from 'susam-components/basic';
import {NumericInput} from 'susam-components/advanced';
import {Table} from 'susam-components/table';

import {OrderService, OrderTemplateService} from '../services';

const MAX_TRUCK_HEIGHT_IN_CENTIMETERS = 300;

export class ShipmentUnitModal extends TranslatingComponent {

    constructor(props) {

        super(props);

        this.state = this.prepareState(props.value, [], props.projectShipmentData, null);

        this.tableHeaders = [
            {
                name: "Row Id",
                data: "rowId",
                hidden: true
            },
            {
                name: "Count",
                data: "count"
            },
            {
                name: "Length (cm)",
                data: "lengthInCentimeters"
            },
            {
                name: "Width (cm)",
                data: "widthInCentimeters"
            },
            {
                name: "Height (cm)",
                data: "heightInCentimeters"
            },
            {
                name: "Allowed Stack Size",
                data: "stackSize"
            }
        ];

        this.tableActions = {
            rowDelete: {
                icon: "close",
                action: (elem) => this.handleDeletePackageClick(elem),
                title: "Delete",
                confirmation: "Are you sure you want to delete?"
            }
        };
    }

    componentDidMount() {
        OrderService.getPackageTypes().then((response) => {
            let packageTypes = response.data;
            let shownPackageTypes = this.filterPackageTypes(packageTypes, this.state.projectShipmentData, this.state.senderRules);
            this.setState({packageTypes: packageTypes, shownPackageTypes: shownPackageTypes});
        }).catch((error) => {
            Notify.showError(error);
        });
    }

    prepareState(data, packageTypes, projectShipmentData, senderRules) {

        let state = {};

        if (data && data.shipmentUnit) {
            state.shipmentUnit = _.cloneDeep(data.shipmentUnit);
        } else {
            state.shipmentUnit = {};
        }

        if (!state.shipmentUnit.type) {
            state.shipmentUnit.type = null;
        }

        if (!state.shipmentUnit.totalGrossWeightInKilograms) {
            state.shipmentUnit.totalGrossWeightInKilograms = null;
        }

        if (!state.shipmentUnit.totalNetWeightInKilograms) {
            state.shipmentUnit.totalNetWeightInKilograms = null;
        }

        if (!state.shipmentUnit.totalVolumeInCubicMeters) {
            state.shipmentUnit.totalVolumeInCubicMeters = null;
        }

        if (!state.shipmentUnit.totalLdm) {
            state.shipmentUnit.totalLdm = null;
        }

        if (!state.shipmentUnit.shipmentUnitPackages) {
            state.shipmentUnit.shipmentUnitPackages = [];
        } else {
            state.shipmentUnit.shipmentUnitPackages.forEach(item => {
                if (!item.rowId) {
                    item.rowId = uuid.v4();
                }
            });
        }

        state.shipmentUnitPackage = {
            count: null,
            lengthInCentimeters: null,
            widthInCentimeters: null,
            heightInCentimeters: null,
            stackSize: null
        };

        if (packageTypes) {
            state.packageTypes = _.cloneDeep(packageTypes);
        } else {
            state.packageTypes = [];
        }

        if (projectShipmentData) {
            state.projectShipmentData = _.cloneDeep(projectShipmentData);
        } else {
            state.projectShipmentData = {};
        }

        if (senderRules) {
            state.senderRules = _.cloneDeep(senderRules);
        } else {
            state.senderRules = [];
        }

        state.shownPackageTypes = this.filterPackageTypes(state.packageTypes, state.projectShipmentData, state.senderRules);

        // Burayı, stackability alanının kopyalanması için yapıyoruz.
        if (state.shipmentUnit.type) {

            let found = _.find(state.shownPackageTypes, item => {
                return item.id == state.shipmentUnit.type.id;
            });

            state.shipmentUnit.type = found;
            state.shipmentUnitPackage.stackSize = found.stackability;
        }

        return state;
    }

    filterPackageTypes(packageTypes, projectShipmentData, senderRules) {

        let shownPackageTypes = [];

        if (projectShipmentData.data && _.size(projectShipmentData.data) > 0) {

            // index: packageTypeId, value: packageType
            let packageTypesIndexed = [];

            packageTypes.forEach(item => {
                packageTypesIndexed[item.id] = item;
            });

            projectShipmentData.data.forEach(item => {
                let found = packageTypesIndexed[_.toInteger(item.packageType)];
                if (found) {
                    let foundCopy = _.cloneDeep(found);
                    if (item.stackability) {
                        foundCopy.stackability = _.toInteger(item.stackability);
                    }
                    shownPackageTypes.push(foundCopy);
                }
            });

        } else {
            packageTypes.forEach(item => {
                shownPackageTypes.push(item);
            });
        }

        if (senderRules && senderRules.length > 0) {
            shownPackageTypes = [];
            senderRules.forEach((senderRule) => {
                let code = senderRule.packageType.code;
                // Farklı senderRule'lar içinde aynı packageType olabildiğinden aynı packageType'ı sadece bir kez eklemek için...
                let match = _.find(shownPackageTypes, (elem) => {
                    return elem.code == code;
                });
                if (!match) {
                    shownPackageTypes.push(_.find(packageTypes, elem => {
                        return elem.code == code;
                    }));
                }
            });
        }

        return shownPackageTypes;
    }

    close() {
        this.modal.close();
    }

    openForAdd(projectShipmentData, sender, receiver) {
        this.open({}, projectShipmentData, sender, receiver);
    }

    openForEdit(data, projectShipmentData, sender, receiver) {
        this.open(data, projectShipmentData, sender, receiver);
    }

    open(data, projectShipmentData, sender, receiver) {

        OrderTemplateService.findAllSenderRulesThatMatch(
                sender.companyId, sender.locationOwnerCompanyId, sender.locationId, receiver.companyId).then((response) => {

            let senderRules = response.data.senderRules;

            let state = this.prepareState(data, this.state.packageTypes, projectShipmentData, senderRules);
            this.setState(state);
            this.modal.open();

        }).catch((error) => {
            Notify.showError(error);
        });
    }

    updateShipmentUnitState(key, value) {
        let shipmentUnit = _.cloneDeep(this.state.shipmentUnit);
        shipmentUnit[key] = value;
        if (key == "type" && value && value.stackability) {
            let shipmentUnitPackage = _.cloneDeep(this.state.shipmentUnitPackage);
            shipmentUnitPackage.stackSize = value.stackability;
            this.setState({shipmentUnit: shipmentUnit, shipmentUnitPackage: shipmentUnitPackage});
        } else {
            this.setState({shipmentUnit: shipmentUnit});
        }
    }

    updateShipmentUnitPackageState(key, value) {
        let shipmentUnitPackage = _.cloneDeep(this.state.shipmentUnitPackage);
        shipmentUnitPackage[key] = value;
        this.setState({shipmentUnitPackage: shipmentUnitPackage});
    }

    handleAddPackageClick(event) {

        let shipmentUnit = _.cloneDeep(this.state.shipmentUnit);
        let shipmentUnitPackage = _.cloneDeep(this.state.shipmentUnitPackage);
        let allFieldsOk = true;

        if (allFieldsOk && !shipmentUnit.type) {
            allFieldsOk = false;
            Notify.showError("Package type is required.");
        }

        if (allFieldsOk && !shipmentUnitPackage.count) {
            allFieldsOk = false;
            Notify.showError("Package count is required.");
        }

        if (allFieldsOk && !shipmentUnitPackage.lengthInCentimeters) {
            allFieldsOk = false;
            Notify.showError("Length is required.");
        }

        if (allFieldsOk && !shipmentUnitPackage.widthInCentimeters) {
            allFieldsOk = false;
            Notify.showError("Width is required.");
        }

        if (allFieldsOk && !shipmentUnitPackage.heightInCentimeters) {
            allFieldsOk = false;
            Notify.showError("Height is required.");
        }

        if (allFieldsOk && !shipmentUnitPackage.stackSize) {
            allFieldsOk = false;
            Notify.showError("Allowed stack size is required.");
        }

        if (allFieldsOk && this.state.senderRules && this.state.senderRules.length > 0) {

            // senderRules, sayfa açıldıktan sonra değişmediğinden cloneDeep yapmaya gerek yok.
            let senderRules = this.state.senderRules;
            let applicableSenderRules = _.filter(senderRules, (senderRule) => {
                return senderRule.packageType.code == shipmentUnit.type.code;
            });

            let atLeastOneSenderRuleMatches = applicableSenderRules.some((senderRule) => {
                let condition1 = (shipmentUnitPackage.lengthInCentimeters >= senderRule.minLength && shipmentUnitPackage.lengthInCentimeters <= senderRule.maxLength);
                let condition2 = (shipmentUnitPackage.widthInCentimeters >= senderRule.minWidth && shipmentUnitPackage.widthInCentimeters <= senderRule.maxWidth);
                let condition3 = (shipmentUnitPackage.heightInCentimeters >= senderRule.minHeight && shipmentUnitPackage.heightInCentimeters <= senderRule.maxHeight);
                let condition4 = (shipmentUnitPackage.stackSize <= senderRule.stackability);
                return (condition1 && condition2 && condition3 && condition4);
            });

            if (!atLeastOneSenderRuleMatches) {
                allFieldsOk = false;
                let errorMessage = "Following conditions must be met according to the sender rule" + (applicableSenderRules.length > 1 ? "s" : "") + ": ";
                applicableSenderRules.forEach((senderRule, index) => {
                    if (index > 0) {
                        errorMessage += " or ";
                    }
                    errorMessage += senderRule.minLength + " <= length <= " + senderRule.maxLength + ", ";
                    errorMessage += senderRule.minWidth + " <= width <= " + senderRule.maxWidth + ", ";
                    errorMessage += senderRule.minHeight + " <= height <= " + senderRule.maxHeight + ", ";
                    errorMessage += "allowed stack size <= " + senderRule.stackability;
                });
                Notify.showError(errorMessage);
            }
        }

        if (allFieldsOk) {

            axios.all([
                    OrderService.calculateLoadingMeter(
                        shipmentUnitPackage.widthInCentimeters, shipmentUnitPackage.lengthInCentimeters, shipmentUnitPackage.stackSize, shipmentUnitPackage.count),
                    OrderService.getPackageTypeRestrictions(
                        shipmentUnit.type.id)
            ]).then(axios.spread((ldmResponse, restrictionsResponse) => {

                if (this.validatePackageDimensions(shipmentUnitPackage, restrictionsResponse.data)) {

                    shipmentUnitPackage.rowId = uuid.v4();

                    shipmentUnit.shipmentUnitPackages.push(shipmentUnitPackage);

                    let volume = this.calculateVolumeInCubicMeters(
                        shipmentUnitPackage.lengthInCentimeters,
                        shipmentUnitPackage.widthInCentimeters,
                        shipmentUnitPackage.heightInCentimeters,
                        shipmentUnitPackage.count
                    );

                    shipmentUnit.totalVolumeInCubicMeters = shipmentUnit.totalVolumeInCubicMeters ? shipmentUnit.totalVolumeInCubicMeters + volume : volume;

                    let ldm = ldmResponse.data;

                    shipmentUnit.totalLdm = shipmentUnit.totalLdm ? shipmentUnit.totalLdm + ldm : ldm;

                    shipmentUnitPackage = {
                        count: null,
                        lengthInCentimeters: null,
                        widthInCentimeters: null,
                        heightInCentimeters: null,
                        stackSize: null
                    };

                    if (shipmentUnit.type.stackability) {
                        shipmentUnitPackage.stackSize = shipmentUnit.type.stackability;
                    }

                    this.setState({shipmentUnit: shipmentUnit, shipmentUnitPackage: shipmentUnitPackage});
                }

            })).catch(error => {
                Notify.showError(error);
            });
        }
    }

    calculateVolumeInCubicMeters(lengthInCentimeters, widthInCentimeters, heightInCentimeters, count) {
        let volume = lengthInCentimeters * widthInCentimeters * heightInCentimeters;
        volume = volume * count;
        volume = volume / (1000 * 1000); // cm3 to m3
        volume = _.round(volume, 2); // round to 2 decimal points
        return volume;
    }

    validatePackageDimensions(shipmentUnitPackage, restrictions) {
        let result = true;
        if(!this.validateRange("Length", restrictions.lengthRangeInCentimeters, shipmentUnitPackage.lengthInCentimeters)){
            result = false;
        }
        if(!this.validateRange("Width", restrictions.widthRangeInCentimeters, shipmentUnitPackage.widthInCentimeters)){
            result = false;
        }
        if(!this.validateRange("Height", restrictions.heightRangeInCentimeters, shipmentUnitPackage.heightInCentimeters)){
            result = false;
        }
        if(!this.validateTruckHeight(shipmentUnitPackage)){
            result = false;
        }
        return result;
    }

    validateRange(type, range, value){
        let result = true;
        let message = "";
        if(range && value){
            if(range.minValue && range.minValue > value){
                message = type + " must be greater than or equal to " + range.minValue;
                result = false;
            }
            if(range.maxValue && range.maxValue < value){
                message = type + " must be smaller than or equal to " + range.maxValue;
                result = false;
            }
        }
        if(!result){
            Notify.showError(message);
        }
        return result;
    }

    validateTruckHeight(shipmentUnitPackage){
        let totalHeight = shipmentUnitPackage.stackSize * shipmentUnitPackage.heightInCentimeters;
        let message = "";
        let result = true;
        if(totalHeight > MAX_TRUCK_HEIGHT_IN_CENTIMETERS){
            message = "Total package height must be smaller than " + MAX_TRUCK_HEIGHT_IN_CENTIMETERS + " cm.";
            result = false;
        }
        if(!result){
            Notify.showError(message);
        }
        return result;
    }

    validateTotalDimensions(shipmentUnit, restrictions){
        let result = true;

        if(!this.validateRange("Gross weight", restrictions.grossWeightRangeInKilograms, shipmentUnit.totalGrossWeightInKilograms)){
            result = false;
        }
        if(!this.validateRange("Net weight", restrictions.netWeightRangeInKilograms, shipmentUnit.totalNetWeightInKilograms)){
            result = false;
        }
        if(!this.validateRange("Volume", restrictions.volumeRangeInCubicMeters, shipmentUnit.totalVolumeInCubicMeters)){
            result = false;
        }
        return result;
    }

    handleDeletePackageClick(elem) {

        let stateWillBeSetAfterServiceResponse = false;
        let shipmentUnit = _.cloneDeep(this.state.shipmentUnit);

        _.remove(shipmentUnit.shipmentUnitPackages, item => {
            return item.rowId == elem.rowId;
        });

        if (_.size(shipmentUnit.shipmentUnitPackages) == 0) {

            shipmentUnit.totalGrossWeightInKilograms = null;
            shipmentUnit.totalNetWeightInKilograms = null;
            shipmentUnit.totalVolumeInCubicMeters = null;
            shipmentUnit.totalLdm = null;

        } else {

            if (shipmentUnit.totalVolumeInCubicMeters) {

                let volume = this.calculateVolumeInCubicMeters(
                    elem.lengthInCentimeters,
                    elem.widthInCentimeters,
                    elem.heightInCentimeters,
                    elem.count
                );

                shipmentUnit.totalVolumeInCubicMeters = shipmentUnit.totalVolumeInCubicMeters - volume;
            }

            if (shipmentUnit.totalLdm) {

                stateWillBeSetAfterServiceResponse = true;

                OrderService.calculateLoadingMeter(
                    elem.widthInCentimeters, elem.lengthInCentimeters, elem.stackSize, elem.count).then(ldmResponse => {

                    let ldm = ldmResponse.data;

                    shipmentUnit.totalLdm = shipmentUnit.totalLdm - ldm;

                    this.setState({shipmentUnit: shipmentUnit});

                }).catch(error => {
                    Notify.showError(error);
                });
            }

        }

        if (!stateWillBeSetAfterServiceResponse) {
            this.setState({shipmentUnit: shipmentUnit});
        }
    }

    handleSave() {

        let allFieldsOk = true;

        if (allFieldsOk && !this.state.shipmentUnit.type) {
            allFieldsOk = false;
            Notify.showError("Package type is required.");
        }

        if (allFieldsOk && _.size(this.state.shipmentUnit.shipmentUnitPackages) == 0) {
            allFieldsOk = false;
            Notify.showError("At least 1 package must be added.");
        }

        if (allFieldsOk && !this.state.shipmentUnit.totalGrossWeightInKilograms) {
            allFieldsOk = false;
            Notify.showError("Total gross weight is required.");
        }

        if (allFieldsOk && !this.state.shipmentUnit.totalNetWeightInKilograms) {
            allFieldsOk = false;
            Notify.showError("Total net weight is required.");
        }

        if (allFieldsOk && !this.state.shipmentUnit.totalVolumeInCubicMeters) {
            allFieldsOk = false;
            Notify.showError("Total volume is required.");
        }

        if (allFieldsOk && !this.state.shipmentUnit.totalLdm) {
            allFieldsOk = false;
            Notify.showError("Total LDM is required.");
        }

        if (allFieldsOk && this.state.senderRules && this.state.senderRules.length > 0) {

            // senderRules, sayfa açıldıktan sonra değişmediğinden cloneDeep yapmaya gerek yok.
            let senderRules = this.state.senderRules;

            let applicableSenderRules = _.filter(senderRules, (senderRule) => {
                return senderRule.packageType.code == this.state.shipmentUnit.type.code;
            });

            let minGrossWeightPerPackage = _.min(applicableSenderRules.map((senderRule) => { return senderRule.minGrossWeight; }));
            let maxGrossWeightPerPackage = _.max(applicableSenderRules.map((senderRule) => { return senderRule.maxGrossWeight; }));

            let totalPackageCount = 0;

            this.state.shipmentUnit.shipmentUnitPackages.forEach(elem => {
                totalPackageCount += elem.count;
            });

            let minTotalGrossWeight = totalPackageCount * minGrossWeightPerPackage;
            let maxTotalGrossWeight = totalPackageCount * maxGrossWeightPerPackage;

            if (this.state.shipmentUnit.totalGrossWeightInKilograms < minTotalGrossWeight ||
                this.state.shipmentUnit.totalGrossWeightInKilograms > maxTotalGrossWeight) {
                allFieldsOk = false;
                let errorMessage = "Following conditions must be met according to the sender rule" + (applicableSenderRules.length > 1 ? "s" : "") + ": ";
                errorMessage += minTotalGrossWeight + " <= total gross weight <= " + maxTotalGrossWeight;
                Notify.showError(errorMessage);
            }
        }

        if (allFieldsOk) {

            OrderService.getPackageTypeRestrictions(this.state.shipmentUnit.type.id).then(response => {

                if (this.validateTotalDimensions(this.state.shipmentUnit, response.data)) {
                    this.props.onsave && this.props.onsave(this.state.shipmentUnit);
                    this.close();
                }

            }).catch(error => {
                Notify.showError(error);
            });
        }
    }

    render() {

        let hasAtLeastOneShipmentUnitPackage = _.size(this.state.shipmentUnit.shipmentUnitPackages) > 0 ? true : false;
        let packageType;
        let rightSide;

        if (hasAtLeastOneShipmentUnitPackage) {

            packageType = (
                // readOnly DropDown çalışmadı, bu nedenle disabled TextInput kullandım.
                <TextInput label="Package Type"
                           required={true}
                           value={this.state.shipmentUnit.type.name}
                           disabled={true}/>
            );

            rightSide = (
                <Grid>
                    <GridCell width="1-1" noMargin={true}>
                        {super.translate("Packages")}
                    </GridCell>
                    <GridCell width="1-1">
                        <Table headers={this.tableHeaders}
                               data={this.state.shipmentUnit.shipmentUnitPackages}
                               actions={this.tableActions}
                               hover={true} />
                    </GridCell>
                    <GridCell width="1-1">
                    </GridCell>
                    <GridCell width="1-1">
                        {super.translate("Total Values For Shipment Unit")}
                    </GridCell>
                    <GridCell width="1-1">
                        <Grid>
                            <GridCell width="1-2" noMargin={true}>
                                <NumericInput label="Total Gross Weight (kg)"
                                              required={true}
                                              digits="2"
                                              digitsOptional={true}
                                              mdiIcon="weight-kilogram"
                                              value={this.state.shipmentUnit.totalGrossWeightInKilograms}
                                              onchange={(val) => this.updateShipmentUnitState("totalGrossWeightInKilograms", val)}/>
                            </GridCell>
                            <GridCell width="1-2" noMargin={true}>
                                <NumericInput label="Total Net Weight (kg)"
                                              required={true}
                                              digits="2"
                                              digitsOptional={true}
                                              mdiIcon="weight-kilogram"
                                              value={this.state.shipmentUnit.totalNetWeightInKilograms}
                                              onchange={(val) => this.updateShipmentUnitState("totalNetWeightInKilograms", val)}/>
                            </GridCell>
                            <GridCell width="1-2">
                                <NumericInput label="Total Volume (m3)"
                                              required={true}
                                              digits="2"
                                              digitsOptional={true}
                                              mdiIcon="cube-outline"
                                              value={this.state.shipmentUnit.totalVolumeInCubicMeters}
                                              onchange={(val) => this.updateShipmentUnitState("totalVolumeInCubicMeters", val)}/>
                            </GridCell>
                            <GridCell width="1-2">
                                <NumericInput label="Total LDM (ldm)"
                                              required={true}
                                              digits="2"
                                              digitsOptional={true}
                                              mdiIcon="cube-unfolded"
                                              value={this.state.shipmentUnit.totalLdm}
                                              onchange={(val) => this.updateShipmentUnitState("totalLdm", val)}/>
                            </GridCell>
                        </Grid>
                    </GridCell>
                </Grid>
            );

        } else {

            packageType = (
                <DropDown label="Package Type"
                          required={true}
                          value={this.state.shipmentUnit.type}
                          options={this.state.shownPackageTypes}
                          onchange={(value)=> this.updateShipmentUnitState("type", value)}/>
            );

            rightSide = ("");
        }

        let isStackSizeDisabled = false;

        if (this.state.shipmentUnit.type && this.state.shipmentUnit.type.stackability) {
            isStackSizeDisabled = true;
        }

        return (
            <Modal title="Shipment Unit"
                   ref={(c) => this.modal = c}
                   large={true}
                   actions={
                       [
                           {label: "Close", action: () => this.close()},
                           {label: "Save", buttonStyle:"primary", action:() => this.handleSave()}
                       ]
                   }>
                <Grid divider={true}>
                    <GridCell width="3-10" noMargin={true}>
                        <Grid>
                            <GridCell width="1-1" noMargin={true}>
                                {packageType}
                            </GridCell>
                            <GridCell width="1-1">
                                <NumericInput label="Package Count"
                                              required={true}
                                              digits="0"
                                              digitsOptional={false}
                                              mdiIcon="package-variant-closed"
                                              value={this.state.shipmentUnitPackage.count}
                                              onchange={(val) => this.updateShipmentUnitPackageState("count", val)}/>
                            </GridCell>
                            <GridCell width="1-1">
                                <NumericInput label="Length (cm)"
                                              required={true}
                                              digits="2"
                                              digitsOptional={true}
                                              mdiIcon="ruler"
                                              value={this.state.shipmentUnitPackage.lengthInCentimeters}
                                              onchange={(val) => this.updateShipmentUnitPackageState("lengthInCentimeters", val)}/>
                            </GridCell>
                            <GridCell width="1-1">
                                <NumericInput label="Width (cm)"
                                              required={true}
                                              digits="2"
                                              digitsOptional={true}
                                              mdiIcon="ruler"
                                              value={this.state.shipmentUnitPackage.widthInCentimeters}
                                              onchange={(val) => this.updateShipmentUnitPackageState("widthInCentimeters", val)}/>
                            </GridCell>
                            <GridCell width="1-1">
                                <NumericInput label="Height (cm)"
                                              required={true}
                                              digits="2"
                                              digitsOptional={true}
                                              mdiIcon="ruler"
                                              value={this.state.shipmentUnitPackage.heightInCentimeters}
                                              onchange={(val) => this.updateShipmentUnitPackageState("heightInCentimeters", val)}/>
                            </GridCell>
                            <GridCell width="1-1">
                                <NumericInput label="Allowed Stack Size"
                                              required={true}
                                              digits="0"
                                              digitsOptional={false}
                                              mdIcon="view_stream"
                                              value={this.state.shipmentUnitPackage.stackSize}
                                              disabled={isStackSizeDisabled}
                                              onchange={(val) => this.updateShipmentUnitPackageState("stackSize", val)}/>
                            </GridCell>
                            <GridCell width="1-1">
                                <div className="uk-text-right">
                                    <Button label="Add Package" size="small" style="success" waves={true} onclick={(event) => this.handleAddPackageClick(event)}/>
                                </div>
                            </GridCell>
                        </Grid>
                    </GridCell>
                    <GridCell width="7-10" noMargin={true}>
                        {rightSide}
                    </GridCell>
                </Grid>
            </Modal>
        );
    }
}

ShipmentUnitModal.contextTypes = {
    translator: React.PropTypes.object
};