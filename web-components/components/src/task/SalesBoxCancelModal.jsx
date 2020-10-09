import React from "react";
import _ from "lodash";

import {TranslatingComponent} from '../abstract';
import {Grid, GridCell, Modal} from "../layout";
import {Notify, Button, TextArea} from '../basic';

import {SalesBoxCancelReasonDropDown} from './SalesBoxCancelReasonDropDown';

export class SalesBoxCancelModal extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {
    }

    updateProperty(propertyName, propertyValue) {
        this.setState({[propertyName]: propertyValue});
    }

    open() {
        this.modalReference.open();
    }

    close() {
        this.modalReference.close();
    }

    cancel() {
        this.props.onCancel();
    }

    save() {

        let state = _.cloneDeep(this.state);

        if (_.isNil(state.reason)) {
            Notify.showError("A reason must be specified.");
            return;
        }

        if (!_.isNil(state.description) && state.description.length > 500) {
            Notify.showError("Length of description can be 500 at most.");
            return;
        }

        let data = {};
        data.task = _.cloneDeep(this.props.task);
        data.reason = state.reason;
        data.description = state.description;

        this.props.onSave(data);
    }

    renderModalContent() {
        if (_.isNil(this.props.task)) {
            return null;
        } else {
            return (
                <Grid>
                    <GridCell width="1-1">
                        <SalesBoxCancelReasonDropDown label="Reason"
                                                      value={this.state.reason}
                                                      onchange={(value) => this.updateProperty("reason", value)}
                                                      required={true}/>
                    </GridCell>
                    <GridCell width="1-1">
                    <TextArea label="Description"
                              value={this.state.description}
                              onchange={(value) => this.updateProperty("description", value)}/>
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
    }

    render() {
        return (
            <Modal title="Cancel Sales Box"
                   large={false}
                   ref={(c) => this.modalReference = c}>
                {this.renderModalContent()}
            </Modal>
        );
    }
}

