import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, Form, Notify, ReadOnlyDropDown } from 'susam-components/basic';
import { Alert, Grid, GridCell, Modal } from 'susam-components/layout';
import { CompanySearchAutoComplete } from 'susam-components/oneorder';
import uuid from "uuid";
import { OptionList } from "../create-order/steps/OptionList";
import * as Customs from '../Customs';
import { LocationService, OrderService } from "../services";
import { ProjectService } from "../services/ProjectService";
import { MiniLoader } from "./MiniLoader";



export class ArrivalTRCustomsDetails extends TranslatingComponent{

    state = {};
    componentDidMount(){

    }
    handleClickEdit(){
        this.setState({customDetailsToEdit: _.cloneDeep(this.props.customsDetails), customDetailsToEditCopy: _.cloneDeep(this.props.customsDetails)}, () => {
            this.loadCustomsRules();
            this.showEditModal();
        });
    }
    loadCustomsOffices(){
        LocationService.listCustomsOffices().then(response => {
            this.setState({customsOffices: response.data});
        }).catch(error => Notify.showError(error));
    }
    loadCustomsTypes(){
        OrderService.getCustomsOperationTypes().then(response => {
            this.setState({customsTypes: response.data});
        }).catch(error => Notify.showError(error));
    }
    loadCustomsLocations() {
        let {customsType, customsOffice} = this.state.customDetailsToEdit;
        if (customsOffice && customsType && !Customs.isCustomsTypeFreeZone(customsType)) {
            LocationService.searchCustomsLocations(
                customsOffice.id, Customs.getCustomsWarehouseType(customsType),
                Customs.isCustomsTypeNeedsLoadTypeCheck(customsType) && this.props.hasDangerousLoad ? true : null,
                Customs.isCustomsTypeNeedsLoadTypeCheck(customsType) && this.props.hasTemperatureControlledLoad ? true : null,
                Customs.isCustomsTypeOnBoardClearance(customsType) ? true : null)
                .then(response => {
                    this.setState({locations: response.data});
                }).catch(error => Notify.showError(error));
        }
    }
    loadCustomsRules(){
        let consignee = this.props.consignee;
        ProjectService.getConsigneeCustomsForCompanyAndLocation(consignee.company.id, consignee.handlingLocation.id, consignee.handlingCompanyType.code).then(response => {
            let customsDefinitions = _.flatten(response.data.map(customsDefinition => customsDefinition.outputList.map(output => {
                let data = _.cloneDeep(output);
                data.dangerousGoods = customsDefinition.dangerousGoods;
                data.temperatureControlledGoods = customsDefinition.temperatureControlledGoods;
                return data;
            })));
            // let filteredCustomsDefinitions = Customs.filterCustomsRuleResults(
            //     customsDefinitions, this.props.hasDangerousLoad, this.props.hasTemperatureControlledLoad);

            customsDefinitions.forEach(item => item._key = uuid.v4());
            this.setState({customsDefinitions: customsDefinitions}, () => {
                if(this.state.customsDefinitions.length === 0){
                    this.loadCustomsOffices();
                    this.loadCustomsTypes();
                    this.loadCustomsLocations();
                    this.loadCustomsDetailsOfWarehouse();
                }
            });
        });
    }

