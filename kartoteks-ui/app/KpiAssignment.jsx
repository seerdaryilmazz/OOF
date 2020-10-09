import _ from "lodash";
import * as axios from 'axios';
import uuid from 'uuid';
import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card, Loader, PageHeader} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown, DropDownButton} from "susam-components/basic";
import {NumericInput} from "susam-components/advanced";

import {KpiService} from './services/KpiService';
import {UserService} from './services/UserService';

export class KpiAssignment extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {};
    }

    loadLookups(){
        axios.all([
            KpiService.list(), UserService.listUsers()])
                .then(axios.spread((kpis, users) => {
            let state = _.cloneDeep(this.state);
            state.kpis = kpis.data;
            state.assignments = this.setAssignedKpis(kpis.data);
            state.users = users.data;
            this.setState(state);
        })).catch(error => {
            Notify.showError(error);
        });
    }

    setAssignedKpis(kpis){
        let filtered = _.filter(kpis, item => {return item.assignments.length > 0});
        filtered.forEach(kpi => {
            kpi.assignments.forEach(assigned => {
                assigned._key = assigned.id ? assigned.id : uuid.v4();
            });
        });
        return kpis;
    }

    componentDidMount() {
        this.loadLookups();
    }

    updateState(key, value){
        let state = _.cloneDeep(this.state);
        _.set(state, key, value);
        this.setState(state);
    }

    handleAssignmentResponse(response){
        Notify.showSuccess("KPI assigned successfully");
        this.refreshAssignedKpis();
    }
    handleRevokeResponse(response){
        Notify.showSuccess("KPI revoked successfully");
        this.refreshAssignedKpis();
    }
    refreshAssignedKpis(){
        KpiService.list().then(kpis => {
            let state = _.cloneDeep(this.state);
            state.assignments = this.setAssignedKpis(kpis.data);
            this.setState(state);
        }).catch(error => {
            Notify.showError(error);
        });
    }
    handleAssignNowClick(){
        KpiService.assignToUserNow(this.state.selectedKpi, this.state.selectedUser).then(response => {
            this.handleAssignmentResponse(response);
        }).catch(error => {
            Notify.showError(error);
        });
    }
    handleAssignNextPeriodClick(){
        KpiService.assignToUserNextPeriod(this.state.selectedKpi, this.state.selectedUser).then(response => {
            this.handleAssignmentResponse(response);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    handleRevokeNow(kpi, user){
        KpiService.revokeFromUserNow(kpi, user).then(response => {
            this.handleRevokeResponse(response);
        }).catch(error => {
            Notify.showError(error);
        });
    }
    handleRevokeNextPeriod(kpi, user){
        KpiService.revokeFromUserNextPeriod(kpi, user).then(response => {
            this.handleRevokeResponse(response);
        }).catch(error => {
            Notify.showError(error);
        });
    }
    handleRevokeNowClick(kpi, user){
        UIkit.modal.confirm("Are you sure ?", () => this.handleRevokeNow(kpi, user));
    }
    handleRevokeNextPeriodClick(kpi, user){
        UIkit.modal.confirm("Are you sure ?", () => this.handleRevokeNextPeriod(kpi, user));
    }
    renderAssignedKpis(){
        if(!this.state.assignments){
            return null;
        }
        return <ul className="md-list">
            {this.state.assignments.map(item => {
                return item.assignments.map(assignment => {
                    let revokeNowButton = <Button label="Revoke Now" waves = {true} style = "danger" width="200px" size="small" flat = {true}
                                                  onclick= {() => this.handleRevokeNowClick(item, assignment.who)} />;
                    let revokeNextPeriodButton = <Button label="Revoke Next Period" waves = {true} style = "danger" width="200px" size="small" flat = {true}
                                                    onclick= {() => this.handleRevokeNextPeriodClick(item, assignment.who)} />;
                    let activeTag = "";
                    let progress = (assignment.value / item.objective.value) * 100;
                    progress = progress > 100 ? 100 : progress;
                    if(assignment.startNextPeriod){
                        activeTag = <i className="uk-badge uk-badge-success">{super.translate("Starts Next Period")}</i>;
                        revokeNextPeriodButton = "";
                    }else if(assignment.stopNextPeriod){
                        activeTag = <i className="uk-badge uk-badge-danger">{super.translate("Stops Next Period")}</i>;
                        revokeNextPeriodButton = "";
                    }
                    return <li key = {item._key}>
                        <div className="md-list-content">
                            <span className="md-list-heading">
                                <div className="uk-progress uk-progress-mini uk-progress-primary uk-margin-remove" title={progress + "%"} data-uk-tooltip="{pos:'bottom'}">
                                    <div className="uk-progress-bar" style={{width: progress + "%"}} />
                                </div>
                            </span>
                            <span className="md-list-heading">{assignment.who.name}</span>
                            <span className="uk-text-small uk-text-muted">{item.description}</span>
                            {activeTag}
                            {revokeNowButton}
                            {revokeNextPeriodButton}
                        </div>
                    </li>;
                });
            })}
        </ul>;
    }
    render() {
        return (
            <div>
                <PageHeader title="KPI Assignments" />
                <Card>
                    <Grid>
                        <GridCell width="1-4">
                            <DropDown options = {this.state.users} label="User" labelField="username"
                                      value = {this.state.selectedUser} onchange = {(value) => this.updateState("selectedUser", value)} />
                        </GridCell>
                        <GridCell width="1-2">
                            <DropDown options = {this.state.kpis} label="KPI" labelField="description"
                                      value = {this.state.selectedKpi} onchange = {(value) => this.updateState("selectedKpi", value)} />
                        </GridCell>
                        <GridCell width="1-4">
                            <DropDownButton label="Assign" waves = {true} style = "primary" width="200px"
                                            options = {[{label:"Starting from now", onclick: () => {this.handleAssignNowClick()}},
                                                {label:"Starting from next period", onclick: () => {this.handleAssignNextPeriodClick()}}]}/>
                        </GridCell>
                        <GridCell width="1-2">
                            {this.renderAssignedKpis()}
                        </GridCell>
                    </Grid>
                </Card>
            </div>
        );
    }

}