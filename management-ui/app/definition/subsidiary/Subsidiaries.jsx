import React from "react";
import _ from "lodash";
import uuid from 'uuid';
import * as axios from "axios";

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card, Loader, CardHeader, PageHeader} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown, Form} from "susam-components/basic";
import * as DataTable from 'susam-components/datatable';

import {AuthorizationService, KartoteksService} from "../../services";

export class Subsidiaries extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            subsidiaries: []
        };
    }

    componentDidMount() {
        this.getSubsidiaries((subsidiaries) => {
            this.setState({subsidiaries: this.sortSubsidiaries(subsidiaries)});
        });
    }

    getSubsidiaries(callback) {
        AuthorizationService.getSubsidiaries().then(response => {
            callback(response.data);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    sortSubsidiaries(subsidiaries) {
        return _.sortBy(subsidiaries, ["name"]);
    }

    handleCreateNewClick() {
        this.context.router.push('/ui/management/subsidiary');
    }

    handleEditClick(value) {
        this.context.router.push('/ui/management/subsidiary?id=' + value.id);
    }

    handleDeleteClick(data) {
        Notify.confirm("Are you sure?", () => {
            AuthorizationService.deleteSubsidiary(data.id).then(response => {
                Notify.showSuccess("Subsidiary deleted.");
                let subsidiaries = _.cloneDeep(this.state.subsidiaries);
                _.remove(subsidiaries, (elem) => {
                    return elem.id == data.id;
                });
                this.setState({subsidiaries: subsidiaries});
            }).catch(error => {
                Notify.showError(error);
            });
        });
    }

    render() {
        return (
            <Grid>
                <GridCell width="1-1">
                    <PageHeader title="Subsidiaries"/>
                </GridCell>
                <GridCell width="1-1">
                    <Card toolbarItems={[{icon:"plus", action: () => this.handleCreateNewClick()}]}>
                        <Grid>
                            <GridCell width="1-1" noMargin={true}>
                                <DataTable.Table data={this.state.subsidiaries}>
                                    <DataTable.Text header="Name" field="name"/>
                                    <DataTable.Text header="Companies" field="companies" printer={new CompaniesPrinter()}/>
                                    <DataTable.Text header="Default Invoice Company" field="defaultInvoiceCompany.name"/>
                                    <DataTable.ActionColumn>
                                        <DataTable.ActionWrapper track="onclick" onaction={(data) => {this.handleEditClick(data)}}>
                                            <Button label="Edit" flat={true} style="success" size="small"/>
                                        </DataTable.ActionWrapper>
                                        <DataTable.ActionWrapper track="onclick" onaction={(data) => {this.handleDeleteClick(data)}}>
                                            <Button label="Delete" flat={true} style="danger" size="small"/>
                                        </DataTable.ActionWrapper>
                                    </DataTable.ActionColumn>
                                </DataTable.Table>
                            </GridCell>
                        </Grid>
                    </Card>
                </GridCell>
            </Grid>
        );
    }
}

Subsidiaries.contextTypes = {
    router: React.PropTypes.object.isRequired
};

class CompaniesPrinter {
    print(data) {
        if (data && data.length > 0) {
            let companyNames = [];
            data.forEach((elem) => {
                companyNames.push(elem.name);
            });
            companyNames = _.sortBy(companyNames, [(elem) => {return elem;}]);
            return companyNames.join(", ");
        } else {
            return "";
        }
    }
}