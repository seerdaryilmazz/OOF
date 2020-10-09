import _ from "lodash";
import PropTypes from "prop-types";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import * as DataTable from 'susam-components/datatable';
import { Card, Grid, GridCell, LoaderWrapper, Modal, Pagination } from 'susam-components/layout';
import {Notify} from 'susam-components/basic';
import uuid from 'uuid';
import {ActionHeader, ObjectUtils, StringUtils} from '../utils/';
import {Product} from "./product";

const pageSize=10;
export class ProductList extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {
            page:0,
            size: pageSize
        };
        this.moment = require("moment");
    }

    componentDidMount(){
        this.handlePageChange(this.state.page)
    }

    componentDidUpdate(prevProps) {
        if(!_.isEqual(this.props.opportunity.products, prevProps.opportunity.products)){
            this.handlePageChange(this.state.page)
        }
    }

    handlePageChange(page){
        let totalPages = _.chunk(this.props.opportunity.products, pageSize).length;
        let content = _.slice(this.props.opportunity.products, pageSize * page, pageSize + (pageSize * page));
        this.setState({
            totalPages: totalPages,
            content: content,
            page: page});
    }

    updateState(key, value, callback) {
        let setStateCallback = () => {
            if (callback) {
                callback();
            }
        };
        let state = _.cloneDeep(this.state);
        _.set(state, key, value);
        this.setState(state, setStateCallback);
    }

    handleChange(value) {
        let opportunity = _.cloneDeep(this.props.opportunity);
        if(_.isNil(value)){
            _.unset(opportunity, 'products');
        }else{
            _.set(opportunity, 'products', value);
        }
        this.props.onChange(opportunity)
    }

    validate(){
        return this.productForm.validate();
    }

    addProduct() {
        if (this.validate() && this.checkDuplicates()) {
            let products = _.cloneDeep(this.props.opportunity.products);
            if (!products) {
                products = [];
            }
            let product = this.state.product;
            product._key = uuid.v4();
            products.push(product);
            this.productModal.close();
            this.updateState("product", undefined, () => {
                this.handleChange(products)
            });
        }
    }

    updateProduct(product) {
        if (this.validate() && this.checkDuplicates()) {
            let products = _.cloneDeep(this.props.opportunity.products);
            if (products) {
                const index = product.id ?
                    products.findIndex(item => item.id === product.id)
                    :
                    products.findIndex(item => item._key === product._key);
                if (index !== -1) {
                    products[index] = product;
                    this.updateState("product", null, () => {
                        this.handleChange(products);
                    });
                }
            }
            this.productModal && this.productModal.close();
        }
    }

    removeProduct(product) {
        let products = _.cloneDeep(this.props.opportunity.products);
        if (products) {
            const index = products.findIndex(item => item._key === product._key);
            if (index !== -1) {
                products.splice(index, 1);
                this.updateState("product", null, () => {
                    this.handleChange(products);
                });
            }
        }
    }

    cloneProduct(product){
        let clonedProduct=_.cloneDeep(product);
        ObjectUtils.setNull(clonedProduct, ['id', '_key']);
        this.openProductForm(clonedProduct)
    }

    checkDuplicates(newProduct=this.state.product){
        let products = _.cloneDeep(this.props.opportunity.products);
        if(_.isEmpty(_.find(products, {'_key': newProduct._key}))){
            if(_.find(products, product => {
                return (
                    _.get(product.fromCountry, 'iso') == _.get(newProduct.fromCountry, 'iso') &&
                    _.get(product.fromPostal, 'id') == _.get(newProduct.fromPostal, 'id') &&
                    _.get(product.toCountry, 'iso') == _.get(newProduct.toCountry, 'iso') &&
                    _.get(product.toPostal, 'id') == _.get(newProduct.toPostal, 'id') &&
                    _.get(product.existenceType, 'code') == _.get(newProduct.existenceType, 'code') &&
                    _.get(product.frequencyType, 'code') == _.get(newProduct.frequencyType, 'code') &&
                    product.frequency == newProduct.frequency &&
                    _.get(product.expectedTurnoverPerYear, 'amount') == _.get(newProduct.expectedTurnoverPerYear, 'amount') &&
                    _.get(product.expectedTurnoverPerYear, 'currency') == _.get(newProduct.expectedTurnoverPerYear, 'currency')
                )
            })){
                Notify.showError("This product already exists!");
                return false;
            }
        }else {
            let remainingProducts = _.cloneDeep(_.filter(products, (o) => {
                return o._key !== newProduct._key;
            }));
            if(_.find(remainingProducts, product => {
                return (
                    _.get(product.fromCountry, 'iso') == _.get(newProduct.fromCountry, 'iso') &&
                    _.get(product.fromPostal, 'id') == _.get(newProduct.fromPostal, 'id') &&
                    _.get(product.toCountry, 'iso') == _.get(newProduct.toCountry, 'iso') &&
                    _.get(product.toPostal, 'id') == _.get(newProduct.toPostal, 'id') &&
                    _.get(product.existenceType, 'code') == _.get(newProduct.existenceType, 'code') &&
                    _.get(product.frequencyType, 'code') == _.get(newProduct.frequencyType, 'code') &&
                    product.frequency == newProduct.frequency &&
                    _.get(product.expectedTurnoverPerYear, 'amount') == _.get(newProduct.expectedTurnoverPerYear, 'amount') &&
                    _.get(product.expectedTurnoverPerYear, 'currency') == _.get(newProduct.expectedTurnoverPerYear, 'currency')
                )
            })) {
                Notify.showError("This product already exists!");
                return false;
            }
        }
        return true;
    }

    closeProductForm() {
        let state = _.cloneDeep(this.state);
        state.product = undefined;
        this.setState(state, this.productModal.close());
    }

    openProductForm(product) {
        let state = _.cloneDeep(this.state);
        if (product) {
            state.product = product;
        }
        else {
            state.product = {};
        }
        this.setState(state, () => {this.productModal.open()});
    }

    renderProductForm() {
        return(
            <Modal ref={(c) => this.productModal = c}
                   title="Product Detail"
                   medium={true}
                   closeOnBackgroundClicked={false}
                   actions={[
                       {label: "SAVE", buttonStyle:"success", flat:false, action: () => {this.state.product && this.state.product._key ? this.updateProduct(this.state.product) : this.addProduct()}},
                       {label: "CLOSE", buttonStyle:"danger", flat:false, action: () => this.closeProductForm()}]}>
                {this.getProductForm()}
            </Modal>
        );
    }

    getProductForm() {
        if (this.state.product) {
            return <Product ref={c => this.productForm = c}
                            product={this.state.product || undefined}
                            serviceArea={_.get(this.props.opportunity, "serviceArea.code")}
                            onChange={(value) => this.updateState("product", value)}/>;
        }
        return null;
    }

    renderMenuItems(){
        if(!this.props.readOnly){
            return <DataTable.Text printer={new MenuPrinter(this)} reader={ new MenuReader()} width={1}/>
        }else{
            return null;
        }
    }

    renderDataTable() {
        if (_.isEmpty(this.props.opportunity.serviceArea)) {
            return null;
        }
        let serviceArea = _.get(this.props.opportunity, "serviceArea.code");
        if (["ROAD", "AIR", "SEA", "DTR"].includes(serviceArea)) {
            return (
                <Grid divider = {true}>
                    <GridCell width="1-1" margin="small">
                        <DataTable.Table data={this.state.content} noOverflow={true}>
                            <DataTable.Text header="Existence" field="existenceType.name" translator={this}/>
                            <DataTable.Text header="From Country" field="fromCountry.name" translator={this}/>
                            <DataTable.Text header="From Point" field="fromPoint" printer={new TruncatePrinter("fromPoint.name")}/>
                            <DataTable.Text header="To Country"  field="toCountry.name" translator={this} />
                            <DataTable.Text header="To Point" field="toPoint" printer={new TruncatePrinter("toPoint.name")}/>
                            <DataTable.Text header="Frequency Type" field="frequencyType.name" translator={this}/>
                            <DataTable.Numeric header="Frequency" field="frequency" printer={new NumericPrinter(0)}/>
                            <DataTable.Numeric header="Exp.Turnover/Year" field="expectedTurnoverPerYear" width="8" printer={new TurnoverPrinter()}/>
                            {this.renderMenuItems()}
                        </DataTable.Table>
                    </GridCell>
                    <GridCell width="1-1" noMargin={true}>
                        <Pagination totalElements={_.isEmpty(this.props.opportunity.products) ? 0 : this.props.opportunity.products.length}
                                    totalPages={this.state.totalPages}
                                    page={this.state.page + 1}
                                    onPageChange={page=>this.handlePageChange(page -1)}/>
                    </GridCell>
                </Grid>
            )
        } else if ("CCL" === serviceArea) {
            return (
                <Grid divider = {true}>
                    <GridCell width="1-1" margin="small">
                        <DataTable.Table data={this.state.content} noOverflow={true}>
                            <DataTable.Text header="Customs Service Type" field="customsServiceType" translator={this}/>
                            <DataTable.Text header="Customs Offices" field="customsOffice.name" />
                            <DataTable.Text header="Existence" field="existenceType.name" translator={this}/>
                            <DataTable.Numeric header="Exp.Turnover/Year" field="expectedTurnoverPerYear" width="8" printer={new TurnoverPrinter()}/>
                            {this.renderMenuItems()}
                        </DataTable.Table>
                    </GridCell>
                    <GridCell width="1-1" noMargin={true}>
                        <Pagination totalElements={_.isEmpty(this.props.opportunity.products) ? 0 : this.props.opportunity.products.length}
                                    totalPages={this.state.totalPages}
                                    page={this.state.page + 1}
                                    onPageChange={page=>this.handlePageChange(page -1)}/>
                    </GridCell>
                </Grid>
            )
        } else if ("WHM" === serviceArea) {
            return (
                <Grid divider = {true}>
                    <GridCell width="1-1" margin="small">
                        <DataTable.Table data={this.state.content} noOverflow={true}>
                            <DataTable.Text header="Country" field="country.name" translator={this}/>
                            <DataTable.Text header="Point" field="point" printer={new TruncatePrinter("point.name")}/>
                            <DataTable.Text header="Existence" field="existenceType.name" translator={this}/>
                            <DataTable.Numeric header="Exp.Turnover/Year" field="expectedTurnoverPerYear" width="8" printer={new TurnoverPrinter()}/>
                            {this.renderMenuItems()}
                        </DataTable.Table>
                    </GridCell>
                    <GridCell width="1-1" noMargin={true}>
                        <Pagination totalElements={_.isEmpty(this.props.opportunity.products) ? 0 : this.props.opportunity.products.length}
                                    totalPages={this.state.totalPages}
                                    page={this.state.page + 1}
                                    onPageChange={page=>this.handlePageChange(page -1)}/>
                    </GridCell>
                </Grid>
            )
        }
    }

    render() {
        return (
            <Card>
                <ActionHeader title="Product Details" readOnly={this.props.readOnly}
                              tools={[{title: "Add", items: [{label: "", onclick: () => this.openProductForm()}]}]} />
                <LoaderWrapper busy = {this.state.busy} title="" size = "S">
                    {this.renderDataTable()}
                </LoaderWrapper>
                {this.renderProductForm()}
            </Card>
        )
    }
}

