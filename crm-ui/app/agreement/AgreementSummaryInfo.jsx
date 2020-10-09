import React from 'react';
import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, Pagination} from 'susam-components/layout';
import * as DataTable from 'susam-components/datatable';
import { Button, Notify} from 'susam-components/basic';
import PropTypes from 'prop-types';
import { AgreementService } from '../services';
import { ActionHeader } from '../utils';

export class AgreementSummaryInfo extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state={
            searchResult: { content: null },
            ready: false,
        };
    }

    componentDidMount() {
        this.setState({searchParams: this.getInitialSearchParams()}, () => this.search(1));
    }

    getInitialSearchParams() {
        return {};
    }

    search(pageNumber) {
        let params = {
            page: pageNumber - 1,
            size: 10,
            accountId: this.props.account.id
        };

        AgreementService.search(params).then(response => {
            this.setState({
                searchResult: response.data,
                pageNumber: pageNumber,
                pageCount: response.data.totalPages,
                ready: true
            });
        });
    }

    view(data) {
        window.open(`/ui/crm/agreement/view/${data.id}?viewer=agreementListView`, "_blank")
    }

    render(){
        return(
            <GridCell width="1-1">        
            <DataTable.Table data={this.state.searchResult.content}>
            <DataTable.Text header="Number" field="number" />
            <DataTable.Text header="Name" maxLength="10" field="name"/>
            <DataTable.Text header="Start Date" field="startDate"/>
            <DataTable.Text header="End Date" field="endDate"/>
            <DataTable.Text header="Service Areas" field="serviceAreas" printer = {new ListPrinter()} />
            <DataTable.ActionColumn>
                <DataTable.ActionWrapper track="onclick" onaction={(data) => this.view(data)}>
                    <Button icon="eye" size="small"/>
                </DataTable.ActionWrapper>
            </DataTable.ActionColumn>
             </DataTable.Table>
            <GridCell width="1-1">
            <Pagination totalElements={this.state.searchResult.totalElements}
                     page={this.state.pageNumber}
                     totalPages={this.state.pageCount}
                     onPageChange={(pageNumber) => this.search(pageNumber)}
                     range={10}/>
            </GridCell>
            </GridCell>

        );
    }

}

AgreementSummaryInfo.contextTypes = {
    router: React.PropTypes.object,
    translator: PropTypes.object
};

class ListPrinter {
    print(data) {
        let nameArr = [];
        data.map(item => nameArr.push(item.name));
        return <div key={uuid.v4()}>{nameArr.join(",")}</div>;
    }
}