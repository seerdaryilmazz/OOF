import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, Notify } from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';
import { Grid, GridCell, LoaderWrapper, Modal, Pagination, Secure } from "susam-components/layout";
import * as Constants from "../common/Constants";
import { HistoryTable } from "../history/HistoryTable";
import { CrmAccountService, CrmSearchService, HistoryService } from "../services";
import { ActionHeader } from '../utils/ActionHeader';
import { Potential } from "./";
import { PotentialSearchPanel } from './PotentialSearchPanel';

export class PotentialList extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.moment = require("moment");
        this.state = {
            searchParams: this.initSearchParams(props.initialSearchParams),
            searchResult: { content: null }
        };
    }
    
    initSearchParams(initialSearchParams) {
        if (initialSearchParams) {
            return _.cloneDeep(initialSearchParams);
        } else {
            return {};
        }
    }

    componentDidMount(){
        this.search(1, this.props.account.id, this.props.serviceArea);
    }

    componentWillReceiveProps(nextProps){
        let isAccountIdChanging = !_.isEqual(nextProps.account.id, this.props.account.id);
        let isServiceAreaChanging = !_.isEqual(nextProps.serviceArea, this.props.serviceArea);
        let areInitialSearchParamsChanging = !_.isEqual(nextProps.initialSearchParams, this.props.initialSearchParams);
        if (isAccountIdChanging || isServiceAreaChanging || areInitialSearchParamsChanging) {
            // serviceArea değerine göre değişen veya gösterilmeyen alanlar olduğundan, serviceArea değiştiğinde de arama kriterlerini yeniden oluşturuyoruz.
            if (isAccountIdChanging && !isServiceAreaChanging && !areInitialSearchParamsChanging) {
                this.search(1, nextProps.account.id, nextProps.serviceArea);
            } else {
                this.setState({searchParams: this.initSearchParams(nextProps.initialSearchParams)}, () => this.search(1, nextProps.account.id, nextProps.serviceArea));
            }
        }
    }

    updateState(key, value){
        let state = _.cloneDeep(this.state);
        state[key] = value;
        this.setState(state);
    }
    
    getPageSize() {
        if (this.props.mode === Constants.POTENTIAL_LIST_MODE_SEARCH_AND_SELECT) {
            return 3;
        } else {
            return 10;
        }
    }

    search(pageNumber, accountId, serviceArea) {

        let searchParams = this.state.searchParams;
        let params = {
            page: pageNumber - 1,
            pageSize: this.getPageSize(),
            accountId: accountId,
            serviceArea: serviceArea,
            fromCountryPointId: null,
            toCountryPointId: null
        };

        if (!_.isNil(searchParams.fromCountry)) {
            params.fromCountryId = searchParams.fromCountry.id;
        }
        if (!_.isNil(searchParams.fromCountryPoint)) {
            params.fromCountryPointId = _.isArray(searchParams.fromCountryPoint) ? searchParams.fromCountryPoint.map(i=>i.id) : [searchParams.fromCountryPoint.id];
        }
        if (!_.isNil(searchParams.toCountry)) {
            params.toCountryId = searchParams.toCountry.id;
        }
        if (!_.isNil(searchParams.toCountryPoint)) {
            params.toCountryPointId = _.isArray(searchParams.toCountryPoint) ? searchParams.toCountryPoint.map(i=>i.id) : [searchParams.toCountryPoint.id];
        }
        if (!_.isNil(searchParams.loadWeightType)) {
            params.loadWeightTypeCode = searchParams.loadWeightType.code;
        }
        if (!_.isNil(searchParams.shipmentLoadingType)) {
            params.shipmentLoadingTypeCode = searchParams.shipmentLoadingType.code;
        }
        if (!_.isNil(searchParams.status)) {
            params.active = searchParams.status.value;
        }
        if (!_.isNil(searchParams.createdBy)) {
            params.createdBy = searchParams.createdBy.username;
        }
        if (!_.isEmpty(searchParams.minCreationDate)) {
            params.minCreationDate = searchParams.minCreationDate;
        }
        if (!_.isEmpty(searchParams.maxCreationDate)) {
            params.maxCreationDate = searchParams.maxCreationDate;
        }

        CrmAccountService.searchForPotentials(params).then(response => {
            // Diyelim ki 2. sayfadayız, sayfada tek kayıt var ve bu kaydı siliyoruz,
            // bu durumda 2. sayfada hiç kayıt kalmıyor, o zaman bir öncek sayfaya geçiyoruz.
            if (response.data.content.length == 0 && pageNumber > 1) {
                this.search(pageNumber - 1, accountId, serviceArea);
            } else {
                this.setState({
                    busy: false,
                    searchResult: response.data,
                    pageNumber: pageNumber,
                    pageCount: response.data.totalPages
                });
            }
        }).catch(error => {
            this.setState({busy: false});
            Notify.showError(error);
        });
    }

    retrieveChangeHistory(potential){
        let params = {id: potential.id, type: 'potential'};
        HistoryService.retrieveChanges(params)
            .then(response => {
                this.setState({changes:response.data}, () => this.historyModal.open())
            }).catch(error => {
            console.log(error);
            Notify.showError(error);
        });
    }

    handlePotentialCreate(){
        if(this.potentialForm.validate()){
            if(this.isEqual(this.state.potential, this.state.potential.original)){
                Notify.showError(this.props.serviceArea === 'CCL' ?
                    "Import/Export value should be changed to copy the potential!" :
                    "Any of From Country, From Postal, To Country or To Postal values should be changed to copy the potential!");
                return;
            }
            this.setState({busy: true});
            CrmAccountService.createPotential(this.props.account.id, this.state.potential).then(response => {
                this.potentialModal.close();
                Notify.showSuccess("Potential saved successfully");
                this.setState({potential: undefined});
                this.search(this.state.pageNumber, this.props.account.id, this.props.serviceArea);
            }).catch(error => {
                this.setState({busy: false});
                Notify.showError(error);
            });
        }
    }

    isEqual(newPotential, existingPotential){
        if(!newPotential || !existingPotential){
            return false;
        }
        if(this.props.serviceArea === 'CCL'){
            return (newPotential.customsType || {}).code === (existingPotential.customsType || {}).code;
        }
        return _.isEqualWith(existingPotential, newPotential, (a,b)=>{
            return _.isEqual(_.get(a.fromCountry, 'id'), _.get(b.fromCountry,'id')) 
                && (_.isEmpty(b.fromPoint) || (!_.isEmpty(a.fromPoint) &&_.differenceWith(a.fromPoint, b.fromPoint, (x,y)=>_.isEqual(x.id, y.id)).length === 0))
                && _.isEqual(_.get(a.toCountry, 'id'), _.get(b.toCountry,'id')) 
                && (_.isEmpty(b.toPoint) || (!_.isEmpty(a.toPoint) && _.differenceWith(a.toPoint, b.toPoint, (x,y)=>_.isEqual(x.id, y.id)).length === 0));
        });
    }

    handlePotentialEdit(){
        if(this.potentialForm.validate()){
            if(this.isEqual(this.state.potential, this.state.potential.original)){
                this.updatePotential();
            }else{
                this.setState({busy: true});
                let request = {
                    page: 1,
                    size: 1,
                    matchFilters: [{name: "Potential", val: this.state.potential.id}]
                };
                CrmSearchService.searchDocument(request).then(response => {
                    if(_.isEmpty(response.data.content)){
                        this.updatePotential();
                    }else{
                        this.setState({busy: false});
                        Notify.showError('The potentials that are used for quotes can not be edited!');
                    }
                }).catch(error => {
                    this.setState({busy: false});
                    Notify.showError(error);
                });
            }
        }
    }

    updatePotential(){
        this.setState({busy: true});
        CrmAccountService.updatePotential(this.props.account.id, this.state.potential).then(response => {
            this.potentialModal.close();
            Notify.showSuccess("Potential saved successfully");
            this.setState({potential: undefined});
            this.search(this.state.pageNumber, this.props.account.id, this.props.serviceArea);
        }).catch(error => {
            this.setState({busy: false});
            Notify.showError(error);
        });
    }

    activatePotential(data){
        let potential = _.cloneDeep(data);
        potential.validityStartDate = this.moment().format('DD/MM/YYYY');;
        potential.validityEndDate = this.moment("9999-12-31").format('DD/MM/YYYY');
        this.setState({busy: true});
        CrmAccountService.updatePotential(this.props.account.id, potential).then(() => {
            Notify.showSuccess("Potential updated");
            this.search(this.state.pageNumber, this.props.account.id, this.props.serviceArea);
        }).catch(error => {
            this.setState({busy: false});
            Notify.showError(error);
        });
    }

    handleDeletePotential(data){
        Notify.confirm("Are you sure?", () => {
            this.setState({busy: true});
            let request = {
                page: 1,
                size: 1,
                matchFilters: [
                    {name: "Potential", val: data.id},
                    {name: "Status", val: "CANCELED", not: true},
                    ]};
            CrmSearchService.searchDocument(request).then(response => {
                if(_.isEmpty(response.data.content)){
                    CrmAccountService.deletePotential(data.id).then(() => {
                        Notify.showSuccess("Potential deleted");
                        this.search(this.state.pageNumber, this.props.account.id, this.props.serviceArea);
                    }).catch(error => {
                        this.setState({busy: false});
                        Notify.showError(error);
                    });
                }else{
                    this.setState({busy: false});
                    Notify.showError('The potentials that are used for quotes cannot be deleted!');
                }
            }).catch(error => {
                this.setState({busy: false});
                Notify.showError(error);
            });
        });
    }

    showOrHideSearchPanel() {
        this.potentialSearchPanel.showOrHideSearchPanel();
    }

    handleSearchParamsChange(value) {
        this.setState({searchParams: value});
    }

    handleSearchParamsClear() {
        this.setState({searchParams: {}}, () => {
            this.search(1, this.props.account.id, this.props.serviceArea)
        });
    }

    openPotentialForm(data, readOnly){
        let potential = _.cloneDeep(data);
        if(potential){
            potential.readOnly = readOnly;
            potential.original = data;
        }
        this.setState({potential: potential, potentialForm: true}, () => {this.potentialModal.open()});
    }

    openInactivationForm(data){
        let state = _.cloneDeep(this.state);
        state.potential = data;
        this.setState(state, () => {this.inActivationModal.open()});
    }

    handleInActivatePotential(data) {
        Notify.confirm('The potential will be inactivated. Are you sure?', () => {
            let potential = _.cloneDeep(data);
            this.setState({ busy: true });
            potential.validityEndDate = this.moment().subtract(1, "day").format('DD/MM/YYYY');
            CrmAccountService.updatePotential(this.props.account.id, potential).then(() => {
                Notify.showSuccess("Potential updated");
                this.setState({ potential: undefined });
                this.search(this.state.pageNumber, this.props.account.id, this.props.serviceArea);
            }).catch(error => {
                this.setState({ busy: false });
                Notify.showError(error);
            });
        })
    }

    routeToQuoteForm(data, type){
        this.context.router.push(`/ui/crm/quote/new/${type}/${this.props.serviceArea}/${this.props.account.id}/${data.id}`);
    }

    clonePotential(data){
        let clonedPotential = _.cloneDeep(data);
        clonedPotential.id = null;
        clonedPotential.validityStartDate = null;
        clonedPotential.validityEndDate = null;
        this.openPotentialForm(clonedPotential);
    }

    renderHistoryModal(){
        let actions =[];
        actions.push({label: "CLOSE", buttonStyle:"danger", flat:false, action: () => this.historyModal.close()});
        return(
            <Modal ref={(c) => this.historyModal = c}
                   title = "History"
                   closeOnBackgroundClicked={false}
                   large={true}
                   actions={actions}>
                <HistoryTable changes = {this.state.changes}/>
            </Modal>
        );
    }

    renderPotentialForm(){
        let actions=[];
        if(!((this.state.potential || {}).readOnly)){
            actions.push({label: "SAVE", buttonStyle:"success", flat:false, action: () => {this.state.potential.id ? this.handlePotentialEdit() : this.handlePotentialCreate()}});
        }
        actions.push({label: "CLOSE", buttonStyle:"danger", flat:false, action: () => {this.setState({potential: undefined}, ()=>this.potentialModal.close())}});


        return(
            <Modal ref={(c) => this.potentialModal = c} title = "Potential"
                   closeOnBackgroundClicked={false}
                   large={true}
                   onclose={()=>this.setState({potentialForm: null})}
                   actions={actions}>

                {this.getPotentialForm()}
            </Modal>
        );
    }

    getPotentialForm () {
        if(!this.state.potentialForm){
            return null;
        }
        return <Potential ref={(c) => this.potentialForm = c}
                       serviceArea={this.props.serviceArea}
                       potential={this.state.potential || undefined}
                       readOnly={(this.state.potential || {}).readOnly}
                       onChange={(value) => this.updateState("potential", value)}/>
    }

    getContent() {
        let table;
        switch (this.props.serviceArea) {
            case 'ROAD':
                table = this.renderRoadPotentials();
                break;

            case 'SEA':
                table = this.renderSeaPotentials();
                break;

            case 'AIR':
                table = this.renderAirPotentials();
                break;

            case 'CCL':
                table = this.renderCustomsPotentials();
                break;

            default:
                table = null;
                break;
        }
        return (<div>
                    {table}
                    <Modal ref={c => this.truncatedColumnContentModal = c}>
                        <div>{this.state.truncatedColumnContent}</div>
                    </Modal>
                </div>);
    }

    openTruncatedColumnContentModal(content){
        this.setState({truncatedColumnContent: content}, ()=>this.truncatedColumnContentModal.open())
    }

    handlePotentialSelect(data) {
        if (this.props.onPotentialSelect) {
            this.props.onPotentialSelect(data);
        }
    }

    renderRoadPotentials(){

        let loadWeightTypeColumn = null;
        let frequencyTypeColumn = null;
        let frequencyColumn = null;
        let createdByColumn = null;
        let createdAtColumn = null;
        let menuColumn = null;
        let actionColumn = null;
        let showShipmentLoadingTypesInMultipleLines;

        if (this.props.mode === Constants.POTENTIAL_LIST_MODE_SEARCH_AND_SELECT) {
            actionColumn = (
                <DataTable.ActionColumn>
                    <DataTable.ActionWrapper shouldRender={item=>item.status.code == 'ACTIVE'} track="onclick" onaction={(data) => this.handlePotentialSelect(data)}>
                        <Button label="Select" flat={true} style="success" size="small"/>
                    </DataTable.ActionWrapper>
                </DataTable.ActionColumn>
            );
            showShipmentLoadingTypesInMultipleLines = false;
        } else {
            loadWeightTypeColumn = <DataTable.Text field="loadWeightType.name" header="Load Type" width="10" translator={this}/>;
            frequencyTypeColumn = <DataTable.Text field="frequencyType.name" header="Frequency Type" width="10" translator={this}/>;
            frequencyColumn = <DataTable.Text field="frequency" header="Frequency" width="10" />;
            createdByColumn = <DataTable.Text field="createdBy" header="Created By" width="5" printer={new UserPrinter(this.context.getAllUsers())}/>;
            createdAtColumn = <DataTable.Text field="createdAt" header="Created At" width="10" />;
            menuColumn = <DataTable.Text printer={new MenuPrinter(this)} reader={ new MenuReader()}/>;
            showShipmentLoadingTypesInMultipleLines = true;
        }
        
        return(
            <DataTable.Table data={this.state.searchResult.content} noOverflow={true} key="_ROAD">
                <DataTable.Text field="fromCountry.name" header="From Country" width="10" translator={this} printer={new TruncatePrinter(this)}/>
                <DataTable.Text field="fromPoint" header="From Postal" width="10" printer={new TruncatePrinter(this, "name", content=>this.openTruncatedColumnContentModal(content))}/>
                <DataTable.Text field="toCountry.name" header="To Country" width="10" printer={new TruncatePrinter(this)}/>
                <DataTable.Text field="toPoint" header="To Postal" width="10" printer={new TruncatePrinter(this, "name", content=>this.openTruncatedColumnContentModal(content))}/>
                {loadWeightTypeColumn}
                <DataTable.Text field="shipmentLoadingTypes" header="FTL/LTL" width="10" printer={new ArrayPrinter("shipmentLoadingTypes", showShipmentLoadingTypesInMultipleLines)}/>
                {frequencyTypeColumn}
                {frequencyColumn}
                <DataTable.Badge field="status" header="Type" width="5" printer={new StatusPrinter(this,this)}/>
                {createdByColumn}
                {createdAtColumn}
                {menuColumn}
                {actionColumn}
            </DataTable.Table>
        );
    }

    renderSeaPotentials(){
        return(
            <DataTable.Table data={this.state.searchResult.content} noOverflow={true} key="_SEA">
                <DataTable.Text field="fromCountry.name" header="From Country" width="10" printer={new TruncatePrinter(this)}/>
                <DataTable.Text field="fromPoint" header="From Port" width="10" printer={new TruncatePrinter(this, "name", content=>this.openTruncatedColumnContentModal(content))}/>
                <DataTable.Text field="toCountry.name" header="To Country" width="10" printer={new TruncatePrinter(this)}/>
                <DataTable.Text field="toPoint" header="To Port" width="10" printer={new TruncatePrinter(this, "name", content=>this.openTruncatedColumnContentModal(content))}/>
                <DataTable.Text field="shipmentLoadingTypes" header="FCL/LCL" width="5" printer={new ArrayPrinter("shipmentLoadingTypes", true)}/>
                <DataTable.Text field="incoterm" header="Incoterm" width="10"/>
                <DataTable.Text field="frequencyType.name" header="Frequency Type" translator={this} width="10"/>
                <DataTable.Text field="frequency" header="Frequency" width="10"/>
                <DataTable.Badge field="status" header="Type" width="5" printer={new StatusPrinter(this,this)}/>
                <DataTable.Text field="createdBy" header="Created By" width="10" printer={new UserPrinter(this.context.getAllUsers())}/>
                <DataTable.Text field="createdAt" header="Created At" width="10" />
                <DataTable.Text printer={new MenuPrinter(this)} reader={ new MenuReader()}/>
            </DataTable.Table>
        );
    }

    renderAirPotentials(){
        return(
            <DataTable.Table data={this.state.searchResult.content} noOverflow={true} key="_AIR">
                <DataTable.Text field="fromCountry.name" header="From Country" width="10" printer={new TruncatePrinter(this)}/>
                <DataTable.Text field="fromPoint" header="From Airport" width="10" printer={new TruncatePrinter(this,"name", content=>this.openTruncatedColumnContentModal(content))}/>
                <DataTable.Text field="toCountry.name" header="To Country" width="10" printer={new TruncatePrinter(this)}/>
                <DataTable.Text field="toPoint" header="To Airport" width="10" printer={new TruncatePrinter(this, "name", content=>this.openTruncatedColumnContentModal(content))}/>
                <DataTable.Text field="chargeableWeights" header="Chargeable Weights" width="10" printer={new ArrayPrinter("chargeableWeights", true)}/>
                <DataTable.Text field="incoterm" header="Incoterm" width="10"/>
                <DataTable.Text field="frequencyType.name" header="Frequency Type" translator={this} width="10"/>
                <DataTable.Text field="frequency" header="Frequency" width="10"/>
                <DataTable.Badge field="status" header="Type" width="5" printer={new StatusPrinter(this,this)}/>
                <DataTable.Text field="createdBy" header="Created By" width="5" printer={new UserPrinter(this.context.getAllUsers())}/>
                <DataTable.Text field="createdAt" header="Created At" width="10" />
                <DataTable.Text printer={new MenuPrinter(this)} reader={ new MenuReader()}/>
            </DataTable.Table>
        );
    }

    renderCustomsPotentials(){
        return(
            <DataTable.Table data={this.state.searchResult.content} noOverflow={true} key="_CCL">
                <DataTable.Text field="customsType.name" header="Import/Export" translator={this} width="15"/>
                <DataTable.Text field="customsOffices" header="Customs Offices" width="25" printer={new ArrayPrinter("customsOffices", true)}/>
                <DataTable.Text field="frequencyType.name" header="Frequency Type" translator={this} width="15"/>
                <DataTable.Text field="frequency" header="Frequency" width="15"/>
                <DataTable.Badge field="status" header="Type" width="10" printer={new StatusPrinter(this,this)}/>
                <DataTable.Text field="createdBy" header="Created By" width="10" printer={new UserPrinter(this.context.getAllUsers())}/>
                <DataTable.Text field="createdAt" header="Created At" width="10" />
                <DataTable.Text printer={new MenuPrinter(this)} reader={ new MenuReader()}/>
            </DataTable.Table>
        );
    }

    renderDataTable() {
        return (
            <GridCell width="1-1">
                <div>
                    <Grid>
                        <GridCell width="1-1" noMargin={true}>
                            <div className="uk-accordion-title"
                                 style={{background: "none", height: "10px", top: "-10px"}}>
                            </div>
                        </GridCell>
                        <GridCell width="1-1">
                            <div className="uk-accordion-content">
                                <ul className="md-list">
                                    {this.getContent()}
                                </ul>
                            </div>
                        </GridCell>
                        <GridCell width="1-1">
                            <Pagination totalElements={this.state.searchResult.totalElements}
                                        page={this.state.pageNumber}
                                        totalPages={this.state.pageCount}
                                        onPageChange={(pageNumber) => this.search(pageNumber, this.props.account.id, this.props.serviceArea)}
                                        range={10}/>
                        </GridCell>
                    </Grid>
                </div>
            </GridCell>
        );
    }

    getActionHeaderTools() {
        let actionHeaderTools = [];
        if (this.props.mode !== Constants.POTENTIAL_LIST_MODE_SEARCH_AND_SELECT) {
            if (this.props.serviceArea != "DTR" && this.props.serviceArea != "CCL") {
                actionHeaderTools.push({icon: "search", flat: true, items: [{label: "", onclick: () => this.showOrHideSearchPanel()}]});
            }
            actionHeaderTools.push({title: "New Potential", items: [{label: "", onclick: () => this.openPotentialForm()}]});
        }
        return actionHeaderTools;
    }

    render() {
        return (
            <div>
                <PotentialSearchPanel ref={c => this.potentialSearchPanel = c}
                                      mode={this.props.mode}
                                      serviceArea={this.props.serviceArea}
                                      searchParams={this.state.searchParams}
                                      onSearchParamsChange={(value) => this.handleSearchParamsChange(value)}
                                      onSearchParamsClear={() => this.handleSearchParamsClear()}
                                      onSearchClick={() => this.search(1, this.props.account.id, this.props.serviceArea)}/>
                <ActionHeader title="Potentials" readOnly={this.props.readOnly} removeTopMargin={true}
                                  tools={this.getActionHeaderTools()}
                                  className="uk-accordion-title"/>
                <div className="uk-accordion-content">
                    <LoaderWrapper busy={this.state.busy} title="" size="S">
                        <div>
                            {this.getContent()}
                            <Pagination totalElements={this.state.searchResult.totalElements}
                                page={this.state.pageNumber}
                                totalPages={this.state.pageCount}
                                onPageChange={(pageNumber) => this.search(pageNumber, this.props.account.id, this.props.serviceArea)}
                                range={10}/>
                        </div>
                    </LoaderWrapper>
                    {this.renderPotentialForm()}
                    {this.renderHistoryModal()}
                </div>
            </div>
        );
    }
}

