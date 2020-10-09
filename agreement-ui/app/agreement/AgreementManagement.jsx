import React from "react";
import {TranslatingComponent} from 'susam-components/abstract';
import * as axios from 'axios';
import {LookupService} from "../services/LookupService";
import {AgreementLogistic} from "./type/AgreementLogistic";
import {Card, Grid, GridCell, Loader, Modal, PageHeader} from "susam-components/layout";
import {Notify, Button, TextInput} from 'susam-components/basic';
import {LoadingIndicator, FabToolbar,} from "../utils";
import _ from "lodash";
import {AgreementService} from "../services/AgreementService";
import PropTypes from "prop-types";
import { NoteList, DocumentList } from "../common/index";
import {HistoryTable} from "./HistoryTable";
import {HistoryService} from "../services/HistoryService";
import {TerminationModal} from "./TerminationModal";


const STATUS_OPEN = {id: "OPEN", code: "OPEN", name: "Open"};
const STATUS_APPROVED = {id: "APPROVED", code: "APPROVED", name: "Approved"};
const STATUS_TERMINATED = {id: "TERMINATED", code: "TERMINATED", name: "Terminated"};
const STATUS_CANCELED = {id: "CANCELED", code: "CANCELED", name: "Canceled"};
const RESPONSIBLE_TYPE = {id: "RESPONSIBLE", code: "RESPONSIBLE", name: "Responsible"};


