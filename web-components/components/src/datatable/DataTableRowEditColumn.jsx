import React from 'react';
import uuid from 'uuid';
import _ from 'lodash';

import {EditWrapper} from './wrappers/EditWrapper'
import {Button} from '../basic';

export class DataTableRowEditColumn extends React.Component{

    constructor(props) {
        super(props);
    };

    componentDidMount(){

    }
    componentDidUpdate(){

    }
    componentWillReceiveProps(){

    }

    handleRowCancelClick(e){
        e.preventDefault();
        this.props.oncancel && this.props.oncancel();
    }
    handleRowSaveClick(e){
        e.preventDefault();
        this.props.onsave && this.props.onsave();
    }
    handleEditBegin(e){
        e.preventDefault();
        this.props.oneditbegin && this.props.oneditbegin();
    }
    handleDeleteClick(e){
        e.preventDefault();
        UIkit.modal.confirm("Are you sure?", () => this.handleDelete());
    }
    handleDelete(){
        this.props.ondelete && this.props.ondelete();
    }

    renderHeader(){
        let width = this.props.width ? this.props.width + "%" : "";
        let className = "filter-false sorter-false";
        return <th className = {className} width={width}></th>;
    }
    renderData(data){
        let editIcon = "";
        if(this.props.editable){
            let isRowEditable = !data.isRowEditable || data.isRowEditable();
            if(this.props.formSettings && this.props.formSettings.showButton) {
                editIcon = <Button label="Edit" style="primary" size="mini" icon="pencil" waves={true} disabled={!isRowEditable}
                                   onclick={(e) => this.handleEditBegin(e)}/>
            } else {
                if (isRowEditable) {
                    editIcon =
                        <a href="#" onClick={(e) => this.handleEditBegin(e)}><i className="md-icon uk-icon-pencil"/></a>;
                } else {
                    editIcon =
                        <i className="md-icon uk-icon-pencil uk-text-muted"/>;
                }
            }
        }
        let deleteIcon = "";
        if(this.props.deletable){
            let isRowDeletable = !data.isRowDeletable || data.isRowDeletable();
            if(this.props.formSettings && this.props.formSettings.showButton) {
                deleteIcon = <Button label="Delete" style="danger" size="mini" icon="times" waves={true} disabled={!isRowDeletable}
                                     onclick={(e) => this.handleDeleteClick(e)}/>
            } else {
                if (isRowDeletable) {
                    deleteIcon =
                        <a href="#" onClick={(e) => this.handleDeleteClick(e)}><i className="md-icon uk-icon-times"/></a>;
                } else {
                    deleteIcon =
                        <i className="md-icon uk-icon-times uk-text-muted"/>;
                }
            }
        }
        if(this.props.isEdit || this.props.isInsert){
            let saveButton = "";
            if(this.props.formSettings && this.props.formSettings.showButton) {
                saveButton = <Button label="Save" style="primary" size="mini" icon="save" waves={true}
                                   onclick={(e) => this.handleRowSaveClick(e)}/>
            } else {
                saveButton = <a href="#" onClick = {(e) => this.handleRowSaveClick(e)}><i className="md-icon uk-icon-save"/></a>;
            }

            let cancelButton = "";
            if(this.props.formSettings && this.props.formSettings.showButton) {
                cancelButton = <Button label="Cancel" style="danger" size="mini" icon="ban" waves={true}
                                     onclick={(e) => this.handleRowCancelClick(e)}/>
            } else {
                cancelButton = <a href="#" onClick = {(e) => this.handleRowCancelClick(e)}><i className="md-icon uk-icon-ban"/></a>
            }

            return(
                <td className="uk-vertical-align uk-text-right">
                    {saveButton}
                    {cancelButton}
                </td>
            );
        } else {
            return(
                <td className="uk-vertical-align uk-text-right">
                    {editIcon}
                    {deleteIcon}
                </td>
            );
        }
    }
    render(){
        if(this.props.data){
            return this.renderData(this.props.data);
        }else{
            return this.renderHeader();
        }
    }
}