import React from "react";
import PropTypes from "prop-types";
import _ from 'lodash';
import {TranslatingComponent} from 'susam-components/abstract';
import {Button, Notify} from "susam-components/basic";
import {NumericInput} from "susam-components/advanced";
import {Card, Grid, GridCell, Modal, LoaderWrapper} from 'susam-components/layout';
import * as DataTable from 'susam-components/datatable';
import {Package} from "./Package";
import uuid from 'uuid';
import {ActionHeader} from '../utils/ActionHeader';
import {PackageUtils} from "../utils/PackageUtils";
import {QuoteUtils} from "../utils/QuoteUtils";
import * as Constants from "../common/Constants";

export class PackageList extends TranslatingComponent {
    
    constructor(props) {
        super(props);
        this.state = {};
        this.numberWithScalePrinter = new NumericPrinter(2);
        this.numberWithoutScalePrinter = new NumericPrinter();
        this.idForPackageFormSaveButton = uuid.v4();
    }

    updateState(key, value, overwriteVolume, overwriteLdm) {

        if (key == "quotePackage" && value) {

                this.handleQuotePackageUpdateStart();

                let quotePackage = value;

                let callback = (quotePackageAfterCalculation) => {
                    if (!_.isEqual(quotePackage, quotePackageAfterCalculation)) {
                        let measurement = quotePackageAfterCalculation.measurement;
                        if (overwriteVolume && _.isNumber(quotePackageAfterCalculation.calculatedVolume)) {
                            measurement.volume = quotePackageAfterCalculation.calculatedVolume;
                        }
                        if (overwriteLdm && _.isNumber(quotePackageAfterCalculation.calculatedLdm)) {
                            measurement.ldm = quotePackageAfterCalculation.calculatedLdm;
                        }
                    }
                    this.setState({
                        quotePackage: quotePackageAfterCalculation,
                        quotePackageUpdateCheckKey: this.quotePackageUpdateCheckKey
                    });
                };

                let callbackOnError = () => {
                    // İçeriği değişmiş olan TextInput, NumberInput gibi komponentleri eski haline getirmek için eski quotePackage değerini veriyoruz.
                    this.setState({
                        quotePackage: _.cloneDeep(this.state.quotePackage),
                        quotePackageUpdateCheckKey: this.quotePackageUpdateCheckKey
                    });
                };

                PackageUtils.calculateVolumeAndLdmIfNecessary(quotePackage, callback, callbackOnError);

        } else {
            this.setState({[key]: value});
        }
    }

    handleQuotePackageUpdateStart() {
        this.quotePackageUpdateCheckKey = uuid.v4();
    }

    validate() {
        let quote = _.cloneDeep(this.props.quote);
        if (quote.serviceArea.code === 'ROAD') {
            let measurement = quote.measurement ? quote.measurement : {};
            if (!_.isEmpty(quote.products)) {
                let product = quote.products[0];
                if (product.shipmentLoadingType == "FTL") {
                    let mainService = QuoteUtils.getMainService(quote);
                    let expectedLdm = mainService && mainService.type.code == "SPEEDY" ? Constants.FTL_TOTAL_LDM_SPEEDY :  mainService && mainService.type.code == "SPEEDY_VAN" ?  Constants.FTL_TOTAL_LDM_SPEEDY_VAN : Constants.FTL_TOTAL_LDM;
                    if (!measurement.ldm || measurement.ldm != expectedLdm) {
                        Notify.showError(`Total LDM value must be equal to ${expectedLdm}`);
                        return false;
                    }
                }
            }
            if (!measurement.weight || measurement.weight <= 0) {
                Notify.showError("Total weight value must be entered");
                return false;
            }
        }
        return true;
    }
    
    handlePackagesChange(packages) {
        let keyValuePairs = [{key: "packages", value: packages}];
        let calculationResult = this.calculateTotalAmounts(packages);
        keyValuePairs.push({key: "measurement.weight", value: calculationResult.weight});
        keyValuePairs.push({key: "measurement.ldm", value: calculationResult.ldm});
        keyValuePairs.push({key: "measurement.volume", value: calculationResult.volume});
        keyValuePairs.push({key: "quantity", value: calculationResult.quantity});
        this.props.onChange(keyValuePairs);
    }

    handleChange(key, value) {
        let keyValuePairs = [{key: key, value: value}];
        this.props.onChange(keyValuePairs);
    }

