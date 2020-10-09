import _ from "lodash";
import React from "react";
import PropTypes from 'prop-types';

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Loader, Modal} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown, Form, Checkbox} from "susam-components/basic";
import {NumberInput, NumericInput, Chip} from "susam-components/advanced";

import {SalesPriceService} from '../../services';
import {Utils} from '../../common/Utils';

export class PriceTableForm extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            currencies: [
                {id: "EUR", name: "EUR"},
                {id: "USD", name: "USD"}
            ],
            extraAppliedAt: [
                {id: "COLLECTION", name: "COLLECTION"},
                {id: "DELIVERY", name: "DELIVERY"}
            ],
            busy: false
        }
    }

    componentDidMount() {

    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.priceTable && nextProps.priceTable.fromRegion) {
            this.getRegionPostalCodes(nextProps.priceTable.fromRegion, "fromRegionPostalCodes");
        }
        if (nextProps.priceTable && nextProps.priceTable.toRegion) {
            this.getRegionPostalCodes(nextProps.priceTable.toRegion, "toRegionPostalCodes");
        }

    }

    sortScales(scales) {
        return Utils.sortScales(scales);
    }

    getRegionPostalCodes(region, key) {
        SalesPriceService.getPostalCodesOfRegion(region).then(response => {
            let state = _.cloneDeep(this.state);
            state[key] = response.data;
            this.setState(state);
        }).catch(error => {
            Notify.showError(error);
        })
    }

    update(key, value) {
        let priceTable = _.cloneDeep(this.props.priceTable);
        priceTable[key] = value;
        this.props.onChange && this.props.onChange(priceTable);
    }

    handleBasePriceChange(scale, value) {
        let priceTable = _.cloneDeep(this.props.priceTable);
        let priceForScaleIndex = _.findIndex(priceTable.basePrices, {scale: {id: scale.id}});
        if (priceForScaleIndex >= 0) {
            priceTable.basePrices[priceForScaleIndex].value = value;
        }
        this.props.onChange && this.props.onChange(priceTable);
    }

    handleExtraTypeChange(extra, value) {
        let priceTable = _.cloneDeep(this.props.priceTable);
        let extraLineIndex = _.findIndex(priceTable.extraPrices, {_key: extra._key});
        if (extraLineIndex >= 0) {
            priceTable.extraPrices[extraLineIndex].appliedAt = value.id;
            priceTable.extraPrices[extraLineIndex].postalCodes = [];
        }
        this.props.onChange && this.props.onChange(priceTable);
    }

    handleExtraPostalCodeChange(extra, value) {
        let priceTable = _.cloneDeep(this.props.priceTable);
        let extraLineIndex = _.findIndex(priceTable.extraPrices, {_key: extra._key});
        if (extraLineIndex >= 0) {
            priceTable.extraPrices[extraLineIndex].postalCodes = value.map(item => {
                return {postalCode: item}
            });
        }
        this.props.onChange && this.props.onChange(priceTable);
    }

    handleExtraOptionChange(extra, key, value) {
        let priceTable = _.cloneDeep(this.props.priceTable);
        let extraLineIndex = _.findIndex(priceTable.extraPrices, {_key: extra._key});
        if (extraLineIndex >= 0) {
            priceTable.extraPrices[extraLineIndex][key] = value;
        }
        this.props.onChange && this.props.onChange(priceTable);
    }

    handleExtraPriceChange(scale, extra, value) {
        let priceTable = _.cloneDeep(this.props.priceTable);
        let extraLineIndex = _.findIndex(priceTable.extraPrices, {_key: extra._key});
        if (extraLineIndex >= 0) {
            let priceForScale = _.find(priceTable.extraPrices[extraLineIndex].prices, {scale: {id: scale.id}});
            if (priceForScale) {
                priceForScale.value = value;
            }
        }
        this.props.onChange && this.props.onChange(priceTable);
    }

    handleDiscountParamChange(discount, value) {
        let priceTable = _.cloneDeep(this.props.priceTable);
        let discountLineIndex = _.findIndex(priceTable.discountPrices, {_key: discount._key});
        if (discountLineIndex >= 0) {
            priceTable.discountPrices[discountLineIndex].parameters = value;
        }
        this.props.onChange && this.props.onChange(priceTable);
    }

    handleDiscountTypeChange(discount, value) {
        let priceTable = _.cloneDeep(this.props.priceTable);
        let discountLineIndex = _.findIndex(priceTable.discountPrices, {_key: discount._key});
        if (discountLineIndex >= 0) {
            priceTable.discountPrices[discountLineIndex].type = value ? value.id : null;
            priceTable.discountPrices[discountLineIndex]._paramType = value;
            priceTable.discountPrices[discountLineIndex].parameters = (value.type === "BOOLEAN" ? false : "");
        }
        this.props.onChange && this.props.onChange(priceTable);
    }

    handleDiscountPercentageChange(scale, discount, value) {
        let priceTable = _.cloneDeep(this.props.priceTable);
        let discountLineIndex = _.findIndex(priceTable.discountPrices, {_key: discount._key});
        if (discountLineIndex >= 0) {
            let priceForScale = _.find(priceTable.discountPrices[discountLineIndex].percentages, {scale: {id: scale.id}});
            if (priceForScale) {
                priceForScale.value = value;
            }
        }
        this.props.onChange && this.props.onChange(priceTable);
    }

    handleAddExtraLine() {
        this.props.onAddExtra && this.props.onAddExtra();
    }

    handleRemoveExtraLine(value) {
        this.props.onRemoveExtra && this.props.onRemoveExtra(value);
    }

    handleAddDiscountLine() {
        this.props.onAddDiscount && this.props.onAddDiscount();
    }

    handleRemoveDiscountLine(value) {
        this.props.onRemoveDiscount && this.props.onRemoveDiscount(value);
    }

    open() {
        if (this.state.busy) {
            this.setState({busy: false});
        }
        this.modal.open();
    }

    close() {
        this.modal.close();
    }

    save() {
        this.props.onSave();
    }

    setBusy(busy) {
        this.setState({busy: busy});
    }

    renderPriceTableHeaders() {
        let scaleCount = this.props.scales.length;
        let scales = this.sortScales(this.props.scales);
        let headers = scales.map(scale => {
            let scaleText;
            if (scale.type.code == "FTL") {
                scaleText = "FTL";
            } else {
                scaleText = scale.minimum + (!_.isNil(scale.maximum) ? ("-" + scale.maximum) : "+");
            }
            return (
                <th key={scale.id} className="uk-text-right" style={{width: "8%", minWidth: "3.178em"}}>
                    <h2 className="heading_c_thin">{scaleText}</h2>
                </th>
            );
        });
        let lastWidth = 100 - ((scaleCount * 12) + 42);
        return (
            <thead>
            <tr>
                <th className="uk-text-center" style={{width: "42%"}}><h2
                    className="heading_c_thin">{super.translate("Pay Weight")}</h2></th>
                {headers}
                <th className="uk-text-center" width={lastWidth + "%"}/>
            </tr>
            </thead>
        );
    }

    renderBasePrices() {
        let style = {border: 0, paddingBottom: "8px"};
        let scales = this.sortScales(this.props.scales);
        let priceCells = scales.map(scale => {
            let priceForScale = _.find(this.props.priceTable.basePrices, {scale: {id: scale.id}});
            let value = priceForScale ? priceForScale.value : 0;
            return (
                <td key={scale.id} style={style} className="uk-text-center">
                    <NumericInput digits="2" digitsOptional={false} size="mini-small"
                                  value={value} onchange={(value) => this.handleBasePriceChange(scale, value)}/>
                </td>
            );
        });
        return (
            <tr>
                <td style={{border: 0, padding: 0}} className="uk-text-center">
                    <h2 className="heading_c_thin">{super.translate("Standard Price")}</h2>
                </td>
                {priceCells}
                <td style={{border: 0, padding: 0}}/>
            </tr>
        );
    }

    renderDiscountPrices() {
        let style = {border: 0, paddingTop: "8px", paddingBottom: "8px"};
        let discountLines = [];
        let totals = [];
        let scales = this.sortScales(this.props.scales);
        _.forEach(this.props.priceTable.discountPrices, (discountLine, index) => {
            let discountPriceCells = scales.map(scale => {
                let percentage = _.find(discountLine.percentages, {scale: {id: scale.id}});
                let total = _.find(totals, {scaleId: scale.id});
                if (total) {
                    total.percentage += percentage.value;
                } else {
                    totals.push({scaleId: scale.id, percentage: percentage.value});
                }

                return (
                    <td key={scale.id} style={style} className="uk-text-right">
                        <NumericInput digits="2" digitsOptional={true} size="mini-small" unit="%"
                                      value={percentage.value}
                                      onchange={(value) => this.handleDiscountPercentageChange(scale, discountLine, value)}/>
                    </td>
                );

            });
            let addNewButton = null;

            if (index == this.props.priceTable.discountPrices.length - 1) {
                addNewButton = <Button label="Add" size="mini" flat={true} style="success"
                                       onclick={() => this.handleAddDiscountLine()}/>;
            }
            discountLines.push(
                <tr key={discountLine._key}>
                    <td style={style}>
                        <Grid smallGutter={true}>
                            <GridCell width="1-2">
                                <DropDown label="Type" options={this.props.discountTypes} value={discountLine.type}
                                          translate={true}
                                          onchange={(value) => this.handleDiscountTypeChange(discountLine, value)}/>
                            </GridCell>
                            <GridCell width="1-2">
                                {this.renderDiscountParameter(discountLine)}
                            </GridCell>
                        </Grid>
                    </td>
                    {discountPriceCells}
                    <td style={{border: 0, padding: 0}}>
                        <Grid smallGutter={true}>
                            <GridCell width="1-1">
                                <Button label="Delete" size="mini" flat={true} style="danger"
                                        onclick={() => this.handleRemoveDiscountLine(discountLine._key)}/>
                            </GridCell>
                            <GridCell width="1-1">
                                {addNewButton}
                            </GridCell>
                        </Grid>
                    </td>
                </tr>
            );
        });
        discountLines.push(this.renderTotalDiscountLine(totals));

        return discountLines;
    }

    renderTotalDiscountLine(totals) {
        let style = {border: 0, paddingTop: "8px", paddingBottom: "8px"};
        let totalCells = totals.map(total => {
            return (
                <td key={total.scaleId} style={style} className="uk-text-right">
                    <h2 className="heading_a_thin">{total.percentage}%</h2>
                </td>
            );
        });
        return (
            <tr key="totals" style={{backgroundColor: "rgb(245, 245, 245)"}}>
                <td style={{border: 0, padding: 0}} className="uk-text-center">
                    <h2 className="heading_c_thin">{super.translate("Total Discount")}</h2>
                </td>
                {totalCells}
                <td style={{border: 0, padding: 0}}/>
            </tr>
        );
    }

    renderDiscountParameter(discountLine) {
        if (!discountLine._paramType) {
            return null;
        }
        if (discountLine._paramType.type == "LIST") {
            let options = discountLine._paramType.options.map(opt => {
                return {id: opt, name: opt}
            });
            return <Chip label={discountLine._paramType.name} options={options} value={discountLine.parameters}
                         translate={true}
                         onchange={(value) => this.handleDiscountParamChange(discountLine, value)}/>;
        }
        if (discountLine._paramType.type == "NUMERIC") {
            return <NumberInput label={discountLine._paramType.name} value={discountLine.parameters}
                                onchange={(value) => this.handleDiscountParamChange(discountLine, value)}/>;
        }
        if (discountLine._paramType.type == "TEXT") {
            return <TextInput label={discountLine._paramType.name} value={discountLine.parameters}
                              onchange={(value) => this.handleDiscountParamChange(discountLine, value)}/>;
        }
        if (discountLine._paramType.type == "BOOLEAN") {
            return <div className="uk-margin-top">
                <Checkbox value={discountLine.parameters}
                          onchange={(value) => this.handleDiscountParamChange(discountLine, value)}/>
            </div>;
        }
        return (
            <div></div>
        );
    }

    renderContent() {

        if (!this.props.priceTable || !this.props.scales) {
            return null;
        }

        if (this.state.busy) {
            return (
                <Loader title="Saving"/>
            );
        } else {
            return (
                <Grid>
                    <GridCell width="1-5">
                        <DropDown label="Currency" value={this.props.priceTable.currency}
                                  options={this.state.currencies} onchange={(value) => this.update("currency", value)}/>
                    </GridCell>
                    <GridCell width="1-5">
                        <NumericInput label="Minimum Price" value={this.props.priceTable.minPrice}
                                      onchange={(value) => this.update("minPrice", value)}
                                      digits="0" digitsOptional={true}/>
                    </GridCell>
                    <GridCell width="1-5">
                        <div className="uk-margin-top">
                            <Checkbox label="FTL Active"
                                      value={this.props.priceTable.ftlActive}
                                      onchange={(value) => this.update("ftlActive", value)}/>
                        </div>
                    </GridCell>
                    <GridCell width="1-1">
                        <table className="uk-table uk-table-condensed">
                            {this.renderPriceTableHeaders()}
                            <tbody>
                            {this.renderBasePrices()}
                            <tr>
                                <td style={{border: 0, backgroundColor: "#EFEFEF"}} className="uk-text-left"
                                    colSpan={this.props.scales.length + 2}>
                                    {super.translate("Discounts")}
                                </td>
                            </tr>
                            {this.renderDiscountPrices()}
                            </tbody>
                        </table>
                    </GridCell>
                    <GridCell width="1-1">
                        <div className="uk-align-right">
                            <Button label="Close" flat={true} waves={true} onclick={() => this.close()}/>
                            <Button label="Save" style="primary" flat={true} waves={true} onclick={() => this.save()}/>
                        </div>
                    </GridCell>
                </Grid>
            );
        }
    }

    render() {
        return (
            <Modal ref={(c) => this.modal = c} title={this.props.title} minHeight="300px" large={true}>
                {this.renderContent()}
            </Modal>
        );
    }
}

PriceTableForm.contextTypes = {
    translator: PropTypes.object
};