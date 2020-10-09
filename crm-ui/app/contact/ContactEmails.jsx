import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {Loader} from "susam-components/layout";
import {DropDown} from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';

import {Email} from '../common';
import {EmailUtils} from '../utils';

export class ContactEmails extends TranslatingComponent {
    constructor(props){
        super(props);
        this.state = {emails: []};
    }

    componentDidMount(){

    }

    handleRowDelete(item){
        this.props.ondelete && this.props.ondelete(item);
    }
    handleRowUpdate(item){
        this.props.onupdate && this.props.onupdate(item);
    }
    handleRowCreate(item){
        this.props.oncreate && this.props.oncreate(item);
    }

    render(){
        if(!this.props.usageTypes){
            return <Loader size="M"/>;
        }
        return (
            <DataTable.Table data={this.props.emails} title="Emails"
                             editable = {true} insertable = {true} filterable = {false} sortable = {true} deletable = {true}
                             ondelete = {(data) => this.handleRowDelete(data)}
                             onupdate = {(data) => this.handleRowUpdate(data)}
                             oncreate = {(data) => this.handleRowCreate(data)}>
                <DataTable.Badge header="Usage" required={true} width="25" reader = {new UsageTypeReader()} defaultValue={_.find(this.props.usageTypes, {code: 'WORK'})}>
                    <DataTable.EditWrapper >
                        <DropDown options = {this.props.usageTypes} valueField = "code" translate={true}/>
                    </DataTable.EditWrapper>
                </DataTable.Badge>
                <DataTable.Bool field="default" header="Is Default" width="15"/>
                <DataTable.Text header="Email" width="60" reader = {new EmailReader()} printer = {new EmailPrinter()}>
                    <DataTable.EditWrapper>
                        <Email />
                    </DataTable.EditWrapper>
                </DataTable.Text>
            </DataTable.Table>
        );
    }
}

class UsageTypeReader{
    readCellValue(row) {
        if(!row.usageType){
            return "";
        }
        return row.usageType.code;
    }
    readSortValue(row) {
        if(!row.usageType){
            return "";
        }
        return row.usageType.code;
    }
    setValue(row, value){
        row.usageType = value;
    }
}
class EmailPrinter{
    print(data) {
        if(!data){
            return "";
        }
        let className = "";
        if(!data._valid){
            className = "uk-text-danger";
        }
        return <span className={className}>{EmailUtils.format(data)}</span>;
    }

}
class EmailReader{
    readCellValue(row) {
        return row.email;
    }
    readSortValue(row) {
        if(!row.email){
            return "";
        }
        return EmailUtils.format(row.email);
    }
    setValue(row, value){
        row.email = value;
    }
}