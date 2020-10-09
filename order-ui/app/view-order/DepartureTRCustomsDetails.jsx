import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, DropDown, Form, Notify } from 'susam-components/basic';
import { Alert, Grid, GridCell, Modal } from 'susam-components/layout';
import { CompanySearchAutoComplete } from 'susam-components/oneorder';
import uuid from "uuid";
import { OptionList } from "../create-order/steps/OptionList";
import { LocationService } from "../services";
import { ProjectService } from "../services/ProjectService";
import { MiniLoader } from "./MiniLoader";


export class DepartureTRCustomsDetails extends TranslatingComponent{

    state = {};
    componentDidMount(){

    }
    handleClickEdit(){
        this.setState({customDetailsToEdit: _.cloneDeep(this.props.customsDetails), customDetailsToEditCopy:  _.cloneDeep(this.props.customsDetails)}, () => {
            this.loadCustomsOffices();
            this.loadCustomsRules();
            this.showEditModal();
        });
    }
    loadCustomsOffices(){
        LocationService.listCustomsOffices().then(response => {
            this.setState({customsOffices: response.data});
        }).catch(error => Notify.showError(error));
    }
    loadCustomsRules(){
        let sender = this.props.sender;
        ProjectService.getSenderCustomsForCompanyAndLocation(sender.company.id, sender.handlingLocation.id, sender.handlingCompanyType.code).then(response => {
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
        this.props.onSave && this.props.onSave(this.state.customDetailsToEdit);
        this.hideEditModal();
    }
    handleSelectCustomsOption(value){
        this.setState({customDetailsToEdit: value});
    }
    updateState(key, value){
        let customDetailsToEdit = _.cloneDeep(this.state.customDetailsToEdit);
        customDetailsToEdit[key] = value;
        this.setState({customDetailsToEdit: customDetailsToEdit});
    }

    isSameCustomsDetailsSameAsDefinition(customsDefinition){
        return _.isEqual(_.get(this.state.customDetailsToEditCopy, "customsOffice.id"), _.get(customsDefinition, "customsOffice.id")) &&
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
                                    {customsDetails.customsOffice ? customsDetails.customsOffice.name : super.translate("Customs office not selected")}
                                </span>
                </GridCell>
                <GridCell width = "1-1" noMargin = {true}>
                                <span className = "uk-text-muted">
                                    {customsDetails.customsAgent ? customsDetails.customsAgent.name : super.translate("Agent not selected")}
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
        return (
            <Modal title = {`Customs Info for Departure`} ref = {c => this.editModal = c}
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
                        <DropDown id = "customsOffice" label = "Customs Office" required = {true}
                                  options = {this.state.customsOffices}
                                  value = {this.state.customDetailsToEdit.customsOffice}
                                  onchange = {value => this.updateState("customsOffice", value)} />
                    </GridCell>
                    <GridCell width = "1-1">
                        <CompanySearchAutoComplete id = "customsAgent" label = "Customs Agent" required = {true}
                                                   value = {this.state.customDetailsToEdit.customsAgent}
                                                   onchange = {(value) => this.updateState("customsAgent", value)} />
                    </GridCell>
                </Grid>
            </Form>
        );
    }
    renderOnlyOneRuleAlert(){
        return(
            <Grid>
                <GridCell width = "1-1">
                    <Alert style = "warning"
                           message = "There is only one customs option for this sender" />
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
                    <span className = "uk-text-truncate uk-text-bold">{option.customsOffice ? option.customsOffice.name : ""}</span>
                </GridCell>
                <GridCell width="1-1" noMargin = {true}>
                    <span className = "uk-text-truncate" style = {{opacity: .8}}>{option.customsAgent ? option.customsAgent.name : ""}</span>
                </GridCell>
            </Grid>
        );
    }

}

DepartureTRCustomsDetails.contextTypes = {
    translator: PropTypes.object
};