import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Button } from "susam-components/basic";
import * as DataTable from 'susam-components/datatable';
import { Card, CardHeader, Grid, GridCell, Pagination } from 'susam-components/layout';
import OrderExportDataModal from './OrderExportDataModal';

export class OrderExportQueueList extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {}
    }

    openDataModal(row) {
        this.dataModal.openFor(row);
    }

    requeue(row) {
        this.props.onRequeue && this.props.onRequeue(row);
    }

    onPageChange(page) {
        this.props.onPageChange && this.props.onPageChange(page);
    }

    render() {
        return (
            <Card>
                <Grid>
                    <GridCell width="1-1">
                        <CardHeader title="Queue" />
                    </GridCell>
                    <GridCell width="1-1">
                        <DataTable.Table
                            data={this.props.data.content}
                            selectedRows={this.state.selectedRows}
                            sortable={false}>
                            <DataTable.Text header="Order Code" field="orderCode" />
                            <DataTable.Text header="Status" field="status" printer={new StatusPrinter()} center={true} />
                            <DataTable.Text header="Execution Date" field="createdAt" printer={new DateTimePrinter()} center={true} />
                            <DataTable.Text header="Transferred At" field="lastUpdated" printer={new DateTimePrinter()} center={true} />
                            <DataTable.ActionColumn>
                                <DataTable.ActionWrapper track="onclick" onaction={(row) => { this.requeue(row) }}>
                                    <Button label="execute" flat={true} style="primary" size="small" />
                                </DataTable.ActionWrapper>
                            </DataTable.ActionColumn>
                            <DataTable.ActionColumn>
                                <DataTable.ActionWrapper track="onclick" onaction={(row) => { this.openDataModal(row) }}>
                                    <Button label="data" flat={true} style="success" size="small" />
                                </DataTable.ActionWrapper>
                            </DataTable.ActionColumn>
                        </DataTable.Table>
                        <Pagination
                            range={10}
                            page={this.props.data.number + 1}
                            totalElements={this.props.data.totalElements}
                            totalPages={this.props.data.totalPages}
                            onPageChange={page => this.onPageChange(page)} />
                    </GridCell>
                </Grid>
                <OrderExportDataModal ref={(c) => this.dataModal = c} />
            </Card>
        );
    }
}

class StatusPrinter {
    print(data) {
        let classes = {
            SUCCESSFUL: "success",
            PENDING: "primary",
            REQUEUED: "primary",
            FAILED: "danger",
            CONSECUTIVE_FAILURE: "danger",
            IGNORE: "warning",
            SKIPPED: "warning"
        };
        let className = "uk-badge uk-badge-small uk-badge";
        className += ("-" + classes[data.code]);
        return <i className={className}>{data.code}</i>;
    }
}

class DateTimePrinter {
    print(data) {
        return data + " Europe/Istanbul";
    }
}