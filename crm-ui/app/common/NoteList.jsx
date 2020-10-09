import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, Notify } from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';
import { Grid, GridCell, Modal, Secure } from "susam-components/layout";
import { NoteService } from '../services';
import { ActionHeader } from '../utils/ActionHeader';
import { Mail } from "./Mail";
import { Note } from "./Note";
import PropTypes from "prop-types";

var moment= require('moment');
require('moment-timezone');
export class NoteList extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {};
    }

    updateState(key, value){
        let state = _.cloneDeep(this.state);
        _.set(state, key, value)
        this.setState(state);
    }

    retrieveNote(id, mail, readOnly) {
        NoteService.getNoteById(id).then(response => {
            mail ? this.openMailModal(response.data) : this.openNoteModal(response.data, readOnly);
        }).catch(error => {
            this.setState({busy: false});
            console.log(error);
            Notify.showError(error);
        });
    }

    handleAddNote(){
        if(this.noteComponent.form.validate()) {
            let note = this.state.note;
            NoteService.saveNote(note).then(response => {
                let notes = _.cloneDeep(this.props.notes) || [];
                let savedNote = _.cloneDeep(response.data);
                savedNote.createDate = moment().tz('UTC').format('DD/MM/YYYY HH:mm') + ' UTC'; 
                savedNote.id = undefined;
                savedNote.noteId = response.data.id;
                notes.push(savedNote);
                this.props.onChange(notes);
                this.closeNoteModal();

            }).catch(error => {
                this.setState({busy: false});
                Notify.showError(error);
            });
        }
    }

    handleEditNote(){
        if(this.noteComponent.form.validate()){
            NoteService.saveNote(this.state.note).then(response => {
                let notes = _.cloneDeep(this.props.notes) || [];
                if(notes){
                    const index = notes.findIndex(note => note.noteId === this.state.note.id);
                    if (index !== -1) {
                        let savedNote = _.cloneDeep(response.data);
                        savedNote.id = notes[index].id;
                        savedNote.noteId = response.data.id;
                        notes[index] = savedNote;
                        this.props.onChange(notes);
                        this.closeNoteModal();
                    }
                }
            }).catch(error => {
                this.setState({busy: false});
                Notify.showError(error);
            });
        }
    }

    handleDeleteNote(data){
        let notes = _.cloneDeep(this.props.notes);
        if(notes){
            const index = notes.findIndex(note => note.noteId === data.noteId);
            if (index !== -1) {
                notes.splice(index, 1);
                this.props.onChange(notes);
            }
        }
    }

    openNoteModal(note, readOnly){
        let state = _.cloneDeep(this.state);
        state.note = note;
        state.readOnly = readOnly;
        this.setState(state, () => {this.noteModal.open()});
    }

    openMailModal(note){
        let state = _.cloneDeep(this.state);
        state.note = note;
        this.setState(state, () => {this.mailModal.open()});
    }

    closeNoteModal(){
        this.setState({note: undefined}, this.noteModal.close());
    }

    closeMailModal(){
        this.setState({note: undefined}, this.mailModal.close());
    }

    renderNoteModal(){
        let actions =[];
        if(!this.state.readOnly){
            actions.push({label: "SAVE", action: () => {this.state.note.id ? this.handleEditNote() : this.handleAddNote()}});
        }
        actions.push({label: "CLOSE", action: () => this.closeNoteModal()});
        return(
            <Modal ref={(c) => this.noteModal = c}
                   title = "Note"
                   closeOnBackgroundClicked={false}
                   large={true}
                   actions={actions}
                   minHeight="400px">
                {this.renderNoteForm()}

            </Modal>
        );
    }

    renderNoteForm(){
        if(this.state.note) {
            return (
                <Note ref={(c) => this.noteComponent = c}
                      isSpotQuote={this.props.isSpotQuote}
                      note = {this.state.note}
                      readOnly={this.state.readOnly}
                      onChange={(value) => this.updateState("note", value)}/>
            );
        }
    }

    renderMailModal(){
        return (
            <Modal ref={(c) => this.mailModal = c}
                   title = "Send Mail"
                   closeOnBackgroundClicked={false}
                   large={true}>
                {this.renderMailForm()}
            </Modal>
        );
    }

    renderMailForm(){
        if(this.state.note && this.state.note.id) {
            return (
                <Mail subject={this.state.note.type.name}
                      content={this.state.note.content}
                      users={this.props.users}
                      contacts={this.props.contacts}
                      internalRecipients={this.props.internalRecipients}
                      externalRecipients={this.props.externalRecipients}
                      attachments={this.props.documents}
                      contentReadOnly={true}
                      operations={this.props.operations}
                      onClose={() => this.closeMailModal()}/>
            );
        }
    }

    render(){
        let sortedNotes = _.orderBy(this.props.notes, i=>{
            return [moment(i.createDate, 'DD/MM/YYYY HH:mm').format('X')]
        }, ['desc']);
        return (
            <div>
                <ActionHeader title="Notes" operationName={this.props.operations} readOnly={this.props.readOnly}
                              tools={[{title: "New", items: [{label: "", onclick: () => this.openNoteModal({}, false)}]}]} />
                <Grid divider = {true} nomargin={true}>
                    <GridCell width="1-1">
                        <DataTable.Table data={sortedNotes}>
                            <DataTable.DateTime field="createDate" header="Create Date" width="30"/>
                            <DataTable.Text field="createdBy" header="Created By" width="30" printer = {new UserPrinter(this.context.getUsers())}/>
                            <DataTable.Text field="type.name" translator={this} header="Type" width="40"/>
                            <DataTable.ActionColumn>
                                <DataTable.ActionWrapper  key="viewNote" track="onclick" onaction = {(data) => this.retrieveNote(data.noteId, false, true)}>
                                    <Secure operations={this.props.operations}>
                                        <Button icon="eye" size="small" />
                                    </Secure>
                                </DataTable.ActionWrapper>
                                <DataTable.ActionWrapper  shouldRender = {() => !this.props.readOnly && this.props.mailFeature} key="shareNote" track="onclick" onaction = {(data) => this.retrieveNote(data.noteId, true, false)}>
                                    <Secure operations={this.props.operations}>
                                        <Button icon="forward" size="small" />
                                    </Secure>
                                </DataTable.ActionWrapper>
                                <DataTable.ActionWrapper shouldRender = {(data) => !this.props.readOnly && data.createdBy === this.context.user.username} key="editNote" track="onclick" onaction = {(data) => this.retrieveNote(data.noteId, false, false)}>
                                    <Secure operations={this.props.operations}>
                                        <Button icon="pencil" size="small" />
                                    </Secure>
                                </DataTable.ActionWrapper>
                                <DataTable.ActionWrapper shouldRender = {(data) => !this.props.readOnly && data.createdBy === this.context.user.username && data.createdBy === this.context.user.username} key="deleteNote" track="onclick" onaction = {(data) => UIkit.modal.confirm("Are you sure?", () => this.handleDeleteNote(data))}>
                                    <Secure operations={this.props.operations}>
                                        <Button icon="close" size="small" />
                                    </Secure>
                                </DataTable.ActionWrapper>
                            </DataTable.ActionColumn>
                        </DataTable.Table>
                    </GridCell>
                </Grid>
                {this.renderNoteModal()}
                {this.renderMailModal()}
            </div>
        );
    }
}

NoteList.contextTypes = {
    getUsers: PropTypes.func,
    getAllUsers: PropTypes.func,
    user: PropTypes.object,
    translator: PropTypes.object
};

class UserPrinter {

    constructor(userList) {
        this.userList = userList;
    }

    print(data) {
        return _.get(_.find(this.userList, u => u.username == data), 'displayName');
    }
}