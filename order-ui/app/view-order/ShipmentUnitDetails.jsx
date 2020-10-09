import * as axios from 'axios';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { NumberInput, NumericInput } from 'susam-components/advanced';
import { Button, Checkbox, DropDown, Form, Notify, Span } from 'susam-components/basic';
import { Grid, GridCell, Loader, Modal } from 'susam-components/layout';
import uuid from "uuid";
import { OptionList } from "../create-order/steps/OptionList";
import { round } from "../Helper";
import { OrderService } from "../services";
import { MiniLoader } from './MiniLoader';

const MAX_STACK = 20;

export class ShipmentUnitDetails extends TranslatingComponent{

    packageText = "Package";
    unknownText = "Unknown";

    maxStackOption = {id: 0, name: "Maximum"};
    noStackOption = {id: 1, name: "Not Stackable"};

    formatter = new Intl.NumberFormat('tr-TR', {
        maximumFractionDigits: 2, minimumFractionDigits: 2
    });
    formatterNoFraction = new Intl.NumberFormat('tr-TR', {
        maximumFractionDigits: 0, minimumFractionDigits: 0
    });

    state = {stackOptions: this.populateStackOptions(MAX_STACK), syncWithUnits: true};
    truckHeight = 300;

    populateStackOptions(max){
        let stackOptions = [...Array(_.clamp(max, 1, MAX_STACK) - 1).keys()].map(item => {
            return {id: item + 2, name: "" + (item + 2)}
        });
        stackOptions.splice(0, 0, this.noStackOption);
        if(this.findPackageGroup(_.get(this.state,'shipmentUnit.packageType')).code === 'BULK'){
            stackOptions.push(this.maxStackOption);
        }
        return stackOptions;
    }

    findPackageGroup(packageType){
        if(_.get(this.state, "packageTypes") && packageType){
            let packageTypeItem = _.find(this.state.packageTypes, {code: packageType.code});
            return packageTypeItem && packageTypeItem.packageGroup;
        }
        return {};
    }

    componentDidMount(){
        OrderService.getPackageTypesAndGroups().then(response => {
            let packageGroups = _.uniqBy(response.data.map(type => type.packageGroup), item => item.id);
            this.setState({packageGroups: packageGroups, packageTypes: response.data,})
        }).catch(error => Notify.showError(error));
    }

    componentDidUpdate(prevProps, prevState){
        if(!_.isEqual(prevState.shipmentUnit, this.state.shipmentUnit)){
            this.setState({stackOptions: this.findNewStackOptions(_.get(this.state,'shipmentUnit.height'))})
        }
    }

    createShipmentUnitRequest(){
        return {
            totalQuantity: this.props.shipment.totalQuantity,
            packageTypes: this.props.shipment.packageTypes,
            grossWeight: this.props.shipment.grossWeight,
            netWeight: this.props.shipment.netWeight,
            totalVolume: this.props.shipment.totalVolume,
            totalLdm: this.props.shipment.totalLdm,
            units: this.props.shipment.units.map(item => {
                item._key = item.id;
                return item;
            })
        }
    }

    close(){
        this.editModal && this.editModal.close();
        setTimeout(() => this.setState({editShipmentUnit: false, addNewShipmentUnit: false, addUnitOptionSelected: false, shipmentUnit: null}), 200);
    }

    handleClickEdit(){
        if(this.props.editable) {
            let volumeAndLdmCalculateRequests = _.filter(this.props.shipment.units, this.canCalculateVolumeAndLdm)
                .map(shipmentUnit => {
                    let stack = this.calculateStackSize(shipmentUnit);
                    return {
                        shipmentUnit: shipmentUnit,
                        request: OrderService.calculateLoadingMeterAndVolume(
                            shipmentUnit.width, shipmentUnit.length, shipmentUnit.height, stack, shipmentUnit.quantity)
                    };
                });
            if(volumeAndLdmCalculateRequests.length > 0){
                axios.all(volumeAndLdmCalculateRequests.map(item => item.request)).then(responses => {
                    let shipmentUnitRequest = this.createShipmentUnitRequest();
                    responses.forEach((response, index) => {
                        let shipmentUnitIndex =_.findIndex(shipmentUnitRequest.units,
                            {id: volumeAndLdmCalculateRequests[index].shipmentUnit.id});
                        shipmentUnitRequest.units[shipmentUnitIndex].ldm = response.data.ldm;
                        shipmentUnitRequest.units[shipmentUnitIndex].volume = response.data.volume;
                    });
                    this.setState({shipmentUnit: null, shipmentUnitRequest: shipmentUnitRequest}, () => {
                        this.editModal.open();
                    });
                })
            }else{
                this.setState({shipmentUnit: null, shipmentUnitRequest: this.createShipmentUnitRequest()}, () => {
                    this.editModal.open();
                });
            }


        }
    }

