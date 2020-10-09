import React from 'react';
import { DateRange, NumberInput } from 'susam-components/advanced';
import { Button, Notify } from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';
import { Card, Grid, GridCell, Pagination, Tab } from 'susam-components/layout';
import { Modal } from 'susam-components/layout/Modal';
import { PricingService } from '../../services';
import { AccountSearchAutoComplete } from './AccountSearchAutoComplete';
import ReactJson from 'react-json-view';

const TAB_LABELS = ["request", 'response'];
export class PricingLogManagement extends React.Component {
    state = {
        query: {}
    };

    constructor(props) {
        super(props);
    }

    get result() {
        return _.get(this.state, 'result', {});
    }

    componentDidMount() {
        this.handleSearch();
    }

    handleSearch(page) {
        let param = {
            page: page,
            sort: 'createdAt,desc'
        }
        PricingService.seachCalculationLog(param, this.state.query).then(response => {
            this.setState({ result: response.data });
        }).catch(error => Notify.showError(error, true));
    }

    handleChangeQueryCrit(value) {
        this.setState(prevState => {
            for (let key in value) {
                _.set(prevState.query, key, value[key]);
            }
            return prevState;
        });
    }

    render() {
        return (
            <Grid>
                <GridCell>
                    <Card title="Price Calculation Log">
                        <Grid>
                            <GridCell width="4-9">
                                <AccountSearchAutoComplete label="Account" value={this.state.query.account}
                                    onchange={account => this.handleChangeQueryCrit({ account })} />
                            </GridCell>
                            <GridCell width="1-9">
                                <NumberInput label="Quote Number" value={this.state.query.number}
                                    onchange={number => this.handleChangeQueryCrit({ number })} />
                            </GridCell>
                            <GridCell width="3-9">
                                <DateRange value={this.state.query}
                                    startDateLabel="Start Date"
                                    endDateLabel="End Date"
                                    onchange={value => this.handleChangeQueryCrit(value)} />
                            </GridCell>
                            <GridCell width="1-9">
                                <Button label="search" style="primary" onclick={() => this.handleSearch()} />
                            </GridCell>
                        </Grid>
                    </Card>
                </GridCell>
                <GridCell>
                    <Card>
                        <DataTable.Table data={this.result.content}>
                            <DataTable.Text header="Account" field="quoteInfo.account" printer={new UrlPrinter('/ui/crm/account/{{id}}/view')} />
                            <DataTable.Text header="Quote" field="quoteInfo" printer={new UrlPrinter('/ui/crm/quote/view/{{id}}')} />
                            <DataTable.Text header="Status" field="status" printer={new StatusPrinter()} />
                            <DataTable.Text header="Calculated By" field="createdBy" />
                            <DataTable.DateTime header="Request Time" field="requestTime" />
                            <DataTable.Text header="Duration (ms)" field="duration" />
                            <DataTable.ActionColumn>
                                <DataTable.ActionWrapper track="onclick" onaction={pricingLog => this.setState({ pricingLog }, () => this.modal.open())}>
                                    <Button flat={true} label="view" style="primary" />
                                </DataTable.ActionWrapper>
                            </DataTable.ActionColumn>
                        </DataTable.Table>
                        <Pagination totalElements={this.result.totalElements}
                            page={this.result.number + 1}
                            totalPages={this.result.totalPages}
                            onPageChange={(pageNumber) => this.handleSearch(pageNumber - 1)}
                            range={10} />
                    </Card>
                    <Modal ref={(c) => this.modal = c} medium={true}
                        onclose={() => this.setState({ pricingLog: null })}
                        title="Calculation Log Detail" center={false}>
                        <Tab labels={TAB_LABELS}>
                            {TAB_LABELS.map((label, i) => {
                                return (<ReactJson key={i}
                                    src={_.get(this.state, `pricingLog.${label}`)}
                                    name={label}
                                    iconStyle="triangle"
                                    theme="ocean"
                                    displayObjectSize={false}
                                    displayDataTypes={false} />)
                            })}
                        </Tab>
                    </Modal>
                </GridCell>
            </Grid>
        );
    }
}

class UrlPrinter {
    path;
    constructor(path){
        this.path = path;
    }
    print(data) {
        if(data && data.id){
            return <a style={{color: 'black'}} target="_blank" href={`${this.path.replace('{{id}}',data.id)}`}>{data.name}</a>;
        }
        return _.get(data, 'name');
    }
}

class StatusPrinter {
    CLASSES = {
        SUCCESS: "success",
        ERROR: "danger",
    };
    print(data) {
        let className = `uk-badge uk-badge-small uk-badge-${this.CLASSES[data.code]}`;
        return <i className={className}>{data.name}</i>;
    }
}