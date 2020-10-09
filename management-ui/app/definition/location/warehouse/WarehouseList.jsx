import * as axios from "axios";
import _ from "lodash";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, DropDown, Notify, TextInput } from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';
import { Grid, GridCell, Page, Pagination } from "susam-components/layout";
import { LoaderWrapper } from "susam-components/layout/Loader";
import { CustomerWarehouseService, LocationService } from "../../../services/LocationService";
import { WarehouseService } from '../../../services/WarehouseService';

export class WarehouseList extends TranslatingComponent {
    state = {
        lookup: {},
        searchTerms: {},
        list: {}
    };

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.initLookups();
        this.search();
    }

    initLookups() {
        axios.all([
            LocationService.retrieveCountries(),
            CustomerWarehouseService.listCustomsTypes()
        ]).then(axios.spread((country, customsType) => {
            this.setState({
                lookup: {
                    countryOptions: country.data,
                    customsTypeOptions: customsType.data
                }
            })
        }));
    }

    search() {
        this.setState({ busy: true });
        WarehouseService.search(this.state.searchTerms).then(response => {
            this.setState({ list: response.data, busy: false });
        }).catch(error => {
            this.setState({ busy: false });
            Notify.showError(error);
        });
    }

    loadWarehouses() {
        this.setState({ busy: true });
        WarehouseService.list().then(response => {
            this.setState({ list: response.data, busy: false });
        }).catch(error => {
            this.setState({ busy: false });
            Notify.showError(error);
        });
    }

    handleCreate() {
        this.context.router.push('/ui/management/warehouse-edit');
    }

    handleEdit(item) {
        this.context.router.push('/ui/management/warehouse-edit?id=' + item.id);
    }

    handleDelete(item) {
        Notify.confirm("You are about to delete this customer warehouse. Are you sure?", () => {
            WarehouseService.delete(item.id).then(response => {
                Notify.showSuccess("Warehouse deleted");
                this.search();
            }).catch(error => {
                Notify.showError(error);
            });
        });
    }

    updateSearchTerms(key, value) {
        let searchTerms = _.cloneDeep(this.state.searchTerms);
        _.set(searchTerms, key, value);
        if('page' !== key){
            _.set(searchTerms, 'page', 0);
        }
        this.setState({ searchTerms, searchTerms }, () => this.search());
    }

    render() {
        let title = super.translate("Warehouses");

        return (
            <Page title={title} toolbarItems={[
                { name: "Create", library: "material", icon: "note_add", onclick: () => this.handleCreate(), inDropdown: false }]}>
                <Grid>
                    <GridCell width="2-5" noMargin={true}>
                        <TextInput
                            value={this.state.searchTerms.companyLocationName}
                            onchange={value => this.updateSearchTerms('companyLocationName', value.toLocaleUpperCase(navigator.language))} />
                    </GridCell>
                    <GridCell width="1-5" noMargin={true}>
                        <DropDown
                            onchange={value => this.updateSearchTerms('country', value)}
                            options={this.state.lookup.countryOptions}
                            value={this.state.searchTerms.country} />
                    </GridCell>
                    <GridCell width="1-5" noMargin={true}>
                        <DropDown
                            onchange={value => this.updateSearchTerms('customsType', value)}
                            options={this.state.lookup.customsTypeOptions}
                            value={this.state.searchTerms.customsType} />
                    </GridCell>
                    <GridCell width="1-5" noMargin={true} />
                    <GridCell width="1-1" noMargin={true}>
                        <LoaderWrapper busy={this.state.busy} title="Loading warehouses">
                            <div>
                                <DataTable.Table data={this.state.list && this.state.list.content} sortable={false} >
                                    <DataTable.Text width="40" sortable={true} field="companyLocation.name" header="Name" />
                                    <DataTable.Text width="20" sortable={true} field="establishment.address.country.name" header="Country" />
                                    <DataTable.Text width="20" sortable={true} field="customsDetails.customsType.name" header="Operation Type" />
                                    <DataTable.ActionColumn width="20">
                                        <DataTable.ActionWrapper track="onclick" onaction={(data) => this.handleEdit(data)}>
                                            <Button label="Edit" flat={true} style="success" size="small" />
                                        </DataTable.ActionWrapper>
                                        <DataTable.ActionWrapper track="onclick" onaction={(data) => this.handleDelete(data)}>
                                            <Button label="Delete" flat={true} style="danger" size="small" />
                                        </DataTable.ActionWrapper>
                                    </DataTable.ActionColumn>
                                </DataTable.Table>
                                <Pagination
                                    page={this.state.list.number + 1}
                                    totalElements={this.state.list.totalElements}
                                    totalPages={this.state.list.totalPages}
                                    onPageChange={page => this.updateSearchTerms('page', page - 1)} />
                            </div>
                        </LoaderWrapper>
                    </GridCell>
                </Grid>
            </Page>
        );
    }
}
WarehouseList.contextTypes = {
    router: React.PropTypes.object.isRequired
};