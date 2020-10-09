import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, Notify } from "susam-components/basic";
import { Card, Grid, GridCell, LoaderWrapper, PageHeader } from "susam-components/layout";
import { HSCodeService } from '../services/HSCodeService';
import { Filter } from './Filter';
import { HSCodeDetailModal } from './HSCodeDetailModal';
import { HSCodeTable } from './HSCodeTable';

export class HSCode extends TranslatingComponent {

    language = navigator.language || navigator.userLanguage;

    constructor(props) {
        super(props);
        this.state = {
            filter: this.initFilter(),
            searchResult: { content: null },
        };
    }

    initFilter() {
        let filter = {
            page: 0,
            pageSize: 20,
            name: null,
            code: null
        }
        return filter;
    }

    search(filter) {
        this.setState({ isSearchBusy: true }, () => {
            HSCodeService.search(filter).then(response => {
                this.setState({
                    searchResult: response.data,
                    filter: filter,
                    isSearchBusy: false
                });
            }).catch(error => {
                Notify.showError(error);
                this.setState({ isSearchBusy: false });
            });
        });

    }

    handleNewItem() {
        this.handleEditItem();
    }

    handleEditItem(item) {
        this.detailModal.open(item);
    }

    handleDeleteItem(item) {
        item && HSCodeService.delete(item).then(response => {
            Notify.showSuccess("HS Code is deleted");
            this.search(this.state.filter);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    onHandlePageChange(page) {
        let filter = _.cloneDeep(this.state.filter);
        filter.page = page - 1;
        this.search(filter);
    }

    render() {
        return (
            <div>
                <PageHeader title="Definition of Goods"  translate={true}  />
                <Card>
                    <Grid>
                        <GridCell width="1-1" noMargin={true}>
                            <div className="uk-align-right uk-margin-top">
                                <Button label="Create New" size="small" style="success" onclick={() => this.handleNewItem()} />
                            </div>
                        </GridCell>
                        <GridCell width="1-1">
                            <div lang={this.language}>
                                <Filter filter={this.state.filter} onSearch={(filter) => this.search(filter)} />
                            </div>
                        </GridCell>
                        <GridCell width="1-1">
                            <LoaderWrapper busy={this.state.isSearchBusy}>
                                <HSCodeTable data={this.state.searchResult}
                                    onEdit={(item) => this.handleEditItem(item)}
                                    onDelete={(item) => this.handleDeleteItem(item)}
                                    onPageChange={(page) => this.onHandlePageChange(page)} />
                            </LoaderWrapper>
                        </GridCell>
                    </Grid>
                </Card>
                <HSCodeDetailModal ref={c => this.detailModal = c} onSave={() => this.search(this.state.filter)} />
            </div>
        );
    }
}