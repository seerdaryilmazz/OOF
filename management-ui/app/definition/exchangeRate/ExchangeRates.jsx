import React from "react";
import _ from "lodash";
import uuid from 'uuid';
import * as axios from "axios";

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card, Loader, CardHeader, PageHeader, Pagination} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown, Form} from "susam-components/basic";
import * as DataTable from 'susam-components/datatable';

import {CurrencyService} from "../../services";
import {MissingExchangeRates} from "./MissingExchangeRates";

const PAGE_SIZE = 20;

export class ExchangeRates extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            publishers: [],
            publisher: null,
            publishDates: [],
            publishDatesPageNumber: 1,
            exchangeRates: [],
            keyForDataTable: uuid.v4() // Tablonun sütunları değişmesi gerektiğinde yeni bir değer veriyoruz, şuan DataTable böyle çalışıyor.
        };
    }

    componentDidMount() {
        axios.all([
            CurrencyService.findAllExchangeRatePublishers(),
        ]).then(axios.spread((response) => {
            this.setState({
                publishers: this.sortPublishers(response.data)
            });
        })).catch((error) => {
            Notify.showError(error);
        });
    }

    sortPublishers(publishers) {
        return _.sortBy(publishers, ["name"]);
    }

    sortExchangeRates(exchangeRates) {
        return _.sortBy(exchangeRates, ["currency.code"]);
    }

    /**
     * Buradaki pageNumber 1 ise sunucudaki 0 oluyor.
     */
    findDistinctPublishDatesForPublisher(pageNumber, pageSize, publisher, callback) {
        CurrencyService.findDistinctPublishDatesForPublisher(pageNumber - 1, pageSize, publisher).then(response => {
            callback(response.data);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    /**
     * Buradaki pageNumber 1 ise sunucudaki 0 oluyor.
     */
    findExchangeRatesByPublisherAndPublishDate(publisher, publishDate, callback) {
        let pageNumber = 0;
        let pageSize = 1000; // Olamayacak bir değer veriyoruz.
        CurrencyService.findExchangeRates(pageNumber, pageSize, publisher, publishDate, null, null).then(response => {
            callback(response.data);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    updatePublisher(publisher) {

        let pageNumber = 1;

        if (publisher) {

            this.findDistinctPublishDatesForPublisher(pageNumber, PAGE_SIZE, publisher, (pagedDataHolder) => {

                let publishDates = pagedDataHolder.currentPageContent;

                if (publishDates.length > 0) {
                    this.findExchangeRatesByPublisherAndPublishDate(publisher, publishDates[0], (pagedDataHolderInner) => {
                        this.setState({
                            publisher: publisher,
                            publishDates: publishDates,
                            publishDatesPageNumber: pageNumber,
                            exchangeRates: this.sortExchangeRates(pagedDataHolderInner.currentPageContent),
                            keyForDataTable: uuid.v4()
                        });
                    });
                } else {
                    this.setState({
                        publisher: publisher,
                        publishDates: [],
                        publishDatesPageNumber: pageNumber,
                        exchangeRates: [],
                        keyForDataTable: uuid.v4()
                    });
                }
            });

        } else {
            this.setState({
                publisher: null,
                publishDates: [],
                publishDatesPageNumber: pageNumber,
                exchangeRates: [],
                keyForDataTable: uuid.v4()
            });
        }
    }

    refreshCurrentPublishDatesPageOfCurrentPublisher() {

        let publisher = this.state.publisher;
        let pageNumber = this.state.publishDatesPageNumber;

        this.findDistinctPublishDatesForPublisher(pageNumber, PAGE_SIZE, publisher, (pagedDataHolder) => {

            let publishDates = pagedDataHolder.currentPageContent;

            if (publishDates.length > 0) {
                this.findExchangeRatesByPublisherAndPublishDate(publisher, publishDates[0], (pagedDataHolderInner) => {
                    this.setState({
                        publishDates: publishDates,
                        exchangeRates: this.sortExchangeRates(pagedDataHolderInner.currentPageContent)
                    });
                });
            } else {
                this.setState({
                    publishDates: [],
                    exchangeRates: []
                });
            }
        });
    }

    handlePublishDateClick(publishDate) {
        let publisher = this.state.publisher;
        this.findExchangeRatesByPublisherAndPublishDate(publisher, publishDate, (pagedDataHolder) => {
            this.setState({
                exchangeRates: this.sortExchangeRates(pagedDataHolder.currentPageContent)
            });
        });
    }

    changePublishDatesPage(pageNumber) {

        let publisher = this.state.publisher;

        this.findDistinctPublishDatesForPublisher(pageNumber, PAGE_SIZE, publisher, (pagedDataHolder) => {

            let publishDates = pagedDataHolder.currentPageContent;

            if (publishDates.length > 0) {
                this.findExchangeRatesByPublisherAndPublishDate(publisher, publishDates[0], (pagedDataHolderInner) => {
                    this.setState({
                        publishDates: publishDates,
                        publishDatesPageNumber: pageNumber,
                        exchangeRates: this.sortExchangeRates(pagedDataHolderInner.currentPageContent)
                    });
                });
            } else {
                this.setState({
                    publishDates: [],
                    publishDatesPageNumber: pageNumber,
                    exchangeRates: []
                });
            }
        });
    }

    handleGoToLeftClick() {
        this.changePublishDatesPage(this.state.publishDatesPageNumber - 1);
    }

    handleGoToRightClick() {
        this.changePublishDatesPage(this.state.publishDatesPageNumber + 1);
    }

    handleMissingExchangeRatesClick() {
        this.missingExchangeRatesComponentReference.open(this.state.publisher);
    }

    handleMissingExchangeRatesClose() {
        if (this.state.publisher) {
            this.refreshCurrentPublishDatesPageOfCurrentPublisher();
        }
    }

    renderPublishDates(publishDates) {

        let elements = [];

        publishDates.forEach((publishDate, index) => {
            elements.push(
                <div key={"publishDate-" + index} style={{textAlign: "center"}}>
                    <a href="javascript: void(null)" onClick={() => this.handlePublishDateClick(publishDate)}>{publishDate}</a>
                </div>
            );
        });

        return elements;
    }

    renderExchangeRates(exchangeRates) {

        if (exchangeRates.length == 0) {
            return null;
        } else {
            if (this.state.publisher.code == "CENTRAL_BANK_OF_TURKEY") {
                return (
                    <DataTable.Table key={this.state.keyForDataTable} data={exchangeRates} filterable={true}>
                        <DataTable.Text header="Publish Date" field="publishDate"  width={1}>
                            <DataTable.FilterWrapper/>
                        </DataTable.Text>
                        <DataTable.Numeric header="Unit" field="unit" right={true}  width={1}>
                            <DataTable.FilterWrapper/>
                        </DataTable.Numeric>
                        <DataTable.Text header="From Currency" field="fromCurrency.name" width={1}/>
                        <DataTable.Numeric header="Forex Buying" field="forexBuyingValue" right={true}  width={1}>
                            <DataTable.FilterWrapper/>
                        </DataTable.Numeric>
                        <DataTable.Numeric header="Forex Selling" field="forexSellingValue" right={true}  width={1}>
                            <DataTable.FilterWrapper/>
                        </DataTable.Numeric>
                        <DataTable.Numeric header="Banknote Buying" field="banknoteBuyingValue" right={true}  width={1}>
                            <DataTable.FilterWrapper/>
                        </DataTable.Numeric>
                        <DataTable.Numeric header="Banknote Selling" field="banknoteSellingValue" right={true}  width={1}>
                            <DataTable.FilterWrapper/>
                        </DataTable.Numeric>
                        <DataTable.Text header="To Currency" field="toCurrency.name"  width={1}/>
                        <DataTable.Text header="Description" printer={new DescriptionPrinter()}>
                            <DataTable.FilterWrapper/>
                        </DataTable.Text>
                    </DataTable.Table>
                );
            } else {
                return (
                    <DataTable.Table key={this.state.keyForDataTable} data={exchangeRates} filterable={true}>
                        <DataTable.Text header="Publish Date" field="publishDate" width={1}>
                            <DataTable.FilterWrapper/>
                        </DataTable.Text>
                        <DataTable.Numeric header="Unit" field="unit" right={true} width={1}>
                            <DataTable.FilterWrapper/>
                        </DataTable.Numeric>
                        <DataTable.Text header="From Currency" field="fromCurrency.name" width={1}/>
                        <DataTable.Numeric header="Rate" field="value" right={true} width={1}>
                            <DataTable.FilterWrapper/>
                        </DataTable.Numeric>
                        <DataTable.Text header="To Currency" field="toCurrency.name" width={1}/>
                        <DataTable.Text header="Description" printer={new DescriptionPrinter()}>
                            <DataTable.FilterWrapper/>
                        </DataTable.Text>
                    </DataTable.Table>
                );
            }
        }
    }

    render() {
        return (
            <Grid>
                <GridCell width="1-1">
                    <PageHeader title="Currency Exchange Rates"/>
                </GridCell>
                <GridCell width="1-1">
                    <Grid>
                        <GridCell width="2-5" noMargin={true}>
                            <Card>
                                <DropDown label="Publisher"
                                          value={this.state.publisher}
                                          onchange={(value) => this.updatePublisher(value)}
                                          options={this.state.publishers}/>
                            </Card>
                        </GridCell>
                        <GridCell width="3-5" noMargin={true}>
                            <div className="uk-align-right">
                                <Button label="Retrieve Missing Exchange Rates" style="success" size="small" waves={true} onclick={() => this.handleMissingExchangeRatesClick()}/>
                            </div>
                        </GridCell>
                    </Grid>
                </GridCell>
                <GridCell width="1-1">
                    <Card>
                        <Grid divider={true}>
                            <GridCell width="1-6" noMargin={true}>
                                <Grid>
                                    <GridCell width="1-1">
                                        {this.renderPublishDates(this.state.publishDates)}
                                    </GridCell>
                                    <GridCell width="1-1">
                                        <Button label="Newer" waves={true} size="mini" onclick={() => this.handleGoToLeftClick()}
                                                float="left" disableCooldown={true} disabled={this.state.publishDatesPageNumber == 1}/>
                                        <Button label="Older" waves={true} size="mini" onclick={() => this.handleGoToRightClick()}
                                                float="right" disableCooldown={true} disabled={this.state.publishDates.length == 0}/>
                                    </GridCell>
                                </Grid>
                            </GridCell>
                            <GridCell width="5-6" noMargin={true}>
                                {this.renderExchangeRates(this.state.exchangeRates)}
                            </GridCell>
                        </Grid>
                    </Card>
                </GridCell>
                <GridCell width="1-1">
                    <MissingExchangeRates ref={(c) => this.missingExchangeRatesComponentReference = c}
                                          onClose={() => this.handleMissingExchangeRatesClose()}/>
                </GridCell>
            </Grid>
        );
    }
}

ExchangeRates.contextTypes = {
    router: React.PropTypes.object.isRequired
};

class DescriptionPrinter {
    printUsingRow(row, data) {
        return row.unit + " " + row.fromCurrency.code + " = " + row.value + " " + row.toCurrency.code;
    }
}