PotentialList.contextTypes = {
    getUsers: React.PropTypes.func,
    getAllUsers: React.PropTypes.func,
    router: React.PropTypes.object.isRequired,
    translator: React.PropTypes.object
};

class ArrayPrinter {
    constructor(field, multipleLine) {
        this.field = field;
        this.multipleLine = multipleLine;
    }
    printUsingRow(row, data) {
        let array = _.get(row, this.field);
        if(array){
            let arrayInternal = this.field === "customsOffices" ? array.map(item => item.office) : array;
            if (this.multipleLine === true) {
                return ArrayPrinter.convertToMultipleLineColumnValue(arrayInternal);
            } else {
                let names = arrayInternal.map(item => item.name);
                return _.join(names, ", ");
            }
        }
    }
    static convertToMultipleLineColumnValue(array) {
        return array.map(item => <div key={item.id}>{ArrayPrinter.truncatedValue(item.name)}<br/></div>);
    }

    static truncatedValue(value){
        if(value && value.length > 15){
            value = value.substring(0, 15) + "..";
        }
        return value;
    }
}

class TruncatePrinter {
    constructor(translator, path, onclick) {
        this.translator = translator;
        this.path = path;
        this.onclick = onclick
    }
    translate(text) {
        return this.translator ? this.translator.translate(text) : text;
    }
    print(data) {
        let value = null;
        if (_.isArray(data)) {
            value = _.orderBy(data.map(i => this.translate(_.get(i, this.path)))).join(',');
        } else if (this.path) {
            value = this.translate(_.get(data, this.path));
        } else {
            value = this.translate(data);
        }
        
        let truncatedValue = this.truncatedValue(value);
        return !_.isEmpty(value) && this.onclick ? 
            <a href="javascript:;" onClick={()=>this.onclick(value)}>{truncatedValue}</a> : 
            <span>{_.isEmpty(truncatedValue)?this.translate("ALL"):truncatedValue}</span>;
    }
    truncatedValue(value) {
        if (value && value.length > 12) {
            value = this.translate(value);
            value = value.substring(0, 12) + "..";
        }
        return this.translate(value);
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
    print(data){
        let className = data.code === 'ACTIVE' ? "success" : "danger";
        return <span className={`uk-badge uk-badge-${className}`}>{this.translate(data.name)}</span>
    }
}

class MenuPrinter{
    constructor(callingComponent) {
        this.callingComponent = callingComponent;
    }

