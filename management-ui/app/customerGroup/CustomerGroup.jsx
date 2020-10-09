import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, Notify } from "susam-components/basic";
import { Card, Grid, GridCell, PageHeader } from "susam-components/layout";
import { CustomerGroupService } from "../services/AuthorizationService";
import { CustomerGroupForm } from "./CustomerGroupForm";
import { CustomerGroupTable } from "./CustomerGroupTable";
import { Filter } from "./Filter";

export class CustomerGroup extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    search(filter) {
        CustomerGroupService.search(filter).then(response => {
            this.setState({
                showCustomerGroupForm: false,
                searchResult: response.data,
                filter: filter
            });
        }).catch(error => {
            Notify.showError(error);
        });
    }

    handleCreateCustomerGroup(){
        this.handleEditItem({name:null, companies:[]});
    }

    handleEditItem(item) {
        this.setState({
            showCustomerGroupForm: true,
            selectedCustomerGroup: item
        });
    }

    handleDeleteItem(item) {
        CustomerGroupService.delete(item).then(response => {
            Notify.showSuccess(item.name + " is deleted");
            this.search(this.state.filter);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    handleSaveItem(item){
        item.id ? 
        CustomerGroupService.update(item.id, item).then(response => {
            Notify.showSuccess(item.name + " is updated");
            this.setState({selectedCustomerGroup: response.data});
            this.search(this.state.filter);
        }).catch(error => {
            Notify.showError(error);
        })
        :
        CustomerGroupService.create(item).then(response => {
            Notify.showSuccess(item.name + " is created");
            this.setState({selectedCustomerGroup: response.data});
            this.search(this.state.filter);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    render() {
        let customerGroupForm = this.state.showCustomerGroupForm ?
            <CustomerGroupForm item={this.state.selectedCustomerGroup}
            onSave={(item) => this.handleSaveItem(item)} /> : null;
        return (
            <div>
                <PageHeader title="Customer Service Portfolios" />
                <Card>
                    <Grid divider={true}>
                        <GridCell width="1-2" noMargin={true}>
                            <Grid>
                                <GridCell width="1-1" noMargin={true}>
                                    <div className="uk-align-right uk-margin-top">
                                        <Button label="Create New" size="small" style="success" onclick={() => this.handleCreateCustomerGroup()} />
                                    </div>
                                </GridCell>
                                <GridCell width="1-1">
                                    <Filter onSearch={(filter) => this.search(filter)} />
                                </GridCell>
                                <GridCell width="1-1">
                                    <CustomerGroupTable data={this.state.searchResult}
                                        selectedRows={this.state.selectedCustomerGroup}
                                        onEdit={(item) => this.handleEditItem(item)}
                                        onDelete={(item) => this.handleDeleteItem(item)} />
                                </GridCell>
                            </Grid>
                        </GridCell>
                        <GridCell width="1-2" noMargin={true}>
                            {customerGroupForm}
                        </GridCell>
                    </Grid>
                </Card>
            </div>
        );
    }
}