    loadCustomsDetailsOfWarehouse(){
        LocationService.getCustomsLocationByLocationId(this.props.consignee.handlingLocation.id).then(response => {
            if(response.data && response.data.customsType && response.data.customsType.id !== "NON_BONDED_WAREHOUSE"){
                this.setState({handlingLocationCustomsDetails: response.data});
            }
        }).catch(error => Notify.showError(error));
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

    updateStateAndLoadCustomsLocations(key, value){
        let customDetailsToEdit = _.cloneDeep(this.state.customDetailsToEdit);
        customDetailsToEdit[key] = value;
        this.setState({customDetailsToEdit: customDetailsToEdit}, () => {
            this.loadCustomsLocations();
        });
    }

    updateCustomsLocation(value) {
        let customDetailsToEdit = _.cloneDeep(this.state.customDetailsToEdit);
        if (value) {
            customDetailsToEdit.customsLocation = {
                id: value.id,
                name: value.name,
                dangerousGoods: value.usedForDangerousGoods,
                temperatureControlledGoods: value.usedForTempControlledGoods
            };
        } else {
            customDetailsToEdit.customsLocation = null;
        }
        this.setState({customDetailsToEdit: customDetailsToEdit});
    }
    updateState(key, value){
        let customDetailsToEdit = _.cloneDeep(this.state.customDetailsToEdit);
        customDetailsToEdit[key] = value;
        this.setState({customDetailsToEdit: customDetailsToEdit});
    }

    isSameCustomsDetailsSameAsDefinition(customsDefinition){
        return _.isEqual(_.get(this.state.customDetailsToEditCopy, "customsOffice.id"), _.get(customsDefinition, "customsOffice.id")) &&
        _.isEqual(_.get(this.state.customDetailsToEditCopy, "customsType.id"), _.get(customsDefinition, "customsType.id")) &&
        _.isEqual(_.get(this.state.customDetailsToEditCopy, "customsLocation.id"), _.get(customsDefinition, "customsLocation.id")) &&
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
                <GridCell width = "4-5" noMargin = {true}>
                    {this.renderCustomsInfo()}
                </GridCell>
                <GridCell width = "1-5" noMargin = {true}>
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

        let customsLocation =
            <span className = "uk-text-bold uk-text-truncate">
                {customsDetails.customsLocation ? customsDetails.customsLocation.name : super.translate("Customs location not selected")}
            </span>;
        if(Customs.isCustomsTypeFreeZone(customsDetails.customsType)){
            customsLocation = null;
        }
        return(
            <Grid>
                <GridCell width = "1-1" noMargin = {true}>
                                <span className = "uk-text-bold uk-text-truncate">
                                    {customsDetails.customsOffice ? customsDetails.customsOffice.name : super.translate("Customs office not selected")}
                                </span>
                </GridCell>
                <GridCell width = "1-1" noMargin = {true}>
                                <span className = "uk-text-muted uk-text-small uk-text-truncate">
                                    {customsDetails.customsType ? super.translate(customsDetails.customsType.name) : ""}
                                </span>
                </GridCell>
                <GridCell width = "1-1" noMargin = {true}>
                    {customsLocation}
                </GridCell>
                <GridCell width = "1-1" noMargin = {true}>
                                <span className = "uk-text-truncate">
                                    {customsDetails.customsAgent ? customsDetails.customsAgent.name : super.translate("Customs agent not selected")}
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
            <Modal title = {`Customs Info for Arrival`} ref = {c => this.editModal = c} medium = {true}
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
        let customsLocation = <ReadOnlyDropDown id = "customsLocation" label = "Customs Location" required = {true}
                                        options = {this.state.locations} value = {this.state.customDetailsToEdit.customsLocation}
                                        emptyText = "No locations matching criteria..." uninitializedText = "Select customs office and type..."
                                        onchange = {value => this.updateCustomsLocation(value)} />;
        if(Customs.isCustomsTypeFreeZone(this.state.customDetailsToEdit.customsType)){
            customsLocation = null;
        }
        let customsType = _.find(this.state.customsTypes, {code: this.state.customDetailsToEdit.customsType.code});
        return(
            <Form ref = {c => this.form = c}>
                <Grid>
                    <GridCell width = "1-2">
                        <ReadOnlyDropDown id = "customsOffice" label = "Customs Office" required = {true}
                                  options = {this.state.customsOffices} value = {this.state.customDetailsToEdit.customsOffice}
                                  onchange = {value => this.updateStateAndLoadCustomsLocations("customsOffice", value)} />
                    </GridCell>
                    <GridCell width = "1-2">
                        <ReadOnlyDropDown id = "customsType" label = "Customs Type" required = {true}
                                  options = {this.state.customsTypes} value = {customsType} translate={true}
                                  onchange = {value => this.updateStateAndLoadCustomsLocations("customsType", value)} />
                    </GridCell>
                    <GridCell width = "1-2">
                        {customsLocation}
                    </GridCell>
                    <GridCell width = "1-2">
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
                    <Alert type = "warning"
                           message = "There is only one customs option for this consignee" />
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
                    <span className = "uk-text-truncate uk-text-bold">{option.customsLocation ? option.customsLocation.name : ""}</span>
                </GridCell>
                <GridCell width="1-1" noMargin = {true}>
                    <span className = "uk-text-truncate">{option.customsOffice ? option.customsOffice.name : ""}</span>
                </GridCell>
                <GridCell width="1-1" noMargin = {true}>
                    <span className = "uk-text-truncate" style = {{opacity: .8}}>{option.customsAgent ? option.customsAgent.name : ""}</span>
                </GridCell>
                <GridCell width="1-1" noMargin = {true}>
                    <span className = "uk-text-truncate" style = {{opacity: .8}}>{option.customsType ? super.translate(option.customsType.name) : ""}</span>
                </GridCell>
            </Grid>
        );
    }

}

ArrivalTRCustomsDetails.contextTypes = {
    translator: PropTypes.object
};