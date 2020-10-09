import React from "react";
import _ from "lodash";
import * as axios from "axios";

import {TranslatingComponent} from 'susam-components/abstract';
import {Page, Card, Grid, GridCell, PageHeader, CardHeader, Loader} from "susam-components/layout";
import {Notify, TextInput, Button, DropDown, Checkbox, CheckboxGroup, Span, Form} from 'susam-components/basic';
import {Chip} from 'susam-components/advanced';

import {PlaceList} from '../place/PlaceList';
import {TrailerParkService} from '../../../services/LocationService';

export class TrailerParkList extends TranslatingComponent {

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
        TrailerParkService.list().then(response => {
            this.setState({list: response.data, busy: false});
        }).catch(error => {
            this.setState({busy: false});
            Notify.showError(error);
        });
    }

    handleCreate() {
        this.context.router.push('/ui/management/trailer-park-edit');
    }
    handleEdit(item) {
        this.context.router.push('/ui/management/trailer-park-edit?id=' + item.id);
    }
    handleDelete(item){
        Notify.confirm("You are about to delete this trailer park. Are you sure?", () => {
            TrailerParkService.delete(item).then(response => {
                Notify.showSuccess("Trailer park deleted");
                this.loadPlaces();
            }).catch(error => {
                Notify.showError(error);
            });
        });
    }

    render() {
        if(this.state.busy){
            return <Loader title="Loading trailer parks"/>;
        }

        let title = super.translate("Trailer Parks");

        return (
            <Page title={title} toolbarItems={[
                {name: "Create", library: "material", icon: "note_add", onclick: () => this.handleCreate(), inDropdown: false}]}>
                <Grid>
                    <GridCell width="1-1">
                        <PlaceList list={this.state.list} placeType="Trailer Park"
                                   onEditPlaceClick={(data) => this.handleEdit(data)}
                                   onDeletePlaceClick={(data) => this.handleDelete(data)}>
                        </PlaceList>
                    </GridCell>
                </Grid>
            </Page>
        );
    }
}
TrailerParkList.contextTypes = {
    router: React.PropTypes.object.isRequired
};