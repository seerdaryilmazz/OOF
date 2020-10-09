import _ from "lodash";
import * as axios from 'axios';
import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {Notify} from "susam-components/basic";
import {Page, Grid, GridCell, Card} from "susam-components/layout";
import {ListContainer, FormContainer, ToolbarContainer} from 'susam-components/oneorder/layout';

import {DistributionSchedulesService, CommonService, ZoneService} from "../../services";

import {DistributionScheduleList} from './DistributionScheduleList';
import {DistributionScheduleForm} from './DistributionScheduleForm';

export class DistributionSchedules extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            lookups: {},
            selectedItem: this.createNew()
        };
    }

    componentDidMount(){
        axios.all([
            DistributionSchedulesService.getSchedules(),
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

    loadList(){
        DistributionSchedulesService.getSchedules().then(response => {
            this.setState({schedules: response.data});
        }).catch(error => {
            Notify.showError(error);
        });
    }

    createNew(){
        return {};
    }

    handleSelectFromList(item){
        this.handleCreate();
        item.distributionRegion = {id: item.distributionRegionId, name: item.distributionRegionName};
        this.setState({selectedItem: item});
    }

    /**
     * keyValuePairs aslında normal bir JSON nesnesi.
     * Örnek:
     *  {
     *      a: 1,
     *      b: true,
     *      c: "xyz",
     *      d: null,
     *      e: [...]
     *  }
     */
    handleUpdateState(keyValuePairs) {
        let currentState = _.cloneDeep(this.state.selectedItem);
        _.keys(keyValuePairs).forEach(key => {
            _.set(currentState, key, _.get(keyValuePairs, key));
        });
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
        let value = _.cloneDeep(this.state.selectedItem);
        if(value.distributionRegion) {
            value.distributionRegionId = value.distributionRegion.id;
            value.distributionRegionName = value.distributionRegion.name;
        } else {
            value.distributionRegionId = null;
            value.distributionRegionName = null;
        }
        this.setState({selectedItem: value});
        DistributionSchedulesService.saveSchedule(value).then(response => {
            Notify.showSuccess("Distribution schedule saved");
            this.loadList();
            this.handleSelectFromList(response.data);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    handleDelete(){
        let value = _.cloneDeep(this.state.selectedItem);
        if (value.id) {
            UIkit.modal.confirm("Are you sure?", () => {
                DistributionSchedulesService.deleteSchedule(value.id).then(response => {
                    Notify.showSuccess("Distribution schedule deleted");
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

        let title = super.translate("Distribution Schedules");

        let list = <DistributionScheduleList data = {this.state.schedules}
                                             lookups = {this.state.lookups}
                                             onselect = {(value) => this.handleSelectFromList(value)}
                                             selectedItem = {this.state.selectedItem}
                                             height={this.state.height} />;

        let form = <DistributionScheduleForm ref = {(c) => this.form = c}
                                             selectedItem = {this.state.selectedItem}
                                             lookups = {this.state.lookups}
                                             onchange = {(keyValuePairs) => this.handleUpdateState(keyValuePairs)}/>;

        return (
            <Page title = {title} toolbarItems={[
                {name: "Create", library: "material", icon: "note_add", onclick: () => this.handleCreate(), inDropdown: false},
                {name: "Save", library: "material", icon: "save", onclick: () => this.handleSave(), inDropdown: false},
                {name: "Delete", library: "material", icon: "delete", onclick: () => this.handleDelete(), inDropdown: true}]}>
                <Grid divider={true}>
                    <GridCell width="1-5" noMargin={true}>
                        <ListContainer>
                            {list}
                        </ListContainer>
                    </GridCell>
                    <GridCell width="4-5" noMargin={true}>
                        <FormContainer>
                            {form}
                        </FormContainer>
                    </GridCell>
                </Grid>
            </Page>
        );
    }
}

