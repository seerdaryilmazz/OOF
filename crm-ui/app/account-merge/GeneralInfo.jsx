import React from 'react';
import { AccountUpdateList } from './AccountUpdateList';
import { Account } from '../account/Account';
import {AccountDetail} from '../account/AccountDetail';
import { CrmAccountService, CompanyService } from "../services";
import {Card, Grid, GridCell} from 'susam-components/layout';
import { Notify} from 'susam-components/basic';
import { AccountSummaryInfo } from '../account/AccountSummaryInfo';
import { ActionHeader } from '../utils';


export class GeneralInfo extends React.Component{

    constructor(props) {
        super(props);
        this.state={
 
        };
    }

    handleOnChange(key, value){
        this.props.onchange && this.props.onchange(key, value)
    }


    handleUpdateFromUpdateList(items){
        items.forEach(item => {
            this.props.onchange && this.props.onchange(item.fieldToCopy, item.valueToCopy);
        });
    }

    handleUndoUpdateFromUpdateList(items){
        items.forEach(item => {
            this.props.onchange && this.props.onchange(item.fieldToCopy, item.valueToUndo);
        });
    }

    next(){
        return new Promise(
            (resolve, reject) => {
                if(this.updateList.hasPendingItems()){
                    Notify.showError("Please complete all items in update list");
                    reject();
                    return;
                }
                this.setState({busy: true});
                CrmAccountService.validateAccount(this.props.accountToEdit).then(response => {
                    this.props.onAccountComplete && this.props.onAccountComplete(this.props.accountToEdit);
                    resolve(true);
                }).catch(error => {
                    Notify.showError(error);
                    this.setState({busy: false});
                    reject();
                });
            }
        );
    }

    updateState(key, value, callback) {
        let setStateCallback = () => {
            if (callback) {
                callback();
            }
        };
        let state = _.cloneDeep(this.state);
        _.set(state, key, value);
        this.setState(state, setStateCallback);
    }

    handleAccountChange(account){
            this.updateState("account", account);
        
    }

    render(){
        let {accountToEdit} = this.props;
        if(!accountToEdit || !accountToEdit.company){
            return null;
        }
        let updateList = <AccountUpdateList ref = {(c) => this.updateList = c}
            onupdate={(items) => this.handleUpdateFromUpdateList(items)}
            onundo={(items) => this.handleUndoUpdateFromUpdateList(items)}
            current={this.props.accountToEdit}
            updated={this.props.accountToMerge}
            original={this.props.accountOriginal}  /> 

        return (
             <Card>
                {updateList}
                <ActionHeader title="General Information" />
                <AccountSummaryInfo 
                    account={this.props.accountToEdit}
                    company={this.props.accountToEdit.company} 
                    onchange = {(key, value) => this.handleOnChange(key, value)}
                    onAccountChange={(account) => this.handleAccountChange(account)} />   
            </Card>    
            
        );
    }
}
