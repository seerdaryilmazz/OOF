import PropTypes from "prop-types";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, Notify } from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';
import { Card, Grid, GridCell, LoaderWrapper, Modal } from 'susam-components/layout';
import { CrmQuoteService } from '../services';
import { ObjectUtils } from '../utils';
import { ActionHeader } from '../utils/ActionHeader';
import { StringUtils } from '../utils/StringUtils';
import { Price } from "./Price";
import { PriceDiscountList } from "./PriceDiscountList";
import { WarningMessageWhenCalculatedPriceIsZero } from "./WarningMessageWhenCalculatedPriceIsZero";
export class PriceList extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state={};
        this.numberWithScalePrinter = new NumericPrinter(2);
    }

    translate(text, params) {
        return super.translate(text, params);
    }

    updateState(key, value) {
        let state = _.cloneDeep(this.state);
        state[key] = value;
        this.setState(state);
    }

    handleChange(prices) {
        this.props.onChange(prices);
    }

    editPrice(){
        if(this.priceForm.validate()){
            let price = _.cloneDeep(this.state.price);
            let quote = _.cloneDeep(this.props.quote);
            let prices = quote.prices;

            const index = prices.findIndex(item => item._key === price._key);
            prices[index] = price;

            if (!price.useCampaign) {
                price.campaign = null;
                price.campaignId = null;
            }

            CrmQuoteService.checkPriceValidity(price.billingItem.code, quote).then(response => {
                return CrmQuoteService.getExchangeRate(price.charge.currency, { params: { subsidiaryId: quote.subsidiary.id } });
            }).then(response => {
                let exchangeRate = response.data;
                price.priceExchanged.amount = ((Math.round((price.charge.amount) * (exchangeRate) * 100)) / 100);

                this.handleChange(prices);
                this.setState({ price: undefined }, () => { this.priceModal.close() });
            }).catch(error => {
                this.setState({ excelUploadInProgress: false });
                Notify.showError(error);
            });
        }
    }


    adjustTotals(prices){
        
        let exchangedCurrency = ObjectUtils.enumHelper('EUR');
        let totalPriceIncomes = {amount: 0, currency: exchangedCurrency};
        let totalPriceExpenses = {amount: 0, currency: exchangedCurrency};
        let profit = {amount: 0, currency: exchangedCurrency};
        let profitPercent = "";

        if(prices && prices.length > 0 ){
            prices.forEach(prices => {
                if(prices.priceExchanged && prices.type.code === 'INCOME' ){
                    totalPriceIncomes.amount += prices.priceExchanged.amount;
                    profit.amount += prices.priceExchanged.amount;
                }
                else{
                    totalPriceExpenses.amount += prices.priceExchanged.amount;
                    profit.amount -= prices.priceExchanged.amount;
                }
            });

            if(totalPriceIncomes.amount > 0){
                profitPercent=  ((totalPriceIncomes.amount - totalPriceExpenses.amount) / totalPriceIncomes.amount) ;
            }
        
        }
        return {
            totalPriceIncomes: totalPriceIncomes,
            totalPriceExpenses: totalPriceExpenses,
            profit: profit,
            profitPercent: profitPercent
        };
    }

    setUseCampaign(prevPrice, price) {
        if (_.isNil(price.campaign)) {
            price.useCampaign = null;
        } else {
            if (_.isBoolean(prevPrice.useCampaign)) {
                price.useCampaign = prevPrice.useCampaign;
            } else {
                // Yani önceden kampanya yoksa...
                price.useCampaign = true;
            }
        }
    }

    adjustCalculatedPriceByDiscounts(priceCalculation){
        let calculatedAmountOrg = _.get(priceCalculation, 'calculatedAmount');
        if(calculatedAmountOrg && !_.isEmpty(priceCalculation.selectedDiscounts)){
            calculatedAmountOrg = priceCalculation.selectedDiscounts.map(i=>i.amount).reduce((i1,i2)=>i1+i2, calculatedAmountOrg);
        }
        return calculatedAmountOrg;
    }

    openPriceForm(selectedPrice){
        if(this.props.quote.serviceArea.code == 'ROAD'){
            let quote =  _.cloneDeep(this.props.quote);
            quote.prices = [];
            quote.prices.push(selectedPrice);
            CrmQuoteService.calculatePrices(quote).then(response => {
                let price = _.first(response.data.calculatedPrices).prices[0];
                price._key = price.billingItem.name + '_' + price.type.code;
                price.calculatedAmountOrg = this.adjustCalculatedPriceByDiscounts(price.priceCalculation);
                this.setUseCampaign(selectedPrice, price);
                this.setState({ price, calculatedPrices: response.data }, () => { this.priceModal.open() });
            }).catch(error => {
                Notify.showError(error);
            });
        }else{
            this.setState({price: selectedPrice}, () => {this.priceModal.open()});
        }
    }

    calculatePrices(){
        this.setState({busy: true});
        CrmQuoteService.calculatePrices(this.props.quote).then(response => {
            this.setState({ calculatedPrices: response.data })
            let prices = _.first(response.data.calculatedPrices).prices;
            prices.forEach(price => {
                price._key = `${price.billingItem.name}_${price.type.code}`;
                price.calculatedAmountOrg = this.adjustCalculatedPriceByDiscounts(price.priceCalculation);
                let prevPrice = _.find(this.props.quote.prices, price => price.billingItem.name == price.billingItem);
                this.setUseCampaign(prevPrice, price);
            });
            this.handleChange(prices);
            this.setState({busy: false});
        }).catch(error => {
            this.setState({busy: false});
            Notify.showError(error);
        });
    }

    openPriceDiscountList(price){
        this.setState({selectedDiscounts:  _.get(price,'priceCalculation.selectedDiscounts')}, () => this.priceDiscountModal.open());
    }

    renderPriceModal(){
        const title = this.state.price ? `${this.state.price.billingItem.description} Price` : null;
        return(
            <Modal ref={(c) => this.priceModal = c} title = {title}
                   closeOnBackgroundClicked={false} medium={true}
                   onclose={()=>this.setState({price: undefined})}
                   actions={[
                       {label: "SAVE", buttonStyle:"success", flat:false, action: () => this.editPrice() },
                       {label: "CLOSE", buttonStyle:"danger", flat:false, action: () => this.priceModal.close() }]}>
                {this.renderPriceForm()}
            </Modal>
        );

    }

    renderPriceForm(){
        if(!this.state.price){
            return null;
        }
        let addtoFreight=false;
        if(this.props.quote.serviceArea.code === 'ROAD' && this.state.price.type.code === 'INCOME'||
            this.props.quote.serviceArea.code === 'SEA'|| this.props.quote.serviceArea.code==='AIR'){
            addtoFreight=true;
        }
        return (
            <Price ref={(c) => this.priceForm = c}
                calculatedPrices={this.state.calculatedPrices}
                quote={this.props.quote}
                price={this.state.price}
                addToFreight={addtoFreight}
                onChange={(value) => this.updateState("price", value)}/>
        );
    }

    renderPriceDiscountList(){
        return (
            <Modal ref={(c) => this.priceDiscountModal = c} large={true}
                onclose={() => this.setState({ selectedDiscounts: undefined })}
                actions={[{ label: "CLOSE", buttonStyle: "danger", flat: false, action: () => this.priceDiscountModal.close() }]}>
                {this.state.selectedDiscounts &&
                    <PriceDiscountList
                        discounts={this.state.selectedDiscounts}
                        readOnly={true} />}
            </Modal>
        );
    }

    renderAddToFreight(type){
        if(this.props.quote.serviceArea.code === 'ROAD' && type === 'INCOME'||
            this.props.quote.serviceArea.code === 'SEA'|| this.props.quote.serviceArea.code==='AIR'){
            return(
                <DataTable.Text field="addToFreight" header="Add to Freight Price" width="20" printer={new AddToFreightPrinter()}/>
            );
        }else{
            return(
                <DataTable.Text  header="" width="20"/>
            );
        }
    }

    render() {
        if (!(this.props.quote && this.props.quote.prices)) {
            return null;
        }


         this.adjustTotals(this.props.quote.prices);

        return (
            <Card>
                <ActionHeader title="Prices" readOnly={this.props.readOnly || this.props.quote.serviceArea.code !== 'ROAD'}
                              tools={[{title: "Calculate", items: [{label: "", onclick: () => this.calculatePrices()}]}]} />
                <LoaderWrapper busy = {this.state.busy} title="" size = "S">
                    <Grid>
                        {this.renderDataTable('INCOME')}
                        <WarningMessageWhenCalculatedPriceIsZero quote={this.props.quote}/>
                        {this.renderDataTable('EXPENSE')}
                    </Grid>
                </LoaderWrapper>
                {this.renderPriceModal()}
                {this.renderPriceDiscountList()}
            </Card>
        );
    }

    renderDataTable(type){
        if(!(this.props.quote.serviceArea.code === 'SEA' || this.props.quote.serviceArea.code === 'AIR') && type === 'EXPENSE'){
            return null;
        }
        let prices = _.filter(this.props.quote.prices, {type: {code: type}});
        let totals = this.adjustTotals(this.props.quote.prices);
        let footerRows = [];
        let footerRow = {columns:[
                {
                    colSpan: 1,
                    content: (<span/>)
                },
                {
                    colSpan: 1,
                    content: (<span className="uk-text-warning ">{super.translate("Total ")}{super.translate(type === 'INCOME' ? 'Incomes' : 'Expenses' )}</span>)
                },
                {
                    colSpan: 1,

                    content: (<span className="uk-text-warning "> {(type === 'INCOME' ? this.numberWithScalePrinter.print(this.adjustTotals(this.props.quote.prices).totalPriceIncomes.amount) :
                       this.numberWithScalePrinter.print(this.adjustTotals(this.props.quote.prices).totalPriceExpenses.amount))}</span>)

                },
                {
                    colSpan: 1,
                    content: (<span className="uk-text-warning ">EUR</span>)
                },
                {
                    colSpan: 1,
                    content: (<span className="uk-text-warning uk-text-bold">{super.translate(type === 'EXPENSE' ? 'Profit' : null )}</span>)
                },
                {
                    colSpan: 1,
                    content: (<span className="uk-text-warning uk-text-bold">
                        {type === 'EXPENSE' ? `${StringUtils.formatMoney(totals.profit.amount, 'EUR')}
                        ${totals.profitPercent && '(' + StringUtils.formatPercentage(totals.profitPercent) +')'}`:null}
                        </span>)
                    
                }]};
        footerRows.push(footerRow);

        return(
            <GridCell width="1-2">
                <DataTable.Table key={type + '_' + this.props.readOnly} data={prices} title={type === 'INCOME' ? 'Incomes' : 'Expenses'} footerRows={footerRows}>
                    <DataTable.Text field="billingItem.code" header="Code" width="10" editable = {false}/>
                    <DataTable.Text header="Billing Item" width="40" editable = {false} printer={new BillingItemNamePrinter(this)}/>
                    <DataTable.Numeric field="charge.amount" header="Price" width="10" printer={new PricePrinter(2, this)}/>
                    <DataTable.Text field="charge.currency.name" header="Currency" width="10"/>
                    {this.renderAddToFreight(type)}
                    <DataTable.ActionColumn>
                        <DataTable.ActionWrapper shouldRender = {() => !this.props.readOnly} key="editPrice" track="onclick"
                                                 onaction = {(data) => this.openPriceForm(data, type)}>
                            <Button icon="pencil" size="small"/>
                        </DataTable.ActionWrapper>
                    </DataTable.ActionColumn>
                </DataTable.Table>
            </GridCell>
        );
    }
}

