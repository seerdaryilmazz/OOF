import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button } from "susam-components/basic";
import * as DataTable from 'susam-components/datatable';
import { CardHeader } from "susam-components/layout";

export class CustomerGroupCompanies extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {}
    }

    handleDeleteClick(item){
        this.props.onDelete && this.props.onDelete(item);
    }

    render() {
        return (
            <div>
                <CardHeader title="Companies" />
                <DataTable.Table sortable={false} data={this.props.list}>
                    <DataTable.Text field="name" width="90" sortable={true} />
                    <DataTable.ActionColumn >
                        <DataTable.ActionWrapper track="onclick" onaction={(item) => { this.handleDeleteClick(item) }}>
                            <Button label="Delete" flat={true} style="danger" size="small" />
                        </DataTable.ActionWrapper>
                    </DataTable.ActionColumn>
                </DataTable.Table>
            </div>
        );
    }
}