import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Notify } from 'susam-components/basic';
import { LoaderWrapper, PageHeader } from 'susam-components/layout';
import { ExportQuoteQueueService } from '../services/QuoteQueueService';
import { QuoteExportQueueFilter } from './QuoteExportQueueFilter';
import { QuoteExportQueueList } from './QuoteExportQueueList';

export class QuoteExportQueue extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {
            filter: this.initFilter(),
            searchResult: { content: null }
        }
    }

    initFilter() {
        let filter = {
            page: 0,
            pageSize: 20,
            status: null,
            quoteNumber: null,
            minCreateDate: null,
            maxCreateDate: null
        }
        return filter;
    }

    onSearch(filter) {
        this.setState({ isSearchBusy: true });
        ExportQuoteQueueService.search(filter).then(response => {
            this.setState({ searchResult: response.data, isSearchBusy: false });
        }).catch(error => {
            this.setState({ isSearchBusy: false });
            Notify.showError(error);
        });
        this.setState({ filter: filter });
    }

    onHandleRequeue(row) {
        ExportQuoteQueueService.requeue(row.id).then(response => {
            Notify.showSuccess("Execute scheduled");
            this.onSearch(this.state.filter);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    onHandlePageChange(page) {
        let filter = _.cloneDeep(this.state.filter);
        filter.page = page - 1;
        this.onSearch(filter);
    }

    render() {
        return (
            <div>
                <PageHeader title={"Export Quote Queue"} />
                <QuoteExportQueueFilter filter={this.state.filter} onSearch={(filter) => this.onSearch(filter)} />
                <LoaderWrapper busy={this.state.isSearchBusy}>
                    <QuoteExportQueueList data={this.state.searchResult}
                        onRequeue={(row) => this.onHandleRequeue(row)}
                        onPageChange={page => this.onHandlePageChange(page)} />
                </LoaderWrapper>
            </div>
        );
    }
}