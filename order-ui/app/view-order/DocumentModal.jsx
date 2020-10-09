import _ from "lodash";
import PropTypes from 'prop-types';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Chip, FileInput } from 'susam-components/advanced';
import { Button, Notify, TextInput } from 'susam-components/basic';
import { Alert, CardSubHeader, Grid, GridCell, LoaderWrapper, Modal } from 'susam-components/layout';
import { OrderService } from "../services";




export class DocumentModal extends TranslatingComponent{
    state = {
        loaderStatus: {}
    };
    constructor(props){
        super(props);
    }

    open(){
        this.modal && this.modal.open();
    }

    handleClickDelete(document){
        Notify.confirm("Are you sure you want to delete this document ?", () => {
            this.props.onDelete(document);
        });
    }
    handleCloseModal(){
        this.setState({newDocument: null}, () => this.modal.close());
    }
    handleClickAddNew(){
        this.setState({newDocument: {}});
    }
    handleClickSave(){
        let request = [];
        this.state.newDocument.types.forEach(type => {
            request.push({
                savedFileName: this.state.newDocument.savedFileName,
                originalFileName: this.state.newDocument.originalFileName,
                description: this.state.newDocument.description,
                file: this.state.newDocument.file,
                type: type
            });
        });
        this.setState({newDocument: null}, () => this.props.onSave(request));
    }
    handleFileUpload(key, file){
        if(file){
            this.setState({loaderStatus:{fileupload:true}}, ()=>{
                OrderService.uploadFile(file).then(response => {
                    let document = _.cloneDeep(this.state.newDocument);
                    document.savedFileName = response.data;
                    document.originalFileName = file.name;
                    document.file = file;
    
                    this.setState({newDocument: document});
                }).catch(error => Notify.showError(error))
                .then(response=>this.setState({loaderStatus:{}}));
            });
        }
    }
    handleChangeType(types){
        let document = _.cloneDeep(this.state.newDocument);
        document.types = types;
        this.setState({newDocument: document});
    }
    handleChangeDescription(value){
        let document = _.cloneDeep(this.state.newDocument);
        document.description = value;
        this.setState({newDocument: document});
    }
    hasNewDocumentDangerousLoadDocument(){
        return this.state.newDocument.types ?
            _.find(this.props.dangerousLoadDocumentTypes, type => _.find(this.state.newDocument.types, {id: type.id})) : false;
    }
    hasNewDocumentCertificatedLoadDocument(){
        return this.state.newDocument.types ?
            _.find(this.props.healthCertificateLoadDocumentTypes, type => _.find(this.state.newDocument.types, {id: type.id})) : false;
    }
    hasSavedDocumentsDangerousLoadDocument(){
        let currentDocumentsHaveType = false;
        this.props.data.forEach(document => {
            if(_.find(this.props.dangerousLoadDocumentTypes, {id: document.type.id})){
                currentDocumentsHaveType = true;
            }
        });
        return currentDocumentsHaveType;
    }

    hasSavedDocumentsCertificatedLoadDocument(){
        let currentDocumentsHaveType = false;
        this.props.data.forEach(document => {
            if(_.find(this.props.healthCertificateLoadDocumentTypes, {id: document.type.id})){
                currentDocumentsHaveType = true;
            }
        });
        return currentDocumentsHaveType;
    }

    renderGroup(name, documents){
        return(
            <GridCell key = {name} width = "1-1" noMargin = {true}>
                <CardSubHeader title = {name}/>
                <ul className = "md-list">
                    {documents.map(document => this.renderItem(document))}
                </ul>
            </GridCell>
        );
    }

    renderDeleteButton(document){
        if(!this.props.editable){
            return null;
        }
        return <Button label = "Delete" flat = {true} style = "danger" size = "mini"
                       onclick = {() => this.handleClickDelete(document)} />;
    }
    renderDescription(document){
        if(document.description){
            return <div className="uk-text-small">{document.description}</div>
        }
        return null;
    }

