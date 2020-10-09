import React from 'react';
import { Button, Notify } from 'susam-components/basic';
import { DropDown } from 'susam-components/basic/DropDown';
import { Grid, GridCell, HeaderWithBackground } from 'susam-components/layout';
import { EnumUtils } from 'susam-components/utils';
import uuid from 'uuid';
import { PricingRuleService } from '../services';
import { Table } from './Table';
export class PriceTable extends React.Component {

    state = {
        readOnly: true,
        prices: [],
        priceTable: {
            columnHeaders: [],
            rowHeaders: []
        },
        createFormId: uuid.v4()
    };

    get tariffs() {
        return _.get(this.props,'tariffs',[]);
    }

    constructor(props) {
        super(props);
        this.listPrices();
    }

    componentDidMount() {
        this.setState({
            tariffGroup: this.getTariffGroup(),
            payweight: _.find(this.props.lookup.payweights, i=>i.defaultPayweight)
        });
    }

    getTariffGroup() {
        let tariffGroup = _.first(_.uniqWith(this.tariffs.map(t => t.tariffGroup), (x, y) => x.id === y.id));
        return tariffGroup
    }

    listPrices() {
        let tariffCodes = this.tariffs.map(t => t.code);
        PricingRuleService.listPriceByTariff(tariffCodes).then(response => {
            this.setState({
                readOnly: !_.isEmpty(response.data),
                prices: response.data,
                priceTable: this.generatePriceTable(response.data)
            })
        }).catch(error => Notify.showError(error));
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
            })
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

    toMap(arr) {
        return new Map(arr.map(obj => [obj.tariff.code + '#' + obj.payweight.name, obj]));
    }

    generatePriceTable(prices) {
        if (prices) {
            let currency = _.first(_.uniq(prices.map(i => i.currency)));
            let payweightRanges = _.sortBy(_.uniqWith(prices.map(p=>p.payweight), (x, y) => x.minimum === y.minimum), j => j.minimum);
            let tariffs = _.uniqWith(prices.map(i => i.tariff), (x, y) => x.code === y.code);
            return {
                prices: this.toMap(prices),
                currency: currency,
                rowHeaders: payweightRanges,
                columnHeaders: tariffs
            }
        } else {
            let currency = this.state.currency.code;
            let payweightRanges = this.state.payweight.ranges;
            let priceList = [];
            this.tariffs.forEach(tariff => {
                payweightRanges.forEach(payweight => {
                    priceList.push({
                        ruleType: EnumUtils.enumHelper("UNIT_PRICE"), 
                        currency: currency,
                        payweight: payweight,
                        tariff: tariff,
                    });
                })
            })
            return {
                prices: this.toMap(priceList),
                currency: currency,
                rowHeaders: payweightRanges,
                columnHeaders: this.tariffs
            }
        }
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
            this.setState({
                prices: response.data,
                readOnly: true,
                priceTable: this.generatePriceTable(response.data)
            });
        }).catch(error => Notify.showError(error));
    }

    handleCreatePriceTable() {
        this.setState({ priceTable: this.generatePriceTable(), readOnly: false });
    }

    handlePriceUpdate(value) {
        this.setState(prevState => {
            let prices = _.isArray(value) ? value : [value];
            prices.forEach(price=>{
                prevState.priceTable.prices.set(price.tariff.code+'#'+price.payweight.name, price);
            });
            return prevState;
        });
    }

    findPrice(prices, row, column) {
        return prices.get(column.code+'#'+row.name);
    }

    render() {
        let { lookup, title } = this.props;
        let { createFormId, priceTable } = this.state;
        return (
            <div>
                <HeaderWithBackground title={title} icon="plus" onIconClick={() => $(`#${createFormId}`).slideToggle()} />
                {(this.state.readOnly || this.state.priceTable.prices) &&
                    <div id={createFormId} style={{ display: 'none' }}>
                        <Grid>
                            <GridCell width="1-5">
                                <DropDown label="Currency" options={lookup.currencies} value={this.state.currency} onchange={value => this.setState({ currency: value })} />
                            </GridCell>
                            <GridCell width="1-5">
                                <DropDown label="PW" options={lookup.payweights} value={this.state.payweight} onchange={value => this.setState({ payweight: value })} />
                            </GridCell>
                            <GridCell width="1-5">
                                <Button label="Create Price Table" flat={true} style="primary" disabled={!this.state.payweight || !this.state.currency} onclick={() => this.handleCreatePriceTable()} />
                            </GridCell>
                        </Grid>
                    </div>}
                <Grid>
                    <GridCell width="1-1">
                        <Table priceTable={priceTable} 
                            ruleTypeVisible={true}
                            readOnly={this.state.readOnly} 
                            onPriceUpdate={price => this.handlePriceUpdate(price)} 
                            findPrice={(prices, row, column)=>this.findPrice(prices, row, column)} />
                    </GridCell>
                    {!this.state.readOnly &&
                        <GridCell width="1-1" style={{ textAlign: 'right' }}>
                            <Button label='cancel' style="danger" onclick={() => this.handleCancelClick()} />
                            <Button label='save' style="success" onclick={() => this.handleSaveClick()} />
                        </GridCell>}
                    {this.state.readOnly &&
                        <GridCell width="1-1" style={{ textAlign: 'right' }}>
                            <Button label="export json" flat={true} style="danger" onclick={() => this.export()} />
                            <Button label="edit" style="primary" onclick={() => this.setState({ readOnly: false })} />
                        </GridCell>}
                </Grid>
            </div>)
    }
}