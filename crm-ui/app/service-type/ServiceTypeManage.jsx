import * as axios from 'axios';
import React from 'react';
import { FabToolbar } from 'susam-components/advanced';
import { Button, Notify } from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';
import { Card, PageHeader } from 'susam-components/layout';
import { LookupService, ServiceTypeService } from '../services';
import { ServiceType } from './ServiceType';

export class ServiceTypeManage extends React.Component {

    state = {
        serviceTypes: [],
        serviceAreas: []
    };

    constructor(props) {
        super(props);
        this.init();
        this.list();
    }

    init() {
        axios.all([
            LookupService.getServiceAreas()
        ]).then(axios.spread((serviceArea) => {
            this.setState({
                serviceAreas: serviceArea.data
            });
        })).catch(error => Notify.showError(error));
    }

    onAddClick(){
        this.setState({serviceType: {}})
    }

    onEditClick(data){
        this.setState({serviceType: data})
    }

    list() {
        axios.all([
            ServiceTypeService.list('EXTRA'),
        ]).then(axios.spread((serviceType) => {
            this.setState({
                serviceType: undefined,
                serviceTypes: serviceType.data
            });
        })).catch(error => Notify.showError(error));
    }

    renderList() {
        if(_.isEmpty(this.state.serviceAreas)){
            return null;
        }
        return (
            <div>
                <PageHeader title="Service Type" />
                <FabToolbar style={{bottom: "unset", top:"60px"}} actions={[{ icon: "add", onAction: () => this.onAddClick() }]} />
                <Card>
                    <DataTable.Table data={this.state.serviceTypes}>
                        <DataTable.Text header="Name" field="name" />
                        <DataTable.Text header="Billing Item" field="billingItem.description" />
                        <DataTable.Lookup header="Service Area"
                            reader={new ServiceAreaReader('serviceArea', this.state.serviceAreas)}
                            options={this.state.serviceAreas}>
                        </DataTable.Lookup>
                        <DataTable.ActionColumn>
                            <DataTable.ActionWrapper track="onclick" onaction={(data => this.onEditClick(data))}>
                                <Button flat={true} label="edit" size="small" style="success" />
                            </DataTable.ActionWrapper>
                        </DataTable.ActionColumn>
                    </DataTable.Table>
                </Card>
            </div>
        )
    }

    render() {
         if(this.state.serviceType){
            return <ServiceType serviceType={this.state.serviceType} 
                serviceAreas={this.state.serviceAreas}
                onCancel={()=>this.setState({serviceType: undefined})}
                onSave={()=>this.list()} />
        }
        return this.renderList();
    }
}

class ServiceAreaReader {
    constructor(field, options) {
        this.field = field;
        this.options = options;
    };

    readCellValue(rowData){
        return _.find(this.options, i=>i.code===_.get(rowData, this.field));
    }
    readSortValue(rowData){
        return _.get(this.readCellValue(rowData), "name");
    }
}