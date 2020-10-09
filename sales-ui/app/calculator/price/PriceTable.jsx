import _ from "lodash";
import * as axios from 'axios';
import React from "react";
import uuid from 'uuid';
import PropTypes from "prop-types";

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card, Modal, CardHeader, PageHeader} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown, Form, Span} from "susam-components/basic";
import {NumberInput, NumericInput, Chip} from "susam-components/advanced";

import {Utils} from '../../common/Utils';

export class PriceTable extends TranslatingComponent {

    constructor(props){
        super(props);
        this.scaleCount = 1;
        if(props.priceTable){
            this.scaleCount = props.priceTable.scales.length;
        }
        this.state = {
            calculate: {
                payWeight: 0,
                base: {discounts:{}},
                extras: {}
            }
        };
    }


    componentWillReceiveProps(nextProps){
        this.scaleCount = nextProps.priceTable.scales.length;
    }

    sortScales(scales) {
        return Utils.sortScales(scales);
    }

    calculateDiscountForPrice(scale, price){
        let discounts = {};
        _.forEach(this.props.priceTable.discountPrices, (discountLine) => {
            let percentage = _.find(discountLine.percentages, {scale: {id: scale.id}});
            if(percentage){
                discounts[discountLine.id] = {};
                let discounted = _.round(price * (100 - percentage.value) / 100, 2);
                if(this.props.priceTable.minPrice > discounted){
                    discounted = this.props.priceTable.minPrice;
                }
                discounts[discountLine.id].price = discounted;
                discounts[discountLine.id].percentage = percentage;
            }
        });
        return discounts;
    }
    calculateBaseForScale(scale, payWeight){
        let priceForBase = _.find(this.props.priceTable.basePrices, {scale:{id: scale.id}});
        let result = {discounts:{}};
        if(priceForBase){
            result.price = _.round(priceForBase.value * payWeight, 2);
            if(this.props.priceTable.minPrice > result.price){
                result.price = this.props.priceTable.minPrice;
            }
            result.discounts = this.calculateDiscountForPrice(scale, result.price);
            let totalDiscountPercentage = 0;
            Object.keys(result.discounts).forEach(key => {
                totalDiscountPercentage += result.discounts[key].percentage.value;
            });
            let totalDiscount = _.round(result.price * (100 - totalDiscountPercentage) / 100, 2);
            if(this.props.priceTable.minPrice > totalDiscount){
                totalDiscount = this.props.priceTable.minPrice;
            }
            result.totalDiscount = totalDiscount;
        }
        return result;

    }
    calculateExtrasForScale(scale, payWeight){
        let result = {};
        _.forEach(this.props.priceTable.extraPrices, (extraLine, index) => {
            let priceForExtra = _.find(extraLine.prices, {scale: {id: scale.id}});
            if(priceForExtra){
                result[extraLine.id] = {price: priceForExtra.value, minPrice: this.props.priceTable.minPrice + priceForExtra.value};
            }
        });
        return result;

    }
    calculate(payWeight){
        let calculate = _.cloneDeep(this.state.calculate);
        calculate.payWeight = payWeight;
        let scale = _.find(this.props.priceTable.scales, item => {
            return item.type.code == "LTL" && item.minimum < payWeight && (!item.maximum || item.maximum >= payWeight);
        });
        if(scale){
            calculate.base = this.calculateBaseForScale(scale, payWeight);
            calculate.extras = this.calculateExtrasForScale(scale, payWeight);
        }
        this.setState({calculate: calculate});
    }

