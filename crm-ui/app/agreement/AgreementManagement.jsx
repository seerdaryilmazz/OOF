import _ from "lodash";
import PropTypes from "prop-types";
import React from "react";
import { Helmet } from 'react-helmet';
import { TranslatingComponent } from 'susam-components/abstract';
import { FabToolbar } from 'susam-components/advanced';
import { Button, Notify } from 'susam-components/basic';
import { Card, Grid, GridCell, Modal} from "susam-components/layout";
import uuid from "uuid";
import { DocumentList, NoteList } from "../common/index";
import { HistoryTable } from "../history/HistoryTable";
import { AgreementService } from "../services/AgreementService";
import { HistoryService } from "../services/HistoryService";
import { LookupService } from "../services/LookupService";
import { LoadingIndicator, ObjectUtils } from "../utils";
import { ExtendModal } from "./ExtendModal";
import { TerminationModal } from "./TerminationModal";
import { AgreementLogistic } from "./type/AgreementLogistic";

const STATUS_OPEN = ObjectUtils.enumHelper('OPEN');
const STATUS_APPROVED = ObjectUtils.enumHelper('APPROVED');
const STATUS_TERMINATED = ObjectUtils.enumHelper('TERMINATED');
const STATUS_CANCELED = ObjectUtils.enumHelper('CANCELED');
const RESPONSIBLE_TYPE = ObjectUtils.enumHelper('RESPONSIBLE');


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
                if(!_.isEmpty(this.props.location.state)){
                    agreement.account=_.get(this.props.location.state, 'account');
                    agreement.fromAccount = true;
                }
                agreement.createdBy = this.context.user.username;
                this.setState({agreement: agreement});
            });
        }
        else {
            this.retrieveAgreement(this.props.params.agreementId, true);
        }
    }

    retrieveAgreement(agreementId, getHistory) {
        let agreement;
        this.setState({busy: true});
        AgreementService.getAgreementByIdAsAuthorized(agreementId).then(response => {
            agreement = response.data;
            this.setState({agreement: agreement, busy: false, readOnly: true}, getHistory ? () => this.retrieveAgreementHistory(): "");
        }).catch(error => {
            this.setState({busy: false});
            Notify.showError(error);
        });
    }

    retrieveAgreementHistory(){
        let params = {id: this.state.agreement.id, type: 'agreement'};
        return new Promise((resolve,reject) => {
            HistoryService.retrieveChanges(params).then(r=>{
                this.setState({changes:r.data}, ()=> resolve(r.data));
            }).catch(e=>{
                console.log(e);
                Notify.showError(e);
                reject(e);
            })
        })
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
            if(!isNewAgreement){
                this.handleUnitPriceHistoryDelete(agreement)
            }
            AgreementService.save(agreement).then(response => {
                if (isNewAgreement) {
                    this.setState({busy: false}, () => {
                        Notify.showSuccess("Agreement saved successfully");
                        this.context.router.push(`/ui/crm/agreement/view/${response.data.id}`);
                    });
                }
                else {
                    this.handleHistorySave(agreement);
                    let updatedAgreement = response.data;
                    if("APPROVED" === updatedAgreement.status.code){
                        this.retrieveAgreementHistory();
                    }
                    this.setState({agreement: updatedAgreement, readOnly: true, busy: false}, () => Notify.showSuccess("Agreement updated successfully"));
                }
            }).catch(error => {
                this.setState({busy: false});
                Notify.showError(error);
            });
        }
    }

    handleUnitPriceHistoryDelete(agreement) {
        if (!_.isEmpty(agreement.unitPriceHistoryToBeDeleted)) {
            agreement.unitPriceHistoryToBeDeleted.forEach(id => {
                AgreementService.deleteHistoryUnitPriceById(id).then(r => {
                }).catch(error => {
                    console.log(error);
                    Notify.showError(error);
                });
            })
        }

        if (!_.isEmpty(agreement.unitPricesToBeDeleted)) {
            agreement.unitPricesToBeDeleted.forEach(id => {
                AgreementService.deleteHistoryUnitPriceByUnitPriceId(id).then(r => {
                }).catch(error => {
                    console.log(error);
                    Notify.showError(error);
                });
            })
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
        this.retrieveAgreement(this.state.agreement.id, false);
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

    openHistory(){
        this.setState({busy: true});
        this.retrieveAgreementHistory().then(r=>{
            this.setState({busy: false}, () => this.historyModal.open())
        })
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

    getAuthorizedUsers(){
        let agreement = _.cloneDeep(this.state.agreement);
        let users = [];
        if(agreement.ownerInfos){
            agreement.ownerInfos.map(ownerInfo=>{
                if(ownerInfo.responsibilityType.code === "RESPONSIBLE"){
                    users.push(ownerInfo.name.id)
                }
            });
        }
        return users;
    }

    getActionMenu() {
        let authorizedUsers = this.getAuthorizedUsers();
        let actions = [];
        if("OPEN" === this.state.agreement.status.code){
            actions.push({name:"Edit Contract", icon: "edit", users: authorizedUsers, usersKey:"id", operationName:["agreement.view"], onAction: () => this.updateState("readOnly", false)});
                actions.push({name:"Extend", icon: "alarm_add", users: authorizedUsers, usersKey:"id", operationName:["agreement.view"], onAction: () => this.extendModal.open()});
                actions.push({name:"Terminate", icon: "pan_tool", users: authorizedUsers, usersKey:"id", operationName:["agreement.view"], onAction: () => this.terminateModal.open()});
                actions.push({name:"Approve", icon: "check_circle", users: authorizedUsers, usersKey:"id", operationName:["agreement.view"], onAction: () => Notify.confirm("Are you sure?", ()=> this.handleStatusChange(STATUS_APPROVED))});
                actions.push({name:"Cancel", icon: "cancel", users: authorizedUsers, usersKey:"id", operationName:["agreement.view"], onAction: () => Notify.confirm("Are you sure?", ()=> this.handleStatusChange(STATUS_CANCELED))});
        }else if("APPROVED" === this.state.agreement.status.code){
            actions.push({name:"Extend", icon: "alarm_add", users: authorizedUsers, usersKey:"id", operationName:["agreement.view"], onAction: () => this.extendModal.open()});
            actions.push({name:"Reopen", icon: "restore", users: authorizedUsers, usersKey:"id", operationName:["agreement.view"], onAction: () => Notify.confirm("Are you sure?", ()=> this.handleStatusChange(STATUS_OPEN))});
            actions.push({name:"Cancel", icon: "cancel", users: authorizedUsers, usersKey:"id", operationName:["agreement.view"], onAction: () => Notify.confirm("Are you sure?", ()=> this.handleStatusChange(STATUS_CANCELED))});
        }else if("TERMINATED" === this.state.agreement.status.code){
            actions.push({name:"Extend", icon: "alarm_add", users: authorizedUsers, usersKey:"id", operationName:["agreement.view"], onAction: () => this.extendModal.open()});
            actions.push({name:"Reopen", icon: "restore", users: authorizedUsers, usersKey:"id", operationName:["agreement.view"], onAction: () => Notify.confirm("Are you sure?", ()=> this.handleStatusChange(STATUS_OPEN))});
            actions.push({name:"Cancel", icon: "cancel", users: authorizedUsers, usersKey:"id", operationName:["agreement.view"], onAction: () => Notify.confirm("Are you sure?", ()=> this.handleStatusChange(STATUS_CANCELED))});
        }else if("CANCELED" === this.state.agreement.status.code){
        }

        actions.push({name:"History", icon: "bookmark", onAction: () => this.openHistory()});

        return actions;
    }

    handleExtend(endDate){
        let agreement = this.state.agreement;
        let params={newEndDate: endDate};
        this.setState({busy: true});
        AgreementService.extendAgreement(agreement.id, params).then(response=> {
            this.setState({agreement: response.data, readOnly: true, busy: false, extendModalKey: uuid.v4()}, () => Notify.showSuccess("Agreement extended successfully"));
        }).catch(error => {
            this.setState({busy: false});
            console.log(error);
            Notify.showError(error);
        })
    }

    closeExtendModal(){
        this.setState({extendModalKey: uuid.v4()}, ()=> this.extendModal.close())
    }

    renderExtendModal(){
        let actions =[];
        actions.push({label: "CLOSE", buttonStyle:"danger",flat:false, action: () => this.closeExtendModal()});
        return(
            <Modal ref={(c) => this.extendModal = c}
                   title="Extension of Agreement"
                   closeOnBackgroundClicked={false}
                   large={true}
                   actions={actions}>
                <ExtendModal ref={c => this.extentModalForm = c}
                             key = {this.state.extendModalKey}
                             agreement = {this.state.agreement}
                             endDate = {this.state.agreement.endDate}
                             onSave = {(value) => this.handleExtend(value)}
                             onClose={() => this.closeExtendModal()} />
            </Modal>
        );
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
                <div className="user_heading" style = {{padding: "0 0 0 0",position:"fixed",zIndex:"3",marginTop:"-26px",right:"20px"}}>
                    <FabToolbar actions = {this.getActionMenu()}/>
                </div>
            );
        }
    }

    renderCancelNewAgreement(){
        if(!this.state.agreement.id){
            return (
                <div className="uk-align-right">
                    <Button label="Cancel" style = "danger" onclick = {() =>  history.back()} />
                </div>
            )
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
                <Grid style={{padding:"0 0 0 0",right:"10px",position:"fixed",zIndex:12,marginTop: "-54px", marginRight:"50px"}}>
                    <GridCell>
                        {this.renderCancelButton()}
                        {this.renderCancelNewAgreement()}
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
                               changes={this.state.changes}
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

    renderAgreementForm() {
        if (this.state.agreement.discriminator) {
            return(
                <div>
                    {this.renderActionMenu()}
                    {this.renderButtons()}
                    {this.renderHistoryModal()}
                    {this.renderExtendModal()}
                    {this.renderTerminateModal()}
                    {this.getContent()}
                    {this.renderNotesAndDocuments()}
                </div>
            );
        }
    }

    render() {
        let agreement = this.state.agreement;
        let title = agreement.id ? `${super.translate("Agreement") + " - " + agreement.name}` : `${super.translate("New Agreement")}`;
        return(
            <div>
                <Helmet>
                    <title>{title}</title>
                </Helmet>
                <LoadingIndicator busy={this.state.busy}/>
                {this.renderAgreementForm()}
            </div>
        );
    }
}

AgreementManagement.contextTypes = {
    router: React.PropTypes.object,
    translator: PropTypes.object,
    user: React.PropTypes.object
};