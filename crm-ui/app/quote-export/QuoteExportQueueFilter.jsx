import _ from 'lodash';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Chip, DateRange } from "susam-components/advanced";
import { Button, Notify, TextInput } from "susam-components/basic";
import { Card, CardHeader, Grid, GridCell } from 'susam-components/layout';
import { ExportQuoteQueueService } from '../services/QuoteQueueService';

export class QuoteExportQueueFilter extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = { filter: this.props.filter }
    }

    componentDidMount() {
        this.getStatus();
    }

    getStatus() {
        ExportQuoteQueueService.getStatus().then(response => {
            this.setState({ statusOptions: response.data });
        }).catch(error => {
            Notify.showError(error);
        });
    }

    onHandleStatusChange(value) {
        let filter = _.cloneDeep(this.state.filter);
        filter.status = value.map(s=>s.code);
        this.setState({ filter: filter, status: value });
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
                    <GridCell width="1-5">
                        <Chip label="Status"
                            hideSelectAll={true}
                            value={this.state.status}
                            options={this.state.statusOptions}
                            onchange={(value) => this.onHandleStatusChange(value)} />
                    </GridCell>
                    <GridCell width="1-5">
                        <TextInput label="Quote Number"
                            value={this.state.filter.quoteNumber}
                            onchange={(value) => this.onHandleQuoteNumberChange(value)} />
                    </GridCell>
                    <GridCell width="2-5">
                        <DateRange startDateLabel="Execution Date Interval"
                            value={this.state.createDateRange}
                            onchange={(value) => this.onCreateDateRangeChange(value)} />
                    </GridCell>
                    <GridCell width="1-5">
                        <div className="uk-margin-top">
                            <Button label="search" style="primary" waves={true} size="small" onclick={() => this.onSearchHandle()} />
                        </div>
                    </GridCell>
                </Grid>
            </Card>
        );
    }
}