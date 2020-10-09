import * as axios from "axios";
import _ from 'lodash';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Chip, DateRange } from "susam-components/advanced";
import { Button, DropDown, TextInput } from "susam-components/basic";
import { Card, CardHeader, Grid, GridCell } from 'susam-components/layout';
import { ImportQuoteQueueService } from '../services/QuoteQueueService';

export class QuoteImportQueueFilter extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = { filter: this.props.filter }
    }

    componentDidMount() {
        this.getLookup();
    }

    getLookup() {
        axios.all([
            ImportQuoteQueueService.getLookup('status'),
            ImportQuoteQueueService.getLookup('external-system')
        ]).then(axios.spread((status, externalSystem)=>{
            this.setState({ statusOptions: status.data, externalSystemOptions: externalSystem.data });
        }));
    }

    onHandleStatusChange(value) {
        let filter = _.cloneDeep(this.state.filter);
        filter.status = value.map(s=>s.code);
        this.setState({ filter: filter, status: value });
    }

    onHandleExternalSystemChange(value) {
        let filter = _.cloneDeep(this.state.filter);
        filter.externalSystemName = value ? value.code : null;
        this.setState({ filter: filter });
    }
    
    onHandleQuoteNumberChange(value) {
        let filter = _.cloneDeep(this.state.filter);
        filter.quoteNumber = value;
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
                    <GridCell width="1-6">
                        <TextInput label="Quote Number"
                            value={this.state.filter.quoteNumber}
                            onchange={(value) => this.onHandleQuoteNumberChange(value)} />
                    </GridCell>
                    <GridCell width="1-6">
                        <Chip label="Status"
                            hideSelectAll={true}
                            value={this.state.status}
                            options={this.state.statusOptions}
                            onchange={(value) => this.onHandleStatusChange(value)} />
                    </GridCell>
                    <GridCell width="1-6">
                        <DropDown label="External System Name" options={this.state.externalSystemOptions}
                            value={{code:this.state.filter.externalSystemName}} valueField="code"
                            onchange={(value) => this.onHandleExternalSystemChange(value)} />
                    </GridCell>
                    <GridCell width="2-6">
                        <DateRange startDateLabel="Execution Date Interval"
                            value={this.state.createDateRange}
                            onchange={(value) => this.onCreateDateRangeChange(value)} />
                    </GridCell>
                    <GridCell width="1-6">
                        <div className="uk-margin-top">
                            <Button label="search" style="primary" waves={true} size="small" onclick={() => this.onSearchHandle()} />
                        </div>
                    </GridCell>
                </Grid>
            </Card>
        );
    }
}