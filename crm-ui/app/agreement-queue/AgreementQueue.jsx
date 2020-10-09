import _ from "lodash";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { DateRange } from "susam-components/advanced";
import { Button, Notify, TextInput } from "susam-components/basic";
import * as DataTable from 'susam-components/datatable';
import { Card, Grid, GridCell, LoaderWrapper, Modal, PageHeader, Pagination, Tab } from 'susam-components/layout';
import { AgreementQueueService } from "../services";

const TAB_LABELS = ["request", 'response'];
export class AgreementQueue extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {
            searchParams: {},
            searchResult: {}
        };
    }

    componentDidMount() {
        this.search(1);
    }

    search(pageNumber) {
        this.setState({ busy: true });
        let searchParams = this.state.searchParams;
        let params = {
            page: pageNumber - 1,
            pageSize: 10
        };

        if (!_.isNil(searchParams.agreementNumber)) {
            params.agreementNumber = searchParams.agreementNumber;
        }
        if (!_.isNil(searchParams.requestDateRange) && !_.isNil(searchParams.requestDateRange.startDate)) {
            params.minRequestDate = searchParams.requestDateRange.startDate;
        }
        if (!_.isNil(searchParams.requestDateRange) && !_.isNil(searchParams.requestDateRange.endDate)) {
            params.maxRequestDate = searchParams.requestDateRange.endDate;
        }
        AgreementQueueService.search(params).then(response => {
            this.setState({
                searchResult: response.data,
                pageNumber: pageNumber,
                pageCount: response.data.totalPages,
                busy: false
            });
        }).catch(error => {
            Notify.showError(error);
        });
    }

    updateSearchParams(propertyKey, propertyValue) {
        this.setState(prevState=>{
            _.set(prevState.searchParams, propertyKey, propertyValue);
            return prevState;
        })
    }

    requeue(row) {
        AgreementQueueService.requeue(row.id).then(r => {
            Notify.showSuccess("Execute scheduled");
        }).catch(e => {
            Notify.showError(e);
        })
    }

    renderDataTable() {
        return (
            <GridCell width="1-1">
                <DataTable.Table data={this.state.searchResult.content}>
                    <DataTable.Text field="agreementNumber" header="Agreement Number" />
                    <DataTable.Text field="status" header="Status" printer={new StatusPrinter()} center={true} />
                    <DataTable.Text field="requestDate" header="Request Date" />
                    <DataTable.Text field="responseDate" header="Response Date" />
                    <DataTable.ActionColumn>
                        <DataTable.ActionWrapper track="onclick" onaction={rowData => this.setState({ rowData }, () => this.modal.open())}>
                            <Button label="view" flat={true} style="success" size="small" />
                        </DataTable.ActionWrapper>
                    </DataTable.ActionColumn>
                    <DataTable.ActionColumn>
                        <DataTable.ActionWrapper track="onclick" onaction={(row) => { this.requeue(row) }}>
                            <Button label="execute" flat={true} style="primary" size="small" />
                        </DataTable.ActionWrapper>
                    </DataTable.ActionColumn>
                </DataTable.Table>
            </GridCell>
        )
    }

    render() {
        return (
            <div>
                <PageHeader title="Agreement Price Service Calls" />
                <Card>
                    <Grid>
                        <GridCell width="1-4">
                            <TextInput label="Agreement Number"
                                value={this.state.searchParams.agreementNumber}
                                onchange={(value) => this.updateSearchParams("agreementNumber", value)} />
                        </GridCell>
                        <GridCell width="2-4">
                            <DateRange startDateLabel="Request Date Interval"
                                value={this.state.searchParams.requestDateRange}
                                onchange={(value) => this.updateSearchParams("requestDateRange", value)} />
                        </GridCell>
                        <GridCell width="1-4">
                            <div className="uk-margin-top">
                                <Button label="search" style="primary" waves={true} size="small" onclick={() => this.search(1)} />
                            </div>
                        </GridCell>
                    </Grid>
                    <LoaderWrapper busy={this.state.busy}>
                        {this.renderDataTable()}
                    </LoaderWrapper>
                    <GridCell width="1-1">
                        <Pagination
                            totalElements={this.state.searchResult.totalElements}
                            page={this.state.pageNumber}
                            totalPages={this.state.pageCount}
                            onPageChange={(pageNumber) => this.search(pageNumber)}
                            range={10} />
                    </GridCell>
                </Card>
                <Modal ref={(c) => this.modal = c}
                    onclose={() => this.setState({ rowData: null })}
                    title="Agreement Queue Data" center={false}
                    medium={true} style={{ height: "70%" }}>
                    <Tab labels={TAB_LABELS}>
                        {TAB_LABELS.map((label, i) => <div key={i} style={{ whiteSpace: 'pre', background: "#f0f0f0" }}>{_.get(this.state, `rowData.${label}`)}</div>)}
                    </Tab>
                </Modal>
            </div>
        )
    }
}

class StatusPrinter {
    print(data) {
        let classes = {
            SUCCESSFUL: "success",
            PENDING: "primary",
            FAILED: "danger",
        };
        let className = `uk-badge uk-badge-small uk-badge-${classes[data.code]}`;
        return <i className={className}>{data.name}</i>;
    }
}
