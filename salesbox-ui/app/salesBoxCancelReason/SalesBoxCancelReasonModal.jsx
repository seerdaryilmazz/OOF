import React from "react";
import _ from "lodash";
import uuid from 'uuid';
import * as axios from "axios";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, CardHeader, Loader, Modal} from "susam-components/layout";
import {Notify, TextInput, Button, DropDown, Span, Checkbox} from 'susam-components/basic';

import {PotentialDeactivationSettingDropDown} from '../common/PotentialDeactivationSettingDropDown';

export class SalesBoxCancelReasonModal extends TranslatingComponent {

    constructor(props) {
        super(props);
        let data = _.cloneDeep(props.data);
        this.state = {
            name: data.name,
            potentialDeactivationSetting: data.potentialDeactivationSetting
        };
    }

    componentDidMount() {
        this.modalReference.open();
    }

    updateProperty(propertyName, propertyValue) {
        this.setState({[propertyName]: propertyValue});
    }

    cancel() {
        this.props.onCancel();
    }

    save() {

        let state = _.cloneDeep(this.state);

        if (_.isNil(state.name) || state.name.trim().length == 0) {
            Notify.showError("A name must be specified.");
            return;
        }

        if (_.isNil(state.potentialDeactivationSetting)) {
            Notify.showError("A potential deactivation setting must be specified.");
            return;
        }

        let data = _.cloneDeep(this.props.data);
        data.name = state.name;
        data.potentialDeactivationSetting = state.potentialDeactivationSetting;

        this.props.onSave(data);
    }

    getTitle() {

        let inEditMode = !_.isNil(this.props.data.id);
        let title;

        if (inEditMode) {
            title = "Edit Reason";
        } else {
            title = "New Reason";
        }

        return title;
    }

    renderModalContent() {
        return (
            <Grid>
                <GridCell width="1-1">
                    <TextInput label="Name"
                               value={this.state.name}
                               onchange={(value) => this.updateProperty("name", value)}
                               required={true}
                               readOnly={this.props.readOnly}/>
                </GridCell>
                <GridCell width="1-1">
                    <PotentialDeactivationSettingDropDown label="Potential Deactivation Setting"
                                                          value={this.state.potentialDeactivationSetting}
                                                          onchange={(value) => this.updateProperty("potentialDeactivationSetting", value)}
                                                          required={true}
                                                          readOnly={this.props.readOnly}/>
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

