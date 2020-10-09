import React from 'react';
import { Notify } from 'susam-components/basic';
import { Card } from 'susam-components/layout';
import { QuoteSummaryInfo } from '../quote/QuoteSummaryInfo';
import { CrmSearchService } from '../services';
import { ActionHeader } from '../utils';


export class AccountQuotes extends React.Component{

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

    search(account, whichAccount){
        let request = {
            matchFilters: [
                {
                    name: "Account",
                    val: account.id
                },
                {
                    name: "Status",
                    val:"CANCELED",
                    not: true
                }
            ]
        };
        CrmSearchService.searchDocumentAslist(request, 'quote,agreement').then(response => {
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
            let result = this.combineList().filter(t=>t.mergeStatus==='ADDED');
            this.props.onQuoteComplete({quotes: result.filter(t=>"quote"===t.documentType), agreements: result.filter(t=>"agreement"===t.documentType)});
            resolve(true);
        });

    }

    combineList(){
        let result = []
       
        this.state.accountToEdit.forEach(item=>{
            item.mergeStatus = 'OWN';  
            result.push(item);

        });
        this.state.accountToMerge.forEach(item=>{
            item.mergeStatus = 'ADDED';
            result.push(item);
           
        });
        return result;
    }

    render() {
        return (
            <Card>
                <ActionHeader title="Quotes & Agreements" />
                <QuoteSummaryInfo searchResult={this.combineList()} />
            </Card>
        );
    }


}

