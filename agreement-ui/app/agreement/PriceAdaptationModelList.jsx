import React from "react";
import {TranslatingComponent} from 'susam-components/abstract';
import _ from "lodash";
import uuid from 'uuid';
import { Card, Grid, GridCell, LoaderWrapper, Modal, Pagination } from 'susam-components/layout';
import { ActionHeader, StringUtils } from "../utils";
import * as DataTable from 'susam-components/datatable';
import {PriceAdaptationModel} from "./PriceAdaptationModel";
import {Notify} from "susam-components/basic";
import {HistoryModel} from "./HistoryModel";

const pageSize = 10;

export class PriceAdaptationModelList extends TranslatingComponent {

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
        if(!_.isEqual(this.props.agreement.priceAdaptationModels, prevProps.agreement.priceAdaptationModels)){
            this.handlePageChange(this.state.page)
        }
    }

    handlePageChange(page){
        let totalPages = _.chunk(this.props.agreement.priceAdaptationModels, pageSize).length;
        let content = _.slice(this.props.agreement.priceAdaptationModels, pageSize * page, pageSize + (pageSize * page));
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

    handleChange(priceAdaptationModels) {
        let keyValuePairs = [{key: "priceAdaptationModels", value: priceAdaptationModels}];
        this.props.onChange(keyValuePairs);
    }

    validatePriceAdaptationModelForm() {
        return this.priceAdaptationModelForm.validate();
    }

    closePriceAdaptationModelForm() {
        let state = _.cloneDeep(this.state);
        state.priceAdaptationModel = undefined;
        if(state.renew){
            state.renew = undefined;
        }
        this.setState(state, this.priceAdaptationModelModal.close());
    }

    closeHistoryModelForm() {
        let state = _.cloneDeep(this.state);
        state.priceModelData = undefined;
        this.setState(state, this.historyModelModal.close());
    }

    addPriceAdaptationModel() {
        if (this.validatePriceAdaptationModelForm()) {
            let priceAdaptationModels = _.cloneDeep(this.props.agreement.priceAdaptationModels);
            if (!priceAdaptationModels) {
                priceAdaptationModels = [];
            }
            let priceAdaptationModel = this.state.priceAdaptationModel;
            priceAdaptationModel._key = uuid.v4();
            priceAdaptationModels.push(priceAdaptationModel);
            this.priceAdaptationModelModal.close();
            this.updateState("priceAdaptationModel", undefined, () => {
                this.handleChange(priceAdaptationModels)
            });
        }
    }

    updatePriceAdaptationModel(priceAdaptationModel) {
        if (this.validatePriceAdaptationModelForm()) {
            let priceAdaptationModels = _.cloneDeep(this.props.agreement.priceAdaptationModels);
            if (priceAdaptationModels) {
                if(priceAdaptationModel.historyModel) {
                    let historyModel = priceAdaptationModel.historyModel;
                    historyModel.validityEndDate = this.setValidityEndDate(priceAdaptationModel.validityStartDate);
                }
                const index = priceAdaptationModel.id ?
                    priceAdaptationModels.findIndex(item => item.id === priceAdaptationModel.id)
                    :
                    priceAdaptationModels.findIndex(item => item._key === priceAdaptationModel._key);
                if (index !== -1) {
                    priceAdaptationModels[index] = priceAdaptationModel;
                    this.updateState("priceAdaptationModel", null, () => {
                        this.handleChange(priceAdaptationModels);
                    });
                }
            }
            this.priceAdaptationModelModal && this.priceAdaptationModelModal.close();
        }
    }


    setValidityEndDate(date){
        // Gelen tarihin ay kısmını, new Date() fonksiyonuyla oluşturulan tarihte bir fazla gösterdiği için
        //o fazlalık çıkarıldı ==> parts[1]-1
        let parts = date.split("/");
        return moment(new Date(parts[2], parts[1] - 1, parts[0])).add(-1, 'days').format('DD/MM/YYYY');
    }

    renewPriceAdaptationModel(data){
        this.setState({renew:true}, ()=> this.openPriceAdaptationModelForm(data));
    }

    removePriceAdaptationModel(priceAdaptationModel) {
        let priceAdaptationModels = _.cloneDeep(this.props.agreement.priceAdaptationModels);
        if (priceAdaptationModels) {
            if(!_.isEmpty(_.find(this.props.agreement.unitPrices, {priceModel: {id : priceAdaptationModel.id}}))){
                Notify.showError("The price adaptation models that are used for unit prices cannot be deleted!");
                return false;
            }
            const index = priceAdaptationModels.findIndex(item => item._key === priceAdaptationModel._key);
            if (index !== -1) {
                priceAdaptationModels.splice(index, 1);
                this.updateState("priceAdaptationModel", null, () => {
                    this.handleChange(priceAdaptationModels);
                });
            }
        }
    }

    openHistoryModelForm(priceAdaptationModel){
        let state = _.cloneDeep(this.state);
        if (priceAdaptationModel) {
            state.priceModelData = priceAdaptationModel;
        }
        else {
            state.priceModelData = {};
        }
        this.setState(state, () => {this.historyModelModal.open()});
    }

    renderHistoryModelForm(){
        return (
            <Modal ref={(c) => this.historyModelModal = c}
                   large={true}
                   closeOnBackgroundClicked={false}
                   actions={[
                       {label: "CLOSE", buttonStyle:"danger", flat:false, action: () => this.closeHistoryModelForm()}]}>
                {this.getHistoryModel()}
            </Modal>
        );
    }

    getHistoryModel(){
        if(this.state.priceModelData){
            return(
                <HistoryModel priceModelData={this.state.priceModelData}
                              readOnly={true}/>
            )
        }
        return null;
    }

    openPriceAdaptationModelForm(priceAdaptationModel) {
        let state = _.cloneDeep(this.state);
        if (priceAdaptationModel) {
            state.priceAdaptationModel = priceAdaptationModel;
        }
        else {
            state.priceAdaptationModel = {};
        }
        this.setState(state, () => {this.priceAdaptationModelModal.open()});
    }

    renderPriceAdaptationModelForm() {
        return(
            <Modal ref={(c) => this.priceAdaptationModelModal = c}
                   title="Price Adaptation Model Detail"
                   medium={true}
                   closeOnBackgroundClicked={false}
                   actions={[
                       {label: "SAVE", buttonStyle:"success", flat:false, action: () => {this.state.priceAdaptationModel && this.state.priceAdaptationModel._key ? this.updatePriceAdaptationModel(this.state.priceAdaptationModel) : this.addPriceAdaptationModel()}},
                       {label: "CLOSE", buttonStyle:"danger", flat:false, action: () => this.closePriceAdaptationModelForm()}]}>
                {this.getPriceAdaptationModelForm()}
            </Modal>
        );
    }

    getPriceAdaptationModelForm() {
        if (this.state.priceAdaptationModel) {
            return <PriceAdaptationModel ref={c => this.priceAdaptationModelForm = c}
                                         renew = {this.state.renew}
                                         priceAdaptationModel={this.state.priceAdaptationModel || undefined}
                                         onChange={(value) => this.updateState("priceAdaptationModel", value)}/>;
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
                        <DataTable.Text header="Name" field="name"/>
                        <DataTable.Text header="Validity Start Date" field="validityStartDate"/>
                        <DataTable.Numeric header="EUR (%)" field="eur" printer={new NumericPrinter(0)}/>
                        <DataTable.Numeric header="USD (%)" field="usd" printer={new NumericPrinter(0)}/>
                        <DataTable.Numeric header="Inflation (%)" field="inflation" printer={new NumericPrinter(0)}/>
                        <DataTable.Numeric header="Minimum Wage (%)" field="minimumWage" printer={new NumericPrinter(0)}/>
                        {this.renderMenuItems()}
                    </DataTable.Table>
                </GridCell>
                <GridCell width="1-1" noMargin={true}>
                    <Pagination totalElements={_.isEmpty(this.props.agreement.priceAdaptationModels) ? 0 : this.props.agreement.priceAdaptationModels.length}
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
                <ActionHeader title="Price Adaptation Model" readOnly={this.props.readOnly} removeTopMargin={true}
                              tools={[{title: "Add", items: [{label: "", onclick: () => this.openPriceAdaptationModelForm()}]}]} />
                <LoaderWrapper busy = {this.state.busy} title="" size = "S">
                    {this.renderDataTable()}
                </LoaderWrapper>
                {this.renderPriceAdaptationModelForm()}
                {this.renderHistoryModelForm()}
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
                            <MenuItem name = "Renew" icon="refresh" render={row.id} onclick = {(e) => this.callingComponent.renewPriceAdaptationModel(row)} />
                            <MenuItem name = "Edit" icon="pencil" render={true} onclick = {(e) => this.callingComponent.openPriceAdaptationModelForm(row)} />
                            <MenuItem name = "Delete" icon="close" render={true} onclick = {(e) => this.callingComponent.removePriceAdaptationModel(row)} />
                            <MenuItem name = "History" icon="bookmark" render={row.id} onclick = {(e) => this.callingComponent.openHistoryModelForm(row)} />
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