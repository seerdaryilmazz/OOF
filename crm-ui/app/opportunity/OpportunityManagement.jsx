import _ from "lodash";
import * as axios from "axios";
import PropTypes from "prop-types";
import React from "react";
import { Helmet } from 'react-helmet';
import { TranslatingComponent } from 'susam-components/abstract';
import { FabToolbar } from 'susam-components/advanced';
import { Button, Notify } from 'susam-components/basic';
import { Card, Grid, GridCell, Modal, PageHeader } from "susam-components/layout";
import { DocumentList, NoteList } from "../common";
import { HistoryTable } from "../history/HistoryTable";
import { CrmOpportunityService } from "../services/CrmOpportunityService";
import { HistoryService } from "../services/HistoryService";
import {LoadingIndicator, ObjectUtils, PromiseUtils} from "../utils";
import { ActivityList, CloseReason, OpportunityCommonInfo, ProductList, QuoteList } from "./index";
import {CrmAccountService, CrmActivityService} from "../services";


const STATUS_PROSPECTING = ObjectUtils.enumHelper('PROSPECTING');
const STATUS_VALUE_PROPOSITION = ObjectUtils.enumHelper('VALUE_PROPOSITION');
const STATUS_CLOSE = {
    CLOSE: ObjectUtils.enumHelper('CLOSED'),
    REJECT: ObjectUtils.enumHelper('REJECTED'),
    WITHDRAWN: ObjectUtils.enumHelper('WITHDRAWN')
};
const STATUS_CANCELED = ObjectUtils.enumHelper('CANCELED');
const CURRENCY_EUR = ObjectUtils.enumHelper('EUR', 'EUR', 'EUR')

