import React from "react";
import * as axios from 'axios';
import uuid from "uuid";
import _ from 'lodash';

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell} from "susam-components/layout";
import {TextInput, DropDown, Button, Notify, Form, Span} from "susam-components/basic";
import {NumberInput} from "susam-components/advanced";

import {SalesPriceService} from '../services';

const TRUCK_LOAD_TYPE_OPTIONS = [{id: "FTL", code: "FTL", name: "FTL"}, {id: "LTL", code: "LTL", name: "LTL"}];

export class Calculator extends TranslatingComponent {

    constructor(props){
        super(props);
        this.state = {sumOfSelectedDiscounts: 0};
    }
    componentWillReceiveProps(nextProps){
        if(nextProps.selectedItems && _.isArray(nextProps.selectedItems)){
            let sumOfSelectedDiscounts = _.reduce(nextProps.selectedItems, (sum, discount) => {
                return sum + discount.discountAmount;
            }, 0);
            this.setState({sumOfSelectedDiscounts: Number.parseFloat(sumOfSelectedDiscounts).toFixed(2)});
        }
    }
    updateState(key, value){
        let state = _.cloneDeep(this.state);
        state[key] = value;
        this.setState(state);
    }
    handleSelect(item){
        let selectedItems = _.cloneDeep(this.props.selectedItems);
        if(!selectedItems){
            selectedItems = [];
        }
        let existing = _.find(selectedItems, {id: item.id});
        if(existing){
            _.remove(selectedItems, {id: item.id});
        }else{
            selectedItems.push(item);
        }
        this.props.onChange && this.props.onChange(selectedItems);
    }

    handleGetPriceTable(){
        if(!this.form.validate()){
            return;
        }
        SalesPriceService.getPriceTableForCalculation(this.state.fromCountryCode, this.state.fromPostalCode,
            this.state.toCountryCode, this.state.toPostalCode, this.state.truckLoadType.code, this.state.payWeight).then(response => {
                let allDiscounts =_.reduce(response.data.discounts, function(sum, discount) {
                    return sum + discount.discountAmount;
                }, 0);

                this.setState({priceTable: response.data, allDiscounts: Number.parseFloat(allDiscounts).toFixed(2)});
        }).catch(error => {
            Notify.showError(error);
            this.setState({priceTable: null, allDiscounts: null});
        })
    }

    renderPriceTable(){
        if(!this.state.priceTable){
            return null;
        }
        return (
            <Grid smallGutter = {true}>
                <GridCell width = "1-5">
                    <Span label = "Base Price" value = {this.state.priceTable.basePrice + " " + this.state.priceTable.priceCurrency} />
                </GridCell>
                <GridCell width = "1-5">
                    <Span label = "Price" value = {this.state.priceTable.calculatedPrice + " " + this.state.priceTable.priceCurrency} />
                </GridCell>
                <GridCell width = "1-5">
                    <Span label = "Min Price" value = {this.state.priceTable.minPrice + " " + this.state.priceTable.priceCurrency} />
                </GridCell>
                <GridCell width = "1-5">
                    <Span label = "Total Possible Discount" value = {this.state.allDiscounts + " " + this.state.priceTable.priceCurrency} />
                </GridCell>
                <GridCell width = "1-5">
                    <Span label = "Selected Discount" value = {this.state.sumOfSelectedDiscounts + " " + this.state.priceTable.priceCurrency} />
                </GridCell>
                <GridCell width = "1-1">
                    <span className = "uk-text-large">{this.state.priceTable.description}</span>
                </GridCell>
                <GridCell width = "1-1">
                    <ul className = "md-list">
                        {this.state.priceTable.discounts.map(item => {
                            let selected = false;
                            if(this.props.selectedItems){
                                selected = this.props.selectedItems.map(item => item.id).includes(item.id);
                            }
                            let className = (selected ? "md-bg-blue-50" : "");
                            return (
                                <li key = {item.id} onClick = {() => this.handleSelect(item)} className = {className} style = {{cursor: "pointer"}}>
                                    <div className="md-list-content">
                                        <span className="md-list-heading">{item.name}</span>
                                        <span className="uk-text-small uk-text-muted">{item.discountRate * 100}% - {item.discountAmount} {this.state.priceTable.priceCurrency}</span>
                                    </div>
                                </li>

                            );
                        })}
                    </ul>
                </GridCell>
            </Grid>
        );
    }

    render(){
        return (
            <div>
                <Form ref = {c => this.form = c}>
                    <Grid>
                        <GridCell width = "1-4">
                            <TextInput label="From Country" required = {true} uppercase = {true}
                                       value = {this.state.fromCountryCode}
                                       onchange = {(value) => this.updateState("fromCountryCode", value)} />

                        </GridCell>
                        <GridCell width = "1-4">
                            <TextInput label="From Postal Code" required = {true}
                                       value = {this.state.fromPostalCode} uppercase = {true}
                                       onchange = {(value) => this.updateState("fromPostalCode", value)} />

                        </GridCell>
                        <GridCell width = "1-4">
                            <TextInput label="To Country" required = {true} uppercase = {true}
                                       value = {this.state.toCountryCode}
                                       onchange = {(value) => this.updateState("toCountryCode", value)} />

                        </GridCell>
                        <GridCell width = "1-4">
                            <TextInput label="To Postal Code" required = {true}
                                         value = {this.state.toPostalCode} uppercase = {true}
                                         onchange = {(value) => this.updateState("toPostalCode", value)} />

                        </GridCell>
                        <GridCell width = "1-4">
                            <DropDown label="Truck Load Type" required = {true}
                                      value = {this.state.truckLoadType}
                                      onchange = {(value) => this.updateState("truckLoadType", value)}
                                      options={TRUCK_LOAD_TYPE_OPTIONS}/>
                        </GridCell>
                        <GridCell width = "1-4">
                            <NumberInput label="Pay Weight" required = {true}
                                       value = {this.state.payWeight}
                                       onchange = {(value) => this.updateState("payWeight", value)} />

                        </GridCell>
                        <GridCell width = "1-4">
                            <div className = "uk-margin-top">
                                <Button label="get price table" style = "primary" size="small" onclick = {() => this.handleGetPriceTable()} />
                            </div>
                        </GridCell>
                        <GridCell width = "1-1">
                            {this.renderPriceTable()}
                        </GridCell>
                    </Grid>
                </Form>
            </div>
        );
    }
}