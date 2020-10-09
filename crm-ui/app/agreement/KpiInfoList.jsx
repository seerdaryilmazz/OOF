import React from "react";
import {TranslatingComponent} from 'susam-components/abstract';
import _ from "lodash";
import { Card, Grid, GridCell, LoaderWrapper, Modal } from 'susam-components/layout';
import { ActionHeader } from "../utils";
import uuid from 'uuid';
import * as DataTable from 'susam-components/datatable';
import { Button } from "susam-components/basic";
import { KpiInfo } from "./index";

export class KpiInfoList extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {

    }

    validateKpiInfoForm() {
        return this.kpiInfoForm.validate();
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

    addKpiInfo() {
        if (this.validateKpiInfoForm()) {
            let kpiInfos = _.cloneDeep(this.props.agreement.kpiInfos);
            if (!kpiInfos) {
                kpiInfos = [];
            }
            let kpiInfo = this.state.kpiInfo;
            kpiInfo._key = uuid.v4();
            kpiInfos.push(kpiInfo);
            this.kpiInfoModal.close();
            this.updateState("kpiInfo", undefined, () => {
                this.handleChange(kpiInfos)
            });
        }
    }

    updateKpiInfo(kpiInfo) {
        if (this.validateKpiInfoForm()) {
            let kpiInfos = _.cloneDeep(this.props.agreement.kpiInfos);
            if (kpiInfos) {
                const index = kpiInfo.id ?
                    kpiInfos.findIndex(item => item.id === kpiInfo.id)
                    :
                    kpiInfos.findIndex(item => item._key === kpiInfo._key);
                if (index !== -1) {
                    kpiInfos[index] = kpiInfo;
                    this.updateState("kpiInfo", undefined, () => {
                        this.handleChange(kpiInfos)
                    });
                }
            }
            this.kpiInfoModal && this.kpiInfoModal.close();
        }
    }

    handleChange(kpiInfos) {
        let keyValuePairs = [{key: "kpiInfos", value: kpiInfos}];
        this.props.onChange(keyValuePairs);
    }

    openKpiInfoForm(kpiInfo) {
        let state = _.cloneDeep(this.state);
        if (kpiInfo) {
            state.kpiInfo = kpiInfo;
        }
        else {
            state.kpiInfo = {};
        }
        this.setState(state, () => {this.kpiInfoModal.open()});
    }

    closeKpiInfoForm(){
        let state = _.cloneDeep(this.state);
        state.kpiInfo = undefined;
        this.setState(state, this.kpiInfoModal.close());
    }

    removeKpiInfo(kpiInfo) {
        let kpiInfos = _.cloneDeep(this.props.agreement.kpiInfos);
        if (kpiInfos) {
            const index = kpiInfos.findIndex(kpi => kpi._key === kpiInfo._key);
            if (index !== -1) {
                kpiInfos.splice(index, 1);
                this.updateState("kpiInfo", null, () => {
                    this.handleChange(kpiInfos);
                });
            }
        }
    }

    getKpiInfoForm() {
        if (this.state.kpiInfo) {
            return <KpiInfo ref={c => this.kpiInfoForm = c}
                            kpiInfo={this.state.kpiInfo || undefined}
                            onChange={(value) => this.updateState("kpiInfo", value)}/>;
        }
        return null;
    }

    renderKpiInfoForm() {
        return(
            <Modal ref={(c) => this.kpiInfoModal = c}
                   title="KPI Info Detail"
                   medium={true}
                   closeOnBackgroundClicked={false}
                   actions={[
                       {label: "SAVE", buttonStyle:"success", flat:false, action: () => {this.state.kpiInfo && this.state.kpiInfo._key ? this.updateKpiInfo(this.state.kpiInfo) : this.addKpiInfo()}},
                       {label: "CLOSE", buttonStyle:"danger", flat:false, action: () => this.closeKpiInfoForm()}]}>
                {this.getKpiInfoForm()}
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
                    <DataTable.Table data={this.props.agreement.kpiInfos}>
                        <DataTable.Text header="Name" maxLength="40" field="name"/>
                        <DataTable.Text header="Last Update Date" field="lastUpdateDate"/>
                        <DataTable.Text header="Update Period" reader = {new UpdatePeriodReader()}/>
                        <DataTable.Text header="Next Update Date" field="nextUpdateDate"/>
                        <DataTable.ActionColumn width={2}>
                            <DataTable.ActionWrapper shouldRender = {() => !this.props.readOnly} key="editKpiInfo" track="onclick"
                                                     onaction = {(data) => this.openKpiInfoForm(data)}>
                                <Button icon="pencil" size="small" width={1}/>
                            </DataTable.ActionWrapper>
                            <DataTable.ActionWrapper shouldRender = {() => !this.props.readOnly} key="deleteKpiInfo" track="onclick"
                                                     onaction = {(data) => this.removeKpiInfo(data)}>
                                <Button icon="close" size="small" width={1}/>
                            </DataTable.ActionWrapper>
                        </DataTable.ActionColumn>
                    </DataTable.Table>
                </GridCell>
                {this.renderKpiInfoForm()}
            </Grid>
        );
    }

    render() {
        return(
            <Card>
                <ActionHeader title="KPI Info" readOnly={this.props.readOnly} removeTopMargin={true}
                              tools={[{title: "Add", items: [{label: "", onclick: () => this.openKpiInfoForm()}]}]} />
                <LoaderWrapper busy = {this.state.busy} title="" size = "S">
                    {this.renderDataTable()}
                </LoaderWrapper>
            </Card>
        );
    }
}

class UpdatePeriodReader {
    readCellValue(row) {
        if (row.updatePeriod && row.renewalDateType) {
            return row.updatePeriod + " " + row.renewalDateType.id;
        }
        return "";
    }

    readSortValue(rowData){
        return this.readCellValue(rowData);
    }
}