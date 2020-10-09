import _ from "lodash";
import PropTypes from "prop-types";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Date as DateSelector, DateTime } from 'susam-components/advanced';
import { Button, Notify } from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';
import { Card, Grid, GridCell, HeaderWithBackground, Loader, Pagination } from "susam-components/layout";
import uuid from 'uuid';
import { AccountSearchAutoComplete, ActivityScopeDropDown, ActivityToolDropDown } from '../common';
import { ActivityStatusDropDown } from "../common/ActivityStatusDropDown";
import { CrmActivityService } from '../services';
import { DateTimeUtils } from '../utils/DateTimeUtils';
import { ActivityCalendar } from './ActivityCalendar';

export class ActivityList extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            ready: false
        };
        this.idForSearchPanel = "activitySearchPanel" + uuid.v4();
    }

    componentDidMount() {
        this.runAfterUserDataLoadedIntoContext(() => {
            this.setState({
                searchParams: this.getInitialSearchParams(), 
                viewType: this.context.isMobile ? 'grid' : 'list'
            }, () => this.search(1));
        });
    }

    /**
     * Sayfa açıldığında this.context.user henüz doldurulmamış olabiliyor.
     * Herhangi bir işi, this.context.user doldurulduktan sonra yapmak için bu metodu kullanıyoruz.
     */
    runAfterUserDataLoadedIntoContext(callback) {
        window.setTimeout(() => {
            if (this.context.user) {
                callback();
            } else {
                this.runAfterUserDataLoadedIntoContext(callback);
            }
        }, 200);
    }

    getInitialSearchParams() {
        return {};
    }

    getCurrentDateTimeWithTimezone() {

        let date = new Date();
        date.setMinutes(0, 0, 0); // Dakika, saniye ve milisaniyeyi sıfırlıyoruz.

        let formattedDate = DateTimeUtils.formatDateTime(date);
        let timezone = this.context.user.timeZoneId;
        let result = formattedDate + " " + timezone;

        return result;
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
            page: pageNumber - 1
        };

        if (!_.isEmpty(searchParams.minStartDate) && !DateTimeUtils.isDateTimeComplete(searchParams.minStartDate)) {
            Notify.showError("Time part of min start date must be specified.");
            return;
        }

        if (!_.isEmpty(searchParams.maxStartDate) && !DateTimeUtils.isDateTimeComplete(searchParams.maxStartDate)) {
            Notify.showError("Time part of max start date must be specified.");
            return;
        }
        params.username = this.context.user.username;
        if (!_.isNil(searchParams.account)) {
            params.accountId = searchParams.account.id;
        }
        if (!_.isNil(searchParams.scope)) {
            params.scopeCode = searchParams.scope.code;
        }
        if (!_.isNil(searchParams.tool)) {
            params.toolCode = searchParams.tool.code;
        }
        if (!_.isNil(searchParams.status)) {
            params.statusCode = searchParams.status.code;
        }
        if (!_.isEmpty(searchParams.minStartDate)) {
            params.minStartDate = searchParams.minStartDate;
        }
        if (!_.isEmpty(searchParams.maxStartDate)) {
            params.maxStartDate = searchParams.maxStartDate;
        }
        if (!_.isEmpty(searchParams.minCreationDate)) {
            params.minCreationDate = searchParams.minCreationDate;
        }
        if (!_.isEmpty(searchParams.maxCreationDate)) {
            params.maxCreationDate = searchParams.maxCreationDate;
        }

        CrmActivityService.search(params).then(response => {
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
        window.open(`/ui/crm/activity/view/${data.id}`, "_blank");
    }
  

    renderSearchPanel() {
        return (
            <GridCell width="1-1" style={{display: "none"}} id={this.idForSearchPanel}>
                <Card>
                    <Grid>
                        <GridCell width="1-1" noMargin={true}>
                            <HeaderWithBackground title="Activity Search" icon="close"
                                                  onIconClick={() => this.showOrHideSearchPanel()}/>
                        </GridCell>
                        <GridCell width="2-5">
                            <AccountSearchAutoComplete label="Account"
                                                       value={this.state.searchParams.account}
                                                       onchange={(value) => this.updateSearchParams("account", value)}
                                                       onclear={() => this.updateSearchParams("account", null)}/>
                        </GridCell>
                        <GridCell width="1-5">
                            <ActivityScopeDropDown label="Scope"
                                                   value={this.state.searchParams.scope}
                                                   translate={true}
                                                   onchange={(value) => this.updateSearchParams("scope", value)}/>
                        </GridCell>
                        <GridCell width="1-5">
                            <ActivityToolDropDown label="Tool"
                                                  value={this.state.searchParams.tool}
                                                  translate={true}
                                                  onchange={(value) => this.updateSearchParams("tool", value)}/>
                        </GridCell>
                        <GridCell width="1-5">
                            <ActivityStatusDropDown label="Status"
                                                  value={this.state.searchParams.status}
                                                  translate={true}
                                                  onchange={(value) => this.updateSearchParams("status", value)}/>
                        </GridCell>
                        <GridCell width="3-10">
                            <DateTime label="Min Start Date"
                                      value={this.state.searchParams.minStartDate}
                                      onchange={(value) => this.updateSearchParams("minStartDate", value)}/>
                        </GridCell>
                        <GridCell width="3-10">
                            <DateTime label="Max Start Date"
                                      value={this.state.searchParams.maxStartDate}
                                      onchange={(value) => this.updateSearchParams("maxStartDate", value)}/>
                        </GridCell>
                        <GridCell width="2-10">
                            <DateSelector label="Min Creation Date"
                                          value={this.state.searchParams.minCreationDate}
                                          onchange={(value) => this.updateSearchParams("minCreationDate", value)}/>
                        </GridCell>
                        <GridCell width="2-10">
                            <DateSelector label="Max Creation Date"
                                          value={this.state.searchParams.maxCreationDate}
                                          onchange={(value) => this.updateSearchParams("maxCreationDate", value)}/>
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

 
    checkContent()
    {
        if(this.props.context)
        {
            return <i icon="file-text-o" size="small"/>
        }
    }

    renderActivities() {
        let content;
        if ('grid' === this.state.viewType) {
            content = <ActivityCalendar />
        } else if (_.isEmpty(this.state.searchResult.content)) {
            content = (
                <GridCell width="1-1">
                    {super.translate("No activity")}
                </GridCell>
            );
        } else {
            content = (
                <DataTable.Table data={this.state.searchResult.content}>
                    <DataTable.Text header="Account" field="account.name" printer={new LinkPrinter(this)}/>
                    <DataTable.Text header="Status" translator={this} field="status" printer={new StatusPrinter(this.context.translator)}/>
                    <DataTable.Text header="Scope" translator={this} field="scope.name"/>
                    <DataTable.Text header="Tool" reader={new ToolReader("tool.name" )} printer={new ToolPrinter(this.context.translator)}/>
                    <DataTable.Text header="Start Date" field="calendar.startDate" printer={new DatePrinter()}/>
                    <DataTable.Text header="End Date" field="calendar.endDate" printer={new DatePrinter()}/>
                    <DataTable.ActionColumn>
                        <DataTable.ActionWrapper track="onclick" onaction={(data) => this.view(data)}>
                            <Button icon="eye" size="small"/>
                        </DataTable.ActionWrapper>
                    </DataTable.ActionColumn>
                </DataTable.Table>
            );
        }

        return (
            <GridCell width="1-1">
                <Card>
                    <Grid>
                        <GridCell width="1-1" noMargin={true}>
                            <HeaderWithBackground title="Activities" icon="search" onIconClick={() => this.showOrHideSearchPanel()}
                                options={[{icon: "view_list", onclick:()=>this.setState({viewType:"list"})},{icon: "event", onclick:()=>this.setState({viewType:"grid"})}]}/>
                        </GridCell>
                        <GridCell width="1-1">
                            {content}
                        </GridCell>
                        <GridCell width="1-1">
                            {'grid' !== this.state.viewType && 
                                <Pagination totalElements={this.state.searchResult.totalElements}
                                    page={this.state.pageNumber}
                                    totalPages={this.state.pageCount}
                                    onPageChange={(pageNumber) => this.search(pageNumber)}
                                    range={10}/>}
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
                    {this.renderActivities()}
                </Grid>
            );
        }
    }
}

ActivityList.contextTypes = {
    isMobile: PropTypes.bool,
    translator: PropTypes.object,
    router: PropTypes.object,
    user: PropTypes.object
};

class LinkPrinter {
    constructor(callingComponent){
        this.callingComponent=callingComponent;
    }
    printUsingRow(row, data) {
        let name = _.get(row,'account.name') || '';
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
        if(data){
            data=data.substring(0,16);
            return data;
        }
    }
}

class ToolPrinter {
    constructor(translator){
        this.translator = translator;
    }
    print(data){
        if(data){
            let title = this.translator ? this.translator.translate("Has Content") : "Has Content";
            return (<span>
                {this.translator ? this.translator.translate(data.tool.name): data.tool.name}
                {_.get(data, 'calendar.content') 
                && <i className="uk-icon-file-text-o" style={{padding: "0 8px"}} title={title} data-uk-tooltip="{pos:'bottom'}"/>}
            </span>)
        }
    }
}

class ToolReader {

    constructor(field) {
        this.field = field;
    };

    readCellValue(rowData) {
        return rowData;
    }
    readSortValue(rowData){
        return _.get(rowData, this.field);
    }
}

class StatusPrinter {
    constructor(translator){
        this.translator = translator;
    }

    translate(value){
        return this.translator ? this.translator.translate(value) : value;
    }

    statusStyles = {
        COMPLETED: "success",
        OPEN: "primary",
        CANCELLED: "muted",
        CANCELED: "muted"
    }

    print(data){
        let code = _.get(data, 'code');
        let name = _.get(data, 'name');
        return <span className={`uk-badge uk-badge-${this.statusStyles[code]}`}>{this.translate(name)}</span>
    }
}