    validateShipmentUnitRequest(){
        if(this.state.shipmentUnitRequest.totalQuantity &&
            parseFloat(this.state.shipmentUnitRequest.totalQuantity) < parseFloat(this.getTotalUnitsQuantity(this.state.shipmentUnitRequest.units))){
            Notify.showError("Total quantity should be equal to or greater than total of unit quantities");
            return false;
        }
        if(this.state.shipmentUnitRequest.totalVolume &&
            parseFloat(this.state.shipmentUnitRequest.totalVolume) < parseFloat(this.getTotalUnitsVolume(this.state.shipmentUnitRequest.units))){
            Notify.showError("Total volume should be equal to or greater than total of unit volumes");
            return false;
        }

        if(this.state.shipmentUnitRequest.totalLdm &&
            parseFloat(this.state.shipmentUnitRequest.totalLdm) < parseFloat(this.getTotalUnitsLdm(this.state.shipmentUnitRequest.units))){
            Notify.showError("Total LDM should be equal to or greater than total of unit LDMs");
            return false;
        }

        return true;
    }

    handleClickSave(){
        console.log("save", this.state.shipmentUnitRequest);
        if(!this.validateShipmentUnitRequest()){
            return;
        }
        this.props.onSave(this.state.shipmentUnitRequest);
        this.close();
    }

    handleClickAddNewShipmentUnit(){
        this.setState({shipmentUnit: {_key: uuid.v4()}, addNewShipmentUnit: true});
    }

    validate(){
        if(!this.form.validate()){
            return false;
        }
        if(this.state.shipmentUnit.width && this.state.shipmentUnit.length &&
            parseFloat(this.state.shipmentUnit.width) > parseFloat(this.state.shipmentUnit.length)){
            Notify.showError("Width should be smaller than or equal to length");
            return false;
        }
        if((this.state.shipmentUnit.width && !this.state.shipmentUnit.length) ||
            (!this.state.shipmentUnit.width && this.state.shipmentUnit.length)){
            Notify.showError("Width and length should be entered together");
            return false;
        }
        if(this.state.restrictions){
            if(!this.checkValueIsInRange(this.state.restrictions.heightRangeInCentimeters, "Height",
                    this.state.shipmentUnit.height)){
                return false;
            }
            if(!this.checkValueIsInRange(this.state.restrictions.lengthRangeInCentimeters, "Length",
                    this.state.shipmentUnit.length)){
                return false;
            }
            if(!this.checkValueIsInRange(this.state.restrictions.widthRangeInCentimeters, "Width",
                    this.state.shipmentUnit.width)){
                return false;
            }
        }
        return true;
    }
    checkValueIsInRange(range, name, value){
        if(_.isNil(value) || _.isNil(range)){
            return true;
        }
        if(range.minValue && range.maxValue){
            if(parseFloat(value) > range.maxValue || parseFloat(value) < range.minValue){
                Notify.showError(`${name} should be in range of ${range.minValue} - ${range.maxValue} cm`);
                return false;
            }
        }else if(range.minValue){
            if(parseFloat(value) < range.minValue){
                Notify.showError(`${name} should be greater than ${range.minValue} cm`);
                return false;
            }
        }else if(range.maxValue){
            if(parseFloat(value) > range.maxValue){
                Notify.showError(`${name} should be smaller than ${range.maxValue} cm`);
                return false;
            }
        }
        return true;
    }
    handleClickCancelShipmentUnit(){
        this.setState({shipmentUnit: null, editShipmentUnit: false, addNewShipmentUnit: false, addUnitOptionSelected: false});
    }
    handleClickSaveShipmentUnit(){
        if(!this.validate()){
            return;
        }
        let shipmentUnit = _.cloneDeep(this.state.shipmentUnit);
        this.calculateVolumeAndLdm(shipmentUnit, (shipmentUnitWithVolumeAndLdm) => {
            this.mergeShipmentUnitToRequest(shipmentUnitWithVolumeAndLdm);
        });
    }

