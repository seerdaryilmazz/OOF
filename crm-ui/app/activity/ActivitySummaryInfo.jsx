import React from "react";
import {Card, Grid, GridCell, Pagination} from 'susam-components/layout';
import PropTypes from 'prop-types';
import { Button, Notify} from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';
import { TranslatingComponent } from "susam-components/abstract/TranslatingComponent";
import {CrmActivityService} from "../services";

export class ActivitySummaryInfo extends TranslatingComponent{

    constructor(props) {
        super(props);
        this.state={
            activities:{},
            searchParams:{}
        };
    }

    componentDidMount(){
    }

    handleView(data){
        this.context.router.push(`/ui/crm/activity/view/${data.id}`);
    }

    render(){
        return(
            <Grid divider = {true}>
            <GridCell width = "1-1" margin="small">
                <DataTable.Table data={this.props.activities}>
                    <DataTable.Text header="Merge Status" field="mergeStatus" printer={new MergeStatusPrinter(this)}/>
                    <DataTable.Text field="createdBy" header="Created By" width="20" reRender={true} printer={new UserPrinter(this.context.getUsers())}/>
                    <DataTable.Text header="Status" translator={this} field="status" printer={new StatusPrinter(this.context.translator)}/>
                    <DataTable.Text field="serviceAreas" header="Service Areas" width="20" printer={new ListPrinter(this)}/>
                    <DataTable.Text field="type.name" header="Type" translator={this} width="10"/>
                    <DataTable.Text field="scope.name" header="Scope" translator={this} width="20"/>
                    <DataTable.Text header="Tool" reader={new ToolReader("tool.name")} printer= {new ToolPrinter(this.context.translator)} width="20"/>
                    <DataTable.Text header="Start Date" field="calendar.startDate" printer={new DatePrinter()} width="15"/>
                    <DataTable.Text header="End Date" field="calendar.endDate" printer={new DatePrinter()} width="10"/>
                </DataTable.Table>
            </GridCell>
        </Grid>
        );
    }
}

ActivitySummaryInfo.contextTypes = {
    getUsers: React.PropTypes.func,
    getAllUsers: React.PropTypes.func,
    router: PropTypes.object.isRequired,
    translator: PropTypes.object,
    user: PropTypes.object
};

class UserPrinter{
    constructor(users) {
        this.userList = users || [];
    }
    print(data){
        return _.get(_.find(this.userList, u=>u.username == data),'displayName');
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

class MergeStatusPrinter{

    translate(text){
        return this.translator ? this.translator.translate(text) : text;
    }

    printUsingRow(row){
        if(row.mergeStatus == "OWN"){
            return <span className="uk-badge uk-badge-muted">{this.translate(_.capitalize(row.mergeStatus))}</span>
        }
        else if(row.mergeStatus == "ADDED") {
            return <span className="uk-badge md-bg-light-green-600">{this.translate(_.capitalize(row.mergeStatus))}</span>
        }
        else{
            return null;
        }
    }
}