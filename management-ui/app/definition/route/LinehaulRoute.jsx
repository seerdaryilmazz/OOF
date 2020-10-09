import _ from "lodash";
import * as axios from 'axios';
import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {Page, Grid, GridCell, Card, Loader, CardHeader, PageHeader} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown, Form} from "susam-components/basic";

import {LinehaulRouteList} from './LinehaulRouteList';
import {LinehaulRouteForm} from './LinehaulRouteForm';
import {RouteService} from "../../services";

export class LinehaulRoute extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount(){
        axios.all([
            RouteService.getRoutes()
        ]).then(axios.spread((routesResponse) => {
            let state = _.cloneDeep(this.state);
            state.routes = routesResponse.data;
            state.selectedItem = this.createNew();
            this.setState(state);
        })).catch((error) => {
            Notify.showError(error);
        });
    }
    getLinehaulRoutes(){
        RouteService.getRoutes().then(response => {
            let state = _.cloneDeep(this.state);
            state.routes = response.data;
            this.setState(state);
        }).catch(error => {
            Notify.showError(error);
        });
    }
    createNew(){
        return {fragments: [], routeLegs: []};
    }

    handleUpdateState(key, value){
        let currentState = _.cloneDeep(this.state.selectedItem);
        _.set(currentState, key, value);
        this.setState({selectedItem: currentState});
    }

    handleUpdateRoute(value){
        console.log(value.route);
        this.setState({selectedItem: value.route});
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
        RouteService.saveRoute(item).then(response => {
            Notify.showSuccess("Linehaul route saved");
            this.handleCreate();
            this.getLinehaulRoutes();
        }).catch(error => {
            Notify.showError(error);
        });

    }
    handleDelete(){
        let item = _.cloneDeep(this.state.selectedItem);
        if (item.id) {
            UIkit.modal.confirm("Are you sure?", () => {
                RouteService.deleteRoute(item).then(response => {
                    Notify.showSuccess("Linehaul route deleted");
                    this.handleCreate();
                    this.getLinehaulRoutes();
                }).catch(error => {
                    Notify.showError(error);
                });
            });
        }
        else {
            Notify.showError("You need to choose an item first");
        }
    }

    handleSelectFromList(item){
        this.handleCreate();
        this.setState({selectedItem: item});

    }


    render(){
        let title = super.translate("Linehaul Routes");

        let list = <LinehaulRouteList data = {this.state.routes}
                                      selectedItem = {this.state.selectedItem}
                                      onselect = {(value) => this.handleSelectFromList(value)}/>;

        let form = <LinehaulRouteForm ref = {(c) => this.form = c}
                                      selectedItem = {this.state.selectedItem}
                                      onsave = {(data) => this.handleSave(data)}
                                      onchange = {(key, value) => this.handleUpdateState(key, value)}
                                      onroutechange = {(data) => this.handleUpdateRoute(data)} />;

        return(
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