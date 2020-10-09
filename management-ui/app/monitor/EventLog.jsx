import _ from "lodash";
import React from "react";
import ReactJson from 'react-json-view';
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, DropDown, Notify, TextInput } from "susam-components/basic";
import * as DataTable from 'susam-components/datatable';
import { Grid, GridCell, Modal, Pagination, Tab } from "susam-components/layout";
import { EventMonitorService } from '../services/EventMonitorService';

export class EventLog extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = { selectedDays: 1 };
    }
    populateLogs(response) {
        let consumedLogs = [];
        let notConsumedLogs = [];
        response.content.forEach(event => {
            if (event.consumptions && event.consumptions.length > 0) {
                event.consumptions.forEach(consumption => {
                    consumedLogs.push({
                        id: event.eventId,
                        name: event.name,
                        producedBy: event.producer,
                        producedAt: event.producedAt,
                        consumedBy: consumption.consumer,
                        consumedAt: consumption.consumedAt,
                        exception: consumption.exception,
                        data: event.data
                    });
                });
            } else {
                notConsumedLogs.push({
                    id: event.eventId,
                    name: event.name,
                    producedBy: event.producer,
                    producedAt: event.producedAt,
                    data: event.data
                });
            }
        });
        let page = _.cloneDeep(response)
        delete page.content;
        return {
            page: page,
            consumedLogs: consumedLogs,
            notConsumedLogs: notConsumedLogs
        };
    }
    componentDidMount() {

    }
    search() {
        let event = _.get(this.state.selectedEvent, 'name');
        let service = _.get(this.state.selectedService, 'name');
        let days = this.state.selectedDays;
        let page = this.state.selectedPage;
        if (event || service) {
            EventMonitorService.getEventLog(event, service, days, page).then(response => {
                this.setState(this.populateLogs(response.data));
            }).catch(error => {
                Notify.showError(error);
            });
        }
    }

    updateState(key, value) {
        let state = _.cloneDeep(this.state);
        state[key] = value;
        this.setState(state, () => this.search());
    }

    handleShowData(item) {
        this.setState({ selectedItem: item }, () => {
            this.modal.open();
        });
    }
    handleClose() {
        this.modal.close();
    }
    handleShowGraph() {
        this.props.onShowGraph && this.props.onShowGraph();
    }

    render() {

        return (
            <Grid>

                <GridCell width="1-4">
                    <DropDown label="Events" options={this.props.events}
                        value={this.state.selectedEvent}
                        onchange={(value) => this.updateState("selectedEvent", value)} />
                </GridCell>
                <GridCell width="1-4">
                    <DropDown label="Services" options={this.props.services}
                        value={this.state.selectedService}
                        onchange={(value) => this.updateState("selectedService", value)} />
                </GridCell>
                <GridCell width="1-4">
                    <TextInput label="Days to Show"
                        value={this.state.selectedDays}
                        onchange={(value) => this.updateState("selectedDays", value)} />
                </GridCell>
                <GridCell width="1-4">
                    <Button label="Show Graph" size="small" style="primary" onclick={() => this.handleShowGraph()} />
                </GridCell>

                <GridCell width="1-1">
                    <Tab labels={["Consumed Events", "Not Consumed Events"]} active="Consumed Events" align="vertical">
                        <DataTable.Table data={this.state.consumedLogs}>
                            <DataTable.Text header="Name" field="name" />
                            <DataTable.Text header="Produced By" field="producedBy" />
                            <DataTable.Text header="Produced At" field="producedAt" />
                            <DataTable.Text header="Consumed By" field="consumedBy" />
                            <DataTable.Text header="Consumed At" field="consumedAt" />
                            <DataTable.Text header="Result" field="exception" printer={new ExceptionPrinter()} />
                            <DataTable.ActionColumn >
                                <DataTable.ActionWrapper track="onclick"
                                    onaction={(item) => { this.handleShowData(item) }}>
                                    <Button label="Data" flat={true} style="primary" size="small" />
                                </DataTable.ActionWrapper>
                            </DataTable.ActionColumn>
                        </DataTable.Table>

                        <DataTable.Table data={this.state.notConsumedLogs}>
                            <DataTable.Text header="Name" field="name" />
                            <DataTable.Text header="Produced By" field="producedBy" />
                            <DataTable.Text header="Produced At" field="producedAt" />
                            <DataTable.ActionColumn >
                                <DataTable.ActionWrapper track="onclick"
                                    onaction={(item) => { this.handleShowData(item) }}>
                                    <Button label="Data" flat={true} style="primary" size="small" />
                                </DataTable.ActionWrapper>
                            </DataTable.ActionColumn>
                        </DataTable.Table>
                    </Tab>

                </GridCell>
                <GridCell>
                    {this.state.page && <Pagination page={this.state.page.number + 1}
                        totalElements={this.state.page.totalElements}
                        totalPages={this.state.page.totalPages}
                        onPageChange={page => this.updateState('selectedPage', page - 1)}
                    />
                    }
                </GridCell>
                <Modal ref={(c) => this.modal = c} title="Event Data" minHeight="500px" large={true}
                    actions={[{ label: "Close", action: () => this.handleClose() }]}>
                    <ReactJson src={_.get(this.state, 'selectedItem.data')}
                        sortKeys={true}
                        name="data"
                        iconStyle="triangle"
                        theme="ocean"
                        displayObjectSize={true}
                        displayDataTypes={false} />
                </Modal>
            </Grid>
        );
    }
}
class ExceptionPrinter {
    print(data) {
        return <div title={data} style={{ width: "200px", overflow: "hidden", textOverflow: "ellipsis" }}>{data}</div>
    }
}