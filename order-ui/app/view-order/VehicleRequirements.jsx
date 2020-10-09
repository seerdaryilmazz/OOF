import * as axios from "axios";
import _ from "lodash";
import PropTypes from 'prop-types';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Chip } from 'susam-components/advanced';
import { Button, Notify, Span } from 'susam-components/basic';
import { CardSubHeader, Grid, GridCell, Loader, Modal } from 'susam-components/layout';
import { OrderService } from "../services";


export class VehicleRequirements extends TranslatingComponent{

    state = {};

    constructor(props){
        super(props);
    }

    loadVehicleRequirements(){
        OrderService.getVehicleFeaturesForCreateOrder().then(response => {
            let requirementTypes = response.data;
            let nonEditableCollectionRequirements = _.filter(this.props.requirements, item => {
                return item.operationType.id === "COLLECTION" && item.requirementReason.id !== "BY_ORDER";
            }).map(item => item.requirement);
            let loadingRequirementTypes = _.filter(requirementTypes, item => {
                return _.findIndex(nonEditableCollectionRequirements, {code: item.code}) === -1;
            });
            let nonEditableDistributionRequirements = _.filter(this.props.requirements, item => {
                return item.operationType.id === "DISTRIBUTION" && item.requirementReason.id !== "BY_ORDER";
            }).map(item => item.requirement);
            let unloadingRequirementTypes = _.filter(requirementTypes, item => {
                return _.findIndex(nonEditableDistributionRequirements, {code: item.code}) === -1;
            });
            this.setState({loadingRequirementTypes: loadingRequirementTypes, unloadingRequirementTypes: unloadingRequirementTypes});
        }).catch(error => Notify.showError(error));
    }

    handleClickEdit(){
        this.setState({requirementsToEdit: _.cloneDeep(this.props.requirements) || []}, () => {
            this.loadVehicleRequirements();
            this.showEditModal();
        });
    }
    handleClickSaveRequirements(){
        let requiredForLoading = _.filter(this.state.requirementsToEdit, item => item.operationType.id === "COLLECTION")
            .map(item => item.requirement.id);
        let requiredForUnloading = _.filter(this.state.requirementsToEdit, item => item.operationType.id === "DISTRIBUTION")
            .map(item => item.requirement.id);
        axios.all([
            OrderService.validateVehicleFeatures(requiredForLoading),
            OrderService.validateVehicleFeatures(requiredForUnloading)
        ]).then(axios.spread((loadingResponse, unloadingResponse) => {
            let requirementsByOrder =_.filter(this.state.requirementsToEdit, item => item.requirementReason.id === "BY_ORDER");
           this.props.onSave && this.props.onSave(requirementsByOrder);
           this.hideEditModal();
        })).catch(error => Notify.showError(error));
    }

    hideEditModal(){
        this.setState({requirementsToEdit: null}, () => this.editModal.close());
    }
    showEditModal(){
        this.editModal.open();
    }
    updateLoadingRequirements(value){
        this.updateRequirementsOf("COLLECTION", value);
    }
    updateUnloadingRequirements(value){
        this.updateRequirementsOf("DISTRIBUTION", value);
    }

    updateRequirementsOf(type, value){
        let requirements = value.map(item => {
            return {
                requirement: item,
                operationType: {id: type},
                requirementReason: {id: "BY_ORDER"}
            }
        });
        let requirementsToEdit = _.cloneDeep(this.state.requirementsToEdit);
        _.remove(requirementsToEdit, item => item.operationType.id === type && item.requirementReason.id === "BY_ORDER");
        requirements.forEach(item => requirementsToEdit.push(item));
        this.setState({requirementsToEdit: requirementsToEdit});
    }