    mergeShipmentUnitToRequest(shipmentUnit){
        let shipmentUnitRequest = _.cloneDeep(this.state.shipmentUnitRequest);
        let shipmentUnitIndex = _.findIndex(shipmentUnitRequest.units, {_key: shipmentUnit._key});
        if(shipmentUnitIndex >= 0){
            shipmentUnitRequest.units[shipmentUnitIndex] = shipmentUnit;
        }else{
            shipmentUnitRequest.units.push(shipmentUnit);
        }
        this.calculateTotalShipmentUnitValues(shipmentUnitRequest);
        this.setState({shipmentUnitRequest: shipmentUnitRequest, shipmentUnit: null, editShipmentUnit: false, addNewShipmentUnit: false, addUnitOptionSelected: false});
    }

    handleClickEditShipmentUnit(shipmentUnit){
        let stackOptions = _.isNil(shipmentUnit.height) ? this.state.stackOptions : this.findNewStackOptions(shipmentUnit.height);
        let selectedPackageOption;
        if(this.props.senderTemplate && this.props.senderTemplate.packageDetails){
            selectedPackageOption = _.find(this.props.senderTemplate.packageDetails, {id: shipmentUnit.templateId});
        }
        this.setState({shipmentUnit: shipmentUnit, stackOptions: stackOptions, selectedPackageOption: selectedPackageOption, editShipmentUnit: true});
    }

    handleClickDeleteShipmentUnit(shipmentUnit){
        let shipmentUnitRequest = _.cloneDeep(this.state.shipmentUnitRequest);
        _.remove(shipmentUnitRequest.units, {_key: shipmentUnit._key});
        this.calculateTotalShipmentUnitValues(shipmentUnitRequest);
        this.setState({shipmentUnitRequest: shipmentUnitRequest});
    }

    handleSelectPackageOption(value){
        let shipmentUnit = _.cloneDeep(this.state.shipmentUnit);
        shipmentUnit.width = value.width;
        shipmentUnit.length = value.length;
        shipmentUnit.height = value.height;
        shipmentUnit.packageType = value.packageType;
        shipmentUnit.templateId = value.id;
        if(value.stackSize){
            shipmentUnit.stackSize = value.stackSize.id;
        }
        let stackOptions = this.state.stackOptions;
        if(shipmentUnit.height){
            stackOptions = this.findNewStackOptions(shipmentUnit.height);
        }
        this.setState({
            shipmentUnit: shipmentUnit,
            addUnitOptionSelected: true,
            stackOptions: stackOptions,
            selectedPackageOption: value
            });
    }

    calculateTotalShipmentUnitValues(shipmentUnitRequest){
        let totalQuantity = this.getTotalUnitsQuantity(shipmentUnitRequest.units);
        if(this.state.syncWithUnits || parseInt(totalQuantity) > parseInt(shipmentUnitRequest.totalQuantity)){
            shipmentUnitRequest.totalQuantity = totalQuantity;
        }
        let totalLdm = this.getTotalUnitsLdm(shipmentUnitRequest.units);
        if(this.state.syncWithUnits || parseFloat(totalLdm) > parseFloat(shipmentUnitRequest.totalLdm)){
            shipmentUnitRequest.totalLdm = totalLdm;
        }
        let totalVolume = this.getTotalUnitsVolume(shipmentUnitRequest.units);
        if(this.state.syncWithUnits || parseFloat(totalVolume) > parseFloat(shipmentUnitRequest.totalVolume)){
            shipmentUnitRequest.totalVolume = totalVolume;
        }

        shipmentUnitRequest.packageTypes = this.getUnitsPackageTypes(shipmentUnitRequest.units);
    }

