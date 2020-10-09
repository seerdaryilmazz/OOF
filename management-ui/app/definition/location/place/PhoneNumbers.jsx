import React from "react";
import _ from "lodash";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, Wizard, Loader} from "susam-components/layout";
import {Notify, TextInput, Button, DropDown, Checkbox} from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';

import {PhoneNumber} from './PhoneNumber';
import {PhoneNumberUtils} from 'susam-components/utils';

export class PhoneNumbers extends TranslatingComponent {
    constructor(props){
        super(props);
        this.state = {};
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
        if(!this.props.phoneTypes){
            return <Loader size="M"/>;
        }

        let country = this.props.country;
        return (
            <Grid>
                <GridCell width="1-1">
                    <DataTable.Table data={this.props.phoneNumbers} title="Phone Numbers"
                                     editable = {!this.props.readOnly} insertable = {!this.props.readOnly} deletable = {!this.props.readOnly}
                                     filterable = {false} sortable = {true}
                                     ondelete = {(data) => this.handleRowDelete(data)}
                                     onupdate = {(data) => this.handleRowUpdate(data)}
                                     oncreate = {(data) => this.handleRowCreate(data)}>
                        <DataTable.Lookup header="Type" width="25" field="phoneType" options = {this.props.phoneTypes} required = {true}/>
                        <DataTable.Bool field="default" header="Is Default" width="10"/>
                        <DataTable.Text header="Number" width="40" reader = {new PhoneNumberReader()} printer = {new PhoneNumberPrinter()}>
                            <DataTable.EditWrapper >
                                <PhoneNumber countryCode = {country ? country.phoneCode : null} required = {true}/>
                            </DataTable.EditWrapper>
                        </DataTable.Text>
                    </DataTable.Table>
                </GridCell>
            </Grid>
        );
    }
}

class PhoneNumberPrinter{
    print(data) {
        if(!data){
            return "";
        }
        let formatted = PhoneNumberUtils.format(data);
        let className = "";
        if(!data._valid){
            className = "uk-text-danger";
        }
        return <span className={className}>{formatted}</span>
    }

}
class PhoneNumberReader{
    readCellValue(row) {
        return row.phoneNumber;
    }
    readSortValue(row) {
        if(!row.phoneNumber){
            return "";
        }
        return PhoneNumberUtils.format(row.phoneNumber);
    }
    setValue(row, value){
        row.phoneNumber = value;
    }
}