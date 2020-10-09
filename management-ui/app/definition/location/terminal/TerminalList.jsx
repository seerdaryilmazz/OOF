import React from "react";
import _ from "lodash";
import * as axios from "axios";

import {TranslatingComponent} from 'susam-components/abstract';
import {Page, Card, Grid, GridCell, PageHeader, CardHeader, Loader} from "susam-components/layout";
import {Notify, TextInput, Button, DropDown, Checkbox, CheckboxGroup, Span, Form} from 'susam-components/basic';
import {Chip} from 'susam-components/advanced';

import {PlaceList} from '../place/PlaceList';

import {TerminalService} from '../../../services/LocationService';
import {PhoneNumberUtils} from 'susam-components/utils';


export class TerminalList extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            lookup: {}
        }
    }

    componentDidMount() {
        this.loadPlaces();
    }

    loadPlaces() {
        this.setState({busy: true});
        TerminalService.list().then(response => {
            this.setState({list: response.data, busy: false});
        }).catch(error => {
            this.setState({busy: false});
            Notify.showError(error);
        });
    }

    handleCreate() {
        this.context.router.push('/ui/management/terminal-edit');
    }

    handleEdit(item) {
        this.context.router.push('/ui/management/terminal-edit?id=' + item.id);
    }

    handleDelete(item){
        Notify.confirm("You are about to delete this terminal. Are you sure?", () => {
            TerminalService.delete(item).then(response => {
                Notify.showSuccess("Terminal deleted");
                this.loadPlaces();
            }).catch(error => {
                Notify.showError(error);
            });
        });
    }

    render() {
        if(this.state.busy){
            return <Loader title="Loading terminals"/>;
        }

        let title = super.translate("Terminals");

        return (
            <Page title = {title} toolbarItems={[
                {name: "Create", library: "material", icon: "note_add", onclick: () => this.handleCreate(), inDropdown: false}]}>
                    <PlaceList list={this.state.list} placeType="Terminal"
                               onEditPlaceClick={(data) => this.handleEdit(data)}
                               onDeletePlaceClick={(data) => this.handleDelete(data)}>
                    </PlaceList>
            </Page>
        );
    }
}
TerminalList.contextTypes = {
    router: React.PropTypes.object.isRequired
};