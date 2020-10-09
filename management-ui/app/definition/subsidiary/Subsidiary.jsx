import React from "react";
import _ from "lodash";
import uuid from 'uuid';
import * as axios from "axios";

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card, Loader, CardHeader, PageHeader} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown, Checkbox, Form} from "susam-components/basic";
import {CompanySearchAutoComplete} from "susam-components/oneorder";
import * as DataTable from 'susam-components/datatable';

import {AuthorizationService, KartoteksService} from "../../services";

export class Subsidiary extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            originalData: {},
            name: null,
            companies: [],
            defaultInvoiceCompany: null,
            newCompany: null
        };
    }

    componentDidMount() {
        let id = !_.isNil(this.props.location.query.id) ? this.props.location.query.id : null;
        this.init(id);
    }

    init(id) {
        if (!_.isNil(id)) {
            this.getSubsidiary(id, (subsidiary) => {
                this.setState({
                    originalData: subsidiary,
                    name: subsidiary.name,
                    companies: this.sortCompanies(subsidiary.companies),
                    defaultInvoiceCompany: subsidiary.defaultInvoiceCompany
                });
            });
        } else {
            this.setState({
                originalData: {},
                name: null,
                companies: [],
                defaultInvoiceCompany: null
            });
        }
    }

    getSubsidiary(id, callback) {
        AuthorizationService.getSubsidiary(id).then(response => {
            callback(response.data);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    saveSubsidiary(subsidiary, callback) {
        AuthorizationService.saveSubsidiary(subsidiary).then(response => {
            callback(response.data);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    sortCompanies(companies) {
        return _.sortBy(companies, ["name"]);
    }

    isDefaultInvoiceCompany(company) {
        let defaultInvoiceCompany = this.state.defaultInvoiceCompany;
        return (defaultInvoiceCompany && defaultInvoiceCompany.id == company.id);
    }

    updateName(value) {
        this.setState({name: value});
    }

    updateDefaultInvoiceCompany(value) {
        this.setState({defaultInvoiceCompany: value});
    }

    updateNewCompany(value) {
        this.setState({newCompany: value});
    }

    handleAddNewCompanyClick() {

        let goon = true;
        let newCompany = _.cloneDeep(this.state.newCompany);
        let companies = _.cloneDeep(this.state.companies);

        if (!newCompany) {
            goon = false;
            Notify.showError("A company must be specified.");
        }

        if (goon) {
            let match = _.find(companies, (elem) => {
                return elem.id == newCompany.id;
            });
            if (match) {
                goon = false;
                Notify.showError("Specified company is already added.");
            }
        }

        if (goon) {
            companies.push(newCompany);
            this.setState({companies: this.sortCompanies(companies), newCompany: null});
        }
    }

    handleDeleteCompanyClick(data) {
        Notify.confirm("Are you sure?", () => {
            let companies = _.cloneDeep(this.state.companies);
            let defaultInvoiceCompany = _.cloneDeep(this.state.defaultInvoiceCompany);
            _.remove(companies, (elem) => {
                return elem.id == data.id;
            });
            if (defaultInvoiceCompany && defaultInvoiceCompany.id == data.id) {
                defaultInvoiceCompany = null;
            }
            this.setState({companies: companies, defaultInvoiceCompany: defaultInvoiceCompany});
        });
    }

    handleReturnToListClick() {
        this.context.router.push('/ui/management/subsidiaries');
    }

    handleSaveClick() {

        let goon = true;
        let state = _.cloneDeep(this.state);
        let originalData = state.originalData;
        let name = state.name;
        let companies = state.companies;
        let defaultInvoiceCompany = state.defaultInvoiceCompany;

        if (!name || name.trim().length == 0) {
            goon = false;
            Notify.showError("A name must be specified.");
        }

        if (goon && companies.length == 0) {
            goon = false;
            Notify.showError("At least one company must be specified.");
        }

        if (goon && !defaultInvoiceCompany) {
            goon = false;
            Notify.showError("A default invoice company must be specified.");
        }

        if (goon) {
            originalData.name = name;
            originalData.companies = companies;
            originalData.defaultInvoiceCompany = defaultInvoiceCompany;
            this.saveSubsidiary(originalData, (responseData) => {
                Notify.showSuccess("Subsidiary saved.");
                this.init(responseData.id);
            });
        }
    }

    renderCompanines(companies) {
        if (companies.length == 0) {
            return null;
        } else {
            return (
                <GridCell width="1-1" noMargin={true}>
                    <DataTable.Table data={companies}>
                        <DataTable.Text width="10" header="Company Id" field="id"/>
                        <DataTable.Text header="Company Name" field="name"/>
                        <DataTable.Text header="Default Invoice Company"
                                        reader={new DefaultInvoiceCompanyReader(this)}
                                        printer={new DefaultInvoiceCompanyPrinter(this)}
                                        center={true}>
                            <DataTable.FilterWrapper/>
                        </DataTable.Text>
                        <DataTable.ActionColumn>
                            <DataTable.ActionWrapper track="onclick" onaction={(data) => {this.handleDeleteCompanyClick(data)}}>
                                <Button label="Delete" flat={true} style="danger" size="small"/>
                            </DataTable.ActionWrapper>
                        </DataTable.ActionColumn>
                    </DataTable.Table>
                </GridCell>
            );
        }
    }

    render() {
        return (
            <Grid>
                <GridCell width="1-1">
                    <PageHeader title={_.isNil(this.state.originalData.id) ? "New Subsidiary" : "Subsidiary"}/>
                </GridCell>
                <GridCell width="1-1" noMargin={true}>
                    <Card>
                        <Grid>
                            <GridCell width="1-1">
                                <TextInput label="Subsidiary Name"
                                           value={this.state.name}
                                           onchange={(value) => this.updateName(value)}/>
                            </GridCell>
                        </Grid>
                    </Card>
                </GridCell>
                <GridCell width="1-1">
                    <Card title="Companies">
                        <Grid>
                            {this.renderCompanines(this.state.companies)}
                            <GridCell width="1-1" hidden={this.state.companies.length == 0}/>
                            <GridCell width="4-5">
                                <CompanySearchAutoComplete label="New Company"
                                                           value={this.state.newCompany}
                                                           onchange={(value) => this.updateNewCompany(value)}
                                                           onclear={() => this.updateNewCompany(null)}/>
                            </GridCell>
                            <GridCell width="1-5">
                                <Button label="Add" style="success" size="small" waves={true} onclick={() => this.handleAddNewCompanyClick()}/>
                            </GridCell>
                        </Grid>
                    </Card>
                </GridCell>
                <GridCell width="1-1">
                    <div className="uk-align-right">
                        <Button label="Return To List" waves={true} onclick={() => this.handleReturnToListClick()}/>
                        <Button label="Save" style="primary" waves={true} onclick={() => this.handleSaveClick()}/>
                    </div>
                </GridCell>
            </Grid>
        );
    }
}

Subsidiary.contextTypes = {
    router: React.PropTypes.object.isRequired
};

class DefaultInvoiceCompanyReader {

    constructor(callingComponent) {
        this.callingComponent = callingComponent;
    }

    readCellValue(row) {
        return row;
    };

    readSortValue(row) {
        return this.callingComponent.isDefaultInvoiceCompany(row);
    };
}

class DefaultInvoiceCompanyPrinter {

    constructor(callingComponent) {
        this.callingComponent = callingComponent;
    }

    print(data) {
        return (
            <Checkbox value={this.callingComponent.isDefaultInvoiceCompany(data)}
                      onchange={(value) => { value ? this.callingComponent.updateDefaultInvoiceCompany(data) : this.callingComponent.updateDefaultInvoiceCompany(null)}}
                      inline={true}
                      noMargin={true}/>
        );
    }
}