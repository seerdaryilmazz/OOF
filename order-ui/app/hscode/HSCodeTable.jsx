import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Button } from "susam-components/basic";
import * as DataTable from 'susam-components/datatable';
import { CardHeader, Pagination } from "susam-components/layout";

export class HSCodeTable extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = { filter: {}, values: {} };
    }

    handleEditClick(item) {
        this.props.onEdit && this.props.onEdit(item);
    }

    handleDeleteClick(item) {
        this.props.onDelete && this.props.onDelete(item);
    }

    onPageChange(page) {
        this.props.onPageChange && this.props.onPageChange(page);
    }

    render() {
        return (
            <div>
                <div>
                    <CardHeader title="Goods" />
                </div>
                <div>
                    <DataTable.Table
                        ref={(c) => this.datatable = c}
                        data={this.props.data && this.props.data.content}
                        sortable={false}>
                        <DataTable.Text field="name" width="50" sortable={true} header="Name" />
                        <DataTable.Text field="code" width="40" sortable={true} header="HS Code" />
                        <DataTable.ActionColumn >
                            <DataTable.ActionWrapper track="onclick" onaction={(item) => { this.handleEditClick(item) }}>
                                <Button label="Edit" flat={true} style="success" size="small" />
                            </DataTable.ActionWrapper>
                        </DataTable.ActionColumn>
                        <DataTable.ActionColumn >
                            <DataTable.ActionWrapper track="onclick" onaction={(item) => { this.handleDeleteClick(item) }}>
                                <Button label="Delete" flat={true} style="danger" size="small" />
                            </DataTable.ActionWrapper>
                        </DataTable.ActionColumn>
                    </DataTable.Table>
                    <Pagination
                            page={this.props.data.number+1}
                            totalElements={this.props.data.totalElements}
                            totalPages={this.props.data.totalPages}
                            onPageChange={page => this.onPageChange(page)} />
                </div>
            </div>
        );
    }
}