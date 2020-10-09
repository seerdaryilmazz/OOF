import _ from "lodash";
import PropTypes from 'prop-types';
import React from "react";
import {TranslatingComponent} from 'susam-components/abstract';
import {Date as DateSelector, NumericInput} from 'susam-components/advanced';
import {Button, Checkbox, Notify} from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';
import {Card, Grid, GridCell, HeaderWithBackground, Loader, Pagination} from "susam-components/layout";
import uuid from 'uuid';
import {AccountSearchAutoComplete, ServiceAreaDropDown, UserDropDown, OpportunityStatusDropDown} from '../common';
import {AuthorizationService, CrmSearchService} from '../services';
import {ObjectUtils, StringUtils} from "../utils";
import {OpportunityCard} from "./OpportunityCard";

export class OpportunityList extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {
            ready: false
        };
        this.idForSearchPanel = "opportunitySearchPanel" + uuid.v4();
    }

    componentDidMount() {
        this.setState({
            searchParams: this.getInitialSearchParams(),
            viewType: this.context.isMobile ? 'grid' : 'list'
        }, () => this.search(1));
    }

    getInitialSearchParams() {
        return {};
    }

    showOrHideSearchPanel() {
        $("#" + this.idForSearchPanel).slideToggle("slow");
    }

    updateSearchParams(propertyKey, propertyValue) {
        let searchParams = _.cloneDeep(this.state.searchParams);
        _.set(searchParams, propertyKey, propertyValue);
        this.setState({searchParams: searchParams});
    }

    clearSearchParams() {
        this.setState({searchParams: {}});
    }

    updateSearchParamsForTeammates(value){
        if(value){
            AuthorizationService.getUserTeammates(this.context.user.username).then(response=>{
                let teammateUsernames = response.data.map(i=>i.name);
                this.updateSearchParams("teammates",teammateUsernames);
            })
        } else {
            this.updateSearchParams("teammates",null);
        }
        this.updateSearchParams("searchByTeammates",value);
    }

    search(pageNumber) {
        let searchParams = this.state.searchParams;
        let params = {
            page: pageNumber - 1,
            matchFilters: [],
            teammates:[]
        };
        console.log(searchParams.number);
        if (searchParams.number) {
            params.matchFilters.push({name: "Number", val: _.toNumber(searchParams.number)});
        }
        if (!_.isEmpty(searchParams.status)) {
            params.matchFilters.push({name: "Status Code", val: searchParams.status.code});
        }else {
            params.matchFilters.push({name: "Status Code", val: "CANCELED", not: true});
        }
        if (!_.isEmpty(searchParams.serviceArea)) {
            params.matchFilters.push({name: "Service Area Code", val: searchParams.serviceArea.code});
        }
        if (!_.isEmpty(searchParams.createdBy)) {
            params.matchFilters.push({name: "Created By", val: searchParams.createdBy.username});
        }
        if (!_.isEmpty(searchParams.minUpdateDate)) {
            params.matchFilters.push({name: "minUpdateDate", val: searchParams.minUpdateDate});
        }
        if (!_.isEmpty(searchParams.maxUpdateDate)) {
            params.matchFilters.push({name: "maxUpdateDate", val: searchParams.maxUpdateDate});
        }
        if (!_.isEmpty(searchParams.minCreateDate)) {
            params.matchFilters.push({name: "minCreateDate", val: searchParams.minCreateDate});
        }
        if (!_.isEmpty(searchParams.maxCreateDate)) {
            params.matchFilters.push({name: "maxCreateDate", val: searchParams.maxCreateDate});
        }
        if (!_.isEmpty(searchParams.account)) {
            params.matchFilters.push({name: "Account", val: searchParams.account.id});
        }
        if (!_.isEmpty(searchParams.teammates)) {
            params.teammates = searchParams.teammates;
        }
        console.log(params);
        CrmSearchService.searchOpportunitiesForHomePage(params).then(response=>{
            this.setState({
                searchResult:response.data,
                pageNumber: pageNumber,
                pageCount: response.data.totalPages,
                ready: true
            });
        }).catch(e=>{
            console.log(e);
            Notify.showError(e);
        })

    }

    arrangeServiceAreaOptions(options) {
        return _.filter(options, (i => ['ROAD', 'SEA', 'AIR', 'DTR', 'CCL', 'WHM'].includes(i.code)))
    }

    view(data) {
        window.open(`/ui/crm/opportunity/view/${data.id}`, "_blank")
    }

    renderSearchPanel() {
        return (
            <GridCell width="1-1" style={{display: "none"}} id={this.idForSearchPanel}>
                <Card>
                    <Grid>
                        <GridCell width="1-1" noMargin={true}>
                            <HeaderWithBackground title="Opportunity Search" icon="close" onIconClick={() => this.showOrHideSearchPanel()}/>
                        </GridCell>
                        <GridCell width="1-4">
                            <NumericInput label="Number"
                                          value={this.state.searchParams.number}
                                          onchange={(value) => this.updateSearchParams("number", value)}
                                          allowMinus={false}/>
                        </GridCell>
                        <GridCell width="1-4">
                            <OpportunityStatusDropDown label="Status"
                                                       value={this.state.searchParams.status}
                                                       translate={true}
                                                       onchange={(value) => this.updateSearchParams("status", value)}/>
                        </GridCell>
                        <GridCell width="1-4">
                            <ServiceAreaDropDown label="Service Area"
                                                 value={this.state.searchParams.serviceArea}
                                                 arrangeOptions={(opt)=> this.arrangeServiceAreaOptions(opt)}
                                                 onchange={(value) => this.updateSearchParams("serviceArea", value)}/>
                        </GridCell>
                        <GridCell width="1-4">
                            <UserDropDown label="Created By"
                                          value={this.state.searchParams.createdBy}
                                          translate={true}
                                          valueField="username"
                                          labelField="displayName"
                                          onchange={(value) => this.updateSearchParams("createdBy", value)}/>
                        </GridCell>

                        <GridCell width="1-4">
                            <DateSelector label="Min Update Date"
                                          value={this.state.searchParams.minUpdateDate}
                                          onchange={(value) => this.updateSearchParams("minUpdateDate", value)}/>
                        </GridCell>
                        <GridCell width="1-4">
                            <DateSelector label="Max Update Date"
                                          value={this.state.searchParams.maxUpdateDate}
                                          onchange={(value) => this.updateSearchParams("maxUpdateDate", value)}/>
                        </GridCell>

                        <GridCell width="1-4">
                            <DateSelector label="Min Created Date"
                                          value={this.state.searchParams.minCreateDate}
                                          onchange={(value) => this.updateSearchParams("minCreateDate", value)}/>
                        </GridCell>
                        <GridCell width="1-4">
                            <DateSelector label="Max Created Date"
                                          value={this.state.searchParams.maxCreateDate}
                                          onchange={(value) => this.updateSearchParams("maxCreateDate", value)}/>
                        </GridCell>
                        <GridCell width="3-8">
                            <AccountSearchAutoComplete label="Account"
                                                       value={this.state.searchParams.account}
                                                       onchange={(value) => this.updateSearchParams("account", value)}
                                                       onclear={() => this.updateSearchParams("account", null)}/>
                        </GridCell>
                        <GridCell width="3-8">
                            <Checkbox label="Show My Team's Opportunities" value={this.state.searchParams.searchByTeammates}
                                      onchange={(e) => {this.updateSearchParamsForTeammates(e)}}/>
                        </GridCell>
                        <GridCell width="1-1">
                            <div className="uk-align-right">
                                <Button label="Clear" onclick={() => this.clearSearchParams()}/>
                                <Button label="Search" onclick={() => this.search(1)}/>
                            </div>
                        </GridCell>
                    </Grid>
                </Card>
            </GridCell>
        );
    }
    
    renderOpportunities() {

        let content;

        if (_.isEmpty(this.state.searchResult.content)) {
            content = (
                <GridCell width="1-1">
                    {super.translate("No opportunity")}
                </GridCell>
            );
        } else {
            if('grid' === this.state.viewType){
                content = (<Grid collapse={true}>
                    {this.state.searchResult.content.map((opportunity,i)=><GridCell width="1-5" key={i}><OpportunityCard opportunity={opportunity}/></GridCell>)}
                </Grid>);
            } else {
                content = (
                    <DataTable.Table data={this.state.searchResult.content}>
                        <DataTable.Text header="Number" field="number"/>
                        <DataTable.Text header="Name" field="name" printer={new OpportunityNamePrinter()}/>
                        <DataTable.Text header="Account" field="account.name" printer={new LinkPrinter(this)}/>
                        <DataTable.Text header="Service Area" field="serviceArea.name" translator={this}/>
                        <DataTable.Numeric header="Exp. Turnover/Year" field="expectedTurnoverPerYear" width="8" printer={new TurnoverPrinter("expectedTurnoverPerYear")}/>
                        <DataTable.Text header="Status" field="status.name" translator={this}
                                        printer={new OpportunityStatusPrinter(this)}/>
                        <DataTable.DateTime header="Last Updated" field="lastUpdated" printer={new DatePrinter()}/>
                        <DataTable.Text header="Created By" field="createdBy" reRender={true}
                                        printer={new UserPrinter(this.context.getAllUsers())}/>
                        <DataTable.ActionColumn width={1}>
                            <DataTable.ActionWrapper track="onclick" onaction={(data) => this.view(data)}>
                                <Button icon="eye" size="small"/>
                            </DataTable.ActionWrapper>
                        </DataTable.ActionColumn>
                    </DataTable.Table>
                );
            }
        }

        return (
            <GridCell width="1-1">
                <Card>
                    <Grid>
                        <GridCell width="1-1" noMargin={true}>
                            <HeaderWithBackground title="Opportunities" icon="search" onIconClick={() => this.showOrHideSearchPanel()}
                                                  options={[{icon: "view_list", onclick:()=>this.setState({viewType:"list"})},{icon: "view_module", onclick:()=>this.setState({viewType:"grid"})}]}/>
                        </GridCell>
                        <GridCell width="1-1">
                            {content}
                        </GridCell>
                        <GridCell width="1-1">
                            <Pagination totalElements={this.state.searchResult.totalElements}
                                        page={this.state.pageNumber}
                                        totalPages={this.state.pageCount}
                                        onPageChange={(pageNumber) => this.search(pageNumber)}
                                        range={10}/>
                        </GridCell>
                    </Grid>
                </Card>
            </GridCell>
        );
    }

    render() {
        if (!this.state.ready) {
            return (
                <Loader size="L"/>
            );
        } else {
            return (
                <Grid>
                    {this.renderSearchPanel()}
                    {this.renderOpportunities()}
                </Grid>
            );
        }
    }
}

OpportunityList.contextTypes = {
    isMobile: PropTypes.bool,
    getUsers: PropTypes.func,
    getAllUsers: PropTypes.func,
    user: PropTypes.object,
    router: PropTypes.object,
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

class LinkPrinter {
    constructor(callingComponent){
        this.callingComponent=callingComponent;
    }
    printUsingRow(row, data) {
        let name = row.account.name;
        if(name.length>35){
            name = name.substring(0, 32) + "...";
        }
        return <a style={{color:'black'}} href={`/ui/crm/account/${row.account.id}/view`}><u>{name}</u></a>
    }
}

class DatePrinter {
    constructor(){
    }
    print(data){
        data=data.substring(0,16);
        return data;
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