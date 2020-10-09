import _ from "lodash";
import PropTypes from "prop-types";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Date as DateSelector } from 'susam-components/advanced';
import { Button, Notify, TextInput } from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';
import { Card, Grid, GridCell, HeaderWithBackground, Loader, Pagination } from "susam-components/layout";
import uuid from 'uuid';
import { AccountSearchAutoComplete, AccountTypeDropDown, CountryDropDown, SegmentTypeDropDown } from '../common';
import { CrmSearchService } from '../services';
import { ObjectUtils } from "../utils";
import { AccountCard } from "./AccountCard";

export class AccountList extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            ready: false
        };
        this.idForSearchPanel = "accountSearchPanel" + uuid.v4();
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

    search(pageNumber) {

        let searchParams = this.state.searchParams;
        let params = {
            page: pageNumber - 1,
            matchFilters: []
        };

        if (!_.isNil(searchParams.country)) {
            params.matchFilters.push({name: "Country Iso", val: searchParams.country.iso});
        }
        if (!_.isNil(searchParams.type)) {
            params.matchFilters.push({name: "Account Type", val: searchParams.type.code});
        }
        if (!_.isNil(searchParams.account)) {
            params.matchFilters.push({name: "Account Id", val: searchParams.account.id});
        }
        if (!_.isNil(searchParams.segment)) {
            params.matchFilters.push({name: "Segment Code", val: searchParams.segment.code});
        }
        if (!_.isEmpty(searchParams.minUpdateDate)) {
            params.matchFilters.push({name: "minUpdateDate", val: searchParams.minUpdateDate});
        }
        if (!_.isEmpty(searchParams.maxUpdateDate)) {
            params.matchFilters.push({name: "maxUpdateDate", val: searchParams.maxUpdateDate});
        }
        if (!_.isEmpty(searchParams.city)) {
            params.matchFilters.push({name: "City", val: searchParams.city});
        }
        if (!_.isEmpty(searchParams.district)) {
            if(_.isEmpty(searchParams.city)){
                Notify.showError("City must be entered for district.");
                return false;
            }else{
                params.matchFilters.push({name: "District", val: searchParams.district});
            }
        }

        CrmSearchService.searchAccountsForHomePage(params).then(response => {
            this.setState({
                searchResult:response.data,
                pageNumber: pageNumber,
                pageCount: response.data.totalPages,
                ready: true
            });
        }).catch(error => {
            Notify.showError(error);
        });
    }

    view(data) {
        window.open(`/ui/crm/account/${data.id}/view`, "_blank")
    }

    renderSearchPanel() {
        return (
            <GridCell width="1-1" style={{display: "none"}} id={this.idForSearchPanel}>
                <Card>
                    <Grid>
                        <GridCell width="1-1" noMargin={true}>
                            <HeaderWithBackground title="Account Search" icon="close"
                                                  onIconClick={() => this.showOrHideSearchPanel()}/>
                        </GridCell>
                        <GridCell width="1-4">
                            <CountryDropDown label="Country"
                                             value={this.state.searchParams.country}
                                             translate={true}
                                             onchange={(value) => this.updateSearchParams("country", value)}/>
                        </GridCell>
                        <GridCell width="1-4">
                            <TextInput label="City"
                                       value={this.state.searchParams.city}
                                       onchange={(value) => this.updateSearchParams("city", value)}/>
                        </GridCell>
                        <GridCell width="1-4">
                            <TextInput label="District"
                                       value={this.state.searchParams.district}
                                       maxLength= "40"
                                       onchange={(value) => this.updateSearchParams("district", value)}/>
                        </GridCell>
                        <GridCell width="1-4"/>
                        <GridCell width="1-4">
                            <AccountTypeDropDown label="Type"
                                                 value={this.state.searchParams.type}
                                                 translate={true}
                                                 onchange={(value) => this.updateSearchParams("type", value)}/>
                        </GridCell>
                        <GridCell width="2-4">
                            <AccountSearchAutoComplete label="Account"
                                                       value={this.state.searchParams.account}
                                                       onchange={(value) => this.updateSearchParams("account", value)}
                                                       onclear={() => this.updateSearchParams("account", null)}/>
                        </GridCell>
                        <GridCell width="1-4"/>
                        <GridCell width="1-4">
                            <SegmentTypeDropDown label="Segment"
                                                 value={this.state.searchParams.segment}
                                                 translate={true}
                                                 onchange={(value) => this.updateSearchParams("segment", value)}/>
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
                        <GridCell width="1-4"/>
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

    renderAccounts() {

        let content;

        if (_.isEmpty(this.state.searchResult.content)) {
            content = (
                <GridCell width="1-1">
                    {super.translate("No account")}
                </GridCell>
            );
        } else {
            if('grid' === this.state.viewType){
                content = (<Grid collapse={true}>
                    {this.state.searchResult.content.map((account,i)=><GridCell width="1-5" key={i}><AccountCard account={account}/></GridCell>)}
                </Grid>);
            } else {
                content = (
                    <DataTable.Table data={this.state.searchResult.content}>
                        <DataTable.Text header="Company" field="company.name" printer={new CompanyPrinter()}/>
                        <DataTable.Text header="Country" translator={this} field="country.name"/>
                        <DataTable.Text header="Type" translator={this} field="accountType.name"/>
                        <DataTable.Text header="Segment" translator={this} field="segment.name"/>
                        <DataTable.DateTime header="Last Updated" field="lastUpdated" printer={new DatePrinter()}/>
                        <DataTable.ActionColumn>
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
                            <HeaderWithBackground title="Accounts" icon="search" onIconClick={() => this.showOrHideSearchPanel()}
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
                    {this.renderAccounts()}
                </Grid>
            );
        }
    }
}

AccountList.contextTypes = {
    isMobile: PropTypes.bool,
    router: PropTypes.object,
    translator: PropTypes.object
};

class CompanyPrinter{
    constructor(){
    }
    print(data){
        if(data.length>35){
            data=data.substring(0,32) + "...";
        }
        return data;
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