    getTotalUnitsLdm(units){
        let total = "";
        if(units){
            total = _.reduce(units, (sum, unitDetails) => {
                return round(sum + (unitDetails.ldm ? unitDetails.ldm : 0), 2);
            }, 0);
        }
        return total;
    }
    getTotalUnitsVolume(units){
        let total = "";
        if(units){
            total = _.reduce(units, (sum, unitDetails) => {
                return round(sum + (unitDetails.volume ? unitDetails.volume : 0), 2);
            }, 0);
        }
        return total;
    }
    getTotalUnitsQuantity(units){
        let total = "";
        if(units){
            total = _.reduce(units, (sum, unitDetails) => {
                return round(sum + (unitDetails.quantity ? parseInt(unitDetails.quantity) : 0), 2);
            }, 0);
        }
        return total;
    }

    getUnitsPackageTypes(units){
        let types = [];
        if(units){
            let packageTypes =_.filter(units, item => item.packageType)
                .map(details => _.find(this.state.packageTypes, {id: details.packageType.id}));
            types = _.uniqBy(packageTypes, item => item.id);
        }
        return types;
    }

    updateState(key, value){
        let shipmentUnit = _.cloneDeep(this.state.shipmentUnit);
        shipmentUnit[key] = value;
        if(!_.isNil(shipmentUnit.stackSize)){
            if(!_.find(this.state.stackOptions, {id: shipmentUnit.stackSize})){
                shipmentUnit.stackSize = null;
            }
        }
        this.setState({shipmentUnit: shipmentUnit});
    }

    updateSyncStatus(value){
        this.setState({syncWithUnits: value}, () => {
            if(value){
                let shipmentUnitRequest = _.cloneDeep(this.state.shipmentUnitRequest);
                this.calculateTotalShipmentUnitValues(shipmentUnitRequest);
                this.setState({shipmentUnitRequest: shipmentUnitRequest});
            }
        });
    }

    updateTotalMeasurements(key, value){
        let shipmentUnitRequest = _.cloneDeep(this.state.shipmentUnitRequest);
        shipmentUnitRequest[key] = value;
        this.setState({shipmentUnitRequest: shipmentUnitRequest});
    }
    canCalculateVolumeAndLdm(shipmentUnit){
        return shipmentUnit.width &&
            shipmentUnit.length &&
            (shipmentUnit.stackSize || shipmentUnit.height) &&
            shipmentUnit.quantity;
    }
    calculateStackSize(shipmentUnit){
        if(!_.isNil(shipmentUnit.stackSize)){
            return shipmentUnit.stackSize !== 0 ? shipmentUnit.stackSize : (shipmentUnit.height ? this.findMaxStack(shipmentUnit.height) : null);
        }
        return null;
    }

    calculateVolumeAndLdm(shipmentUnit, onCalculate){
        if(!this.canCalculateVolumeAndLdm(shipmentUnit)){
            shipmentUnit.ldm = 0;
            shipmentUnit.volume = 0;
            onCalculate && onCalculate(shipmentUnit);
            return;
        }

        OrderService.calculateLoadingMeterAndVolume(shipmentUnit.width, shipmentUnit.length, shipmentUnit.height,
            this.calculateStackSize(shipmentUnit), shipmentUnit.quantity)
            .then(response => {
                shipmentUnit.ldm = response.data.ldm;
                shipmentUnit.volume = response.data.volume;
                onCalculate && onCalculate(shipmentUnit);
            })
            .catch(error => Notify.showError(error));
    }

