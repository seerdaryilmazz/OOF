import React from "react";
import PropTypes from 'prop-types';
import _ from "lodash";

import { TranslatingComponent } from 'susam-components/abstract';
import { Card, Grid, GridCell, PageHeader, CardHeader, LoaderWrapper } from "susam-components/layout";
import { CrmAccountService, CompanyService, CrmSearchService } from "../services";
import { Span, Notify, TextInput, Button } from "susam-components/basic";

import * as DataTable from 'susam-components/datatable';

export class AccountMerge extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.getAccountItem(this.props.params.itemId);
    }

    getAccountItem(accountId) {
        CrmAccountService.getAccountById(accountId).then(response => {
            let account = response.data;
            this.setState({ account: account });
            return CompanyService.getDefaultLocation(account.company.id);
        }).then(response=>{
            let item = response.data;
            let address = item.postaladdress.country.iso + "-" + item.postaladdress.postalCode + "," + item.postaladdress.city + " " + item.postaladdress.streetName;
            this.setState({ accountDefaultAddress: address });
        }).catch(error => {
            Notify.showError(error);
        });
    }

    render() {
        let content = null;
        if (this.state.startedBy) {
            content = this.renderWarning();
        } else {
            let search = null;
            if (this.state.account) {
                search = <SearchResults account={this.state.account}
                    item={this.state.item} />;
            }
            content = <Card> {search} </Card>;
        }
        return (
            <div>
                <PageHeader title="Account Merge" />
                <Card>
                    <CardHeader title="Account Information" />
                    <Grid>
                        <GridCell width="1-4">
                            <Span label="Name" value = {_.get(this.state, "account.name")} />
                        </GridCell>
                        <GridCell width="1-8">
                            <Span label="Country" value = {_.get(this.state, "account.country.iso")} />
                        </GridCell>
                        <GridCell width="1-8">
                            <Span label="Type" value = {_.get(this.state, "account.accountType.name")} />
                        </GridCell>
                        <GridCell width="1-8">
                        <Span label="Segment" value = {_.get(this.state, "account.segment.name")} />
                        </GridCell>
                        <GridCell width="1-8">
                        <Span label="Account Owner" value = {_.get(this.state, "account.accountOwner")} />
                        </GridCell>
                        <GridCell width="1-4">
                        <Span label="Default Location" value = {_.get(this.state, "accountDefaultAddress")} />
                        </GridCell>
                    </Grid>
                </Card>
                 {content} 
            </div>
        );
    }


}


class SearchResults extends React.Component {
    constructor(props) {
        super(props);
        this.state = { searchResults: {} };
    }

    componentDidMount() {
        if (this.props.account) {
            this.setState({ textToSearch: this.props.account.name });
            this.resetAndSearch(this.props.account.name);
        }
    }

    buildSearchParams(accountName) {
        return { q: accountName, size: 10, page: 1 };
    }

    resetAndSearch(accountName) {
        let params = this.buildSearchParams(accountName);
        this.search(params);
    }
    search(params){
        this.setState({busy: true});
        CrmSearchService.moreLikeThis(params).then(response => {
            let searchResults = response.data;
            _.remove(searchResults.content, {id: this.props.account.id});
            this.setState({searchResults: searchResults, busy: false});
        }).catch(error => {
            this.setState({busy: false});
            Notify.showError(error);
        });
    }

    handleMergeClick(newAccount) {

        this.context.router.push('/ui/crm/account/' + this.props.account.id+ '/merge-with-account/' + newAccount.id);

    }

    render() {
        return (
            <Grid>
                <GridCell width="1-1" noMargin={true}>
                    <CardHeader title="Account Search" />
                </GridCell>
                <GridCell width="1-4">
                    <TextInput label="Search Text" value={this.state.textToSearch} onchange={(value) => this.setState({ textToSearch: value })} />
                </GridCell>
                <GridCell width="3-4" verticalAlign="bottom">
                    <Button label="search" flat={false} style="success" onclick={() => this.resetAndSearch(this.state.textToSearch, null, null)} />
                </GridCell>
                <GridCell width="1-1">
                    <LoaderWrapper title="Searching" busy={this.state.busy}>
                        <DataTable.Table data={this.state.searchResults.content}
                            editable={false} insertable={false} filterable={false} sortable={false}>
                            <DataTable.Text field="name" header="Company Name" width="30"
                                classNameProvider={new ValueMatchBgChanger(this.props.account.name)} />
                            <DataTable.Text field="country.name" header="Country" width="10"
                                classNameProvider={new ValueMatchBgChanger(this.props.account.country.iso)} />
                            <DataTable.Text field="accountType.name" header="Type" width="10"
                                classNameProvider={new ValueMatchBgChanger(this.props.account.accountType.name)} />
                            <DataTable.Text field="segment.name" header="Segment" width="10"
                                classNameProvider={new ValueMatchBgChanger(this.props.account.segment.name)} />
                            <DataTable.Text field="accountOwner" header="Account Owner" width="30"
                                classNameProvider={new ValueMatchBgChanger(this.props.account.accountOwner)} />
                            <DataTable.Text field="accountDefaultAddress" header="Default Location" width="20" />
                            <DataTable.ActionColumn width="10">
                                <DataTable.ActionWrapper track="onclick" onaction={(data) => this.handleMergeClick(data)}>
                                    <Button label="merge" flat={true} style="primary" size="small" />
                                </DataTable.ActionWrapper>
                            </DataTable.ActionColumn>
                        </DataTable.Table>
                    </LoaderWrapper>
                </GridCell>
            </Grid>
        );
    }
}
class ItemDetails extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        
        return (
            <Grid>
                <GridCell width="1-1" noMargin={true}><CardHeader title="Account Information" /></GridCell>
                <GridCell width="3-10"><Span label="Name" value={this.props.account.name} /></GridCell>
                <GridCell width="1-10"><Span label="Country" value={this.props.account.country.iso} /></GridCell>
                <GridCell width="1-10"><Span label="Type" value={this.props.account.type} /></GridCell>
                <GridCell width="1-10"><Span label="Segment" value={this.props.account.segment} /></GridCell>
                <GridCell width="1-10"><Span label="Account Owner" value={this.props.account.accountOwner} /></GridCell>
                <GridCell width="3-10"><Span label="Default Location" value={this.stae.accountDefaultAddress} /></GridCell>
                <GridCell width="1-10">
                 
                </GridCell>
            </Grid>
        );
    }
}

class ValueMatchBgChanger {
    constructor(value) {
        this.value = value;
    }
    classNames(data) {
        if (data == this.value) {
            return "md-bg-light-green-100";
        }
        return "";
    }
}
 class DefaultLocationReader {
    readCellValue(row) {
        let address = "";
        row.locations.forEach(item => {
            if (item.default) {
                address = item.countryCode + "-" + item.postalCode + "," + item.city + " " + item.streetName;
            }
        });
        return address;
    };

    readSortValue(row) {
        return "";
    };
}


ItemDetails.contextTypes = {
    router: PropTypes.object.isRequired
};
SearchResults.contextTypes = {
    router: PropTypes.object.isRequired
};
AccountMerge.contextTypes = {
    router: PropTypes.object.isRequired
};