import _ from "lodash";
import PropTypes from 'prop-types';
import React from "react";
import ReactDOM from "react-dom";
import { TranslatingComponent } from 'susam-components/abstract';
import { Date as DateSelector, DateTime } from 'susam-components/advanced';
import { Button, Notify } from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';
import { Grid, GridCell, HeaderWithBackground, LoaderWrapper, Pagination } from "susam-components/layout";
import { ActivityScopeDropDown, ActivityToolDropDown } from "../common";
import { ActivityStatusDropDown } from "../common/ActivityStatusDropDown";
import { CrmActivityService } from "../services";
import { ActionHeader } from '../utils/ActionHeader';

export class ActivityList extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            activities:{},
            searchParams:{}
        };
    }

    componentDidMount(){
        this.retrieveActivities(1)
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.serviceArea !== this.props.serviceArea){
            this.retrieveActivities(1)
        }
    }

    retrieveActivities(pageNumber){
        this.setState({busy: true});
        this.search(pageNumber)
    }

    handleView(data){
        this.context.router.push(`/ui/crm/activity/view/${data.id}`);
    }

    routeToActivityForm(){
        this.context.router.push(`/ui/crm/activity/new/${this.props.account.id}`);
    }

    showOrHideSearchPanel() {
        $(this.searchPanel).slideToggle('slow');
    }

    getActionHeaderTools(){
        let actionHeaderTools = [];
        actionHeaderTools.push({icon: "search", flat: true, items: [{label: "", onclick: () => this.showOrHideSearchPanel()}]});
        actionHeaderTools.push({title: "New Activity", items: [{label: "", onclick: () => this.routeToActivityForm()}]})
        return actionHeaderTools;
    }

    clearSearchParams() {
        this.setState({
            searchParams: {
                page: 0,
                accountId: this.props.account.id
            }
        });
    }

    updateSearchParams(propertyKey, propertyValue) {
        let searchParams = _.cloneDeep(this.state.searchParams);
        _.set(searchParams, propertyKey, propertyValue);
        this.setState({searchParams: searchParams});
    }

    search(pageNumber) {

        let searchParams = _.cloneDeep(this.state.searchParams);
        let params = {
            page: pageNumber - 1,
            accountId:this.props.account.id
        };

        if (!_.isEmpty(searchParams.minStartDate) && !DateTimeUtils.isDateTimeComplete(searchParams.minStartDate)) {
            Notify.showError("Time part of min start date must be specified.");
            return;
        }

        if (!_.isEmpty(searchParams.maxStartDate) && !DateTimeUtils.isDateTimeComplete(searchParams.maxStartDate)) {
            Notify.showError("Time part of max start date must be specified.");
            return;
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
                activities:response.data,
                pageNumber: response.data.page+1,
                pageCount: response.data.totalPages,
                busy: false
            });
        }).catch(error => {
            Notify.showError(error);
        });
    }

    renderSearchPanel() {
        return (
            <div ref={c=>this.searchPanel=c} style={{display:"none"}}>
                <Grid>
                    <GridCell width="1-1">
                        <HeaderWithBackground title="Activity Search" icon="close"
                                                onIconClick={() => this.showOrHideSearchPanel()}/>
                    </GridCell>
                    <GridCell width="1-4">
                        <ActivityScopeDropDown label="Scope"
                                                value={this.state.searchParams.scope}
                                                translate={true}
                                                onchange={(value) => this.updateSearchParams("scope", value)}/>
                    </GridCell>
                    <GridCell width="1-4">
                        <ActivityToolDropDown label="Tool"
                                                value={this.state.searchParams.tool}
                                                translate={true}
                                                onchange={(value) => this.updateSearchParams("tool", value)}/>
                    </GridCell>
                    <GridCell width="1-4">
                        <DateSelector label="Min Creation Date"
                                        value={this.state.searchParams.minCreationDate}
                                        onchange={(value) => this.updateSearchParams("minCreationDate", value)}/>
                    </GridCell>
                    <GridCell width="1-4">
                        <DateSelector label="Max Creation Date"
                                        value={this.state.searchParams.maxCreationDate}
                                        onchange={(value) => this.updateSearchParams("maxCreationDate", value)}/>
                    </GridCell>
                    <GridCell width="1-4">
                        <ActivityStatusDropDown label="Status"
                                                value={this.state.searchParams.status}
                                                translate={true}
                                                onchange={(value) => this.updateSearchParams("status", value)}/>
                    </GridCell>
                    <GridCell width="3-8">
                        <DateTime label="Min Start Date"
                                    value={this.state.searchParams.minStartDate}
                                    onchange={(value) => this.updateSearchParams("minStartDate", value)}/>
                    </GridCell>
                    <GridCell width="3-8">
                        <DateTime label="Max Start Date"
                                    value={this.state.searchParams.maxStartDate}
                                    onchange={(value) => this.updateSearchParams("maxStartDate", value)}/>
                    </GridCell>
                    <GridCell width="1-1">
                        <div className="uk-align-right">
                            <Button label="Clear" onclick={() => this.clearSearchParams()}/>
                            <Button label="Search" onclick={() => this.search(1)}/>
                        </div>
                    </GridCell>
                </Grid>
            </div>
        );
    }

    renderDataTable() {
        let content;
        if (_.isEmpty(this.state.activities)) {
            return (
                <Grid divider={true}>
                    <GridCell width="1-1" margin="small">
                        {super.translate("No activity")}
                    </GridCell>
                </Grid>
            )
        } else {
            content = (
                <DataTable.Table data={this.state.activities.content}>
                    <DataTable.Text field="createdBy" header="Created By" width="20" reRender={true}
                                    printer={new UserPrinter(this.context.getAllUsers())}/>
                    <DataTable.Text header="Status" translator={this} field="status"
                                    printer={new StatusPrinter(this.context.translator)}/>
                    <DataTable.Text field="serviceAreas" header="Service Areas" width="20"
                                    printer={new ListPrinter(this)}/>
                    <DataTable.Text field="type.name" header="Type" translator={this} width="10"/>
                    <DataTable.Text field="scope.name" header="Scope" translator={this} width="20"/>
                    <DataTable.Text header="Tool" reader={new ToolReader("tool.name")}
                                    printer={new ToolPrinter(this.context.translator)} width="20"/>
                    <DataTable.Text header="Start Date" field="calendar.startDate" printer={new DatePrinter()}
                                    width="15"/>
                    <DataTable.Text header="End Date" field="calendar.endDate" printer={new DatePrinter()} width="10"/>
                    <DataTable.ActionColumn>
                        <DataTable.ActionWrapper key="viewActivity" track="onclick"
                                                 onaction={(data) => this.handleView(data)}>
                            <Button icon="eye" size="small"/>
                        </DataTable.ActionWrapper>
                    </DataTable.ActionColumn>
                </DataTable.Table>
            );
        }

        return (
           <div>
                {content}
                <Pagination totalElements={this.state.activities.totalElements}
                            page={this.state.activities.number + 1}
                            totalPages={this.state.activities.totalPages}
                            onPageChange={(pageNumber) => this.search(pageNumber)}
                            range={10}/>
            </div>
        );
    }

    render() {
        return (
            <div>
                {this.renderSearchPanel()}
                <ActionHeader title="Activities" tools={this.getActionHeaderTools()} className="uk-accordion-title"/>
                <div className="uk-accordion-content uk-accordion-initial-open">
                    <LoaderWrapper busy={this.state.busy} title="" size="S">
                        {this.renderDataTable()}
                    </LoaderWrapper>
                </div>
            </div>

        );
    }
}

ActivityList.contextTypes = {
    getUsers: React.PropTypes.func,
    getAllUsers: React.PropTypes.func,
    router: PropTypes.object.isRequired,
    translator: PropTypes.object,
    user: PropTypes.object
};

class ListPrinter{
    constructor(translator) {
        this.translator=translator;
    }
    translate(text){
        return this.translator ? this.translator.translate(text) : text;
    }
    print(data){
        return <span>{_.join(data.map(item => (this.translate(item.code))), ' ,')}</span>
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

class UserPrinter{
    constructor(users) {
        this.userList = users || [];
    }
    print(data){
        return _.get(_.find(this.userList, u=>u.username == data),'displayName');
    }  
}