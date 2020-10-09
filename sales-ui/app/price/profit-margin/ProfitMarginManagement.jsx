import * as axios from 'axios';
import React from 'react';
import { Notify } from 'susam-components/basic';
import { Card, Grid, GridCell, PageHeader, Tab } from 'susam-components/layout';
import { PricingService } from '../../services';
import { Subsidiary } from '../Subsidiary';
import { ProfitMarginTable } from './ProfitMarginTable';

const PATH = 'profit-margin';

export class ProfitMarginManagement extends React.Component {
    state = {
        tariffs: {},
        lookup: {
            operations: []
        }
    };

    constructor(props) {
        super(props);
        this.retrieveLookups();
    }

    componentDidUpdate(prevProps, prevState) {
        if (!_.isEqual(prevState.tariffs, this.state.tariffs)) {
            UIkit.domObserve(`[data-uk-observe]`, function (element) { });
        }
    }

    retrieveLookups() {
        axios.all([
            PricingService.listLookups('linehaul-operation')
        ]).then(axios.spread((operation) => {
            this.setState({
                lookup: {
                    operations: operation.data
                }
            });
        })).catch(error => Notify.showError(error));
    }

    handleSubsidiaryChange(value) {
        this.setState({ subsidiary: value, tariffs: [] });
        if (value) {
            this.listTariffs(value);
        }
    }

    listTariffs(subsidiary = this.state.subsidiary) {
        PricingService.list(PATH, subsidiary.id).then(response => {
            this.setState({ tariffs: _.groupBy(response.data, i => i.operation.code) });
        }).catch(error => Notify.showError(error));
    }

    handlePayweightChange(value) {
        this.setState({ payweight: value });
    }

    handleSaveTariff(tariff) {
        tariff.subsidiary = this.state.subsidiary;
        PricingService.save(PATH, tariff).then(response => {
            this.listTariffs();
        }).catch(error => Notify.showError(error));
    }

    handleAddTariff(tariff) {
        let tariffs = _.cloneDeep(this.state.tariffs);
        let operationTariffs = _.get(tariffs, tariff.operation.code, []);
        operationTariffs.push(tariff);
        _.set(tariffs, tariff.operation.code, operationTariffs);
        this.setState({ tariffs });
    }

    handleDeleteTariff(tariff) {
        PricingService.delete(PATH, tariff.id).then(response => {
            this.listTariffs();
        }).catch(error => Notify.showError(error));
    }

    render() {
        let { subsidiary, tariffs, lookup } = this.state
        return (<div>
            <PageHeader title="Profit Margin Management" />
            <Card>
                <Grid>
                    <GridCell width="2-5">
                        <Subsidiary value={subsidiary} onchange={value => this.handleSubsidiaryChange(value)} />
                    </GridCell>
                </Grid>
                <div data-uk-observe>
                    <Tab labels={lookup.operations.map(i => i.name)}>
                        {lookup.operations.map((operation, index) => <ProfitMarginTable key={index}
                            title={`${operation.name} Profit Margins`}
                            operation={operation} tariffs={_.get(tariffs, operation.code, [])}
                            onSaveTariff={tariff => this.handleSaveTariff(tariff)}
                            onAddTariff={tariff => this.handleAddTariff(tariff)}
                            onDeleteTariff={tariff => this.handleDeleteTariff(tariff)} />
                        )}
                    </Tab>
                </div>
            </Card>
        </div>)
    }
}