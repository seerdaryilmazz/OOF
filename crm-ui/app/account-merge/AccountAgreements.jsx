import React from 'react';

import { CrmAccountService, CompanyService } from "../services";
import {Card, Grid, GridCell, Pagination} from 'susam-components/layout';
import { Button, Notify} from 'susam-components/basic';
import { AccountAgreementList } from '../agreement/AccountAgreementList';
import { AgreementService } from '../services/AgreementService';
import * as DataTable from 'susam-components/datatable';

export class AccountAgreements extends React.Component{

    constructor(props) {
        super(props);
        this.state={
            searchResult: { content: null }
        };
    }

    search(pageNumber) {
        let params = {
            page: pageNumber - 1,
            size: 10,
            accountId: this.props.account.id
        };

        AgreementService.search(params).then(response => {
            this.setState({
                searchResult: response.data,
                pageNumber: pageNumber,
                pageCount: response.data.totalPages,
            });
        }).catch(error => {
            Notify.showError(error);
        });
    }

    next(){
        return new Promise(
            (resolve, reject) => {
                this.setState({busy: true});
                CrmAccountService.validateAccount(this.props.account).then(response => {
                    resolve(true);
                }).catch(error => {
                    Notify.showError(error);
                    this.setState({busy: false});
                    reject();
                });
            }
        );
    }

    render(){
        let content;

        if (_.isEmpty(this.state.searchResult)) {
            content = (
                <GridCell width="1-1">
                    {super.translate("No agreement")}
                </GridCell>
            );
        } else {
            content = (
                <GridCell width = "1-1">
                    <DataTable.Table data={this.state.searchResult.content}>
                        <DataTable.Text header="Number" field="number"/>
                        <DataTable.Text header="Name" maxLength="10" field="name"/>
                        <DataTable.Text header="Status" field="status" translator={this} printer={new AgreementStatus(this)}/>

                        <DataTable.ActionColumn width={1}>
                            <DataTable.ActionWrapper track="onclick" onaction={(data) => this.view(data)}>
                                <Button icon="eye" size="small"/>
                            </DataTable.ActionWrapper>
                        </DataTable.ActionColumn>
                    </DataTable.Table>
                </GridCell>
            );
        }

        return (
            <Grid noMargin={true}>
                {content}
                <GridCell width="1-1">
                    <Pagination totalElements={this.state.searchResult.totalElements}
                                page={this.state.pageNumber}
                                totalPages={this.state.pageCount}
                                onPageChange={(pageNumber) => this.search(pageNumber)}
                                range={10}/>
                </GridCell>
            </Grid>
        );
    }
    }
    class AgreementStatus {
        constructor(translator){
            this.translator = translator;
        }
        translate(text){
            return this.translator ? this.translator.translate(text) : text;
        }
        printUsingRow(row) {
    
            if (row.status.code == "APPROVED") {
                return <span className="uk-badge md-bg-green-600">{this.translate(_.capitalize(row.status.name))}</span>
            }  else if (row.status.code == "OPEN") {
                return <span className="uk-badge md-bg-blue-500">{this.translate(_.capitalize(row.status.name))}</span>
            } else if (row.status.code == "CANCELED") {
                return <span className="uk-badge uk-badge-muted">{this.translate(_.capitalize(row.status.name))}</span>
            } else {
                return null;
            }
        }
    }