    render(){
        return (
            <div>
                <Grid>
                    <GridCell width = "1-1" noMargin = {true}>
                        <CardSubHeader title = "Vehicle Requirements"/>
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
        let collectionRequirements = _.filter(this.props.requirements, item => {
            return item.operationType.id === "COLLECTION";
        });
        let distributionRequirements = _.filter(this.props.requirements, item => {
            return item.operationType.id === "DISTRIBUTION";
        });

        if(collectionRequirements.length === 0 && distributionRequirements.length === 0){
            lines.push(
                <GridCell key = "no-data" width = "1-1">
                    <span className="uk-text-muted" style = {{marginTop: "12px"}}>{super.translate("No requirements")}</span>
                </GridCell>);
        }else{
            if(collectionRequirements.length > 0){
                lines.push(
                    <GridCell key = "loading-title" width = "1-3">
                        <span className="uk-text-bold">{super.translate("Loading")}</span>
                    </GridCell>);
                lines.push(
                    <GridCell key = "loading-data" width = "2-3">
                        <span>{collectionRequirements.map(item => super.translate(item.requirement.name)).join(",")}</span>
                    </GridCell>)
            }
            if(distributionRequirements.length > 0){
                lines.push(
                    <GridCell key = "unloading-title" width = "1-3">
                        <span className="uk-text-bold">{super.translate("Unloading")}</span>
                    </GridCell>);
                lines.push(
                    <GridCell key = "unloading-data" width = "2-3">
                        <span>{distributionRequirements.map(item => super.translate(item.requirement.name)).join(",")}</span>
                    </GridCell>);
            }
        }
        if(this.props.editable){
            lines.push(
                <GridCell key = "edit-button" width = "1-1">
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
            {label: "Save", buttonStyle: "primary", action:() => this.handleClickSaveRequirements()}
        ];
        return (
            <Modal title = "Edit Vehicle Requirements" ref = {c => this.editModal = c} medium = {true} minHeight = {300}
                   closeOtherOpenModals = {false}
                   actions={actions}>
                {this.renderEditModalContent()}
            </Modal>
        );
    }
    renderEditModalContent(){
        if(!this.state.requirementsToEdit){
            return null;
        }
        let editableCollectionRequirements = _.filter(this.state.requirementsToEdit, item => {
            return item.operationType.id === "COLLECTION" && item.requirementReason.id === "BY_ORDER";
        }).map(item => item.requirement);

        let editableDistributionRequirements = _.filter(this.state.requirementsToEdit, item => {
            return item.operationType.id === "DISTRIBUTION" && item.requirementReason.id === "BY_ORDER";
        }).map(item => item.requirement);
        return(
            <Grid>
                {this.renderNonOrderCollectionRequirementsForLoading()}
                {this.renderNonOrderDistributionRequirementsForUnloading()}
                <GridCell width = "1-2">
                    <Chip label = "Order Requirements for Loading" options = {this.state.loadingRequirementTypes}
                          value = {editableCollectionRequirements} hideSelectAll = {true}
                          onchange = {(value) => this.updateLoadingRequirements(value)} />
                </GridCell>
                <GridCell width = "1-2">
                    <Chip label = "Order Requirements for Unloading" options = {this.state.unloadingRequirementTypes}
                          value = {editableDistributionRequirements} hideSelectAll = {true}
                          onchange = {(value) => this.updateUnloadingRequirements(value)} />
                </GridCell>
            </Grid>
        );
    }

    renderNonOrderCollectionRequirementsForLoading(){
        let nonEditableCollectionRequirements = _.filter(this.state.requirementsToEdit, item => {
            return item.operationType.id === "COLLECTION" && item.requirementReason.id !== "BY_ORDER";
        }).map(item => item.requirement.name);
        return(
              <GridCell width = "1-2">
                  <Span label = "Warehouse & Load Requirements for Loading"
                        value = {nonEditableCollectionRequirements.length === 0 ? "No Requirements" : nonEditableCollectionRequirements.join(",")} />
              </GridCell>
        );

    }
    renderNonOrderDistributionRequirementsForUnloading(){
        let nonEditableDistributionRequirements = _.filter(this.state.requirementsToEdit, item => {
            return item.operationType.id === "DISTRIBUTION" && item.requirementReason.id !== "BY_ORDER";
        }).map(item => item.requirement.name);
        return(
            <GridCell width = "1-2">
                  <Span label = "Warehouse & Load Requirements for Unloading"
                        value = {nonEditableDistributionRequirements.length === 0 ? "No Requirements" : nonEditableDistributionRequirements.join(",")} />
            </GridCell>
        );

    }
}

VehicleRequirements.contextTypes = {
    translator: PropTypes.object
};