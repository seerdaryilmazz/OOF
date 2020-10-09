import React from 'react';
import * as axios from 'axios';

import {Table} from 'susam-components/table';
import {Button, DropDown, Checkbox, TextInput, TextArea} from 'susam-components/basic';
import {Card, Grid, GridCell, Modal} from 'susam-components/layout';
import {DateTime, FileInput} from 'susam-components/advanced';
import {OrderDocumentUploadForm} from './OrderDocumentUploadForm'

export class OrderDocumentTable extends React.Component {

    constructor(props) {

        super(props);

        this.state = {};

        this.state.tableHeaders = [
            {
                name: "Name",
                data: "name",
                hidden: true
            },
            {
                name: "Name",
                data: "originalName"
            },
            {
                name: "Type",
                data: "type"
            }
        ];

        this.state.tableActions = {
            actionButtons: [
                {
                    icon: "pencil",
                    action: (elem) => this.handleEditClick(elem),
                    title: "Edit"
                }
            ],
            rowDelete: {
                icon: "close",
                action: (elem) => this.handleDeleteClick(elem),
                title: "Delete",
                confirmation: "Are you sure you want to delete?"
            }
        };
        this.state.tableData = this.props.documents;
    };

    handleEditClick(elem) {
        this.documentUploadFormModal.open();
        this.documentUploadForm.prepareForUpdate(elem);
    }

    handleDeleteClick(elem) {

        let url = "/order-service/transport-order/doc/" + elem.name;

        let config = {};

        axios.delete(url, config)
            .then((response) => {
                let state = _.cloneDeep(this.state);
                _.remove(state.tableData, function(item) {
                    return item.name == elem.name;
                });
                this.setState(state);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    handleDataAdd(elem) {
        let state = _.cloneDeep(this.state);
        state.tableData.push(elem);
        this.setState(state);
    }

    handleDataUpdate() {
        this.setState(this.state);
    }

    handleDocumentUploadFormOpen() {
        this.documentUploadFormModal.open();
        this.documentUploadForm.prepareForAdd();
    }

    handleDocumentUploadFormClose() {
        this.documentUploadFormModal.close();
    }

    getTable() {
        return (
            <Table headers={this.state.tableHeaders}
                   data={this.state.tableData}
                   actions={this.state.tableActions}
                   hover={true} />
        );
    }

    render() {

        let table = this.getTable();

        /*
        if (this.state.tableData && _.size(this.state.tableData) > 0) {

            table = this.getTable();

        } else {

            table = (
                <b>No documents!</b>
            );
        }
        */

        return (
            <Card title = "Documents" toolbarItems = {[{icon:"plus", action: () => this.handleDocumentUploadFormOpen()}]}>
                <Grid>

                    <GridCell width="1-1">
                        <Modal ref={(c) => this.documentUploadFormModal = c} large={false}>
                            <OrderDocumentUploadForm ref={(c) => this.documentUploadForm = c}
                                onClose = {() => this.handleDocumentUploadFormClose()}
                                onDataAdd = {(elem) => this.handleDataAdd(elem)}
                                onDataUpdate = {() => this.handleDataUpdate()}
                                data = {null} />
                        </Modal>
                    </GridCell>

                    <GridCell width="1-1">
                        {table}
                    </GridCell>
                </Grid>
            </Card>
        );
    }
}
