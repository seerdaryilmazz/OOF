import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, DropDown, Form, Notify } from 'susam-components/basic';
import { Alert, Grid, GridCell, Modal } from 'susam-components/layout';
import uuid from "uuid";
import { OptionList } from "../create-order/steps/OptionList";
import { convertEnumToLookup } from "../Helper";
import { LocationService } from "../services";
import { ProjectService } from "../services/ProjectService";
import { MiniLoader } from "./MiniLoader";

export class GeneralCustomsDetails extends TranslatingComponent{

    state = {};
    componentDidMount(){

    }
    handleClickEdit(){
        this.setState({customDetailsToEdit: _.cloneDeep(this.props.customsDetails || {}),  customDetailsToEditCopy: _.cloneDeep(this.props.customsDetails)}, () => {
            this.loadCustomsCompanies();
            this.loadAgentLocations();
            this.props.departure && this.loadSenderCustomsRules();
            this.props.arrival && this.loadConsigneeCustomsRules();
            this.showEditModal();
        });
    }
    loadCustomsCompanies(){
        LocationService.listCompaniesWithEuropeanCustomsLocations().then(response => {
            this.setState({customsAgents: response.data});
        }).catch(error => Notify.showError(error));
    }
    loadAgentLocations(){
        if(!this.state.customDetailsToEdit.customsAgent){
            return;
        }
        let customsAgentType = _.get(this.state,'customDetailsToEdit.customsAgent.type') ||  _.get(this.state,'customDetailsToEdit.customsAgentType.code'); 
        LocationService.findEuropeanCustomsLocations(this.state.customDetailsToEdit.customsAgent.id, customsAgentType).then(response => {
            if(!response.data || response.data.length === 0){
                Notify.showError("There is no customs location of chosen company");
                return;
            }
            this.setState({locations: response.data});
        }).catch(error => Notify.showError(error));
    }
    loadSenderCustomsRules(){
        let sender = this.props.sender;
        ProjectService.getSenderCustomsForCompanyAndLocation(sender.company.id, sender.handlingLocation.id, sender.handlingCompanyType.code).then(response => {
            let customsDefinitions = _.flatten(response.data.map(item => item.outputList));
            customsDefinitions.forEach(item => item._key = uuid.v4());
            this.setState({customsDefinitions: customsDefinitions});
        });
    }
    loadConsigneeCustomsRules(){
        let consignee = this.props.consignee;
        ProjectService.getConsigneeCustomsForCompanyAndLocation(consignee.company.id, consignee.handlingLocation.id, consignee.handlingCompanyType.code).then(response => {
            let customsDefinitions = _.flatten(response.data.map(item => item.outputList));
            customsDefinitions.forEach(item => item._key = uuid.v4());
            this.setState({customsDefinitions: customsDefinitions});
        });
    }
    hideEditModal(){
        this.setState({customDetailsToEdit: null}, () => this.editModal && this.editModal.close());
    }
    showEditModal(){
        this.editModal.open();
    }
    handleClickSaveCustomsDetails(){
        if(this.form && !this.form.validate()){
            return;
        }
        let customDetailsToEdit = _.cloneDeep(this.state.customDetailsToEdit);
        customDetailsToEdit.customsAgent && _.set(customDetailsToEdit, 'customsAgentType', convertEnumToLookup(customDetailsToEdit.customsAgent.type));
        this.props.onSave && this.props.onSave(customDetailsToEdit);
        this.hideEditModal();
    }
    handleSelectCustomsOption(value){
        this.setState({customDetailsToEdit: value});
    }

    updateCustomsAgent(value){
        let customDetailsToEdit = _.cloneDeep(this.state.customDetailsToEdit);
        customDetailsToEdit.customsAgent = value;
        this.setState({customDetailsToEdit: customDetailsToEdit}, () => this.loadAgentLocations());

    }

    updateCustomsAgentLocation(value){
        let customDetailsToEdit = _.cloneDeep(this.state.customDetailsToEdit);
        customDetailsToEdit.customsAgentLocation = value;
        this.setState({customDetailsToEdit: customDetailsToEdit});
    }

    isSameCustomsDetailsSameAsDefinition(customsDefinition){
        return _.isEqual(_.get(this.state.customDetailsToEditCopy, "customsAgentLocation.id"), _.get(customsDefinition, "customsAgentLocation.id")) &&
            _.isEqual(_.get(this.state.customDetailsToEditCopy, "customsAgent.id"), _.get(customsDefinition, "customsAgent.id"));
    }