    calculateTotalAmounts(packages) {
        let totalLdm = 0;
        let totalVolume = 0;
        let totalWeight = 0;
        let totalQuantity = 0;
        if (packages && packages.length > 0) {
            packages.forEach(quotePackage => {
                if (quotePackage.measurement.weight) {
                    totalWeight += _.toNumber(quotePackage.measurement.weight);
                }
                if (quotePackage.measurement.ldm) {
                    totalLdm += _.toNumber(quotePackage.measurement.ldm);
                }
                if (quotePackage.measurement.volume) {
                    totalVolume += _.toNumber(quotePackage.measurement.volume);
                }
                if (quotePackage.quantity) {
                    totalQuantity += _.toInteger(quotePackage.quantity)
                }
            });
        }
        return {
            weight: Math.round(totalWeight * 100) / 100,
            ldm: Math.round(totalLdm * 100) / 100,
            volume: Math.round(totalVolume * 100) / 100,
            quantity: Math.round(totalQuantity * 100) / 100
        };
    }
    
    getNewQuotePackage() {
        return {
            dimension: {},
            measurement: {}
        };
    }

    openPackageForm(quotePackageParam) {
       if(_.isNil(this.props.quote.subsidiary)){
            return Notify.showError("Please select Owner Subsidiary first!");
        }
        else{
            let quotePackage;
            if (quotePackageParam) {
                quotePackage = _.cloneDeep(quotePackageParam);
            } else {
                quotePackage = this.getNewQuotePackage();
            }
            this.handleQuotePackageUpdateStart();
            // Her yeni add veya edit'te, packageForm component'inin sıfırdan açılması için packageFormKey değerini yeniliyoruz.
            let callback = (quotePackageAfterCalculation) => {
                this.setState({
                    quotePackage: quotePackageAfterCalculation,
                    quotePackageUpdateCheckKey: this.quotePackageUpdateCheckKey,
                    packageFormKey: uuid.v4()
                }, () => this.packageModal.open());
            };
            PackageUtils.calculateVolumeAndLdmIfNecessary(quotePackage, callback);
        }
        
    }

    handlePackageSave() {
        window.setTimeout(() => {
            if (!_.isEqual(this.quotePackageUpdateCheckKey, this.state.quotePackageUpdateCheckKey)) {
                Notify.showError("Something went wrong, wait for 1 second and click 'Save' again.");
            } else {
                if (this.state.quotePackage && this.state.quotePackage._key) {
                    this.editPackage();
                } else {
                    this.handlePackageAddition();
                }
            }
        }, 100);
    }

    handlePackageAddition(){
        if(!this.props.quote.packages || this.props.quote.packages.length == 0){
            if(_.max([this.props.quote.measurement.weight, this.props.quote.measurement.ldm, this.props.quote.measurement.volume]) > 0){
                Notify.confirm("This operation will update the total amount values. Are you sure?", () => this.addPackage());
                return;
            }
        }
        this.addPackage();
    }

    addPackage(){
        if(this.packageForm.validate()){
            let packages = _.cloneDeep(this.props.quote.packages);
            if(!packages){
                packages = [];
            }
            let quotePackage = _.cloneDeep(this.state.quotePackage);
            quotePackage._key = uuid.v4();
            this.adjustStackabilityTypeAndHangingGoodsCategory(quotePackage);
            packages.push(quotePackage);
            this.updateState("quotePackage", null, false, false);
            this.handlePackagesChange(packages);
            this.packageModal.close();
        }
    }

    editPackage(){
        if(this.packageForm.validate()){
            let packages = _.cloneDeep(this.props.quote.packages);
            if(packages){
                let quotePackage = _.cloneDeep(this.state.quotePackage);
                const index = packages.findIndex(item => item._key === quotePackage._key);
                if (index !== -1) {
                    this.adjustStackabilityTypeAndHangingGoodsCategory(quotePackage);
                    packages[index] = quotePackage;
                    this.updateState("quotePackage", null, false, false);
                    this.handlePackagesChange(packages);
                }
            }
            this.packageModal.close();
        }
    }

    adjustStackabilityTypeAndHangingGoodsCategory(quotePackage) {
        if (quotePackage.type == "Stange") {
            quotePackage.stackabilityType = null;
        } else {
            quotePackage.hangingGoodsCategory = null;
        }
    }

    removePackage(data){
        let packages = _.cloneDeep(this.props.quote.packages);
        if(packages){
            const index = packages.findIndex(quotePackage => quotePackage._key === data._key);
            if (index !== -1) {
                packages.splice(index, 1);
                this.updateState("quotePackage", null, false, false);
                this.handlePackagesChange(packages);
            }
        }

    }

