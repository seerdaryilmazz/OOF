import React from "react";
import * as axios from 'axios';
import uuid from "uuid";

import {TranslatingComponent} from 'susam-components/abstract';
import {PageHeader, Card, Grid, GridCell, CardHeader} from "susam-components/layout";
import {TextInput, Notify, Button,Span} from "susam-components/basic";
import {Chip, DateRange} from "susam-components/advanced";
import {CompanySearchAutoComplete} from "susam-components/oneorder";

import {ProjectService} from '../../services';

export class ProjectList extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {data: [], lookup: {}}

    }

    componentDidMount() {
        this.loadProjects();
    }

    loadProjects() {
        ProjectService.retrieveProjects().then(response => {
            this.setState({data: response.data});
        }).catch((error) => {
            Notify.showError(error);
            console.log("Error:" + error);
        });
    }

    handleNewProjectClick() {
        window.location = "/ui/management/project-create";
    }

    handleSelectItem(e, projectId) {
        window.location = "/ui/management/project-edit?projectId=" + projectId;
    }


    render() {

        let data = this.state.data;

        if (!data) {
            return null;
        }

        return (
            <Card>
                <Grid>
                    <GridCell>
                        <Grid>
                        {data.map(d => {
                            return (
                                <GridCell width="1-1">
                                    <Grid key={d.id}>
                                        <GridCell width="1-5">
                                            <Span label="Project" value={<a key={d.id} href="#" onClick={(e) => this.handleSelectItem(e, d.id)}>{d.name + " "}</a>}/>
                                        </GridCell>
                                        <GridCell width="1-5">
                                            <Span label="Customer" value={d.customer.name}/>
                                        </GridCell>
                                        <GridCell width="1-5">
                                            <Span label="Start Date" value={d.validDateInterval.startDate}/>
                                        </GridCell>
                                        <GridCell width="1-5">
                                            <Span label="End Date" value={d.validDateInterval.endDate}/>
                                        </GridCell>
                                        <GridCell width="1-5"/>
                                    </Grid>
                                </GridCell>
                            );
                        })
                        }
                        </Grid>
                    </GridCell>
                    <GridCell>
                        <Button label="New Project" onclick={() => {
                            this.handleNewProjectClick()
                        }}/>
                    </GridCell>
                </Grid>

            </Card>
        );
    }
}