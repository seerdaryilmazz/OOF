import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { DropDown, Notify } from "susam-components/basic";
import { Card, Grid, GridCell, PageHeader } from "susam-components/layout";
import { CrmQuoteService, SalesPriceService } from '../services';
import { BillingItemPriceList } from "./BillingItemPriceList";



export class BillingItemPriceManagement extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            billingItemPrices:{}
        };
    }

    componentDidMount() {
        this.initialize();
    }

    initialize() {
        this.retrieveBillingItems();
    }

    handleChange(key, value){
        let state = _.cloneDeep(this.state);
        _.set(state, key, value);
        this.setState(state);
    }

    retrieveBillingItems() {
        CrmQuoteService.getBillingItems('ROAD').then(response => {
            let billingItems = _.filter(response.data, billingItem => billingItem.id !== 'ROAD_FREIGHT');
            billingItems.forEach(i=>i.label = i.code + " - "  + i.description);
            this.setState({billingItems: billingItems});
        }).catch(error => {
            console.log(error);
            Notify.showError(error);
        });
    }

    retrieveBillingItemPrices(billingItem){
        SalesPriceService.findBillingItemPrices(billingItem.code).then(response => {
            this.setState({billingItem: billingItem, billingItemPrices: response.data});
        }).catch(error => {
            console.log(error);
            Notify.showError(error);
        });
    }


    render(){
        return(
            <div>
                <PageHeader title= "Freight Surcharge Prices" />
                <Card>
                    <Grid>
                        <GridCell width="1-3">
                            <DropDown options = {this.state.billingItems} label="Billing Items" labelField="label"
                                    value = {this.state.billingItem} required={true}
                                    onchange = {(billingItem) => {billingItem ? this.retrieveBillingItemPrices(billingItem) : null}} />
                        </GridCell>
                        <GridCell>
                            <BillingItemPriceList billingItem = {this.state.billingItem}
                                                billingItemPrices = {this.state.billingItemPrices}
                                                onChange={(billingItemPrices) => this.handleChange("billingItemPrices", billingItemPrices)}/>
                        </GridCell>
                    </Grid>
                </Card>
            </div>
        );
    }

}
