import React from "react";

import { ActivitySummaryInfo } from '../activity/ActivitySummaryInfo';
import { Card } from 'susam-components/layout';
import { ActionHeader } from "../utils";
import { Notify} from 'susam-components/basic';
import { CrmActivityService } from "../services";

export class AccountActivities extends React.Component{

    state = {
        accountToEdit:[],
        accountToMerge:[],
    };

    constructor(props) {
        super(props);
    }
    
    componentDidMount(){
        this.search(this.props.accountToEdit, 'accountToEdit');
        this.search(this.props.accountToMerge, 'accountToMerge');
    }

    search(account, whichAccount) {

        CrmActivityService.retrieveActiveActivities(account.id).then(response => {
            this.setState(prevState=>{
                prevState[whichAccount] = response.data;
                return prevState;
            });
        }).catch(error => {
            Notify.showError(error);
        });
    }
    
    next(){
        return new Promise((resolve, reject)=>{
            this.props.onActivityComplete({ activities: this.combineList() });
            resolve(true);
        });

    }

    combineList(){
        let result = [];
        this.state.accountToEdit.forEach(item => {
            item.mergeStatus = "OWN";
            result.push(item);
        });
        this.state.accountToMerge.forEach(item => {
            item.mergeStatus = "ADDED";
            result.push(item);
        });
        return result;
    }

    render(){
        return(
            <Card>
                <ActionHeader title="Activities" />
                <ActivitySummaryInfo  activities={this.combineList()} />
            </Card>
            
        );
    }
}
