import PropTypes from "prop-types";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, DropDown, Notify, TextInput } from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';
import { Grid, GridCell, LoaderWrapper, Page, Pagination } from "susam-components/layout";
import { CustomsOfficeService } from '../../../services/LocationService';

export class CustomsOfficeList extends TranslatingComponent {

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
        let yesNoOptions = [
            { id: "true", name: "Yes" },
            { id: "false" , name: "No" }
        ];
        this.setState({ lookup: { yesNoOptions: yesNoOptions } });
    }

    search() {
        this.setState({ busy: true });
        CustomsOfficeService.search(this.state.searchTerms).then(response => {
            this.setState({ list: response.data, busy: false });
        }).catch(error => {
            this.setState({ busy: false });
            Notify.showError(error);
        });
    }

    handleCreate() {
        this.context.router.push('/ui/management/customs-office-edit');
    }

    handleEdit(item) {
        this.context.router.push('/ui/management/customs-office-edit?id=' + item.id);
    }

    handleDelete(item) {
        Notify.confirm("You are about to delete this customs office. Are you sure?", () => {
            CustomsOfficeService.delete(item).then(response => {
                Notify.showSuccess("Customs office deleted");
                this.loadPlaces();
            }).catch(error => {
                Notify.showError(error);
            });
        });
    }

    updateSearchTerms(key, value) {
        let searchTerms = _.cloneDeep(this.state.searchTerms);
        console.log(value);
        _.set(searchTerms, key, value);
        if ('page' !== key) {
            _.set(searchTerms, 'page', 0);
        }
        this.setState({ searchTerms, searchTerms }, () => this.search());
    }

    render() {
        let title = super.translate("Customs Offices");

        return (
            <Page title={title} toolbarItems={[
                { name: "Create", library: "material", icon: "note_add", onclick: () => this.handleCreate(), inDropdown: false }]}>
                <Grid>
                    <GridCell width="3-10" noMargin={true}>
                        <TextInput
                            value={this.state.searchTerms.name}
                            onchange={value => this.updateSearchTerms('name', value.toLocaleUpperCase(navigator.language))} />
                    </GridCell>
                    <GridCell width="2-10" noMargin={true}>
                        <TextInput
                            value={this.state.searchTerms.localName}
                            onchange={value => this.updateSearchTerms('localName', value.toLocaleUpperCase(navigator.language))} />
                    </GridCell>
                    <GridCell width="1-10" noMargin={true}>
                        <TextInput
                            value={this.state.searchTerms.customsCode}
                            onchange={value => this.updateSearchTerms('customsCode', value.toLocaleUpperCase(navigator.language))} />
                    </GridCell>
                    <GridCell width="1-10" noMargin={true}>
                        <DropDown
                            translate={true}
                            onchange={value => this.updateSearchTerms('borderCustoms', value && value.id)}
                            options={this.state.lookup.yesNoOptions}
                            value={{id: this.state.searchTerms.borderCustoms}} />
                    </GridCell>
                    <GridCell width="1-10" noMargin={true}>
                        <DropDown
                            translate={true}
                            onchange={value => this.updateSearchTerms('freeZone', value && value.id)}
                            options={this.state.lookup.yesNoOptions}
                            value={{id: this.state.searchTerms.freeZone}} />
                    </GridCell>
                    <GridCell width="2-10" noMargin={true} />
                    <GridCell width="1-1" noMargin={true}>
                        <LoaderWrapper busy={this.state.busy} title="Loading customs offices">
                            <div>
                                <DataTable.Table data={this.state.list && this.state.list.content} sortable={false}>
                                    <DataTable.Text width="30" field="name" header="Name" />
                                    <DataTable.Text width="20" field="localName" header="Local Name" />
                                    <DataTable.Text width="10" field="customsCode" header="Customs Code" />
                                    <DataTable.Bool width="10" field="borderCustoms" header="Is Border" />
                                    <DataTable.Bool width="10" field="freeZone" header="Is Free Zone" />
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
CustomsOfficeList.contextTypes = {
    router: PropTypes.object.isRequired,
    translator: PropTypes.object
};