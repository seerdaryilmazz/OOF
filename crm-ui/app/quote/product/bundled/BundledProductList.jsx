import _ from "lodash";
import PropTypes from "prop-types";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { FileInput } from 'susam-components/advanced';
import { Button, DropDown, Notify } from "susam-components/basic";
import * as DataTable from 'susam-components/datatable';
import { Card, Grid, GridCell, Loader, LoaderWrapper, Modal, PageHeader, Pagination } from 'susam-components/layout';
import { SearchUtils } from "susam-components/utils/SearchUtils";
import uuid from 'uuid';
import { CrmAccountService, CrmQuoteService, LookupService } from "../../../services";
import { ActionHeader } from '../../../utils/';
import { StringUtils } from '../../../utils/StringUtils';
import { LostReason } from "../../LostReason";
import { BundledProduct } from "./BundledProduct";

export class BundledProductList extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            filter: {},
            pageNumber:1,
            pageSize:10
        };
        this.numberWithScalePrinter = new NumericPrinter(2);
    }

    calculatePageNumber(products)
    {
        let arr = products || [];
        for(let key in this.state.filter) {
            arr = new SearchUtils([`${key}.name`]).translator(this.context.translator).search(_.get(this.state.filter[key], 'name'), arr);
        }
        let {pageNumber, pageSize} = this.state;
        let paging = {
            totalElements: arr.length,
        }
        paging.content = _.slice(arr,(pageNumber-1)*pageSize, pageNumber*pageSize );
        paging.pageCount = Math.floor(paging.totalElements / pageSize) + ((paging.totalElements % pageSize) > 0 ? 1 : 0);
        return paging;
    }

    componentDidMount(){
        if(this.props.quote.potentialId){
            this.retrievePotentialInfo(this.props.quote.potentialId);
        }
        if(this.props.quote.serviceArea.code === 'DTR'){
            this.getCountryTr();
        }
    }

    componentWillReceiveProps(nextProps){
        if(this.props.quote.potentialId){
            this.retrievePotentialInfo(this.props.quote.potentialId);
        }
        if(true === this.props.readOnly && false === nextProps.readOnly){
            this.calculateProductsExchangeAmount(this.props.quote.products, false);
        }
        if(!_.isEqual(this.props.quote.defaultInvoiceCompanyCountry, nextProps.quote.defaultInvoiceCompanyCountry)){
            this.getCountryTr(nextProps.quote.defaultInvoiceCompanyCountry);
        }
    }

    updateState(key, value){
        let state = _.cloneDeep(this.state);
        _.set(state, key, value);
        this.setState(state);
    }

    handleChange(key, value) {
        this.handleChangeMultiple([{key: key, value: value}]);
    }

    handleChangeMultiple(keyValuePairs) {
        this.props.onChange(keyValuePairs);
    }

    retrievePotentialInfo(potentialId){
        let loadingAndDelivery;
        if(potentialId) {
            CrmAccountService.getPotentialById(potentialId).then(response => {
                loadingAndDelivery = {
                    customsOffices: (response.data.customsOffices || []).map(customsOffice => customsOffice.office)
                };
                this.setState({loadingAndDelivery: loadingAndDelivery});
            }).catch(error => {
                if(error.response.status !== 404 ){
                    Notify.showError(error);
                }
            });
        }else{
            this.setState({loadingAndDelivery: undefined});
        }
    }

    getCountryTr(iso = this.props.quote.defaultInvoiceCompanyCountry){
        if(!iso){
            return;
        }
        LookupService.getCountryByIso(iso).then(response => {
            this.setState({countryTR: response.data});
        }).catch(error => {
            console.log(error);
            Notify.showError(error);
        });
    }

    calculateProductsExchangeAmount(products,  closeProductModal){
        CrmQuoteService.calculateBundledProductExchangeAmount(products || [], {params: {subsidiaryId: this.props.quote.subsidiary.id}}).then((response) => {
            this.setState({product: undefined, lostReason: undefined});
            let totals = this.adjustTotals(response.data);
            let keyValuePairs = [];
            keyValuePairs.push({key: "products", value: response.data});
            keyValuePairs.push({key: "totalExpectedTurnover", value: totals.totalExpectedTurnover});
            keyValuePairs.push({key: "totalPrice", value: totals.totalPrice});
            this.handleChangeMultiple(keyValuePairs);
            closeProductModal && this.productModal.close();
        }).catch(error => {
            Notify.showError(error);
        });
    }

    adjustTotals(products){
        let exchangedCurrency = {id: 'EUR', code: 'EUR', name: 'EUR'};
        let totalExpectedTurnover = {amount: 0, currency: exchangedCurrency};
        let totalPrice = {amount: 0, currency: exchangedCurrency};
        if(products && products.length > 0){
            products.forEach(product => {
                if(product.priceExchanged){
                    totalPrice.amount += product.priceExchanged.amount;
                }
                if(product.expectedTurnoverExchanged){
                    totalExpectedTurnover.amount += product.expectedTurnoverExchanged.amount;
                }
            });
        }
        return {
            totalExpectedTurnover: totalExpectedTurnover,
            totalPrice: totalPrice
        };
    }

    deleteAllProducts() {
        Notify.confirm("Are you sure?", () => {
            let totals = this.adjustTotals([]);
            let keyValuePairs = [];
            keyValuePairs.push({key: "products", value: []});
            keyValuePairs.push({key: "totalExpectedTurnover", value: totals.totalExpectedTurnover});
            keyValuePairs.push({key: "totalPrice", value: totals.totalPrice});
            this.handleChangeMultiple(keyValuePairs);
        });
    }

    downloadExcelTemplate() {
        let url = CrmQuoteService.generateBundledProductListTemplateDownloadUrl();
        window.open(url);
    }

    openExcelUploadModal() {
        this.excelUploadModal.open();
    }

    closeExcelUploadModal() {
        this.excelUploadModal.close();
    }

    handleExcelFileSelect(file) {

        if (file) {

            this.setState({excelUploadInProgress: true}, () => {

                let serviceAreaCode = this.props.quote.serviceArea.code;

                let data = new FormData();
                data.append("file", file);

                CrmQuoteService.convertExcelToBundledProductList(serviceAreaCode, data).then(response => {
                    let products = response.data;
                    this.addGivenProducts(products, false);
                    this.setState({excelUploadInProgress: false});
                    this.closeExcelUploadModal();
                }).catch(error => {
                    this.setState({excelUploadInProgress: false});
                    console.log(error);
                    Notify.showError(error);
                });
            });
        }
    }
    cloneProduct(data){
        let clonedProduct=_.cloneDeep(data);
        clonedProduct.id = null;
        clonedProduct._key=null;
        this.openProductForm(clonedProduct);
    }

    openProductForm(product){
        if(this.props.quote.serviceArea.code === 'DTR' && _.isEmpty(this.props.quote.subsidiary)){
            Notify.showError("Please select Owner Subsidiary first!");
            return false;
        }
        if(!product){
            product = {
                serviceArea: this.props.quote.serviceArea,
                discriminator: 'BUNDLED',
                status: {id: 'OPEN', code: 'OPEN', name: 'Open'}
            };
            if (this.props.quote.serviceArea.code !== 'CCL') {
                if (this.state.loadingAndDelivery) {
                    let loadingAndDelivery = this.state.loadingAndDelivery;
                    product.customsOffice = !_.isEmpty(loadingAndDelivery.customsOffices) && loadingAndDelivery.customsOffices.length === 1 ? loadingAndDelivery.customsOffices[0] : null;
                }

            }
            if(this.props.quote.serviceArea.code === 'DTR'){
                product.fromCountry = this.state.countryTR;
                product.toCountry = this.state.countryTR;
            }
        }
        this.setState({product: product}, () => {this.productModal.open()});
    }

    closeProductForm(){
        let state = _.cloneDeep(this.state);
        state.product = undefined;
        this.setState(state, this.productModal.close());
    }

    edit(row){
        if(this.props.editable && row.status.code === 'LOST'){
            this.openLostReason(row);
        }else{
            this.updateProduct(row, false);
        }
    }

    addProduct(){
        if(this.productForm.validate()){
            this.addGivenProducts([this.state.product], true);
        }
    }

    addGivenProducts(productsToBeAdded, closeProductModal) {
        let products = _.cloneDeep(this.props.quote.products);
        if (!products) {
            products = [];
        }
        productsToBeAdded.forEach((product) => {
            product._key = uuid.v4();
            products.push(product);
        });
        this.calculateProductsExchangeAmount(products, closeProductModal);   
    }

    addWarehouseProduct(){
        if(this.productForm.validate()){
            this.addGivenWarehouseProducts([this.state.product], true);
        }
    }

    addGivenWarehouseProducts(productsToBeAdded, closeProductModal){
        let products = _.cloneDeep(this.props.quote.products);
        if (!products) {
            products = [];
        }
        productsToBeAdded.forEach((product) => {
            product._key = uuid.v4();
            products.push(product);
        });
        closeProductModal && this.productModal.close();
    }

    updateProduct(row, withForm){
        if(withForm && !this.productForm.validate()){
            return;
        }
        let products = _.cloneDeep(this.props.quote.products);
        if(products){
            const index = products.findIndex(product => product._key === row._key);
            if (index !== -1) {
                row.lostReason = null;
                if(this.state.lostReason && (row.status || {}).code === 'LOST'){
                    row.lostReason = this.state.lostReason;
                    this.lostReasonModal.close();
                }
                products[index] = row;
                this.calculateProductsExchangeAmount(products, true);
            }
        }
    }

    removeProduct(data){
        let products = _.cloneDeep(this.props.quote.products);
        if(products){
            const index = products.findIndex(product => product._key === data._key);
            if (index !== -1) {
                products.splice(index, 1);
                this.calculateProductsExchangeAmount(products, true);
            }
        }
    }

    markAllProductAsWon(){
        let products = _.cloneDeep(this.props.quote.products);
        if(products){
            products.forEach(product => {
                product.status = {id:"WON", code:"WON", name:"Won"};
                product.lostReason = undefined;
            });
            this.handleChange("products", products)
        }
    }

    markAllProductAsLost(){
        let products = _.cloneDeep(this.props.quote.products);
        if(products){
            products.forEach(product => {
                product.status = {id:"LOST", code:"LOST", name:"Lost"};
                product.lostReason = this.state.lostReason;
            });
            this.setState({lostReason: undefined}, ()=>this.lostReasonModal.close());
            this.handleChange("products", products)
        }
    }

    openLostReason(row) {
        let products = _.cloneDeep(this.props.quote.products);
        if(_.isEmpty(products)){
            Notify.showError("At least one product should be entered");
            return false;
        }
        if (row) {
            this.setState({product: row, lostReason: row.lostReason || undefined}, () => this.lostReasonModal.open());
        } else {
            this.lostReasonModal.open();
        }
    }

    setLostReasonToProduct(){
        if(this.lostReasonForm.form.validate()){
            if(this.state.product){
                this.updateProduct(this.state.product, false);
            }else{
                this.markAllProductAsLost();
            }
        }
    }

    renderExcelUploadModal() {

        let content;

        if (this.state.excelUploadInProgress) {
            content = (
                <Loader size="L" title="Processing file..."/>
            );
        } else {
            content = (
                <Grid>
                    <GridCell width="1-1" noMargin={true}>
                        <PageHeader title="Upload An Excel File"/>
                    </GridCell>
                    <GridCell width="1-1">
                        <FileInput onchange={(input) => this.handleExcelFileSelect(input[0])}/>
                    </GridCell>
                    <GridCell width="1-1">
                        <div className="uk-align-right">
                            <Button label="Cancel" waves={true} onclick={() => this.closeExcelUploadModal()}/>
                        </div>
                    </GridCell>
                </Grid>
            );
        }

        return (
            <Modal ref={(c) => this.excelUploadModal = c}
                   large={false}>
                {content}
            </Modal>
        );
    }

    renderProductForm(){
        let title = "Product Detail";
      
            return(
                <Modal ref={(c) => this.productModal = c}
                       title = {title} large={true}
                       closeOnBackgroundClicked={false}
                       actions={[
                           {label: "SAVE", buttonStyle:"success", flat:false, action: () => {this.state.product._key ? this.updateProduct(this.state.product, true) : this.addProduct()}},
                           {label: "CLOSE", buttonStyle:"danger", flat:false, action: () => this.closeProductForm()}]}>
                    {this.getProductForm()}
                </Modal>
            );

    }

    getProductForm () {
        if(this.state.product){
            return <BundledProduct ref={(c) => this.productForm = c}
                                   quote={this.props.quote}
                                   product = {this.state.product}
                                   loadingAndDelivery={this.state.loadingAndDelivery}
                                   onChange={(value) => this.updateState("product", value)}/>;
        }
        return null;
    }

    renderLostReasonForm(){
        let actions = [];
        if(this.props.editable){
            actions.push({label: "SAVE", action: () => this.setLostReasonToProduct()});
        }
        actions.push({label: "CLOSE", action: () => this.lostReasonModal.close()});
        return(
            <Modal ref={(c) => this.lostReasonModal = c} title = "Lost Reason"
                   closeOnBackgroundClicked={false}
                   center={false}
                   large={true} actions={actions}>
                <LostReason ref = {c => this.lostReasonForm = c}
                            lostReason = {this.state.lostReason}
                            readOnly={!this.props.editable}
                            onChange={(lostReason) => this.updateState("lostReason", lostReason)}/>
            </Modal>
        );
    }

    renderMarkAllWonButton(){
        if(this.props.editable){
            return(
                <GridCell width="1-1">
                    <div className="uk-align-right">
                        <Button label="Mark All as Won" style = "success" size="small" flat={true}
                                onclick = {() => this.markAllProductAsWon()}/>
                    </div>
                </GridCell>
            );
        }
    }

    renderMarkAllLostButton(){
        if(this.props.editable){
            return(
                <GridCell width="1-1">
                    <div className="uk-align-right">
                        <Button label="Mark All as Lost" style = "danger" size="small" flat={true}
                                onclick = {() => this.openLostReason()}/>
                    </div>
                </GridCell>
            );
        }
    }


    getContent () {

        switch (this.props.quote.serviceArea.code) {
            case 'ROAD':
                return this.renderRoadProducts();

            case 'SEA':
                return this.renderSeaProducts();

            case 'AIR':
                return this.renderAirProducts();

            case 'DTR':
                return this.renderDomesticProducts();

            case 'CCL':
                return this.renderCustomsProducts();

            case 'WHM' :
                return this.renderWarehouseProducts();

            default:
                return null;
        }
    }

    renderActionColumns(){
        return(
            <DataTable.ActionColumn>
                <DataTable.ActionWrapper shouldRender = {() => !this.props.readOnly} key="editProduct" track="onclick"
                                         onaction = {(data) => this.openProductForm(data)}>
                    <Button icon="pencil" size="small"/>
                </DataTable.ActionWrapper>
                <DataTable.ActionWrapper shouldRender = {() => !this.props.readOnly} key="deleteProduct" track="onclick"
                                         onaction = {(data) => this.removeProduct(data)}>
                    <Button icon="close" size="small"/>
                </DataTable.ActionWrapper>
            </DataTable.ActionColumn>
        );
    }
    renderMenuItems(){
        if(!this.props.readOnly){
            return <DataTable.Text printer={new MenuPrinter(this)} reader={ new MenuReader()}/>
        }else{
            return null;
        }
    }

    getTotals(status){
        let openProductsTotal = _.sumBy(_.filter(this.props.quote.products, item=>_.get(item,'status.code') === status), 'expectedTurnoverExchanged.amount');
        let openProductsCurrency = _.get(_.first(_.filter(this.props.quote.products, item=>_.get(item, 'status.code') === status)), 'expectedTurnoverExchanged.currency.iso');

        return {
            price: openProductsTotal,
            currency: _.defaultTo(openProductsCurrency, 'EUR' )
        };
    }

    renderProductTotals() {
        let openTotal = this.getTotals('OPEN');
        let wonTotal = this.getTotals('WON');
        let lostTotal = this.getTotals('LOST');


        return (
            <Grid>
                <GridCell width="1-3" >
                    <div className="uk-text-warning">{`${super.translate("Total")} (${super.translate("Lost")})`} </div>  
                    {StringUtils.formatMoney(lostTotal.price, lostTotal.currency)}
                </GridCell>
                <GridCell width="1-3" >
                    <div className="uk-text-warning">{`${super.translate("Total")} (${super.translate("Won")})`} </div>  
                    {StringUtils.formatMoney(wonTotal.price, wonTotal.currency)}
                </GridCell>
                <GridCell width="1-3" >
                    <div className="uk-text-warning">{`${super.translate("Total")} (${super.translate("Open")})`} </div>
                    {StringUtils.formatMoney(openTotal.price, openTotal.currency)}
                </GridCell>
            </Grid>
        )
    }


    renderRoadProducts(footerRows){

        let sortedProducts = _.sortBy(this.props.quote.products, ["fromCountry.name",'toCountry.name']);
        
        let paging=this.calculatePageNumber(sortedProducts);
       

        return (  
            <Grid divider={true}>
            <GridCell width="1-1" margin="small">
                <DataTable.Table data={paging.content}
                                 footerRows={footerRows}
                                 editable={this.props.editable}
                                 noOverflow={true}
                                 onupdate={data => this.edit(data)}>
                    <DataTable.Text field="existence.name" header="Existence" width="5" translator={this} editable={false}/>
                    <DataTable.Text  field="fromCountry.name" header="From Country" translator={this} width="10" editable={false}/>
                    <DataTable.Text field="fromPoint" header="From Postal" width="10" editable={false} printer={new TruncatePrinter("fromPoint.name")}/>
                    <DataTable.Text field="toCountry.name" header="To Country" width="10" translator={this} editable={false}/>
                    <DataTable.Text field="toPoint" header="To Postal" width="10" editable={false} printer={new TruncatePrinter("toPoint.name")}/>
                    <DataTable.Text field="shipmentLoadingType" header="FTL/LTL" width="10" editable={false}/>
                    <DataTable.Text field="incoterm" header="Incoterm" width="5" editable={false}/>
                    <DataTable.Text field="unitOfMeasure.name" header="Unit of Measure" width="5" translator={this} editable={false}/>
                    <DataTable.Numeric field="quantity" header="Quantity/Year" width="8" editable={false} />
                    <DataTable.Numeric field="priceOriginal.amount" header="Price" width="10" printer= {this.numberWithScalePrinter} editable={false}/>
                    <DataTable.Numeric field="expectedTurnoverOriginal.amount" header="Exp.Turnover/Year" width="10" printer= {this.numberWithScalePrinter} editable={false}/>
                    <DataTable.Text field="expectedTurnoverOriginal.currency.name" header="Currency" width="5" editable={false}/>
                    <DataTable.Badge field="status" header="Status" width="5"
                                     reader = {new StatusReader()} printer={new StatusPrinter(this, this.context.translator)}>
                        <DataTable.EditWrapper>
                            <DropDown options={[
                                {id:"WON", code:"WON", name:"Won"},
                                {id:"LOST", code:"LOST", name:"Lost"}]}/>
                        </DataTable.EditWrapper>
                    </DataTable.Badge>
                    {this.renderMenuItems()}
                </DataTable.Table>
            </GridCell>
            <GridCell width="1-1">
                        <Pagination totalElements={paging.totalElements}
                                    page={this.state.pageNumber}
                                    totalPages={paging.pageCount}
                                    onPageChange={(pageNumber) => this.setState({pageNumber:pageNumber})}
                                    range={10}/>
            </GridCell>
            </Grid>
        );
    }

    renderSeaProducts(footerRows){
        if(!_.isEmpty(footerRows)){
            footerRows[0].columns[0].colSpan = 9;
        }
        let sortedProducts = _.sortBy(this.props.quote.products, ["fromCountry.name",'toCountry.name']);

        let paging=this.calculatePageNumber(sortedProducts);

        return (
            
            <Grid divider={true}>
            <GridCell width="1-1" margin="small">
                <DataTable.Table data={paging.content}
                                 footerRows={footerRows}
                                 editable={this.props.editable}
                                 onupdate={data => this.edit(data)}>
                    <DataTable.Text field="existence.name" header="Existence" width="5" translator={this} editable={false}/>
                    <DataTable.Text  field="fromCountry.name" header="From Country" translator={this} width="10" editable={false}/>
                    <DataTable.Text field="fromPoint" header="From Port" width="10" editable={false} printer={new TruncatePrinter("fromPoint.name")}/>
                    <DataTable.Text field="toCountry.name" header="To Country" width="10" translator={this} editable={false}/>
                    <DataTable.Text field="toPoint" header="To Port" width="10" editable={false} printer={new TruncatePrinter("toPoint.name")}/>
                    <DataTable.Text field="shipmentLoadingType" header="FCL/LCL" width="10" editable={false}/>
                    <DataTable.Text field="incoterm" header="Incoterm" width="5" editable={false}/>
                    <DataTable.Text field="incotermExplanation" header="Incoterm Exp." width="10" translator={this} editable={false}/>
                    <DataTable.Text field="unitOfMeasure.name" header="Unit of Measure" width="5" translator={this} editable={false}/>
                    <DataTable.Numeric field="quantity" header="Quantity/Year" width="8" editable={false}/>
                    <DataTable.Numeric field="priceOriginal.amount" header="Price" width="5" printer= {this.numberWithScalePrinter} editable={false}/>
                    <DataTable.Numeric field="expectedTurnoverOriginal.amount" header="Exp.Turnover/Year" width="5" printer= {this.numberWithScalePrinter} editable={false}/>
                    <DataTable.Text field="expectedTurnoverOriginal.currency.name" header="Currency" width="5" editable={false}/>
                    <DataTable.Badge field="status" header="Status" width="5"
                                     reader = {new StatusReader()} printer={new StatusPrinter(this, this.context.translator)}>
                        <DataTable.EditWrapper>
                            <DropDown options={[
                                {id:"WON", code:"WON", name:"Won"},
                                {id:"LOST", code:"LOST", name:"Lost"}]}/>
                        </DataTable.EditWrapper>
                    </DataTable.Badge>
                    {this.renderActionColumns()}
                </DataTable.Table>
            </GridCell>
            <GridCell width="1-1">
                <Pagination totalElements={paging.totalElements}
                                    page={this.state.pageNumber}
                                    totalPages={paging.pageCount}
                                    onPageChange={(pageNumber) => this.setState({pageNumber:pageNumber})}
                                    range={10}/>
            </GridCell>
            </Grid>
        );
    }

    renderAirProducts(footerRows){

        let sortedProducts = _.sortBy(this.props.quote.products, ["fromCountry.name",'toCountry.name']);

        let paging=this.calculatePageNumber(sortedProducts);

        return (
            <Grid divider={true}>
                <GridCell width="1-1" margin="small">
                    <DataTable.Table data={paging.content}
                                 footerRows={footerRows}
                                 editable={this.props.editable}
                                 onupdate={data => this.edit(data)}>
                    <DataTable.Text field="existence.name" header="Existence" width="5" translator={this} editable={false}/>
                    <DataTable.Text  field="fromCountry.name" header="From Country" width="10" translator={this} editable={false}/>
                    <DataTable.Text field="fromPoint" header="From Airport" width="10" editable={false} printer={new TruncatePrinter("fromPoint.name")}/>
                    <DataTable.Text field="toCountry.name" header="To Country" translator={this} width="10" editable={false}/>
                    <DataTable.Text field="toPoint" header="To Airport" width="10" editable={false} printer={new TruncatePrinter("toPoint.name")}/>
                    <DataTable.Text field="incoterm" header="Incoterm" width="5" editable={false}/>
                    <DataTable.Text field="incotermExplanation" header="Incoterm Exp." width="10" translator={this} editable={false}/>
                    <DataTable.Text field="unitOfMeasure.name" header="Unit of Measure" width="5" translator={this} editable={false}/>
                    <DataTable.Numeric field="quantity" header="Quantity/Year" width="8" editable={false}/>
                    <DataTable.Numeric field="priceOriginal.amount" header="Price" width="10" printer= {this.numberWithScalePrinter} editable={false}/>
                    <DataTable.Numeric field="expectedTurnoverOriginal.amount" header="Exp.Turnover/Year" width="10" printer= {this.numberWithScalePrinter} editable={false}/>
                    <DataTable.Text field="expectedTurnoverOriginal.currency.name" header="Currency" width="5" editable={false}/>
                    <DataTable.Badge field="status" header="Status" width="5"
                                     reader = {new StatusReader()} printer={new StatusPrinter(this, this.context.translator)}>
                        <DataTable.EditWrapper>
                            <DropDown options={[
                                {id:"WON", code:"WON", name:"Won"},
                                {id:"LOST", code:"LOST", name:"Lost"}]}/>
                        </DataTable.EditWrapper>
                    </DataTable.Badge>
                    {this.renderActionColumns()}
                     </DataTable.Table>
                 </GridCell>
                 <GridCell width="1-1">
                    <Pagination totalElements={paging.totalElements}
                                    page={this.state.pageNumber}
                                    totalPages={paging.pageCount}
                                    onPageChange={(pageNumber) => this.setState({pageNumber:pageNumber})}
                                    range={10}/>
                 </GridCell>
        </Grid>
        );
    }

    renderDomesticProducts(footerRows){

       let sortedProducts = _.sortBy(this.props.quote.products, ["fromCountry.name",'toCountry.name']);

        let paging=this.calculatePageNumber(sortedProducts);

        return (
            <Grid divider={true}>
            <GridCell width="1-1" margin="small">
                <DataTable.Table data={paging.content}
                                 footerRows={footerRows}
                                 editable={this.props.editable}
                                 onupdate={data => this.edit(data)}>
                    <DataTable.Text field="existence.name" header="Existence" width="5" translator={this} editable={false}/>
                    <DataTable.Text field="fromCountry.name" header="From Country" width="10" translator={this} editable={false}/>
                    <DataTable.Text field="fromPoint" header="From Postal" width="10" editable={false} printer={new TruncatePrinter("fromPoint.name")}/>
                    <DataTable.Text field="toCountry.name" header="To Country" width="10" translator={this} editable={false}/>
                    <DataTable.Text field="toPoint" header="To Postal" width="10" editable={false} printer={new TruncatePrinter("toPoint.name")}/>
                    <DataTable.Text field="vehicleType" header="Vehicle Type" translator={this} width="10" editable={false} translator={this} printer={new ArrayPrinter("vehicleType", this.context.translator)}/>
                    <DataTable.Text field="shipmentLoadingType" header="Transportation Type" translator={this} width="10" editable={false}/>
                    <DataTable.Text field="calculationType.name" header="Calculation Type" width="5" editable={false} translator={this} printer={new TruncatePrinter("calculationType.name")}/>
                    <DataTable.Text field="unitOfMeasure.name" header="Unit of Measure" width="5" translator={this} editable={false}/>
                    <DataTable.Numeric field="quantity" header="Quantity/Year" width="8" editable={false}/>
                    <DataTable.Numeric field="priceOriginal.amount" header="Price" width="10" printer= {this.numberWithScalePrinter} editable={false}/>
                    <DataTable.Numeric field="expectedTurnoverOriginal.amount" header="Exp.Turnover/Year" width="10" printer= {this.numberWithScalePrinter} editable={false}/>
                    <DataTable.Text field="expectedTurnoverOriginal.currency.name" header="Currency" width="5" editable={false}/>
                    <DataTable.Badge field="status" header="Status" width="5"
                                     reader = {new StatusReader()} printer={new StatusPrinter(this, this.context.translator)}>
                        <DataTable.EditWrapper>
                            <DropDown options={[
                                {id:"WON", code:"WON", name:"Won"},
                                {id:"LOST", code:"LOST", name:"Lost"}]}/>
                        </DataTable.EditWrapper>
                    </DataTable.Badge>
                    {this.renderActionColumns()}
                </DataTable.Table>
            </GridCell>
            <GridCell width="1-1">
                    <Pagination totalElements={paging.totalElements}
                                    page={this.state.pageNumber}
                                    totalPages={paging.pageCount}
                                    onPageChange={(pageNumber) => this.setState({pageNumber:pageNumber})}
                                    range={10}/>
                 </GridCell>
        </Grid>
        );
    }

    renderCustomsProducts(footerRows){
        
        let sortedProducts = _.sortBy(this.props.quote.products, ["fromCountry.name",'toCountry.name']);
        
        let paging=this.calculatePageNumber(sortedProducts);

        return (
            <Grid divider={true}>
            <GridCell width="1-1" margin="small">
                <DataTable.Table data={paging.content}
                                 footerRows={footerRows}
                                 editable={this.props.editable}
                                 onupdate={data => this.edit(data)}>
                    <DataTable.Text field="existence.name" header="Existence" width="10" translator={this} editable={false}/>
                    <DataTable.Text field="customsServiceType" header="Customs Service Type" translator={this} width="10"/>
                    <DataTable.Text field="customsOffice" header="Customs Offices" width="10" editable={false} printer={new TruncatePrinter("customsOffice.name")}/>
                    <DataTable.Text field="unitOfMeasure.name" header="Unit of Measure" width="10" editable={false}/>
                    <DataTable.Numeric field="quantity" header="Quantity/Year" width="10" />
                    <DataTable.Numeric field="priceOriginal.amount" header="Price" width="10" printer= {this.numberWithScalePrinter} editable={false}/>
                    <DataTable.Numeric field="expectedTurnoverOriginal.amount" header="Exp.Turnover/Year" width="10" printer= {this.numberWithScalePrinter} editable={false}/>
                    <DataTable.Text field="expectedTurnoverOriginal.currency.name" header="Currency" width="10" editable={false}/>
                    <DataTable.Badge field="status" header="Status" width="10"
                                     reader = {new StatusReader()} printer={new StatusPrinter(this, this.context.translator)}>
                        <DataTable.EditWrapper>
                            <DropDown options={[
                                {id:"WON", code:"WON", name:"Won"},
                                {id:"LOST", code:"LOST", name:"Lost"}]}/>
                        </DataTable.EditWrapper>
                    </DataTable.Badge>
                    {this.renderActionColumns()}
                </DataTable.Table>
            </GridCell>
            <GridCell width="1-1">
                    <Pagination totalElements={paging.totalElements}
                                    page={this.state.pageNumber}
                                    totalPages={paging.pageCount}
                                    onPageChange={(pageNumber) => this.setState({pageNumber:pageNumber})}
                                    range={10}/>
                 </GridCell>
        </Grid>
        );
    }

    renderWarehouseProducts(footerRows){
 
        let sortedProducts = _.sortBy(this.props.quote.products, ["country.name",'country.name']);
        
        let paging=this.calculatePageNumber(sortedProducts);

        return (
            <Grid divider={true}>
            <GridCell width="1-1" margin="small">
                <DataTable.Table data={paging.content}
                                 footerRows={footerRows}
                                 editable={this.props.editable}
                                 onupdate={data => this.edit(data)}>
                    <DataTable.Text field="existence.name" header="Existence" width="25" translator={this} editable={false} />
                    <DataTable.Text field="country.name" header="Country" translator={this} width="25" editable={false}/>
                    <DataTable.Text field="point" header="Postal" width="25" editable={false} printer={new TruncatePrinter("point.name")}/>    
                    <DataTable.Text field="crossDock.name" header="Warehouse" width="15" editable={false} />    
                    <DataTable.Text field="expectedTurnoverOriginal" header="Exp.Turnover/Year" width="10" printer= {new TurnoverPrinter()} editable={false}/>
                    <DataTable.Text width="20" />
                    <DataTable.Badge field="status" header="Status" width="10"
                                     reader = {new StatusReader()} printer={new StatusPrinter(this, this.context.translator)}>
                        <DataTable.EditWrapper>
                            <DropDown options={[
                                {id:"WON", code:"WON", name:"Won"},
                                {id:"LOST", code:"LOST", name:"Lost"}]}/>
                        </DataTable.EditWrapper>
                    </DataTable.Badge>
                    {this.renderActionColumns()}
                </DataTable.Table>
            </GridCell>
            <GridCell width="1-1">
                    <Pagination totalElements={paging.totalElements}
                                    page={this.state.pageNumber}
                                    totalPages={paging.pageCount}
                                    onPageChange={(pageNumber) => this.setState({pageNumber:pageNumber})}
                                    range={10}/>
                 </GridCell>
        </Grid>
        );

    }

    renderFilter(){
        if(this.props.quote.serviceArea.code == "WHM")
            return null;
        else{
            return (
                <GridCell width="1-2">
                    <Filter value={this.state.filter} list={this.props.quote.products} onchange={value => this.setState({ filter: value, pageNumber: 1 })} />
            </GridCell>
            );
        }
    }

    renderStyle(){
        if(this.props.quote.serviceArea.code !== "WHM"){
            return  <GridCell width="1-6" />;
        }
    }

    renderDataTable() {
        if (!this.props.quote) {
            return null;
        }
        return (
            <Grid>
                {this.renderMarkAllWonButton()}
                {this.renderMarkAllLostButton()}
                {this.renderFilter()}
                {this.renderStyle()}
                <GridCell width="1-3" style={{textAlign:"right"}}>
                    {this.renderProductTotals()}
                </GridCell>
                <GridCell width="1-1" margin="small">
                    {this.getContent()}
                </GridCell>
                {this.renderLostReasonForm()}
                {this.renderProductForm()}
                {this.renderExcelUploadModal()}
            </Grid>
        );
    }

    filterChange(value) {
        this.setState({
            filter: value,
            pageNumber: 1
        });
    }

    render(){

        let tools = [
            {title: "Add", items: [{label: "", onclick: () => this.openProductForm()}]},
            {title: "Delete All", items: [{label: "", onclick: () => this.deleteAllProducts()}]}
        ];

        if (this.props.quote.serviceArea.code == "ROAD") {
            tools.push(
                {title: "Excel", items: [
                    {label: "Download Template", onclick: () => this.downloadExcelTemplate()},
                    {label: "Upload", onclick: () => this.openExcelUploadModal()}]
                }
            );
        }

        return (
            <Card>
                <ActionHeader title="Product Details" readOnly={this.props.readOnly} tools={tools}/>
                <LoaderWrapper busy = {this.state.busy} title="" size = "S">
                    {this.renderDataTable()}
                </LoaderWrapper>
            </Card>

        );
    }
}

