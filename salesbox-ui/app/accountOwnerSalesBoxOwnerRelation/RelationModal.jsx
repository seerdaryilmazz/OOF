import React from "react";
import _ from "lodash";
import uuid from 'uuid';
import * as axios from "axios";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, CardHeader, Loader, Modal} from "susam-components/layout";
import {Notify, TextInput, Button, DropDown, Span, Checkbox} from 'susam-components/basic';
import {UserDropDown} from '../common/UserDropDown';

export class RelationModal extends TranslatingComponent {

    constructor(props) {
        super(props);
        let data = _.cloneDeep(props.data);
        this.state = {
            accountOwner: data.accountOwner,
            salesBoxOwner: data.salesBoxOwner
        };
    }

    componentDidMount() {
        this.modalReference.open();
    }

    updateAccountOwner(user) {
        this.setState({accountOwner: user ? user.username : null});
    }

    updateSalesBoxOwner(user) {
        this.setState({salesBoxOwner: user ? user.username : null});
    }

    cancel() {
        this.props.onCancel();
    }

    save() {

        let state = _.cloneDeep(this.state);

        if (_.isNil(state.accountOwner) || state.accountOwner.trim().length == 0) {
            Notify.showError("An account owner must be specified.");
            return;
        }

        if (_.isNil(state.salesBoxOwner) || state.salesBoxOwner.trim().length == 0) {
            Notify.showError("A sales box owner must be specified.");
            return;
        }

        let data = _.cloneDeep(this.props.data);
        data.accountOwner = state.accountOwner;
        data.salesBoxOwner = state.salesBoxOwner;

        this.props.onSave(data);
    }

    getTitle() {

        let inEditMode = !_.isNil(this.props.data.id);
        let title;

        if (inEditMode) {
            title = "Edit Relation";
        } else {
            title = "New Relation";
        }

        return title;
    }

    convertToUserObject(username) {
        if (username) {
            return {username: username};
        } else {
            return null;
        }
    }

    renderModalContent() {
        return (
            <Grid>
                <GridCell width="1-1">
                    <UserDropDown label="Account Owner"
                                  value={this.convertToUserObject(this.state.accountOwner)}
                                  onchange={(value) => this.updateAccountOwner(value)}
                                  valueField="username"
                                  labelField="username"
                                  required={true}/>
                </GridCell>
                <GridCell width="1-1">
                    <UserDropDown label="Sales Box Owner"
                                  value={this.convertToUserObject(this.state.salesBoxOwner)}
                                  onchange={(value) => this.updateSalesBoxOwner(value)}
                                  valueField="username"
                                  labelField="username"
                                  required={true}/>
                </GridCell>
                <GridCell width="1-1">
                    <div className="uk-align-right">
                        <Button label="Cancel" waves={true} onclick={() => this.cancel()}/>
                        <Button label="Save" style="primary" waves={true} onclick={() => this.save()}/>
                    </div>
                </GridCell>
            </Grid>
        );
    }

    render() {
        return (
            <Modal title={this.getTitle()}
                   large={false}
                   ref={(c) => this.modalReference = c}>
                {this.renderModalContent()}
            </Modal>
        );
    }
}

