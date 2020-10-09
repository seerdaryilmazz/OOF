import _ from "lodash";
import * as axios from 'axios';
import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card, Loader, CardHeader, PageHeader} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown, Form} from "susam-components/basic";

import {CollectionSchedulesService, CommonService, ZoneService} from "../../services";

import {CollectionScheduleList} from './CollectionScheduleList';
import {CollectionScheduleForm} from './CollectionScheduleForm';

export class CollectionSchedules extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {lookups: {}};
    }

    componentDidMount(){
        axios.all([
            CollectionSchedulesService.getSchedules(),
            CommonService.getServiceTypes(),
            CommonService.getDaysOfWeek(),
            CommonService.retrieveRegionCategory(),
            ZoneService.getOperationRegionListAccordingToQueryThree()
        ]).then(axios.spread((schedules, serviceTypes, days, categories, operationRegions) => {
            let state = _.cloneDeep(this.state);
            state.schedules = schedules.data;
            state.lookups.serviceTypes = serviceTypes.data;
            state.lookups.days = days.data;
            state.lookups.categories = categories.data;
            state.lookups.operationRegions = operationRegions.data;
            this.setState(state);

        })).catch((error) => {
            Notify.showError(error);
        });
    }

    refreshList(){
        CollectionSchedulesService.getSchedules().then(response => {
            this.setState({schedules: response.data});
        }).catch(error => {
            Notify.showError(error);
        });
    }

    handleSelectFromList(item){
        item.collectionRegion = {id: item.collectionRegionId, name: item.collectionRegionName};
        this.setState({selectedItem: item});
    }

    handleCreateNewClick(){
        let schedule = {};
        this.setState({selectedItem: schedule});
    }

    handleSave(value){
        if(value.collectionRegion) {
            value.collectionRegionId = value.collectionRegion.id;
            value.collectionRegionName = value.collectionRegion.name;
        } else {
            value.collectionRegionId = null;
            value.collectionRegionName = null;
        }
        this.setState({selectedItem: value});
        CollectionSchedulesService.saveSchedule(value).then(response => {
            Notify.showSuccess("Collection schedule saved");
            this.refreshList();
        }).catch(error => {
            Notify.showError(error);
        });
    }
    handleDelete(value){
        UIkit.modal.confirm("Are you sure?", () => {
            CollectionSchedulesService.deleteSchedule(value).then(response => {
                Notify.showSuccess("Collection schedule deleted");
                this.refreshList();
                this.handleCreateNewClick();
            }).catch(error => {
                Notify.showError(error);
            });
        });
    }

    render(){
        return(
            <div>
                <PageHeader title="Collection Schedules" />
                <Card>
                    <Grid divider = {true}>
                        <GridCell width="1-3" noMargin = {true}>
                            <Grid>
                                <GridCell width="1-1">
                                    <div className="uk-align-right">
                                        <Button label="Create New" style="success" waves = {true}
                                                flat = {true} onclick = {() => this.handleCreateNewClick()} />
                                    </div>
                                </GridCell>
                                <GridCell width="1-1" noMargin = {true}>
                                    <CollectionScheduleList data = {this.state.schedules}
                                                            lookups = {this.state.lookups}
                                                            onselect = {(value) => this.handleSelectFromList(value)}
                                                            ondelete = {(value) => this.handleDelete(value)}/>
                                </GridCell>
                            </Grid>
                        </GridCell>
                        <GridCell width="2-3" noMargin = {true}>
                            <CollectionScheduleForm data = {this.state.selectedItem}
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