    print(row) {
        let isActive = row.status.code === 'ACTIVE';
        let serviceArea = this.callingComponent.props.serviceArea;
        return (
            <div className="md-card">
                <div className="md-card-list-item-menu" data-uk-dropdown="{mode:'click', pos:'right-bottom'}" aria-haspopup="true" aria-expanded="true">
                    <a href="#" className="md-icon material-icons"></a>
                    <div className="uk-dropdown uk-dropdown-small">
                        <ul className="uk-nav">
                            <Secure operations={["crm-quote.create"]}>
                                <MenuItem name = "Spot Quote" icon="play-circle" render={isActive && serviceArea !== 'CCL'} onclick = {(e) => this.callingComponent.routeToQuoteForm(row, 'SPOT')} />
                            </Secure>
                            <Secure operations={["crm-quote.create"]}>
                                <MenuItem name = "Long Term Quote" icon="play-circle" render={isActive && serviceArea === 'CCL'} onclick = {(e) => this.callingComponent.routeToQuoteForm(row, 'LONG_TERM')} />
                            </Secure>
                            <MenuItem name = "View" icon="eye" render={true} onclick = {(e) => this.callingComponent.openPotentialForm(row, true)} />
                            <MenuItem name = "Edit" icon="pencil" render={isActive} onclick = {(e) => this.callingComponent.openPotentialForm(row)} />
                            <MenuItem name = "Copy" icon="copy" render={true} onclick = {(e) => this.callingComponent.clonePotential(row)} />
                            <MenuItem name = "Activate" icon="refresh" render={!isActive} onclick = {(e) => this.callingComponent.activatePotential(row)} />
                            <MenuItem name = "Inactivate" icon="ban" render={isActive} onclick = {(e) => this.callingComponent.handleInActivatePotential(row)} />
                            <MenuItem name = "Delete" icon="close" render={true} onclick = {(e) => this.callingComponent.handleDeletePotential(row)} />
                            <MenuItem name = "History" icon="bookmark" render={true} onclick = {(e) => this.callingComponent.retrieveChangeHistory(row)} />
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

class UserPrinter{
    constructor(userList){
        this.userList = userList;
    }

    print(data){
        return _.get(_.find(this.userList, u=>u.username == data),'displayName');
    }   
}



