import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import _ from "lodash";
import { Card, Grid, GridCell, LoaderWrapper, Modal } from 'susam-components/layout';
import * as DataTable from 'susam-components/datatable';
import { ActionHeader } from "../utils";
import uuid from "uuid";
import { Button } from "susam-components/basic";
import { OwnerInfo } from "./index";
import {Notify} from "susam-components/basic";
import PropTypes from "prop-types";


export class OwnerInfoList extends TranslatingComponent {

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

    handleChange(ownerInfos) {
        let keyValuePairs = [{key: "ownerInfos", value: ownerInfos}];
        this.props.onChange(keyValuePairs);
    }

    getOwnerInfoForm() {
        if (this.state.ownerInfo) {
            return <OwnerInfo ref={c => this.ownerInfoForm = c}
                            ownerInfo={this.state.ownerInfo || undefined}
                            onChange={(value) => this.updateState("ownerInfo", value)}/>;
        }
        return null;
    }

    validate(){
        let ownerInfos = _.cloneDeep(this.props.agreement.ownerInfos);
        if(_.isEmpty(ownerInfos)){
            Notify.showError("Agreement should have at least one Responsible!");
            return false;
        }
        if(_.isNil(_.find(ownerInfos, {responsibilityType: {code:"RESPONSIBLE"}}))){
            Notify.showError("Agreement should have at least one Responsible!");
            return false;
        }
        return true;
    }

    addOwnerInfo() {
        if (this.ownerInfoForm.validate()) {
            let ownerInfos = _.cloneDeep(this.props.agreement.ownerInfos);
            if (!ownerInfos) {
                ownerInfos = [];
            }
            let ownerInfo = this.state.ownerInfo;
            ownerInfo._key = uuid.v4();
            ownerInfos.push(ownerInfo);
            this.ownerInfoModal.close();
            this.updateState("ownerInfo", undefined, () => {
                this.handleChange(ownerInfos)
            });
        }
    }

    updateOwnerInfo(ownerInfo) {
        if (this.ownerInfoForm.validate()) {
            let ownerInfos = _.cloneDeep(this.props.agreement.ownerInfos);
            if (ownerInfos) {
                const index = ownerInfo.id ?
                    ownerInfos.findIndex(item => item.id === ownerInfo.id)
                    :
                    ownerInfos.findIndex(item => item._key === ownerInfo._key);
                if (index !== -1) {
                    ownerInfos[index] = ownerInfo;
                    this.updateState("ownerInfo", undefined, () => {
                        this.handleChange(ownerInfos)
                    });
                }
            }
            this.ownerInfoModal && this.ownerInfoModal.close();
        }
    }

    closeOwnerInfoForm() {
        let state = _.cloneDeep(this.state);
        state.ownerInfo = undefined;
        this.setState(state, this.ownerInfoModal.close());
    }

    renderOwnerInfoForm() {
        return(
            <Modal ref={(c) => this.ownerInfoModal = c}
                   title="Related People Info Detail"
                   medium={true}
                   closeOnBackgroundClicked={false}
                   actions={[
                       {label: "SAVE", buttonStyle:"success", flat:false, action: () => {this.state.ownerInfo && this.state.ownerInfo._key ? this.updateOwnerInfo(this.state.ownerInfo) : this.addOwnerInfo()}},
                       {label: "CLOSE", buttonStyle:"danger", flat:false, action: () => this.closeOwnerInfoForm()}]}>
                {this.getOwnerInfoForm()}
            </Modal>
        );
    }

    openOwnerInfoForm(ownerInfo) {
        let state = _.cloneDeep(this.state);
        if (ownerInfo) {
            state.ownerInfo = ownerInfo;
        }
        else {
            state.ownerInfo = {};
        }
        this.setState(state, () => {this.ownerInfoModal.open()});
    }

    removeOwnerInfo(ownerInfo) {
        let ownerInfos = _.cloneDeep(this.props.agreement.ownerInfos);
        if (ownerInfos) {
            const index = ownerInfos.findIndex(owner => owner._key === ownerInfo._key);
            if (index !== -1) {
                ownerInfos.splice(index, 1);
                this.updateState("ownerInfo", null, () => {
                    this.handleChange(ownerInfos);
                });
            }
        }
    }

    renderDataTable() {
        if (!this.props.agreement) {
            return null;
        }
        return(
            <Grid divider = {true}>
                <GridCell width="1-1" margin="small">
                    <DataTable.Table data={this.props.agreement.ownerInfos}>
                        <DataTable.Text header="Name" maxLength="40" field="name.name"/>
                        <DataTable.Text header="Responsibility Type" translator={this} field="responsibilityType.name"/>
                        <DataTable.Text header="Service Areas" field="serviceAreas" printer = {new ListPrinter(this)} />
                        <DataTable.ActionColumn width={2}>
                            <DataTable.ActionWrapper shouldRender = {() => !this.props.readOnly} key="editOwnerInfo" track="onclick"
                                                     onaction = {(data) => this.openOwnerInfoForm(data)}>
                                <Button icon="pencil" size="small" width={1}/>
                            </DataTable.ActionWrapper>
                            <DataTable.ActionWrapper shouldRender = {() => !this.props.readOnly} key="deleteOwnerInfo" track="onclick"
                                                     onaction = {(data) => this.removeOwnerInfo(data)}>
                                <Button icon="close" size="small" width={1} />
                            </DataTable.ActionWrapper>
                        </DataTable.ActionColumn>
                    </DataTable.Table>
                </GridCell>
                {this.renderOwnerInfoForm()}
            </Grid>
        );
    }

    render() {
        return(
            <Card>
                <ActionHeader title="Related People" readOnly={this.props.readOnly} removeTopMargin={true}
                              tools={[{title: "Add", items: [{label: "", onclick: () => this.openOwnerInfoForm()}]}]} />
                <LoaderWrapper busy = {this.state.busy} title="" size = "S">
                    {this.renderDataTable()}
                </LoaderWrapper>
            </Card>
        );
    }
}

class ListPrinter {
    constructor(translator) {
        this.translator = translator;
    }

    translate(text) {
        return this.translator ? this.translator.translate(text) : text;
    }

    print(data) {
        if (data) {
            let nameArr = [];
            data.map(item => nameArr.push(this.translate(item.name)));
            return <div key={uuid.v4()}>{nameArr.join(", ")}</div>;
        }
    }
}

OwnerInfoList.contextTypes = {
    translator: PropTypes.object,
};