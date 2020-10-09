import PropTypes from 'prop-types';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, Notify } from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';
import { LocaleService, TranslatorService } from '../services/TranslatorService';

export class Locale extends TranslatingComponent {

    state = {
        lookup: {
            statusOptions: []
        }
    };

    componentDidMount() {
        this.list();
        TranslatorService.getStatuses().then(response => {
            this.setState({ lookup: { statusOptions: response.data } });
        })
    }

    list() {
        LocaleService.listByStatus().then(response => {
            this.setState({ data: response.data });
        });
    }

    handleRowUpdate(data) {
        LocaleService.save(data).then(response => {
            this.list()
        }).catch(error => Notify.showError(error));
    }

    handleRowCreate(data) {
        _.set(data, 'status', { id: 'ACTIVE', code: 'ACTIVE' });
        LocaleService.save(data).then(response => {
            this.list()
        }).catch(error => Notify.showError(error));
    }

    handleRowDelete(data) {
        LocaleService.updateStatus(data.id, 'INACTIVE').then(response => {
            this.list();
        }).catch(error => Notify.showError(error));
    }

    handleChangeStatus(item, status) {
        LocaleService.updateStatus(item.id, status).then(response => {
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
                <DataTable.Text header="ISO Code" field="isoCode" width='15' />
                <DataTable.Text header="Name" field="name" width='25' />
                <DataTable.Text header="Original Name" field="originalName" width='25' />
                <DataTable.Lookup header="Status" field="status" options={this.state.lookup.statusOptions} editable={false} width='30' />
                <DataTable.ActionColumn width='5'>
                    <DataTable.ActionWrapper shouldRender={item => item.status.code === 'INACTIVE'} track="onclick" onaction={item => this.handleChangeStatus(item, 'ACTIVE')}>
                        <Button label='activate' flat={true} size='mini' style='success' />
                    </DataTable.ActionWrapper>
                    <DataTable.ActionWrapper shouldRender={item => item.status.code === 'ACTIVE'} track="onclick" onaction={item => this.handleChangeStatus(item, 'INACTIVE')}>
                        <Button label='deactivate' flat={true} size='mini' style='danger' />
                    </DataTable.ActionWrapper>
                </DataTable.ActionColumn>

            </DataTable.Table>
        )
    }
}

Locale.contextTypes = {
    translator: PropTypes.object
};