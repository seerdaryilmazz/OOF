import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, Notify } from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';
import { Grid, GridCell, Modal, Secure } from "susam-components/layout";
import { EmailService, FileService } from '../services';
import { ActionHeader } from '../utils/ActionHeader';
import { Document } from "./Document";
import { EmailDetails } from "./EmailDetails";
import PropTypes from "prop-types";

var moment = require('moment');
require('moment-timezone');

export class DocumentList extends TranslatingComponent {

    static defaultProps = {
        documents: []
    }

    constructor(props) {
        super(props);
        this.state = {
            documents: [],
            document: {},
            file: null
        };
    }

    clearSelectedFile() {
        if (this.documentComponent.fileInput) {
            this.documentComponent.fileInput.clearSelectedFile();
        }
    }

    uploadFile(file) {
        let data = new FormData();
        data.append("file", file);

        FileService.uploadFile(data).then(response => {

            let documents = _.cloneDeep(this.props.documents) || [];

            let savedDocument = _.cloneDeep(response.data);
            document.documentId = savedDocument.id;
            document.documentName = savedDocument.name;
            document.createdBy = this.context.user.username;
            document.createDate = moment().tz("UTC").format('DD/MM/YYYY HH:mm') + ' UTC';
            document.ineffaceable = false;
            documents.push(document);


            this.props.onChange(documents);

            this.closeDocumentForm();

        }).catch(error => {
            Notify.showError(error);
        });
    }


    handleDownloadClick(data) {
        let url = FileService.generateDownloadUrl(data.documentId);
        window.open(url);
    }

    handleDeleteClick(data) {
        let documents = _.cloneDeep(this.props.documents);

        _.remove(documents, (elem) => {
            return elem.documentId == data.documentId;
        });
        this.props.onChange(documents);
    }


    openDocumentForm() {
        this.clearSelectedFile();
        this.setState({ document: {}, file: null }, () => { this.documentModal.open() });
    }

    closeDocumentForm() {
        this.clearSelectedFile();
        this.setState({ document: {}, file: null }, () => { this.documentModal.close() });
    }

    renderDocumentForm() {
        let actions = [];
        if (this.props.onTheFly) {
            actions.push()
        }
        return (
            <Modal ref={(c) => this.documentModal = c}
                title="New Document"
                closeOnBackgroundClicked={false}
                closeOtherOpenModals={false}
                actions={[{ label: "Close", action: () => this.closeDocumentForm() }]}>
                <Document ref={(c) => this.documentComponent = c}
                    document={this.state.document}
                    onFileChange={(value) => this.uploadFile(value)} />
            </Modal>
        );
    }
    updateState(key, value) {
        let state = _.cloneDeep(this.state);
        state[key] = value;
        this.setState(state);
    }


    openEmailModal(data) {
        EmailService.getMails(_.join(data.emails, ',')).then(response => {
            console.log(response.data);
            this.setState({ emailList: response.data }, () => { this.emailModal.open() })
        });

    }

    renderMailForm() {
        return (
            <Modal ref={(c) => this.emailModal = c}
                medium={true}
                title="Sent Emails"
                closeOnBackgroundClicked={true}
                actions={[
                    { label: "CLOSE", action: () => this.setState({ emailList: [] }, () => this.emailModal.close()) }]}>
                <EmailDetails emailList={_.get(this.state, 'emailList')} />
            </Modal>
        );
    }

    render() {
        let sortedDocuments = _.orderBy(this.props.documents, i => {
            return [moment(i.createDate, 'DD/MM/YYYY HH:mm').format('X')]
        }, ['desc']);
        return (
            <div>
                <ActionHeader title="Documents" operationName={this.props.operations} readOnly={this.props.readOnly}
                    tools={[{ title: "New", items: [{ label: "", onclick: () => this.openDocumentForm({}) }] }]} />
                <GridCell>
                    <Grid divider={true} nomargin={true}>
                        <GridCell width="1-1">
                            <DataTable.Table data={sortedDocuments}>
                                <DataTable.DateTime field="createDate" header="Create Date" width="30" />
                                <DataTable.Text field="createdBy" header="Created By" width="30" printer={new UserPrinter(this.context.getUsers())} />
                                <DataTable.Text width="40" header="Name" field="documentName" sortable={true} />

                                <DataTable.ActionColumn>
                                    <DataTable.ActionWrapper shouldRender={item=>!_.isEmpty(item.emails)} track="onclick" onaction={(data) => { this.openEmailModal(data) }} >
                                        <Button icon="envelope" size="small"/>
                                    </DataTable.ActionWrapper>
                                </DataTable.ActionColumn>

                                <DataTable.ActionColumn>
                                    <DataTable.ActionWrapper shouldRender={() => !this.props.onTheFly} track="onclick" onaction={(data) => { this.handleDownloadClick(data) }}>
                                        <Secure operations = {this.props.operations}>
                                            <Button icon="download" size="small" />
                                        </Secure>
                                    </DataTable.ActionWrapper>
                                </DataTable.ActionColumn>

                                <DataTable.ActionColumn>
                                    <DataTable.ActionWrapper shouldRender={(item) => (!this.props.readOnly && !item.ineffaceable) && item.createdBy == this.context.user.username} track="onclick" onaction={(data) => UIkit.modal.confirm("Are you sure?", () => this.handleDeleteClick(data))}>
                                        <Secure operations = {this.props.operations}>
                                            <Button icon="close" size="small" />
                                        </Secure>
                                    </DataTable.ActionWrapper>
                                </DataTable.ActionColumn>
                            </DataTable.Table>
                        </GridCell>
                    </Grid>
                </GridCell>
                {this.renderDocumentForm()}
                {this.renderMailForm()}
            </div>

        );
    }
}

DocumentList.contextTypes = {
    getUsers: PropTypes.func,
    getAllUsers: PropTypes.func,
    user: PropTypes.object,
};

class UserPrinter {
    constructor(userList){
        this.userList = userList;
    }
    print(data) {
        return _.get(_.find(this.userList, u => u.username == data), 'displayName');
    }
}