export class AgreementManagement extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            agreement: {
                status: STATUS_OPEN
            }
        };
    }

    componentDidMount() {
        this.initialize(this.props.route.options.mode);
    }

    componentDidUpdate(prevProps) {
        if (!_.isEqual(this.props.params.agreementId, prevProps.params.agreementId)) {
            this.initialize(this.props.params.agreementId?'view':'new');
        }
    }

    initialize(mode) {
        if (mode === 'new') {
            let agreement  = _.cloneDeep(this.state.agreement);
            LookupService.getAgreementCategoryByCode(this.props.params.type).then(response => {
                agreement.discriminator = response.data.code;
                agreement.ownerInfos = [{name: {id:this.context.user.id, name: this.context.user.displayName}, responsibilityType: RESPONSIBLE_TYPE}];
                this.setState({agreement: agreement});
            });
        }
        else {
            this.retrieveAgreement(this.props.params.agreementId);
        }
    }

    retrieveAgreement(agreementId) {
        let agreement;
        this.setState({busy: true});
        AgreementService.getAgreementById(agreementId).then(response => {
            agreement = response.data;
            this.setState({agreement: agreement, busy: false, readOnly: true});
        }).catch(error => {
            this.setState({busy: false});
            Notify.showError(error);
        });
    }

    updateState(key, value, callback){
        let setStateCallback = () => {
            if (callback) {
                callback();
            }
        };
        let state = _.cloneDeep(this.state);
        _.set(state, key, value);
        this.setState(state, setStateCallback);
    }

    handleAgreementSave(validationRequired) {
        let willSave = true;
        if(validationRequired){
            willSave = this.agreementForm.validate();
        }
        if (willSave) {
            this.setState({busy: true});
            let agreement = _.cloneDeep(this.state.agreement);
            let isNewAgreement = _.isNil(agreement.id);
            AgreementService.save(agreement).then(response => {
                if (isNewAgreement) {
                    this.setState({busy: false}, () => {
                        Notify.showSuccess("Contract saved successfully");
                        this.context.router.push(`/view/${response.data.id}`);
                    });
                }
                else {
                    this.handleHistorySave(agreement);
                    let updatedAgreement = response.data;
                    this.setState({agreement: updatedAgreement, readOnly: true, busy: false}, () => Notify.showSuccess("Contract updated successfully"));
                }
            }).catch(error => {
                this.setState({busy: false});
                Notify.showError(error);
            });
        }
    }

    handleHistorySave(agreement){
        if(agreement.priceAdaptationModels){
            agreement.priceAdaptationModels.forEach(model=>{
                if(model.historyModel){
                    AgreementService.addHistoryModel(model.historyModel).then(r=>{
                    })
                }
            })
        }
        if(agreement.unitPrices){
            agreement.unitPrices.forEach(unitPrice=>{
                if(unitPrice.historyUnitPrice){
                    AgreementService.addHistoryUnitPrice(unitPrice.historyUnitPrice).then(r=>{
                    })
                }
            })
        }
    }

    handleAgreementCancel() {
        this.retrieveAgreement(this.state.agreement.id);
    }

    updateNotes(value) {
        this.setState({busy: true});
        let agreement = _.cloneDeep(this.state.agreement);
        AgreementService.updateNotes(agreement.id, value).then(response => {
            agreement.notes = response.data;
            this.setState({agreement: agreement, busy: false},
                () => Notify.showSuccess("Notes saved successfully"));
        }).catch(error => {
            this.setState({busy: false});
            Notify.showError(error);
        });
    }

    updateDocuments(value) {
        this.setState({busy: true});
        let agreement = _.cloneDeep(this.state.agreement);
        AgreementService.updateDocuments(agreement.id, value).then(response => {
            agreement.documents = response.data;
            this.setState({agreement: agreement, busy: false},
                () => Notify.showSuccess("Documents saved successfully"));
        }).catch(error => {
            this.setState({busy: false});
            Notify.showError(error);
        });
    }

    handleStatusChange(status) {
        if(this.agreementForm.validate()){
            if(_.isEqual(status, STATUS_APPROVED) && _.isEmpty(this.state.agreement.unitPrices)){
                Notify.showError("The agreement can not be approved without any unit price!");
                return false;
            }
            if(_.isEqual(this.state.agreement.status, STATUS_TERMINATED) && _.isEqual(status, STATUS_OPEN)) {
                this.unsetTerminationDateAndReason();
            }
            this.updateState("agreement.status", status, ()=> this.handleAgreementSave(false));
        }
    }

    retrieveChangeHistory(){
        this.setState({busy: true});
        let params = {id: this.state.agreement.id, type: 'agreement'};
        HistoryService.retrieveChanges(params)
            .then(response => {
                this.setState({changes:response.data, busy: false}, () => this.historyModal.open())
            }).catch(error => {
            this.setState({busy: false});
            console.log(error);
            Notify.showError(error);
        });
    }

    renderHistoryModal(){
        let actions =[];
        actions.push({label: "CLOSE", buttonStyle:"danger",flat:false, action: () => this.historyModal.close()});
        return(
            <Modal ref={(c) => this.historyModal = c}
                   title = "Change History"
                   closeOnBackgroundClicked={false}
                   large={true}
                   actions={actions}>
                <HistoryTable changes = {this.state.changes}/>
            </Modal>
        );
    }

    checkIfEditable(){
        let editable = false;
        let agreement = _.cloneDeep(this.state.agreement);
        if(agreement.ownerInfos){
            agreement.ownerInfos.map(ownerInfo=>{
                if(ownerInfo.name.id == this.context.user.id && ownerInfo.responsibilityType.code == "RESPONSIBLE"){
                    editable = true;
                }
            });
        }

        return editable;
    }

    getActionMenu() {
        let actions = [];
        if(this.checkIfEditable()){
            if("OPEN" === this.state.agreement.status.code){
                actions.push({name:"Edit Contract", icon: "edit", onAction: () => this.updateState("readOnly", false)});
                actions.push({name:"Terminate", icon: "pan_tool", onAction: () => this.terminateModal.open()});
                actions.push({name:"Approve", icon: "check_circle", onAction: () => Notify.confirm("Are you sure?", ()=> this.handleStatusChange(STATUS_APPROVED))});
                actions.push({name:"Cancel", icon: "cancel", onAction: () => Notify.confirm("Are you sure?", ()=> this.handleStatusChange(STATUS_CANCELED))});
            }else if("APPROVED" === this.state.agreement.status.code){
                actions.push({name:"Reopen", icon: "restore", onAction: () => Notify.confirm("Are you sure?", ()=> this.handleStatusChange(STATUS_OPEN))});
                actions.push({name:"Cancel", icon: "cancel", onAction: () => Notify.confirm("Are you sure?", ()=> this.handleStatusChange(STATUS_CANCELED))});
            }else if("TERMINATED" === this.state.agreement.status.code){
                actions.push({name:"Reopen", icon: "restore", onAction: () => Notify.confirm("Are you sure?", ()=> this.handleStatusChange(STATUS_OPEN))});
                actions.push({name:"Cancel", icon: "cancel", onAction: () => Notify.confirm("Are you sure?", ()=> this.handleStatusChange(STATUS_CANCELED))});
            }else if("CANCELED" === this.state.agreement.status.code){
            }
        }
        actions.push({name:"History", icon: "bookmark", onAction: () => this.retrieveChangeHistory()});

        return actions;
    }

    saveTermination(){
        if(this.terminationModalForm.validate()){
            this.handleStatusChange(STATUS_TERMINATED);
            this.terminateModal.close();
        }
    }

    unsetTerminationDateAndReason(){
        let agreement = _.cloneDeep(this.state.agreement);
        _.set(agreement, "legalInfo.terminationDate", null);
        _.set(agreement, "legalInfo.terminationReason", null);
        this.setState({agreement: agreement});
    }

    closeTerminationModal(){
        this.unsetTerminationDateAndReason();
        this.terminateModal.close();
    }

    renderTerminateModal(){
        let actions =[];
        actions.push({label: "SAVE", buttonStyle:"success", flat:false, action: () => this.saveTermination()});
        actions.push({label: "CLOSE", buttonStyle:"danger",flat:false, action: () => this.closeTerminationModal()});
        return(
            <Modal ref={(c) => this.terminateModal = c}
                   title="Terminate Agreement"
                   closeOnBackgroundClicked={false}
                   large={true}
                   actions={actions}>
                <TerminationModal ref={c => this.terminationModalForm = c}
                                  legalInfo={this.state.agreement.legalInfo || {}}
                                  onChange={(value) => this.updateState("agreement.legalInfo", value)}/>
            </Modal>
        );

    }

    renderActionMenu() {
        if(this.state.readOnly && this.state.agreement.id){
            return(
                <div className="user_heading" style = {{padding: "0 0 0 0"}}>
                    <FabToolbar actions = {this.getActionMenu()}/>
                </div>
            );
        }
    }

    renderCancelButton() {
        if(this.state.agreement.id && !this.state.readOnly){
            return(
                <div className="uk-align-right">
                    <Button label="Cancel" style="danger"
                            onclick = {() => this.handleAgreementCancel()}/>
                </div>
            );
        }
    }

    renderButtons() {
        if (!this.state.readOnly) {
            return(
                <Grid>
                    <GridCell>
                        {this.renderCancelButton()}
                        <div className="uk-align-right">
                            <Button label="Save" style = "success"
                                    onclick = {() => this.handleAgreementSave(true)}/>
                        </div>
                    </GridCell>
                </Grid>
            );
        }
    }

    renderAgreementLogistic() {
        return(
            <AgreementLogistic ref={c => this.agreementForm = c}
                               agreement={this.state.agreement}
                               onChange={(agreement, callback) => this.updateState("agreement", agreement, callback)}
                               readOnly={this.state.readOnly}/>
        );
    }

    renderNotesAndDocuments(){
        if (this.state.readOnly){
            return(
                <Card>
                    <Grid collapse={true}>
                        <GridCell width="1-2">
                            <NoteList notes={this.state.agreement.notes}
                                      readOnly={!this.state.readOnly}
                                      onChange={(value) => this.updateNotes(value)}/>
                        </GridCell>
                        <GridCell width="1-2">
                            <DocumentList documents = {this.state.agreement.documents}
                                          readOnly={!this.state.readOnly}
                                          onChange={(value) => this.updateDocuments(value)}/>
                        </GridCell>
                    </Grid>
                </Card>
            );
        }
    }

    getContent() {
        switch (this.state.agreement.discriminator) {
            case 'LOGISTIC':
                return this.renderAgreementLogistic();

            default:
                return null;
        }
    }

    render() {
        return(
            <div>
                <LoadingIndicator busy={this.state.busy}/>
                {this.renderAgreementForm()}
            </div>
        );
    }

    renderAgreementForm() {
        if (this.state.agreement.discriminator) {
            return(
                <div>
                    {this.renderActionMenu()}
                    {this.renderHistoryModal()}
                    {this.renderTerminateModal()}
                    {this.getContent()}
                    {this.renderNotesAndDocuments()}
                    {this.renderButtons()}
                </div>
            );
        }
    }
}

AgreementManagement.contextTypes = {
    router: React.PropTypes.object,
    translator: PropTypes.object,
    user: React.PropTypes.object
};