import PropTypes from 'prop-types';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Notify } from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';
import { ApplicationService } from '../services/TranslatorService';

export class Application extends TranslatingComponent {

    state = {
        lookup: {
            statusOptions: []
        }
    };

    componentDidMount() {
        this.list();
    }

    list() {
        ApplicationService.listAll().then(response => {
            this.setState({ data: response.data });
        });
    }

    handleRowUpdate(data) {
        ApplicationService.save(data).then(response => {
            this.list()
        }).catch(error => Notify.showError(error));
    }

    handleRowCreate(data) {
        ApplicationService.save(data).then(response => {
            this.list()
        }).catch(error => Notify.showError(error));
    }

    render() {
        return (
            <DataTable.Table
                data={this.state.data}
                insertable={true}
                editable={true}
                onupdate={data => this.handleRowUpdate(data)}
                oncreate={data => this.handleRowCreate(data)}
            >
                <DataTable.Text header="UI Code" field="code" width='45' />
                <DataTable.Text header="Name" field="name" width='45' />
            </DataTable.Table>
        )
    }
}

Application.contextTypes = {
    translator: PropTypes.object
};