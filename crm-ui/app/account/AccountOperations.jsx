import * as axios from "axios";
import _ from "lodash";
import PropTypes from "prop-types";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Date } from 'susam-components/advanced';
import { Button, DropDown, Form, Notify, TextInput } from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';
import { Card, Grid, GridCell, LoaderWrapper, Modal, PageHeader, Pagination } from 'susam-components/layout';
import { AccountSearchAutoComplete } from "../common";
import { CrmAccountService, CrmSearchService, LookupService } from "../services";
import { ActionHeader, LoadingIndicator } from '../utils';


export class AccountOperations extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state={
            noResult:"",
            accounts:{content:null},
            page:1,
            size:20,
            searchCriteria:{},
            fieldsToChange:{},
        };
    }

    componentDidMount(){
        this.initializeLookups();
    }

    initializeLookups(){
        this.setState({busy:true});
        axios.all([
            LookupService.getCountries(),
            LookupService.getAccountTypes(),
            LookupService.getSegmentTypes(),
            LookupService.getParentSectors()
        ]).then(axios.spread((countries, accountTypes, segmentTypes, parentSectors) => {
            this.setState({
                countries: countries.data, 
                accountTypes: accountTypes.data,
                segmentTypes: segmentTypes.data, 
                parentSectors: parentSectors.data, 
                subSectors: [], 
                busy:false
            });
        })).catch(error => {
            this.setState({busy:false});
            Notify.showError(error);
        })
    }

    updateSearchCriteria(key, value){
        let searchCriteria = _.cloneDeep(this.state.searchCriteria);
        _.set(searchCriteria, key, value);
        this.setState({searchCriteria: searchCriteria, noResult:"", accounts: {content:null}});
    }

    updateFieldsToChange(key, value){
        let fieldsToChange = _.cloneDeep(this.state.fieldsToChange);
        _.set(fieldsToChange, key, value);
        this.setState({fieldsToChange: fieldsToChange});
    }

    updateParentSector(parentSector){
        let searchCriteria = _.cloneDeep(this.state.searchCriteria);
        searchCriteria.parentSector = parentSector;
        searchCriteria.subSector = null;
        if(!parentSector){
            this.setState({searchCriteria: searchCriteria, subSectors: [], noResult:"", accounts: {content:null}});
            return;
        }
        LookupService.getSubSectors(parentSector.id).then(response => {
            this.setState({searchCriteria: searchCriteria, subSectors: response.data, noResult:"", accounts: {content:null}});
        }).catch(error => {
            this.setState({searchCriteria: searchCriteria, subSectors: [], noResult:"", accounts: {content:null}});
            Notify.showError(error);
        })
    }

    arrangeSearchParams(pageNumber) {
        this.state.page = pageNumber;
        let searchCriteria = this.state.searchCriteria;
        let params = {
            page: this.state.page,
            size: this.state.size
        };
        let matchFilters = [];
        if (!_.isNil(searchCriteria.countryCode)) {
            matchFilters.push({name: 'Country Iso', val: searchCriteria.countryCode.iso});
        }
        if (!_.isNil(searchCriteria.account)) {
            matchFilters.push({name: 'Account Id', val: searchCriteria.account.id});
        }
        if (!_.isNil(searchCriteria.accountType)) {
            matchFilters.push({name: 'Account Type', val: searchCriteria.accountType.code});
        }
        if (!_.isNil(searchCriteria.segmentType)) {
            matchFilters.push({name: 'Segment Code', val: searchCriteria.segmentType.code});
        }
        if (!_.isNil(searchCriteria.accountOwner)) {
            matchFilters.push({name: 'Account Owner', val: searchCriteria.accountOwner.username});
        }
        if (!_.isNil(searchCriteria.parentSector)) {
            matchFilters.push({name: 'Parent Sector', val: searchCriteria.parentSector.code});
        }
        if (!_.isNil(searchCriteria.subSector)) {
            matchFilters.push({name: 'Sub Sector', val: searchCriteria.subSector.code});
        }
         if (!_.isEmpty(searchCriteria.minCreationDate)) {
            matchFilters.push({name: 'Min Creation Date', val: searchCriteria.minCreationDate + " 00:00", operator: 'gte'});
        }
        if (!_.isEmpty(searchCriteria.maxCreationDate)) {
            matchFilters.push({name: 'Max Creation Date', val: searchCriteria.maxCreationDate + " 23:59", operator: 'lte'});
        }
        if (!_.isEmpty(searchCriteria.city)) {
            matchFilters.push({name: 'City', val: searchCriteria.city});
        }
        if (!_.isEmpty(searchCriteria.district)) {
            if (_.isEmpty(searchCriteria.city)) {
               Notify.showError("City must be entered for district.");
                 return false;
            } else {
                matchFilters.push({name: 'District', val: searchCriteria.district});
            }
        }
        params.matchFilters = matchFilters;
        return params;
    }

    searchAccounts(pageNumber) {
        let params = this.arrangeSearchParams(pageNumber);
        if (params) {
            this.setState({busy: true});
            CrmSearchService.searchDocument(params, 'account').then(response => {
                this.setState({
                    accounts: response.data,
                    pageNumber: pageNumber,
                    pageCount: response.data.totalPages,
                    noResult:"",
                    busy: false
                });
                if(_.isEmpty(response.data.content)){
                    this.setState({
                        noResult: "No data to display."
                    })
                }
                this.updteAccountTimeout && clearTimeout(this.updteAccountTimeout);
            }).catch(error => {
                this.setState({accounts: {content:null}, noResult: "No data to display.", busy: false});
                Notify.showError(error);
            })
        }
    }

    updateAccountsWithCriteria(closeModal){
        let params=this.arrangeSearchParams(1);
        this.setState({busy:true});
        CrmSearchService.searchDocumentAslist(params, 'account').then(response=>{
            let fieldsToChange = _.cloneDeep(this.state.fieldsToChange);
            fieldsToChange.accountIds = response.data.map(i=>i.id);
            return CrmAccountService.updateAccountsWithCriteria(fieldsToChange);
        }).then(response=>{
            this.updteAccountTimeout = setTimeout(()=>{
                this.setState({fieldsToChange: {}, busy:false}, ()=>closeModal());
                this.searchAccounts(1);
                Notify.showSuccess("Accounts saved successfully");
            }, 3000);
        }).catch(error => {
            this.setState({busy:false});
            Notify.showError(error);
        });
    }

    navigateToAccountView(item){
        window.open(`/ui/crm/account/${item.id}/view`, "_blank");
    }

    renderAccountOwnerModal(){
        return(
            <Modal ref={(c) => this.accountOwnerModal = c}
                   closeOnBackgroundClicked={false}
                   actions={[
                       {label: "SAVE", action: () => this.updateAccountsWithCriteria(()=>this.accountOwnerModal.close())},
                       {label: "CLOSE", action: () => this.setState({fieldsToChange: {}}, ()=>this.accountOwnerModal.close())}]}>
                <LoaderWrapper busy = {this.state.busy} title="" size = "S">
                    <Grid noMargin={true}>
                        <GridCell width="3-4">
                            <DropDown options={this.context.getUsers()} label="New Account Owner"
                                      labelField = "displayName" valueField="username"
                                      value={this.state.fieldsToChange.accountOwner}
                                      onchange = {(accountOwner) => {accountOwner ? this.updateFieldsToChange("accountOwner", accountOwner.username) : null}}/>
                        </GridCell>
                    </Grid>
                </LoaderWrapper>
            </Modal>
        );
    }

    renderAccountTypeModal(){
        return(
            <Modal ref={(c) => this.accountTypeModal = c}
                   closeOnBackgroundClicked={false}
                   actions={[
                       {label: "SAVE", action: () => this.updateAccountsWithCriteria(()=>this.accountTypeModal.close())},
                       {label: "CLOSE", action: () => this.setState({fieldsToChange: {}}, ()=>this.accountTypeModal.close())}]}>
                <LoaderWrapper busy = {this.state.busy} title="" size = "S">
                    <Grid noMargin={true}>
                        <GridCell width="3-4">
                            <DropDown options={this.state.accountTypes} label="New Account Type"
                                      value={this.state.fieldsToChange.accountType}
                                      onchange = {(accountType) => {accountType ? this.updateFieldsToChange("accountType", accountType) : null}}/>
                        </GridCell>
                    </Grid>
                </LoaderWrapper>
            </Modal>
        );
    }

    renderSegmentModal(){
        return(
            <Modal ref={(c) => this.segmentModal = c}
                   closeOnBackgroundClicked={false}
                   actions={[
                       {label: "SAVE", action: () => this.updateAccountsWithCriteria(()=>this.segmentModal.close())},
                       {label: "CLOSE", action: () => this.setState({fieldsToChange: {}}, ()=>this.segmentModal.close())}]}>
                <LoaderWrapper busy = {this.state.busy} title="" size = "S">
                    <Grid noMargin={true}>
                        <GridCell width="3-4">
                            <DropDown options={this.state.segmentTypes} label="New Segment Type"
                                      value={this.state.fieldsToChange.segmentType}
                                      onchange = {(segmentType) => {segmentType ? this.updateFieldsToChange("segmentType", segmentType) : null}}/>
                        </GridCell>
                    </Grid>
                </LoaderWrapper>
            </Modal>
        );
    }

    renderDataTable(){
        if (_.isEmpty(this.state.accounts.content)) {
            return this.state.noResult;
        }else{
            let items = [];
            items.push({label: "Change Account Owner", onclick: () => this.accountOwnerModal.open()});
            items.push({label: "Change Account Segment", onclick: () => this.segmentModal.open()});
            items.push({label: "Change Account Type", onclick: () => this.accountTypeModal.open()});
            return (
                <Card>
                    <ActionHeader title="Accounts" removeTopMargin={true}
                                  tools={[{title: "Operations", items: items, minWidth: "200px", data_uk_dropdown:"{pos:'bottom-right'}"}]} />
                    <DataTable.Table data={this.state.accounts.content} key="_ACCOUNTS">
                        <DataTable.Text field="name" header="Name" width="20" printer={new TruncatePrinter("name", 33)}/>
                        <DataTable.Text field="country.name" header="Country" width="10"/>
                        <DataTable.Text field="accountType.name" header="Type" width="10"/>
                        <DataTable.Text field="segment.name" header="Segment" width="10"/>
                        <DataTable.Text field="parentSector" header="Parent Sector" width="15" printer={new TruncatePrinter("parentSector.name")}/>
                        <DataTable.Text field="subSector" header="Sub Sector" width="15" printer={new TruncatePrinter("subSector.name")}/>
                        <DataTable.Text field="accountOwner" header="Account Owner" width="10"/>
                        <DataTable.ActionColumn>
                            <DataTable.ActionWrapper key="viewAccount" track="onclick" onaction = {(data) => this.navigateToAccountView(data)}>
                                <Button icon="eye" size="small"/>
                            </DataTable.ActionWrapper>
                        </DataTable.ActionColumn>
                    </DataTable.Table>
                    <GridCell width="1-1">
                        <Pagination totalElements={this.state.accounts.totalElements}
                                    page={this.state.pageNumber}
                                    totalPages={this.state.pageCount}
                                    onPageChange={(pageNumber) => this.searchAccounts(pageNumber)}
                                    range={10}/>
                    </GridCell>
                </Card>
            );

        }

    }

    render(){
        return(
            <div>
                <LoadingIndicator busy={this.state.busy}/>
                <PageHeader title="Account Operations" />
                <Card>
                    <Form ref = {c => this.form = c}>
                        <Grid>
                            <GridCell width="1-4">
                                <DropDown options = {this.state.countries} label="Country" valueField="iso"
                                          value = {this.state.searchCriteria.countryCode}
                                          uppercase = {{locale: "en"}}
                                          onchange = {(value) => this.updateSearchCriteria("countryCode", value)}/>
                            </GridCell>
                            <GridCell width="1-4">
                                <TextInput label="City"
                                           value={this.state.searchCriteria.city}
                                           onchange={(value) => this.updateSearchCriteria("city", value)}/>
                            </GridCell>
                            <GridCell width="1-4">
                                <TextInput label="District"
                                           value={this.state.searchCriteria.district}
                                           maxLength= "40"
                                           onchange={(value) => this.updateSearchCriteria("district", value)}/>
                            </GridCell>
                            <GridCell width="1-4">
                                <DropDown options = {this.state.accountTypes} label="Type"
                                          value = {this.state.searchCriteria.accountType}
                                          onchange = {(value) => this.updateSearchCriteria("accountType", value)}/>
                            </GridCell>
                            <GridCell width="1-4">
                                <DropDown options = {this.state.parentSectors} label="Parent Sector"
                                          value = {this.state.searchCriteria.parentSector} valueField="code"
                                          onchange = {(parentSector) => this.updateParentSector(parentSector)}/>
                            </GridCell>
                            <GridCell width="1-4">
                                <DropDown options = {this.state.subSectors} label="Sub Sector"
                                          value = {this.state.searchCriteria.subSector} valueField="code"
                                          onchange = {(value) => this.updateSearchCriteria("subSector", value)}/>
                            </GridCell>
                            <GridCell width="1-4">
                                <DropDown options = {this.state.segmentTypes} label="Segment"
                                          value = {this.state.searchCriteria.segmentType}
                                          onchange = {(value) => this.updateSearchCriteria("segmentType", value)}/>
                            </GridCell>
                            <GridCell width="1-4">
                                <DropDown options={this.context.getAllUsers()} label="Account Owner"
                                          labelField = "displayName" valueField="username"
                                          value={this.state.searchCriteria.accountOwner}
                                          onchange = {(value) => this.updateSearchCriteria("accountOwner", value)}/>
                            </GridCell>
                            <GridCell width="2-4">
                                <AccountSearchAutoComplete label="Account"
                                                           value={this.state.searchCriteria.account}
                                                           onchange={(value) => this.updateSearchCriteria("account", value)}
                                                           onclear={() => this.updateSearchCriteria("account", null)}/>
                            </GridCell>
                            <GridCell width="1-4">
                                <Date label="Min Creation Date"
                                      value={this.state.searchCriteria.minCreationDate} hideIcon={true}
                                      onchange={(value) => this.updateSearchCriteria("minCreationDate", value)} />
                            </GridCell>
                            <GridCell width="1-4">
                                <Date label="Max Creation Date"
                                      value={this.state.searchCriteria.maxCreationDate} hideIcon={true}
                                      onchange={(value) => this.updateSearchCriteria("maxCreationDate", value)} />
                            </GridCell>
                        </Grid>
                        <Grid>
                            <GridCell width="1-1">
                                <div className="uk-align-right">
                                    <Button label="Clear" style = "primary" size="small"
                                            onclick = {() => this.setState({searchCriteria: {}, noResult: "", accounts: {content:null}})}/>
                                    <Button label="Search" style = "success" size="small"
                                            onclick = {() => this.searchAccounts(1)}/>
                                </div>
                            </GridCell>
                        </Grid>
                    </Form>
                </Card>
                {this.renderDataTable()}
                {this.renderAccountOwnerModal()}
                {this.renderSegmentModal()}
                {this.renderAccountTypeModal()}
            </div>
        );

    }
}

class TruncatePrinter {
    constructor(field, length) {
        this.field = field;
        this.length = length || 25;
    }
    printUsingRow(row, data) {
        return <div >{TruncatePrinter.truncatedValue(_.get(row, this.field),this.length)}</div>
    }
    static truncatedValue(value, length){
        if(value && value.length > length){
            value = value.substring(0, length) + "..";
        }
        return value;
    }
}

AccountOperations.contextTypes = {
    getUsers: PropTypes.func,
    getAllUsers: PropTypes.func,
    router: PropTypes.object.isRequired
};
