import React from 'react';
import * as axios from 'axios';

import {Table} from 'susam-components/table';
import {Button, DropDown, Checkbox, TextInput, TextArea, Notify} from 'susam-components/basic';
import {NumericInput} from 'susam-components/advanced';
import {Card, Grid, GridCell, Modal} from 'susam-components/layout';
import {PackageTypeService} from '../services';

const MODE_ADD = 1;
const MODE_UPDATE = 2;

export class AddUpdatePackageTypeRestriction extends React.Component {

    constructor(props) {

        super(props);

        this.state = {};

        this.prepareState(MODE_ADD, this.state, {});

        this.modalActions = [
            {
                label: "Cancel",
                action: () => this.handleCancel()
            },
            {
                label: "Save & Close",
                buttonStyle: "primary",
                action: () => this.handleSaveAndClose()
            }
        ];
    };

    componentDidMount() {
    }

    prepareGrossWeight(state, grossWeightRangeInKilograms) {

        if (grossWeightRangeInKilograms &&
                (grossWeightRangeInKilograms.minValue || grossWeightRangeInKilograms.minValue === 0)) {
            state.hasMinGrossWeight = true;
            state.minGrossWeightInKilograms = grossWeightRangeInKilograms.minValue;
        } else {
            state.hasMinGrossWeight = false;
            state.minGrossWeightInKilograms = "";
        }

        if (grossWeightRangeInKilograms &&
                (grossWeightRangeInKilograms.maxValue || grossWeightRangeInKilograms.maxValue === 0)) {
            state.hasMaxGrossWeight = true;
            state.maxGrossWeightInKilograms = grossWeightRangeInKilograms.maxValue;
        } else {
            state.hasMaxGrossWeight = false;
            state.maxGrossWeightInKilograms = "";
        }
    }

    prepareNetWeight(state, netWeightRangeInKilograms) {

        if (netWeightRangeInKilograms &&
                (netWeightRangeInKilograms.minValue || netWeightRangeInKilograms.minValue === 0)) {
            state.hasMinNetWeight = true;
            state.minNetWeightInKilograms = netWeightRangeInKilograms.minValue;
        } else {
            state.hasMinNetWeight = false;
            state.minNetWeightInKilograms = "";
        }

        if (netWeightRangeInKilograms &&
                (netWeightRangeInKilograms.maxValue || netWeightRangeInKilograms.maxValue === 0)) {
            state.hasMaxNetWeight = true;
            state.maxNetWeightInKilograms = netWeightRangeInKilograms.maxValue;
        } else {
            state.hasMaxNetWeight = false;
            state.maxNetWeightInKilograms = "";
        }
    }

    prepareVolume(state, volumeRangeInCubicMeters) {

        if (volumeRangeInCubicMeters &&
                (volumeRangeInCubicMeters.minValue || volumeRangeInCubicMeters.minValue === 0)) {
            state.hasMinVolume = true;
            state.minVolumeInCubicMeters = volumeRangeInCubicMeters.minValue;
        } else {
            state.hasMinVolume = false;
            state.minVolumeInCubicMeters = "";
        }

        if (volumeRangeInCubicMeters &&
                (volumeRangeInCubicMeters.maxValue || volumeRangeInCubicMeters.maxValue === 0)) {
            state.hasMaxVolume = true;
            state.maxVolumeInCubicMeters = volumeRangeInCubicMeters.maxValue;
        } else {
            state.hasMaxVolume = false;
            state.maxVolumeInCubicMeters = "";
        }
    }

    prepareWidth(state, widthRangeInCentimeters) {

        if (widthRangeInCentimeters &&
                (widthRangeInCentimeters.minValue || widthRangeInCentimeters.minValue === 0)) {
            state.hasMinWidth = true;
            state.minWidthInCentimeters = widthRangeInCentimeters.minValue;
        } else {
            state.hasMinWidth = false;
            state.minWidthInCentimeters = "";
        }

        if (widthRangeInCentimeters &&
                (widthRangeInCentimeters.maxValue || widthRangeInCentimeters.maxValue === 0)) {
            state.hasMaxWidth = true;
            state.maxWidthInCentimeters = widthRangeInCentimeters.maxValue;
        } else {
            state.hasMaxWidth = false;
            state.maxWidthInCentimeters = "";
        }
    }

