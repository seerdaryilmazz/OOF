import React from "react";
import uuid from "uuid";
import * as axios from 'axios';
import _ from "lodash";

import {TranslatingComponent} from 'susam-components/abstract';

import {Page, Grid, GridCell, Loader} from "susam-components/layout";
import {Notify, Button, DropDown, DropDownButton, TextInput} from "susam-components/basic";
import {EventMonitorService} from '../services/EventMonitorService';

import {EventGraph} from './EventGraph';
import {EventLog} from './EventLog';

export class EventMonitoring extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {showLogs: true};
    }

    componentDidMount(){
        EventMonitorService.getEventMap().then(response => {
            let events = this.getEvents(response.data);
            let services = this.getServices(response.data);
            this.setState({eventMap: response.data, events: events, services: services});
        }).catch(error => {
            Notify.showError(error);
        });
    }
    getEvents(eventMap){
        let events = [];
        eventMap.forEach(serviceEvents => {
            if(serviceEvents.produces) {
                let filteredEvents = _.filter(serviceEvents.produces, event => {
                    return event.name != "register-events" && event.name != "authorization";
                });
                filteredEvents.forEach(event => {
                    if (!_.find(events, {id: event.name})) {
                        events.push({
                            id: event.name,
                            name: event.name
                        });
                    }
                });
            }
            if(serviceEvents.consumes) {
                let filteredEvents = _.filter(serviceEvents.consumes, event => {
                    return event.name != "register-events" && event.name != "authorization";
                });
                filteredEvents.forEach(event => {
                    if(!_.find(events, {id: event.name})){
                        events.push({
                            id: event.name,
                            name: event.name
                        });
                    }
                });
            }
        });
        return _.sortBy(events, ['name']);
    }
    getServices(eventMap){
        let services = [];
        eventMap.forEach(serviceEvents => {
            if(!_.find(services, {id: serviceEvents.applicationName})) {
                services.push({
                    id: serviceEvents.applicationName,
                    name: serviceEvents.applicationName
                });
            }
        });
        return _.sortBy(services, ['name']);
    }
    updateState(key, value){
        let state = _.cloneDeep(this.state);
        state[key] = value;
        this.setState(state);
    }
    handleShowLogs(){
        let state = _.cloneDeep(this.state);
        state.selectedEvent = null;
        state.selectedService = null;
        state.showLogs = true;
        this.setState(state);
    }
    handleShowGraph(){
        let state = _.cloneDeep(this.state);
        state.selectedEvent = null;
        state.selectedService = null;
        state.showLogs = false;
        this.setState(state);
    }


    render() {
        let title = super.translate("Event Monitoring");
        let content = null;

        if (this.state.showLogs){
            content = <EventLog events={this.state.events} services={this.state.services}
                                onShowGraph = {() => this.handleShowGraph()} />;
        } else {
            content = <EventGraph events = {this.state.events} services = {this.state.services}
                                  onShowLogs = {() => this.handleShowLogs()}/>;
        }

        return(
            <Page title={title}>
                {content}
            </Page>
        );

    }

}