import React from 'react';
import * as axios from 'axios';
import _ from 'lodash';
import uuid from 'uuid';

import {TranslatingComponent} from 'susam-components/abstract';
import {TextInput, DropDown, Notify} from 'susam-components/basic';
import {Grid, GridCell, Card, Section, Modal} from 'susam-components/layout';
import {FileInput} from 'susam-components/advanced';
import {Table} from 'susam-components/table';

import {DocumentService, OrderService, FileUtils} from '../services';

const MODE_ADD = 1;
const MODE_EDIT = 2;

export class DocumentList extends TranslatingComponent {

    constructor(props) {

        super(props);

        this.state = {
            mode: MODE_ADD,
            document: null, // Bu nesneyi, sadece edit aşamasında kullanıyoruz.
            type: null,
            displayName: null,
            multipartFile: null,
            types: [],
            documents: []
        };

        if (props.documents) {
            props.documents.forEach(item => {
                let copy = _.cloneDeep(item);
                this.state.documents.push(copy);
            });
        }

        this.tableHeaders = [
            {
                name: "File Name",
                data: "fileName",
                hidden: true
            },
            {
                name: "",
                data: "icon",
                render: (value) => {
                    let iconClassName = "uk-icon " + FileUtils.pickFileIcon(value.originalName) + " uk-icon-small";
                    return (
                        <i key={value.fileName} className={iconClassName}/>
                    );
                }
            },
            {
                name: "Name",
                data: "displayName"
            },
            {
                name: "Type",
                data: "type",
                render: (value) => {
                    return value.type.name;
                }
            }
        ];

        this.tableActions = {
            actionButtons: [
                {
                    icon: "pencil",
                    action: (elem) => this.handleEditDocumentClick(elem),
                    title: "Edit"
                },
                {
                    icon: "download",
                    action: (elem) => this.handleDownloadDocumentClick(elem),
                    title: "Download"
                }
            ],
            rowDelete: {
                icon: "close",
                action: (elem) => this.handleDeleteDocumentClick(elem),
                title: "Delete",
                confirmation: "Are you sure you want to delete?"
            }
        };
    }