    updateHeight(value){
        if(value){
            this.setState({stackOptions: this.findNewStackOptions(value)}, () => {
                this.updateState("height", value);
            });
        }else{
            this.updateState("height", value);
        }
    }
    findNewStackOptions(height){
        let maxStack = height ? this.findMaxStack(height) : MAX_STACK;
        return this.populateStackOptions(maxStack);
    }
    findMaxStack(height){
        return Math.floor(this.truckHeight / parseFloat(height));
    }
    updatePackageType(value){
        this.updateState("packageType", value);
        if(value){
            if(!this.state.shipmentUnit.packageType || this.state.shipmentUnit.packageType.code !== value.code){
                OrderService.getPackageTypeRestrictions(value.id).then(response => {
                    this.setState({restrictions: response.data});
                }).catch(error => Notify.showError(error));
            }
        }else{
            this.setState({restrictions: null});
        }
    }

    render(){
        if(this.props.busy){
            return <MiniLoader title="saving..."/>
        }
        if(!this.props.shipment){
            return null;
        }

        return(
            <div>
                <Grid>
                    <GridCell width = "1-1">
                        <div className = "uk-margin-right uk-margin-left">
                            {this.renderShipmentTotals(this.props.shipment)}
                        </div>
                    </GridCell>
                    <GridCell width = "1-1">
                        <div className = "uk-margin-right uk-margin-left">
                            {this.renderShipmentUnits(this.props.shipment)}
                        </div>
                    </GridCell>
                    <GridCell width = "1-1">
                        <div className = "uk-text-center">
                        {this.renderEditButton()}
                        </div>
                    </GridCell>
                </Grid>
                {this.renderModal()}
            </div>
        );
    }
    renderShipmentTotals(shipment){
        let types = shipment.packageTypes && shipment.packageTypes.length == 1 ?
            shipment.packageTypes.map(type => type.name).map(name => <div key = {name} className = "uk-text-small">{super.translate(name)}</div>) :
            shipment.packageTypes && shipment.packageTypes.length > 1 ?
            <div key = "type-unknown" className = "uk-text-small">{super.translate("Package")}</div>:
            <div key = "type-unknown" className = "uk-text-small">{super.translate("Unknown")}</div>;
        let weight =
            <div className = "uk-float-left uk-margin-large-right">
                <i className = "mdi mdi-24px mdi-weight-kilogram uk-margin-small-right uk-text-muted"
                   title={super.translate("Gross Weight")} data-uk-tooltip="{pos:'bottom'}" />
                <span className = "heading_a">
                    {shipment.grossWeight ? (this.formatterNoFraction.format(shipment.grossWeight) + " kg") : "N/A"}
                    </span>
            </div>;
        let volume =
            <div className = "uk-float-left uk-margin-large-right">
                <i className = "mdi mdi-24px mdi-cube-outline uk-margin-small-right uk-text-muted"
                   title={super.translate("Volume")} data-uk-tooltip="{pos:'bottom'}" />
                <span className = "heading_a">
                    {shipment.totalVolume ? (this.formatter.format(shipment.totalVolume) + " m³") : "N/A"}
                    </span>
            </div>;
        let ldm =
            <div className = "uk-float-left uk-margin-large-right">
                <i className = "mdi mdi-24px mdi-cube-unfolded uk-margin-small-right uk-text-muted"
                   title={super.translate("LDM")} data-uk-tooltip="{pos:'bottom'}"/>
                <span className = "heading_a">
                    {shipment.totalLdm ? (this.formatter.format(shipment.totalLdm) + " ldm") : "N/A"}
                    </span>
            </div>;
        return(
            <div className = "uk-text-center">
                <div className = "uk-float-left uk-margin-large-right">
                    <span className = "heading_a">{shipment.totalQuantity || "0"}</span>
                    {types}
                </div>
                {weight}
                {volume}
                {ldm}
            </div>
        );

    }

