import * as axios from 'axios';
import React from 'react';
import { Button, DropDown, Notify } from 'susam-components/basic';
import { Card, Grid, GridCell, PageHeader, Tab } from 'susam-components/layout';
import { CrmAccountService, KartoteksService, LocationService, PricingRuleService, PricingService } from '../../services';
import { Subsidiary } from '../Subsidiary';
import { LinehaulPriceTable } from './LinehaulPriceTable';

const PATH = 'linehaul';
export class LinehaulManagement extends React.Component {

    state = {
        crossdocks: [],
        lookup: {
            currencies: [],
            countries: [],
            operations: []
        }
    };

    constructor(props) {
        super(props);
        this.retrieveLookups();
    }

    componentDidUpdate(prevProps, prevState) {
        UIkit.domObserve(`[data-uk-observe]`, function (element) { });
    }

    retrieveLookups() {
        axios.all([
            PricingRuleService.listLookups('currency'),
            PricingService.listLookups('linehaul-operation')
        ]).then(axios.spread((currency, operation) => {
            this.setState({
                lookup: {
                    currencies: currency.data,
                    operations: operation.data
                }
            });
        })).catch(error => Notify.showError(error));
    }

    retrieveCountrires() {
        return new Promise((resolve, reject) => {
            if (!_.isEmpty(this.state.countryList)) {
                resolve(this.state.countryList);
            }
            CrmAccountService.listCountries().then(response => {
                this.setState({
                    countryList: response.data,
                });
                resolve(response.data);
            }).catch(error => {
                reject(error);
                Notify.showError(error, true)
            });
        })
    }

    adjustTariffs(tariffs) {
        let { subsidiaryCountry } = this.state;
        return {
            EXPORT: _.filter(tariffs, i => i.fromCountry.iso === subsidiaryCountry.iso),
            IMPORT: _.filter(tariffs, i => i.toCountry.iso === subsidiaryCountry.iso)
        };
    }

    listTariffs(subsidiary = this.state.subsidiary) {
        return new Promise((resolve, reject)=>{
            let { lookup, country, subsidiaryCountry } = this.state;
            if(!country){
                return;
            }
            let calls = lookup.operations.map(operation => {
                let query = {}
                _.set(query, operation.code === 'IMPORT' ? 'FROM_COUNTRY' : 'TO_COUNTRY', country.iso);
                _.set(query, operation.code === 'EXPORT' ? 'FROM_COUNTRY' : 'TO_COUNTRY', subsidiaryCountry.iso);
                return PricingService.query(PATH, subsidiary.id, query);
            });
            axios.all(calls).then(axios.spread((x, y) => {
                let tariffs = _.union(x.data, y.data);
                this.setState({
                    tariffs: this.adjustTariffs(tariffs)
                });
                return PricingService.query("foreign-region", subsidiary.id, { COUNTRY: country.iso });
            })).then(response => {
                this.setState({
                    regions: _.groupBy(response.data, i => i.operation.code)
                }, ()=>resolve())
            }).catch(error => {
                Notify.showError(error);
                reject(error);
            });
        });
    }

    handleSubsidiaryChange(value) {
        this.setState({ subsidiary: value, country: null, countries: [], tariffs: [] });
        if (value) {
            axios.all([
                this.retrieveCountrires(),
                KartoteksService.getCompany(value.defaultInvoiceCompany.id)
            ]).then(axios.spread((countries, company) => {
                let { country } = company.data;
                this.setState(prevState => {
                    prevState.subsidiaryCountry = { name: country.countryName, iso: country.iso };
                    prevState.lookup.countries = _.reject(countries, i => i.iso === country.iso);
                    return prevState;
                });
                return LocationService.retriveWarehouse({country});
            })).then(response => {
                this.setState({ crossdocks: response.data });
            }).catch(error => Notify.showError(error));
        }
    }

    handleAddTariff() {
        this.listTariffs().then(()=>{
            let { subsidiary, tariffs, country, crossdocks, subsidiaryCountry, regions } = this.state;
            let newTariffs = []
            crossdocks.forEach(w=>{
                regions.COLLECTION.forEach(r=>{
                    let importTariff = {
                        subsidiary: subsidiary,
                        warehouse: w,
                        fromCountry: country,
                        toCountry: subsidiaryCountry,
                        region: r
                    }
                    newTariffs.push(_.find(tariffs.IMPORT, t => this.isTariffEqual(t, importTariff)) || importTariff);
                });
                regions.DELIVERY.forEach(r=>{
                    let exportTariff = {
                        subsidiary: subsidiary,
                        warehouse: w,
                        fromCountry: subsidiaryCountry,
                        toCountry: country,
                        region:r
                    }
                    newTariffs.push(_.find(tariffs.EXPORT, t => this.isTariffEqual(t, exportTariff)) || exportTariff);
                })
            });
            return PricingService.saveBulk(PATH, newTariffs);
        }).then(response=>{
            this.setState({
                    tariffs: this.adjustTariffs(response.data)
                });
            //return this.listTariffs();
        }).catch(error => Notify.showError(error))
    }

    isTariffEqual(x, y) {
        return x.fromCountry.iso == y.fromCountry.iso
            && x.toCountry.iso == y.toCountry.iso
            && x.warehouse.id == y.warehouse.id
            && x.region.code == y.region.code
    }

    render() {
        let { lookup, country, tariffs, subsidiary, subsidiaryCountry } = this.state;
        return (
            <div>
                <PageHeader title="Linehaul Management" />
                <Card>
                    <Grid>
                        <GridCell width="2-5">
                            <Subsidiary label="Subsidiary" value={subsidiary} onchange={value => this.handleSubsidiaryChange(value)} />
                        </GridCell>
                        <GridCell width="2-5">
                            <DropDown label="Country" options={lookup.countries} value={country} onchange={value => this.setState({ country: value }, () => this.listTariffs())} />
                        </GridCell>
                        <GridCell width="1-5">
                            <Button label="add or update" style="success" onclick={() => this.handleAddTariff()} />
                        </GridCell>
                    </Grid>
                    {!_.isEmpty(_.get(tariffs,'IMPORT')) && !_.isEmpty(_.get(tariffs,'EXPORT')) &&
                        <Grid>
                            <GridCell width="1-1">
                                <div data-uk-observe>
                                    <Tab labels={lookup.operations.map(i => i.name)}>
                                        {lookup.operations.map((operation, index) =>
                                            <LinehaulPriceTable key={index}
                                                lookup={lookup}
                                                operation={operation}
                                                tariffs={tariffs[operation.code]}
                                                subsidiary={subsidiary}
                                                country={subsidiaryCountry} />)}
                                    </Tab>
                                </div>
                            </GridCell>
                        </Grid>}
                </Card>
            </div>)
    }
}