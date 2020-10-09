import * as axios from 'axios';
import React from 'react';
import { DropDown, Notify, Button } from 'susam-components/basic';
import * as Datatable from 'susam-components/datatable';
import { Card, Grid, GridCell, HeaderWithBackground, PageHeader } from 'susam-components/layout';
import { CrmAccountService, CrmQuoteService, PricingRuleService, PricingService } from '../../services';
import { Subsidiary } from '../Subsidiary';
import { Surcharge } from './Surcharge';
import { ActionWrapper } from 'susam-components/datatable/wrappers/ActionWrapper';

const PATH = 'surcharge';

export class SurchargeManagement extends React.Component {
    state = {
        lookup: {
            countries: []
        }
    };

    constructor(props) {
        super(props);
        this.listBillingItems();
        this.listLookups();
    }

    newSurcharge() {
        let { billingItem, subsidiary } = this.state;
        return {
            tariff: {
                billingItem,
                subsidiary
            }
        };
    }

    listLookups() {
        axios.all([
            CrmAccountService.listCountries(),
            PricingRuleService.listLookups('price-type'),
            PricingRuleService.listLookups('currency')
        ]).then(axios.spread((country, priceType, currency) => {
            this.setState({
                lookup: {
                    countries: country.data,
                    priceTypes: priceType.data,
                    currencies: currency.data
                }
            });
        })).catch(error => Notify.showError(error));
    }

    listBillingItems() {
        CrmQuoteService.getBillingItems('ROAD').then(response => {
            let billingItems = _.orderBy(response.data, ['code'], ['asc']);
            billingItems.forEach(item => item.description = `${item.code} - ${item.description}`)
            this.setState({ billingItems })
        }).catch(error => Notify.showError(error));
    }

    listTariffs() {
        let { subsidiary, billingItem } = this.state;
        if (!subsidiary || !billingItem) {
            return;
        }

        let query = {
            BILLING_ITEM: billingItem.id
        };
        PricingService.query(PATH, subsidiary.id, query).then(response => {
            let code = response.data.map(i => i.code);
            if (_.isEmpty(code)) {
                return Promise.resolve({ data: [] });
            } else {
                return PricingRuleService.listPriceByTariff(code);
            }
        }).then(response => {
            this.setState({ prices: response.data, surcharge: null });
        }).catch(error => Notify.showError(error));
    }

    handleBillingItemChange(billingItem) {
        this.setState({ billingItem }, () => this.listTariffs());
    }

    handleSubsidiaryChange(subsidiary) {
        this.setState({ subsidiary }, () => this.listTariffs());
    }

    handleSave(surcharge) {
        PricingService.save(PATH, surcharge.tariff).then(response => {
            surcharge.price.tariff = response.data;
            return PricingRuleService.savePrices([surcharge.price]);
        }).then(response => {
            this.listTariffs();
        }).catch(error=>Notify.showError(error));
    }

    handleDelete(surcharge) {
        let billingItem = _.find(surcharge.tariff.parameters, i=>i.code == 'BILLING_ITEM').value;
        Notify.confirm("{0} - {1} will be deleted, Are you sure?", () => {
            PricingService.delete(PATH, surcharge.tariff.id).then(respons => {
                this.listTariffs();
            }).catch(error => Notify.showError(error));
        }, [billingItem.code, _.startCase(_.camelCase(billingItem.name))]);
    }

    render() {
        let { subsidiary, billingItems, billingItem, prices, lookup, surcharge } = this.state;
        if (surcharge) {
            return <Surcharge lookup={lookup} surcharge={surcharge} onSave={surcharge => this.handleSave(surcharge)} onCancel={()=>this.setState({surcharge: null})} />
        }
        return (<div>
            <PageHeader title="Surcharge Management" />
            <Card>
                <Grid>
                    <GridCell width="2-5">
                        <Subsidiary value={subsidiary} onchange={value => this.handleSubsidiaryChange(value)} />
                    </GridCell>
                    <GridCell width="2-5">
                        <DropDown label="Billing Item" options={billingItems} value={billingItem} labelField="description" onchange={value => this.handleBillingItemChange(value)} />
                    </GridCell>
                </Grid>
                {subsidiary && billingItem && <HeaderWithBackground title="Surcharges" icon="plus" onIconClick={() => this.setState({ surcharge: this.newSurcharge() })} />}
                <Datatable.Table data={prices}>
                    <Datatable.Text header="From Country" printer={new ParameterPrinter("FROM_COUNTRY")} />
                    <Datatable.Text header="From Postal" printer={new ParameterPrinter("FROM_POSTAL")} />
                    <Datatable.Text header="To Country" printer={new ParameterPrinter("TO_COUNTRY")} />
                    <Datatable.Text header="To Postal" printer={new ParameterPrinter("TO_POSTAL")} />
                    <Datatable.Lookup header="Pricing Type" field="priceType" />
                    <Datatable.Text header="Price" printer={new PricePrinter()} />
                    <Datatable.Text header="Minimum Price" printer={new PricePrinter('priceBoundry.minimum')} />
                    <Datatable.Text header="Maximum Price" printer={new PricePrinter('priceBoundry.maximum')} />
                    <Datatable.ActionColumn>
                        <ActionWrapper track="onclick" onaction={row=>this.setState({surcharge:{price:row, tariff: row.tariff}})}>
                            <Button style="success" label="edit" flat={true} size="mini" />
                        </ActionWrapper>
                    </Datatable.ActionColumn>
                    <Datatable.ActionColumn>
                        <ActionWrapper track="onclick" onaction={row=>this.handleDelete(row)}>
                            <Button style="danger" label="delete" flat={true} size="mini" />
                        </ActionWrapper>
                    </Datatable.ActionColumn>
                </Datatable.Table>
            </Card>
        </div>);
    }
}

class PricePrinter {

    constructor(field){
        this.field = field;
    }

    printUsingRow(row){
        let priceType = _.get(row, 'priceType.id');
        let currency = _.get(row, 'currency');
        if(this.field){
            let val = _.get(row, this.field);
            return val && Intl.NumberFormat('en', { style: 'currency', currency: currency }).format(val);
        } else if(["PW","GW"].find(i=>i === priceType)){
            let price = Intl.NumberFormat('en', { style: 'currency', currency: currency }).format(row.value);
            return `${price} per ${priceType}${row.payweight.minimum}`
        } else if ("RATE" === priceType) {
            return Intl.NumberFormat('en', { style: 'percent', minimumFractionDigits: 2,mmaximumFractionDigits: 2}).format(row.value/100);
        } else if ("FIXED" === priceType) {
            return Intl.NumberFormat('en', { style: 'currency', currency: currency }).format(row.value);
        }
        return "";
    }
}

class ParameterPrinter{
    constructor(code){
        this.code = code;
    }
    printUsingRow(row){
        let parameter = _.find(row.tariff.parameters, i=>i.code === this.code);
        if(parameter){
            if(_.isObject(parameter.value)){
                return parameter.value.name;
            } else {
                return parameter.value;
            }
        }
        return "ALL";
    }
}