    prepareLength(state, lengthRangeInCentimeters) {

        if (lengthRangeInCentimeters &&
                (lengthRangeInCentimeters.minValue || lengthRangeInCentimeters.minValue === 0)) {
            state.hasMinLength = true;
            state.minLengthInCentimeters = lengthRangeInCentimeters.minValue;
        } else {
            state.hasMinLength = false;
            state.minLengthInCentimeters = "";
        }

        if (lengthRangeInCentimeters &&
                (lengthRangeInCentimeters.maxValue || lengthRangeInCentimeters.maxValue === 0)) {
            state.hasMaxLength = true;
            state.maxLengthInCentimeters = lengthRangeInCentimeters.maxValue;
        } else {
            state.hasMaxLength = false;
            state.maxLengthInCentimeters = "";
        }
    }

    prepareHeight(state, heightRangeInCentimeters) {

        if (heightRangeInCentimeters &&
                (heightRangeInCentimeters.minValue || heightRangeInCentimeters.minValue === 0)) {
            state.hasMinHeight = true;
            state.minHeightInCentimeters = heightRangeInCentimeters.minValue;
        } else {
            state.hasMinHeight = false;
            state.minHeightInCentimeters = "";
        }

        if (heightRangeInCentimeters &&
                (heightRangeInCentimeters.maxValue || heightRangeInCentimeters.maxValue === 0)) {
            state.hasMaxHeight = true;
            state.maxHeightInCentimeters = heightRangeInCentimeters.maxValue;
        } else {
            state.hasMaxHeight = false;
            state.maxHeightInCentimeters = "";
        }
    }

    prepareLdm(state, ldmRange) {

        if (ldmRange &&
            (ldmRange.minValue || ldmRange.minValue === 0)) {
            state.hasMinLdm = true;
            state.minLdm = ldmRange.minValue;
        } else {
            state.hasMinLdm = false;
            state.minLdm = "";
        }

        if (ldmRange &&
            (ldmRange.maxValue || ldmRange.maxValue === 0)) {
            state.hasMaxLdm = true;
            state.maxLdm = ldmRange.maxValue;
        } else {
            state.hasMaxLdm = false;
            state.maxLdm = "";
        }
    }

    prepareState(mode, state, packageTypeRestriction) {

        state.packageTypeRestriction = packageTypeRestriction;

        this.prepareGrossWeight(state, state.packageTypeRestriction.grossWeightRangeInKilograms);
        this.prepareNetWeight(state, state.packageTypeRestriction.netWeightRangeInKilograms);
        this.prepareVolume(state, state.packageTypeRestriction.volumeRangeInCubicMeters);
        this.prepareWidth(state, state.packageTypeRestriction.widthRangeInCentimeters);
        this.prepareLength(state, state.packageTypeRestriction.lengthRangeInCentimeters);
        this.prepareHeight(state, state.packageTypeRestriction.heightRangeInCentimeters);
        this.prepareLdm(state, state.packageTypeRestriction.ldmRange);

        if (state.packageTypeRestriction.stackable) {
            state.stackable = state.packageTypeRestriction.stackable;
        } else {
            state.stackable = false;
        }

        state.mode = mode;
    }
    
    openForAdd(data) {
        let state = _.cloneDeep(this.state);
        this.prepareState(MODE_ADD, state, _.cloneDeep(data.packageTypeRestriction));
        this.setState(state);
        this.modalReference.open();
    }

    openForUpdate(data) {
        let state = _.cloneDeep(this.state);
        this.prepareState(MODE_UPDATE, state, _.cloneDeep(data.packageTypeRestriction));
        this.setState(state);
        this.modalReference.open();
    }

    close() {
        this.modalReference.close();
    }

    handleCancel() {
        this.close();
    }

    handleSaveAndClose() {
        this.handleSave(true);
    }

