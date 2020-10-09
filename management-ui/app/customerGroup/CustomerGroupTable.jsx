import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button } from "susam-components/basic";
import * as DataTable from 'susam-components/datatable';
import { CardHeader } from "susam-components/layout";
import { Notify } from "../../node_modules/susam-components/basic/Notify";

export class CustomerGroupTable extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    handleEditClick(item) {
        this.setState({ selectedRows: [item] });
        this.props.onEdit && this.props.onEdit(item);
    }
    handleDeleteClick(item) {
        Notify.confirm("Portfolio will be deleted. Are you sure?", ()=> this.props.onDelete && this.props.onDelete(item) );
    }

    render() {
        return (
            <div>
                <div>
                    <CardHeader title="Portfolios" />
                </div>
                <div>
                    <DataTable.Table
                        ref={(c) => this.datatable = c}
                        data={this.props.data}
                        selectedRows={this.state.selectedRows}
                        sortable={false}>
                        <DataTable.Text field="name" width="90" sortable={true} />
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
                </div>
            </div>
        );
    }
}