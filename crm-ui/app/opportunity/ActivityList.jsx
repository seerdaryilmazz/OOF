import _ from "lodash";
import PropTypes from 'prop-types';
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, Notify } from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';
import { Grid, GridCell, HeaderWithBackground, LoaderWrapper, Pagination, Card } from "susam-components/layout";
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
        if(this.props.opportunityId){
            this.retrieveActivities(1)
        }
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.serviceArea !== this.props.serviceArea){
            this.retrieveActivities(1)
        }
    }

    componentDidUpdate(prevProps){
        if(prevProps.opportunityId != this.props.opportunityId){
            this.retrieveActivities(1);
        }
    }

    retrieveActivities(pageNumber){
        this.setState({busy: true});
        this.search(pageNumber)
    }

    handleView(data){
        this.context.router.push(`/ui/crm/activity/view/${data.id}`);
    }

    getActionHeaderTools(){
        return [];
    }

    search(pageNumber) {
        let params = {
            page: pageNumber - 1,
            activityAttributeKey: "opportunity",
            activityAttributeValue: _.toString(this.props.opportunityId)
        };

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

    renderDataTable() {
        if (!this.props.opportunityId) {
            return null
        } else {
            return (
                <Grid divider={true}>
                    <GridCell width="1-1">
                        <DataTable.Table data={this.state.activities.content}>
                            <DataTable.Text field="createdBy" header="Created By" width="20" reRender={true}
                                            printer={new UserPrinter(this.context.getUsers())}/>
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
                            <DataTable.Text header="End Date" field="calendar.endDate" printer={new DatePrinter()}
                                            width="10"/>
                            <DataTable.ActionColumn>
                                <DataTable.ActionWrapper key="viewActivity" track="onclick"
                                                         onaction={(data) => this.handleView(data)}>
                                    <Button icon="eye" size="small"/>
                                </DataTable.ActionWrapper>
                            </DataTable.ActionColumn>
                        </DataTable.Table>
                    </GridCell>
                    <GridCell width="1-1">
                        <Pagination totalElements={this.state.activities.totalElements}
                                    page={this.state.activities.number + 1}
                                    totalPages={this.state.activities.totalPages}
                                    onPageChange={(pageNumber) => this.search(pageNumber)}
                                    range={10}/>
                    </GridCell>
                </Grid>
            )
        }
    }

    render() {
        if(!this.props.readOnly){
            return null;
        }
        return (
            <Card>
                <ActionHeader title="Activities" tools={this.getActionHeaderTools()} removeTopMargin={true}/>
                <LoaderWrapper busy={this.state.busy} title="" size="S">
                    {this.renderDataTable()}
                </LoaderWrapper>
            </Card>

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