class BillingItemNamePrinter {
    constructor(callingComponent) {
        this.callingComponent = callingComponent;
    }
    printUsingRow(row) {
        let translatedName = this.callingComponent.translate(row.billingItem.description);
        let campaignIcon = !_.isNil(row.campaign) && row.useCampaign && <i className="uk-icon-gift uk-icon-medsmall md-color-red-500" />;
        let authIcon = this.printAuthorizationIcon(row.authorization);
        return <span>{translatedName}&nbsp;&nbsp;{campaignIcon}&nbsp;&nbsp;{authIcon}</span>;
    }

    printAuthorizationIcon(authorization){
        if(_.isNil(authorization)){
            return null;
        }
        let calculatedAmount = this.callingComponent.translate("Calculated") + ": " + StringUtils.formatMoney(authorization.calculatedAmount.amount, authorization.calculatedAmount.currency.code);
        let requestedAmount = this.callingComponent.translate("Requested") + ": " + StringUtils.formatMoney(authorization.requestedAmount.amount, authorization.requestedAmount.currency.code);
        let approvedAmount = "";
        let classNames = ["uk-icon-tag","uk-icon-medsmall"]; 
        if(authorization.approvedAmount){
            classNames.push("md-color-green-500")
            approvedAmount =  this.callingComponent.translate("Approved") + ": " + StringUtils.formatMoney(authorization.approvedAmount.amount, authorization.approvedAmount.currency.code);
        } else if(authorization.requestedAmount){
            classNames.push("md-color-red-500")
        }
        return <i className={classNames.join(' ')} title={`${calculatedAmount}<br />${requestedAmount}<br />${approvedAmount}`} data-uk-tooltip="{pos:'bottom'}" />;
    }
}

