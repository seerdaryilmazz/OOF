import React from 'react';
import * as axios from 'axios';

import {Table} from 'susam-components/table';
import {Button, DropDown, Checkbox, TextInput, TextArea, Notify} from 'susam-components/basic';
import {Card, Grid, GridCell, Modal} from 'susam-components/layout';
import {AddUpdatePackageType} from './AddUpdatePackageType';
import {AddUpdatePackageTypeRestriction} from './AddUpdatePackageTypeRestriction';
import {PackageTypeService} from '../services';

export class PackageType extends React.Component {

    constructor(props) {

        super(props);

        this.state = {};

        this.state.tableData = [];

        this.tableHeaders = [
            {
                name: "Id",
                data: "id",
                hidden: true
            },
            {
                name: "Code",
                data: "code"
            },
            {
                name: "Name",
                data: "name"
            },

            {
                name: "Package Group",
                data: "packageGroup",
                render: this.renderPackageGroup
            },
            {
                name: "Has Restriction",
                data: "hasRestriction"
            }
        ];

        this.tableIcons = {
            hasRestriction: {
                displayValue: false,
                align: "left",
                default: "exclamation",
                data: [
                    {
                        value: true,
                        icon: "check",
                    },
                    {
                        value: false,
                        icon: "minus"
                    }
                ]
            }
        };

        this.tableActions = {
            actionButtons: [
                {
                    icon: "pencil",
                    action: (elem) => this.handleEditClick(elem),
                    title: "Edit"
                },
                {
                    icon: "gear",
                    action: (elem) => this.handleRestrictionsClick(elem),
                    title: "Restrictions"
                }
            ],
            rowDelete: {
                icon: "close",
                action: (elem) => this.handleDeleteClick(elem),
                title: "Delete",
                confirmation: "Are you sure you want to delete?"
            }
        };
    };

    renderPackageGroup(rowData) {
        if(rowData && rowData.packageGroup) {
            return rowData.packageGroup.name;
        }
    }

    componentDidMount() {
        this.loadAll();
    }

    loadAll(){
        PackageTypeService.getAllPackageTypesWithRestriction()
            .then((response) => {
                let state = _.cloneDeep(this.state);
                state.tableData = response.data;
                this.setState(state);
            })
            .catch((error) => {
                Notify.showError(error);
            });
    }

    handleAddClick() {
        this.addUpdateComponentRef.openForAdd();
    }

    handleEditClick(elem) {
        this.addUpdateComponentRef.openForUpdate({packageType: elem});
    }

    handleRestrictionsClick(elem) {
        PackageTypeService.getRestrictionByPackageTypeId(elem.id)
            .then((response) => {
                if (response.data) {
                    this.addUpdateRestrictionComponentRef.openForUpdate({packageTypeRestriction: response.data});
                } else {
                    this.addUpdateRestrictionComponentRef.openForAdd({packageTypeRestriction: {packageType: elem}});
                }
            })
            .catch((error) => {
                Notify.showError(error);
            });
    }

    handleDeleteClick(elem) {
        PackageTypeService.deletePackageType(elem.id)
            .then((response) => {
                let state = _.cloneDeep(this.state);
                _.remove(state.tableData, function(item) {
                    return item.id == elem.id;
                });
                this.setState(state);
            })
            .catch((error) => {
                Notify.showError(error);
            });
    }

    afterSuccessfulAdd(elem) {
        let state = _.cloneDeep(this.state);
        state.tableData.push(elem);
        this.setState(state);
    }

    afterSuccessfulUpdate(elem) {
        let state = _.cloneDeep(this.state);
        let index = _.findIndex(state.tableData, function(item) {
            return item.id == elem.id;
        });
        state.tableData.splice(index, 1, elem);
        this.setState(state);
    }

    afterSuccessfulRestrictionAdd(elem) {
        this.loadAll();
    }

    render() {
        return (
            <Card title="Package Types" toolbarItems={[{icon:"plus", action: () => this.handleAddClick()}]}>

                <AddUpdatePackageType
                    ref={(c) => this.addUpdateComponentRef = c}
                    afterSuccessfulAdd={(elem) => this.afterSuccessfulAdd(elem)}
                    afterSuccessfulUpdate={(elem) => this.afterSuccessfulUpdate(elem)} />

                <AddUpdatePackageTypeRestriction
                    ref={(c) => this.addUpdateRestrictionComponentRef = c}
                    afterSuccessfulAdd={(elem) => this.afterSuccessfulRestrictionAdd(elem)}
                    afterSuccessfulUpdate={(elem) => this.afterSuccessfulRestrictionAdd(elem)} />

                <Grid>
                    <GridCell width="1-1">
                        <Table headers={this.tableHeaders}
                               data={this.state.tableData}
                               icons={this.tableIcons}
                               actions={this.tableActions}
                               hover={true} />
                    </GridCell>
                </Grid>
            </Card>
        );
    }

}
