import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Notify } from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';
import { Card, Grid, GridCell } from "susam-components/layout";
import { PackageGroupService } from '../services/PackageGroupService';

export class PackageGroup extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            data: []
        }
    }

    componentDidMount() {
        this.loadPackageGroups();
    }

    loadPackageGroups() {
        PackageGroupService.retrievePackageGroups().then(response => {
            this.setState({data: response.data})
        }).catch((error) => {
            Notify.showError(error);
        });
    }

    handleAdd(incData) {
        PackageGroupService.addPackageGroup(incData).then(response => {
            Notify.showSuccess("Package Group Added successfully.");
            this.loadPackageGroups();
        }).catch(error => {
            Notify.showError(error);
        });
    }


    handleUpdate(incData) {
        PackageGroupService.updatePackageGroup(incData).then(response => {
            Notify.showSuccess("Package Group Updated successfully.");
            this.loadPackageGroups();
        }).catch(error=> {
            Notify.showError(error);
        });
    }

    handleDelete(incData) {
        Notify.confirm("Package Group '" + incData.name + "2 will be removed, are you sure?", () => {
            PackageGroupService.deletePackageGroup(incData.id).then((response) => {
                Notify.showSuccess("Package Group Removed successfully.");
                this.loadPackageGroups();
            }).catch((error) => {
                Notify.showError(error);
            })
        });
    }

    render() {

        let data = this.state.data;
        
        return (
            <Card title="PACKAGE GROUPS">
                <Grid>
                    <GridCell>
                        <DataTable.Table data={data} filterable={true} sortable={true} insertable={true} editable={true} deletable={true}
                                         oncreate={(data) => {this.handleAdd(data)}} onupdate={(data) => {this.handleUpdate(data)}} ondelete={(data) => {this.handleDelete(data)}}>
                            <DataTable.Text field="name" header="Name" sortable={true} filterable={true}/>
                            <DataTable.Text field="code" header="Code" sortable={true}
                                            filterable={true}/>
                        </DataTable.Table>
                    </GridCell>
                </Grid>
            </Card>
        );
    }
}