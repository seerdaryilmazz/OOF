import PropTypes from 'prop-types';
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Date as DateSelector, NumericInput } from 'susam-components/advanced';
import { Button, Checkbox, Notify, ReadOnlyDropDown } from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';
import { Card, Grid, GridCell, HeaderWithBackground, Loader, Pagination, Secure } from "susam-components/layout";
import uuid from 'uuid';
import { AccountSearchAutoComplete, CountryDropDown, CountryPointDropDown, QuoteStatusDropDown, QuoteStatusPrinter, QuoteTypeDropDown, QuoteTypePrinter, ServiceAreaDropDown, ShipmentLoadingTypeDropDown, UserDropDown } from '../common';
import { AuthorizationService, CrmSearchService } from '../services';
import { QuoteCard } from "./QuoteCard";

export class QuoteList extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            ready: false,
        };
        this.idForSearchPanel = "quoteSearchPanel" + uuid.v4();
    }

    getCountryPointType() {
        let serviceArea = _.get(this.state.searchParams, 'serviceArea.code');
        let countryPointType = null;
        if (serviceArea) {
            if (serviceArea == "ROAD" || serviceArea == "DTR") {
                countryPointType = "POSTAL";
            } else if (serviceArea == "SEA") {
                countryPointType = "PORT";
            } else if (serviceArea == "AIR") {
                countryPointType = "AIRPORT";
            }
        }
        return countryPointType;
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

    updateSearchParamsForTeammates(value) {
        if (value) {
            AuthorizationService.getUserTeammates(this.context.user.username).then(response => {
                let teammateUsernames = response.data.map(i => i.name);
                this.updateSearchParams("teammates", teammateUsernames);
            })
        } else {
            this.updateSearchParams("teammates", null);
        }
        this.updateSearchParams("searchByTeammates", value);
    }

    updateSearchParamsForShowAll(value) {
        if (value) {
            AuthorizationService.getUserSublevelUsers().then(response => {
                let result = response.data;
                let masterTeam = 1 === result.teams.length? result.teams[0] : null
                this.setState({ masterTeams: result});
                if(masterTeam) {
                    this.handleChangeMasterTeam(masterTeam.team);
                }
            }).catch(error => Notify.showError(error));
        } else {
            this.setState({ masterTeams: null, masterTeam: null })
            this.updateSearchParams("teammates", null);
        }
        this.updateSearchParams("showAll", value);
    }
    
    handleChangeMasterTeam(value){
        if(value){
            let masterTeam = _.find(this.state.masterTeams.teams, i=>i.team.id === value.id);
            this.setState({ masterTeam });
            this.updateSearchParams("teammates", masterTeam.users.map(i=>i.username));
        } else {
            this.setState({masterTeam: null});
            this.updateSearchParams("teammates", null);
        }
    }

    updateSearchParams(propertyKey, propertyValue) {
        let searchParams = _.cloneDeep(this.state.searchParams);
        _.set(searchParams, propertyKey, propertyValue);
        this.setState({ searchParams: searchParams });
    }

    clearSearchParams() {
        this.setState({ searchParams: {} });
    }


    search(pageNumber) {

        let searchParams = this.state.searchParams;
        let params = {
            page: pageNumber - 1,
        };

        if (_.isNumber(searchParams.number)) {
            params.number = searchParams.number;
        }
        if (!_.isNil(searchParams.type)) {
            params.typeCode = searchParams.type.code;
        }
        if (!_.isNil(searchParams.account)) {
            params.accountId = searchParams.account.id;
        }
        if (!_.isNil(searchParams.status)) {
            params.statusCode = searchParams.status.code;
        }
        if (!_.isEmpty(searchParams.minUpdateDate)) {
            params.minUpdateDate = searchParams.minUpdateDate;
        }
        if (!_.isEmpty(searchParams.maxUpdateDate)) {
            params.maxUpdateDate = searchParams.maxUpdateDate;
        }
        if (!_.isNil(searchParams.serviceArea)) {
            params.serviceAreaCode = searchParams.serviceArea.code;
        }
        if (!_.isNil(searchParams.shipmentLoadingType)) {
            params.shipmentLoadingType = searchParams.shipmentLoadingType.code;
        }
        if (!_.isEmpty(searchParams.minCreatedAt)) {
            params.minCreatedAt = searchParams.minCreatedAt;
        }
        if (!_.isEmpty(searchParams.maxCreatedAt)) {
            params.maxCreatedAt = searchParams.maxCreatedAt;
        }
        if (!_.isEmpty(searchParams.fromCountry)) {
            params.fromCountry = searchParams.fromCountry.iso;
        }
        if (!_.isEmpty(searchParams.toCountry)) {
            params.toCountry = searchParams.toCountry.iso;
        }
        if (!_.isEmpty(searchParams.fromPoint)) {
            params.fromPoint = searchParams.fromPoint.id;
        }
        if (!_.isEmpty(searchParams.toPoint)) {
            params.toPoint = searchParams.toPoint.id;
        }
        if (!_.isNil(searchParams.teammates)) {
            params.teammates = searchParams.teammates;
        }
        if (!_.isNil(searchParams.createdBy)) {
            params.createdBy = searchParams.createdBy.username;
        }

        CrmSearchService.searchQuotesForHomePage(params).then(response => {
            this.setState({
                searchResult: response.data,
                pageNumber: pageNumber,
                pageCount: response.data.totalPages,
                ready: true
            });
        }).catch(error => {
            Notify.showError(error);
        });
    }

    view(data) {
        window.open(`/ui/crm/quote/view/${data.id}`, "_blank")
    }

    renderSearchPanel() {
        return (
            <GridCell width="1-1" style={{ display: "none" }} id={this.idForSearchPanel}>
                <Card>
                    <Grid>
                        <GridCell width="1-1" noMargin={true}>
                            <HeaderWithBackground title="Quote Search" icon="close" onIconClick={() => this.showOrHideSearchPanel()} />
                        </GridCell>
                        <GridCell width="1-5">
                            <NumericInput label="Number"
                                value={this.state.searchParams.number}
                                onchange={(value) => this.updateSearchParams("number", value)}
                                allowMinus={false} />
                        </GridCell>
                        <GridCell width="1-5">
                            <QuoteStatusDropDown label="Status"
                                value={this.state.searchParams.status}
                                translate={true}
                                onchange={(value) => this.updateSearchParams("status", value)} />
                        </GridCell>
                        <GridCell width="1-5">
                            <QuoteTypeDropDown label="Type"
                                value={this.state.searchParams.type}
                                translate={true}
                                onchange={(value) => this.updateSearchParams("type", value)} />
                        </GridCell>
                        <GridCell width="1-5">
                            <ServiceAreaDropDown label="Service Area"
                                value={this.state.searchParams.serviceArea}
                                onchange={(value) => this.updateSearchParams("serviceArea", value)} />
                        </GridCell>
                        <GridCell width="1-5">
                            <ShipmentLoadingTypeDropDown label="Shipment Loading Type" serviceArea={_.get(this.state, 'searchParams.serviceArea.code')}
                                value={this.state.searchParams.shipmentLoadingType}
                                translate={true} shortenForRoad={true}
                                onchange={value => this.updateSearchParams("shipmentLoadingType", value)} />
                        </GridCell>
                        <GridCell width="1-5">
                            <CountryDropDown label="From Country"
                                value={this.state.searchParams.fromCountry}
                                translate={true}
                                onchange={(value) => this.updateSearchParams("fromCountry", value)} />
                        </GridCell>
                        <GridCell width="1-5">
                            <CountryPointDropDown label="From Point"
                                country={this.state.searchParams.fromCountry}
                                type={this.getCountryPointType()}
                                value={this.state.searchParams.fromPoint}
                                translate={true} multiple={false}
                                onchange={(value) => this.updateSearchParams("fromPoint", value)} />
                        </GridCell>
                        <GridCell width="1-5">
                            <CountryDropDown label="To Country"
                                value={this.state.searchParams.toCountry}
                                translate={true}
                                onchange={(value) => this.updateSearchParams("toCountry", value)} />
                        </GridCell>
                        <GridCell width="1-5">
                            <CountryPointDropDown label="To Point"
                                country={this.state.searchParams.toCountry}
                                type={this.getCountryPointType()}
                                value={this.state.searchParams.toPoint}
                                translate={true} multiple={false}
                                onchange={(value) => this.updateSearchParams("toPoint", value)} />
                        </GridCell>
                        <GridCell width="1-5">
                            <UserDropDown label="Created By"
                                value={this.state.searchParams.createdBy}
                                translate={true}
                                valueField="username"
                                labelField="displayName"
                                onchange={(value) => this.updateSearchParams("createdBy", value)} />
                        </GridCell>

                        <GridCell width="1-6">
                            <DateSelector label="Min Update Date"
                                value={this.state.searchParams.minUpdateDate}
                                onchange={(value) => this.updateSearchParams("minUpdateDate", value)} />
                        </GridCell>
                        <GridCell width="1-6">
                            <DateSelector label="Max Update Date"
                                value={this.state.searchParams.maxUpdateDate}
                                onchange={(value) => this.updateSearchParams("maxUpdateDate", value)} />
                        </GridCell>

                        <GridCell width="1-6">
                            <DateSelector label="Min Created Date"
                                value={this.state.searchParams.minCreatedAt}
                                onchange={(value) => this.updateSearchParams("minCreatedAt", value)} />
                        </GridCell>
                        <GridCell width="1-6">
                            <DateSelector label="Max Created Date"
                                value={this.state.searchParams.maxCreatedAt}
                                onchange={(value) => this.updateSearchParams("maxCreatedAt", value)} />
                        </GridCell>

                        <GridCell width="2-6">
                            <AccountSearchAutoComplete label="Account"
                                value={this.state.searchParams.account}
                                onchange={(value) => this.updateSearchParams("account", value)}
                                onclear={() => this.updateSearchParams("account", null)} />
                        </GridCell>
                        <GridCell width="1-6" >
                            <div style={{padding: "16px 0"}}>
                                <Checkbox label="Show My Team's Quotes" value={this.state.searchParams.searchByTeammates}
                                    onchange={(e) => { this.updateSearchParamsForTeammates(e) }} />
                            </div>
                        </GridCell>
                        <GridCell width="1-6">
                            <Secure operations="authorization.get-subhierarchy-of-user" >
                                <div style={{ padding: "16px 0" }}>
                                    <Checkbox label="Show All" value={this.state.searchParams.showAll}
                                        onchange={(e) => { this.updateSearchParamsForShowAll(e) }} />
                                </div>
                            </Secure>
                        </GridCell>
                        <GridCell width="1-6">
                            {this.state.masterTeams && 
                            <ReadOnlyDropDown label="Teams" options={_.get(this.state,'masterTeams.teams', []).map(i=>i.team)}
                                readOnly={1 === _.get(this.state,'masterTeams.teams', []).map(i=>i.team).length}
                                value={_.get(this.state, 'masterTeam.team')}
                                onchange={value=>this.handleChangeMasterTeam(value)} /> }
                        </GridCell>
                        <GridCell width="1-2" >
                            <div className="uk-align-right">
                                <Button label="Clear" onclick={() => this.clearSearchParams()} />
                                <Button label="Search" onclick={() => this.search(1)} />
                            </div>
                        </GridCell>
                    </Grid>
                </Card>
            </GridCell>
        );
    }

    renderQuotes() {

        let content;

        if (_.isEmpty(this.state.searchResult.content)) {
            content = (
                <GridCell width="1-1">
                    {super.translate("No quote")}
                </GridCell>
            );
        } else {
            if ('grid' === this.state.viewType) {
                content = (<Grid collapse={true}>
                    {this.state.searchResult.content.map((quote, i) => <GridCell width="1-5" key={i}><QuoteCard quote={quote} /></GridCell>)}
                </Grid>);
            } else {
                content = (
                    <DataTable.Table data={this.state.searchResult.content}>
                        <DataTable.Text header="Number" field="number" />
                        <DataTable.Text header="Quadro Number" field="mappedIds.QUADRO" />
                        <DataTable.Text header="Name" maxLength="10" field="name" printer={new QuoteNamePrinter()} />
                        <DataTable.Text header="Account" field="account.name" printer={new LinkPrinter(this)} />
                        <DataTable.Text header="Type" field="type.name" printer={new QuoteTypePrinter(this)} />
                        <DataTable.Text header="Service Area" field="serviceArea.name" />
                        <DataTable.Text header="Status" translator={this} field="status.name" printer={new QuoteStatusPrinter(this)} />
                        <DataTable.DateTime header="Last Updated" field="lastUpdated" printer={new DatePrinter()} />
                        <DataTable.Text header="Created By" field="createdBy" printer={new UserPrinter(this.context.getAllUsers())} />
                        <DataTable.ActionColumn>
                            <DataTable.ActionWrapper track="onclick" onaction={(data) => this.view(data)}>
                                <Button icon="eye" size="small" />
                            </DataTable.ActionWrapper>
                        </DataTable.ActionColumn>
                    </DataTable.Table>);
            }
        }

        return (
            <GridCell width="1-1">
                <Card>
                    <Grid>
                        <GridCell width="1-1" noMargin={true}>
                            <HeaderWithBackground title="Quotes" icon="search" onIconClick={() => this.showOrHideSearchPanel()}
                                options={[{ icon: "view_list", onclick: () => this.setState({ viewType: "list" }) }, { icon: "view_module", onclick: () => this.setState({ viewType: "grid" }) }]} />
                        </GridCell>
                        <GridCell width="1-1">
                            {content}
                        </GridCell>
                        <GridCell width="1-1">
                            <Pagination totalElements={this.state.searchResult.totalElements}
                                page={this.state.pageNumber}
                                totalPages={this.state.pageCount}
                                onPageChange={(pageNumber) => this.search(pageNumber)}
                                range={10} />
                        </GridCell>
                    </Grid>
                </Card>
            </GridCell>
        );
    }

    render() {
        if (!this.state.ready) {
            return (
                <Loader size="L" />
            );
        } else {
            return (
                <Grid>
                    {this.renderSearchPanel()}
                    {this.renderQuotes()}
                </Grid>
            );
        }
    }
}

QuoteList.contextTypes = {
    isMobile: PropTypes.bool,
    getUsers: PropTypes.func,
    getAllUsers: PropTypes.func,
    user: PropTypes.object,
    router: PropTypes.object,
    translator: PropTypes.object
};

class QuoteNamePrinter {
    constructor() {
    }
    print(data) {
        data = data.substring(data.indexOf('From')); //Deletes everything before 'From'
        if (data.length > 35) {
            data = data.substring(0, 32) + "...";
        }
        return data;
    }
}

class LinkPrinter {
    constructor(callingComponent) {
        this.callingComponent = callingComponent;
    }
    printUsingRow(row, data) {
        let name = row.account.name;
        if (name.length > 35) {
            name = name.substring(0, 32) + "...";
        }
        return <a style={{ color: 'black' }} href={`/ui/crm/account/${row.account.id}/view`}><u>{name}</u></a>
    }
}

class DatePrinter {
    constructor() {
    }
    print(data) {
        data = data.substring(0, 16);
        return data;
    }
}

class UserPrinter {
    constructor(userList) {
        this.userList = userList;
    }
    print(data) {
        return _.get(_.find(this.userList, u => u.username == data), 'displayName');
    }
}
