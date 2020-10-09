import * as axios from 'axios';
import React from 'react';
import { FabToolbar } from 'susam-components/advanced';
import { Button, Notify } from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';
import { Card, PageHeader } from 'susam-components/layout';
import { BillingItemService, LookupService } from '../services';
import { BillingItem } from './BillingItem';
export class BillingItemManage extends React.Component {
    state = {
        billingItems: [],
        serviceAreas: []
    };

    constructor(props) {
        super(props);
        this.init();
    }

    init() {
        axios.all([
            LookupService.getServiceAreas(),
            BillingItemService.list()
        ]).then(axios.spread((serviceArea, billingItem) => {
            this.setState({ 
                serviceAreas: serviceArea.data,
                billingItems: billingItem.data
            });
        })).catch(error => Notify.showError(error));
    }

    list(){
         axios.all([
            BillingItemService.list(),
        ]).then(axios.spread((billingItem) => {
            this.setState({ 
                billingItem: undefined,
                billingItems: billingItem.data
            });
        })).catch(error => Notify.showError(error));
    }

    onAddClick(){
        this.setState({billingItem: {}})
    }

    onEditClick(data){
        this.setState({billingItem: data})
    }

    render() {
        if(this.state.billingItem){
            return <BillingItem billingItem={this.state.billingItem} 
                serviceAreas={this.state.serviceAreas}
                onCancel={()=>this.setState({billingItem: undefined})}
                onSave={()=>this.list()} />
        }
        return this.renderList();
    }

    renderList() {
        return (
            <div>
                <PageHeader title="Billing Items" />
                <FabToolbar style={{bottom: "unset", top:"60px"}} actions={[{ icon: "add", onAction: () => this.onAddClick() }]} />
                <Card>
                    <DataTable.Table data={this.state.billingItems}>
                        <DataTable.Text header="Description" field="description" />
                        <DataTable.Text header="Code" field="code" />
                        <DataTable.Text header="Name" field="name" />
                        <DataTable.Lookup header="Service Area" 
                            reader={new ServiceAreaReader('serviceArea', this.state.serviceAreas)} 
                            options={this.state.serviceAreas}>
                            </DataTable.Lookup>
                        <DataTable.ActionColumn>
                            <DataTable.ActionWrapper track="onclick" onaction={(data=>this.onEditClick(data))}>
                                <Button flat={true} label="edit" size="small" style="success" />
                            </DataTable.ActionWrapper>
                        </DataTable.ActionColumn>
                    </DataTable.Table>
                </Card>
            </div>
        )
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