    componentDidMount() {
        OrderService.getDocumentTypes().then((response) => {
            this.setState({types: response.data});
        }).catch((error) => {
            Notify.showError(error);
        });
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.documents) {
            let documents = [];
            nextProps.documents.forEach(item => {
                let copy = _.cloneDeep(item);
                documents.push(copy);
            });
            this.setState({documents: documents});
        }
    }

    clearSelectedFile() {
        if (this.fileInput) {
            this.fileInput.clearSelectedFile();
        }
    }

    openModalForAdd() {

        let state = _.cloneDeep(this.state);
        state.mode = MODE_ADD;
        state.document = null;
        state.type = null;
        state.displayName = null;
        state.multipartFile = null;
        this.setState(state);

        this.clearSelectedFile();
        this.modal.open();
    }

    openModalForEdit(elem) {

        let state = _.cloneDeep(this.state);
        state.mode = MODE_EDIT;
        state.document = _.cloneDeep(elem);
        state.type = state.document.type;
        state.displayName = state.document.displayName;
        state.multipartFile = null;
        this.setState(state);

        this.clearSelectedFile();
        this.modal.open();
    }

    closeModal() {
        this.modal.close();
    }

    updateType(value) {
        this.setState({type: value});
    }

    updateDisplayName(value) {
        this.setState({displayName: value});
    }

    updateMultipartFile(value) {
        if (value && value[0]) {
            this.setState({displayName: value[0].name, multipartFile: value[0]});
        } else {
            this.setState({displayName: null, multipartFile: null});
        }
    }

    updateDocuments(documents) {
        this.setState({documents: documents});
        this.props.onchange && this.props.onchange(documents);
    }

    onAddDocument(document) {
        let documents = _.cloneDeep(this.state.documents);
        documents.push(document);
        this.updateDocuments(documents);
    }

    onEditDocument(previousFileName, document) {
        let documents = _.cloneDeep(this.state.documents);
        let index = _.findIndex(documents, item => {
            return item.fileName == previousFileName;
        });
        documents.splice(index, 1, document);
        this.updateDocuments(documents);
    }

    onDeleteDocument(document) {
        let documents = _.cloneDeep(this.state.documents);
        _.remove(documents, item => {
            return item.fileName == document.fileName;
        });
        this.updateDocuments(documents);
    }

    handleSaveDocumentClick() {

        let allFieldsOk = true;

        if (allFieldsOk && !this.state.type) {
            allFieldsOk = false;
            Notify.showError("Type is required.");
        }

        if (allFieldsOk && !this.state.displayName) {
            allFieldsOk = false;
            Notify.showError("Name is required.");
        }

        if (allFieldsOk && this.state.mode == MODE_ADD && !this.state.multipartFile) {
            allFieldsOk = false;
            Notify.showError("Document is required.");
        }

        if (allFieldsOk) {

            if (this.state.mode == MODE_ADD) {

                DocumentService.uploadDocument(this.state.multipartFile).then((response) => {

                    let document = {};
                    document.originalName = response.data.originalName;
                    document.displayName = this.state.displayName;
                    document.fileName = response.data.fileName;
                    document.type = this.state.type;

                    this.onAddDocument(document);
                    this.closeModal();

                }).catch((error)=> {
                    Notify.showError(error);
                });

            } else {

                if (this.state.multipartFile) {

                    DocumentService.uploadDocument(this.state.multipartFile).then((response) => {

                        let previousFileName = this.state.document.fileName;

                        let document = _.cloneDeep(this.state.document);
                        document.originalName = response.data.originalName;
                        document.displayName = this.state.displayName;
                        document.fileName = response.data.fileName;
                        document.type = this.state.type;

                        this.onEditDocument(previousFileName, document);
                        this.closeModal();

                    }).catch((error)=> {
                        Notify.showError(error);
                    });

                } else {

                    let previousFileName = this.state.document.fileName;

                    let document = _.cloneDeep(this.state.document);
                    document.displayName = this.state.displayName;
                    document.type = this.state.type;

                    this.onEditDocument(previousFileName, document);
                    this.closeModal();
                }
            }
        }
    }

    handleDeleteDocumentClick(elem) {
        this.onDeleteDocument(elem);
    }

    handleEditDocumentClick(elem) {
        this.openModalForEdit(elem);
    }

    handleDownloadDocumentClick(elem) {
        let url = DocumentService.generateDocumentDownloadUrl(elem.fileName, elem.displayName);
        window.open(url);
    }

    renderDocuments() {
        if (_.size(this.state.documents) > 0) {
            return (
                <Table headers={this.tableHeaders}
                       data={this.state.documents}
                       actions={this.tableActions}
                       hover={true} />
            );
        } else {
            return super.translate("No document");
        }
    }

    render() {

        let documents = this.renderDocuments();

        return(
            <Card title = {super.translate("Documents")} toolbarItems = {[{icon:"plus", action: () => this.openModalForAdd()}]}>
                {documents}
                <Modal ref={(c) => this.modal = c}
                       title="Upload Document"
                       actions={[
                                    {label: "Close", action: () => this.closeModal()},
                                    {label: "Save", action: () => this.handleSaveDocumentClick()}
                                ]}>
                    <Grid>
                        <GridCell width="1-1" noMargin={true}>
                            <DropDown label="Type"
                                      required={true}
                                      value={this.state.type}
                                      options={this.state.types}
                                      onchange={(value) => this.updateType(value)}/>
                        </GridCell>
                        <GridCell width="1-1">
                            <TextInput label="Name"
                                       placeholder="Select a document below and this field will be automatically filled."
                                       required={true}
                                       value={this.state.displayName}
                                       onchange={(value) => this.updateDisplayName(value)}/>
                        </GridCell>
                        <GridCell width="1-1">
                            <FileInput ref={(c) => this.fileInput = c}
                                       label="Upload Document"
                                       onchange={(value) => this.updateMultipartFile(value)}/>
                        </GridCell>
                    </Grid>
                </Modal>
            </Card>
        );
    }
}

DocumentList.contextTypes = {
    translator: React.PropTypes.object
};