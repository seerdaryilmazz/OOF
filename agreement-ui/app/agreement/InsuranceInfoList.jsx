import React from "react";
import {TranslatingComponent} from 'susam-components/abstract';
import _ from "lodash";
import uuid from 'uuid';
import { Card, Grid, GridCell, LoaderWrapper, Modal } from 'susam-components/layout';
import { ActionHeader, StringUtils } from "../utils";
import { Button } from "susam-components/basic";
import * as DataTable from 'susam-components/datatable';
import {InsuranceInfo} from "./InsuranceInfo";
import {Notify} from "susam-components/basic";

export class InsuranceInfoList extends TranslatingComponent {

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

    handleChange(insuranceInfos) {
        let keyValuePairs = [{key: "insuranceInfos", value: insuranceInfos}];
        this.props.onChange(keyValuePairs);
    }

    validateInsuranceInfoForm() {
        return this.insuranceInfoForm.validate();
    }

    closeInsuranceInfoForm() {
        let state = _.cloneDeep(this.state);
        state.insuranceInfo = undefined;
        this.setState(state, this.insuranceInfoModal.close());
    }

    addInsuranceInfo() {
        if (this.validateInsuranceInfoForm()) {
            let insuranceInfos = _.cloneDeep(this.props.agreement.insuranceInfos);
            if (!insuranceInfos) {
                insuranceInfos = [];
            }
            let insuranceInfo = this.state.insuranceInfo;
            insuranceInfo._key = uuid.v4();
            insuranceInfos.push(insuranceInfo);
            this.insuranceInfoModal.close();
            this.updateState("insuranceInfo", undefined, () => {
                this.handleChange(insuranceInfos)
            });
        }
    }

    updateInsuranceInfo(insuranceInfo) {
        if (this.validateInsuranceInfoForm()) {
            let insuranceInfos = _.cloneDeep(this.props.agreement.insuranceInfos);
            if (insuranceInfos) {
                const index = insuranceInfo.id ?
                    insuranceInfos.findIndex(item => item.id === insuranceInfo.id)
                    :
                    insuranceInfos.findIndex(item => item._key === insuranceInfo._key);
                if (index !== -1) {
                    insuranceInfos[index] = insuranceInfo;
                    this.updateState("insuranceInfo", undefined, () => {
                        this.handleChange(insuranceInfos)
                    });
                }
            }
            this.insuranceInfoModal && this.insuranceInfoModal.close();
        }
    }

    openInsuranceInfoForm(insuranceInfo) {
        let state = _.cloneDeep(this.state);
        if (insuranceInfo) {
            state.insuranceInfo = insuranceInfo;
        }
        else {
            state.insuranceInfo = {};
        }
        this.setState(state, () => {this.insuranceInfoModal.open()});
    }

    removeInsuranceInfo(insuranceInfo) {
        let insuranceInfos = _.cloneDeep(this.props.agreement.insuranceInfos);
        if (insuranceInfos) {
            const index = insuranceInfos.findIndex(insuranceInfoItem => insuranceInfoItem._key === insuranceInfo._key);
            if (index !== -1) {
                insuranceInfos.splice(index, 1);
                this.updateState("insuranceInfo", null, () => {
                    this.handleChange(insuranceInfos);
                });
            }
        }
    }

    getInsuranceInfoForm() {
        if (this.state.insuranceInfo) {
            return <InsuranceInfo ref={c => this.insuranceInfoForm = c}
                                  insuranceInfo={this.state.insuranceInfo || undefined}
                                  onChange={(value) => this.updateState("insuranceInfo", value)}/>;
        }
        return null;
    }

    renderInsuranceInfoForm() {
        return(
            <Modal ref={(c) => this.insuranceInfoModal = c}
                   title="Insurance Info Detail"
                   medium={true}
                   closeOnBackgroundClicked={false}
                   actions={[
                       {label: "SAVE", buttonStyle:"success", flat:false, action: () => {this.state.insuranceInfo && this.state.insuranceInfo._key ? this.updateInsuranceInfo(this.state.insuranceInfo) : this.addInsuranceInfo()}},
                       {label: "CLOSE", buttonStyle:"danger", flat:false, action: () => this.closeInsuranceInfoForm()}]}>
                {this.getInsuranceInfoForm()}
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
                    <DataTable.Table data={this.props.agreement.insuranceInfos}>
                        <DataTable.Text header="Type" field="insuranceType.name"/>
                        <DataTable.Text header="Insured By" field="insuredBy.name"/>
                        <DataTable.Text header="Validity Start Date" field="validityStartDate"/>
                        <DataTable.Text header="Validity End Date" field="validityEndDate"/>
                        <DataTable.Text header="Exemption Limit" field="exemptionLimit" printer={new NumericPrinter(2)}/>
                        <DataTable.Text header="Currency" field="currency"/>
                        <DataTable.ActionColumn width={2}>
                            <DataTable.ActionWrapper shouldRender = {() => !this.props.readOnly} key="editInsuranceInfo" track="onclick"
                                                     onaction = {(data) => this.openInsuranceInfoForm(data)}>
                                <Button icon="pencil" size="small" width={1}/>
                            </DataTable.ActionWrapper>
                            <DataTable.ActionWrapper shouldRender = {() => !this.props.readOnly} key="deleteInsuranceInfo" track="onclick"
                                                     onaction = {(data) => this.removeInsuranceInfo(data)}>
                                <Button icon="close" size="small" width={1}/>
                            </DataTable.ActionWrapper>
                        </DataTable.ActionColumn>
                    </DataTable.Table>
                </GridCell>
            </Grid>
        );
    }

    render() {
        return(
            <Card>
                <ActionHeader title="Insurance Info" readOnly={this.props.readOnly} removeTopMargin={true}
                              tools={[{title: "Add", items: [{label: "", onclick: () => this.openInsuranceInfoForm()}]}]} />
                <LoaderWrapper busy = {this.state.busy} title="" size = "S">
                    {this.renderDataTable()}
                </LoaderWrapper>
                {this.renderInsuranceInfoForm()}
            </Card>
        );
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