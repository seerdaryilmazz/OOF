import React from 'react';
import { NumberInput, NumericInput } from 'susam-components/advanced';
import { Button, DropDown, Form, Notify, TextInput } from 'susam-components/basic';
import { Card, Grid, GridCell } from 'susam-components/layout';
import { EnumUtils } from 'susam-components/utils';
import { PricingService } from '../../services';

const PATH = 'surcharge';

export class Surcharge extends React.Component {

    state = {
        tariff: {},
        price: {}
    };

    componentDidMount() {
        this.getTariff(this.props.surcharge);
    }

    getTariff(value) {
        let surcharge = _.cloneDeep(value);
        if (!surcharge.tariff.id) {
            this.setState({
                tariff: surcharge.tariff,
                price: surcharge.price || {}
            });
            return
        }
        PricingService.get(PATH, surcharge.tariff.id).then(response => {
            this.setState({
                tariff: response.data,
                price: surcharge.price || {}
            });
        }).catch(error => Notify.showError(error));
    }

    handlePriceChange(value) {
        this.setState(prevState => {
            for (let key in value) {
                _.set(prevState.price, key, value[key]);
            }
            return prevState
        });
    }

    handleTariffChange(value) {
        this.setState(prevState => {
            for (let key in value) {
                _.set(prevState.tariff, key, value[key]);
            }
            return prevState
        });
    }

    handleSave() {
        let { onSave } = this.props;
        let { price, tariff } = this.state;
        if(this.surchargeFrom && this.surchargeFrom.validate()){
            onSave && onSave({ price, tariff });
        }
    }

    render() {
        let { lookup } = this.props;
        let { tariff, price } = this.state;

        let priceType = _.get(price, 'priceType.code');
        return (<Card>
            <Form ref={c=>this.surchargeFrom = c}>
                <Grid>
                    <GridCell width="1-4">
                        <DropDown label="From Country" valueField="iso"
                            options={lookup.countries} value={tariff.fromCountry} 
                            onchange={value => this.handleTariffChange({ fromCountry: value })} />
                    </GridCell>
                    <GridCell width="1-4">
                        <TextInput disableAutocomplete={true} 
                            label="From Postal" value={tariff.fromPostal} 
                            onchange={value => this.handleTariffChange({ fromPostal: value })} />
                    </GridCell>
                    <GridCell width="1-4">
                        <DropDown label="To Country" valueField="iso" 
                            options={lookup.countries} value={tariff.toCountry} 
                            onchange={value => this.handleTariffChange({ toCountry: value })} />
                    </GridCell>
                    <GridCell width="1-4">
                        <TextInput disableAutocomplete={true} 
                            label="To Postal" value={tariff.toPostal} 
                            onchange={value => this.handleTariffChange({ toPostal: value })} />
                    </GridCell>
                    <GridCell width="1-6">
                        <DropDown label="Pricing Type" options={lookup.priceTypes} value={price.priceType} required={true}
                            onchange={value => this.handlePriceChange({ priceType: value, payweight: null, priceBoundry: null, value: null })} />
                    </GridCell>
                    <GridCell width="1-6">
                        <NumericInput label="Price" value={price.value} required={true}
                            digits="2" digitsOptional = {true} disableAutocomplete={true} 
                            onchange={value => this.handlePriceChange({ value: value })} />
                    </GridCell>
                    <GridCell width="1-6">
                        <DropDown label="Currency" value={EnumUtils.enumHelper(price.currency)} required={true}
                            options={lookup.currencies} onchange={value => this.handlePriceChange({ currency: _.get(value, 'id') })} />
                    </GridCell>
                    <GridCell widt="1-2" />
                    <GridCell width="1-6">
                        {['PW','GW'].find(i=>i===priceType) && 
                        <NumberInput label={_.get(price, 'priceType.name')} value={_.get(price, 'payweight.minimum')} required={true}
                            onchange={value => this.handlePriceChange({ payweight: { minimum: value, maximum: value } })} />}
                    </GridCell>
                    <GridCell width="1-6">
                        {null != priceType &&'FIXED' !== priceType && 
                        <NumericInput label="Minimum Price" value={_.get(price, 'priceBoundry.minimum')}
                            digits="2" digitsOptional = {true} disableAutocomplete={true} 
                            onchange={value => this.handlePriceChange({ 'priceBoundry.minimum': value })} />}
                    </GridCell>
                    <GridCell width="1-6" key={1}>
                        {null != priceType &&'FIXED' !== priceType && 
                        <NumericInput label="Maximum Price" value={_.get(price, 'priceBoundry.maximum')} 
                            digits="2" digitsOptional = {true} disableAutocomplete={true} 
                            onchange={value => this.handlePriceChange({ 'priceBoundry.maximum': value })} />}
                    </GridCell>
                    <GridCell width="1-2" style={{ textAlign: "right" }}>
                        <Button label="cancel" onclick={() => this.props.onCancel && this.props.onCancel()} />
                        <Button label="save" style="primary" onclick={() => this.handleSave()} />
                    </GridCell>
                </Grid>
            </Form>
        </Card>);
    }
}