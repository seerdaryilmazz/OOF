import _ from "lodash";
import * as axios from 'axios';
import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {Page, Grid, GridCell, Card, Loader, CardHeader, PageHeader} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown, Form} from "susam-components/basic";

import {IncotermService} from "../../services";

import {IncotermsList} from './IncotermsList';
import {IncotermsForm} from './IncotermsForm';

export class Incoterms extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            selectedItem: this.createNew()
        };
    }

    componentDidMount(){
        this.loadList();
    }

    loadList(){
        IncotermService.list().then(response => {
            this.setState({incoterms: response.data});
        }).catch(error => {
            Notify.showError(error);
        });
    }

    createNew(){
        return {active: true, description: "", code: "", name:""};
    }

    handleSelectFromList(item) {
        this.handleCreate();
        this.setState({selectedItem: item});
    }

    handleUpdateState(key, value){
        let currentState = _.cloneDeep(this.state.selectedItem);
        _.set(currentState, key, value);
        this.setState({selectedItem: currentState});
    }

    handleUpdateCode(value){
        let incoterm = _.cloneDeep(this.state.selectedItem);
        incoterm.code = value.toUpperCase();
        incoterm.name = value.toUpperCase();
        this.setState({selectedItem: incoterm});
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
        let sameName = _.find(this.state.incoterms, {name: this.state.selectedItem.name});
        if(sameName){
            if(sameName.id != this.state.selectedItem.id){
                Notify.showError("There is already an incoterm with this name");
                return;
            }
        }
        IncotermService.save(this.state.selectedItem).then(response => {
            Notify.showSuccess("Incoterm saved");
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
                IncotermService.delete(item).then(response => {
                    Notify.showSuccess("Incoterm deleted");
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

    handleActivation(){
        let item = _.cloneDeep(this.state.selectedItem);
        if (item.active) {
            this.handleInactivate(item);
        }
        else{
            this.handleActivate(item);
        }
    }

    handleInactivate(item){
        IncotermService.inactivate(item).then(response => {
            Notify.showSuccess("Incoterm inactivated");
            let item = _.cloneDeep(this.state.selectedItem);
            item.active = false;
            this.setState({
                selectedItem:item
            });
            this.loadList();
        }).catch(error => {
            Notify.showError(error);
        });
    }

    handleActivate(item){
        IncotermService.activate(item).then(response => {
            Notify.showSuccess("Incoterm activated");
            let item = _.cloneDeep(this.state.selectedItem);
            item.active = true;
            this.setState({
                selectedItem:item
            });
            this.loadList();
        }).catch(error => {
            Notify.showError(error);
        });
    }

    retrieveActiveInactiveText() {
        if(this.state.selectedItem.active) {
            return super.translate("Inactivate");
        } else {
            return super.translate("Activate");
        }
    }

    render(){
        let title = super.translate("Incoterms");

        let list = <IncotermsList data = {this.state.incoterms}
                                  selectedItem = {this.state.selectedItem}
                                  onselect = {(item) => this.handleSelectFromList(item)}
                                  height={this.state.height} />;

        let form = <IncotermsForm ref = {(c) => this.form = c}
                                  selectedItem = {this.state.selectedItem}
                                  onchange = {(key, value) => this.handleUpdateState(key, value)}
                                  oncodechange = {(value) => this.handleUpdateCode(value)}/>;

        return (
            <Page title = {title} toolbarItems={[
                {name: "Create", library: "material", icon: "note_add", onclick: () => this.handleCreate(), inDropdown: false},
                {name: "Save", library: "material", icon: "save", onclick: () => this.handleSave(), inDropdown: false},
                (this.state.selectedItem.name) ? {name: this.retrieveActiveInactiveText(), library: "material", icon: "block", onclick: () => this.handleActivation(), inDropdown: true} : {library: "none"},
                {name: "Delete", library: "material", icon: "delete", onclick: () => this.handleDelete(), inDropdown: true}]}>

                <Grid divider = {true}>
                    <GridCell width="1-4" noMargin = {true}>
                        {list}
                    </GridCell>
                    <GridCell width="3-4" noMargin = {true}>
                        {form}
                    </GridCell>
                </Grid>
            </Page>
        );
    }
}