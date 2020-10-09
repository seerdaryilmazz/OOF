import React from "react";
import {TranslatingComponent} from 'susam-components/abstract';
import _ from "lodash";
import uuid from 'uuid';
import { Card, Grid, GridCell, LoaderWrapper, Modal, Pagination } from 'susam-components/layout';
import { ActionHeader, StringUtils } from "../utils";
import * as DataTable from 'susam-components/datatable';
import {Notify} from "susam-components/basic";
import {UnitPrice} from "./UnitPrice";
import {HistoryUnitPrice} from "./HistoryUnitPrice";
import {CalculationUtils} from "../utils/CalculationUtils";

const pageSize = 10;

export class UnitPriceList extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            page:0,
            size: pageSize
        };
    }

    componentDidMount(){
        this.handlePageChange(this.state.page)
    }

    componentDidUpdate(prevProps) {
        if(!_.isEqual(this.props.agreement.unitPrices, prevProps.agreement.unitPrices)){
            this.handlePageChange(this.state.page)
        }
    }

    handlePageChange(page){
        let totalPages = _.chunk(this.props.agreement.unitPrices, pageSize).length;
        let content = _.slice(this.props.agreement.unitPrices, pageSize * page, pageSize + (pageSize * page));
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

    checkDuplicates(unitPrice){
        let unitPrices = _.cloneDeep(this.props.agreement.unitPrices);
        let newUnitPrice = unitPrice ? unitPrice : this.state.unitPrice;
        console.log(_.find(unitPrices, {'basedOn': newUnitPrice.basedOn, 'billingItem': newUnitPrice.billingItem, 'serviceName': newUnitPrice.serviceName}));
        if(_.find(unitPrices, {'basedOn': newUnitPrice.basedOn, 'billingItem': newUnitPrice.billingItem, 'serviceName': newUnitPrice.serviceName})){
            Notify.showError("This unit price already exists!");
            return false;
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

    removeUnitPrice(unitPrice) {
        let unitPrices = _.cloneDeep(this.props.agreement.unitPrices);
        if (unitPrices) {
            const index = unitPrices.findIndex(item => item._key === unitPrice._key);
            if (index !== -1) {
                unitPrices.splice(index, 1);
                this.updateState("unitPrice", null, () => {
                    this.handleChange(unitPrices);
                });
            }
        }
    }

    calculate(){
        if(this.unitPriceForm.validateCalculation()){
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
    }

    renewUnitPrice(data){
        this.setState({renew:true}, () => this.openUnitPriceForm(data));
    }

    openUnitPriceForm(unitPrice) {
        let state = _.cloneDeep(this.state);
        if (unitPrice) {
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
            actions.push({label: "CALCULATE", buttonStyle:"primary", flat:false, action: () => this.calculate()})
        }
        actions.push({label: "SAVE", buttonStyle:"success", flat:false, action: () => {this.state.unitPrice && this.state.unitPrice._key ? this.updateUnitPrice(this.state.unitPrice) : this.addUnitPrice()}});
        actions.push({label: "CLOSE", buttonStyle:"danger", flat:false, action: () => this.closeUnitPriceForm()});
        return(
            <Modal ref={(c) => this.unitPriceModal = c}
                   title="Unit Price Detail"
                   medium={true}
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
                    <DataTable.Table data={this.state.content} noOverflow={true}>
                        <DataTable.Text header="BillingItem" field="billingItem" printer={new BillingItemPrinter()} />
                        <DataTable.Text header="Service Name" field="serviceName"/>
                        <DataTable.Numeric header="Price" field="price" printer={new NumericPrinter(2)}/>
                        <DataTable.Text header="Currency" field="currency"/>
                        <DataTable.Text header="Based On" field="basedOn.name"/>
                        <DataTable.Numeric header="EUR Ref" field="eurRef" printer={new NumericPrinter(2)}/>
                        <DataTable.Numeric header="USD Ref" field="usdRef" printer={new NumericPrinter(2)}/>
                        <DataTable.Numeric header="Minimum Wage Ref" field="minimumWageRef" printer={new NumericPrinter(2)}/>
                        <DataTable.Numeric header="Inflation Ref(%)" field="inflationRef" printer={new NumericPrinter(0)}/>
                        <DataTable.Text header="Validity Start Date" field="validityStartDate"/>
                        <DataTable.Text header="Update Period" reader={new UpdatePeriodReader()}/>
                        <DataTable.Text header="Validity End Date" field="validityEndDate"/>
                        <DataTable.Text header="Price Model" field="priceModel.name"/>
                        {this.renderMenuItems()}
                    </DataTable.Table>
                </GridCell>
                <GridCell width="1-1" noMargin={true}>
                    <Pagination totalElements={_.isEmpty(this.props.agreement.unitPrices) ? 0 : this.props.agreement.unitPrices.length}
                                totalPages={this.state.totalPages}
                                page={this.state.page + 1}
                                onPageChange={page=>this.handlePageChange(page -1)}/>
                </GridCell>
            </Grid>
        );
    }

    render() {
        return(
            <Card>
                <ActionHeader title="Unit Price" readOnly={this.props.readOnly} removeTopMargin={true}
                              tools={[{title: "Add", items: [{label: "", onclick: () => this.openUnitPriceForm()}]}]} />
                <LoaderWrapper busy = {this.state.busy} title="" size = "S">
                    {this.renderDataTable()}
                </LoaderWrapper>
                {this.renderUnitPriceForm()}
                {this.renderHistoryUnitPriceForm()}
            </Card>
        );
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
                            <MenuItem name = "Renew" icon="refresh" render={row.id} onclick = {(e) => this.callingComponent.renewUnitPrice(row)} />
                            <MenuItem name = "Edit" icon="pencil" render={true} onclick = {(e) => this.callingComponent.openUnitPriceForm(row)} />
                            <MenuItem name = "Delete" icon="close" render={true} onclick = {(e) => this.callingComponent.removeUnitPrice(row)} />
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

class BillingItemPrinter {
    print(data){
        if(data){
            data.label=data.code+" - "+data.description
        }
        return data.label;
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
            if (this.scale || this.scale === 0) {
                this.displayData = StringUtils.formatNumber(Number(data),this.scale);
            } else {
                this.displayData = data;
            }
            return (<span>{this.displayData}</span>)
        }
    }
}