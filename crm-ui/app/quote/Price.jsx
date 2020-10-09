import _ from "lodash";
import PropTypes from "prop-types";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { NumericInput } from "susam-components/advanced";
import { Checkbox, DropDown, Form, Notify, Span } from 'susam-components/basic';
import { Grid, GridCell } from "susam-components/layout";
import { LookupService } from '../services';
import { StringUtils } from "../utils";
import { PriceAuthorization } from "./PriceAuthorization";
import { PriceDiscountList } from "./PriceDiscountList";
import { WarningMessageWhenCalculatedPriceIsZero } from "./WarningMessageWhenCalculatedPriceIsZero";

export class Price extends TranslatingComponent {
    state = {
        currencies: []
    };

    get isFreight(){
        return _.get(this.props,'price.billingItem.name','').endsWith('_FREIGHT');
    }

    get isCostBased() {
        return "COST_BASED_SPOT_QUOTE_TARIFF" === _.get(this.props, 'calculatedPrices.calculationTariff');
    }

    get isCalculatedPriceZero() {
        let profits = _.get(this.props, 'calculatedPrices.calculatedPrices',[]).map(i=>i.profit);
        return 1 == profits.length && 'OTHER' == _.get(_.first(profits), 'code')
    }

    constructor(props){
        super(props);
        this.state.profitPrices = _.first(_.get(this.props,'calculatedPrices.calculatedPrices'));
    }

    componentDidMount() {
        this.init();
    }

    init() {
        LookupService.getCurrencies().then(response => {
            this.setState({ currencies: response.data })
        }).catch(err => Notify.showError(err));
    }

    handleChange(key, value) {
        let price = _.cloneDeep(this.props.price);
        _.set(price, key, value);
        this.props.onChange(price);
    }

    handleProfitChange(value){
        let { calculatedPrices, price, onChange } = this.props;
        let foundProfit = value ? _.find(calculatedPrices.calculatedPrices, i => _.isEqualWith(i.profit, value, (x, y) => x.code === y.code)) : null;
        this.setState({ profitPrices: foundProfit }, ()=>{
            if(foundProfit && onChange){
                let foundPrice = _.find(foundProfit.prices, i=>_.isEqualWith(i.billingItem, price.billingItem, (x, y) => x.name === y.name));
                foundPrice._key = price._key;
                onChange(foundPrice)
            }
        })
    }

    handleAuthoriztionChange(value) {
        let priceCalculation = _.cloneDeep(this.props.price.priceCalculation);
        if (_.get(value, 'priceRequest')) {
            if(!this.checkPriceRequest(priceCalculation)){
                return;
            }
            this.handleChange("priceCalculation", priceCalculation);
        }
        this.handleChange("authorization", value);
    }

    checkPriceRequest(priceCalculation){
        let selectedDiscounts = _.defaultTo(priceCalculation.selectedDiscounts, []);
        let availableDiscounts = _.defaultTo(priceCalculation.availableDiscounts, []);
        if(selectedDiscounts.length != availableDiscounts.length){
            Notify.showError("You should select all the discounts before requesting a price");
            return false
        }
        return true;
    }

    handleSelectedDiscountsChange(selectedDiscounts) {
        let price = _.cloneDeep(this.props.price);
        let calculatedAmount = this.props.price.calculatedAmountOrg
        selectedDiscounts.forEach(selectedDiscount => {
            calculatedAmount = calculatedAmount - selectedDiscount.amount;
        });
        price.priceCalculation.calculatedAmount = calculatedAmount;
        price.priceCalculation.selectedDiscounts = selectedDiscounts;
        price.authorization = null;

        this.props.onChange(price);
    }

    validate() {
        if (!this.form.validate()) {
            return false;
        }
        return true;
    }

    renderAddToFreight() {
        if (this.props.addToFreight && !this.isFreight) {
            return (
                <GridCell width="1-1">
                    <Checkbox label="Add to Freight Price" value={this.props.price.addToFreight}
                        onchange={(e) => { this.handleChange("addToFreight", e) }} />
                </GridCell>
            );
        } else {
            return null;
        }
    }

    renderPrice() {
        if (this.props.price.priceCalculation) {
            return this.renderWithPriceCalculation();
        }
        return this.renderWithOutPriceCalculation();
    }

    renderPriceAuthorization() {
        if ('ROAD' !== _.get(this.props, 'quote.serviceArea.code')) {
            return null;
        }
        if (0 === _.get(this.props.price, 'priceCalculation.minAmount')) {
            return null;
        }
        return (<GridCell width="1-2">
            <PriceAuthorization price={this.props.price}
                authorization={this.props.price.authorization}
                onchange={value => this.handleAuthoriztionChange(value)} />
        </GridCell>);
    }

