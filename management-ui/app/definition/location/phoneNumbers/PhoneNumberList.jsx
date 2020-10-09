import React from "react";
import _ from "lodash";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, Wizard, Loader} from "susam-components/layout";
import {Notify, TextInput, Button, DropDown, Checkbox} from 'susam-components/basic';
import {NumericInput} from 'susam-components/advanced';

import * as DataTable from 'susam-components/datatable';

import {PhoneNumberUtils} from 'susam-components/utils';
import uuid from "uuid";

export class PhoneNumberList extends TranslatingComponent {
    constructor(props){
        super(props);
        this.state = {};
    }

    handleClickEdit(phoneNumber){
        this.setState({phoneNumberToEdit: phoneNumber});
    }

    handleClickDelete(phoneNumber){
        UIkit.modal.confirm("Are you sure ?", () => this.deletePhoneNumber(phoneNumber));
    }
    deletePhoneNumber(phoneNumber){
        let phoneNumbers = _.cloneDeep(this.props.phoneNumbers);
        _.remove(phoneNumbers, {_key: phoneNumber._key});
        this.props.onChange && this.props.onChange(phoneNumbers);
    }

    updateState(key, value) {
        let phoneNumberToEdit = _.cloneDeep(this.state.phoneNumberToEdit);
        _.set(phoneNumberToEdit, key, value);
        this.setState({phoneNumberToEdit: phoneNumberToEdit});
    }

    handleClickSave(){
        let phoneNumberToEdit = _.cloneDeep(this.state.phoneNumberToEdit);
        PhoneNumberUtils.setIsValid(phoneNumberToEdit.phoneNumber);
        if(!phoneNumberToEdit.phoneNumber._valid){
            Notify.showError("Please check phone number format");
            return;
        }
        let phoneNumbers = [];
        if(phoneNumberToEdit._key){
            phoneNumbers = this.updatePhoneNumber(phoneNumberToEdit);
        }else{
            phoneNumbers = this.addPhoneNumber(phoneNumberToEdit);
        }
        this.setState({phoneNumberToEdit: null}, () => {
            this.props.onChange && this.props.onChange(phoneNumbers);
        });

    }
    addPhoneNumber(phoneNumber){
        let phoneNumbers = _.cloneDeep(this.props.phoneNumbers);
        phoneNumber._key = uuid.v4();
        phoneNumbers.push(phoneNumber);
        return phoneNumbers;
    }
    updatePhoneNumber(phoneNumber){
        let phoneNumbers = _.cloneDeep(this.props.phoneNumbers);
        let index = _.findIndex(phoneNumbers, {_key: phoneNumber._key});
        if(index >= 0){
            phoneNumbers[index] = phoneNumber;
        }
        return phoneNumbers;
    }
    createNewPhoneNumber(){
        return {
            phoneNumber: {
                countryCode: this.props.country ? this.props.country.phoneCode : ""
            }
        };
    }

    renderPhoneNumberEdit(){
        if(this.state.phoneNumberToEdit){
            return (
                <Grid>
                    <GridCell width = "1-5">
                        <DropDown label = "Type" options = {this.props.phoneTypes}
                                  value = {this.state.phoneNumberToEdit.phoneType}
                                  onchange = {(value) => this.updateState("phoneType", value)} />
                    </GridCell>
                    <GridCell width = "1-5">
                        <div className = "uk-margin-top">
                            <Checkbox label = "Default" value = {this.state.phoneNumberToEdit.default}
                                      onchange = {(value) => this.updateState("default", value)}/>
                        </div>
                    </GridCell>
                    <GridCell width = "2-5">
                        <PhoneNumber value = {this.state.phoneNumberToEdit.phoneNumber} showExtension = {this.props.showExtension}
                                     onChange = {(value) => this.updateState("phoneNumber", value)}/>
                    </GridCell>
                    <GridCell width = "1-5">
                        <div className = "uk-margin-top">
                            <Button label = "save" style = "success" size = "small"
                                    onclick = {() => this.handleClickSave()} />
                        </div>
                    </GridCell>
                </Grid>
            );
        }
        return (
            <div className = "ul-align-right">
                <Button label = "add phone number" flat = {true} style = "success" size = "small"
                        onclick = {() => this.handleClickEdit(this.createNewPhoneNumber())} />
            </div>
        );
    }

    render(){
        if(!this.props.phoneTypes){
            return <Loader size="M"/>;
        }
        return (
            <Grid>
                <GridCell width="1-1">
                    {this.renderPhoneNumberEdit()}
                </GridCell>
                <GridCell width="1-1">
                    <DataTable.Table data={this.props.phoneNumbers} title="Phone Numbers"
                                     filterable = {false} sortable = {false}>
                        <DataTable.Lookup header="Type" width="25" field="phoneType" required = {true}/>
                        <DataTable.Bool field="default" header="Is Default" width="10"/>
                        <DataTable.Text header="Number" width="40" reader = {new PhoneNumberReader()} printer = {new PhoneNumberPrinter()} />
                        <DataTable.ActionColumn width="20">
                            <DataTable.ActionWrapper track="onclick" disabled = {this.props.readOnly}
                                                     onaction={(data) => this.handleClickEdit(data)}>
                                <Button label="Edit" flat={true} style="success" size="small"/>
                            </DataTable.ActionWrapper>
                            <DataTable.ActionWrapper track="onclick" disabled = {this.props.readOnly}
                                                     onaction={(data) => this.handleClickDelete(data)}>
                                <Button label="Delete" flat={true} style="danger" size="small"/>
                            </DataTable.ActionWrapper>
                        </DataTable.ActionColumn>
                    </DataTable.Table>
                </GridCell>
            </Grid>
        );
    }
}

export class PhoneNumber extends TranslatingComponent{
    constructor(props){
        super(props);
    }

    update(key, value){
        let phoneNumber = _.cloneDeep(this.props.value);
        phoneNumber[key] = value;
        this.props.onChange && this.props.onChange(phoneNumber);
    }

    render(){
        let value = this.props.value;
        let countryInput = <NumericInput value = {value.countryCode} onchange = {(value) => this.update("countryCode", value)}
                                         required = {this.props.required} placeholder="Country Code"
                                         validationGroup={this.props.validationGroup}/>;
        let regionCodeInput = <NumericInput value = {value.regionCode} onchange = {(value) => this.update("regionCode", value)}
                                            required = {this.props.required} placeholder="Area Code"
                                            validationGroup={this.props.validationGroup}/>;
        let numberInput = <NumericInput value = {value.phone} onchange = {(value) => this.update("phone", value)}
                                        required = {this.props.required} placeholder="Phone Nr"
                                        validationGroup={this.props.validationGroup}/>;
        let extensionInput = "";
        let width = "5";
        if(this.props.showExtension){
            width = "6";
            extensionInput = <GridCell width={"1-" + width}>
                <NumericInput value = {value.extension} onchange = {(value) => this.update("extension", value)} placeholder="Ext" />
            </GridCell>;
        }

        return (
            <Grid collapse = {true}>
                <GridCell width={"1-" + width}>{countryInput}</GridCell>
                <GridCell width={"1-" + width}>{regionCodeInput}</GridCell>
                <GridCell width={"3-" + width}>{numberInput}</GridCell>
                {extensionInput}
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