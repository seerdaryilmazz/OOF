import * as axios from 'axios';
import React from 'react';
import { DropDown, Notify } from 'susam-components/basic';
import { Card, Grid, GridCell, Tab } from 'susam-components/layout';
import { Subsidiary } from '..';
import { KartoteksService, LocationService, PricingRuleService, PricingService } from '../../services';
import { PriceTable } from '../PriceTable';

const PATH = 'local-region';
export class LocalRegionPriceManagement extends React.Component {

    state = {
        crossdocks: [],
        tariffs: {},
        lookup: {
            payweights: [],
            operations: []
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
            PricingRuleService.listLookups('currency')
        ]).then(axios.spread((payweight, operation, currency) => {
            this.setState({
                lookup: {
                    payweights: payweight.data,
                    operations: operation.data,
                    currencies: currency.data
                }
            });
        })).catch(error => Notify.showError(error));
    }

    handleSubsidiaryChange(value){
        this.setState({ subsidiary: value, crossdocks: [] })
        if (value) {
            KartoteksService.getCompany(value.defaultInvoiceCompany.id).then(response => {
                let query = {
                    country: response.data.country,
                }
                return LocationService.retriveWarehouse(query);
            }).then(response => {
                this.setState({crossdocks: response.data});
            }).catch(error => Notify.showError(error));
        }
    }

    handleWarehouseChange(value){
        this.setState({ crossdock: value, tariffs:{} })
        if(value) {
            let parameters = {
                WAREHOUSE: value.id
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
        let { lookup, crossdock } = this.state;

        return (
            <Card>
                <Grid>
                    <GridCell width="2-5">
                        <Subsidiary label="Subsidiary" value={this.state.subsidiary} onchange={value=>this.handleSubsidiaryChange(value)} />
                    </GridCell>
                    <GridCell width="2-5">
                        <DropDown label="Warehouse"
                            options={this.state.crossdocks}
                            value={this.state.crossdock}
                            onchange={value => this.handleWarehouseChange(value)} />
                    </GridCell>
                </Grid>
                <Grid>
                    <GridCell width="1-1">
                        <div data-uk-observe>
                            {!_.isEmpty(this.state.tariffs) &&
                            <Tab labels={lookup.operations.map(i => i.name)} >
                                {lookup.operations.map((operation, index) =>
                                    <PriceTable key={index} lookup={this.state.lookup}
                                        title={`${crossdock.name} ${operation.name} Price Table`}
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