    renderShipmentUnits(shipment, editable){
        if(!shipment || !shipment.units || shipment.units.length === 0){
            return null;
        }
        return(
            <ul className="md-list">
                {shipment.units.map(item => this.renderShipmentUnitItem(item, editable))}
            </ul>
        );
    }
    renderShipmentUnitItem(shipmentUnit, editable){

        let width = shipmentUnit.width ?
            <span className = "uk-margin-small-right">
                <span className = "uk-text-muted">W: </span>
                <span className = "uk-text-bold">{shipmentUnit.width + " cm."}</span>
            </span> :
            null;
        let length = shipmentUnit.length ?
            <span className = "uk-margin-small-right">
                <span className = "uk-text-muted">L: </span>
                <span className = "uk-text-bold">{shipmentUnit.length + " cm."}</span>
            </span> :
            null;
        let height = shipmentUnit.height ?
            <span className = "uk-margin-small-right">
                <span className = "uk-text-muted">H: </span>
                <span className = "uk-text-bold">{shipmentUnit.height + " cm."}</span>
            </span> :
            null;

        let stackability = !_.isNil(shipmentUnit.stackSize) ?
            <span className = "uk-margin-small-right">
                <span className = "uk-text-muted">{super.translate("Stackability")}: </span>
                <span className = "uk-text-bold">{this.renderStackSizeText(shipmentUnit.stackSize)}</span>
            </span> :
            null;
        let quantity = shipmentUnit.quantity || "0";
        let packageType = shipmentUnit.packageType ? super.translate(shipmentUnit.packageType.name) : super.translate("Unknown");

        return(
            <li key = {uuid.v4()} style = {{minHeight: "48px"}}>
                <div className = "md-list-content uk-align-left">
                    <span>{quantity} {packageType} {width}{length}{height} {stackability}</span>
                </div>
                {this.renderEditButtonsForShipmentUnits(editable, shipmentUnit)}
            </li>
        );

    }
    renderStackSizeText(stackSize){
        console.log("renderStackSizeText", stackSize);
        if(_.isNil(stackSize)){
            return "";
        }else if(stackSize === 0){
            return super.translate(this.maxStackOption.name);
        }else if(stackSize === 1){
            return super.translate(this.noStackOption.name);
        }
        return stackSize;
    }
    renderEditButtonsForShipmentUnits(editable, shipmentUnit){
        if(editable){
            return (
                <div className = "uk-align-right">
                    <Button label = "edit" style = "success" size = "mini" flat = {true}
                            onclick = {() => this.handleClickEditShipmentUnit(shipmentUnit)}/>
                    <Button label = "delete" style = "danger" size = "mini" flat = {true}
                            onclick = {() => this.handleClickDeleteShipmentUnit(shipmentUnit)}/>
                </div>
            );
        }
        return null;
    }

    renderEditButton(){
        if(this.props.editable){
            return <Button label = "Edit shipment units" flat = {true} size = "small" style = "primary" onclick = {() => this.handleClickEdit()} />
        }
        return null;
    }

    renderModal(){
        if(!this.props.template){
            return null;
        }
        let actions = [{label:"Close", action:() => this.close()}];
        if(!this.state.shipmentUnit){
            actions.push({label: "Save", buttonStyle: "primary", action:() => this.handleClickSave()});
        }
        return(
            <Modal title = "Edit Shipment Units" ref = {c => this.editModal = c} medium = {true} minHeight = {300}
                   closeOtherOpenModals = {false}
                   actions={actions}>
                {this.state.shipmentUnit ? this.renderShipmentUnitEdit() : this.renderShipmentTotalsAndUnitList()}
            </Modal>
        );
    }
    renderShipmentTotalsAndUnitList(){
        return (
            <Grid>
                <GridCell width = "1-1">
                    {this.renderEditableShipmentTotals(this.state.shipmentUnitRequest)}
                </GridCell>
                <GridCell width = "1-1">
                    <div className="uk-margin-top">
                        {this.renderEditableShipmentUnitDetails(this.state.shipmentUnitRequest)}
                    </div>
                </GridCell>
                <GridCell width = "1-1">
                    <div className = "uk-text-center">
                        <Button label = "add new" style = "success" size = "mini" onclick = {() => this.handleClickAddNewShipmentUnit()}/>
                    </div>
                </GridCell>
            </Grid>
        );
    }
    renderShipmentUnitEdit() {
        if(this.state.addNewShipmentUnit){
            if(this.props.senderTemplate && !_.isEmpty(this.props.senderTemplate.packageDetails)) {
                if(!this.state.addUnitOptionSelected) {
                    return this.renderShipmentUnitTemplateOptions();
                }
            }
            return this.renderShipmentUnitForm();
        }
        if(this.state.editShipmentUnit){
            return this.renderShipmentUnitForm();
        }
    }

