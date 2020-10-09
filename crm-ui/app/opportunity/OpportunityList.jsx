import _ from "lodash";
import PropTypes from 'prop-types';
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, Notify } from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';
import { Grid, GridCell, LoaderWrapper, Pagination, Card } from "susam-components/layout";
import {CrmOpportunityService} from '../services';
import {ActionHeader, StringUtils} from '../utils';

export class OpportunityList extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {
            page: 1, size: 10,
            opportunities: { content: null }
        };
    }

    componentDidMount() {
        if(_.get(this.props.account, "id")){
            this.retrieveOpportunities(1);
        }
    }

    componentDidUpdate(prevProps){
        if(!_.isEqual(_.get(this.props.account, "id"), _.get(prevProps.account, "id"))){
            this.retrieveOpportunities(1);
        }
    }

    handleViewOpportunity(data){
        this.context.router.push(`/ui/crm/opportunity/view/${data.id}`);
    }

    retrieveOpportunities(pageNumber) {
        let params = {
            page: pageNumber - 1,
            accountId: this.props.account.id,
            size: this.state.size,
            ignoreCanceled: true
        };
        CrmOpportunityService.retrieveOpportunities(params).then(response=> {
            this.setState({
                opportunities: response.data,
                pageNumber: pageNumber,
                pageCount: response.data.totalPages
            });
        }).catch(error => {
            Notify.showError(error);
        });
    }

    routeToOpportunityForm(){
        this.context.router.push("/ui/crm/opportunity/new?account=" + this.props.account.id);
    }

    getActionHeaderTools(){
        let actionHeaderTools = [];
        let items = [];
        // actionHeaderTools.push({icon: "search", flat: true, items: [{label: "", onclick: () => this.showOrHideSearchPanel()}]});
        actionHeaderTools.push({title: "New Opportunity", items: [{label:"", onclick: () => this.routeToOpportunityForm()}]});

        return actionHeaderTools;
    }

    renderOpportunities() {
        if(!this.props.account.id){
            return null
        } else {
            return (
                <Grid divider={true}>
                    <GridCell width="1-1">
                        <DataTable.Table data={this.state.opportunities.content}>
                            <DataTable.Text header="Number" field="number"/>
                            <DataTable.Text header="Name" field="name" printer={new OpportunityNamePrinter()}/>
                            <DataTable.Text header="Service Area" field="serviceArea.name" />
                            <DataTable.Numeric header="Exp. Turnover/Year" field="expectedTurnoverPerYear" width="8" printer={new TurnoverPrinter("expectedTurnoverPerYear")}/>
                            <DataTable.Numeric header="Quoted Turnover/Year" field="quotedTurnoverPerYear" width="8" printer={new TurnoverPrinter("quotedTurnoverPerYear")}/>
                            <DataTable.Numeric header="Committed Turnover/Year" field="committedTurnoverPerYear" width="8" printer={new TurnoverPrinter("committedTurnoverPerYear")}/>
                            <DataTable.Text header="Status" field="status.name" translator={this}
                                            printer={new OpportunityStatusPrinter(this)}/>
                            <DataTable.DateTime header="Last Updated" field="lastUpdated" printer={new DatePrinter()}/>
                            <DataTable.Text header="Created By" field="createdBy" reRender={true}
                                            printer={new UserPrinter(this.context.getAllUsers())}/>
                            <DataTable.ActionColumn width={1}>
                                <DataTable.ActionWrapper key="viewOpportunity" track="onclick"
                                                         onaction={(data) => this.handleViewOpportunity(data)}>
                                    <Button icon="eye" size="small"/>
                                </DataTable.ActionWrapper>
                            </DataTable.ActionColumn>
                        </DataTable.Table>
                    </GridCell>
                    <GridCell width="1-1">
                        <Pagination totalElements={this.state.opportunities.totalElements}
                                    page={this.state.pageNumber}
                                    totalPages={this.state.pageCount}
                                    onPageChange={(pageNumber) => this.retrieveOpportunities(pageNumber)}
                                    range={10}/>
                    </GridCell>
                </Grid>
            );
        }
    }

    render(){
        return (
            <div>
                <ActionHeader title="Opportunities" tools={this.getActionHeaderTools()}
                              removeTopMargin={true} className="uk-accordion-title"/>
                <div className="uk-accordion-content uk-accordion-initial-open">
                    <LoaderWrapper busy={this.state.busy} title="" size="S">
                        {this.renderOpportunities()}
                    </LoaderWrapper>
                </div>
            </div>
        );
    }
}

OpportunityList.contextTypes = {
    getUsers: React.PropTypes.func,
    getAllUsers: React.PropTypes.func,
    user: React.PropTypes.object,
    router: PropTypes.object.isRequired,
    translator: PropTypes.object
};

class OpportunityNamePrinter {
    constructor(){
    }
    print(data){
        if(data.length>35){
            data = data.substring(0, 32) + "...";
        }
        return data;
    }
}

class NumericPrinter {

    constructor(scale) {
        this.scale = scale;
        this.displayData = "---";
    }

    print(data) {
        if (data || data === 0) {
            let floatPart = Number(data) - Math.floor(Number(data));
            if(floatPart === 0){
                this.displayData = Number(data).toFixed(2);
            } else if (this.scale || this.scale === 0) {
                this.displayData = StringUtils.formatNumber(Number(data),this.scale);
            } else {
                this.displayData = data;
            }
            return (<span>{this.displayData}</span>)
        }
    }
}

class OpportunityStatusPrinter {
    constructor(translator) {
        this.translator = translator;
    }

    translate(text) {
        return this.translator ? this.translator.translate(text) : text;
    }

    printUsingRow(row) {
        if ("QUOTED" == row.status.code) {
            return <span className="uk-badge md-bg-green-600">{this.translate(_.capitalize(row.status.name))}</span>
        } else if ("PROSPECTING" == row.status.code) {
            return <span className="uk-badge md-bg-blue-500">{this.translate(_.capitalize(row.status.name))}</span>
        } else if ("VALUE_PROPOSITION" == row.status.code) {
            return <span className="uk-badge md-bg-blue-700">{this.translate(_.capitalize(row.status.name))}</span>
        } else if ("CANCELED" == row.status.code) {
            return <span className="uk-badge uk-badge-muted">{this.translate(_.capitalize(row.status.name))}</span>
        } else if (["REJECTED", "WITHDRAWN"].includes(row.status.code)) {
            return <span className="uk-badge md-bg-red-600">{this.translate(_.capitalize(row.status.name))}</span>
        } else if ("CLOSED" == row.status.code) {
            return <span className="uk-badge uk-badge-warning">{this.translate(_.capitalize(row.status.name))}</span>
        } else {
            return null;
        }
    }
}

class TurnoverPrinter {

    constructor(key) {
        this.key = key;
    }

    printUsingRow(row) {
        let data = row[this.key];
        if(!_.isEmpty(data)){
            this.displayData = StringUtils.formatMoney(data.amount, _.get(data, 'currency.name'));
            return (<span style={{display:'block', textAlign:'right'}}>{this.displayData}</span>)
        }
    }
}

class DatePrinter {
    constructor(){
    }
    print(data){
        if(data){
            data=data.substring(0,16);
            return data;
        }
    }
}

class UserPrinter{
    constructor(userList){
        this.userList=userList || [];
    }
    print(data){
        return _.get(_.find(this.userList, u=>u.username == data),'displayName');
    }
}
