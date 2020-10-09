import * as axios from "axios";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, Checkbox, Notify, ReadOnlyDropDown, TextArea, TextInput } from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';
import { Grid, GridCell, Loader, Modal, Pagination } from 'susam-components/layout';
import { AccountSearchResultList } from "../search/AccountSearchResultList";
import { CrmAccountService, LookupService } from "../services";
import { ObjectUtils, withReadOnly } from "../utils";
import { ActionHeader } from '../utils/ActionHeader';


export class AccountDetail extends TranslatingComponent{

    constructor(props){
        super(props);
        this.state = {
            accountDetail:{},
            page:1,
            size:5,
            accountsToBeAddedWhenPressedClose:[],
            accountsToBeDeletedWhenPressedClose:[]
        };
    }

    initializeState(props){
        if(props){
            let state = _.cloneDeep(this.state);
            state.accountDetail = _.cloneDeep(props.details) || {};
            // if(_.isEmpty(state.accountDetail.globalAccountOwner)){
            //     state.accountDetail.globalAccountOwner=this.context.user.username;
            // }
            state.accountDetailOriginal = _.cloneDeep(props.details) || {};
            state.readOnly = true;
            this.setState(state);
        }

    }

    componentDidMount(){
        this.initializeState(this.props.account);
        this.initializeLookups();
    }


    initializeLookups(){
        axios.all([
            LookupService.getTotalLogisticsPotentials()
        ]).then(axios.spread((totalLogisticsPotentials) => {
            this.setState({totalLogisticsPotentials: totalLogisticsPotentials.data});
        })).catch(error => {
            Notify.showError(error);
        });
        this.getRelatedAccounts(this.state.page);
    }

    getRelatedAccounts(pageNumber){
        let params={page: pageNumber-1, size: this.state.size};
        CrmAccountService.getAccountsByGlobalAccountId(this.props.account.id,params).then(response=>{
            this.setState({
                relatedAccounts:response.data,
                pageNumber: pageNumber,
                pageCount: response.data.totalPages,
                busy: false})
        }).catch(error => {
            Notify.showError(error);
        })

    }

    updateGlobalAccountId(account, toDelete, updateDataTable) {
        this.setState({busy: true});
        CrmAccountService.getAccountById(account.id).then(response => {
            if (toDelete) {
                _.set(response.data, "details.globalAccountId", null);
                this.state.accountsToBeAddedWhenPressedClose.push(response.data);

                CrmAccountService.saveAccount(response.data).then(response => {
                    this.setState({busy: false}, updateDataTable ? () => this.getRelatedAccounts(this.state.page) : null);
                }).catch(error => {
                    Notify.showError(error);
                    this.setState({busy: false});
                });

            } else {
                _.set(response.data, "details.globalAccountId", this.props.account.id);
                this.state.accountsToBeDeletedWhenPressedClose.push(response.data);

                CrmAccountService.saveAccount(response.data).then(response => {
                    this.setState({busy: false}, updateDataTable ? () => this.getRelatedAccounts(this.state.page) : null);
                    Notify.showSuccess(`${account.name} is added to the related accounts`);
                }).catch(error => {
                    Notify.showError(error);
                    this.setState({busy: false});
                });
            }
        }).catch(error => {
            Notify.showError(error);
            this.setState({busy: false});
        });
    }



    updateState(key, value){
        let state = _.cloneDeep(this.state);
        _.set(state, key, value);
        this.setState(state);
    }

    handleCheckBoxChange(e, key){
        this.updateState(key, e);
    }

    deleteAllGlobalAccountIds(){
        CrmAccountService.deleteMultipleGlobalAccountId(this.props.account.id).then(response => {
            this.getRelatedAccounts(this.state.page)
        }).catch(error=>Notify.showError(error));
    }

