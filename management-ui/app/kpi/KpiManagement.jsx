import _ from "lodash";
import * as axios from 'axios';
import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {Page, Grid, GridCell, Card, Loader, PageHeader} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown} from "susam-components/basic";

import {KpiService} from "../services";

import {KpiManagementList} from './KpiManagementList';
import {KpiManagementForm} from './KpiManagementForm';

export class KpiManagement extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {
            selectedItem: this.createNew()
        };
    };

    componentDidMount() {
        this.loadList();
    }

    loadList(){
        axios.all([
            KpiService.getPeriods(), KpiService.getOperators(), KpiService.getCollectors(), KpiService.list()
        ]).then(axios.spread((periods, operators, collectors, kpis) => {
            let state = _.cloneDeep(this.state);
            state.periods = periods.data;
            state.operators = operators.data;
            state.collectors = collectors.data;
            state.kpis = kpis.data;
            if(!state.kpis){
                state.kpis = [];
            }
            this.setState(state);
        })).catch(error => {
            Notify.showError(error);
        });
    }

    createNew(){
        return {period: {}, objective: {}};
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
        KpiService.save(item).then(response => {
            Notify.showSuccess("KPI saved successfully");
            KpiService.list().then(response => {
                let state = _.cloneDeep(this.state);
                state.kpis = response.data;
                this.setState(state);
            }).catch(error => {
                Notify.showError(error);
            });
            this.setState({selectedItem: response.data});
        }).catch(error => {
            Notify.showError(error);
        })
    }

    handleDelete(){
        let item = _.cloneDeep(this.state.selectedItem);
        if (item.id) {
            UIkit.modal.confirm("Are you sure?", () => {
                KpiService.delete(item.id).then(response => {
                    Notify.showSuccess("KPI deleted");
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
        let title = super.translate("KPI Management");

        let list = <KpiManagementList data = {this.state.kpis}
                                      collectors = {this.state.collectors}
                                      onselect = {(value) => this.handleSelectFromList(value)}
                                      selectedItem = {this.state.selectedItem}
                                      height={this.state.height} />;

        let form = <KpiManagementForm ref = {(c) => this.form = c}
                                      collectors = {this.state.collectors}
                                      periods = {this.state.periods}
                                      operators = {this.state.operators}
                                      selectedItem = {this.state.selectedItem}
                                      onchange = {(key, value) => this.handleUpdateState(key, value)} />;

        return (
            <div>
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
            </div>
        );
    }
}

{/*
 class PeriodReader {
 readCellValue(row) {
 return row.period.value + " " + row.period.period.name;
 }
 readSortValue(row) {
 return this.readCellValue(row);
 }
 }
 class ObjectiveReader {
 readCellValue(row) {
 return row.objective.operator.name + " " + row.objective.value;
 }
 readSortValue(row) {
 return this.readCellValue(row);
 }
 }
*/}