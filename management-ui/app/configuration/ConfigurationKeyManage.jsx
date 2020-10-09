import * as axios from 'axios';
import React from 'react';
import { Button, Notify } from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';
import { Card, Modal, PageHeader, Secure } from 'susam-components/layout';
import { AuthorizationService, ConfigurationManagementLookupService, ConfigurationManagementKeyService, ConfigurationManagementService } from '../services';
import { FabToolbar } from 'susam-components/advanced';
import { Configuration } from './Configuration';
import { ConfigurationKey } from './ConfigurationKey';

export class ConfigurationKeyManage extends React.Component {
    state = {
        list: [],
        valueTypes: []
    };

    constructor(props) {
        super(props);
        this.load();
        this.init();
    }

    load() {
        ConfigurationManagementKeyService.list().then(response => {
            this.setState({
                value: undefined,
                list: response.data
            });
        }).catch(error => Notify.showError(error));
    }

    init() {
        axios.all([
            AuthorizationService.getAllOperations(),
            ConfigurationManagementLookupService.list("value-type")
        ]).then(axios.spread((operation, valueType) => {
            this.setState({
                operations: _.orderBy(operation.data, ["name"]),
                valueTypes: valueType.data
            });
        })).catch(error => Notify.showError(error));;
    }

    onEditClick(val) {
        this.setState({ value: val })
    }

    onDefaultValueClick(val) {
        ConfigurationManagementService.getDefault(val.code).then(response => {
            let configuration = response.data;
            if (_.isEmpty(configuration)) {
                configuration = {
                    key: val,
                };
            }
            this.setState({ configuration: configuration }, () => this.defautlValueModal.open());
        })
    }

    handleSaveDefaultValue() {
        ConfigurationManagementService.save(this.state.configuration).then(response=>{
            this.load();
            Notify.showSuccess("Saved");
            this.defautlValueModal.close();
        }).catch(error=>Notify.showError(error));
    }

    render() {
        if (this.state.value) {
            return <ConfigurationKey value={this.state.value}
                operations={this.state.operations}
                valueTypes={this.state.valueTypes}
                onSave={() => this.load()}
                onCancel={() => this.setState({ value: undefined })}
            />
        }
        return this.renderList();
    }

    renderList() {
        return (
            <Secure operations="configuration-management.admin" message="Not Authorized" >
                <div>
                    <PageHeader title="Configuration Keys" />
                    <FabToolbar style={{ bottom: "unset", top: "60px" }} actions={[{ icon: "add", onAction: () => this.onEditClick({}) }]} />
                    <Card>
                        <DataTable.Table data={this.state.list}>
                            <DataTable.Text field="code" header="Code" />
                            <DataTable.Text field="name" header="Name" />
                            <DataTable.Lookup field="valueType" header="Value Type" options={this.state.options} />
                            <DataTable.ActionColumn>
                                <DataTable.ActionWrapper onaction={e => this.onEditClick(e)} track="onclick" >
                                    <Button style="success" label="edit" size="small" flat={true} />
                                </DataTable.ActionWrapper>
                                <DataTable.ActionWrapper onaction={e => this.onDefaultValueClick(e)} track="onclick" >
                                    <Button style="primary" label="default value" size="small" flat={true} />
                                </DataTable.ActionWrapper>
                            </DataTable.ActionColumn>
                        </DataTable.Table>
                    </Card>
                    <Modal ref={c => this.defautlValueModal = c}
                        onclose={() => this.setState({ configuration: undefined })}
                        actions={[{ label: "save", action: () => this.handleSaveDefaultValue() }]}>
                        {this.state.configuration &&
                            <Configuration configuration={this.state.configuration} onchange={(value) => this.setState({ configuration: value })} />}
                    </Modal>
                </div>
            </Secure>
        );
    }
}