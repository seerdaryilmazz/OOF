import React from 'react';
import { NumberInput } from 'susam-components/advanced';
import { Button, DropDown, Notify } from 'susam-components/basic';
import { Grid, GridCell, HeaderWithBackground } from 'susam-components/layout';
import { EnumUtils } from 'susam-components/utils';
import uuid from 'uuid';
import { PricingRuleService } from '../../services';
import { Table } from '../Table';

export class LinehaulPriceTable extends React.Component {

    state = {
        tariffs: [],
        readOnly: true,
        prices: [],
        priceTable: {
            columnHeaders: [],
            rowHeaders: []
        },
        createFormId: uuid.v4()
    };

    renderHeader(createFormId) {
        let { tariffs } = this.state;
        let field = this.getTariffCountryField();
        let countries = _.uniq(_.map(tariffs, i => i[field].name));
        return <HeaderWithBackground title={countries.join(", ")} icon="plus" onIconClick={() => $(`#${createFormId}`).slideToggle()} />
    }

    componentDidMount() {
        this.filterTariffs();
    }

    componentDidUpdate(prevProps, prevState) {
        if (!_.isEqual(prevProps.tariffs, this.props.tariffs)) {
            this.filterTariffs();
        }
        if (!_.isEqual(prevState.tariffs, this.state.tariffs)) {
            this.listPrices()
        }
    }

    findPrice(prices, row, column) {
        let tariff = this.findTariff(column, row);
        return tariff && prices.get(tariff.code);
    }

    handlePriceUpdate(value) {
        this.setState(prevState => {
            let prices = _.isArray(value) ? value : [value];
            prices.forEach(price=>{
                prevState.priceTable.prices.set(price.tariff.code, price);
            });
            return prevState;
        });
    }

    listPrices(tariffs = this.state.tariffs) {
        let tariffCodes = tariffs.map(t => t.code);
        PricingRuleService.listPriceByTariff(tariffCodes).then(response => {
            this.setState({
                readOnly: !_.isEmpty(response.data),
                prices: response.data,
                priceTable: this.generatePriceTable(response.data)
            })
        }).catch(error => Notify.showError(error, true));
    }

    export(){
        let tariffCodes = this.tariffs.map(t => t.code);
        PricingRuleService.listPriceByTariff(tariffCodes).then(response=>{
            let data = response.data;
            data.forEach(i=>{
                delete i['id'];
                delete i['deleted'];
                delete i['deletedAt'];
                delete i['lastUpdated'];
                delete i['lastUpdatedBy'];

                delete i.tariff['id'];
                delete i.tariff['deleted'];
                delete i.tariff['deletedAt'];
                delete i.tariff['lastUpdated'];
                delete i.tariff['lastUpdatedBy'];
                
                i.tariff.parameters.forEach(j=>{
                    delete j['id'];
                    delete j['deleted'];
                    delete j['deletedAt'];
                    delete j['lastUpdated'];
                    delete j['lastUpdatedBy'];
                })
            });
            this.downloadTxtFile(data);
        })
    }
    
    downloadTxtFile = (content) => {
        if (content) {
            console.table(content);
            const element = document.createElement("a");
            const file = new Blob([JSON.stringify(content,null, 4)], { type: "text/plain;charset=utf-8" });
            element.href = URL.createObjectURL(file);
            element.download = 'price-data.json';
            document.body.appendChild(element); // Required for this to work in FireFox
            element.click();
            document.body.removeChild(element);
        } else {
            Notify.showError('No downloadable content');
        }
    }

    extractTariffParameters(tariffs, parameter) {
        let p = _.flatMap(tariffs, i => i.parameters).filter(i=>i.code === parameter);
        let result = _.uniqWith(p, (x, y) => _.isEqual(x.value, y.value));
        return result;
    }

    flatTariffs(tariffs) {
        tariffs.forEach(tariff=>{
            tariff.parameters.forEach(parameter=>{
                parameter.value.iso = parameter.value.code;
                _.set(tariff, _.camelCase(parameter.code), parameter.value);
            })
        })
        return tariffs;
    }

    toMap(arr) {
        return new Map(arr.map(obj => [obj.tariff.code, obj]));
    }

