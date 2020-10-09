import * as axios from "axios";
import React from "react";
import _ from "lodash";
import PropTypes from "prop-types";

import { TranslatingComponent } from 'susam-components/abstract';
import { NumericInput } from "susam-components/advanced";
import { DropDown, Form, Notify } from 'susam-components/basic';
import { Grid, GridCell } from "susam-components/layout";
import { LookupService } from '../services';

export class Package extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = { payWeights: {} };
        this.isVolumeUpdatedByUser = false;
        this.isLdmUpdatedByUser = false;
    }

    componentDidMount() {
        this.initializeLookups();
    }

    initializeLookups() {
        axios.all([
            LookupService.getPackageTypes(),
            LookupService.getStackabilityTypes(),
            LookupService.getHangingGoodsCategories()
        ]).then(axios.spread((packageTypes, stackabilityTypes, hangingGoodsCategoriesResponse) => {
            let state = _.cloneDeep(this.state);
            state.packageTypes = packageTypes.data;
            state.stackabilityTypes = stackabilityTypes.data.map(stackabilityType => { return { id: stackabilityType, code: stackabilityType, name: stackabilityType } });
            state.hangingGoodsCategories = hangingGoodsCategoriesResponse.data;
            this.setState(state);
        })).catch(error => {
            Notify.showError(error);
        })
    }

    handleChange(key, value) {

        if (!this.isVolumeUpdatedByUser && key == "measurement.volume") {
            this.isVolumeUpdatedByUser = true;
        }

        if (!this.isLdmUpdatedByUser && key == "measurement.ldm") {
            this.isLdmUpdatedByUser = true;
        }

        let overwriteVolume = (this.isVolumeUpdatedByUser ? false : true);
        let overwriteLdm = (this.isLdmUpdatedByUser ? false : true);

        let quotePackage = _.cloneDeep(this.props.quotePackage);

        _.set(quotePackage, key, value);

        if (key == "type") {
            if (value == "Box") {
                _.set(quotePackage, "hangingGoodsCategory", null);
                if (!quotePackage.stackabilityType) {
                    _.set(quotePackage, "stackabilityType", "MAX_AMOUNT");
                }
            } else if (value == "Stange") {
                _.set(quotePackage, "stackabilityType", null);
                _.set(quotePackage, "dimension.length", 240);
            }
        }

        if(key=="dimension.width"){
            if (value && value > 0 && !quotePackage.dimension.length) {
                _.set(quotePackage, "dimension.length", 0);
            }
        }
        if (key === "dimension.length" && !value && quotePackage.dimension.width > 0) {
            _.set(quotePackage, "dimension.length", 0);
        }

        this.props.onChange(quotePackage, overwriteVolume, overwriteLdm);
    }

    validate() {

        if (!this.form.validate()) {
            return false;
        } else {

            let quotePackage = this.props.quotePackage;
            let measurement = quotePackage.measurement;
            let dimension = quotePackage.dimension ? quotePackage.dimension : {};

            if ((!_.isNumber(measurement.ldm) && !_.isNumber(measurement.volume)) || ((0 === measurement.ldm) && (0 === measurement.volume)) || ( (_.isNil(measurement.ldm) || (0 === measurement.ldm)) && (_.isNil(measurement.volume) || (0 === measurement.volume) ) )) {
                Notify.showError("LDM or volume should be entered.");
                return false;
            }

            if (_.isNumber(measurement.ldm) && measurement.ldm < quotePackage.calculatedLdm) {
                Notify.showError("LDM cannot be less than calculated LDM.");
                return false;
            }

            if (_.isNumber(measurement.volume) && measurement.volume < quotePackage.calculatedVolume) {
                Notify.showError("Volume cannot be less than calculated volume.");
                return false;
            }

            if (_.isNumber(dimension.width) && _.isNumber(dimension.length) && dimension.width > dimension.length) {
                Notify.showError("Width cannot be greater than length.");
                return false;
            }

            if (quotePackage.hangingGoodsCategory) {
                if (_.isNumber(dimension.height) && Math.floor(quotePackage.hangingGoodsCategory.coefficient) * dimension.height > 300) {
                    Notify.showError("The product of height and category cannot be greater than 300.");
                    return false;
                }
            }
            if (quotePackage.type!="Stange"&& dimension.height*quotePackage.ldmCalculationParams.stackSize>300){
                Notify.showError("Height x Stackability value can't exceed 300!");
                return false;
            }

            return true;
        }
    }

    renderStackabilityTypeOrHangingGoodsCategory() {
        if (this.props.quotePackage.type) {
            if (this.props.quotePackage.type == "Stange") {
                return this.renderHangingGoodsCategory();
            } else {
                return this.renderStackabilityType();
            }
        } else {
            return this.renderStackabilityType();
        }
    }

    renderStackabilityType() {
        if (this.props.quotePackage.type == "Box") {
            return (
                <DropDown options={this.state.stackabilityTypes} label="Stackability"
                          value={this.props.quotePackage.stackabilityType} translate={true}
                          onchange={(value) => this.handleChange("stackabilityType", value ? value.code : null)}/>
            )
        } else {
            return (
                <DropDown options={this.state.stackabilityTypes} label="Stackability" required={true}
                          value={this.props.quotePackage.stackabilityType} translate={true}
                          onchange={(value) => this.handleChange("stackabilityType", value ? value.code : null)}/>
            )
        }
    }

    renderHangingGoodsCategory() {
        return (
            <DropDown options={this.state.hangingGoodsCategories} label="Category"
                      value={this.props.quotePackage.hangingGoodsCategory} translate={true}
                      onchange={(value) => this.handleChange("hangingGoodsCategory", value)} />
        );
    }

    getHelperTextForLdm() {
        if (_.isNumber(this.props.quotePackage.calculatedLdm)) {
            return super.translate("Calculated LDM") + ": " + this.props.quotePackage.calculatedLdm;
        } else {
            return null;
        }
    }

    getHelperTextForVolume() {
        if (_.isNumber(this.props.quotePackage.calculatedVolume)) {
            return super.translate("Calculated Volume") + ": " + this.props.quotePackage.calculatedVolume;
        } else {
            return null;
        }
    }

    isLengthDisabled() {
        let quotePackage = this.props.quotePackage;
        if (quotePackage.type == "Stange") {
            return true;
        } else {
            return false;
        }
    }

    render() {
        let dimension = this.props.quotePackage.dimension ? this.props.quotePackage.dimension : {};
        let measurement = this.props.quotePackage.measurement;
        return (
            <Form ref={c => this.form = c}>
                <Grid widthLarge={true}>
                    <GridCell width="1-3">
                        <DropDown options={this.state.packageTypes} label="Packaging" labelField="name" valueField="code"
                            value={this.props.quotePackage.type} required={true} translate={true}
                            onchange={(value) => this.handleChange("type", value ? value.code : null)} />
                    </GridCell>
                    <GridCell width="1-3">
                        <NumericInput label="Quantity" maxLength={"8"} style={{ textAlign: "right" }}
                            value={this.props.quotePackage.quantity} required={true}
                            onchange={(value) => this.handleChange("quantity", value)} />
                    </GridCell>
                    <GridCell width="1-3">
                        {this.renderStackabilityTypeOrHangingGoodsCategory()}
                    </GridCell>
                    <GridCell width="1-3">
                        <NumericInput label="Width" maxLength={"5"} unit="cm." style={{ textAlign: "right" }}
                            value={dimension.width}
                            onchange={(value) => this.handleChange("dimension.width", value)} />
                    </GridCell>
                    <GridCell width="1-3">
                        <NumericInput label="Length" maxLength={"5"} unit="cm." style={{ textAlign: "right" }} disabled={this.isLengthDisabled()}
                            value={dimension.length}
                            onchange={(value) => this.handleChange("dimension.length", value)} />
                    </GridCell>
                    <GridCell width="1-3">
                        <NumericInput label="Height" maxLength={"5"} unit="cm." style={{ textAlign: "right" }}
                            value={dimension.height}
                            onchange={(value) => this.handleChange("dimension.height", value)} />
                    </GridCell>
                    <GridCell width="1-3">
                        <NumericInput label="Weight" digits="2" digitsOptional={true} unit="kg."
                            value={measurement.weight}
                            onchange={(value) => this.handleChange("measurement.weight", value)} />
                    </GridCell>
                    <GridCell width="1-3">
                        <NumericInput label="LDM" digits="2" digitsOptional={true} helperText={this.getHelperTextForLdm()}
                            value={measurement.ldm}
                            onchange={(value) => this.handleChange("measurement.ldm", value)} />
                    </GridCell>
                    <GridCell width="1-3">
                        <NumericInput label="Volume" digits="2" digitsOptional={true} unit="m³" helperText={this.getHelperTextForVolume()}
                            value={measurement.volume}
                            onchange={(value) => this.handleChange("measurement.volume", value)} />
                    </GridCell>
                </Grid>
            </Form>
        );
    }
}
Package.contextTypes = {
    translator: PropTypes.object
};
