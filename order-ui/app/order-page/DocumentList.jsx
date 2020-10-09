import React from 'react';
import * as axios from 'axios';
import _ from 'lodash';
import uuid from 'uuid';

import {TranslatingComponent} from 'susam-components/abstract';
import {TextInput, DropDown, Notify} from 'susam-components/basic';
import {Grid, GridCell, Card, Section, Modal} from 'susam-components/layout';
import {FileInput} from 'susam-components/advanced';

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

    handleConfirmDeleteDocumentClick(elem) {
        Notify.confirm("Are you sure you want to delete?", () => this.onDeleteDocument(elem));
    }

    renderDocuments() {
        if (_.size(this.state.documents) > 0) {
            return (
                <ul className="md-list">
                {
                    this.state.documents.map(item => {
                        return this.renderDocument(item);
                    })
                }
                </ul>
            );
        } else {
            return super.translate("No document");
        }
    }

    renderDocument(document) {
        return (
            <li key={document.fileName + "-row"}>
                <div className="md-list-content">
                    <Grid>
                        <GridCell width="7-10" noMargin={true}>
                            <Grid>
                                <GridCell width="1-1" noMargin={true}>
                                    <i className={"uk-icon " + FileUtils.pickFileIcon(document.displayName) + " uk-icon-small"}/>
                                </GridCell>
                                <GridCell width="1-1" noMargin={true}>
                                    <span className="md-list-heading">{document.displayName}</span>
                                </GridCell>
                                <GridCell width="1-1" noMargin={true}>
                                    <span className="uk-text-small uk-text-muted">Type: {document.type.name}</span>
                                </GridCell>
                            </Grid>
                        </GridCell>
                        <GridCell width="3-10" noMargin={true}>
                            <Grid>
                                <GridCell width="1-1" noMargin={true}>
                                    <a href="#" onClick={() => this.handleEditDocumentClick(document)}>
                                        <i className="md-icon uk-icon-pencil" data-uk-tooltip="{pos:'bottom'}" title="Edit"/>
                                    </a>
                                </GridCell>
                                <GridCell width="1-1" noMargin={true}>
                                    <a href="#" onClick={() => this.handleDownloadDocumentClick(document)}>
                                        <i className="md-icon uk-icon-download" data-uk-tooltip="{pos:'bottom'}" title="Download"/>
                                    </a>
                                </GridCell>
                                <GridCell width="1-1" noMargin={true}>
                                    <a href="#" onClick={() => this.handleConfirmDeleteDocumentClick(document)}>
                                        <i className="md-icon uk-icon-close" data-uk-tooltip="{pos:'bottom'}" title="Delete"/>
                                    </a>
                                </GridCell>
                            </Grid>
                        </GridCell>
                    </Grid>
                </div>
            </li>
        );
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