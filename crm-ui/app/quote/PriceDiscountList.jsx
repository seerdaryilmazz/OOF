import React from "react";
import PropTypes from "prop-types";

import {TranslatingComponent} from 'susam-components/abstract';
import {Checkbox} from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';

export class PriceDiscountList extends TranslatingComponent{

    constructor(props){
        super(props);
        this.state= {}
    }

    renderDiscountSelectionStatus(){
        if(this.props.readOnly){
            return;
        }
        return (
            <DataTable.Text header="" shouldRender = {() => !this.props.readOnly}
                            reader={new DiscountSelectionStatusReader(this)}
                            printer={new DiscountSelectionStatusPrinter(this)}
                            center={true}/>
        );
    }

    render(){
        if(!this.props.discounts){
            return null;
        }
        return(
            <div>
                <DataTable.Table data={this.props.discounts} translator={this}
                                 title="Discounts">
                    {this.renderDiscountSelectionStatus()}
                    <DataTable.Text field="name" translator={this} header="Name" width="50"/>
                    <DataTable.Text field="percentage" header="Discount Rate(%)"width="20" printer={new PercentagePrinter()}/>
                    <DataTable.Text field="amount" header="Discount Amount"  width="20" printer={new NumericPrinter(2)}/>
                </DataTable.Table>
            </div>

        );
    }

    isDiscountSelected(discount) {
        let selectedDiscounts = this.props.selectedDiscounts ? _.cloneDeep(this.props.selectedDiscounts) : [];
        let match = _.find(selectedDiscounts, (elem) => {
            return elem.salesPriceId == discount.salesPriceId;
        });
        if (match) {
            return true;
        } else {
            return false;
        }
    }

    toggleDiscountSelectionStatus(discount, selected) {
        let selectedDiscounts = this.props.selectedDiscounts ? _.cloneDeep(this.props.selectedDiscounts) : [];
        if (selected) {
            selectedDiscounts.push(discount);
        } else {
            _.remove(selectedDiscounts, (elem) => {
                return elem.salesPriceId == discount.salesPriceId;
            });
        }
        this.props.onChange(selectedDiscounts);
    }
}


class DiscountSelectionStatusReader {

    constructor(callingComponent) {
        this.callingComponent = callingComponent;
    }

    readCellValue(row) {
        return row;
    };

    readSortValue(row) {
        return this.callingComponent.isDiscountSelected(row);
    };
}

class DiscountSelectionStatusPrinter {

    constructor(callingComponent) {
        this.callingComponent = callingComponent;
    }

    print(data) {
        return (
            <Checkbox value={this.callingComponent.isDiscountSelected(data)}
                      onchange={(value) => this.callingComponent.toggleDiscountSelectionStatus(data, value)}
                      inline={true}
                      noMargin={true}/>
        );
    }
}

class PercentagePrinter {

    constructor() {
        this.displayData = "---";
    }
    print(data) {
        if (data || data === 0) {
            this.displayData = data * 100;
            return (<span className="uk-align-center">{this.displayData}</span>)
        }
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
                this.displayData = new Number(data).toFixed(this.scale);
            } else {
                this.displayData = data;
            }
            return (<span className="uk-align-center">{this.displayData}</span>)
        }
    }
}
PriceDiscountList.contextTypes = {
    translator: PropTypes.object
};