    renderItem(document){
        return(
            <li key = {document.id}>
                <div className="md-list-content">
                    <Grid>
                        <GridCell width = "3-5" noMargin = {true}>
                            <div className="md-list-heading">{document.type.name}</div>
                            {this.renderDescription(document)}
                            <div className="uk-text-small uk-text-muted">{document.originalFileName}</div>
                        </GridCell>
                        <GridCell width = "1-5" noMargin = {true}>
                            {this.renderDeleteButton(document)}
                        </GridCell>
                        <GridCell width = "1-5" noMargin = {true}>
                            <a target="_blank" className = "md-btn md-btn-flat md-btn-flat-success md-btn-wave waves-effect waves-button md-btn-mini"
                               href = {`/order-service/order/documents/download/${encodeURIComponent(document.savedFileName)}`}>Download</a>
                        </GridCell>
                    </Grid>
                </div>
            </li>
        );
    }
    renderDocumentList(){
        let groupedDocuments = _.groupBy(this.props.data, item => item.group.name);
        let documentList = <span className="uk-text-large">There are no documents</span>;
        if(this.props.data.length > 0){
            documentList = Object.keys(groupedDocuments).map(key => {
                return this.renderGroup(key, groupedDocuments[key]);
            });
        }
        return <Grid>{documentList}</Grid>;
    }
    renderDescriptionForOtherTypes(){
        if(this.state.newDocument.types && _.find(this.state.newDocument.types, {code: "OTH"})){
            return (
                <GridCell width = "1-1">
                    <TextInput label = "Description"
                               value = {this.state.newDocument.description} required = {true}
                               onchange = {(value) => this.handleChangeDescription(value)} />
                </GridCell>
            );
        }
        return null;
    }
    renderDangerousLoadAlert(){
        if(this.hasNewDocumentDangerousLoadDocument() && !this.props.hasDangerousLoad){
            return <GridCell width = "1-1"><Alert message = "This shipment has document types related to dangerous loads, but this shipment doesn't have any dangerous load definition" type = "danger" /></GridCell>;
        }
        return null;
    }
    renderCertificatedLoadAlert(){
        if(this.hasNewDocumentCertificatedLoadDocument() && !this.props.hasHealthCertificateLoad){
            return <GridCell width = "1-1"><Alert message = "This shipment has document types related to health certificated loads, but this shipment doesn't have any certification definition" type = "danger" /></GridCell>;
        }
        return null;
    }
    renderAddNewDocument() {
        let documentTypes = this.props.documentTypes;
        if(this.props.dangerousLoadDocumentTypes || this.props.healthCertificateLoadDocumentTypes) {
            let otherDocumentTypes = _.concat(this.props.dangerousLoadDocumentTypes, this.props.healthCertificateLoadDocumentTypes);
            documentTypes = _.concat(this.props.documentTypes, otherDocumentTypes);
        }

        return (
            <Grid>
                {this.renderDangerousLoadAlert()}
                {this.renderCertificatedLoadAlert()}
                <GridCell width = "1-1">
                    <Chip options = {documentTypes} placeholder = "Document Type" translate={true}
                          value = {this.props.data.types} valueField = "code" hideSelectAll={true}
                          onchange = {(value) => this.handleChangeType(value)} />
                </GridCell>
                {this.renderDescriptionForOtherTypes()}
                <GridCell width = "1-1">
                    <FileInput id="document-upload"
                            value={this.state.newDocument}
                            onchange={(value) => this.handleFileUpload("document", value ? value[0] : null)}/>
                    <LoaderWrapper busy={this.state.loaderStatus.fileupload} size="S"><div /></LoaderWrapper>
                </GridCell>
            </Grid>
        );
    }

    render(){
        if(!this.props.data){
            return null;
        }
        let actions = [];
        if(this.props.editable){
            if(this.state.newDocument){
                actions.push({label:"save", buttonStyle: "primary", action:() => this.handleClickSave()})
            }else{
                actions.push({label:"add new", buttonStyle: "primary", action:() => this.handleClickAddNew()})
            }
        }
        actions.push({label:"Close", action:() => this.handleCloseModal()});
        return(
            <Modal title={`${this.props.type} Based Documents`}
                   closeOtherOpenModals = {false}
                   ref={(c) => this.modal = c}
                   actions={actions}>

                {this.state.newDocument ? this.renderAddNewDocument() : this.renderDocumentList()}
            </Modal>
        );
    }
}

DocumentModal.contextTypes = {
    translator: PropTypes.object
};