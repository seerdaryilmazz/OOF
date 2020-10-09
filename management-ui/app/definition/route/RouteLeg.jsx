import _ from "lodash";
import * as axios from 'axios';
import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card, Loader, CardHeader, PageHeader} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown, Form} from "susam-components/basic";

import {RouteService} from "../../services";

import {RouteLegList} from './RouteLegList';
import {RouteLegForm} from './RouteLegForm';

export class RouteLeg extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {lookups: {}};
    }

    componentDidMount(){
        axios.all([
            RouteService.getRouteLegTypes(),
            RouteService.getRouteLocationTypes(),
            RouteService.getAllRouteLegs()
        ]).then(axios.spread((routeLegTypesResponse, locationTypesResponse, routeLegsResponse) => {
            let state = _.cloneDeep(this.state);
            state.lookups = {};
            state.lookups.routeLegTypes = routeLegTypesResponse.data;
            state.lookups.locationTypes = locationTypesResponse.data;
            state.routeLegs = routeLegsResponse.data;

            this.setState(state);

        })).catch((error) => {
            Notify.showError(error);
        });
    }

    refreshRouteLegs(){
        RouteService.getAllRouteLegs().then(response => {
            this.setState({routeLegs: response.data});
        }).catch(error => {
            Notify.showError(error);
        });
    }

    handleSelectFromList(item){
        this.setState({selectedItem: item});
    }

    handleCreateNew(type){
        let routeLeg = {type: type, from: {}, to: {}};
        this.setState({selectedItem: routeLeg});
    }

    handleSave(value){
        this.setState({selectedItem: value});
        RouteService.saveRouteLeg(value).then(response => {
            Notify.showSuccess("Route leg saved");
            this.refreshRouteLegs();
        }).catch(error => {
            Notify.showError(error);
        });
    }
    handleDelete(value){
        UIkit.modal.confirm("Are you sure?", () => {
            RouteService.deleteRouteLeg(value).then(response => {
                Notify.showSuccess("Route leg deleted");
                this.refreshRouteLegs();
            }).catch(error => {
                Notify.showError(error);
            });
        });
    }


    render(){
        return(
            <div>
                <PageHeader title="Linehaul Route Legs" />
                <Card>
                    <Grid divider = {true}>
                        <GridCell width="1-3" noMargin = {true}>
                            <RouteLegList data = {this.state.routeLegs}
                                          types = {this.state.lookups.routeLegTypes}
                                          onselect = {(value) => this.handleSelectFromList(value)}
                                          oncreate = {(value) => this.handleCreateNew(value)}
                                          ondelete = {(value) => this.handleDelete(value)}/>
                        </GridCell>
                        <GridCell width="2-3" noMargin = {true}>
                            <RouteLegForm data = {this.state.selectedItem}
                                          lookups = {this.state.lookups}
                                          onsave = {(data) => this.handleSave(data)}
                                          ondelete = {(data) => this.handleDelete(data)} />
                        </GridCell>
                    </Grid>
                </Card>
            </div>
        );
    }
}