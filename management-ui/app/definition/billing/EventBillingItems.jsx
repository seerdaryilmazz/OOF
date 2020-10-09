import _ from "lodash";
import * as axios from 'axios';
import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {Page, Grid, GridCell, Card, Loader, CardHeader, PageHeader} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown, Form} from "susam-components/basic";

import {BillingService} from "../../services";

import {EventBillingItemForm} from './EventBillingItemForm';
import {EventBillingItemList} from './EventBillingItemList';

export class EventBillingItems extends TranslatingComponent {

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
        BillingService.list().then(response => {
            console.log(response.data);
            this.setState({eventBillingItems: response.data});
        }).catch(error => {
            Notify.showError(error);
        });
    }

    createNew(){
        return {event: {}, billingItem: {}};
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

        BillingService.save(this.state.selectedItem).then(response => {
            Notify.showSuccess("Billing item saved");
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
                BillingService.delete(item).then(response => {
                    Notify.showSuccess("Billing item deleted");
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

    render(){
        let title = super.translate("Billing Items");

        let list = <EventBillingItemList data = {this.state.eventBillingItems}
                                  selectedItem = {this.state.selectedItem}
                                  onselect = {(item) => this.handleSelectFromList(item)}
                                  height={this.state.height} />;

        let form = <EventBillingItemForm ref = {(c) => this.form = c}
                                  selectedItem = {this.state.selectedItem}
                                  onchange = {(key, value) => this.handleUpdateState(key, value)} />;

        return (
            <Page title = {title} toolbarItems={[
                {name: "Create", library: "material", icon: "note_add", onclick: () => this.handleCreate(), inDropdown: false},
                {name: "Save", library: "material", icon: "save", onclick: () => this.handleSave(), inDropdown: false},
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