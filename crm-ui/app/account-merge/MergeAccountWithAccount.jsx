import _ from "lodash";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Notify } from 'susam-components/basic';
import { Loader, PageHeader } from "susam-components/layout";
import { AccountMergeWizard } from "../account-merge/AccountMergeWizard";
import { CompanyService, CrmAccountService } from "../services";



export class MergeAccountWithAccount extends TranslatingComponent {
    state = {
        accountToMerge:{},
        accountToEdit:{},
        accountOriginal:{},
        mergeAccount: {}
    };

    constructor(props) {
        super(props);
        this.retrieveAccount(this.props.params.editAccountId, ["accountToEdit","accountOriginal"]);
        this.retrieveAccount(this.props.params.mergeAccountId, ["accountToMerge"]);
    }

    componentDidMount(){

    }

    updateMergeAccount(value){
        let mergeAccount = _.cloneDeep(this.state.mergeAccount);
        for(let key in value){
            mergeAccount[key] = value[key];
        }
        this.setState({mergeAccount: mergeAccount});
    }

    retrieveAccount(accountId, whichAccounts){
        let account = {}
        CrmAccountService.getAccountById(accountId).then(response=>{
            account = response.data;
            return CompanyService.getCompany(response.data.company.id);
        }).then(response=>{
            account.company = response.data;
            this.setState(prevState => {
                whichAccounts.forEach(whichAccount=>{
                    prevState[whichAccount] = account;
                });
                return prevState
            })
        })

    }

    updateState(key, value){
        let state = _.cloneDeep(this.state);
        state[key] = value;
        this.setState(state);
    }

    saveAccount(account, onSuccess){
        this.setState({busy: true});
        CrmAccountService.mergeAccountWithAccount(this.state.mergeAccount, this.state.accountToMerge).then(response => { //mergeAccount
            Notify.showSuccess("Account saved successfully");
            onSuccess(response);
        }).catch(error => {
            Notify.showError(error);
            this.setState({busy: false});
        });
    }

    render(){
        let title = "";
        if(this.state.accountToEdit){
            title = this.state.accountToEdit.name;
        }
        if(this.state.busy){
            return <Loader size="L" title="Saving Account"/>;
        }

        return (
            <div>
                <PageHeader title = {title}/>
                <AccountMergeWizard accountToEdit = {this.state.accountToEdit}
                               accountToMerge = {this.state.accountToMerge}
                               accountOriginal = {this.state.accountOriginal}
                               onGeneralInfoUpdate = {accountToEdit=>this.setState({accountToEdit})}
                               mode = "MergeAccountWithAccount"
                               onNext={value=>this.updateMergeAccount(value)}
                               onfinish = {(account, onSuccess) => this.saveAccount(account, onSuccess)}/>
            </div>
        );
    }

}
