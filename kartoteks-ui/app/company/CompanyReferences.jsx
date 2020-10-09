import React from "react";
import _ from "lodash";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, CardHeader, Loader} from "susam-components/layout";
import {Notify, Button, Span} from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';

import {CompanyService} from '../services/KartoteksService';

export class CompanyReferences extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {busy: true};
    }

    initialize(props){
        this.setState({busy: true});
        CompanyService.getCompany(props.params.companyId).then(response => {
            let company = response.data;

            company.mappedIds.forEach(item => item.companyName = company.name);

            let locationMappings = _.flatten(company.companyLocations.map(item => {
               item.mappedIds.forEach(id => id.locationName = item.name);
               return item.mappedIds;
            }));

            company.companyContacts = _.sortBy(company.companyContacts, [(item) => item.firstName + item.lastName]);
            let contactMappings = _.flatten(company.companyContacts.map(item => {
                item.mappedIds.forEach(id => id.contactName = item.firstName + " " + item.lastName);
                return item.mappedIds;
            }));

            this.setState({companyName: company.name,
                companyMappings: company.mappedIds,
                locationMappings: locationMappings,
                contactMappings: contactMappings,
                busy: false});
        }).catch(error => {
            Notify.showError(error);
            this.setState({busy: false});
        });
    }
    componentDidMount(){
        this.initialize(this.props);
    }
    componentWillReceiveProps(nextProps){
        this.initialize(nextProps);
    }

    render(){
        if(this.state.busy){
            return <Loader title="Fetching Company"/>;
        }

        return (
            <div>
                <PageHeader title={"References of " + this.state.companyName} />

                    <Grid>
                        <GridCell width="1-1">
                            <Card>
                                <Grid>
                                    <GridCell width="1-2">
                                        <DataTable.Table title = "Company" data={this.state.companyMappings}>
                                            <DataTable.Text header="Name" field="companyName" width="15" />
                                            <DataTable.Text header="Application" field="application" width="15" />
                                            <DataTable.Text header="ID" field="applicationCompanyId" width="15" />
                                        </DataTable.Table>
                                    </GridCell>
                                    <GridCell width="1-2">
                                        <DataTable.Table title="Locations" data={this.state.locationMappings}>
                                            <DataTable.Text header="Location Name" field="locationName" width="15" />
                                            <DataTable.Text header="Application" field="application" width="15" />
                                            <DataTable.Text header="ID" field="applicationLocationId" width="15" />
                                        </DataTable.Table>
                                    </GridCell>
                                    <GridCell width="1-2">
                                        <DataTable.Table title="Contacts" data={this.state.contactMappings}>
                                            <DataTable.Text header="Contact Name" field="contactName" width="15" />
                                            <DataTable.Text header="Application" field="application" width="15" />
                                            <DataTable.Text header="ID" field="applicationContactId" width="15" />
                                        </DataTable.Table>
                                    </GridCell>
                                </Grid>
                            </Card>
                        </GridCell>
                    </Grid>

            </div>
        );
    }
}