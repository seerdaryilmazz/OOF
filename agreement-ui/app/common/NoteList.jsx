import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {GridCell, Grid, Modal} from "susam-components/layout";
import * as DataTable from 'susam-components/datatable';
import {Notify, Button} from 'susam-components/basic';
import {Note} from "./Note";
import {ActionHeader} from '../utils/ActionHeader';
import {NoteService} from '../services/NoteService';
import {UserService} from '../services/UserService';

var userList = null;
var moment= require('moment');
require('moment-timezone');
export class NoteList extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {};

        UserService.getUsers().then(response =>{
            userList = response.data;
        });
    }

    updateState(key, value){
        let state = _.cloneDeep(this.state);
        _.set(state, key, value)
        this.setState(state);
    }

    retrieveNote(id, mail, readOnly) {
        NoteService.getNoteById(id).then(response => {
            this.openNoteModal(response.data, readOnly);
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

    closeNoteModal(){
        this.setState({note: undefined}, this.noteModal.close());
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
                      note = {this.state.note}
                      readOnly={this.state.readOnly}
                      onChange={(value) => this.updateState("note", value)}/>
            );
        }
    }

    render(){
        let sortedNotes = _.orderBy(this.props.notes, i=>{
            return [moment(i.createDate, 'DD/MM/YYYY HH:mm').format('X')]
        }, ['desc']);
        return (
            <div>
                <ActionHeader title="Notes" readOnly={this.props.readOnly}
                              tools={[{title: "New", items: [{label: "", onclick: () => this.openNoteModal({}, false)}]}]} />
                <Grid divider = {true} nomargin={true}>
                    <GridCell width="1-1">
                        <DataTable.Table data={sortedNotes}>
                            <DataTable.DateTime field="createDate" header="Create Date" width="30"/>
                            <DataTable.Text field="createdBy" header="Created By" width="30" printer = {new UserPrinter(this.state.userList)}/>
                            <DataTable.Text field="type.name" header="Type" width="40"/>
                            <DataTable.ActionColumn>
                                <DataTable.ActionWrapper  key="viewNote" track="onclick" onaction = {(data) => this.retrieveNote(data.noteId, false, true)}>
                                    <Button icon="eye" size="small"/>
                                </DataTable.ActionWrapper>
                                <DataTable.ActionWrapper  shouldRender = {() => !this.props.readOnly && this.props.mailFeature} key="shareNote" track="onclick" onaction = {(data) => this.retrieveNote(data.noteId, true, false)}>
                                    <Button icon="forward" size="small"/>
                                </DataTable.ActionWrapper>
                                <DataTable.ActionWrapper shouldRender = {(data) => !this.props.readOnly && data.createdBy === this.context.user.username} key="editNote" track="onclick" onaction = {(data) => this.retrieveNote(data.noteId, false, false)}>
                                    <Button icon="pencil" size="small"/>
                                </DataTable.ActionWrapper>
                                <DataTable.ActionWrapper shouldRender = {(data) => !this.props.readOnly && data.createdBy === this.context.user.username && data.createdBy === this.context.user.username} key="deleteNote" track="onclick" onaction = {(data) => UIkit.modal.confirm("Are you sure?", () => this.handleDeleteNote(data))}>
                                    <Button icon="close" size="small"/>
                                </DataTable.ActionWrapper>
                            </DataTable.ActionColumn>
                        </DataTable.Table>
                    </GridCell>
                </Grid>
                {this.renderNoteModal()}
            </div>
        );
    }
}

NoteList.contextTypes = {
    user: React.PropTypes.object,
};

class UserPrinter{

    print(data){
        return _.get(_.find(userList, u => u.username == data), 'displayName');
    }
}

class DatePrinter{
  
    print(data){
        data= moment().format('DD/MM/YYYY HH:mm');
        return data;
    }
}