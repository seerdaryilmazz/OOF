import * as axios from "axios";
import _ from 'lodash';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Chip, DateRange } from "susam-components/advanced";
import { Button, TextInput } from "susam-components/basic";
import { DropDown } from 'susam-components/basic/DropDown';
import { Card, CardHeader, Grid, GridCell } from 'susam-components/layout';
import { OrderQueueService } from '../services/OrderQueueService';

export class ShipmentImportQueueFilter extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = { filter: this.props.filter }
    }

    componentDidMount() {
        this.getLookups();
    }

    getLookups() {
        axios.all([
            OrderQueueService.getLookup('import-status'),
            OrderQueueService.getLookup('import-external-system')
        ]).then(axios.spread((status, externalSystem)=>{
            this.setState({ statusOptions: status.data, externalSystemOptions: externalSystem.data });
        }));
    }

    onHandleStatusChange(value) {
        let filter = _.cloneDeep(this.state.filter);
        filter.status = value.map(s=>s.id);
        console.log("filter",filter);
        this.setState({ filter: filter, status: value });
    }
    handleFilterUpdate(key, value) {
        let filter = _.cloneDeep(this.state.filter);
        filter[key] = value;
        this.setState({ filter: filter });
    }

    onCreateDateRangeChange(value) {
        let filter = _.cloneDeep(this.state.filter);
        filter.minCreateDate = value.startDate;
        filter.maxCreateDate = value.endDate;
        this.setState({ filter: filter, createDateRange: value });
    }

    onSearchHandle() {
        this.props.onSearch && this.props.onSearch(this.state.filter);
    }

    render() {
        return (
            <Card>
                <Grid>
                    <GridCell width="1-1">
                        <CardHeader title="Filter" />
                    </GridCell>
                    <GridCell width="1-4">
                        <TextInput label="Order Code"
                            value={this.state.filter.orderCode}
                            onchange={(value) => this.handleFilterUpdate('orderCode', value)} />
                    </GridCell>
                    <GridCell width="1-4">
                        <TextInput label="Shipment Code"
                            value={this.state.filter.shipmentCode}
                            onchange={(value) => this.handleFilterUpdate('shipmentCode', value)} />
                    </GridCell>
                    <GridCell width="1-4">
                        <DropDown label="External System Name" options={this.state.externalSystemOptions}
                            value={this.state.filter.externalSystemName} valueField="code"
                            onchange={(value) => this.handleFilterUpdate('externalSystemName', value?value.code:null)} />
                    </GridCell>
                    <GridCell width="1-4">
                        <div className="uk-margin-top">
                            <Button label="search" style="primary" waves={true} size="small" onclick={() => this.onSearchHandle()} />
                        </div>
                    </GridCell>
                    <GridCell width="1-4">
                        <Chip label="Status"
                            hideSelectAll={true}
                            value={this.state.status}
                            options={this.state.statusOptions}
                            onchange={(value) => this.onHandleStatusChange(value)} />
                    </GridCell>
                    <GridCell width="2-4">
                        <DateRange startDateLabel="Transfer Time Interval"
                            value={this.state.createDateRange}
                            onchange={(value) => this.onCreateDateRangeChange(value)} />
                    </GridCell>
                </Grid>
            </Card>
        );
    }
}