    handleSave(toBeClosed) {

        // gross weight
        this.state.packageTypeRestriction.grossWeightRangeInKilograms = {
            minValue: "",
            maxValue: ""
        };
        if (this.state.hasMinGrossWeight) {
            this.state.packageTypeRestriction.grossWeightRangeInKilograms.minValue = this.state.minGrossWeightInKilograms;
        }
        if (this.state.hasMaxGrossWeight) {
            this.state.packageTypeRestriction.grossWeightRangeInKilograms.maxValue = this.state.maxGrossWeightInKilograms;
        }

        // net weight
        this.state.packageTypeRestriction.netWeightRangeInKilograms = {
            minValue: "",
            maxValue: ""
        };
        if (this.state.hasMinNetWeight) {
            this.state.packageTypeRestriction.netWeightRangeInKilograms.minValue = this.state.minNetWeightInKilograms;
        }
        if (this.state.hasMaxNetWeight) {
            this.state.packageTypeRestriction.netWeightRangeInKilograms.maxValue = this.state.maxNetWeightInKilograms;
        }

        // volume
        this.state.packageTypeRestriction.volumeRangeInCubicMeters = {
            minValue: "",
            maxValue: ""
        };
        if (this.state.hasMinVolume) {
            this.state.packageTypeRestriction.volumeRangeInCubicMeters.minValue = this.state.minVolumeInCubicMeters;
        }
        if (this.state.hasMaxVolume) {
            this.state.packageTypeRestriction.volumeRangeInCubicMeters.maxValue = this.state.maxVolumeInCubicMeters;
        }

        // width
        this.state.packageTypeRestriction.widthRangeInCentimeters = {
            minValue: "",
            maxValue: ""
        };
        if (this.state.hasMinWidth) {
            this.state.packageTypeRestriction.widthRangeInCentimeters.minValue = this.state.minWidthInCentimeters;
        }
        if (this.state.hasMaxWidth) {
            this.state.packageTypeRestriction.widthRangeInCentimeters.maxValue = this.state.maxWidthInCentimeters;
        }

        // length
        this.state.packageTypeRestriction.lengthRangeInCentimeters = {
            minValue: "",
            maxValue: ""
        };
        if (this.state.hasMinLength) {
            this.state.packageTypeRestriction.lengthRangeInCentimeters.minValue = this.state.minLengthInCentimeters;
        }
        if (this.state.hasMaxLength) {
            this.state.packageTypeRestriction.lengthRangeInCentimeters.maxValue = this.state.maxLengthInCentimeters;
        }

        // height
        this.state.packageTypeRestriction.heightRangeInCentimeters = {
            minValue: "",
            maxValue: ""
        };
        if (this.state.hasMinHeight) {
            this.state.packageTypeRestriction.heightRangeInCentimeters.minValue = this.state.minHeightInCentimeters;
        }
        if (this.state.hasMaxHeight) {
            this.state.packageTypeRestriction.heightRangeInCentimeters.maxValue = this.state.maxHeightInCentimeters;
        }

        // ldm
        this.state.packageTypeRestriction.ldmRange = {
            minValue: "",
            maxValue: ""
        };
        if (this.state.hasMinLdm) {
            this.state.packageTypeRestriction.ldmRange.minValue = this.state.minLdm;
        }
        if (this.state.hasMaxLdm) {
            this.state.packageTypeRestriction.ldmRange.maxValue = this.state.maxLdm;
        }

        // stack
        this.state.packageTypeRestriction.stackable = this.state.stackable;

        if (this.state.mode == MODE_ADD) {

            PackageTypeService.addRestriction(this.state.packageTypeRestriction)
                .then((response) => {
                    if (this.props.afterSuccessfulAdd) {
                        this.props.afterSuccessfulAdd(response.data);
                    }
                    if (toBeClosed) {
                        this.close();
                    }
                })
                .catch((error) => {
                    Notify.showError(error);
                });

        } else {

            PackageTypeService.updateRestriction(this.state.packageTypeRestriction)
                .then((response) => {
                    if (this.props.afterSuccessfulUpdate) {
                        this.props.afterSuccessfulUpdate(response.data);
                    }
                    if (toBeClosed) {
                        this.close();
                    }
                })
                .catch((error) => {
                    Notify.showError(error);
                });
        }
    }

    handleValueChange(field, value) {
        this.state[field] = value;
        this.setState(this.state);
    }

