import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {Loader} from "susam-components/layout";
import * as DataTable from 'susam-components/datatable';

import {PhoneNumber} from '../../PhoneNumber';
import {PhoneNumberUtils} from '../../../utils/PhoneNumberUtils';

export class ContactPhoneNumbers extends TranslatingComponent {
    constructor(props){
        super(props);
        this.state = {phoneNumbers: []};
    }

    componentDidMount(){

    }
    componentDidReceiveProps(nextProps){

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
        if(!this.props.phoneTypes || !this.props.usageTypes){
            return <Loader size="M"/>;
        }
        return (

                    <DataTable.Table data={this.props.phoneNumbers} title="Phone Numbers"
                                     editable = {true} insertable = {true} filterable = {false} sortable = {true} deletable = {true}
                                     ondelete = {(data) => this.handleRowDelete(data)}
                                     onupdate = {(data) => this.handleRowUpdate(data)}
                                     oncreate = {(data) => this.handleRowCreate(data)}>
                        <DataTable.Lookup header="Type" width="25" translate={true} postTranslationCaseConverter={1} field="numberType" options = {this.props.phoneTypes} required = {true}/>
                        <DataTable.Lookup header="Usage" width="25" translate={true} field="usageType" defaultValue={_.find(this.props.usageTypes, {code: 'WORK'})} options = {this.props.usageTypes} required = {true}/>
                        <DataTable.Bool field="default" header="Is Default" width="10"/>
                        <DataTable.Text header="Number" width="40" reader = {new PhoneNumberReader()} printer = {new PhoneNumberPrinter()}>
                            <DataTable.EditWrapper >
                                <PhoneNumber showExtension = {true} countryCode = {this.props.country.phoneCode} required = {true}/>
                            </DataTable.EditWrapper>
                        </DataTable.Text>
                    </DataTable.Table>

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