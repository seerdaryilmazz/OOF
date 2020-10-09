import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { NumericInput } from 'susam-components/advanced';
import { Button, Notify, Span } from 'susam-components/basic';
import { CardSubHeader, Grid, GridCell, Loader, Modal } from 'susam-components/layout';

export class TemperatureLimits extends TranslatingComponent{

    state = {};

    handleClickEdit(){
        this.setState({temperatureLimitsToEdit: {minValue: this.props.minValue, maxValue: this.props.maxValue}},
            () => this.showEditModal());
    }
    handleClickSave(){
        if(!this.validate(this.state.temperatureLimitsToEdit)){
            return;
        }
        this.props.onSave && this.props.onSave(this.state.temperatureLimitsToEdit);
        this.hideEditModal();
    }

    hideEditModal(){
        this.setState({temperatureLimitsToEdit: null}, () => this.editModal.close());
    }
    showEditModal(){
        this.editModal.open();
    }
    isValueEmpty(value){
        return _.isNil(value) || value === "";
    }
    validate(temperatureLimits){
        console.log("temperatureLimits", temperatureLimits);
        if(!this.props.canAddTemperatureLimits && (!this.isValueEmpty(temperatureLimits.minValue) || !this.isValueEmpty(temperatureLimits.maxValue))){
            Notify.showError("TR arrival customs location can not be used for temperature controlled goods");
            return false;
        }
        if(!this.isValueEmpty(temperatureLimits.minValue) && !this.isValueEmpty(temperatureLimits.maxValue) &&
                temperatureLimits.maxValue < temperatureLimits.minValue){
            Notify.showError("Max temperature should be higher than min temperature");
            return false;
        }
        if(this.isValueEmpty(temperatureLimits.minValue) && !this.isValueEmpty(temperatureLimits.maxValue)){
            Notify.showError("Please enter a min or fixed temperature");
            return false;
        }
        let possibleMin = -25, possibleMax = 25;
        if(!this.isValueEmpty(temperatureLimits.minValue) && temperatureLimits.minValue < possibleMin){
            Notify.showError(`Min temperature should not be lower than ${possibleMin}`);
            return false;
        }
        if(!this.isValueEmpty(temperatureLimits.maxValue) && temperatureLimits.maxValue > possibleMax){
            Notify.showError(`Max temperature should not be higher than ${possibleMax}`);
            return false;
        }
        return true;
    }
    updateMinValue(value){
        let temperatureLimitsToEdit = _.cloneDeep(this.state.temperatureLimitsToEdit);
        temperatureLimitsToEdit.minValue = value;
        this.setState({temperatureLimitsToEdit: temperatureLimitsToEdit});

    }
    updateMaxValue(value){
        let temperatureLimitsToEdit = _.cloneDeep(this.state.temperatureLimitsToEdit);
        temperatureLimitsToEdit.maxValue = value;
        this.setState({temperatureLimitsToEdit: temperatureLimitsToEdit});
    }
    render(){
        return(
            <div>
                <Grid>
                    <GridCell width = "1-1" noMargin = {true}>
                        <CardSubHeader title="Temperature Controlled" />
                    </GridCell>
                    {this.renderContent()}
                </Grid>
                {this.renderEditModal()}
            </div>
        );
    }
    renderContent(){
        if(this.props.busy){
            return <GridCell width = "1-1" noMargin = {true}><Loader title = "Saving..." size = "M"/></GridCell>;
        }
        let lines = [];
        if(_.isNil(this.props.minValue) && _.isNil(this.props.maxValue)){
            lines.push(
                <GridCell width = "2-3" key = "no-data">
                    <span className="uk-text-muted" style = {{marginTop: "12px"}}>
                        {super.translate("No temperature limits")}
                    </span>
                </GridCell>
            );
        }
        if(!_.isNil(this.props.minValue) && _.isNil(this.props.maxValue)){
            lines.push(
                <GridCell key = "fix" width = "1-3">
                    <Span label = "Fixed" value = {this.props.minValue + " °C"} />
                </GridCell>
            );
        }
        if(!_.isNil(this.props.minValue) && !_.isNil(this.props.maxValue)){
            lines.push(
                <GridCell key = "min" width = "1-3">
                    <Span label = "Minimum" value = {this.props.minValue + " °C"} />
                </GridCell>
            );
            lines.push(
                <GridCell key = "max" width = "1-3">
                    <Span label = "Maximum" value = {this.props.maxValue + " °C"} />
                </GridCell>
            );
        }
        if(this.props.editable){
            lines.push(
                <GridCell key = "edit-button" width = "1-3">
                    <div className = "uk-text-center">
                        <Button label = "edit" style = "primary" size = "small" flat = {true} onclick = {() => {this.handleClickEdit()}} />
                    </div>
                </GridCell>
            );
        }
        return lines;
    }
    renderEditModal(){
        let actions = [
            {label:"Close", action:() => this.hideEditModal()},
            {label: "Save", buttonStyle: "primary", action:() => this.handleClickSave()}
        ];

        return (
            <Modal title = "Edit Temperature Limits" ref = {c => this.editModal = c}
                   closeOtherOpenModals = {false}
                   actions={actions}>
                {this.renderEditModalContent()}
            </Modal>
        );

    }
    renderEditModalContent(){
        if(!this.state.temperatureLimitsToEdit){
            return null;
        }
        return (
            <Grid>
                <GridCell width = "1-2">
                    <NumericInput unit="°C" label="Fixed or Minimum" digitsOptional = {true} digits = {0}
                                  allowMinus = {true}
                                  value={this.state.temperatureLimitsToEdit.minValue} onchange={(value) => {this.updateMinValue(value)}}/>

                </GridCell>
                <GridCell width = "1-2">
                    <NumericInput unit="°C" label="Maximum" digitsOptional = {true} digits = {0}
                                  allowMinus = {true}
                                  value={this.state.temperatureLimitsToEdit.maxValue} onchange={(value) => {this.updateMaxValue(value)}}/>
                </GridCell>
            </Grid>
        );
    }
}

TemperatureLimits.contextTypes = {
    translator: PropTypes.object
};