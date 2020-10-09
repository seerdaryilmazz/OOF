import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { NumericInput } from 'susam-components/advanced';
import { Button, DropDown, Notify, TextInput } from 'susam-components/basic';
import { Grid, GridCell } from 'susam-components/layout';
import { getAdrPackageUnits } from '../../Helper';
import { OrderService } from '../../services';
import { DefaultInactiveElement } from './OrderSteps';


export class AdrDetails extends TranslatingComponent {

    constructor(props){
        super(props);
        this.state = {};
        this.firstElementId = "adrUnNumber";
        this.lastElementId = "adr-unit-text";
        this.focusedElementId = null;
        this.units = getAdrPackageUnits();
    }

    addKeyDownEventListener(){
        document.addEventListener('keydown', this.handleKeyPress);
    }
    handleKeyPress = (e) => {
        if(e.key === "Tab"){
            e.shiftKey ? this.handleShiftTab(e) : this.handleTab(e);
        }
    };

    handleTab(e){
        this.focusedElementId = e.target.id;
        if(this.focusedElementId === this.lastElementId){
            this.handleNext();
        }
    }
    handleShiftTab(e) {
        this.focusedElementId = e.target.id;
        if (this.focusedElementId === this.firstElementId) {
            this.handlePrev();
        }
    }
    handleNext(){
        this.props.onNext(this.props.value);
    }
    handlePrev(){
        this.props.onPrev(this.props.value);
    }
    removeKeyDownEventListener(){
        document.removeEventListener('keydown', this.handleKeyPress);
    }

    componentDidMount(){
        if(this.props.active){
            this.addKeyDownEventListener();
            this.focusOn(this.firstElementId);
        }
    }
    componentWillUnmount(){
        this.removeKeyDownEventListener();
    }

    componentDidUpdate(prevProps, prevState){
        if(this.props.active && !prevProps.active){
            this.focusOn(this.firstElementId);
            this.addKeyDownEventListener();
        }
        if(!this.props.active && prevProps.active){
            this.removeKeyDownEventListener();
        }
    }

    focusOn(elementId){
        document.getElementById(elementId).focus();
        this.focusedElementId = elementId;
    }
    updateAdrUnNumber(value){
        if(value.length === 4){
            this.handleSearchAdrType(value);
        }
        this.updateState("adrUnNumber", value);
    }
    updateState(key, value){
        let totals = _.cloneDeep(this.props.value) || {};
        totals[key] = value;
        this.props.onChange(totals);
    }
    handleSearchAdrType(unNumber){
        OrderService.searchAdrClassDetails(unNumber)
            .then(response => this.setState({adrSearchResults: response.data}, () => this.updateState("adrClass", null)))
            .catch(error => Notify.showError(error));
    }
    handleDelete(){
        this.props.onDelete && this.props.onDelete();
    }
    handleEdit(){
        this.props.onEdit && this.props.onEdit();
    }


    render(){
        return this.props.active ? this.renderActive() : this.renderInactive();
    }
    renderValidation(){
        let validationResult = null;
        if(this.props.validationResult && this.props.validationResult.hasError()){
            validationResult = this.props.validationResult.messages.map(item => {
                return(
                    <GridCell key = {item} width = "1-1">
                        <span className="uk-text-danger" >{super.translate(item)}</span>
                    </GridCell>
                );
            });
        }
        return <GridCell width = "1-1" noMargin = {true}><Grid>{validationResult}</Grid></GridCell>;
    }

