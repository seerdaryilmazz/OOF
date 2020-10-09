import React from "react";
import {TranslatingComponent} from 'susam-components/abstract';
import _ from "lodash";
import uuid from 'uuid';
import { Card, Grid, GridCell, LoaderWrapper, Modal } from 'susam-components/layout';
import { ActionHeader, StringUtils } from "../utils";
import { Button } from "susam-components/basic";
import * as DataTable from 'susam-components/datatable';
import {SignatureInfo} from "./SignatureInfo";
import {Notify} from "susam-components/basic";
import PropTypes from "prop-types";


export class SignatureInfoList extends TranslatingComponent {

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

    handleChange(signatureInfos) {
        let keyValuePairs = [{key: "signatureInfos", value: signatureInfos}];
        this.props.onChange(keyValuePairs);
    }

    validateSignatureInfoForm() {
        return this.signatureInfoForm.validate();
    }

    closeSignatureInfoForm() {
        let state = _.cloneDeep(this.state);
        state.signatureInfo = undefined;
        this.setState(state, this.signatureInfoModal.close());
    }

    addSignatureInfo() {
        if (this.validateSignatureInfoForm()) {
            let signatureInfos = _.cloneDeep(this.props.agreement.signatureInfos);
            if (!signatureInfos) {
                signatureInfos = [];
            }
            let signatureInfo = this.state.signatureInfo;
            signatureInfo._key = uuid.v4();
            signatureInfos.push(signatureInfo);
            this.signatureInfoModal.close();
            this.updateState("signatureInfo", undefined, () => {
                this.handleChange(signatureInfos)
            });
        }
    }

    updateSignatureInfo(signatureInfo) {
        if (this.validateSignatureInfoForm()) {
            let signatureInfos = _.cloneDeep(this.props.agreement.signatureInfos);
            if (signatureInfos) {
                const index = signatureInfo.id ?
                    signatureInfos.findIndex(item => item.id === signatureInfo.id)
                    :
                    signatureInfos.findIndex(item => item._key === signatureInfo._key);
                if (index !== -1) {
                    signatureInfos[index] = signatureInfo;
                    this.updateState("signatureInfo", null, () => {
                        this.handleChange(signatureInfos);
                    });
                }
            }
            this.signatureInfoModal && this.signatureInfoModal.close();
        }
    }

    openSignatureInfoForm(signatureInfo) {
        let state = _.cloneDeep(this.state);
        if (signatureInfo) {
            state.signatureInfo = signatureInfo;
        }
        else {
            state.signatureInfo = {};
        }
        this.setState(state, () => {this.signatureInfoModal.open()});
    }

    removeSignatureInfo(signatureInfo) {
        let signatureInfos = _.cloneDeep(this.props.agreement.signatureInfos);
        if (signatureInfos) {
            const index = signatureInfos.findIndex(item => item._key === signatureInfo._key);
            if (index !== -1) {
                signatureInfos.splice(index, 1);
                this.updateState("signatureInfo", null, () => {
                    this.handleChange(signatureInfos);
                });
            }
        }
    }

    getSignatureInfoForm() {
        if (this.state.signatureInfo) {
            return <SignatureInfo ref={c => this.signatureInfoForm = c}
                                         signatureInfo={this.state.signatureInfo || undefined}
                                         onChange={(value) => this.updateState("signatureInfo", value)}/>;
        }
        return null;
    }

    renderSignatureInfoForm() {
        return(
            <Modal ref={(c) => this.signatureInfoModal = c}
                   title="Signature Info Detail"
                   medium={true}
                   closeOnBackgroundClicked={false}
                   actions={[
                       {label: "SAVE", buttonStyle:"success", flat:false, action: () => {this.state.signatureInfo && this.state.signatureInfo._key ? this.updateSignatureInfo(this.state.signatureInfo) : this.addSignatureInfo()}},
                       {label: "CLOSE", buttonStyle:"danger", flat:false, action: () => this.closeSignatureInfoForm()}]}>
                {this.getSignatureInfoForm()}
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
                    <DataTable.Table data={this.props.agreement.signatureInfos}>
                        <DataTable.Text header="Signed By" translator={this} field="signedBy.name"/>
                        <DataTable.Text header="Name" field="name"/>
                        <DataTable.Text header="Title" field="title"/>
                        <DataTable.Text header="Date" field="signedDate"/>
                        <DataTable.Text header="Place" field="place"/>
                        <DataTable.ActionColumn width={2}>
                            <DataTable.ActionWrapper shouldRender = {() => !this.props.readOnly} key="editSignatureInfo" track="onclick"
                                                     onaction = {(data) => this.openSignatureInfoForm(data)}>
                                <Button icon="pencil" size="small" width={1}/>
                            </DataTable.ActionWrapper>
                            <DataTable.ActionWrapper shouldRender = {() => !this.props.readOnly} key="deleteSignatureInfo" track="onclick"
                                                     onaction = {(data) => this.removeSignatureInfo(data)}>
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
                <ActionHeader title="Signature Info" readOnly={this.props.readOnly} removeTopMargin={true}
                              tools={[{title: "Add", items: [{label: "", onclick: () => this.openSignatureInfoForm()}]}]} />
                <LoaderWrapper busy = {this.state.busy} title="" size = "S">
                    {this.renderDataTable()}
                </LoaderWrapper>
                {this.renderSignatureInfoForm()}
            </Card>
        );
    }
}

SignatureInfoList.contextTypes = {
    translator: PropTypes.object
};