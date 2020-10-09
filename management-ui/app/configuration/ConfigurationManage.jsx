import * as axios from 'axios';
import PropTypes from 'prop-types';
import React from 'react';
import { Button, DropDown, Notify } from 'susam-components/basic';
import { Card, Grid, PageHeader, Secure } from 'susam-components/layout';
import { GridCell } from 'susam-components/layout/Grid';
import { AuthorizationService, ConfigurationManagementKeyService, ConfigurationManagementService } from '../services';
import { Configuration } from './Configuration';

export class ConfigurationManage extends React.Component {

    state = {
        subsidiaries: [],
        configurationKeys: []
    };

    componentDidMount() {
        this.load();
    }

    fetchConfigurations() {
        if(!this.state.subsidiary){
            return;
        }
        ConfigurationManagementService.list({ subsidiaryId: this.state.subsidiary.id }).then(response => {
            this.setState({ configurations: response.data });
        }).catch(error => Notify.showError(error));
    }

    load() {
        let getSubsidiaries = () => AuthorizationService.getSubsidiariesOfCurrentUser();
        if (_.find(this.context.operations, i => i === "configuration-management.admin")) {
            getSubsidiaries = () => AuthorizationService.getSubsidiaries();
        }
        axios.all([
            getSubsidiaries(),
            ConfigurationManagementKeyService.list()
        ]).then(axios.spread((subsidiary, key) => {
            let subs = null;
            if(1 == subsidiary.data.length){
                subs = _.first(subsidiary.data);
            }

            this.setState({
                subsidiary: subs,
                subsidiaries: subsidiary.data,
                configurationKeys: key.data
            },()=>this.fetchConfigurations());
        })).catch(error => Notify.showError(error));
    }

    handleConfigurationChange(configuration) {
        let configs = _.cloneDeep(this.state.configurations);
        let configIndex = _.findIndex(configs, i => i.key.code === configuration.key.code)
        if (configIndex < 0) {
            configs.push(configuration);
        } else {
            configs[configIndex] = configuration;
        }
        this.setState({ configurations: configs });
    }

    handleSave() {
        let configs = _.clone(this.state.configurations);
        configs.forEach(config => config.subsidiary = this.state.subsidiary);

        ConfigurationManagementService.saveBulk(configs).then(response => {
            Notify.showSuccess("Saved");
            this.setState({ configurations: response.data });
        }).catch(error => Notify.showError(error));
    }
    
    handleDelete(id){
        ConfigurationManagementService.delete(id).then(response=>{
            this.fetchConfigurations();
        }).catch(error=>Notify.showError(error));
    }

    renderList() {
        if (!this.state.subsidiary) {
            return null;
        }

        let operations = ["configuration-management.admin", "configuration-management.supervisor"]
        let allOperations = [];
        return (
            <Card>
                <Grid>
                    {this.state.configurationKeys.map((item, index) => {
                        let configuration = _.find(this.state.configurations, i => i.key.code === item.code) || { key: item };
                        allOperations = _.union(allOperations, item.authorizations);
                        return (
                            <Secure key={index} operations={_.union(operations, item.authorizations)}>
                                <GridCell>
                                    <Configuration configuration={configuration} 
                                        onDelete={id=>this.handleDelete(id)}
                                        onchange={value => this.handleConfigurationChange(value)}  />
                                </GridCell>
                            </Secure>)
                    })}
                    <Secure operations={_.union(operations, allOperations)}>
                        <GridCell widh="1-1" style={{ textAlign: "right" }}>
                            <Button label="save" style="primary" onclick={() => this.handleSave()} />
                        </GridCell>
                    </Secure>
                </Grid>
            </Card>
        );
    }

    renderSubsidiary() {
        if(2 > this.state.subsidiaries.length){
            return null
        }
        return (
            <Card>
                <DropDown label="Subsidiary"
                    options={this.state.subsidiaries}
                    value={this.state.subsidiary}
                    onchange={value => this.setState({ subsidiary: value }, () => this.fetchConfigurations())}
                />
            </Card>
        );
    }

    render() {
        return (
            <div>
                <PageHeader title="Configuration" />
                {this.renderSubsidiary()}
                {this.renderList()}
            </div>
        );
    }
}

ConfigurationManage.contextTypes = {
    operations: PropTypes.array
};