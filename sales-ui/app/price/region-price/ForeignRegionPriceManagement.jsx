import * as axios from 'axios';
import React from 'react';
import { DropDown, Notify } from 'susam-components/basic';
import { Card, Grid, GridCell, Tab } from 'susam-components/layout';
import { Subsidiary } from '..';
import { CrmAccountService, KartoteksService, PricingRuleService, PricingService } from '../../services';
import { PriceTable } from '../PriceTable';

const PATH = 'foreign-region'
export class ForeignRegionPriceManagement extends React.Component {

    state = {
        countries: [],
        tariffs: {},
        lookup: {
            payweights: [],
            countries: [],
            operations: [],
            currency: []
        }
    };

    constructor(props) {
        super(props);
        this.retrieveLookups();
    }

    componentDidUpdate(prevProps, prevState) {
        if (!_.isEqual(prevState.crossdock, this.state.crossdock)) {
            UIkit.domObserve(`[data-uk-observe]`, function (element) { });
        }
    }

    retrieveLookups() {
        axios.all([
            PricingRuleService.listPayweight(),
            PricingService.listLookups('operation'),
            PricingRuleService.listLookups('currency'),
            CrmAccountService.listCountries()
        ]).then(axios.spread((payweight, operation, currency, country) => {
            this.setState({
                lookup: {
                    countries: country.data,
                    payweights: payweight.data,
                    operations: operation.data,
                    currencies: currency.data
                }
            });
        })).catch(error => Notify.showError(error));
    }

    handleSubsidiaryChange(value){
        this.setState({ subsidiary: value })
        if (value) {
            axios.all([
                KartoteksService.getCompany(value.defaultInvoiceCompany.id),
            ]).then(axios.spread((company) => {
                this.setState({
                    countries: _.reject(this.state.lookup.countries, i => i.iso === company.data.country.iso)
                });
            })).catch(error => Notify.showError(error));
        }
    }

    handleCountryChange(value){
        this.setState({ country: value, tariffs:{} })
        if(value) {
            let parameters = {
                COUNTRY: value.iso
            };
            PricingService.query(PATH, this.state.subsidiary.id, parameters).then(response=>{
                this.setState({
                    tariffs: this.adjustTariffs(response.data)
                })
            }).catch(error => Notify.showError(error));
        }
    }

    adjustTariffs(tariffs) {
        return _.groupBy(tariffs, i=>i.operation.id );
    }

    render(){
        let { lookup, country } = this.state;

        return (
            <Card>
                <Grid>
                    <GridCell width="2-5">
                        <Subsidiary label="Subsidiary" value={this.state.subsidiary} onchange={value=>this.handleSubsidiaryChange(value)} />
                    </GridCell>
                    <GridCell width="2-5">
                        <DropDown label="Country"
                            options={this.state.countries}
                            value={this.state.country}
                            onchange={value => this.handleCountryChange(value)} />
                    </GridCell>
                </Grid>
                <Grid>
                    <GridCell width="1-1">
                        <div data-uk-observe>
                            {!_.isEmpty(this.state.tariffs) &&
                            <Tab labels={lookup.operations.map(i => i.name)} >
                                {lookup.operations.map((operation,index)=>
                                    <PriceTable key={index}
                                        title={`${country.name} ${operation.name} Price Table`}
                                        lookup={this.state.lookup}
                                        operation={operation}
                                        tariffs={this.state.tariffs[operation.id]} />)}
                            </Tab>}
                        </div>
                    </GridCell>
                </Grid>
            </Card>
        )
    }
}