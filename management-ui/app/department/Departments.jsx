import React from 'react';

import {TranslatingComponent} from 'susam-components/abstract';
import {Button, Notify} from 'susam-components/basic';
import {Page, Card, Grid, GridCell} from 'susam-components/layout';
import {AuthorizationService} from '../services';

import {DepartmentList} from './DepartmentList';
import {DepartmentForm} from './DepartmentForm';

export class Departments extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            departments: [],
            selectedItem: this.createNew()
        };
    };

    componentDidMount() {
        this.loadList();
    }

    loadList(){
        AuthorizationService.getAllDepartments().then(response => {
            this.setState({departments: response.data});
        }).catch(error => {
            Notify.showError(error);
        });
    }

    createNew(){
        return {};
    }

    handleSelectFromList(item){
        this.handleCreate();
        this.setState({selectedItem: item});
    }

    handleUpdateState(key, value){
        let currentState = _.cloneDeep(this.state.selectedItem);
        _.set(currentState, key, value);
        this.setState({selectedItem: currentState});
    }

    handleCreate(){
        this.form.reset();
        this.setState({
            selectedItem: this.createNew()
        })
    }

    handleSave(){
        if(!this.form.validate()){
            return;
        }
        let item = _.cloneDeep(this.state.selectedItem);
        AuthorizationService.saveDepartment(item).then(response => {
            Notify.showSuccess("Department schedule saved");
            this.loadList();
            this.setState({selectedItem: response.data});
        }).catch(error => {
            Notify.showError(error);
        });
    }

    handleDelete(){
        let item = _.cloneDeep(this.state.selectedItem);
        if (item.id) {
            UIkit.modal.confirm("Are you sure?", () => {
                AuthorizationService.deleteDepartment(item.id).then(response => {
                    Notify.showSuccess("Department deleted");
                    this.loadList();
                    this.handleCreate();
                }).catch(error => {
                    Notify.showError(error);
                });
            });
        }
        else {
            Notify.showError("You need to choose an item first");
        }
    }

    render() {
        let title = super.translate("Departments");

        let list = <DepartmentList data = {this.state.departments}
                                   selectedItem = {this.state.selectedItem}
                                   onselect = {(item) => this.handleSelectFromList(item)}
                                   height={this.state.height} />;

        let form = <DepartmentForm ref = {(c) => this.form = c}
                                   selectedItem = {this.state.selectedItem}
                                   onchange = {(key, value) => this.handleUpdateState(key, value)}/>;

        return (
            <Page title = {title} toolbarItems={[
                {name: "Create", library: "material", icon: "note_add", onclick: () => this.handleCreate(), inDropdown: false},
                {name: "Save", library: "material", icon: "save", onclick: () => this.handleSave(), inDropdown: false},
                {name: "Delete", library: "material", icon: "delete", onclick: () => this.handleDelete(), inDropdown: true}]}>

                <Grid divider={true}>
                    <GridCell width="1-5" noMargin={true}>
                        {list}
                    </GridCell>
                    <GridCell width="4-5" noMargin={true}>
                        {form}
                    </GridCell>
                </Grid>
            </Page>
        );
    }
}