    renderShipmentUnitTemplateOptions(){
        return (
            <div>
                <OptionList options = {this.props.senderTemplate.packageDetails} columns = {4}
                            keyField="_key"
                            onChange = {(value) => this.handleSelectPackageOption(value) }
                            onRender = {(option) => this.renderPackageDetailOption(option)}/>

                <div className = "uk-margin-top uk-text-center">
                    <Button label = "return to units list" size = "small" flat = {true}
                            onclick = {() => this.handleClickCancelShipmentUnit()} />
                </div>
            </div>
        );

    }
    renderPackageDetailOption(option){
        return (
            <Grid>
                <GridCell width="1-1" noMargin = {true}>
                    <span className = "uk-text-truncate uk-text-bold">{option.packageType ? option.packageType.name : ""}</span>
                </GridCell>
                <GridCell width="1-1" noMargin = {true}>
                    <span className = "uk-text-truncate" style = {{opacity: .8}}>W:{option.width} cm. x L:{option.length} cm. x H:{option.height} cm.</span>
                </GridCell>
                <GridCell width="1-1" noMargin = {true}>
                    <span className="uk-text-truncate uk-text-small">Stackability: {option.stackSize ? this.renderStackSizeText(option.stackSize.id) : ""}</span>
                </GridCell>
            </Grid>
        );
    }
    renderShipmentUnitForm(){
        if(this.state.editFormBusy){
            return <Loader size = "M" title = "Calculating Volume and LDM" />;
        }
        return(
            <Form ref = {c => this.form = c}>
                <Grid>
                    <GridCell width = "1-10">
                        {this.renderQuantity()}
                    </GridCell>
                    <GridCell width = "2-10">
                        {this.renderPackageType()}
                    </GridCell>
                    <GridCell width = "1-10">
                        {this.renderWidth()}
                    </GridCell>
                    <GridCell width = "1-10">
                        {this.renderLength()}
                    </GridCell>
                    <GridCell width = "1-10">
                        {this.renderHeight()}
                    </GridCell>
                    <GridCell width = "2-10">
                        {this.renderStackability()}
                    </GridCell>
                    <GridCell width = "1-10">
                        <div className = "uk-margin-top uk-text-center">
                            <Button label = {this.state.addNewShipmentUnit ? "add" : "update"} style = "success" size = "small"
                                    onclick = {() => this.handleClickSaveShipmentUnit()} />
                        </div>
                    </GridCell>
                    <GridCell width = "1-1">
                        <div className = "uk-margin-top uk-text-center">
                            <Button label = "return to units list" size = "small" flat = {true}
                                    onclick = {() => this.handleClickCancelShipmentUnit()} />
                        </div>
                    </GridCell>
                </Grid>
            </Form>
        );
    }

    renderQuantity(){
        return(
            <NumberInput id = "quantity" label = "Quantity" value = {this.state.shipmentUnit.quantity} required = {true}
                         onchange = {(value) => this.updateState("quantity", value)} />
        );
    }
    renderPackageType(){
        if(this.state.selectedPackageOption && this.state.selectedPackageOption.packageType){
            return <Span label = "Package Type" value = {this.state.shipmentUnit.packageType.name} />;
        }
        return(
            <DropDown id="packageType" label="Package Type" options = {this.state.packageTypes}
                      value = {this.state.shipmentUnit.packageType} required = {true}
                      onchange = {(value) => this.updatePackageType(value)} />
        );
    }
    renderWidth(){
        if(this.state.selectedPackageOption && this.state.selectedPackageOption.width){
            return <Span label = "Width" value = {`${this.state.shipmentUnit.width} cm.`} />
        }
        return(
            <NumericInput id = "width" unit="cm" label="Width" digitsOptional = {true} digits = {2}
                          value={this.state.shipmentUnit.width} onchange={(value) => {this.updateState("width", value)}}/>
        );
    }
    renderLength(){
        if(this.state.selectedPackageOption && this.state.selectedPackageOption.length){
            return <Span label = "Length" value = {`${this.state.shipmentUnit.length} cm.`} />
        }
        return(
            <NumericInput id = "length" unit="cm" label="Length" digitsOptional = {true} digits = {2}
                          value={this.state.shipmentUnit.length} onchange={(value) => {this.updateState("length", value)}}/>
        );
    }
    renderHeight(){
        if(this.state.selectedPackageOption && this.state.selectedPackageOption.height){
            return <Span label = "Height" value = {`${this.state.shipmentUnit.height} cm.`} />
        }
        return(
            <NumericInput id = "height" unit="cm" label="Height" digitsOptional = {true} digits = {2}
                          value={this.state.shipmentUnit.height} onchange={(value) => {this.updateHeight(value)}}/>
        );
    }
    renderStackability(){
        if(this.state.selectedPackageOption && this.state.selectedPackageOption.stackSize){
            return <Span label = "Stackability" value = {this.renderStackSizeText(this.state.shipmentUnit.stackSize)} />;
        }
        return(
            <DropDown id = "stack" label="Stackability" options = {this.state.stackOptions}
                      value={this.state.shipmentUnit.stackSize+""}
                      onchange={(value) => {this.updateState("stackSize", value ? value.id : null)}}/>
        );
    }