    generatePriceTable(prices) {
        if (prices) {
            let tariffs = this.flatTariffs(_.uniqWith(prices.map(i => i.tariff), (x, y) => x.code === y.code));
            let payweight = _.uniq(prices.map(i=>i.payweight.minimum));
            let currency = _.first(_.uniq(prices.map(i => i.currency)));
            let columns = _.uniqWith(tariffs.map(i => i.region), (x, y) => x.code === y.code);
            let rows = _.uniqWith(tariffs.map(i => i.warehouse), (x, y) => x.id === y.id);
            return {
                firstCellText: `Per ${payweight}PW`,
                prices: this.toMap(prices),
                currency: currency,
                rowHeaders: rows,
                columnHeaders: columns
            }
        } else {
            let { tariffs, payweight } = this.state;
            let currency = this.state.currency.code;
            let columns = _.uniqWith(tariffs.map(i => i.region), (x, y) => x.code === y.code)
            let rows = _.uniqWith(tariffs.map(i => i.warehouse), (x, y) => x.id === y.id);
            let priceList = [];
            columns.forEach(column => {
                rows.forEach(row => {
                    priceList.push({
                        ruleType: EnumUtils.enumHelper("UNIT_PRICE"), 
                        priceType: EnumUtils.enumHelper("PW"), 
                        payweight: {minimum: payweight, maximum: payweight},
                        currency: currency,
                        tariff: this.findTariff(column, row)
                    });
                })
            })
            return {
                firstCellText: `Per ${payweight}PW`,
                prices: this.toMap(priceList),
                currency: currency,
                rowHeaders: rows,
                columnHeaders: columns
            }
        }
    }

    findTariff(column, row) {
        let { tariffs } = this.state;
        return _.find(tariffs, i => i.region.code === column.code && i.warehouse.id === row.id);
    }

    getTariffCountryField(casing = 'camel-case') {
        let { operation } = this.props;
        if ("IMPORT" === operation.code) {
            return casing === 'upper-underscore' ? 'FROM_COUNTRY' : 'fromCountry'
        } else {
            return casing === 'upper-underscore' ? 'TO_COUNTRY' : 'toCountry'
        }
    }
    getSubsidiaryCountryField(casing = 'camel-case') {
        let { operation } = this.props;
        if ("IMPORT" === operation.code) {
            return casing === 'upper-underscore' ? 'TO_COUNTRY' : 'toCountry'
        } else {
            return casing === 'upper-underscore' ? 'FROM_COUNTRY' : 'fromCountry'
        }
    }

    filterTariffs() {
        let { country, tariffs } = this.props;
        let field = this.getSubsidiaryCountryField();
        this.setState({ tariffs: _.filter(tariffs, tariff => tariff[field].iso === country.iso) });
    }

    handleCreatePriceTable() {
        this.setState({ priceTable: this.generatePriceTable(), readOnly: false });
    }

    handleCancelClick() {
        this.setState(prevState => {
            prevState.priceTable = this.generatePriceTable(prevState.prices);
            prevState.readOnly = !_.isEmpty(prevState.prices);
            return prevState;
        });
    }

    handleSaveClick() {
        PricingRuleService.savePrices(Array.from(this.state.priceTable.prices.values())).then(response => {
            this.listPrices(_.uniqWith(response.data.map(i=>i.tariff), (x,y)=>x.code===y.code));
        }).catch(error => Notify.showError(error));
    }

    render() {
        let { lookup } = this.props;
        let { priceTable, createFormId } = this.state;

        return (<div>
            {this.renderHeader(createFormId)}
            {(this.state.readOnly || this.state.priceTable.prices) &&
                <div id={createFormId} style={{ display: 'none' }}>
                    <Grid>
                        <GridCell width="1-5">
                            <NumberInput label="Per PW" value={this.state.payweight} onchange={value => this.setState({ payweight: value })} />
                        </GridCell>
                        <GridCell width="1-5">
                            <DropDown label="Currency" options={lookup.currencies} value={this.state.currency} onchange={value => this.setState({ currency: value })} />
                        </GridCell>
                        <GridCell width="1-5">
                            <Button label="Create Price Table" flat={true} style="primary" disabled={!this.state.payweight || !this.state.currency} onclick={() => this.handleCreatePriceTable()} />
                        </GridCell>
                    </Grid>
                </div>}
            <Grid>
                <GridCell>
                    <Table priceTable={priceTable}
                        firstCellText={this.state.pwGap}
                        readOnly={this.state.readOnly}
                        onPriceUpdate={price => this.handlePriceUpdate(price)}
                        findPrice={(prices, row, column) => this.findPrice(prices, row, column)} />
                </GridCell>
                {!this.state.readOnly &&
                    <GridCell width="1-1" style={{ textAlign: 'right' }}>
                        <Button label='cancel' style="danger" onclick={() => this.handleCancelClick()} />
                        <Button label='save' style="success" onclick={() => this.handleSaveClick()} />
                    </GridCell>}
                {this.state.readOnly &&
                    <GridCell width="1-1" style={{ textAlign: 'right' }}>
                        <Button label="export json" flat={true} style="danger" onclick={() => this.export()} />
                        <Button label="Edit" style="primary" onclick={() => this.setState({ readOnly: false })} />
                    </GridCell>}
            </Grid>
        </div>);
    }
}