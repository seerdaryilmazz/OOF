import * as axios from 'axios';
import React from 'react';
import * as DataTable from 'susam-components/datatable';
import { Card, Tab, PageHeader } from 'susam-components/layout';

export class EmailBlackWhiteList extends React.Component {
    state = {
        list: {}
    };

    constructor(props) {
        super(props);
        this.list();
    }

    list() {
        axios.get(`/email-service/list`).then(response => {
            this.setState({ list: response.data });
        }).catch(error => Notify.showError(error));
    }

    handleAdd(item, list) {
        axios.post(`/email-service/list/${list}`, item).then(response => {
            this.list()
        }).catch(error => Notify.showError(error));
    }

    handleDelete(item, list) {
        axios.delete(`/email-service/list/${list}/${item.id}`).then(response => {
            this.list()
        }).catch(error => Notify.showError(error));
    }

    render() {
        let { list } = this.state;
        let keys = Object.keys(list);
        return (
            <div>
                <PageHeader title="E-Mail Blacklist/Whitelist Management" />
                <Card>
                    <Tab labels={keys}>
                        {keys.map(key =>
                            <DataTable.Table key={key}
                                data={list[key]}
                                title={_.upperFirst(key)}
                                oncreate={item => this.handleAdd(item, key)}
                                ondelete={item => this.handleDelete(item, key)}
                                deletable={true}
                                filterable={true}
                                editable={false}
                                insertable={true}>
                                <DataTable.Text header="E-Mail" field="email" />
                            </DataTable.Table>)}
                    </Tab>
                </Card>
            </div>
        );
    }
}