ProductList.contextTypes = {
    translator: PropTypes.object
};

class StatusReader {
    setValue(row, value){
        row.status = value;
    }
    readCellValue(row){
        return row ? (row.status ? row.status : "" ) : "";
    }
    readSortValue(row){
        return row ? (row.status ? row.status.name : "" ) : "";
    }
}

class StatusPrinter {

    constructor(translator) {
        this.translator = translator;
    }
    translate(text){
        return this.translator ? this.translator.translate(text) : text;
    }
    printUsingRow(row, data) {
        if (data.code === "PROSPECTING") {
            return <span className="uk-badge md-bg-green-600">{this.translate(_.capitalize(data.name))}</span>
        } else {
            return null;
        }
    }
}

class TruncatePrinter {
    constructor(field) {
        this.field = field;
    }
    printUsingRow(row, data) {
        return <div >{TruncatePrinter.truncatedValue(_.get(row, this.field))}</div>
    }
    static truncatedValue(value){
        if(value && value.length > 10){
            value = value.substring(0, 10) + "..";
        }
        return value;
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
                this.displayData = StringUtils.formatNumber(Number(data),this.scale);
            } else {
                this.displayData = data;
            }
            return (<span>{this.displayData}</span>)
        }
    }
}

class TurnoverPrinter {

