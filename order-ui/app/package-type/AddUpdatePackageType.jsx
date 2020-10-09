import React from 'react';
import * as axios from 'axios';

import {Table} from 'susam-components/table';
import {Button, DropDown, Checkbox, TextInput, TextArea, Notify} from 'susam-components/basic';
import {Card, Grid, GridCell, Modal} from 'susam-components/layout';

import {PackageGroupService, PackageTypeService} from '../services';

const MODE_ADD = 1;
const MODE_UPDATE = 2;

export class AddUpdatePackageType extends React.Component {

    constructor(props) {

        super(props);

        this.state = {};
        this.state.packageType = {};
        this.state.lookup = {};
        this.state.code = "";
        this.state.name = "";
        this.state.packageGroup = null;
        this.state.mode = MODE_ADD;

        this.modalActions = [
            {
                label: "Cancel",
                action: () => this.handleCancel()
            },
            {
                label: "Save & Close",
                buttonStyle: "primary",
                action: () => this.handleSaveAndClose()
            }
        ];
    };

    componentDidMount() {
        PackageGroupService.retrievePackageGroups().then((response) => {
            let state = _.cloneDeep(this.state);
            state.lookup.packageGroup = response.data;
            this.setState(state);
        }).catch((error) => {
            Notify.showError(error);
        });
    }

    openForAdd() {
        let state = _.cloneDeep(this.state);
        state.packageType = {};
        state.code = "";
        state.name = "";
        state.packageGroup = null;
        state.mode = MODE_ADD;
        this.setState(state);
        this.modalReference.open();
    }

    openForUpdate(data) {
        let state = _.cloneDeep(this.state);
        state.packageType = _.cloneDeep(data.packageType);
        state.code = state.packageType.code;
        state.name = state.packageType.name;
        state.packageGroup = state.packageType.packageGroup;
        state.mode = MODE_UPDATE;
        this.setState(state);
        this.modalReference.open();
    }

    close() {
        this.modalReference.close();
    }

    handleCancel() {
        this.close();
    }

    handleSaveAndClose() {
        this.handleSave(true);
    }

    handleSave(toBeClosed) {

        let goon = true;

        if (_.isEmpty(_.trim(this.state.code))) {
            goon = false;
            Notify.showError("Code cannot be empty.");
        }

        if (_.isEmpty(_.trim(this.state.name))) {
            goon = false;
            Notify.showError("Name cannot be empty.");
        }

        if (_.isEmpty(_.trim(this.state.packageGroup))) {
            goon = false;
            Notify.showError("Package Group cannot be empty.");
        }

        if (goon) {

            this.state.packageType.code = this.state.code;
            this.state.packageType.name = this.state.name;
            this.state.packageType.packageGroup = this.state.packageGroup;

            if (this.state.mode == MODE_ADD) {

                PackageTypeService.addPackageType(this.state.packageType)
                    .then((response) => {
                        if (this.props.afterSuccessfulAdd) {
                            this.props.afterSuccessfulAdd(response.data);
                        }
                        if (toBeClosed) {
                            this.close();
                        }
                    })
                    .catch((error) => {
                        Notify.showError(error);
                    });

            } else {

                PackageTypeService.updatePackageType(this.state.packageType)
                    .then((response) => {
                        if (this.props.afterSuccessfulUpdate) {
                            this.props.afterSuccessfulUpdate(response.data);
                        }
                        if (toBeClosed) {
                            this.close();
                        }
                    })
                    .catch((error) => {
                        Notify.showError(error);
                    });
            }
        }
    }

    handleCodeChange(value) {
        this.state.code = value;
        this.setState(this.state);
    }

    handleNameChange(value) {
        this.state.name = value;
        this.setState(this.state);
    }

    handlePackageGroupChange(value) {
        this.state.packageGroup = value;
        this.setState(this.state);
    }
    render() {
        return (
            <Modal title="Package Type"
                   large={false}
                   ref={(c) => this.modalReference = c}
                   actions={this.modalActions}>
                <Grid>
                    <GridCell width="1-1">
                        <TextInput label="Code"
                                   value={this.state.code}
                                   onchange={(value) => this.handleCodeChange(value)}
                                   required={true}
                                   disabled={false}/>
                    </GridCell>

                    <GridCell width="1-1">
                        <TextInput label="Name"
                                   value={this.state.name}
                                   onchange={(value) => this.handleNameChange(value)}
                                   required={true}
                                   disabled={false}/>
                    </GridCell>
                    <GridCell width="1-1">
                        <DropDown label="Package Group"
                                  options={this.state.lookup.packageGroup}
                                  value={this.state.packageGroup}
                                  onchange={(value) => this.handlePackageGroupChange(value)}
                                  required={true}
                                  disabled={false}/>
                    </GridCell>
                </Grid>
            </Modal>
        );
    }

}