    renderWithPriceCalculation() {
        let discountList = <PriceDiscountList
                discounts={this.props.price.priceCalculation.availableDiscounts}
                selectedDiscounts={this.props.price.priceCalculation.selectedDiscounts}
                onChange={(value) => this.handleSelectedDiscountsChange(value)} />

        let minAmount= StringUtils.formatNumber(this.props.price.priceCalculation.minAmount);
        let calculated = this.props.price.priceCalculation.calculatedAmount;
        let calculatedAmount = StringUtils.formatNumber(calculated);
        return (

            <div>
                <Form ref={c => this.form = c}>
                    <Grid widthLarge={true} margin={true} divider={true}>
                        {this.renderCampaign()}
                        <GridCell width="1-8">
                            <Span label="Minimum Amount"
                                value ={minAmount} />
                        </GridCell>
                        <GridCell width="1-8">
                            <Span label="Calculated Amount"
                                value ={calculatedAmount} />
                        </GridCell>
                        {this.isCostBased && this.isFreight && !this.isCalculatedPriceZero &&
                        <GridCell width="1-4">
                            <DropDown label="Profit" value={_.get(this.state,'profitPrices.profit')} 
                                options={this.props.calculatedPrices.calculatedPrices.map(i=>i.profit)} 
                                onchange={value=>this.handleProfitChange(value)} />
                        </GridCell>}
                        <GridCell width="1-4">
                            <NumericInput label="Price" digits="2" digitsOptional={false} required={true}
                                value={this.props.price.charge.amount}
                                readOnly={this.isCostBased && this.isFreight && "OTHER" !== _.get(this.state,'profitPrices.profit.code')}
                                onchange={(value) => this.handleChange("charge.amount", value)} />
                        </GridCell>
                        <GridCell width="1-8">
                            {this.renderCurrency()}
                        </GridCell>
                    </Grid>
                </Form>
                {!this.isCostBased && 
                <div>
                    {discountList}
                    {this.renderPriceAuthorization()}
                </div>}
            </div>
        );
    }

    renderCurrency() {
        if (this.props.price.calculatedAmountOrg === 0) {
            return (
                <DropDown options={this.state.currencies} label="Currency"
                    value={this.props.price.charge.currency} required={true}
                    onchange={(currency) => this.handleChange("charge.currency", currency)} />
            );
        } else {
            return (
                <Span label="Currency" value={this.props.price.charge.currency.name} />
            );
        }
    }

    renderWithOutPriceCalculation() {
        return (
            <div>
                <Form ref={c => this.form = c}>
                    <Grid widthLarge={true} margin={true} divider={true}>
                        {this.renderCampaign()}
                        <GridCell width="1-2">
                            <NumericInput label="Price" digits="2" digitsOptional={false} required={true}
                                value={this.props.price.charge.amount}
                                onchange={(value) => this.handleChange("charge.amount", value)} />
                        </GridCell>
                        <GridCell width="1-2">
                            <DropDown options={this.state.currencies} label="Currency"
                                value={this.props.price.charge.currency} required={true}
                                onchange={(currency) => this.handleChange("charge.currency", currency)} />
                        </GridCell>
                    </Grid>
                </Form>
            </div>
        );
    }

    renderCampaign() {
        let campaign = this.props.price.campaign;
        if (!this.isCostBased && !_.isNil(campaign)) {
            let label = super.translate("Campaign") + ": " + campaign.minPrice + "-" + campaign.maxPrice + " " + campaign.currency.code;
            return (
                <GridCell width="1-1">
                    <Checkbox label={label} value={this.props.price.useCampaign} onchange={(value) => this.handleChange("useCampaign", value)} />
                </GridCell>
            );
        }
        return null;
    }

    renderCostBasedFreightPrices() {
        let { profitPrices } = this.state;
        if (profitPrices && this.isCostBased && this.isFreight && !this.isCalculatedPriceZero) {
            return (<Grid>
                <GridCell width="1-6">
                    <Span label="Collection" value={StringUtils.formatMoney(_.get(profitPrices,'unitPrice.collection.amount'), _.get(profitPrices, 'unitPrice.collection.currency','EUR' ))} />
                </GridCell>
                <GridCell width="1-6">
                    <Span label="Delivery" value={StringUtils.formatMoney(_.get(profitPrices,'unitPrice.delivery.amount'), _.get(profitPrices, 'unitPrice.delivery.currency', 'EUR' ))} />
                </GridCell>
                <GridCell width="1-6">
                    <Span label="Linehaul" value={StringUtils.formatMoney(_.get(profitPrices,'unitPrice.linehaul.amount'), _.get(profitPrices, 'unitPrice.linehaul.currency','EUR' ))}/>
                </GridCell>
                <GridCell width="1-2" />
            </Grid>);
        }
        return null;
    }

    render() {
        if (!this.props.price || !this.props.price.charge) {
            return null;
        }
        return (<div>
            {this.renderCostBasedFreightPrices()}
            <Grid widthLarge={true} margin={true} divider={true}>
                <WarningMessageWhenCalculatedPriceIsZero price={this.props.price} />
                {this.renderAddToFreight()}
                <GridCell width="1-1" noMargin={true}>
                    {this.renderPrice()}
                </GridCell>
            </Grid>
            </div>
        );
    }
}
Price.contextTypes = {
    translator: PropTypes.object
};


