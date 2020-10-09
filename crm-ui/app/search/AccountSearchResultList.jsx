import React from "react";
import _ from "lodash";
import PropTypes from "prop-types";

import {Grid, GridCell, Loader,Pagination} from "susam-components/layout";
import {TranslatingComponent} from "susam-components/abstract";
import {Notify, Button} from "susam-components/basic";
import *  as DataTable from 'susam-components/datatable';
import {CrmAccountService, CrmSearchService} from "../services";

export class AccountSearchResultList extends TranslatingComponent{

    constructor(props){
        super(props);
        this.state = {
            page:1,
            size:6
        };
    }

    search(query,pageNumber){
        this.setState({busy: true});
        if(query){
            let params = {q: query, withoutGlobal:true, withoutId:this.props.account.id, page: pageNumber, size: this.state.size};
            CrmSearchService.searchAccounts(params).then(response => {
                this.setState({
                    result: response.data,
                    pageNumber: pageNumber,
                    pageCount: response.data.totalPages,
                    busy: false});
            }).catch(error => {
                Notify.showError(error);
                this.setState({result: null, busy: false});
            });
        }else{
            this.setState({result: null, busy: false});
        }
    }
    componentWillReceiveProps(nextProps){
        if(!_.isEqual(this.props.query, nextProps.query)){
            this.search(nextProps.query,this.state.page);
        }
    }

    handleSelectedItem(account) {
        if(this.props.account.id===account.id){
            Notify.showError("You can not choose the account you are currently working on");
            return false;
        }
        else{
            if (!_.isNil(account.details)&&!_.isNil(account.details.globalAccountId)) {
                CrmAccountService.getAccountById(account.details.globalAccountId).then(response => {
                    this.setState({busy: false});
                    Notify.showError(`This account is already a member of a global account: ${response.data.name}`);
                    return false;
                }).catch(error => {
                    Notify.showError(error);
                    this.setState({busy: false});
                });
            } else {
                this.setState({busy: false}, () => this.props.onItemSelected(account));
            }
        }
    }

        render(){
        if(this.state.busy){
            return <Loader title="Searching"/>
        }
        if(!this.state.result){
            return null;
        }

        if(this.state.result.content){
            return (
                <div>
                    <GridCell width="1-1">
                        <DataTable.Table data={this.state.result.content}>
                            <DataTable.Text field="name" header="Name" width="40"
                                            printer = {new AccountNamePrinter()}/>
                            <DataTable.Text field="accountOwner" header="Account Owner" width="20" />
                            <DataTable.Text field="country.name" header="Country" width="20" />
                            <DataTable.ActionColumn width="10">
                                <DataTable.ActionWrapper key="selectAccount" track="onclick"
                                                         onaction = {(data) => this.handleSelectedItem(data)}>
                                    <Button label="select" flat={true} style="success" size="small"/>
                                </DataTable.ActionWrapper>
                            </DataTable.ActionColumn>
                        </DataTable.Table>
                    </GridCell>
                    <GridCell width="1-1">
                        <Pagination totalElements={this.state.result.totalElements}
                                    page={this.state.pageNumber}
                                    totalPages={this.state.pageCount}
                                    onPageChange={(pageNumber) => this.search(this.props.query,pageNumber)}
                                    range={6}/>
                    </GridCell>
                </div>
            );
        }else{
            return (
                <div>{super.translate("No records match this find criteria")}</div>
            );
        }


    }
}
AccountSearchResultList.contextTypes = {
    translator: PropTypes.object
};

class AccountNamePrinter{

    print(data){
        return(
            <div style = {{whiteSpace: 'pre-wrap', width: "400px"}}>{data}</div>
        );
    }
}