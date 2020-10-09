import React from "react";
import {DropDown, TextInput} from "susam-components/basic";
import {Grid, GridCell} from "susam-components/layout";

export class SavedSearches extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            showSaveButton: true,
            showOkButton: false,
            showCancelButton: false,
            showTextBox: false,
            textBoxValue: '',
        };
    }

    componentDidUpdate() {
        if (this.state.showTextBox) {
            $("#" + this.props.id).focus();
        }
    }

    saveButtonClick() {
        if (this.props.selectedSavedSearch) {
            this.props.updateSelectedSavedSearch();
        } else {
            this.setState({
                showSaveButton: false,
                showOkButton: true,
                showCancelButton: true,
                showTextBox: true,
                textBoxValue: '',
            });
        }
    }

    okButtonClick() {
        this.props.addSavedSearch(this.state.textBoxValue);
        this.setState({
            showSaveButton: true,
            showOkButton: false,
            showCancelButton: false,
            showTextBox: false,
            textBoxValue: '',
        });
    }

    cancelButtonClick() {
        this.setState({
            showSaveButton: true,
            showOkButton: false,
            showCancelButton: false,
            showTextBox: false,
            textBoxValue: '',
        });
    }

    deleteButtonClick() {
        this.props.deleteSelectedSavedSearch();
    }

    onSavedSearchNameChange(name) {
        this.setState({textBoxValue: name});
    }

    onSavedSearchChange(values) {
        this.props.onSavedSearchChange(values);
    }

    componentDidUpdate() {
        $("#" + this.props.id).focus();
    }

    render() {
        let saveButton = null;

        if (this.state.showSaveButton) {
            saveButton =
                <a href="javascipt:void(0)"
                   className="md-icon uk-icon-button uk-icon-save"
                   onClick={() => this.saveButtonClick()}/>
        }

        let okButton = null;

        if (this.state.showOkButton) {
            okButton =
                <a href="javascipt:void(0)"
                   className="md-icon uk-icon-button"
                   onClick={() => this.okButtonClick()}>
                    <i className="material-icons">done</i>
                </a>;
        }

        let cancelButton = null;

        if (this.state.showCancelButton) {
            cancelButton =
                <a href="javascipt:void(0)"
                   className="md-icon uk-icon-button uk-icon-remove"
                   onClick={() => this.cancelButtonClick()}/>;
        }

        let deleteButton = null;

        if (this.props.selectedSavedSearch) {
            deleteButton =
                <a href="javascipt:void(0)"
                   className="md-icon uk-icon-button"
                   onClick={() => this.deleteButtonClick()}>
                    <i className="material-icons">delete</i>
                </a>;
        }

        let input = null;

        if (this.state.showTextBox) {
            input =
                <TextInput
                    id={this.props.id}
                    onchange={(value) => this.onSavedSearchNameChange(value)}
                    value={this.state.textBoxValue}
                    required={true}
                    placeholder="name"/>;
        } else {
            input =
                <DropDown
                    id={this.props.id}
                    onchange={(value) => this.props.onSavedSearchChange(value)}
                    options={this.props.savedSearches}
                    valueField="id"
                    labelField="name"
                    value={this.props.selectedSavedSearch}/>;
        }

        return (
            <Grid collapse="true">
                <GridCell noMargin="true" width="2-6">
                    <b>My Searches</b>
                </GridCell>
                <GridCell noMargin="true" width="3-6">
                    <div className="savedSearchesInput">
                        {input}
                    </div>
                </GridCell>
                <GridCell noMargin="true" width="1-6">
                    <div className="savedSearchesActions">
                        {saveButton}
                        {okButton}
                        {cancelButton}
                        {deleteButton}
                    </div>
                </GridCell>
            </Grid>
        );
    }
}