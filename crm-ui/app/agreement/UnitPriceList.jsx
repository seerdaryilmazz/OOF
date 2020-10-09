import React from "react";
import {TranslatingComponent} from 'susam-components/abstract';
import _ from "lodash";
import uuid from 'uuid';
import { Card, Grid, GridCell, LoaderWrapper, Modal, Pagination } from 'susam-components/layout';
import { ActionHeader, StringUtils } from "../utils";
import * as DataTable from 'susam-components/datatable';
import {Notify} from 'susam-components/basic';
import {UnitPrice} from "./UnitPrice";
import {HistoryUnitPrice} from "./HistoryUnitPrice";
import {CalculationUtils} from "../utils/CalculationUtils";
import {AgreementService} from "../services";
import {UnitPriceSearchPanel} from "./UnitPriceSearchPanel";
import {LookupService} from "../services/LookupService";
import {DateTimeUtils} from "../utils/DateTimeUtils";

import {SearchUtils} from "susam-components/utils/SearchUtils";
import PropTypes from "prop-types";

const pageSize = 10;

export class UnitPriceList extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            filter:{},
            pageNumber:1,
            pageSize: 10,
            searchParams: {},
            searchResults: {}
        };
    }

    componentDidMount(){
        this.initializeLookups();
        this.search();
    }

    componentDidUpdate(prevProps) {
        if(!_.isEqual(this.props.agreement.unitPrices, prevProps.agreement.unitPrices)){
            this.search()
        }
        if(!_.isEqual(this.props.agreement.serviceAreas, prevProps.agreement.serviceAreas)){
            this.getBillingItems();
        }
    }

    initializeLookups(){
        this.getBillingItems();
    }

    getBillingItems(){
        LookupService.getBillingItemsByServiceAreas(this.props.agreement.serviceAreas).then(response=>{
            response.data.forEach(item=>{
                item.label=item.code+" - "+ super.translate(item.description);
            });
            this.setState({billingItems:response.data});
        }).catch(e=>{
            Notify.showError(e);
        });
    }

    handlePageChange(page){
        let totalPages = _.chunk(this.state.searchResults, pageSize).length;
        let content = _.slice(this.state.searchResults, pageSize * page, pageSize + (pageSize * page));
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

    unitPriceToBeDeletedArray(id) {
        let unitPricesToBeDeleted = _.cloneDeep(this.props.agreement.unitPricesToBeDeleted);
        if(!unitPricesToBeDeleted){
            unitPricesToBeDeleted = [];
        }
        unitPricesToBeDeleted.push(id);
        let keyValuePairs = [{key: "unitPricesToBeDeleted", value: unitPricesToBeDeleted}];
        this.props.onChange(keyValuePairs);
    }

    unitPriceHistoryToBeDeletedArray(id) {
        let unitPriceHistoryToBeDeleted = _.cloneDeep(this.props.agreement.unitPriceHistoryToBeDeleted);
        if(!unitPriceHistoryToBeDeleted){
            unitPriceHistoryToBeDeleted = [];
        }
        unitPriceHistoryToBeDeleted.push(id);
        let keyValuePairs = [{key: "unitPriceHistoryToBeDeleted", value: unitPriceHistoryToBeDeleted}];
        this.props.onChange(keyValuePairs);
    }

    calculatePageNumber(arr) {
        let {pageNumber, pageSize} = this.state;
        let searchResults = {
            totalElements: arr.length,
        }
        searchResults.content = _.slice(arr, (pageNumber - 1) * pageSize, pageNumber * pageSize);
        searchResults.pageCount = Math.floor(searchResults.totalElements / pageSize) + ((searchResults.totalElements % pageSize) > 0 ? 1 : 0);
        this.setState({searchResults: searchResults});
    }

    search(filter = this.state.filter){
        let arr = this.props.agreement.unitPrices || [];
        for (let key in filter) {
            if (key === 'validityStartDate') {
                arr = _.filter(arr, i => DateTimeUtils.translateToDateObject(i[key], "/") >= DateTimeUtils.translateToDateObject(filter[key].path, "/"))
            } else if (key === 'validityEndDate') {
                arr = _.filter(arr, i => DateTimeUtils.translateToDateObject(i[key], "/") <= DateTimeUtils.translateToDateObject(filter[key].path, "/"))
            } else if (key === 'serviceName') {
                arr = _.filter(arr, i => _.includes(i[key], filter[key].path))
            } else {
                arr = new SearchUtils([filter[key].name]).search(filter[key].path, arr);
            }
        }
        this.calculatePageNumber(arr);
    }

    showOrHideSearchPanel() {
        this.unitPriceSearchPanel.showOrHideSearchPanel();
    }
    
    handleChange(unitPrices) {
        let keyValuePairs = [{key: "unitPrices", value: unitPrices}];
        this.props.onChange(keyValuePairs);
    }

    validateUnitPriceForm() {
        return this.unitPriceForm.validate();
    }

    closeUnitPriceForm() {
        let state = _.cloneDeep(this.state);
        state.unitPrice = undefined;
        if(state.renew){
            state.renew = undefined;
        }
        this.setState(state, this.unitPriceModal.close());
    }

    closeHistoryUnitPriceForm() {
        let state = _.cloneDeep(this.state);
        state.unitPriceData = undefined;
        this.setState(state, this.historyUnitPriceModal.close());
    }

    checkDuplicates(unitPrice = this.state.unitPrice){
        let unitPrices = _.cloneDeep(this.props.agreement.unitPrices);
        if(_.isEmpty(_.find(unitPrices, {'_key': unitPrice._key}))){
            if(_.find(unitPrices, {'basedOn': unitPrice.basedOn, 'billingItem': unitPrice.billingItem, 'serviceName': unitPrice.serviceName})){
                Notify.showError("This unit price already exists!");
                return false;
            }
        }else {
            let remainingUnitPrices = _.cloneDeep(_.filter(unitPrices, (o) => {
                return o._key !== unitPrice._key;
            }));
            if(_.find(remainingUnitPrices, {'basedOn': unitPrice.basedOn, 'billingItem': unitPrice.billingItem, 'serviceName': unitPrice.serviceName})) {
                Notify.showError("This unit price already exists!");
                return false;
            }
        }
        return true;
    }

    addUnitPrice() {
        if (this.validateUnitPriceForm() && this.checkDuplicates()) {
            let unitPrices = _.cloneDeep(this.props.agreement.unitPrices);
            if (!unitPrices) {
                unitPrices = [];
            }
            let unitPrice = this.state.unitPrice;
            unitPrice._key = uuid.v4();
            unitPrices.push(unitPrice);
            this.unitPriceModal.close();
            this.updateState("unitPrice", undefined, () => {
                this.handleChange(unitPrices)
            });
        }
    }

    updateUnitPrice(unitPrice) {
        if (this.validateUnitPriceForm() && this.checkDuplicates()) {
            let unitPrices = _.cloneDeep(this.props.agreement.unitPrices);
            if (unitPrices) {
                const index = unitPrice.id ?
                    unitPrices.findIndex(item => item.id === unitPrice.id)
                    :
                    unitPrices.findIndex(item => item._key === unitPrice._key);
                if (index !== -1) {
                    unitPrices[index] = unitPrice;
                    this.updateState("unitPrice", undefined, () => {
                        this.handleChange(unitPrices)
                    });
                }
            }
            this.unitPriceModal && this.unitPriceModal.close();
        }
    }

    removeUnitPrice(unitPrice, removeAll) {
        let unitPrices = _.cloneDeep(this.props.agreement.unitPrices);
        if (unitPrices) {
            const index = unitPrices.findIndex(item => item._key === unitPrice._key);
            if (index !== -1) {
                if(!unitPrice.id){
                    this.spliceUnitPrice(unitPrices, index);
                }else{
                    if (removeAll){
                        this.unitPriceToBeDeletedArray(unitPrice.id);
                        this.spliceUnitPrice(unitPrices, index);
                    }else{
                        AgreementService.getHistoryUnitPricesByUnitPriceId(unitPrice.id).then(response=>{
                            if(!_.isEmpty(response.data)){
                                this.unitPriceHistoryToBeDeletedArray(response.data[0].id);
                                response.data[0].id = unitPrice.id;
                                unitPrices[index] = response.data[0];
                                this.updateState("unitPrice", undefined, () => {
                                    this.handleChange(unitPrices)
                                });
                            }else{
                                this.spliceUnitPrice(unitPrices, index);
                            }
                        })
                    }
                }
            }
        }
    }

    spliceUnitPrice(unitPrices, index){
        unitPrices.splice(index, 1);
        this.updateState("unitPrice", null, () => {
            this.handleChange(unitPrices);
        });
    }

    calculate(){
        let unitPrice = this.state.unitPrice;
        this.setState({busy:true});
        let callback = (currentPrice) => {
            if(currentPrice){
                unitPrice.price = currentPrice;
                this.updateState("unitPrice", unitPrice);
            }else {
                Notify.showError("Cannot calculate due to an error");
            }
            this.setState({busy:false});
        };
        let price = CalculationUtils.calculateCurrentPrice(unitPrice, callback);

    }

    openUnitPriceForm(unitPrice) {
        let state = _.cloneDeep(this.state);
        if (unitPrice) {
            state.renew = true;
            state.unitPrice = unitPrice;
        }
        else {
            state.unitPrice = {};
        }
        this.setState(state, () => {this.unitPriceModal.open()});
    }


    renderUnitPriceForm() {
        let actions=[];
        if(this.state.renew && this.state.unitPrice && this.state.unitPrice.priceModel){
            // actions.push({label: "CALCULATE", buttonStyle:"primary", flat:false, action: () => this.calculate()})
        }
        actions.push({label: "SAVE", buttonStyle:"success", flat:false, action: () => {this.state.unitPrice && this.state.unitPrice._key ? this.updateUnitPrice(this.state.unitPrice) : this.addUnitPrice()}});
        actions.push({label: "CLOSE", buttonStyle:"danger", flat:false, action: () => this.closeUnitPriceForm()});
        return(
            <Modal ref={(c) => this.unitPriceModal = c}
                   title="Unit Price Detail"
                   large={true}
                   closeOnBackgroundClicked={false}
                   actions={actions}>
                {this.getUnitPriceForm()}
            </Modal>
        );
    }

    getUnitPriceForm() {
        if (this.state.unitPrice) {
            return <UnitPrice ref={c => this.unitPriceForm = c}
                              renew={this.state.renew}
                              unitPrice={this.state.unitPrice || undefined}
                              serviceAreas={this.props.agreement.serviceAreas}
                              billingItems={this.state.billingItems}
                              priceModels={this.props.agreement.priceAdaptationModels}
                              onChange={(value) => this.updateState("unitPrice", value)}/>;
        }
        return null;
    }

    openHistoryUnitPrice(unitPrice){
        let state = _.cloneDeep(this.state);
        if (unitPrice) {
            state.unitPriceData = unitPrice;
        }
        else {
            state.unitPriceData = {};
        }
        this.setState(state, () => {this.historyUnitPriceModal.open()});
    }

    renderHistoryUnitPriceForm(){
        return (
            <Modal ref={(c) => this.historyUnitPriceModal = c}
                   large={true}
                   closeOnBackgroundClicked={false}
                   actions={[
                       {label: "CLOSE", buttonStyle:"danger", flat:false, action: () => this.closeHistoryUnitPriceForm()}]}>
                {this.getHistoryUnitPrice()}
            </Modal>
        );
    }

    getHistoryUnitPrice(){
        if(this.state.unitPriceData){
            return(
                <HistoryUnitPrice unitPriceData={this.state.unitPriceData}
                                  readOnly={true}/>
            )
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
        if (!this.props.agreement) {
            return null;
        }
        return(
            <Grid divider = {true}>
                <GridCell width="1-1" margin="small">
                    <DataTable.Table data={this.state.searchResults.content} noOverflow={true}>
                        <DataTable.Text header="Service Name" field="serviceName" printer={new UnitPriceNamePrinter()} />
                        <DataTable.Text header="Service Area" field="billingItem.serviceArea" translator={this}/>
                        <DataTable.Text header="BillingItem" field="billingItem" printer={new BillingItemPrinter(this)} />
                        <DataTable.Numeric header="Price" field="price" printer={new NumericPrinter(4)}/>
                        <DataTable.Text header="Currency" field="currency" translator={this}/>
                        <DataTable.Text header="Based On" field="basedOn.name" translator={this}/>
                        {/*<DataTable.Numeric header="EUR Ref" field="eurRef" printer={new NumericPrinter(4)}/>*/}
                        {/*<DataTable.Numeric header="USD Ref" field="usdRef" printer={new NumericPrinter(4)}/>*/}
                        {/*<DataTable.Numeric header="Minimum Wage Ref" field="minimumWageRef" printer={new NumericPrinter(4)}/>*/}
                        {/*<DataTable.Numeric header="Inflation Ref(%)" field="inflationRef" printer={new NumericPrinter(0)}/>*/}
                        <DataTable.Text header="Validity Start Date" field="validityStartDate"/>
                        <DataTable.Text header="Update Period" reader={new UpdatePeriodReader()}/>
                        <DataTable.Text header="Validity End Date" field="validityEndDate"/>
                        <DataTable.Text header="Price Model" field="priceModel.name"/>
                        {this.renderMenuItems()}
                    </DataTable.Table>
                </GridCell>
                <GridCell width="1-1" noMargin={true}>
                    <Pagination totalElements={this.state.searchResults.totalElements}
                                totalPages={this.state.searchResults.pageCount}
                                page={this.state.pageNumber}
                                range={10}
                                onPageChange={(pageNumber) => this.setState({pageNumber:pageNumber}, ()=> this.search())}/>
                </GridCell>
            </Grid>
        );
    }

    render() {
        let unitPrices = _.cloneDeep(this.props.agreement.unitPrices);
        if(!_.isEmpty(unitPrices)){
            unitPrices.forEach(item => {
                if (!_.isEmpty(item.billingItem) && !item.billingItem.label) {
                    item.billingItem.label = item.billingItem.code + " - " + item.billingItem.description
                }
            });
        }

        return(
            <Card>
                <UnitPriceSearchPanel ref={c => this.unitPriceSearchPanel = c}
                                      unitPrices={unitPrices}
                                      readOnly={this.props.readOnly}
                                      pageNumber={this.state.pageNumber}
                                      onSearch={filter => this.setState({filter: filter}, ()=>this.search())}/>
                <ActionHeader title="Unit Price" removeTopMargin={true}
                              tools={[{icon: "search", readOnly: false, flat: true, items: [{label: "", onclick: () => this.showOrHideSearchPanel()}]},
                                  {title: "Add", readOnly: this.props.readOnly, items: [{label: "", onclick: () => this.openUnitPriceForm()}]}]}/>
                <LoaderWrapper busy={this.state.busy} title="" size="S">
                    {this.renderDataTable()}
                </LoaderWrapper>
                {this.renderUnitPriceForm()}
                {this.renderHistoryUnitPriceForm()}
            </Card>
        );
    }

}

UnitPriceList.contextTypes = {
    translator: PropTypes.object
};

class MenuPrinter{
    constructor(callingComponent) {
        this.callingComponent = callingComponent;
    }

    print(row) {
        return (
            <div className="md-card">
                <div className="md-card-list-item-menu" data-uk-dropdown="{mode:'click', pos:'right-bottom'}" aria-haspopup="true" aria-expanded="true">
                    <a href="#" className="md-icon material-icons"></a>
                    <div className="uk-dropdown uk-dropdown-small" style={{width: "fit-content"}}>
                        <ul className="uk-nav">
                            <MenuItem name = "Renew" icon="refresh" render={row.id} onclick = {(e) => this.callingComponent.openUnitPriceForm(row)} />
                            <MenuItem name = "Delete Current Period" icon="close" render={true} onclick = {(e) => this.callingComponent.removeUnitPrice(row)} />
                            <MenuItem name = "Delete All Periods" icon="close" iconStyle={{color:"red"}} render={true} onclick = {(e) => this.callingComponent.removeUnitPrice(row, true)} />
                            <MenuItem name = "History" icon="bookmark" render={row.id} onclick = {(e) => this.callingComponent.openHistoryUnitPrice(row)} />
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
        let iconStyle = this.props.iconStyle ? (this.props.iconStyle) : "";
        return(
            <li>
                <a href="javascript:;" onClick = {(e) => this.props.onclick(e)}>
                    <i className={"uk-icon-" + this.props.icon + " uk-icon-medsmall " + styleClassName} style={{iconStyle}}/>
                    <span className = {"uk-margin-left " + styleClassName}>{super.translate(this.props.name)}</span>
                </a>
            </li>
        );
    }
}

class UnitPriceNamePrinter{
    constructor(){
    }
    print(data){
        if(data.length>30){
           return data.substring(0,27) + "...";
        }else {
            return data;
        }
    }
}

class BillingItemPrinter {
    constructor(translator){
        this.translator=translator;
    }

    translate(text){
        return this.translator ? this.translator.translate(text) : text;
    }

    print(data){
        return data.code + " - " + this.translate(data.description);
    }
}

class UpdatePeriodReader {
    readCellValue(row) {
        if (row.updatePeriod && row.renewalDateType) {
            return row.updatePeriod + " " + row.renewalDateType.id;
        }
        return "";
    }

    readSortValue(rowData){
        return this.readCellValue(rowData);
    }
}

class NumericPrinter {

    constructor(scale) {
        this.scale = scale;
        this.displayData = "---";
    }

    print(data) {
        if (data || data === 0) {
            let floatPart = Number(data) - Math.floor(Number(data));
            if(floatPart === 0){
                this.displayData = Number(data).toFixed(2);
            } else if (this.scale || this.scale === 0) {
                this.displayData = StringUtils.formatNumber(Number(data),this.scale);
            } else {
                this.displayData = data;
            }
            return (<span>{this.displayData}</span>)
        }
    }
}