    renderInactive(){
        if(!this.props.value){
            return <DefaultInactiveElement value="No selection" />;
        }
        let buttons = null;
        if(this.props.parentActive){
            buttons =
                <GridCell width = "1-1">
                    <Button label = "Edit" style = "success" flat = {true} size = "small" onclick = {() => this.handleEdit()}/>
                    <Button label = "Delete" style = "danger" flat = {true} size = "small" onclick = {() => this.handleDelete()}/>
                </GridCell>
        }
        return (
            <Grid>
                {this.renderValidation()}
                <GridCell width = "1-1">
                    <ul className="md-list"><li>{this.renderAdrClassListItem(this.props.value.adrClass)}</li></ul>
                </GridCell>
                <GridCell width = "1-1">
                    <span className = "heading_a_thin">{this.props.value.quantity} {this.props.value.packageType ? super.translate(this.props.value.packageType.name) : super.translate("No package")}</span>
                    <span className = "heading_a_thin" style = {{marginLeft: "12px"}}>
                        {this.props.value.innerQuantity} {this.props.value.innerPackageType ? super.translate(this.props.value.innerPackageType.name) : super.translate("No inner package")}
                        </span>
                    <span className = "heading_a_thin" style = {{marginLeft: "12px"}}>
                        {this.props.value.amount && this.props.value.unit ? (this.props.value.amount + " " + super.translate(this.props.value.unit.name)) : ""}
                        </span>
                </GridCell>
                {buttons}
            </Grid>
        );
    }
    renderAdrClassListItem(item){
        if(!item){
            return null;
        }
        let style = {marginRight: "8px"}
        return(
            <div className="md-list-content" >
                    <span className="md-list-heading">
                        <span style = {style}>{item.unNumber}</span>
                        <span style = {style}>{`${super.translate("Danger Code")}: ${super.translate(item.hazardIdentification)}`}</span>
                        <span style = {style}>{`${super.translate("Packing")}: ${super.translate(item.packingGroup)}`}</span>
                        <span style = {style}>{`${super.translate("Classification")}: ${super.translate(item.classificationCode)}`}</span>
                        <span style = {style}>{`${super.translate("Transport&Tunnel")}: ${super.translate(item.transportTunnelCategory)}`}</span>
                        <span style = {style}>{`${super.translate("Labels")}: ${super.translate(item.labels)}`}</span>
                    </span>
                    <span className="uk-text-small uk-text-muted">{super.translate(item.description)}</span>
            </div>
        );
    }
    renderAdrSearchResult(item){
        let selected = _.get(this.props.value, "adrClass.id") === item.id;
        let listItemClassName = selected ? "md-bg-blue-50" : "";
        return(
            <li key = {item.id} className = {listItemClassName} onClick = {() => this.selectAdrClass(item)} style = {{cursor: "pointer"}}>
                {this.renderAdrClassListItem(item)}
            </li>
        );
    }
    selectAdrClass(adrClass){
        this.updateState("adrClass", adrClass);
    }
    renderActive(){
        let value = this.props.value || {};
        let adrSearchResults = null;
        if(this.state.adrSearchResults){
            adrSearchResults = this.state.adrSearchResults.map(item => this.renderAdrSearchResult(item));
        }
        let adrUnInput = <GridCell width = "1-3">
            <TextInput id = "adrUnNumber" label = "ADR UN Number" value = {value.adrUnNumber}
                       onchange = {(value) => this.updateAdrUnNumber(value)} />
        </GridCell>;
        if(this.props.options && this.props.options.length > 0){
            adrSearchResults = this.props.options.map(item => this.renderAdrSearchResult(item));
            adrUnInput = null;
        }

        return(
            <Grid>
                {this.renderValidation()}
                <GridCell width = "1-1">
                    <Grid>
                        {adrUnInput}
                        <GridCell width = "1-1">
                            <ul className="md-list">{adrSearchResults}</ul>
                        </GridCell>
                    </Grid>
                </GridCell>
                <GridCell width = "1-6">
                    <NumericInput id = "quantity" label="Quantity" digitsOptional = {true} digits = {0}
                                  value={value.quantity} onchange={(value) => {this.updateState("quantity", value)}}/>
                </GridCell>
                <GridCell width = "1-6">
                    <DropDown id = "packageType" label="Package Type" options = {this.props.adrPackageTypes} translate={true}
                                  value={value.packageType} onchange={(value) => {this.updateState("packageType", value)}}/>
                </GridCell>
                <GridCell width = "1-6">
                    <NumericInput id = "innerQuantity" label="Inner Quantity" digitsOptional = {true} digits = {0}
                                  value={value.innerQuantity} onchange={(value) => {this.updateState("innerQuantity", value)}}/>
                </GridCell>
                <GridCell width = "1-6">
                    <DropDown id = "innerPackageType" label="Inner Package Type" options = {this.props.adrPackageTypes} translate={true}
                               value={value.innerPackageType} onchange={(value) => {this.updateState("innerPackageType", value)}}/>
                </GridCell>
                <GridCell width = "1-6">
                    <NumericInput id = "adr-amount" label="Amount" digitsOptional = {true} digits = {2} units = {this.units}
                                  value={value.amount} onchange={(value) => {this.updateState("amount", value)}}/>
                </GridCell>
                <GridCell width = "1-6">
                    <DropDown id = "adr-unit" label="Unit" options = {this.units} translate={true}
                              value={value.unit} onchange={(value) => {this.updateState("unit", value)}}/>
                </GridCell>
                <GridCell width = "1-1">
                    <div className = "uk-align-center">
                        <Button label="Delete" size = "small" flat = {true} style = "danger" onclick = {() => this.handleDelete()} />
                    </div>
                </GridCell>
            </Grid>
        );
    }
}

AdrDetails.contextTypes = {
    translator: PropTypes.object
};