import React from "react";
import PropTypes from "prop-types";

import {TranslatingComponent} from 'susam-components/abstract';
import {Page, Card, Grid, GridCell, PageHeader, CardHeader, Loader} from "susam-components/layout";
import {Notify, TextInput, Button, DropDown, Checkbox, CheckboxGroup, Span, Form} from 'susam-components/basic';

import {PlaceList} from '../place/PlaceList';

import {PortService} from '../../../services/LocationService';


export class PortList extends TranslatingComponent {

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
        PortService.list().then(response => {
            this.setState({list: response.data, busy: false});
        }).catch(error => {
            this.setState({busy: false});
            Notify.showError(error);
        });
    }

    handleCreate() {
        this.context.router.push('/ui/management/port-edit');
    }

    handleEdit(item) {
        this.context.router.push('/ui/management/port-edit?id=' + item.id);
    }

    handleDelete(item){
        Notify.confirm("You are about to delete this port. Are you sure?", () => {
            PortService.delete(item).then(response => {
                Notify.showSuccess("Port deleted");
                this.loadPlaces();
            }).catch(error => {
                Notify.showError(error);
            });
        });
    }

    render() {
        if(this.state.busy){
            return <Loader title="Loading ports"/>;
        }

        let title = super.translate("Ports");

        return (
            <Page title = {title} toolbarItems={[
                  {name: "Create", library: "material", icon: "note_add", onclick: () => this.handleCreate(), inDropdown: false}]}>
                  <PlaceList list={this.state.list} placeType="Port"
                             onEditPlaceClick={(data) => this.handleEdit(data)}
                             onDeletePlaceClick={(data) => this.handleDelete(data)}>
                  </PlaceList>
            </Page>
        );
    }
}
PortList.contextTypes = {
    router: PropTypes.object.isRequired
};