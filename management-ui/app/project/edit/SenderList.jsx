import React from "react";
import * as axios from 'axios';
import uuid from "uuid";

import {TranslatingComponent} from 'susam-components/abstract';
import {PageHeader, Card, Grid, GridCell, CardHeader} from "susam-components/layout";
import {TextInput, Notify, Button} from "susam-components/basic";
import {Chip, DateRange} from "susam-components/advanced";
import {CompanySearchAutoComplete} from "susam-components/oneorder";

import {ProjectService} from '../../services';

import * as DataTable from 'susam-components/datatable';

export class SenderList extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {senders: {}}

    }

    componentDidMount() {
        this.loadData(this.props)
    }

    componentWillReceiveProps(nextProps) {
        this.loadData(nextProps)

    }

    loadData(props) {
        let senders = this.state.data;
        let lookup = this.state.lookup;

        if (props.data) {
            senders = props.data;
            senders.forEach(d => {
                if (!d._guiKey) {
                    d._guiKey = uuid.v4();
                }
            })
        }
        this.setState({senders: senders});
    }

    handleDelete(data) {
        Notify.confirm("You are about to delete this customer warehouse. Are you sure?", () => {
            this.props.handleDelete(data);
        });
    }

    render() {

        let senders = this.state.senders;

        return (
            <DataTable.Table data={senders} filterable={true} sortable={true}
                             insertable={false}
                             editable={false}>
                <DataTable.Text width="25" field="senderCompany.name" header="Sender" sortable={true}
                                filterable={true}/>
                <DataTable.Text width="10" field="loadingCompany.name" header="Loading Company" sortable={true}
                                filterable={true}/>
                <DataTable.Text width="10" field="loadingLocation.name" header="Loading Location"
                                sortable={true} filterable={true}/>
                <DataTable.ActionColumn width="20">
                    <DataTable.ActionWrapper track="onclick"
                                             onaction={(data) => this.handleDelete(data)}>
                        <Button label="Delete" flat={true} style="danger" size="small"/>
                    </DataTable.ActionWrapper>
                </DataTable.ActionColumn>
            </DataTable.Table>
        );
    }
}