BundledProductList.contextTypes = {
    translator: PropTypes.object
};

class Filter extends React.Component {

    constructor(props){
        super(props);
    }

    handleChange(value){
        if(this.props.onchange){
            let filter = _.defaultTo(this.props.value, {});
            for(let key in value){
                _.set(filter, key, value[key]);
            }
            this.props.onchange(filter);
        }
    }

    extractOptions(list, field){
        let extractedList = _.reject(_.defaultTo(list,[]).map(i=>i[field]), _.isNil);
        return _.sortBy(_.uniqWith(extractedList, (a,b)=>a.name === b.name), 'name');
    }

    render(){
        return (
            <Grid collapse={false}>
                <GridCell width="1-4">
                    <DropDown valueField="iso" label="From Country"
                        value={_.get(this.props.value, 'fromCountry')}
                        options={this.extractOptions(this.props.list, 'fromCountry')} 
                        onchange={value => this.handleChange({ fromCountry: value })} />
                </GridCell>
                <GridCell width="1-4">
                    <DropDown label="From Point"
                        value={_.get(this.props.value, 'fromPoint')} 
                        options={this.extractOptions(this.props.list, 'fromPoint')} 
                        onchange={value => this.handleChange({ fromPoint: value })} />
                </GridCell>
                <GridCell width="1-4">
                    <DropDown valueField="iso" label="To Country"
                        value={_.get(this.props.value, 'toCountry')}
                        options={this.extractOptions(this.props.list, 'toCountry')} 
                        onchange={value => this.handleChange({ toCountry: value })} />
                </GridCell>
                <GridCell width="1-4">
                    <DropDown label="To Point"
                        value={_.get(this.props.value, 'toPoint')}
                        options={this.extractOptions(this.props.list, 'toPoint')} 
                        onchange={value => this.handleChange({ toPoint: value })} />
                </GridCell>
            </Grid>
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
                this.displayData = StringUtils.formatNumber(Number(data),this.scale);
            } else {
                this.displayData = data;
            }
            return (<span className="uk-align-right">{this.displayData}</span>)
        }
    }
}

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

    constructor(callingComponent, translator) {
        this.callingComponent = callingComponent;
        this.translator = translator;
    }
    translate(text){
        return this.translator ? this.translator.translate(text) : text;
    }
    printUsingRow(row, data) {
        if (data.code === "WON") {
            return <span className="uk-badge md-bg-green-600">{this.translate(_.capitalize(data.name))}</span>
        } else if (data.code === "PARTIAL_WON") {
            return <span className="uk-badge md-bg-green-400">{this.translate(_.capitalize(data.name))}</span>
        } else if (data.code === "OPEN") {
            return <span className="uk-badge md-bg-blue-500">{this.translate(_.capitalize(data.name))}</span>
        } else if (data.code === "CANCELED") {
            return <span className="uk-badge md-bg-orange-600">{this.translate(_.capitalize(data.name))}</span>
        } else if (data.code === "LOST") {
            return  ( <div className="uk-form-row">
                    <span className="uk-badge md-bg-red-600">{this.translate(data.name)}</span>
                    <a>
                        <i className="uk-icon-comment " style = {{fontSize: "120%"}}
                           title={this.translate("Lost Reason")} data-uk-tooltip="{pos:'bottom'}" onClick = {() => this.callingComponent.openLostReason(row)}/>
                    </a>
                </div>
                );
        } else if (data.code === "PDF_CREATED") {
            return <span className="uk-badge md-bg-blue-700">{this.translate(_.capitalize(data.name))}</span>
        } 
        else {
            return null;
        }
        }
    }

class ArrayPrinter {
    constructor(field, translator) {
        this.field = field;
        this.translator = translator;
    }

    translate(text){
        return this.translator ? this.translator.translate(text) : text;
    }

    printUsingRow(row, data) {
        let array = _.get(row, this.field);
        if(array){
            return this.convertToMultipleLineColumnValue(array);
        }
    }
    convertToMultipleLineColumnValue(array) {
        return array.map(item => <div key={item.id}>{this.truncatedValue(item.name)}<br/></div>);
    }

    truncatedValue(input){
        let value = this.translate(input);
        if(value && value.length > 10){
            value = value.substring(0, 10) + "..";
        }
        return value;
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
                            <MenuItem name = "Edit" icon="pencil" onclick = {(e) => this.callingComponent.openProductForm(row)} />
                            <MenuItem name = "Copy" icon="copy" onclick = {(e) => this.callingComponent.cloneProduct(row)} />
                            <MenuItem name = "Delete" icon="close" onclick = {(e) => this.callingComponent.removeProduct(row)} />
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}

class TurnoverPrinter {
    print(data) {
        return _.get(data, 'amount') && <span className="uk-align-right">{StringUtils.formatMoney(data.amount, _.get(data,'currency.name', 'EUR'))} </span> ;
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