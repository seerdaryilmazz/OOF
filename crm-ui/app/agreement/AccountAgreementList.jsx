import _ from "lodash";
import PropTypes from "prop-types";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, Notify } from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';
import { Grid, GridCell, Pagination, Secure } from "susam-components/layout";
import uuid from 'uuid';
import { AgreementService } from "../services/AgreementService";
import { ActionHeader } from "../utils";

export class AccountAgreementList extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            searchResult: { content: null }
        };
    }

    componentDidMount() {
        this.setState({searchParams: this.getInitialSearchParams()}, () => this.search(1));
    }

    getInitialSearchParams() {
        return {};
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

    view(data) {
        AgreementService.validateViewAgreementAuthorization(data.id)
        .then(response=>this.context.router.push(`/ui/crm/agreement/view/${data.id}`))
        .catch(error=>Notify.showError(error));
    }

    routeToAgreementForm(type) {
        let account={id: this.props.account.id, name: this.props.account.name, value:this.props.account.name};
        let state={account: account};
        this.context.router.push({pathname:`/ui/crm/agreement/new/${type}`, state:state});
    }

    getAuthorizedUsers(agreement) {
        if (agreement && agreement.ownerInfos) {
            let users = agreement.ownerInfos.map(ownerInfo => ownerInfo.name.id);
            if (this.context.user.username == this.props.account.accountOwner) {
                users.push(this.context.user.id);
            }
            return users;
        }
    }

    initProp(data){
        return {
            users: this.getAuthorizedUsers(data)
        }
    }

    renderAgreements() {
        return (
            <Grid divider={true}>
                <GridCell width="1-1">
                    <DataTable.Table data={this.state.searchResult.content}>
                        <DataTable.Text header="Number" field="number"/>
                        <DataTable.Text header="Name" maxLength="10" field="name"/>
                        <DataTable.Text header="Status" field="status" translator={this}
                                        printer={new AgreementStatus(this)}/>
                        <DataTable.Text header="Start Date" field="startDate"/>
                        <DataTable.Text header="End Date" field="endDate"/>
                        <DataTable.Text header="Service Areas" field="serviceAreas" printer={new ListPrinter(this)}/>
                        <DataTable.ActionColumn width={1}>
                            <DataTable.ActionWrapper track="onclick" onaction={(data) => this.view(data)} childProps={data=>this.initProp(data)}>
                                <Button icon="eye" size="small"/>
                            </DataTable.ActionWrapper>
                        </DataTable.ActionColumn>
                    </DataTable.Table>
                </GridCell>
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

    render() {
        return (
            <div>
                <ActionHeader title="Agreements" tools={[{
                    title: "Add Agreement",
                    items: [{label: "Logistic Contract", onclick: () => this.routeToAgreementForm('LOGISTIC')}]}]}
                              className="uk-accordion-title"/>
                <div className="uk-accordion-content uk-accordion-initial-open">
                    {this.renderAgreements()}
                </div>
            </div>
        )
    }
}

AccountAgreementList.contextTypes = {
    user: PropTypes.object,
    router: PropTypes.object,
    translator: PropTypes.object
};

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

class ListPrinter {
    constructor(translator) {
        this.translator = translator;
    }

    translate(text) {
        return this.translator ? this.translator.translate(text) : text;
    }

    print(data) {
        if (data) {
            let nameArr = [];
            data.map(item => nameArr.push(this.translate(item.name)));
            return <div key={uuid.v4()}>{nameArr.join(", ")}</div>;
        }
    }
}