    renderEditableShipmentTotals(shipmentUnitRequest){
        if(!shipmentUnitRequest){
            return null;
        }
        return(
            <Grid>
                <GridCell width = "1-4">
                    <NumberInput id = "totalQuantity" label = "Total Quantity" value = {shipmentUnitRequest.totalQuantity}
                                 onchange = {(value) => this.updateTotalMeasurements("totalQuantity", value)} />
                </GridCell>
                <GridCell width = "3-4">
                    { shipmentUnitRequest.packageTypes && 1 < shipmentUnitRequest.packageTypes.length && this.renderShipmentUnits(shipmentUnitRequest) ? 
                        <Span label="Package Type" value = {this.packageText}/> :
                        <DropDown   id="packageTypes" label="Package Type" options = {this.state.packageTypes}
                            value = {_.first(shipmentUnitRequest.packageTypes)}
                            onchange = {(value) => this.updateTotalMeasurements("packageTypes",[value])}
                            disabled={ this.renderShipmentUnits(shipmentUnitRequest) }  /> }
                </GridCell>
                <GridCell width = "1-4">
                    <NumericInput id = "grossWeight" unit="kg" label="Gross Weight" digitsOptional = {true} digits = {2}
                                  value={shipmentUnitRequest.grossWeight} onchange={(value) => {this.updateTotalMeasurements("grossWeight", value)}}/>
                </GridCell>
                <GridCell width = "1-4">
                    <NumericInput id = "netWeight" unit="kg" label="Net Weight" digitsOptional = {true} digits = {2}
                                  value={shipmentUnitRequest.netWeight} onchange={(value) => {this.updateTotalMeasurements("netWeight", value)}}/>
                </GridCell>
                <GridCell width = "1-2"/>
                <GridCell width = "1-4">
                    <NumericInput id = "volume" unit="m³" label="Volume" digitsOptional = {true} digits = {2}
                                  value={shipmentUnitRequest.totalVolume} onchange={(value) => {this.updateTotalMeasurements("totalVolume", value)}}/>
                </GridCell>
                <GridCell width = "1-4">
                    <NumericInput id = "ldm" unit="ldm" label="LDM" digitsOptional = {true} digits = {2}
                                  value={shipmentUnitRequest.totalLdm} onchange={(value) => {this.updateTotalMeasurements("totalLdm", value)}}/>
                </GridCell>
                <GridCell width = "1-2">
                    <div className = "uk-margin-top">
                        <Checkbox label = "Synchronize with Units" value = {this.state.syncWithUnits}
                                onchange = {(value) => this.updateSyncStatus(value)} />
                    </div>
                </GridCell>
            </Grid>
        );
    }
    renderEditableShipmentUnitDetails(shipment){
        return this.renderShipmentUnits(shipment, true);
    }
}

ShipmentUnitDetails.contextTypes = {
    translator: PropTypes.object
};