export class OpportunityManagement extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {
            opportunity: {
                status: STATUS_PROSPECTING
            }
        };
    }

    componentDidMount(){
        this.initialize(this.props.route.options.mode);
    }

    componentDidUpdate(prevProps) {
        if (!_.isEqual(this.props.params.opportunityId, prevProps.params.opportunityId)) {
            this.initialize(this.props.params.opportunityId?'view':'new');
        }
    }

    componentWillUnmount(){
        if(!_.isEmpty(this.props.location.state)){
            this.props.location.state=null;
        }
    }

    initialize(mode) {
        if (mode === 'new') {
            axios.all([
                this.props.location.query.activity ? CrmActivityService.getActivityById(this.props.location.query.activity) : PromiseUtils.getFakePromise(undefined),
                this.props.location.query.account ? CrmAccountService.getAccountById(this.props.location.query.account) : PromiseUtils.getFakePromise(undefined)
            ]).then(axios.spread((activity, account) => {
                let opportunity = _.cloneDeep(this.state.opportunity);
                opportunity.committedTurnoverPerYear = {amount: 0, currency: CURRENCY_EUR};
                opportunity.quotedTurnoverPerYear = {amount: 0, currency: CURRENCY_EUR};
                opportunity.createdBy = this.context.user.username;
                opportunity.opportunityOwner = this.context.user.username;
                if(activity.data){
                    opportunity.account = activity.data.account;
                } else if(account.data) {
                    opportunity.account = {id: account.data.id, name: account.data.name}
                }
                this.setState({opportunity: opportunity})
            })).catch(e => Notify.showError(e));

        } else {
            this.retrieveOpportunity(this.props.params.opportunityId)
        }
    }

    retrieveOpportunity(opportunityId) {
        let opportunity;
        this.setState({busy: true});
        CrmOpportunityService.getOpportunityById(opportunityId).then(response => {
            opportunity = response.data;
            this.setState({opportunity: opportunity, busy: false, readOnly: true});
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

    handleOpportunitySave(opportunity, validationRequired, callback){
        let willSave = true;
        if(validationRequired){
            willSave = this.validate();
        }
        if(willSave){
            this.setState({busy: true});
            let isNew = _.isNil(opportunity.id);
            CrmOpportunityService.saveOpportunity(opportunity, this.props.location.query).then(response => {
                if (isNew) {
                    this.setState({busy: false}, () => {
                        Notify.showSuccess("Opportunity saved successfully");
                        this.context.router.push(`/ui/crm/opportunity/view/${response.data.id}`);
                    });
                }
                else {
                    this.setState({opportunity: response.data, readOnly: true, busy: false}, () => {
                        if(callback){
                            callback()
                        }else{
                            Notify.showSuccess("Opportunity updated successfully")
                        }
                    });
                }
            }).catch(error => {
                this.setState({busy: false});
                Notify.showError(error);
            });
        }
    }

    validate(){
        return this.opportunityCommonInfo.validate()
    }
    
    reopenOpportunity() {
        this.setState({ busy: true });
        CrmOpportunityService.reopen(this.state.opportunity.id).then(response => {
            this.setState({
                busy: false,
                opportunity: response.data
            });
        }).catch(error => {
            Notify.showError(error);
            this.setState({ busy: false });
        })
    }

    handleStatusChange(status, callback) {
        let opportunity = _.cloneDeep(this.state.opportunity);
        if('VALUE_PROPOSITION' == status.code){
            if(_.isEmpty(opportunity.products)){
                Notify.showError("Please add at least one product line!");
                return false;
            }
        }
        if(!["CLOSED", "REJECTED", "WITHDRAWN"].includes(status.code)){
            opportunity.closeReason = null;
        }
        opportunity.status = status;

        this.handleOpportunitySave(opportunity, false, callback)
    }

    routeToQuoteForm(type){
        let opportunity = this.state.opportunity;
        this.context.router.push(`/ui/crm/quote/new/${type}/${opportunity.serviceArea.code}/${opportunity.account.id}?opportunity=${opportunity.id}`);
    }

    routeToActivityForm(){
        let opportunity = this.state.opportunity;
        this.context.router.push(`/ui/crm/activity/new/${opportunity.account.id}?opportunity=${opportunity.id}`)
    }

    openCloseModal(){
        this.setState(prevState=>{
            prevState.opportunity.closeReason = {};
            return prevState
        }, ()=>this.closeReasonModal.open());
    }

    getActionMenu() {
        let quoteActions=[];
        if(!['WHM', 'CCL'].includes(this.state.opportunity.serviceArea.code)){
            quoteActions.push({name:"To Spot Quote", label:"S", onAction: () => this.routeToQuoteForm('SPOT')});
            quoteActions.push({name:"To Long Term", label:"L", onAction: () => this.routeToQuoteForm('LONG_TERM')});
            if(this.state.opportunity.serviceArea.code == 'ROAD'){
                quoteActions.push({name:"To Tender Quote", label:"T", onAction: () => this.routeToQuoteForm('TENDER')})
            }
        }else {
            quoteActions.push({name:"To Long Term", label:"L", onAction: () => this.routeToQuoteForm('LONG_TERM')});
        }

        let actions = [];
        if("PROSPECTING" == this.state.opportunity.status.code){
            actions.push({name:"Edit Opportunity", icon: "edit", onAction: () => this.updateState("readOnly", false)});
            actions.push({name:"Copy Opportunity", icon: "content_copy", onAction: () => this.cloneOpportunity()});
            actions.push({name:"Value Proposition", icon: "signal_cellular_alt", onAction: () => Notify.confirm("Are you sure?", ()=> this.handleStatusChange(STATUS_VALUE_PROPOSITION))});
            actions.push({name:"Mark as Close", icon: "star_half", onAction: () => this.openCloseModal()});
            actions.push({name:"Cancel", icon: "cancel", onAction: () => Notify.confirm("Are you sure?", ()=> this.handleStatusChange(STATUS_CANCELED))});
            actions.push({name:"To Activity", label:"A", onAction: () => this.routeToActivityForm()});
            quoteActions.forEach(action=> actions.push(action))
        }else if("VALUE_PROPOSITION" == this.state.opportunity.status.code){
            actions.push({name:"Edit Opportunity", icon: "edit", onAction: () => this.updateState("readOnly", false)});
            actions.push({name:"Copy Opportunity", icon: "content_copy", onAction: () => this.cloneOpportunity()});
            actions.push({name:"Mark as Close", icon: "star_half", onAction: () => this.openCloseModal()});
            actions.push({name:"Cancel", icon: "cancel", onAction: () => Notify.confirm("Are you sure?", ()=> this.handleStatusChange(STATUS_CANCELED))});
            actions.push({name:"To Activity", label:"A", onAction: () => this.routeToActivityForm()});
            quoteActions.forEach(action=> actions.push(action))
        }else if("QUOTED" == this.state.opportunity.status.code){
            actions.push({name:"Edit Opportunity", icon: "edit", onAction: () => this.updateState("readOnly", false)});
            actions.push({name:"Copy Opportunity", icon: "content_copy", onAction: () => this.cloneOpportunity()});
            actions.push({name:"Mark as Close", icon: "star_half", onAction: () => this.openCloseModal()});
            actions.push({name:"Cancel", icon: "cancel", onAction: () => Notify.confirm("Are you sure?", ()=> this.handleStatusChange(STATUS_CANCELED))});
            actions.push({name:"To Activity", label:"A", onAction: () => this.routeToActivityForm()});
            quoteActions.forEach(action=> actions.push(action))
        }else if("CANCELED" == this.state.opportunity.status.code){
            actions.push({name:"Copy Opportunity", icon: "content_copy", onAction: () => this.cloneOpportunity()});
        }else if(["CLOSED", "REJECTED", "WITHDRAWN"].includes(this.state.opportunity.status.code)){
            actions.push({name:"Reopen Opportunity", icon: "restore", onAction: () => Notify.confirm("Are you sure?", () => this.reopenOpportunity())});
            actions.push({name:"Copy Opportunity", icon: "content_copy", onAction: () => this.cloneOpportunity()});
        }
        actions.push({name:"History", icon: "bookmark", onAction: () => this.retrieveChangeHistory()});

        return actions;
    }

    renderActionMenu() {
        if(this.state.readOnly && this.state.opportunity.id){
            return(
                <div className="user_heading" style = {{padding: "0 0 0 0", marginTop:"5px"}}>
                    <FabToolbar actions = {this.getActionMenu()}/>
                </div>
            );
        }
    }

    renderCloseReason(){
        let readOnly = ["CLOSED", "REJECTED", "WITHDRAWN"].includes(this.state.opportunity.status.code);
        let actions = [];
        if(!readOnly){
            actions.push({label: "SAVE", buttonStyle:"success", flat:false, action: () => this.handleCloseReasonFormSaveClick()});
        }
        actions.push({label: "CLOSE", buttonStyle:"danger", flat:false, action: () => this.handleCloseFormCloseClick(readOnly)});

        let content = null;
        if (this.state.opportunity.closeReason) {
            content = (
                <CloseReason ref = {c => this.closeReasonForm = c}
                             closeReason = {this.state.opportunity.closeReason}
                             readOnly={readOnly}
                             onChange={(closeReason) => this.updateState("opportunity.closeReason", closeReason)}/>
            );
        }
        return(
            <Modal ref={(c) => this.closeReasonModal = c} title = "Opportunity Close Info"
                   closeOnBackgroundClicked={false}
                   center={false}
                   large={true} actions={actions}>
                {content}
            </Modal>
        );
    }

    handleCloseFormCloseClick(readOnly) {
        !readOnly ?
            this.updateState("opportunity.closeReason", undefined, () => this.closeReasonModal.close())
            :
            this.closeReasonModal.close();
    }

    handleCloseReasonFormSaveClick() {
        if (this.closeReasonForm.validate()) {
            this.handleStatusChange(STATUS_CLOSE[this.state.opportunity.closeReason.type.code], ()=>this.closeReasonModal.close());
        }
    }

    cloneOpportunity(){
        let opportunity = _.cloneDeep(this.state.opportunity);
        opportunity.status = STATUS_PROSPECTING;
        ObjectUtils.setNull(opportunity, ['id', 'number', 'name', 'documents', 'notes', 'createdAt', 'lastUpdated', 'lastUpdatedBy', 'closeReason']);
        if(!_.isEmpty(opportunity.products)){
            ObjectUtils.setNull(opportunity.products, ['id']);
        }
        this.setState({opportunity:opportunity, readOnly:undefined}, ()=> this.context.router.push(`/ui/crm/opportunity/new`));
    }

    retrieveChangeHistory(){
        this.setState({busy: true});
        let params = {id: this.state.opportunity.id, type: 'opportunity'};
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

    updateNotes(value) {
        this.setState({busy: true});
        let opportunity = _.cloneDeep(this.state.opportunity);
        CrmOpportunityService.updateNotes(opportunity.id, value).then(response => {
            opportunity.notes = response.data;
            this.setState({opportunity: opportunity, busy: false},
                () => Notify.showSuccess("Notes saved successfully"));
        }).catch(error => {
            this.setState({busy: false});
            Notify.showError(error);
        });
    }

    updateDocuments(value) {
        this.setState({busy: true});
        let opportunity = _.cloneDeep(this.state.opportunity);
        CrmOpportunityService.updateDocuments(opportunity.id, value).then(response => {
            opportunity.documents = response.data;
            this.setState({opportunity: opportunity, busy: false},
                () => Notify.showSuccess("Documents saved successfully"));
        }).catch(error => {
            this.setState({busy: false});
            Notify.showError(error);
        });
    }

    renderNotesAndDocuments(){
        if (this.state.readOnly){
            return(
                <Card>
                    <Grid collapse={true}>
                        <GridCell width="1-2">
                            <NoteList notes={this.state.opportunity.notes}
                                      readOnly={!this.state.readOnly}
                                      onChange={(value) => this.updateNotes(value)}/>
                        </GridCell>
                        <GridCell width="1-2">
                            <DocumentList documents = {this.state.opportunity.documents}
                                          readOnly={!this.state.readOnly}
                                          onChange={(value) => this.updateDocuments(value)}/>
                        </GridCell>
                    </Grid>
                </Card>
            );
        }
    }

    handleOpportunityCancel(){
        this.retrieveOpportunity(this.state.opportunity.id)
    }

    renderCancelButton() {
        if(this.state.opportunity.id && !this.state.readOnly){
            return(
                <div className="uk-align-right">
                    <Button label="Cancel" style="danger"
                            onclick = {() => this.handleOpportunityCancel()}/>
                </div>
            );
        }
    }

    renderCancelNewOpportunity(){
        if(!this.state.opportunity.id){
            return (
                <div className="uk-align-right">
                    <Button label="Cancel" style = "danger" onclick = {() =>  history.back()} />
                </div>
            )
        }
    }

    renderButtons() {
        if (!this.state.readOnly) {
            return(
                <Grid style={{padding:"0 0 0 0",right:"10px",position:"fixed",zIndex:12,marginTop: "-30px", marginRight:"50px"}}>
                    <GridCell>
                        {this.renderCancelButton()}
                        {this.renderCancelNewOpportunity()}
                        <div className="uk-align-right">
                            <Button label="Save" style = "success"
                                    onclick = {() => this.handleOpportunitySave(this.state.opportunity, true)}/>
                        </div>
                    </GridCell>
                </Grid>
            );
        }
    }

    renderPageHeader() {
        let opportunityNumber = !_.isNil(this.state.opportunity.number) ? " - " + this.state.opportunity.number : "";
        return(
            <Grid noMargin={true}>
                <PageHeader title={super.translate("Opportunity ") + opportunityNumber}/>
            </Grid>
        );
    }

    getContent(){
        return (
            <div>
                {this.renderPageHeader()}
                <OpportunityCommonInfo ref={c => this.opportunityCommonInfo = c}
                                       opportunity={this.state.opportunity}
                                       onChange={(opportunity, callback) => this.updateState("opportunity", opportunity, callback)}
                                       openCloseModal={()=> this.closeReasonModal.open()}
                                       readOnly={this.state.readOnly}/>
                <ProductList ref={c => this.productList = c}
                             opportunity={this.state.opportunity}
                             onChange={(opportunity, callback) => this.updateState("opportunity", opportunity, callback)}
                             readOnly={this.state.readOnly}/>
                <QuoteList opportunityId={this.state.opportunity.id} readOnly={this.state.readOnly} />
                <ActivityList opportunityId={this.state.opportunity.id} readOnly={this.state.readOnly} />
            </div>
        )
    }

    renderOpportunityForm(){
        return(
            <div>
                {this.renderActionMenu()}
                {this.renderButtons()}
                {this.renderCloseReason()}
                {this.renderHistoryModal()}
                {this.getContent()}
                {this.renderNotesAndDocuments()}
            </div>
        );
    }

    render() {
        let opportunity = this.state.opportunity;
        let title = opportunity.id ? `${super.translate("Opportunity") + " - " + opportunity.name}` : `${super.translate("New Opportunity")}`;
        return (
            <div>
                <Helmet>
                    <title>{title}</title>
                </Helmet>
                <LoadingIndicator busy={this.state.busy}/>
                {this.renderOpportunityForm()}
            </div>)
    }
}

OpportunityManagement.contextTypes = {
    router: React.PropTypes.object,
    translator: PropTypes.object,
    user: React.PropTypes.object
};