class AddToFreightPrinter {

    constructor() {

    }
    printUsingRow(row, data) {
        if(row.addToFreight){
            return (<i className="material-icons">check_circle</i>);
        }else{
            return null;
        }
    }
}

class PricePrinter {

    constructor(scale, callingComponent) {
        this.callingComponent = callingComponent;
        this.scale = scale;
        this.displayData = "---";
    }
    printUsingRow(row) {
        if (row.charge || row.charge.amount) {
            this.displayData = StringUtils.formatNumber(row.charge.amount, this.scale);
        }

        if(row.priceCalculation &&
            !_.isEmpty(row.priceCalculation.selectedDiscounts)){

            return (
                    <Grid collapse={true}>
                        <GridCell width="3-10">
                            <i className="uk-icon-arrow-down md-btn-success" style = {{fontSize: "120%"}}
                               title={this.callingComponent.translate("Discounts")} data-uk-tooltip="{pos:'bottom'}" onClick = {() => this.callingComponent.openPriceDiscountList(row)}/>
                        </GridCell>
                        <GridCell width="7-10">
                            <span className="uk-align-right">{this.displayData}</span>
                        </GridCell>
                    </Grid>
            );
        }else{
            return (
                <span className="uk-align-right">{this.displayData}</span>
            );
        }
    }
}

PriceList.contextTypes = {
    translator: PropTypes.object
};

class NumericPrinter {

    constructor(scale) {
        this.scale = scale;
        this.displayData = "---";
    }
    print(data, unit) {
        if (data || data === 0) {

            this.displayData=StringUtils.formatNumber(data,this.scale);
        }
            return (<span className="uk-align-right">{this.displayData}{unit ? unit : ""}</span>)

        
    }
}


