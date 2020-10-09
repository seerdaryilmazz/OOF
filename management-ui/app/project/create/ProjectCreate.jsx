import React from "react";
import * as axios from 'axios';
import uuid from "uuid";

import {TranslatingComponent} from 'susam-components/abstract';
import {PageHeader, Card, Grid, GridCell, CardHeader} from "susam-components/layout";
import {TextInput, Notify, Button} from "susam-components/basic";
import {Chip, DateRange} from "susam-components/advanced";
import {CompanySearchAutoComplete} from "susam-components/oneorder";

import {ProjectService} from '../../services';

import {OrderQuota} from './OrderQuota';

export class ProjectCreate extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {data: {}, lookup: {}}

    }

    componentDidMount() {
        axios.all([
            ProjectService.retrieveOrderQuotaTimeType(),
            ProjectService.retrieveOrderQuotaUnitType()
        ]).then(axios.spread((orderQuotaTime, orderQuotaUnit) => {
            let state = _.cloneDeep(this.state);

            state.lookup.orderQuotaTime = orderQuotaTime.data;
            state.lookup.orderQuotaUnit = orderQuotaUnit.data;

            this.setState(state);
        })).catch((error) => {
            Notify.showError(error);
            console.log("Error:" + error);
        });
    }

    handleSave() {
        let data = this.state.data;
        ProjectService.saveProject(data).then(response => {
            this.setState({data: response.data}, () => {
                Notify.showSuccess("Save Successful.");
                window.location = "/ui/management/project-list";
            });
        }).catch((error) => {
            Notify.showError(error);
            console.log("Error:" + error);
        });
    }

    updateDateInterval(date) {
        let data = this.state.data;
        data.validDateInterval = {};
        data.validDateInterval.startDate = date.startDate;
        data.validDateInterval.endDate = date.endDate;
        this.setState({data: data});
    }


    updateState(field, value) {
        let data = this.state.data;
        data[field] = value;
        this.setState({data: data});
    }

    render() {

        let lookup = this.state.lookup;
        let data = this.state.data;
        let validDateInterval = data.validDateInterval;


        return (
            <div>
                <PageHeader title="Project Create"/>
                <Card>
                    <Grid>
                        <GridCell width="1-1">
                            <CardHeader title="General"/>
                        </GridCell>
                        <GridCell width="1-3">
                            <CompanySearchAutoComplete label="Customer" required={true}
                                                       value={data.customer}
                                                       onchange={(data) => {
                                                           this.updateState("customer", data)
                                                       }}/>
                        </GridCell>
                        <GridCell width="2-3"/>
                        <GridCell width="2-3">
                            <DateRange startDateLabel="Start Date" endDateLabel="End Date"
                                       value={validDateInterval ? {startDate: validDateInterval.startDate, endDate: validDateInterval.endDate} : {}}
                                       onchange={(data) => {
                                           this.updateDateInterval(data)
                                       }}/>
                        </GridCell>
                        <GridCell width="1-3"/>
                        <GridCell width="1-3">
                            <TextInput label="Project Name" required={true}
                                       value={data.name}
                                       onchange={(data) => {
                                           this.updateState("name", data)
                                       }}/>
                        </GridCell>
                        <GridCell width="2-3"/>
                        <GridCell width="1-1">
                            <CardHeader title="Order Quota"/>
                        </GridCell>
                        <GridCell width="1-1">
                            <OrderQuota lookup={lookup} data={data.orderQuota}
                                               updateHandler={(data) => this.updateState("orderQuota", data)}/>
                        </GridCell>
                        <GridCell>
                            <Button label="Save" style="success" onclick={() => {this.handleSave()}}></Button>
                        </GridCell>
                    </Grid>
                </Card>
            </div>
        );
    }
}