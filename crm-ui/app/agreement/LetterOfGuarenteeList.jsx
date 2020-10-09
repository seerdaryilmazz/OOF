import React from "react";
import {TranslatingComponent} from 'susam-components/abstract';
import _ from "lodash";
import uuid from 'uuid';
import { Card, Grid, GridCell, LoaderWrapper, Modal } from 'susam-components/layout';
import { ActionHeader, StringUtils } from "../utils";
import { LetterOfGuarentee } from "./index";
import { Button } from "susam-components/basic";
import * as DataTable from 'susam-components/datatable';

export class LetterOfGuarenteeList extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {};
    }

    updateState(key, value, callback) {
        let setStateCallback = () => {
            if (callback) {
                callback();
            }
        };
        let state = _.cloneDeep(this.state);
        _.set(state, key, value);
        this.setState(state, setStateCallback);
    }

    handleChange(letterOfGuarentees) {
        let keyValuePairs = [{key: "letterOfGuarentees", value: letterOfGuarentees}];
        this.props.onChange(keyValuePairs);
    }

    validateLetterOfGuarenteeForm() {
        return this.letterOfGuarenteeForm.validate();
    }

    closeLetterOfGuarenteeForm() {
        let state = _.cloneDeep(this.state);
        state.letterOfGuarentee = undefined;
        this.setState(state, this.letterOfGuarenteeModal.close());
    }

    addLetterOfGuarentee() {
        if (this.validateLetterOfGuarenteeForm()) {
            let letterOfGuarentees = _.cloneDeep(this.props.agreement.letterOfGuarentees);
            if (!letterOfGuarentees) {
                letterOfGuarentees = [];
            }
            let letterOfGuarentee = this.state.letterOfGuarentee;
            letterOfGuarentee._key = uuid.v4();
            letterOfGuarentees.push(letterOfGuarentee);
            this.letterOfGuarenteeModal.close();
            this.updateState("letterOfGuarentee", undefined, () => {
                this.handleChange(letterOfGuarentees)
            });
        }
    }

    updateLetterOfGuarentee(letterOfGuarentee) {
        if (this.validateLetterOfGuarenteeForm()) {
            let letterOfGuarentees = _.cloneDeep(this.props.agreement.letterOfGuarentees);
            if (letterOfGuarentees) {
                const index = letterOfGuarentee.id ?
                    letterOfGuarentees.findIndex(item => item.id === letterOfGuarentee.id)
                    :
                    letterOfGuarentees.findIndex(item => item._key === letterOfGuarentee._key);
                if (index !== -1) {
                    letterOfGuarentees[index] = letterOfGuarentee;
                    this.updateState("letterOfGuarentee", undefined, () => {
                        this.handleChange(letterOfGuarentees)
                    });
                }
            }
            this.letterOfGuarenteeModal && this.letterOfGuarenteeModal.close();
        }
    }

    openLetterOfGuarenteeForm(letterOfGuarentee) {
        let state = _.cloneDeep(this.state);
        if (letterOfGuarentee) {
            state.letterOfGuarentee = letterOfGuarentee;
        }
        else {
            state.letterOfGuarentee = {};
        }
        this.setState(state, () => {this.letterOfGuarenteeModal.open()});
    }

    removeLetterOfGuarentee(letterOfGuarentee) {
        let letterOfGuarentees = _.cloneDeep(this.props.agreement.letterOfGuarentees);
        if (letterOfGuarentees) {
            const index = letterOfGuarentees.findIndex(letterOfGuarenteeItem => letterOfGuarenteeItem._key === letterOfGuarentee._key);
            if (index !== -1) {
                letterOfGuarentees.splice(index, 1);
                this.updateState("letterOfGuarentee", null, () => {
                    this.handleChange(letterOfGuarentees);
                });
            }
        }
    }

    getLetterOfGuarenteeForm() {
        if (this.state.letterOfGuarentee) {
            return <LetterOfGuarentee ref={c => this.letterOfGuarenteeForm = c}
                                      letterOfGuarentee={this.state.letterOfGuarentee || undefined}
                                      onChange={(value) => this.updateState("letterOfGuarentee", value)}/>;
        }
        return null;
    }

    renderLetterOfGuarenteeForm() {
        return(
            <Modal ref={(c) => this.letterOfGuarenteeModal = c}
                   title="Letter Of Guarentee Detail"
                   medium={true}
                   closeOnBackgroundClicked={false}
                   actions={[
                       {label: "SAVE", buttonStyle:"success", flat:false, action: () => {this.state.letterOfGuarentee && this.state.letterOfGuarentee._key ? this.updateLetterOfGuarentee(this.state.letterOfGuarentee) : this.addLetterOfGuarentee()}},
                       {label: "CLOSE", buttonStyle:"danger", flat:false, action: () => this.closeLetterOfGuarenteeForm()}]}>
                {this.getLetterOfGuarenteeForm()}
            </Modal>
        );
    }

    renderDataTable() {
        if (!this.props.agreement) {
            return null;
        }
        return(
            <Grid divider = {true}>
                <GridCell width="1-1" margin="small">
                    <DataTable.Table data={this.props.agreement.letterOfGuarentees}>
                        <DataTable.Numeric field="contractAmount" header="Amount" width="12" printer={new NumericPrinter(2)}/>
                        <DataTable.Text header="Currency" translator={this} field="currency"/>
                        <DataTable.Text header="Validity Start Date" field="validityStartDate"/>
                        <DataTable.Text header="Validity End Date" field="validityEndDate"/>
                        <DataTable.Text header="Scope" maxLength="40" field="scope" printer={new ScopePrinter()}/>
                        <DataTable.ActionColumn width={2}>
                            <DataTable.ActionWrapper shouldRender = {() => !this.props.readOnly} key="editLetterOfGuarentee" track="onclick"
                                                     onaction = {(data) => this.openLetterOfGuarenteeForm(data)}>
                                <Button icon="pencil" size="small" width={1}/>
                            </DataTable.ActionWrapper>
                            <DataTable.ActionWrapper shouldRender = {() => !this.props.readOnly} key="deleteLetterOfGuarentee" track="onclick"
                                                     onaction = {(data) => this.removeLetterOfGuarentee(data)}>
                                <Button icon="close" size="small" width={1}/>
                            </DataTable.ActionWrapper>
                        </DataTable.ActionColumn>
                    </DataTable.Table>
                </GridCell>
                {this.renderLetterOfGuarenteeForm()}
            </Grid>
        );
    }

    render() {
        return(
            <Card>
                <ActionHeader title="Letter Of Guarantee" readOnly={this.props.readOnly} removeTopMargin={true}
                              tools={[{title: "Add", items: [{label: "", onclick: () => this.openLetterOfGuarenteeForm()}]}]} />
                <LoaderWrapper busy = {this.state.busy} title="" size = "S">
                    {this.renderDataTable()}
                </LoaderWrapper>
            </Card>
        );
    }
}

class ScopePrinter {
    constructor(){
    }
    print(data){
        if(data && data.length>35){
            data = data.substring(0, 32) + "...";
        }
        return data;
    }
}

class NumericPrinter {

    constructor(scale) {
        this.scale = scale;
        this.displayData = "---";
    }

    print(data) {
        if (data || data === 0) {
            if (this.scale || this.scale === 0) {
                this.displayData = StringUtils.formatNumber(Number(data),this.scale);
            } else {
                this.displayData = data;
            }
            return (<span>{this.displayData}</span>)
        }
    }
}