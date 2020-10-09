import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, Notify } from "susam-components/basic";
import * as DataTable from 'susam-components/datatable';
import { CardHeader, Grid, GridCell, Modal } from 'susam-components/layout';
import { KartoteksService, SalesPriceService } from "../services";
import { StringUtils } from '../services/utils/StringUtils';
import { BillingItemPrice } from "./BillingItemPrice";

export class BillingItemPriceList extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state= {};
        this.initializeLookups();
    }

    initializeLookups(){
       this.getCountries();
    }

    getCountries(){
        KartoteksService.getCountries().then((response) => {
            this.setState({countries: response.data});
        }).catch(error => {
            Notify.showError(error);
        })
    }

    updateState(key, value){
        let state = _.cloneDeep(this.state);
        state[key] = value;
        this.setState(state);
    }

    editBillingItemPrice(){
        if(this.billingItemPriceForm.validate()){
            let billingItemPrices = _.cloneDeep(this.props.billingItemPrices);
            if(billingItemPrices){
                const index = billingItemPrices.findIndex(billingItemPrice => billingItemPrice.id === this.state.billingItemPrice.id);
                if (index !== -1) {
                    SalesPriceService.saveBillingItemPrice(this.state.billingItemPrice).then(response => {
                        billingItemPrices[index] = response.data;
                        this.updateState("billingItemPrice", null);
                        this.props.onChange(billingItemPrices);
                        this.billingItemPriceModal.close();
                        Notify.showSuccess("Billing item price saved successfully");
                    }).catch(error => {
                        console.log(error);
                        Notify.showError(error);
                    })
                }
            }
        }
    }

    addBillingItemPrice(){
        if(this.billingItemPriceForm.validate()){
            let billingItemPrices = _.cloneDeep(this.props.billingItemPrices);
            if(!billingItemPrices){
                billingItemPrices = [];
            }
            let billingItemPrice = this.state.billingItemPrice;
            billingItemPrice.billingItem = this.props.billingItem;
            SalesPriceService.saveBillingItemPrice(this.state.billingItemPrice).then(response => {
                billingItemPrices.push(response.data);
                this.updateState("billingItemPrice", null);
                this.props.onChange(billingItemPrices);
                this.billingItemPriceModal.close();
                Notify.showSuccess("Billing item price saved successfully");
            }).catch(error => {
                console.log(error);
                Notify.showError(error);
            })
        }
    }

    openBillingItemPriceForm(billingItemPrice){
        let state = _.cloneDeep(this.state);
        state.billingItemPrice = billingItemPrice;
        this.setState(state, () => {this.billingItemPriceModal.open()});

    }

    removeBillingItemPrice(data){
        let billingItemPrices = _.cloneDeep(this.props.billingItemPrices);
        if(billingItemPrices){
            const index = billingItemPrices.findIndex(billingItemPrice => billingItemPrice.id === data.id);
            if (index !== -1) {
                SalesPriceService.deleteBillingItemPrice(data).then(response => {
                    billingItemPrices.splice(index, 1);
                    this.updateState("billingItemPrice", null);
                    this.props.onChange(billingItemPrices)
                    Notify.showSuccess("Billing item price removed successfully");
                }).catch(error => {
                    console.log(error);
                    Notify.showError(error);
                })
            }
        }
    }

    renderDataTable(){
        let numberWithScalePrinter = new NumericPrinter(2);
        let allPrinter = new AllPrinter();
        let countryPrinter = new CountryPrinter(this.state.countries);
        return (
            <Grid divider = {true}>
                <GridCell width="1-1" margin="small">
                    <DataTable.Table data={this.props.billingItemPrices}
                                     editable = {false} insertable = {false} sortable = {true}>
                        <DataTable.Text field="fromCountryCode" header="From" width="10" sortable = {true} printer={countryPrinter}/>
                        <DataTable.Text field="fromPostalCode" header="From Postal" width="10" sortable = {true} printer={allPrinter}/>
                        <DataTable.Text field="toCountryCode" header="To" width="10" sortable = {true} printer={countryPrinter}/>
                        <DataTable.Text field="toPostalCode" header="To Postal" width="10" sortable = {true} printer={allPrinter}/>
                        <DataTable.Text field="price" header="Price" width="10" sortable = {true} printer={numberWithScalePrinter}/>
                        <DataTable.Text field="minPrice" header="Minimum Price" width="10" sortable = {true} printer={numberWithScalePrinter}/>
                        <DataTable.Text field="currency" header="Currency" width="10" sortable = {true} />
                        <DataTable.ActionColumn>
                            <DataTable.ActionWrapper key="editBillingItemPrice" track="onclick"
                                                     onaction = {(data) => this.openBillingItemPriceForm(data)}>
                                <Button label="EDIT" flat={true} style="success" size="small"/>
                            </DataTable.ActionWrapper>
                            <DataTable.ActionWrapper key="deleteBillingItemPrice" track="onclick"
                                                     onaction = {(data) => this.removeBillingItemPrice(data)}>
                                <Button label="DELETE" flat={true} style="danger" size="small"/>
                            </DataTable.ActionWrapper>
                        </DataTable.ActionColumn>
                    </DataTable.Table>
                </GridCell>
            </Grid>
        );
    }

    renderBillingItemPriceForm(){
        return(
            <Modal ref={(c) => this.billingItemPriceModal = c} title = "Price Definition"
                   closeOnBackgroundClicked={false}
                   large={true} actions={[{label: "SAVE", action: () => {(this.state.billingItemPrice && this.state.billingItemPrice.id) ? this.editBillingItemPrice() : this.addBillingItemPrice()}},
                {label: "CLOSE", action: () => this.billingItemPriceModal.close()}]}>
                <BillingItemPrice ref={(c) => this.billingItemPriceForm = c} countries={this.state.countries}
                                  billingItemPrice = {this.state.billingItemPrice || undefined}
                                  onChange={(value) => this.updateState("billingItemPrice", value)}/>
            </Modal>
        );
    }

    renderNewPriceButton(){
        if(this.props.billingItem){
            return (<div className="uk-text-right">
                    <Button label="New Price Definition" style = "success" size="small" flat={true} onclick = {() => this.openBillingItemPriceForm()}/> 
                </div>)
        }
        return null;
    }

    render() {
        let title = this.props.billingItem ? this.props.billingItem.description + " Prices" : "Prices";
        return (
            <div>
                <CardHeader title={title}/>
                    {this.renderNewPriceButton()}
                    {this.renderDataTable()}
                {this.renderBillingItemPriceForm()}
            </div>
        );
    }

}

class NumericPrinter {

    constructor(scale) {
        this.scale = scale;
        this.displayData = "---";
    }
    print(data) {
        if (data || data === 0) {
            if (this.scale || this.scale === 0) {
                this.displayData = StringUtils.formatNumber(data,this.scale)
            } else {
                this.displayData = StringUtils.formatNumber(data,this.scale)
            }
            return (<span className="uk-align-center" style={{textAlign: "right"}}>{this.displayData}</span>)
        }
    }
}

class AllPrinter {

    constructor() {
    }
    print(data) {
        let value = data ? data : "All";
        return <i className="uk-badge uk-badge-small uk-badge">{value}</i>;
    }
}
class CountryPrinter {

    constructor(countries) {
        this.countries = countries;
    }
    print(data) {
        let value = data ? _.find(this.countries, i=>i.iso===data).countryName : "All";
        return <i className="uk-badge uk-badge-small uk-badge">{value}</i>;
    }
}
