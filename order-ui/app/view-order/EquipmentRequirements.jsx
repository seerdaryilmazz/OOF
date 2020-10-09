import _ from "lodash";
import PropTypes from 'prop-types';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { NumberInput } from 'susam-components/advanced';
import { Button, DropDown, Form, Notify } from 'susam-components/basic';
import { CardSubHeader, Grid, GridCell, Loader, Modal } from 'susam-components/layout';
import { OrderService } from "../services";


export class EquipmentRequirements extends TranslatingComponent{

    state = {};

    constructor(props){
        super(props);
    }

    componentDidMount(){
        this.loadEquipmentTypes();
    }

    loadEquipmentTypes(){
        OrderService.getEquipmentTypes().then(response => {
            this.setState({equipmentTypes: response.data})
        }).catch(error => Notify.showError(error));
    }

    handleClickEdit(item){
        this.setState({requirementToEdit: item}, () => {
            this.showEditModal();
        });
    }
    handleClickAdd(){
        this.setState({requirementToEdit: {}}, () => {
            this.showEditModal();
        });
    }
    handleClickDelete(requirement){
        if(!this.validateDeleteWithWarehouseRules(requirement)){
            return;
        }
        UIkit.modal.confirm("Are you sure ?", () => this.handleDelete(requirement));
    }
    handleDelete(requirement){
        this.props.onDelete && this.props.onDelete(requirement.id);
    }

    validateDeleteWithWarehouseRules(requirement){
        if (!this.props.equipmentRequirementsByWarehouse) {
            return true;
        }
        let requirementByWarehouse = _.find(this.props.equipmentRequirementsByWarehouse, item => item.equipment === ""+requirement.equipment.id);
        if(requirementByWarehouse){
            Notify.showError(`Sender warehouse requires an equipment ${requirement.equipment.name}, it can not be deleted`);
            return false;
        }

        return true;
    }

    validateSaveWithWarehouseRules() {
        if (!this.props.equipmentRequirementsByWarehouse) {
            return true;
        }
        let requirementByWarehouse = _.find(this.props.equipmentRequirementsByWarehouse, item => item.equipment === ""+this.state.requirementToEdit.equipment.id);
        if(requirementByWarehouse && this.state.requirementToEdit.count < requirementByWarehouse.count){
            Notify.showError(`Sender warehouse requires an equipment ${this.state.requirementToEdit.equipment.name} with count ${requirementByWarehouse.count}`);
            return false;
        }

        return true;
    }

    handleClickSaveRequirements(){
        if(!this.form.validate()){
            return;
        }
        if(!this.validateSaveWithWarehouseRules()){
            return;
        }
        this.props.onSave && this.props.onSave(this.state.requirementToEdit);
        this.hideEditModal();
    }

    hideEditModal(){
        this.setState({requirementsToEdit: null}, () => this.editModal.close());
    }
    showEditModal(){
        this.editModal.open();
    }
    updateState(key, value){
        let requirementToEdit = _.cloneDeep(this.state.requirementToEdit);
        requirementToEdit[key] = value;
        this.setState({requirementToEdit: requirementToEdit});
    }

    render(){
        let toolbar = this.props.editable ? [{
            iconClass: "uk-icon-plus",
            title: "Add item",
            onClick: () => this.handleClickAdd()

        }] : null;
        return (
            <div>
                <Grid>
                    <GridCell width = "1-1" noMargin = {true}>
                        <CardSubHeader title = "Equipment Requirements" toolbar = {toolbar}/>
                    </GridCell>
                    {this.renderContent()}
                </Grid>
                {this.renderEditModal()}
            </div>
        );
    }
    renderContent(){
        if(this.props.busy){
            return <GridCell width = "1-1" noMargin = {true}><Loader title = "Saving..." size = "S"/></GridCell>;
        }
        let lines = [];
        if(this.props.requirements.length === 0){
            lines.push(
                <GridCell key = "no-data" width = "1-1">
                    <span className="uk-text-muted" style = {{marginTop: "12px"}}>{super.translate("No requirements")}</span>
                </GridCell>);
        }else {
            if (this.props.requirements.length > 0) {
                this.props.requirements.map(item => {
                    return (
                        <GridCell key={item.equipment.id} width="1-1" noMargin = {true}>
                            <span>{item.count}</span>
                            <span style={{marginLeft: "8px"}}>{item.equipment ? super.translate(item.equipment.name) : ""}</span>
                            {this.renderButtons(item)}

                        </GridCell>
                    );
                }).forEach(item => lines.push(item));
            }
        }
        return lines;
    }

    renderButtons(item){
        if(!this.props.editable){
            return null;
        }

        return (
            <span className = "uk-float-right">
                <Button label = "edit" style = "success" size = "small" flat = {true}
                        onclick = {() => {this.handleClickEdit(item)}} />
                <Button label = "delete" style = "danger" size = "small" flat = {true}
                        onclick = {() => {this.handleClickDelete(item)}} />
            </span>
        );
    }


    renderEditModal(){
        let actions = [
            {label:"Close", action:() => this.hideEditModal()},
            {label: "Save", buttonStyle: "primary", action:() => this.handleClickSaveRequirements()}
        ];
        return (
            <Modal title = "Edit Equipment Requirements" ref = {c => this.editModal = c}
                   closeOtherOpenModals = {false}
                   actions={actions}>
                {this.renderEditModalContent()}
            </Modal>
        );
    }

    renderEditModalContent(){
        if(!this.state.requirementToEdit){
            return null;
        }
        let equipmentType = <DropDown options = {this.state.equipmentTypes} placeholder = "Equipment Type"
                                      value = {this.state.requirementToEdit.equipment}
                                      onchange = {(value) => this.updateState("equipment", value)} />;
        if(this.props.requiredByWarehouse){
            equipmentType =
                <div className = "uk-margin-top">
                    <span className = "heading_a_thin" style = {{marginLeft: "8px"}}>
                        {this.state.requirementToEdit.equipment ? this.state.requirementToEdit.equipment.name : ""}
                    </span>
                </div>
        }

        return(
            <Form ref = {c => this.form = c}>
                <Grid>
                    <GridCell width = "1-2">
                        <NumberInput placeholder = "Equipment Count"
                                     value = {this.state.requirementToEdit.count}
                                     onchange = {(value) => this.updateState("count", value)} />
                    </GridCell>
                    <GridCell width = "1-2">
                        {equipmentType}
                    </GridCell>
                </Grid>
            </Form>
        );
    }

}

EquipmentRequirements.contextTypes = {
    translator: PropTypes.object
};