    revertRelatedAccounts(callback){
        this.setState({busy:true});
        let calls = [];
        if(this.state.accountsToBeAddedWhenPressedClose){
            this.state.accountsToBeAddedWhenPressedClose.forEach(account=>{
                _.set(account,"details.globalAccountId", this.props.account.id);
                calls.push(CrmAccountService.saveAccount(account));
            });
            axios.all(calls).then(axios.spread(()=>{
                callback(); //Tüm güncellemeler yapıldıktan sonra relatedAccounts çalışması mantığıyla bu yapı kullanıldı.
            })).catch(error=>Notify.showError(error));
        }
        if(this.state.accountsToBeDeletedWhenPressedClose){
            this.state.accountsToBeDeletedWhenPressedClose.forEach(account=>{
                _.set(account,"details.globalAccountId", null);
                calls.push(CrmAccountService.saveAccount(account));
            });
            axios.all(calls).then(axios.spread(()=>{
                callback();
            })).catch(error=>Notify.showError(error));
        }
        this.setState({
            busy:false,
            accountsToBeAddedWhenPressedClose:[],
            accountsToBeDeletedWhenPressedClose:[]
        });
    }

    handleClose(){
        let accountDetailOriginal=_.cloneDeep(this.state.accountDetailOriginal);
        this.setState({accountDetail: accountDetailOriginal});
        if(accountDetailOriginal.global!=true&&!_.isNil(this.state.relatedAccounts.content)){
            this.setState({busy:true});
            this.deleteAllGlobalAccountIds();
        }else if(accountDetailOriginal.global==true){
            this.revertRelatedAccounts(()=>this.getRelatedAccounts(this.state.page))

        }
        this.setState({readOnly:true}, ()=> this.props.onClose())
    }

    handleSave(){
        if(this.state.accountDetail.global!=true){
            this.setState({busy:true, accountDetail:{globalAccountOwner:null}});

            if(!_.isNil(this.state.relatedAccounts.content)){
                this.deleteAllGlobalAccountIds();
            }
        }
        else if(this.state.accountDetail.global==true){
            if(this.state.accountDetail.globalAccountId){
                Notify.showError("Account can not be global and have a global account at the same time");
                return false;
            }else if(_.isEmpty(this.state.relatedAccounts.content)){
                Notify.showError("There must be at least one related accounts");
                return false;
            }
        }
        this.setState({
            readOnly:true,
            busy:false,
            accountsToBeAddedWhenPressedClose:[],
            accountsToBeDeletedWhenPressedClose:[]}, ()=> this.props.onSave(this.state.accountDetail))
    }

    renderButtons(){
        let saveButton = !this.state.readOnly ?
            <div className="uk-align-right">
                <Button label="Save" style="success"
                        onclick = {() => this.handleSave()}/>
            </div> : null;
        return (
            <Grid>
                <GridCell>
                    <div className="uk-align-right">
                        <Button label="Close" style="danger"
                                onclick = {() => this.handleClose()}/>
                    </div>
                    {saveButton}
                </GridCell>
            </Grid>

            );
    }

    renderGlobalAccountOwner(){
        if(this.state.accountDetail.global){
            if(!this.state.accountDetail.globalAccountOwner){
                this.state.accountDetail.globalAccountOwner=this.context.user.username;
            }
            return(
                <ReadOnlyDropDown options={this.context.getUsers()} label="Global Account Owner"
                                  value = {this.state.accountDetail.globalAccountOwner} labelField = "displayName"
                                  readOnly={this.state.readOnly} valueField="username"
                                  required={true}
                                  onchange = {(value) => {value ? this.updateState("accountDetail.globalAccountOwner", value.username) : this.updateState("accountDetail.globalAccountOwner", null)}}/>
            );
        }else{
            this.state.accountDetail.globalAccountOwner=null;
        }
    }

    renderSearchAccounts() {
        return (
            <div>
                <TextInput placeholder="Search for account..." required={true}
                           value={this.state.query}
                           onchange={(value) => this.updateState("query", value)}/>
                <AccountSearchResultList query={this.state.query}
                                         account={this.props.account}
                                         onItemSelected={(account) => this.updateGlobalAccountId(account,false,false)}/>
            </div>
        )

    }

    renderModal(){
        let actions = [];
        actions.push({label: "OK", flat:false, buttonStyle:"success", action: () => this.setState({query:null}, () => {this.addAccountModal.close();this.getRelatedAccounts(this.state.page)})});
        return(
            <Modal ref={(c) => this.addAccountModal = c} title = "Search Account"
                   minHeight="400px"
                   closeOnBackgroundClicked={false}
                   closeOtherOpenModals={false}
                   large={true} actions={actions}>
                {this.renderSearchAccounts()}
            </Modal>
        );
    }

