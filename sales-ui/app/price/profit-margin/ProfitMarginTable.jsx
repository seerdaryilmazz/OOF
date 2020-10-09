import React from 'react';
import { Button, Notify } from 'susam-components/basic';
import { Grid, GridCell } from 'susam-components/layout';
import { HeaderWithBackground } from 'susam-components/layout/Header';
import { EnumUtils } from 'susam-components/utils';
import uuid from 'uuid';
import { PricingRuleService } from '../../services';
import { PayweightDropdown } from '../PayweightDropdown';
import { Table } from '../Table';

export class ProfitMarginTable extends React.Component {
    state = {
        readOnly: true,
        prices: [],
        priceTable: {
            columnHeaders: [],
            rowHeaders: []
        },
        createFormId: uuid.v4()
    };

    emptyPriceTable() {
        return {
            columnHeaders: [],
            rowHeaders: []
        };
    }

    findPrice(prices, row, column) {
        return _.find(prices, i => i.payweight.minimum === row.minimum && i.payweight.maximum === row.maximum && i.tariff.code === column.code);
    }

    constructor(props) {
        super(props);
        this.listPrices();
    }

    componentDidUpdate(prevProps) {
        if (!_.isEqual(prevProps.tariffs, this.props.tariffs)) {
            this.listPrices();
        }
    }

    listPrices() {
        let tariffCodes = this.props.tariffs.map(t => t.code);
        PricingRuleService.listPriceByTariff(tariffCodes).then(response => {
            this.setState({
                prices: response.data,
                priceTable: this.generatePriceTable(response.data)
            });
        }).catch(error => Notify.showError(error));
    }

    generatePriceTable(prices) {
        let { priceTable } = this.state;
        if (!_.isEmpty(priceTable.prices)) {
            let payweightRanges = _.sortBy(_.uniqWith(priceTable.prices.map(p => p.payweight), (x, y) => x.minimum === y.minimum), j => j.minimum);
            let { tariffs } = this.props;

            let prices = [];
            tariffs.forEach(tariff => {
                payweightRanges.forEach(payweight => {
                    let found = _.find(priceTable.prices, i => i.tariff.code === tariff.code && i.payweight.minimum === payweight.minimum);
                    if (found) {
                        prices.push(found);
                    } else {
                        prices.push({
                            priceType: EnumUtils.enumHelper("RATE"),
                            payweight: payweight,
                            tariff: tariff,
                        });
                    }
                })
            })
            return {
                prices: prices,
                rowHeaders: payweightRanges,
                columnHeaders: tariffs
            }
        } else if (prices) {
            let payweightRanges = _.sortBy(_.uniqWith(prices.map(p => p.payweight), (x, y) => x.minimum === y.minimum), j => j.minimum);
            let tariffs = this.props.tariffs.filter(tariff=>_.uniqWith(prices.map(i => i.tariff), (x, y) => x.code === y.code).map(i=>i.code).includes(tariff.code));
            return {
                prices: prices,
                rowHeaders: payweightRanges,
                columnHeaders: tariffs
            }
        } else {
            let payweightRanges = this.state.payweight.ranges;
            let tariffs = _.isEmpty(this.props.tariffs) ? [this.initialTariff] : this.props.tariffs;
            let priceTablePrices = [];
            payweightRanges.forEach(payweight => {
                tariffs.forEach(tariff => {
                    priceTablePrices.push({
                        priceType: EnumUtils.enumHelper("RATE"),
                        payweight: payweight,
                        tariff: tariff,
                    });
                })
            })
            return {
                prices: priceTablePrices,
                rowHeaders: payweightRanges,
                columnHeaders: tariffs
            }
        }
    }

    handleCreatePriceTable() {
        this.setState({
            priceTable: this.emptyPriceTable(),
            readOnly: false
        }, () => this.setState({ priceTable: this.generatePriceTable() }))
    }

