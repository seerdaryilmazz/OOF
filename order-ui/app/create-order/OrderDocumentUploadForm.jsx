import React from 'react';
import * as axios from 'axios';
import _ from 'lodash';

import {Table} from 'susam-components/table';
import {Button, DropDown, Checkbox, TextInput, TextArea} from 'susam-components/basic';
import {Card, Grid, GridCell, Modal} from 'susam-components/layout';
import {DateTime, FileInput} from 'susam-components/advanced';

export class OrderDocumentUploadForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: {},
            documentName: "",
            fileReference: null,
            documentType: {},
            documentTypes: [],
            mode: 1 // 1 = add, 2 = update
        };
    };

    componentDidMount() {
        axios.get('/order-service/lookup/doc-type')
            .then((response) => {
                let state = _.cloneDeep(this.state);
                state.documentTypes = response.data;
                this.setState(state);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    handleClose() {
        this.props.onClose();
    }

    handleSaveAndClose() {
        this.handleSave(true);
    }

    handleSaveAndAddAnother() {
        this.handleSave(false);
        this.prepareForAdd();
    }

    handleSave(toBeClosed) {

        if (this.state.mode == 1) {

            let url = "/order-service/transport-order/doc/upload";

            let data = new FormData();
            data.append("document", this.state.fileReference);

            let config = {};

            let documentTypeTemp = this.state.documentType;

            axios.post(url, data, config)
                .then((response) => {
                    response.data.type = documentTypeTemp;
                    this.props.onDataAdd(response.data);
                })
                .catch((error) => {
                    console.log(error);
                });

        } else if (this.state.mode == 2) {

            this.state.data.type = _.cloneDeep(this.state.documentType);
            this.props.onDataUpdate();

        } else {
            console.error("Undefined mode: " + this.state.mode);
        }

        if (toBeClosed) {
            this.handleClose();
        }
    }

    handleFileInputChange(input) {
        this.state.fileReference = input[0];
    }

    handleDocumentTypeChange(input) {
        this.state.documentType = _.cloneDeep(input);
        this.setState(this.state);
    }

    prepareForAdd() {
        let state = _.cloneDeep(this.state);
        state.data = null;
        state.documentName = "";
        state.fileReference = null;
        state.documentType = {};
        state.mode = 1;
        if (this.fileInput) {
            this.fileInput.clearSelectedFile();
        }
        this.setState(state);
    }

    prepareForUpdate(data) {
        let state = _.cloneDeep(this.state);
        state.data = data;
        state.documentName = data.originalName;
        state.fileReference = null;
        state.documentType = _.cloneDeep(data.type);
        state.mode = 2;
        this.setState(state);
    }
    
    getDocumentNameTextInput() {
        return (
            <GridCell width="9-10">
                <TextInput value={this.state.documentName} label="Document" required={true} disabled={true} />
            </GridCell>
        );
    }

    getFileInput() {
        return (
            <GridCell width="9-10">
                <FileInput ref={(c) => this.fileInput = c} onchange={(input) => this.handleFileInputChange(input)} />
            </GridCell>
        );
    }

    render() {

        let documentNameTextInput = null;
        let fileInput = null;

        if (this.state.mode == 1) {

            documentNameTextInput = (
                <div></div>
            );

            fileInput = this.getFileInput();

        } else if (this.state.mode == 2) {

            documentNameTextInput = this.getDocumentNameTextInput();

            fileInput = (
                <div></div>
            );

        } else {
            console.error("Undefined mode: " + this.state.mode);
        }

        return (
            <Grid>

                <GridCell width="9-10">
                    
                </GridCell>

                {documentNameTextInput}

                {fileInput}

                <GridCell width="9-10">
                    <DropDown label="Document Type"
                              required={true}
                              labelField="name"
                              options={this.state.documentTypes}
                              value={this.state.documentType}
                              onchange={(input) => this.handleDocumentTypeChange(input)} />
                </GridCell>

                <GridCell width="9-10">
                    <Button label="Close" onclick={() => this.handleClose()}/>
                    <Button label="Save & Close" onclick={() => this.handleSaveAndClose()}/>
                    <Button label="Save & Add Another" onclick={() => this.handleSaveAndAddAnother()}/>
                </GridCell>

            </Grid>
        );
    }
}
