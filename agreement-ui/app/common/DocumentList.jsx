import React from "react";
import {TranslatingComponent} from 'susam-components/abstract';
import {GridCell, Grid, Modal} from "susam-components/layout";
import * as DataTable from 'susam-components/datatable';
import {Button, Notify} from 'susam-components/basic';
import {Document} from "./Document";
import {UserService} from '../services/UserService';
import {FileService} from '../services/FileService';
import {ActionHeader} from '../utils/ActionHeader';
import {withAuthorization} from "../utils";

var moment = require('moment');
require('moment-timezone');

var userList = null;
export class DocumentList extends TranslatingComponent {

    static defaultProps = {
        documents:[]
    }

    constructor(props) {
        super(props);
        this.state = {
            documents: [],
            document: {},
            file: null
        };
        UserService.getUsers().then(response=>{
            userList = response.data;
        });
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


    openDocumentForm(){
        this.clearSelectedFile();
        this.setState({document: {}, file: null}, () => {this.documentModal.open()});
    }

    closeDocumentForm(){
        this.clearSelectedFile();
        this.setState({document: {}, file: null}, () => {this.documentModal.close()});
    }

    renderDocumentForm(){
        let actions = [];
        if(this.props.onTheFly){
            actions.push()
        }
        return(
            <Modal ref={(c) => this.documentModal = c}
                   title = "New Document"
                   closeOnBackgroundClicked={false}
                   closeOtherOpenModals={false}
                   actions={[{label: "Close", action: () => this.closeDocumentForm()}]}>
                <Document ref={(c) => this.documentComponent = c}
                          document = {this.state.document}
                          onFileChange={(value) => this.uploadFile(value)}/>
            </Modal>
        );
    }

    render(){
        let sortedDocuments = _.orderBy(this.props.documents, i=>{
            return [moment(i.createDate, 'DD/MM/YYYY HH:mm').format('X')]
        }, ['desc']);
        return (
            <div>
                <ActionHeader title="Documents" operationName={this.props.operations} readOnly={this.props.readOnly}
                              tools={[{title: "New", items: [{label: "", onclick: () => this.openDocumentForm({})}]}]} />
                <GridCell>
                    <Grid divider = {true} nomargin={true}>
                        <GridCell width="1-1">
                            <DataTable.Table data={sortedDocuments}>
                                <DataTable.DateTime field="createDate" header="Create Date" width="30"/>
                                <DataTable.Text field="createdBy" header="Created By" width="30" printer={new UserPrinter(this.state.userList)}/>
                                <DataTable.Text width="40" header="Name" field="documentName" sortable={true}/>
                                <DataTable.ActionColumn >
                                    <DataTable.ActionWrapper shouldRender = {() => !this.props.onTheFly} track="onclick" onaction={(data) => {this.handleDownloadClick(data)}}>
                                        <Button icon="download" size="small"/>
                                    </DataTable.ActionWrapper>
                                    <DataTable.ActionWrapper shouldRender = {(item) => (!this.props.readOnly && !item.ineffaceable) && item.createdBy == this.context.user.username} track="onclick" onaction = {(data) => UIkit.modal.confirm("Are you sure?", () => this.handleDeleteClick(data))}>
                                        <Button icon="close" size="small" />
                                    </DataTable.ActionWrapper>
                                </DataTable.ActionColumn>
                            </DataTable.Table>
                        </GridCell>
                    </Grid>
                </GridCell>
                {this.renderDocumentForm()}
            </div>

        );
    }
}

DocumentList.contextTypes = {
    user: React.PropTypes.object,
};

class UserPrinter{
    print(data){
        return _.get(_.find(userList, u=>u.username == data),'displayName');
    }
}