    renderTable(){
        if(this.state.busy){
            return <Loader title="Searching"/>
        }
        if(!this.state.relatedAccounts){
            return null;
        }
        if(this.state.accountDetail.global){
            return(
                <GridCell width="4-5" margin="bottom" divider={true}>
                    <GridCell width="1-1">
                        <ActionHeader title="Related Accounts" readOnly={this.state.readOnly}
                        tools={[{title: "Add", items: [{label: "", onclick: () => this.addAccountModal.open()}]}]} />
                    </GridCell>
                    <GridCell width="1-1">
                        <DataTable.Table data={this.state.relatedAccounts.content}>
                            <DataTable.Text header="Name" field="name"/>
                            <DataTable.Text header="Account Owner" field="accountOwner"/>
                            <DataTable.Text header="Country" field="country.name"/>
                            <DataTable.ActionColumn>
                                <DataTable.ActionWrapper key="deleteRelatedAccount" track="onclick"
                                                         shouldRender={() => !this.state.readOnly}
                                                         onaction={(account) => this.updateGlobalAccountId(account, true, true)}>
                                    <Button label="delete" flat={true} style="danger" size="small"/>
                                </DataTable.ActionWrapper>
                            </DataTable.ActionColumn>
                        </DataTable.Table>
                    </GridCell>
                    <GridCell width="1-1">
                        <Pagination totalElements={this.state.relatedAccounts.totalElements}
                                    page={this.state.pageNumber}
                                    totalPages={this.state.pageCount}
                                    onPageChange={(pageNumber) => this.getRelatedAccounts(pageNumber)}
                                    range={5}/>
                    </GridCell>
                </GridCell>
            )
        }
        return null;

    }

    renderContent(){
        return(
            <div>
                <ActionHeader title="CRM Info" readOnly={this.props.readOnly}
                              tools={[{title: "Edit", items: [{label: "", onclick: () => this.setState({readOnly:false})}]}]} />
                <Grid>
                    <GridCell width="1-3" noMargin={true}>
                        <Checkbox label="Fortune 500" value={this.state.accountDetail.fortune500} disabled={this.state.readOnly}
                                  onchange={(e) => {this.handleCheckBoxChange(e, "accountDetail.fortune500")}}/>
                    </GridCell>
                    <GridCell width="1-3" noMargin={true}>
                        <Checkbox label="Global" value={this.state.accountDetail.global} disabled={this.state.accountDetail.globalAccountId ? true : this.state.readOnly}
                                  onchange={(e) => {this.handleCheckBoxChange(e, "accountDetail.global")}}/>
                    </GridCell>
                    <GridCell width="1-3" noMargin={true}>
                        <Checkbox label="Galaxy" value={this.state.accountDetail.galaxy} disabled={this.state.readOnly}
                                  onchange={(e) => {this.handleCheckBoxChange(e, "accountDetail.galaxy")}}/>
                    </GridCell>
                </Grid>
                <Grid>
                    <GridCell width="1-3" noMargin={true}>
                        <ReadOnlyDropDown options={this.state.totalLogisticsPotentials} label="Total Logistics Potential"
                                          value = {ObjectUtils.enumHelper(this.state.accountDetail.totalLogisticsPotential)} readOnly={this.state.readOnly}
                                          onchange = {value => this.updateState("accountDetail.totalLogisticsPotential", _.get(value, 'id')) }/>
                    </GridCell>
                    <GridCell width="1-3" noMargin={true}>
                        {this.renderGlobalAccountOwner()}
                    </GridCell>
                </Grid>
                {this.renderTable()}
                <Grid>
                    <GridCell width="2-5" margin="top">
                        <ReadOnlyTextArea label="Strategic Information" value = {this.state.accountDetail.strategicInformation}
                                          rows={5} readOnly={this.state.readOnly} maxLength="300"
                                          onchange = {(value) => this.updateState("accountDetail.strategicInformation", value)}/>
                    </GridCell>
                </Grid>
            </div>
        )
    }

    render(){
        return(
            <div>
                {this.renderContent()}
                {this.renderModal()}
                {this.renderButtons()}
            </div>
        )
    }
}
AccountDetail.contextTypes = {
    getUsers: React.PropTypes.func,
    getAllUsers: React.PropTypes.func,
    user: React.PropTypes.object
};

const ReadOnlyTextArea = withReadOnly(TextArea);