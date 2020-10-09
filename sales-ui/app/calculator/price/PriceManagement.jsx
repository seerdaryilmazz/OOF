import _ from "lodash";
import * as axios from 'axios';
import React from "react";
import uuid from 'uuid';

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card, Modal, CardHeader, PageHeader} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown, Form, Checkbox} from "susam-components/basic";

import {SalesPriceService} from '../../services';
import {PriceTableForm} from './PriceTableForm';
import {PriceTable} from './PriceTable';

export class PriceManagement extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {}
    }

    componentDidMount() {
        SalesPriceService.getCountries().then(response => {
            this.setState({countries: _.sortBy(response.data, ["name"])});
        }).catch(error => {
            Notify.showError(error);
        });
        SalesPriceService.getDiscountTypes().then(response => {
            this.setState({discountTypes: response.data})
        }).catch(error => {
            Notify.showError(error);
        })
    }

    updateState(key, value){
        let state = _.cloneDeep(this.state);
        state[key] = value;
        this.setState(state);
    }
    selectFromRegion(e, value){
        e.preventDefault();
        this.findPriceTables(value);
    }

    findPriceTables(value){
        SalesPriceService.findPriceTablesFromRegion(value.id).then(response => {
            let priceTables = response.data;
            priceTables.forEach(priceTable => {
                priceTable.extraPrices.forEach(item => item._key = item.id ? item.id : uuid.v4());
                priceTable.discountPrices.forEach(item => item._key = item.id ? item.id : uuid.v4());
            });
            this.setState({selectedFromRegion: value, priceTables: priceTables});
        }).catch(error => {
            Notify.showError(error);
            console.log(error);
        });
    }

    handleExchangeClick(){
        let state = _.cloneDeep(this.state);
        state.fromCountry = this.state.toCountry;
        state.toCountry = this.state.fromCountry;
        this.setState(state, () => this.handleSearchClick());
    }

    handleSearchClick(){
        if(!this.state.fromCountry || !this.state.toCountry){
            Notify.showError("Please select from and to country to search");
            return;
        }
        if(this.state.fromCountry.id == this.state.toCountry.id){
            Notify.showError("Please select different countries to search");
            return;
        }

        axios.all([
            SalesPriceService.getRegionsOfCountry(this.state.fromCountry.id),
            SalesPriceService.getRegionsOfCountry(this.state.toCountry.id),
            SalesPriceService.getLines()
        ]).then(axios.spread((fromRegions, toRegions, lines) => {
            if(fromRegions.data.length == 0){
                Notify.showError("Selected from country does not have a region");
                return;
            }
            if(toRegions.data.length == 0){
                Notify.showError("Selected to country does not have a region");
                return;
            }
            let selectedFromRegion = fromRegions.data[0];
            let state = {
                fromRegions: fromRegions.data,
                toRegions: toRegions.data,
                lines: lines.data,
                selectedFromRegion: selectedFromRegion
            };
            this.setState(state, () => this.findPriceTables(selectedFromRegion));
        })).catch((error) => {
            Notify.showError(error);
            console.log(error);
        });
    }

    createInitialPricesForScales(scales){
        return scales.map(scale => {
            return {
                value: 0,
                scale: scale
            };
        });
    }

    createNewExtraPriceLine(scales){
        return {
            _key: uuid.v4(),
            prices: this.createInitialPricesForScales(scales),
            postalCodes: []
        };
    }
    createNewDiscountLine(scales){
        return {
            _key: uuid.v4(),
            percentages: this.createInitialPricesForScales(scales),
        }
    }

    handleCreatePriceTable(toRegion){

        let line = _.find(this.state.lines, item => {
            return item.line.fromCountry && item.line.toCountry &&
                item.line.fromCountry.id == this.state.fromCountry.id &&
                item.line.toCountry.id == this.state.toCountry.id;
        });
        if(!line){
            Notify.showError(`There is no line defined from country ${this.state.fromCountry.name} to country ${this.state.toCountry.name}`);
            return;
        }
        SalesPriceService.getLineScales(line.line.id).then(response => {
            if(!response.data.scales || response.data.scales.length == 0){
                Notify.showError(`There are no scales defined for line ${line.line.fromCountry.name} - ${line.line.toCountry.name}`);
                return;
            }
            let zeroPrices = response.data.scales.map(scale => {
                return {
                    value: 0,
                    scale: scale
                };
            });
            let extraPrices = [this.createNewExtraPriceLine(response.data.scales)];

            let discountPercentages = [this.createNewDiscountLine(response.data.scales)];
            let priceTable = {
                toRegion: toRegion,
                fromRegion: this.state.selectedFromRegion,
                line: line.line,
                currency: "EUR",
                scales: response.data.scales,
                basePrices: _.cloneDeep(zeroPrices),
                extraPrices: extraPrices,
                discountPrices: discountPercentages
            };
            this.setState({priceTable: priceTable, scales: response.data.scales}, () => this.modal.open());
        }).catch(error => {
            Notify.showError(error);
        })

    }

    handlePriceTableChange(value){
        this.setState({priceTable: value});
    }
    handleAddExtraLine(){
        let priceTable = _.cloneDeep(this.state.priceTable);
        priceTable.extraPrices.push(this.createNewExtraPriceLine(this.state.scales));
        this.setState({priceTable: priceTable});
    }
    handleRemoveExtraLine(param){
        let priceTable = _.cloneDeep(this.state.priceTable);
        if(priceTable.extraPrices){
            const index = priceTable.extraPrices.findIndex(extraPrice => extraPrice._key === param);
            if (index !== -1) {
                priceTable.extraPrices.splice(index, 1);
                if(priceTable.extraPrices.length == 0){
                    priceTable.extraPrices.unshift(this.createNewExtraPriceLine(this.state.scales));
                }
                this.setState({priceTable: priceTable});
            }
        }
    }
    handleAddDiscountLine(){
        let priceTable = _.cloneDeep(this.state.priceTable);
        priceTable.discountPrices.push(this.createNewDiscountLine(this.state.scales));
        this.setState({priceTable: priceTable});
    }

    handleRemoveDiscountLine(param){
        let priceTable = _.cloneDeep(this.state.priceTable);
        if(priceTable.discountPrices){
            const index = priceTable.discountPrices.findIndex(discountPrice => discountPrice._key === param);
            if (index !== -1) {
                priceTable.discountPrices.splice(index, 1);
                if(priceTable.discountPrices.length == 0){
                    priceTable.discountPrices.unshift(this.createNewDiscountLine(this.state.scales));
                }
                this.setState({priceTable: priceTable});
            }
        }
    }

    validateDiscount(discount, existingDiscounts){
        let ValidationException = {};
        try {
            if(!discount.type){
                let validDiscountPercentages =
                    _.filter(discount.percentages, percentage => _.isNumber(percentage.value) && _.toNumber(percentage.value) > 0);
                if(validDiscountPercentages.length > 0){
                    Notify.showError("Please enter a type for discount or clean all percentage values");
                    throw ValidationException;
                }
            }else{
                if(!discount.parameters &&
                    (discount._paramType.type == "LIST" || discount._paramType.type == "NUMERIC" || discount._paramType.type == "TEXT")){
                    Notify.showError("Please enter parameter for discount type");
                    throw ValidationException;
                }
            }
            existingDiscounts.forEach(existingDiscount => {
                if(existingDiscount.type === discount.type){
                    if (_.isArray(existingDiscount.parameters)) {
                        existingDiscount.parameters.forEach(existingParameter => {
                            discount.parameters.forEach(parameter => {
                                if(existingParameter.id === parameter.id){
                                    Notify.showError(`Dublicated parameter exists for discount type ${existingDiscount.type}. Please check the parameters: ${existingParameter.id}`);
                                    throw ValidationException;
                                }
                            });
                        });
                    }else{
                        if(existingDiscount.parameters.toString() == discount.parameters.toString()){
                            Notify.showError(`Dublicated parameter exists for discount type ${existingDiscount.type}. Please check the parameters: ${discount.parameters}`);
                            throw ValidationException;
                        }
                    }
                }
            });
        }catch (e) {
            if (e !== ValidationException){
                throw e;
            }
            return false;
        }

        return true;
    }
    validateExtra(extra, existingExtras){
        let ValidationException = {};
        let hasValidPrices =
            _.filter(extra.prices, price => _.isNumber(price.value) && _.toNumber(price.value) > 0).length > 0;
        let hasValidType = extra.appliedAt;
        let hasValidPostalCodes = extra.postalCodes && extra.postalCodes.length > 0;

        try {
            if(hasValidPrices && (!hasValidType || !hasValidPostalCodes)){
                Notify.showError("Please enter a type and postal codes for extra charges");
                throw ValidationException;
            }
            if(!hasValidPrices && (hasValidType || hasValidPostalCodes)){
                Notify.showError("Please enter prices for extra charges");
                throw ValidationException;
            }

            existingExtras.forEach(existingExtra => {
                if(existingExtra.appliedAt === extra.appliedAt){
                    if (_.isArray(existingExtra.postalCodes)) {
                        existingExtra.postalCodes.forEach(existingPostalCode => {
                            extra.postalCodes.forEach(postalCode => {
                                if(existingPostalCode.postalCode.id === postalCode.postalCode.id){
                                    Notify.showError(`Dublicated postal Code exists for extra ${existingExtra.appliedAt}. Please check the postal code: ${postalCode.postalCode.postalCode}`);
                                    throw ValidationException;
                                }
                            });
                        });
                    }
                }
            });
        }catch (e) {
            if (e !== ValidationException){
                throw e;
            }
            return false;
        }
        return true;
    }
    validatePriceTable(){
        let ValidationException = {};
        try {
            if(!this.state.priceTable.minPrice){
                Notify.showError("Please enter a minimum price");
                throw ValidationException;
            }
            if(!this.state.priceTable.currency){
                Notify.showError("Please select a currency");
                throw ValidationException;
            }
            this.state.priceTable.scales.forEach(scale => {
                let basePrice = _.find(this.state.priceTable.basePrices, {scale: {id: scale.id}});
                if(_.isNil(basePrice) || _.isNil(basePrice.value)){
                    let scaleText;
                    if (scale.type.code == "FTL") {
                        scaleText = "FTL";
                    } else {
                        scaleText = scale.minimum + (!_.isNil(scale.maximum) ? ("-" + scale.maximum) : "+");
                    }
                    Notify.showError(`Please enter a base price for scale ${scaleText}`);
                    throw ValidationException;
                }
            });
            let existingDiscounts = [];
            this.state.priceTable.discountPrices.forEach(discount => {
                if(!this.validateDiscount(discount, existingDiscounts)){
                    throw ValidationException;
                }
                existingDiscounts.unshift(discount);
            });

            let existingExtras = [];
            this.state.priceTable.extraPrices.forEach(extra => {
                if(!this.validateExtra(extra, existingExtras)){
                    throw ValidationException;
                }
                existingExtras.unshift(extra);
            });
        }catch (e) {
            if (e !== ValidationException){
                throw e;
            }
            return false;
        }


        return true;
    }
    handleSave(){

        this.modal.setBusy(true);

        if(!this.validatePriceTable()){
            return;
        }
        let priceTable = _.cloneDeep(this.state.priceTable);
        _.remove(priceTable.discountPrices, item => {
            return !item.type
        });
        _.remove(priceTable.extraPrices, item => {
            return !item.appliedAt
        });

        priceTable.discountPrices.forEach(discount => {
            let parameters = "";
            if(_.isArray(discount.parameters)){
                parameters = discount.parameters.map(param => param.id).join(",");
            } else {
                parameters = "" + discount.parameters;
            }
            discount.parameters = parameters;
        });
        priceTable.extraPrices.forEach(extra => {
            extra.prices.forEach(price => {
                if(!price.value){
                    price.value = 0;
                }
            });
        });

        SalesPriceService.savePriceTable(priceTable).then(response => {
            this.modal.setBusy(false);
            this.modal.close();
            Notify.showSuccess("Price table saved");
            this.setState({priceTable: null}, () => this.findPriceTables(this.state.selectedFromRegion));
        }).catch(error => {
            this.modal.setBusy(false);
            Notify.showError(error);
        });
    }

    handleEditPriceTable(selectedTable){
        let priceTable = _.cloneDeep(selectedTable);
        SalesPriceService.getLineScales(priceTable.line.id).then(response => {
            if (!response.data.scales || response.data.scales.length == 0) {
                Notify.showError(`There are no scales defined for line ${line.fromCountry.name} - ${line.toCountry.name}`);
                return;
            }

            if(priceTable.extraPrices.length == 0){
                priceTable.extraPrices = [this.createNewExtraPriceLine(response.data.scales)];
            }
            if(priceTable.discountPrices.length == 0){
                priceTable.discountPrices = [this.createNewDiscountLine(response.data.scales)];
            }
            priceTable.discountPrices.forEach(discount => {
                if (discount.type) {
                    discount._paramType = _.find(this.state.discountTypes, {id: discount.type});
                    if(discount._paramType.type == "LIST"){
                        discount.parameters = discount.parameters.split(",").map(item => {
                            return {id: item}
                        });
                    }
                }
            });
            this.setState({priceTable: priceTable, scales: response.data.scales}, () => this.modal.open());
        }).catch(error => {
            Notify.showError(error);
            console.log(error);
        });

    }
    deletePriceTable(priceTable){
        SalesPriceService.deletePriceTable(priceTable).then(response => {
            Notify.showSuccess("Price table deleted");
            this.findPriceTables(this.state.selectedFromRegion);
        }).catch(error => {
            Notify.showError(error);
        });
    }
    handleDeletePriceTable(priceTable){
        UIkit.modal.confirm("Price table will be deleted, Are you sure?",
            () => this.deletePriceTable(priceTable)
        );
    }

    renderFromRegionTags(){
        let selectedFromRegionId = _.get(this.state, "selectedFromRegion.id");
        let regionTags = [];
        _.forEach(this.state.fromRegions, (value) => {
            let className = "";
            if(value.id == selectedFromRegionId){
                className = "uk-active";
            }
            regionTags.push(<li key={value.id} className={className} aria-expanded="true">
                <a href="#" onClick = {(e) => this.selectFromRegion(e, value)}>{value.country.name + " " + value.name}</a>
            </li>);
        });
        return regionTags;
    }

    renderToRegions(){
        if(!this.state.selectedFromRegion){
            return null;
        }

        let regionPriceTables = [];
        _.forEach(this.state.toRegions, (value) => {
            let priceTableForRegions = _.find(this.state.priceTables, {fromRegion: {id: this.state.selectedFromRegion.id}, toRegion: {id: value.id}});
            let priceTableContent = <Button label="create price table" size="small" style="primary" onclick = {() => this.handleCreatePriceTable(value)} />;
            if(priceTableForRegions){
                priceTableContent = <PriceTable priceTable = {priceTableForRegions} discountTypes = {this.state.discountTypes}
                                                onEdit = {() => this.handleEditPriceTable(priceTableForRegions)}
                                                onDelete = {() => this.handleDeletePriceTable(priceTableForRegions)}/>;
            }
            let title = this.state.selectedFromRegion.country.name + " " + this.state.selectedFromRegion.name + " - " + value.country.name + " " + value.name;
            regionPriceTables.push(
                <GridCell width="1-1" key = {value.id}>
                    <Grid>
                        <GridCell width="1-1">
                            <CardHeader title={title} />
                        </GridCell>
                        <GridCell width="1-1">
                            {priceTableContent}
                        </GridCell>
                    </Grid>
                </GridCell>
            );
        });
        return regionPriceTables;
    }

    renderFilter(){
        return(
            <Grid>
                <GridCell width="4-10">
                    <DropDown label="From Country" options = {this.state.countries}
                              value = {this.state.fromCountry}
                              translate={true}
                              postTranslationCaseConverter={1}
                              onchange = {(item) => this.updateState("fromCountry", item)} />
                </GridCell>
                <GridCell width="1-10" textCenter = {true}>
                    <div className="uk-margin-top">
                        <Button icon="exchange" size="small" style="success" flat = {true}
                                onclick = {() => {this.handleExchangeClick()}} />
                    </div>
                </GridCell>
                <GridCell width="4-10">
                    <DropDown label="To Country" options = {this.state.countries}
                              value = {this.state.toCountry}
                              translate={true}
                              postTranslationCaseConverter={1}
                              onchange = {(item) => this.updateState("toCountry", item)} />
                </GridCell>
                <GridCell width="1-10">
                    <div className="uk-margin-top">
                        <Button label="search" size="small" style="success" onclick = {() => {this.handleSearchClick()}} />
                    </div>
                </GridCell>
            </Grid>
        );
    }

    render(){
        let modalTitle = "Price Table";

        if(this.state.priceTable){
            let from = this.state.priceTable.fromRegion.country.name + " " + this.state.priceTable.fromRegion.name;
            let to = this.state.priceTable.toRegion.country.name + " " + this.state.priceTable.toRegion.name;
            modalTitle = from + " - " + to + " Price Table";
        }

        return(
            <div>
                <PageHeader title="Price Table Management" />
                <Card>
                    <Grid divider = {true}>
                        <GridCell width="1-1" noMargin = {true}>
                            {this.renderFilter()}
                        </GridCell>
                        <GridCell width="1-1" noMargin = {true}>
                            <Grid>
                                <GridCell width="1-1">
                                    <ul className="uk-subnav uk-subnav-pill">
                                        {this.renderFromRegionTags()}
                                    </ul>
                                </GridCell>
                                <GridCell width="1-1">
                                    <Grid>
                                        {this.renderToRegions()}
                                    </Grid>
                                </GridCell>
                            </Grid>

                        </GridCell>
                    </Grid>
                </Card>
                <PriceTableForm ref={(c) => this.modal = c}
                                title = {modalTitle}
                                priceTable = {this.state.priceTable}
                                discountTypes = {this.state.discountTypes}
                                scales = {this.state.scales}
                                onChange = {(value) => this.handlePriceTableChange(value)}
                                onAddExtra = {() => this.handleAddExtraLine()}
                                onRemoveExtra = {(param) => this.handleRemoveExtraLine(param)}
                                onAddDiscount = {() => this.handleAddDiscountLine()}
                                onRemoveDiscount = {(param) => this.handleRemoveDiscountLine(param)}
                                onSave = {() => this.handleSave()}/>
            </div>
        );
    }

}