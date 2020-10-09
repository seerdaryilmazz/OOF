import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { NumberInput } from 'susam-components/advanced';
import { Button, DropDown } from 'susam-components/basic';
import { Grid, GridCell } from 'susam-components/layout';
import { DefaultInactiveElement } from './OrderSteps';


export class EquipmentRequirement extends TranslatingComponent {

    constructor(props){
        super(props);
        this.state = {};
        this.firstElementId = "equipment-count";
        this.lastElementId = "equipment-type-text";
        this.focusedElementId = null;
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

    updateState(key, value){
        let details = _.cloneDeep(this.props.value);
        details[key] = value;
        this.props.onChange && this.props.onChange(details);
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

    renderDeleteButton(){
        if(!this.props.requiredByWarehouse){
            return <Button label="Delete" size = "small" flat = {true} style = "danger" onclick = {() => this.handleDelete()} />;
        }
        return null;
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
                    {this.renderDeleteButton()}
                </GridCell>
        }
        return (
            <Grid>
                {this.renderValidation()}
                <GridCell width = "1-1">
                    <span className = "heading_a_thin">{this.props.value.equipmentCount ? this.props.value.equipmentCount : "0"}</span>
                    <span className = "heading_a_thin" style = {{marginLeft: "8px"}}>
                        {this.props.value.equipmentType ? super.translate(this.props.value.equipmentType.name) : ""}
                        </span>
                </GridCell>
                {buttons}
            </Grid>
        );
    }
    renderActive(){
        let equipmentType = <DropDown options = {this.props.types} id = "equipment-type" placeholder = "Equipment Type"
                                      value = {this.props.value.equipmentType} translate={true}
                                      onchange = {(value) => this.updateState("equipmentType", value)} />;
        if(this.props.requiredByWarehouse){
            equipmentType =
                <div className = "uk-margin-top">
                    <span className = "heading_a_thin" style = {{marginLeft: "8px"}}>
                        {this.props.value.equipmentType ? super.translate(this.props.value.equipmentType.name) : ""}
                    </span>
                </div>
        }
        return(
            <Grid>
                {this.renderValidation()}
                <GridCell width = "1-6">
                    <NumberInput id = "equipment-count" placeholder = "Equipment Count"
                              value = {this.props.value.equipmentCount}
                              onchange = {(value) => this.updateState("equipmentCount", value)} />
                </GridCell>
                <GridCell width = "1-2">
                    {equipmentType}
                </GridCell>
                <GridCell width = "1-1">
                    <div className = "uk-align-center">
                        {this.renderDeleteButton()}
                    </div>
                </GridCell>
            </Grid>
        );
    }
}

EquipmentRequirement.contextTypes = {
    translator: PropTypes.object
};