    renderPackageForm(){
        let title = "Package Detail";
        let content = null;
        if (this.state.quotePackage) {
            content = (
                <Grid>
                    <GridCell width="1-1">
                        <Package ref={(c) => this.packageForm = c}
                                 key={this.state.packageFormKey}
                                 quotePackage={this.state.quotePackage}
                                 onChange={(value, overwriteVolume, overwriteLdm) => this.updateState("quotePackage", value, overwriteVolume, overwriteLdm)}/>
                    </GridCell>
                    <GridCell width="1-1">
                        <div className="uk-align-right">
                            <Button id={this.idForPackageFormSaveButton} label="Save" style = "success" onclick={() => this.handlePackageSave()}/>
                            <Button label="Close" style="danger" onclick={() => this.packageModal.close()}/>
                        </div>
                    </GridCell>
                </Grid>
            );
        }
        return(
            <Modal ref={(c) => this.packageModal = c} title = {title}
                   closeOnBackgroundClicked={false}
                   large={true}>
                {content}
            </Modal>
        );
    }

    addReadOnlyMeasurements(columns){
        if(this.props.quote.serviceArea.code !=='CCL'){
            columns.splice(1, 0,
                {
                    colSpan: 1,
                    content: this.numberWithoutScalePrinter.print(this.props.quote.quantity)
                });

            columns.splice(3, 0,
                {
                    colSpan: 1,
                    content: this.numberWithScalePrinter.print(this.props.quote.measurement.weight)
                },
                {
                    colSpan: 1,
                    content: this.numberWithScalePrinter.print(this.props.quote.measurement.ldm)
                },
                {
                    colSpan: 1,
                    content: this.numberWithScalePrinter.print(this.props.quote.measurement.volume)
                });
        }else{
            columns.splice(2, 0,
                {
                    colSpan: 1,
                    content: this.numberWithScalePrinter.print(this.props.quote.measurement.weight)
                },
                {
                    colSpan: 1,
                    content: this.numberWithScalePrinter.print(this.props.quote.measurement.ldm)
                },
                {
                    colSpan: 1,
                    content: this.numberWithScalePrinter.print(this.props.quote.measurement.volume)
                });
        }

    }

    addEditableMeasurements(columns){
        
        let isLdmDisabled = false;
        let product = !_.isEmpty(this.props.quote.products) ? this.props.quote.products[0] : null;
        if (product && product.shipmentLoadingType == "FTL") {
            isLdmDisabled = true;
            this.numberWithoutScalePrinter.print(this.props.quote.quantity)
        }
        if(this.props.quote.serviceArea.code !=='CCL'){
            columns.splice(1, 0,
                {
                    colSpan: 1,
                    content: (<NumericInput digitsOptional = {false}
                                            value = {this.props.quote.quantity} required={true}
                                            onchange = {(value) => this.handleChange("quantity", value)}/>)
                });
            columns.splice(3, 0,
                {
                    colSpan: 1,
                    content: (<NumericInput digits="2" digitsOptional = {false}
                                            value = {this.props.quote.measurement.weight} required={true}
                                            onchange = {(value) => this.handleChange("measurement.weight", value)}/>)
                },
                {
                    colSpan: 1,
                    content: (<NumericInput digits="2" digitsOptional = {false}
                                            value = {this.props.quote.measurement.ldm} required={true} disabled={isLdmDisabled}
                                            onchange = {(value) => this.handleChange("measurement.ldm", value)}/>)
                },
                {
                    colSpan: 1,
                    content: (<NumericInput digits="2" digitsOptional = {false}
                                            value = {this.props.quote.measurement.volume} required={true}
                                            onchange = {(value) => this.handleChange("measurement.volume", value)}/>)
                });
        }else{
            columns.splice(2, 0,
                {
                    colSpan: 1,
                    content: (<NumericInput digits="2" digitsOptional = {false}
                                            value = {this.props.quote.measurement.weight} required={true}
                                            onchange = {(value) => this.handleChange("measurement.weight", value)}/>)
                },
                {
                    colSpan: 1,
                    content: (<NumericInput digits="2" digitsOptional = {false}
                                            value = {this.props.quote.measurement.ldm} required={true} disabled={isLdmDisabled}
                                            onchange = {(value) => this.handleChange("measurement.ldm", value)}/>)
                },
                {
                    colSpan: 1,
                    content: (<NumericInput digits="2" digitsOptional = {false}
                                            value = {this.props.quote.measurement.volume} required={true}
                                            onchange = {(value) => this.handleChange("measurement.volume", value)}/>)
                });
        }

    }

