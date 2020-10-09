import React from "react";
import * as axios from 'axios';
import uuid from "uuid";
import _ from "lodash";

import {TranslatingComponent} from 'susam-components/abstract';
import {PageHeader, Card, Grid, GridCell} from "susam-components/layout";
import {TextArea, Button, Notify} from "susam-components/basic";
import {Calculator} from "../calculator/Calculator";

import {SalesPriceService} from "../services";

export class QuoteValidationTest extends TranslatingComponent {

    constructor(props){
        super(props);
        this.state = {
            data: JSON.stringify({
                SpotQuotationService: {
                    Price2__c: 0
                },
                SpotMainObject: {
                    KP__c: "Parsiyel",
                    Pay_Weight_New__c: 1000,
                    Departure_Country__c: "Turkey - TR",
                    Potential_From_Zip__c: "34",
                    Arrival_Country__c: "Germany - DE",
                    Potential_To_Zip__c: "12",
                    Service__c:"Export",
                    ServiceType__c:"Normal",
                    Business_Type__c:"Road",
                    IncotermNew__c:"EXW",
                    Term_EarlyLoading__c:"2018-03-05",
                    Term_LateLoading__c:"2018-03-05",
                    Term_VehicleType__c:"Kapalı Kasa-Kara",
                    Term_RequestedDelivery__c: "2018-03-15",
                    Loading_Type_New__c:"Müşteri Adresinden Yükleme",
                    Delivery_Type_New__c:"Ekol Antrepo",
                    LineKg__c: 1000,
                    Line_Cubic_Meter__c: 1
                },
                SpotDiscountsArray: [

                ],
                SpotAccount: {
                    Segment__c: "LHS"
                }
            }, null, 4)
        };
    }
    updateState(value){
        this.setState({data: value});
    }
    handleSelectDiscount(discounts){
        let data;
        if(!this.state.data){
            data = {};
        }else{
            data = JSON.parse(this.state.data);
        }
        data.SpotDiscountsArray = discounts.map(discount => {
            return {
                DiscountID__c: discount.id
            };
        });
        this.setState({data: JSON.stringify(data, null, 4), selectedDiscounts: discounts});
    }
    handleValidate(){
        SalesPriceService.validateQuoteData(JSON.parse(this.state.data)).then(response => {
            if(response.data.result){
                Notify.showSuccess("This quote price is valid");
            }else{
                Notify.showError(response.data.description);
            }

        }).catch(error => {
           Notify.showError(error);
        });
    }

    render(){
        return (
            <div>
                <PageHeader title="Quote Price Validator" />
                <Grid>
                    <GridCell width = "2-3">
                        <Card>
                            <Grid>
                                <GridCell width = "1-1">
                                    <Calculator onChange = {(discount) => this.handleSelectDiscount(discount) }
                                                selectedItems = {this.state.selectedDiscounts}/>
                                </GridCell>
                                <GridCell width="1-1">
                                    <TextArea rows = "20" onchange = {(value) => this.updateState(value)} value = {this.state.data}/>
                                </GridCell>
                                <GridCell width="1-1">
                                    <Button waves = {true} style="primary" label="validate" onclick = {() => this.handleValidate()}/>
                                </GridCell>
                            </Grid>
                        </Card>
                    </GridCell>
                </Grid>
            </div>
        );
    }
}