    renderPriceTableHeaders(){
        let width = (60 / this.scaleCount) + "%";
        let scales = this.sortScales(this.props.priceTable.scales);
        let headers = scales.map(scale => {
            let scaleText;
            if (scale.type.code == "FTL") {
                scaleText = "FTL"
            } else {
                scaleText = scale.minimum + (!_.isNil(scale.maximum) ? ("-" + scale.maximum) : "+");
            }
            return (
                <th key = {scale.id} width = {width} className="uk-text-center" colSpan="2">
                    <h2 className="heading_c_thin">{scaleText}</h2>
                </th>
            );
        });
        return(
            <thead>
            <tr>
            <th className="uk-text-center" width="30%" colSpan="2">
                <h2 className="heading_c_thin">
                    {super.translate("Pay Weight")}
                </h2>
            </th>
            <th className="uk-text-center" width="10%">
                <NumberInput value = {this.state.calculate.payWeight} onchange = {(value) => this.calculate(value)}/>
            </th>
            {headers}
            </tr>
            </thead>
        );
    }
    renderBasePrices(){
        let style = {paddingBottom:"8px"};
        let priceCells = [];
        let scales = this.sortScales(this.props.priceTable.scales);
        scales.forEach(scale => {
            let priceForScale = _.find(this.props.priceTable.basePrices, {scale:{id: scale.id}});
            let value = priceForScale ? priceForScale.value : 0;
            priceCells.push(
                <td key = {scale.id + "-price"} style = {style} className="uk-text-center md-bg-cyan-100" colSpan="2">
                    <h2 className="heading_c_thin">{value}</h2>
                </td>
            );
        });
        return(
            <tr>
                <td style = {{padding:0, width: "15%"}} className="uk-text-center">
                    <h2 className="heading_c_thin">
                        {super.translate("Base Price")}
                    </h2>
                </td>
                <td className="uk-text-center md-bg-brown-100">
                    <h2 className="heading_c_thin">
                        {`Min: ${this.props.priceTable.minPrice} ${this.props.priceTable.currency}`}
                    </h2>
                </td>
                <td className="uk-text-center">
                    <h2 className="heading_c_thin">{this.state.calculate.base.price}</h2>
                </td>

                {priceCells}
            </tr>
        );
    }
    renderDiscountPrices(prices, calculated){
        let style = {paddingTop:"8px", paddingBottom:"8px"};
        let colorClasses = ["md-bg-lime-300", "md-bg-light-green-300","md-bg-green-300","md-bg-teal-300"];
        let discountLines = [];
        let totals = [];
        discountLines.push(
            <tr key = {"discount-header"}>
                <td className="uk-text-left md-bg-blue-grey-50" colSpan = {(this.scaleCount * 2) + 3}>
                    {super.translate("Discounts")}
                </td>
            </tr>
        );
        let scales = this.sortScales(this.props.priceTable.scales);
        _.forEach(this.props.priceTable.discountPrices, (discountLine, index) => {
            let discountPriceCells = [];
            let classes = ["uk-text-center", colorClasses[index % 4]];
            scales.forEach(scale => {
                let percentage = _.find(discountLine.percentages, {scale: {id: scale.id}});
                let basePrice = _.find(prices, {scale: {id: scale.id}});
                let discountPrice = _.round(basePrice.value * (100 - percentage.value) / 100, 4);
                let total = _.find(totals, {scaleId: scale.id});
                if (total) {
                    total.percentage += percentage.value;
                    total.price = _.round(basePrice.value * (100 - total.percentage) / 100, 4);
                } else {
                    totals.push({scaleId: scale.id, percentage: percentage.value, price: discountPrice});
                }

                discountPriceCells.push(
                    <td style={style} key={percentage.id + "-percentage"} className = {classes.join(" ")}>
                        <h2 className="heading_c_thin">{percentage.value + "%"}</h2>
                    </td>);
                discountPriceCells.push(
                    <td style={style} key={percentage.id + "-price"} className="uk-text-center">
                        <h2 className="heading_c_thin">{discountPrice}</h2>
                    </td>);
            });

            let parameters = discountLine.parameters ?
                discountLine.parameters.split(",").map(parameter => super.translate(parameter)).join(",") : "";
            let discountType = _.find(this.props.discountTypes, {id: discountLine.type});
            discountLines.push(
                <tr key = {"discount-" + discountLine.id}>
                    <td style = {{paddingTop:"0", paddingBottom:"0"}} colSpan="2">
                        <span className="heading_d uk-margin-right">{discountType ? super.translate(discountType.name) : ""}</span>
                        <span className="heading_d_thin">{parameters}</span>
                    </td>
                    <td className="uk-text-center" style={{width: "10%"}}>
                        <h2 className="heading_c_thin">{_.get(calculated, `discounts[${discountLine.id}].price`)}</h2>
                    </td>
                    {discountPriceCells}
                </tr>
            );
        });
        if(this.props.priceTable.discountPrices.length > 0){
            discountLines.push(this.renderTotalDiscountLine(totals, calculated));
        }
        return discountLines;
    }
    renderTotalDiscountLine(totals, calculated){
        let style = {paddingTop:"8px", paddingBottom:"8px"};
        let totalCells = [];
        totals.forEach(total => {
            totalCells.push(
                <td key = {total.scaleId + "-percentage"} style = {style} className="uk-text-center">
                    <h2 className="heading_a_thin">{total.percentage}%</h2>
                </td>
            );
            totalCells.push(
                <td key = {total.scaleId + "-price"} style = {style} className="uk-text-center">
                    <h2 className="heading_a_thin">{total.price}</h2>
                </td>
            );
        });

        return (
            <tr key="totals" className = "md-bg-blue-grey-100">
                <td style = {{padding:0}} className="uk-text-center" colSpan="2">
                    <h2 className="heading_c_thin">{super.translate("Price With All Discounts")}</h2>
                </td>
                <td style = {{padding:0}} className="uk-text-center">
                    <h2 className="heading_c_thin">{calculated ? calculated.totalDiscount : ""}</h2>
                </td>
                {totalCells}
            </tr>
        );
    }

    handleEditClick(){
        this.props.onEdit && this.props.onEdit();
    }
    handleDeleteClick(){
        this.props.onDelete && this.props.onDelete();
    }

    render(){
        if(!this.props.priceTable){
            return null;
        }
        return (
            <Grid>
                <GridCell width="1-1" noMargin = {true}>
                    <div className="uk-align-right">
                        <Button label="Edit" style="success" size="small" onclick = {() => this.handleEditClick()} />
                        <Button label="Delete" style="danger" size="small" onclick = {() => this.handleDeleteClick()} />
                    </div>
                </GridCell>
                <GridCell width="1-1">
                    <div className="uk-overflow-container">
                        <table className="uk-table uk-table-condensed table-with-borders">
                            {this.renderPriceTableHeaders()}
                            <tbody>
                            {this.renderBasePrices()}
                            {this.renderDiscountPrices(this.props.priceTable.basePrices, this.state.calculate.base)}
                            </tbody>
                        </table>
                    </div>
                </GridCell>
            </Grid>
        );
    }

}
PriceTable.contextTypes = {
    translator: PropTypes.object
};