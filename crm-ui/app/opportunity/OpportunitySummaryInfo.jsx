import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, Notify } from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';
import { Grid, GridCell } from "susam-components/layout";
import { StringUtils } from "../utils";
import _ from "lodash";

export class OpportunitySummaryInfo extends TranslatingComponent {

    static defaultProps = {
        opportunities:[]
    };

    constructor(props) {
        super(props);
        this.state={

        };
    }

    initialize(){
        this.setState({ userList: this.context.getUsers() });
    }

    handleAddOpportunityClick(value){
        this.props.onadd && this.props.onadd(value);
    }

    handleIgnoreOpportunityClick(value){
        UIkit.modal.confirm("Are you sure?", () => this.props.onignore && this.props.onignore(value));
    }

    render(){

        let actions = [];
        let createdByColumn = null;
        createdByColumn = <DataTable.Text field="createdBy" header="Created By" width="5" printer={new UserPrinter(this.context.getAllUsers())}/>;
        if(this.props.showAddButton) {
            actions.push(
                <DataTable.ActionWrapper key="add" track="onclick" onaction={(data) => this.handleAddOpportunityClick(data)}>
                    <Button label="add" flat={true} style="primary" size="small"/>
                </DataTable.ActionWrapper>
            );
        }
        if(this.props.showIgnoreButton){
            actions.push(
                <DataTable.ActionWrapper key="ignore" track="onclick" onaction = {(data) => this.handleIgnoreOpportunityClick(data)}>
                    <Button label="ignore" flat = {true} style="danger" size="small"/>
                </DataTable.ActionWrapper>
            );
        }
        return (
            <Grid divider={true}>
                <GridCell width="1-1">
                    <DataTable.Table data={this.props.opportunities}>
                        <DataTable.Text header="Number" field="number"/>
                        <DataTable.Text header="Name" field="name" printer={new OpportunityNamePrinter()}/>
                        <DataTable.Text header="Service Area" field="serviceArea.name" />
                        <DataTable.Numeric header="Exp. Turnover/Year" field="expectedTurnoverPerYear" width="8" printer={new TurnoverPrinter("expectedTurnoverPerYear")}/>
                        <DataTable.Numeric header="Committed Turnover/Year" field="committedTurnoverPerYear" width="8" printer={new TurnoverPrinter("committedTurnoverPerYear")}/>
                        <DataTable.Text header="Status" field="status.name" translator={this}
                                        printer={new OpportunityStatusPrinter(this)}/>
                        <DataTable.DateTime header="Last Updated" field="lastUpdated" printer={new DatePrinter()}/>
                        {createdByColumn}
                        <DataTable.ActionColumn width="10">
                            {actions}
                        </DataTable.ActionColumn>
                    </DataTable.Table>
                </GridCell>
            </Grid>
        );
    }


} 

OpportunitySummaryInfo.contextTypes = {
    getUsers: React.PropTypes.func,
    getAllUsers: React.PropTypes.func,
    router: React.PropTypes.object.isRequired,
    translator: React.PropTypes.object
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

class TurnoverPrinter {

    constructor(key) {
        this.key = key;
    }

    printUsingRow(row) {
        let data = row[this.key];
        if(!_.isEmpty(data) && data.amount){
            this.displayData = StringUtils.formatMoney(data.amount, _.get(data, 'currency.name'));
            return (<span style={{display:'block', textAlign:'right'}}>{this.displayData}</span>)
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
        this.userList=userList;
    }
    print(data){
        return _.get(_.find(this.userList, u=>u.username == data),'displayName');
    }
}