    get initialTariff() {
        let { operation } = this.props;
        return { operation, new: true };
    }

    handleAddTariff() {
        let { onAddTariff } = this.props;
        onAddTariff && onAddTariff(this.initialTariff)
    }

    handleSaveTariff(tariff) {
        let { onSaveTariff } = this.props;
        onSaveTariff && onSaveTariff(tariff);
    }

    handleEditTariff(tariff) {
        let { onEditTariff } = this.props;
        onEditTariff && onEditTariff(tariff);
    }

    handleDeleteTariff(tariff) {
        let { onDeleteTariff } = this.props;
        onDeleteTariff && onDeleteTariff(tariff);
    }

    handlePriceUpdate(price) {
        this.setState(prevState => {
            let priceIndex = null;
            if (price.id) {
                priceIndex = _.findIndex(prevState.priceTable.prices, i => i.id === price.id);
            } else {
                priceIndex = _.findIndex(prevState.priceTable.prices, i => i.tariff.code === price.tariff.code && i.payweight.minimum === price.payweight.minimum)
            }
            if (0 <= priceIndex) {
                prevState.priceTable.prices[priceIndex] = price;
            } else {
                prevState.priceTable.prices.push(price);
            }
            return prevState;
        });
    }

    handleCancelClick() {
        this.setState(prevState => {
            prevState.priceTable.prices = prevState.prices;
            prevState.readOnly = !_.isEmpty(prevState.prices);
            return prevState;
        });
    }

    handleSaveClick() {
        PricingRuleService.savePrices(this.state.priceTable.prices).then(response => {
            this.setState({
                prices: response.data,
                readOnly: true,
                priceTable: this.emptyPriceTable()
            }, () => this.listPrices())
        }).catch(error => Notify.showError(error));
    }

    render() {
        let { payweight, createFormId, priceTable, readOnly } = this.state;
        return (
            <div>
                <HeaderWithBackground title={this.props.title} icon="plus" onIconClick={() => $(`#${createFormId}`).slideToggle()} />
                {(this.state.readOnly || this.state.priceTable.prices) &&
                    <div id={createFormId} style={{ display: 'none' }}>
                        <Grid>
                            <GridCell width="1-5">
                                <PayweightDropdown value={payweight} onchange={payweight => this.setState({ payweight })} />
                            </GridCell>
                            <GridCell width="1-5">
                                <Button label="Create Table" flat={true} style="primary" disabled={!this.state.payweight} onclick={() => this.handleCreatePriceTable()} />
                            </GridCell>
                        </Grid>
                    </div>}
                <Grid>
                    <GridCell>
                        <Table findPrice={(prices, row, column) => this.findPrice(prices, row, column)}
                            isEditableColumnHeader={true}
                            onPriceUpdate={price => this.handlePriceUpdate(price)}
                            onAddClick={() => this.handleAddTariff()}
                            onDeleteClick={tariff => this.handleDeleteTariff(tariff)}
                            onSaveClick={tariff => this.handleSaveTariff(tariff)}
                            readOnly={readOnly} priceTable={priceTable} />
                    </GridCell>
                    {!readOnly && !_.isEmpty(priceTable.prices) && !_.find(priceTable.prices, i => _.isNil(i.tariff.code)) &&
                        <GridCell width="1-1" style={{ textAlign: 'right' }}>
                            <Button label='cancel' style="danger" onclick={() => this.handleCancelClick()} />
                            <Button label='save' style="success" onclick={() => this.handleSaveClick()} />
                        </GridCell>}
                    {readOnly && !_.isEmpty(priceTable.prices) && !_.find(priceTable.prices, i => _.isNil(i.tariff.code)) &&
                        <GridCell width="1-1" style={{ textAlign: 'right' }}>
                            <Button label="Edit" style="primary" onclick={() => this.setState({ readOnly: false })} />
                        </GridCell>}
                </Grid>
            </div>
        )
    }
}