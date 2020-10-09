import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { NumberInput, NumericInput } from 'susam-components/advanced';
import { DropDown, Span } from 'susam-components/basic';
import { Grid, GridCell } from 'susam-components/layout';
import { DefaultInactiveElement } from './OrderSteps';
import { ShipmentUnitTotalsValidator } from "./validation/ShipmentUnitTotalsValidator";


export class ShipmentUnitTotals extends TranslatingComponent {

    constructor(props){
        super(props);
        this.state = {};
        this.firstElementId = "totalQuantity";
        this.lastElementId = "ldm";
        this.focusedElementId = null;
        this.packageText = "Package";
        this.unknownText = "Unknown";
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
    removeKeyDownEventListener(){
        document.removeEventListener('keydown', this.handleKeyPress);
    }
    addKeyDownEventListener(){
        document.addEventListener('keydown', this.handleKeyPress);
    }
    componentDidUpdate(prevProps, prevState){
        if(this.props.active && !prevProps.active){
            this.focusOn(this.firstElementId);
        }
        if(!this.props.active && prevProps.active){
            this.removeKeyDownEventListener();
        }
    }

    handleKeyPress = (e) => {
        if(e.key === "Tab"){
            e.shiftKey ? this.handleShiftTab(e) : this.handleTab(e);
        }
    };
    validate(){
        let {value, totalUnitLdm, totalUnitVolume, totalUnitQuantity} = this.props;
        return ShipmentUnitTotalsValidator.validate(value,
            totalUnitLdm, totalUnitVolume, totalUnitQuantity);
    }
    handleTab(e){
        this.focusedElementId = e.target.id;
        if(this.focusedElementId === this.lastElementId){
            this.handleNext();
        }
    }
    handleShiftTab(e){
        this.focusedElementId = e.target.id;
        if(this.focusedElementId === this.firstElementId){
            this.handlePrev();
        }
    }
    handleNext(){
        let validationResult = this.validate();
        if(!validationResult.hasError()){
            this.props.onNext();
        }else{
            this.setState({validationResult: validationResult}, () => this.focusOn(this.firstElementId));
        }
    }
    handlePrev(){
        let validationResult = this.validate();
        if(!validationResult.hasError()){
            this.props.onPrev();
        }else{
            this.setState({validationResult: validationResult}, () => this.focusOn(this.firstElementId));
        }
    }

    focusOn(elementId){
        document.getElementById(elementId).focus();
    }
    updatePackageTypesState(value){
        let totals = _.cloneDeep(this.props.value) || {};
        if(!totals.hasEdited){
            totals.hasEdited = {};
        }
        totals.hasEdited.packageTypes = [];
        let v = _.reject(value,i=>_.isEmpty(i));
        v && v.forEach(item => {
            if(!_.find(totals.packageTypes, {id: item.id})){
                totals.hasEdited.packageTypes.push(item);
            }
        });
        totals.packageTypes = v;
        this.props.onChange(totals);
    }
    updateState(key, value){
        let totals = _.cloneDeep(this.props.value) || {};
        if(!totals.hasEdited){
            totals.hasEdited = {};
        }
        if(parseFloat(totals[key]) !== parseFloat(value)){
            totals.hasEdited[key] = true;
        }
        totals[key] = value;
        this.props.onChange(totals);
    }

    render(){
        return this.props.active ? this.renderActive() : this.renderInactive();
    }

    renderSpanIfValueExists(label, value, unit){
        if(!value){
            return null;
        }
        return <GridCell width = "1-6"><Span label={label} translate={true} value = {`${value} ${unit}`}/></GridCell>;
    }
    renderInactive(){
        if(!this.props.value){
            return <DefaultInactiveElement value="Not entered yet" />;
        }
        let packageTypes =  _.isEmpty(this.props.value.packageTypes) ? super.translate(this.unknownText) : 
                            1 < this.props.value.packageTypes.length ? super.translate(this.packageText) : 
                            this.props.value.packageTypes.map(item => super.translate(item.name)).join(",");
        return (
            <Grid>

                {this.renderSpanIfValueExists("Total Quantity", this.props.value.totalQuantity, "")}
                {this.renderSpanIfValueExists("Package Type", packageTypes, "")}
                {this.renderSpanIfValueExists("Gross Weight", this.props.value.grossWeight, "kg")}
                {this.renderSpanIfValueExists("Net Weight", this.props.value.netWeight, "kg")}
                {this.renderSpanIfValueExists("Volume", this.props.value.volume, "m³")}
                {this.renderSpanIfValueExists("LDM", this.props.value.ldm, "ldm")}
            </Grid>
        );
    }
    renderActive(){
        let value = this.props.value || {};
        return(
            <Grid>

                <GridCell width = "1-4">
                    <NumberInput id = "totalQuantity" label = "Total Quantity" value = {value.totalQuantity}
                                 onchange = {(value) => this.updateState("totalQuantity", value)} />
                </GridCell>
                <GridCell width = "3-4">
                    {   _.isEmpty(this.props.packageTypes) ?  <Span label="Package Type" value = {this.unknownText} translate={true}/> :  
                        1 < this.props.packageTypes.length && this.props.haveShipmentUnitDetails ? <Span label="Package Type" value = {this.packageText} translate={true}/> :
                        <DropDown   id="packageTypes" label="Package Type" options = {this.props.packageTypes}
                            value = {_.first(value.packageTypes)} translate={true}
                            onchange = {(value) => this.updatePackageTypesState([value])} 
                            disabled={this.props.haveShipmentUnitDetails} />
                    }
                </GridCell>
                <GridCell width = "1-4">
                    <NumericInput id = "grossWeight" unit="kg" label="Gross Weight" digitsOptional = {true} digits = {2}
                                  value={value.grossWeight} onchange={(value) => {this.updateState("grossWeight", value)}}/>
                </GridCell>
                <GridCell width = "1-4">
                    <NumericInput id = "netWeight" unit="kg" label="Net Weight" digitsOptional = {true} digits = {2}
                                  value={value.netWeight} onchange={(value) => {this.updateState("netWeight", value)}}/>
                </GridCell>
                <GridCell width = "1-4">
                    <NumericInput id = "volume" unit="m³" label="Volume" digitsOptional = {true} digits = {2}
                                  value={value.volume} onchange={(value) => {this.updateState("volume", value)}}/>
                </GridCell>
                <GridCell width = "1-4">
                    <NumericInput id = "ldm" unit="ldm" label="LDM" digitsOptional = {true} digits = {2}
                                  value={value.ldm} onchange={(value) => {this.updateState("ldm", value)}}/>
                </GridCell>
            </Grid>
        );
    }
}

ShipmentUnitTotals.contextTypes = {
    translator: PropTypes.object
};