    renderDataTable(){
        let footerRows = [];
        let columnSpan;

        if (this.props.quote.serviceArea.code !== 'CCL') {
            columnSpan = 3;
        }else {
            columnSpan = 4;
        }

        let footerRow = {columns:[
                {
                    colSpan: 1,
                    content: (<span className="uk-text-warning">{super.translate("Total Amounts")+": "}</span>)
                },
                {
                    colSpan: columnSpan,
                    content: (<span/>)
                }]};

        if(this.props.quote.serviceArea.code === 'AIR'){
                footerRow.columns.push(
                    {
                        colSpan: 1,
                        content: (<span className="uk-text-warning">{super.translate("Chargeable Weight")+": "}</span>)
                    },
                    {
                        colSpan: 1,
                        content: this.numberWithScalePrinter.print(this.props.quote.chargeableWeight)
                    });
        }

        if(this.props.quote.serviceArea.code === 'ROAD'){
            footerRow.columns.push(
                {
                    colSpan: 1,
                    content: (<span className="uk-text-warning">{super.translate("Payweight")+": "}</span>)
                },
                {
                    colSpan: 1,
                    content: this.numberWithScalePrinter.print(this.props.quote.payWeight)
                });
        }

        if(this.props.readOnly ||
            (this.props.quote.packages && this.props.quote.packages.length > 0)){
            this.addReadOnlyMeasurements(footerRow.columns);

        }else{
            this.addEditableMeasurements(footerRow.columns);
        }

        footerRows.push(footerRow);

        return (
            <GridCell>
                <DataTable.Table data={this.props.quote.packages} footerRows={footerRows}>
                    <DataTable.Text field="type" header="Packaging" translator={this}/>
                    <DataTable.Numeric field="quantity" header="Quantity" right={true}/>
                    <DataTable.Numeric field="dimension.width" header="Width(cm)" right={true}/>
                    <DataTable.Numeric field="dimension.length" header="Length(cm)" right={true}/>
                    <DataTable.Numeric field="dimension.height" header="Height(cm)" right={true}/>
                    <DataTable.Numeric field="measurement.weight" header="Weight(kg)" right={true} numberOfDecimalDigits={2}/>
                    <DataTable.Numeric field="measurement.ldm" header="LDM" right={true} numberOfDecimalDigits={2}/>
                    <DataTable.Numeric field="measurement.volume" header="Volume(m3)" right={true} numberOfDecimalDigits={2}/>
                    <DataTable.Text field="stackabilityType" header="Stackability"/>
                    <DataTable.Text field="hangingGoodsCategory.name" header="Category"/>
                    <DataTable.ActionColumn>
                        <DataTable.ActionWrapper shouldRender = {() => !this.props.readOnly} key="editPackage" track="onclick"
                                                 onaction = {(data) => this.openPackageForm(data)}>
                            <Button icon="pencil" size="small"/>
                        </DataTable.ActionWrapper>
                        <DataTable.ActionWrapper shouldRender = {() => !this.props.readOnly} key="deletePackage" track="onclick"
                                                 onaction = {(data) => this.removePackage(data)}>
                            <Button icon="close" size="small"/>
                        </DataTable.ActionWrapper>
                    </DataTable.ActionColumn>
                </DataTable.Table>
            </GridCell>
        );
    }
    render() {
        if (!this.props.quote.measurement) {
            return null;
        }
        return (
            <Card>
                <ActionHeader title="Package Details" readOnly={this.props.readOnly}
                              tools={[{title: "Add", items: [{label: "", onclick: () => this.openPackageForm()}]}]} />
                <LoaderWrapper busy = {this.state.busy} title="" size = "S">
                    <Grid>
                        {this.renderDataTable()}
                    </Grid >
                </LoaderWrapper>
                {this.renderPackageForm()}
            </Card>
        );
    }
}
PackageList.contextTypes = {
    translator: PropTypes.object
};


class NumericPrinter {

    constructor(scale) {
        this.scale = scale;
        this.displayData = "---";
    }
    print(data) {
        if (data || data === 0) {
            if (this.scale || this.scale === 0) {
                this.displayData = new Number(data).toFixed(this.scale);
            } else {
                this.displayData = data;
            }
            return (<span className="uk-align-right">{this.displayData}</span>)
        }
    }
}
