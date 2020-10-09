import React from "react";
import _ from "lodash";
import PropTypes from "prop-types";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, Wizard, Loader} from "susam-components/layout";
import {Notify, TextInput, Button, DropDown, Checkbox} from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';

import {PhoneNumber} from '../../PhoneNumber';
import {PhoneNumberUtils} from '../../../utils/PhoneNumberUtils';
import {LookupService} from '../../../services/KartoteksService';

export class LocationPhoneNumbers extends TranslatingComponent {
    constructor(props){
        super(props);
        this.state = {};
    }

    componentDidMount(){
        this.initializeLookups();
        this.guessRegionCode(this.props.phoneNumbers);
    }
    componentDidReceiveProps(nextProps){
        this.guessRegionCode(nextProps.phoneNumbers);
    }

    initializeLookups(){
        LookupService.getPhoneTypeList().then(response => {
            this.setState({phoneTypes: response.data});
        }).catch(error => {
            Notify.showError(error);
        });
    }
    guessRegionCode(phoneNumbers){
        let regionCodes = _.map(phoneNumbers, "phoneNumber.regionCode");
        let grouped = _.groupBy(regionCodes, item => item.trim());
        let max = 0;
        let selected = "";
        _.forEach(grouped, (value, key) => {
            if(value.length > max){
                max = value.length;
                selected = key;
            }
        });
        this.setState({defaultRegionCode: selected});
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
        if(!this.state.phoneTypes){
            return <Loader size="M"/>;
        }
        let phoneCode = this.props.country ? this.props.country.phoneCode : "";
        return (
            <Grid>
                <GridCell width="1-1">
                    <DataTable.Table data={this.props.phoneNumbers} title="Phone Numbers"
                                     editable = {true} insertable = {true} filterable = {false} sortable = {true} deletable = {true}
                                     ondelete = {(data) => this.handleRowDelete(data)}
                                     onupdate = {(data) => this.handleRowUpdate(data)}
                                     oncreate = {(data) => this.handleRowCreate(data)}>
                        <DataTable.Lookup header="Type" translate={true} postTranslationCaseConverter={1} width="25" field="numberType" options = {this.state.phoneTypes} required = {true}/>
                        <DataTable.Bool field="default" header="Is Default" width="10"/>
                        <DataTable.Text header="Number" width="40" reader = {new PhoneNumberReader()} printer = {new PhoneNumberPrinter()}>
                            <DataTable.EditWrapper >
                                <PhoneNumber countryCode = {phoneCode} regionCode = {this.state.defaultRegionCode} required = {true}/>
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
LocationPhoneNumbers.contextTypes = {
    translator: PropTypes.object
};
