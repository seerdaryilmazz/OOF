import React from "react";
import * as axios from 'axios';
import uuid from "uuid";

import {TranslatingComponent} from 'susam-components/abstract';
import {PageHeader, Card, Grid, GridCell, CardHeader} from "susam-components/layout";
import {TextInput, Notify, Button, Span} from "susam-components/basic";
import {Chip, DateRange} from "susam-components/advanced";
import {CompanySearchAutoComplete} from "susam-components/oneorder";

import {ProjectService, LocationService, IncotermService, CommonService} from '../../services';

import {Sender} from './Sender';
import {ServiceType} from './ServiceType';
import {LoadType} from './LoadType';
import {Incoterm} from './Incoterm';


export class ProjectEdit extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {ready: false, projectId: this.props.location? (this.props.location.query ? this.props.location.query.projectId : null) : null }
    }

    componentDidMount() {
        let projectId = this.state.projectId;

        if(!projectId) {
            Notify.showError("Project is not selected!");
        }

        axios.all([
            LocationService.retrieveCountries(),
            CommonService.getServiceTypes(),
            CommonService.getTruckLoadTypes(),
            IncotermService.list(),
        ]).then(axios.spread((countries, serviceTypes, loadTypes, incoterms) => {
            let lookup = {};

            lookup.country = countries.data;
            lookup.serviceType = serviceTypes.data;
            lookup.loadType = loadTypes.data;
            lookup.incoterm = incoterms.data;

            this.setState({lookup: lookup}, () => {
                this.loadProject(projectId)
            });
        })).catch((error) => {
            Notify.showError(error);
            console.log("Error:" + error);
        });
    }

    loadProject(projectId) {

        if (projectId) {
            ProjectService.retrieveProject(projectId).then(response => {
                let data = response.data;
                this.setState({
                    id: data.id,
                    customer: data.customer,
                    validDateInterval: data.validDateInterval,
                    name: data.name,
                    sender: data.sender,
                    serviceTypes: data.serviceTypes,
                    loadTypes: data.loadTypes,
                    incoterms: data.incoterms,
                    ready: true
                });
            }).catch((error) => {
                Notify.showError(error);
                console.log("Error:" + error);
            });

        } else {
            this.setState({data: {}});
        }
    }

    handleBack() {
        window.location = "/ui/management/project-list";
    }

    handleProjectNameUpdate() {
        ProjectService.updateProjectName(this.state.id, this.state.name).then(response => {
            this.setState({name: response.data}, () => {
                Notify.showSuccess("Project Name Update Successful.");
            });
        }).catch((error) => {
            Notify.showError(error);
            console.log("Error:" + error);
        });
    }

    handleSenderSave(data) {
        ProjectService.saveProjectSender(this.state.id, data).then(response => {
            this.setState({senders: response.data}, () => {
                Notify.showSuccess("Sender Save Successful.");
            });
        }).catch((error) => {
            Notify.showError(error);
            console.log("Error:" + error);
        });
    }

    handleServiceTypeSave(data) {
        ProjectService.saveProjectServiceType(this.state.id, data).then(response => {
            this.setState({serviceTypes: response.data}, () => {
                Notify.showSuccess("Service Type save Successful.");
            });
        }).catch((error) => {
            Notify.showError(error);
            console.log("Error:" + error);
        });
    }

    handleLoadTypeSave(data) {
        ProjectService.saveProjectLoadType(this.state.id, data).then(response => {
            this.setState({loadTypes: response.data}, () => {
                Notify.showSuccess("Load Type save Successful.");
            });
        }).catch((error) => {
            Notify.showError(error);
            console.log("Error:" + error);
        });
    }

    handleIncotermSave(data) {
        ProjectService.saveProjectIncoterm(this.state.id, data).then(response => {
            this.setState({incoterms: response.data}, () => {
                Notify.showSuccess("Incoterm save Successful.");
            });
        }).catch((error) => {
            Notify.showError(error);
            console.log("Error:" + error);
        });
    }


    updateState(field, value) {
        let data = this.state.data;
        data[field] = value;
        this.setState({data: data});
    }

    render() {

        let state = this.state;

        if (!state.ready) {
            return null;
        }

        return (
            <div>
                <PageHeader title="Project Edit"/>
                <Grid>
                    <GridCell width="1-1">
                        <Card>
                            <Grid>
                                <GridCell width="1-1" noMargin={true}>
                                    <CardHeader title="General"/>
                                </GridCell>
                                <GridCell width="1-3">
                                    <Span label="Customer" value={state.customer.name}></Span>
                                </GridCell>
                                <GridCell width="2-3"/>
                                <GridCell width="1-3">
                                    <Span label="Valid Between"
                                          value={state.validDateInterval.startDate + " - " + state.validDateInterval.endDate}></Span>
                                </GridCell>
                                <GridCell width="2-3"/>
                                <GridCell width="1-3">
                                    <TextInput label="Project Name" required={true}
                                               value={state.name}
                                               onchange={(data) => {
                                                   this.setState({name: data})
                                               }}/>
                                </GridCell>
                                <GridCell width="2-3">
                                    <Button label="Save" style="success" onclick={() => {
                                        this.handleProjectNameUpdate()
                                    }}/>
                                </GridCell>
                            </Grid>
                        </Card>
                    </GridCell>
                    <GridCell width="1-1">
                        <Sender lookup={state.lookup} data={state.sender}
                                saveHandler={(data) => this.handleSenderSave(data)}/>
                    </GridCell>
                    <GridCell width="1-3">
                        <ServiceType lookup={state.lookup} data={state.serviceTypes}
                                     saveHandler={(data) => this.handleServiceTypeSave(data)}/>
                    </GridCell>
                    <GridCell width="1-3">
                        <LoadType lookup={state.lookup} data={state.loadTypes}
                                  saveHandler={(data) => this.handleLoadTypeSave(data)}/>
                    </GridCell>
                    <GridCell width="1-3">
                        <Incoterm lookup={state.lookup} data={state.incoterms}
                                  saveHandler={(data) => this.handleIncotermSave(data)}/>
                    </GridCell>
                </Grid>
            </div>
        );
    }
}