    render(){
        return(
            <div>
                {this.renderContent()}
                {this.renderModal()}
            </div>
        );
    }
    renderContent(){
        if(this.props.busy){
            return <Grid><GridCell width = "1-1"><MiniLoader title = "Saving..."/></GridCell></Grid>;
        }
        return(
            <Grid>
                <GridCell width = "2-3" noMargin = {true}>
                    {this.renderCustomsInfo()}
                </GridCell>
                <GridCell width = "1-3" noMargin = {true}>
                    {
                        this.props.editable ?
                            <Button label = "Edit" size = "small" flat = {true} style = "primary" onclick = {() => this.handleClickEdit()}/> :
                            null
                    }
                </GridCell>
            </Grid>
        );
    }
    renderCustomsInfo(){
        let {customsDetails} = this.props;
        if(!customsDetails){
            return <span className = "uk-text-muted">{super.translate("No Customs definition")}</span>;
        }
        return(
            <Grid>
                <GridCell width = "1-1" noMargin = {true}>
                                <span className = "uk-text-bold">
                                    {customsDetails.customsAgentLocation ? customsDetails.customsAgentLocation.name : "Location not selected"}
                                </span>
                </GridCell>
                <GridCell width = "1-1" noMargin = {true}>
                                <span className = "uk-text-muted">
                                    {customsDetails.customsAgent ? customsDetails.customsAgent.name : "Agent not selected"}
                                </span>
                </GridCell>
            </Grid>
        );
    }
    renderModal(){
        let actions = [
            {label: "Close", action:() => this.hideEditModal()},
            {label: "Save", buttonStyle: "primary", action:() => this.handleClickSaveCustomsDetails()}
        ];
        let mode = this.props.arrival ? "Arrival" : (this.props.departure ? "Departure" : "");
        return (
            <Modal title = {`Customs Info for ${mode}`} ref = {c => this.editModal = c}
                   closeOtherOpenModals = {false}
                   actions={actions}>
                {this.renderEditModalContent()}
            </Modal>
        );
    }
    renderEditModalContent(){
        if(!this.state.customDetailsToEdit){
            return null;
        }
        if(this.state.customsDefinitions){
            if(this.state.customsDefinitions.length === 1){
                if(this.isSameCustomsDetailsSameAsDefinition(this.state.customsDefinitions[0])){
                    return this.renderOnlyOneRuleAlert();
                }else{
                    return this.renderCustomsOptions();
                }
            }else if(this.state.customsDefinitions.length > 1){
                return this.renderCustomsOptions();
            }
        }
        return this.renderCustomsForm();
    }
    renderCustomsForm(){
        return(
            <Form ref = {c => this.form = c}>
                <Grid>
                    <GridCell width = "1-1">
                        <DropDown label = "Customs Agent" required = {true}
                                  options = {this.state.customsAgents} value = {this.state.customDetailsToEdit.customsAgent}
                                  onchange = {(value) => this.updateCustomsAgent(value)} />
                    </GridCell>
                    <GridCell width = "1-1">
                        <DropDown label = "Customs Agent Location" required = {true}
                                  options = {this.state.locations}
                                  emptyText = "No locations..." uninitializedText = "Select customs agent..."
                                  value = {this.state.customDetailsToEdit.customsAgentLocation}
                                  onchange = {value => this.updateCustomsAgentLocation(value)} />
                    </GridCell>
                </Grid>
            </Form>
        );
    }
    renderOnlyOneRuleAlert(){
        let mode = this.props.arrival ? "consignee" : (this.props.departure ? "sender" : "");
        return(
            <Grid>
                <GridCell width = "1-1">
                    <Alert style = "warning"
                           message = {`There is only one customs option for this ${mode}`} />
                </GridCell>
            </Grid>
        );
    }
    renderCustomsOptions(){
        return(
            <OptionList options = {this.state.customsDefinitions} columns = {2}
                        keyField="_key" value = {this.state.customDetailsToEdit}
                        onChange = {(value) => this.handleSelectCustomsOption(value) }
                        onRender = {(option) => this.renderCustomsOption(option)}/>
        );
    }
    renderCustomsOption(option){
        return(
            <Grid>
                <GridCell width="1-1" noMargin = {true}>
                    <span className = "uk-text-truncate uk-text-bold">{option.customsAgent ? option.customsAgent.name : ""}</span>
                </GridCell>
                <GridCell width="1-1" noMargin = {true}>
                    <span className = "uk-text-truncate" style = {{opacity: .8}}>{option.customsAgentLocation ? option.customsAgentLocation.name : ""}</span>
                </GridCell>
            </Grid>
        );
    }

}

GeneralCustomsDetails.contextTypes = {
    translator: PropTypes.object
};