    constructor() {
    }

    printUsingRow(row) {
        let data = row.expectedTurnoverPerYear;
        if(!_.isEmpty(data) && data.amount){
            this.displayData = StringUtils.formatMoney(data.amount, _.get(data, 'currency.name'));
            return (<span style={{display:'block', textAlign:'right'}}>{this.displayData}</span>)
        }
    }
}

class MenuPrinter{
    constructor(callingComponent) {
        this.callingComponent = callingComponent;
    }

    print(row) {
        return (
            <div className="md-card">
                <div className="md-card-list-item-menu" data-uk-dropdown="{mode:'click', pos:'right-bottom'}" aria-haspopup="true" aria-expanded="true">
                    <a href="#" className="md-icon material-icons"></a>
                    <div className="uk-dropdown uk-dropdown-small">
                        <ul className="uk-nav">
                            <MenuItem name = "Edit" icon="pencil" render={true} onclick = {(e) => this.callingComponent.openProductForm(row)} />
                            <MenuItem name = "Copy" icon="copy" render={true} onclick = {(e) => this.callingComponent.cloneProduct(row)} />
                            <MenuItem name = "Delete" icon="close" render={true} onclick = {(e) => this.callingComponent.removeProduct(row)} />
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}


class MenuReader {
    setValue(row, value){
        row.status = value;
    }
    readCellValue(row){
        return row;
    }
    readSortValue(row){
        return row;
    }
}



class MenuItem extends TranslatingComponent{
    render(){
        if(!this.props.render){
            return null;
        }
        let styleClassName = this.props.style ? ("uk-text-" + this.props.style) : "";
        return(
            <li>
                <a href="javascript:;" onClick = {(e) => this.props.onclick(e)}>
                    <i className={"uk-icon-" + this.props.icon + " uk-icon-medsmall " + styleClassName}/>
                    <span className = {"uk-margin-left " + styleClassName}>{super.translate(this.props.name)}</span>
                </a>
            </li>
        );
    }
}

MenuItem.contextTypes = {
    translator: React.PropTypes.object
};