    render() {
        return (
            <Modal title="Package Type Restriction"
                   large={true}
                   ref={(c) => this.modalReference = c}
                   actions={this.modalActions}>
                <Grid>
                    <GridCell width="1-4">
                        <Checkbox label="Has Minimum Width"
                                  checked={this.state.hasMinWidth}
                                  onchange={(value) => this.handleValueChange("hasMinWidth", value)} />
                    </GridCell>

                    <GridCell width="1-4">
                        <NumericInput label="Minimum Width"
                                      value={this.state.minWidthInCentimeters}
                                      onchange={(value) => this.handleValueChange("minWidthInCentimeters", value)}
                                      required={true}
                                      disabled={this.state.hasMinWidth == false}
                                      digits="3"
                                      digitsOptional={true}
                                      unit="cm"
                                      placeholder="" />
                    </GridCell>

                    <GridCell width="1-4">
                        <Checkbox label="Has Maximum Width"
                                  checked={this.state.hasMaxWidth}
                                  onchange={(value) => this.handleValueChange("hasMaxWidth", value)} />
                    </GridCell>

                    <GridCell width="1-4">
                        <NumericInput label="Maximum Width"
                                      value={this.state.maxWidthInCentimeters}
                                      onchange={(value) => this.handleValueChange("maxWidthInCentimeters", value)}
                                      required={true}
                                      disabled={this.state.hasMaxWidth == false}
                                      digits="3"
                                      digitsOptional={true}
                                      unit="cm"
                                      placeholder="" />
                    </GridCell>

                    <GridCell width="1-4">
                        <Checkbox label="Has Minimum Length"
                                  checked={this.state.hasMinLength}
                                  onchange={(value) => this.handleValueChange("hasMinLength", value)} />
                    </GridCell>

                    <GridCell width="1-4">
                        <NumericInput label="Minimum Length"
                                      value={this.state.minLengthInCentimeters}
                                      onchange={(value) => this.handleValueChange("minLengthInCentimeters", value)}
                                      required={true}
                                      disabled={this.state.hasMinLength == false}
                                      digits="3"
                                      digitsOptional={true}
                                      unit="cm"
                                      placeholder="" />
                    </GridCell>

                    <GridCell width="1-4">
                        <Checkbox label="Has Maximum Length"
                                  checked={this.state.hasMaxLength}
                                  onchange={(value) => this.handleValueChange("hasMaxLength", value)} />
                    </GridCell>

                    <GridCell width="1-4">
                        <NumericInput label="Maximum Length"
                                      value={this.state.maxLengthInCentimeters}
                                      onchange={(value) => this.handleValueChange("maxLengthInCentimeters", value)}
                                      required={true}
                                      disabled={this.state.hasMaxLength == false}
                                      digits="3"
                                      digitsOptional={true}
                                      unit="cm"
                                      placeholder="" />
                    </GridCell>

                    <GridCell width="1-4">
                        <Checkbox label="Has Minimum Height"
                                  checked={this.state.hasMinHeight}
                                  onchange={(value) => this.handleValueChange("hasMinHeight", value)} />
                    </GridCell>

                    <GridCell width="1-4">
                        <NumericInput label="Minimum Height"
                                      value={this.state.minHeightInCentimeters}
                                      onchange={(value) => this.handleValueChange("minHeightInCentimeters", value)}
                                      required={true}
                                      disabled={this.state.hasMinHeight == false}
                                      digits="3"
                                      digitsOptional={true}
                                      unit="cm"
                                      placeholder="" />
                    </GridCell>

                    <GridCell width="1-4">
                        <Checkbox label="Has Maximum Height"
                                  checked={this.state.hasMaxHeight}
                                  onchange={(value) => this.handleValueChange("hasMaxHeight", value)} />
                    </GridCell>

                    <GridCell width="1-4">
                        <NumericInput label="Maximum Height"
                                      value={this.state.maxHeightInCentimeters}
                                      onchange={(value) => this.handleValueChange("maxHeightInCentimeters", value)}
                                      required={true}
                                      disabled={this.state.hasMaxHeight == false}
                                      digits="3"
                                      digitsOptional={true}
                                      unit="cm"
                                      placeholder="" />
                    </GridCell>
                </Grid>
            </Modal>
        );
    }

}
