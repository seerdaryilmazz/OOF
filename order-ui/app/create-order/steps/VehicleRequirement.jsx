import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Chip } from 'susam-components/advanced';
import { Button, DropDown } from 'susam-components/basic';
import { Grid, GridCell } from 'susam-components/layout';
import { DefaultInactiveElement } from './OrderSteps';


export class VehicleRequirement extends TranslatingComponent {

    constructor(props){
        super(props);
        this.state = {};
        this.firstElementId = "requirement-type-text";
        this.lastElementId = "requirement-text";
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
                    <span className = "heading_a_thin">{this.props.value.requirementType ? super.translate(this.props.value.requirementType.name) : ""}</span>
                    <span className = "heading_a_thin" style = {{marginLeft: "12px"}}>
                        {this.props.value.requirement ? this.props.value.requirement.map(item => super.translate(item.name)).join(", ") : ""}
                        </span>
                </GridCell>
                {buttons}
            </Grid>
        );
    }
    renderActive(){
        return(
            <Grid>
                {this.renderValidation()}
                <GridCell width = "1-4">
                    <DropDown options = {this.props.permissionTypes} id = "requirement-type" placeholder = "Requirement Type"
                              value = {this.props.value.requirementType}
                              onchange = {(value) => this.updateState("requirementType", value)} />
                </GridCell>
                <GridCell width = "3-4">
                    <Chip options = {this.props.features} id = "requirement" placeholder = "Details"
                              value = {this.props.value.requirement}
                              onchange = {(value) => this.updateState("requirement", value)} />
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

VehicleRequirement.contextTypes = {
    translator: PropTypes.object
};