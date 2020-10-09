import React from "react";
import _ from "lodash";
import uuid from "uuid";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, CardHeader} from "susam-components/layout";
import {Notify, TextInput, Button, Span} from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';

import {CompanyRole} from './CompanyRole';
import {CompanyService} from '../../../services/KartoteksService';

export class CompanyRoles extends TranslatingComponent {

    constructor(props){
        super(props);
        this.state = {};
    }
    initializeState(props){

    }
    componentDidMount(){
        this.initializeState(this.props);
    }
    componentWillReceiveProps(nextProps){
        this.initializeState(nextProps);
    }
    handleEditRole(value){
        this.setState({roleToEdit: value});
    }
    handleDeleteRole(item){
        UIkit.modal.confirm("Are you sure?", () => this.props.ondelete && this.props.ondelete(item));
    }
    handleNewRoleClick(){
        this.setState({roleToEdit: {_key: uuid.v4(), employeeRelations:[]}});
    }

    next(){
        if(this.state.roleToEdit) {
            Notify.showError("Please save the role you are editing");
            return false;
        }
        return true;
    }



    handleSave(role){
        this.props.onsave && this.props.onsave(role);
        this.clearState();
    }

    clearState(){
        this.setState({roleToEdit: null});
    }

    handleCancel(){
        this.clearState();
    }

    renderCompanyWebsite(){
        let companyWebsite = null;
        let absoluteWebsiteUrl = this.props.companyToEdit.website;
        if(absoluteWebsiteUrl){
            if(absoluteWebsiteUrl.length > 4 && absoluteWebsiteUrl.substr(0,4) != "http"){
                absoluteWebsiteUrl = "http://" + absoluteWebsiteUrl;
            }
            companyWebsite = <a className="md-btn md-btn-flat md-btn-flat-success md-btn-wave waves-effect waves-button"
                                style = {{textTransform: 'lowercase'}}
                                href = {absoluteWebsiteUrl} target="_blank">
                {this.props.companyToEdit.website}
            </a>;
        }
        return companyWebsite;
    }

    render(){
        let roleForm = null;
        let roles = null;
        let newButton = null;

        if(this.state.roleToEdit){
            roleForm = <CompanyRole role = {this.state.roleToEdit}
                                        ref = {(c) => this.form = c}
                                        onsave = {(role) => this.handleSave(role)}
                                        oncancel = {() => this.handleCancel()}/>;
        }else{
            newButton = <div className="uk-align-right">
                <Button label="New Role" style="success" waves = {true} size = "small" onclick = {() => this.handleNewRoleClick()} />
            </div>;
            roles = <Grid>
                <GridCell width="1-1">
                    <DataTable.Table data={this.props.companyToEdit.roles} title="Roles"
                                     editable = {false} insertable = {false} filterable = {false} sortable = {true}>
                        <DataTable.Badge header="Status" width="5" sortable = {true} reader = {new NewStatusReader()}/>
                        <DataTable.Text header="Role" field="roleType.name" width="15" sortable = {true} />
                        <DataTable.Text header="Service" field="segmentType.name" width="15" sortable = {true}/>
                        <DataTable.Date header="Start" field="dateRange.startDate" width="15" sortable = {true}/>
                        <DataTable.Date header="End" field="dateRange.endDate" width="15" sortable = {true}/>
                        <DataTable.Date header="Employees" reader = {new EmployeeReader()} printer = {new ListPrinter()} />

                        <DataTable.ActionColumn width="10">
                            <DataTable.ActionWrapper key="edit" track="onclick" onaction = {(data) => this.handleEditRole(data)}>
                                <Button label="edit" flat = {true} style="primary" size="small"/>
                            </DataTable.ActionWrapper>
                            <DataTable.ActionWrapper key="delete" track="onclick" onaction = {(data) => this.handleDeleteRole(data)}>
                                <Button label="delete" flat = {true} style="danger" size="small"/>
                            </DataTable.ActionWrapper>
                        </DataTable.ActionColumn>
                    </DataTable.Table>
                </GridCell>
            </Grid>;
        }

        return (
            <Grid>
                <GridCell width="1-1">
                    <Grid>
                        <GridCell width="1-2" noMargin = {true}>
                            <div className="uk-align-left">
                                {this.renderCompanyWebsite()}
                            </div>
                        </GridCell>
                        <GridCell width="1-2" noMargin = {true}>
                            {newButton}
                        </GridCell>
                    </Grid>
                </GridCell>
                <GridCell width="1-1" noMargin = {true}>
                    {roleForm}
                </GridCell>
                <GridCell width="1-1">
                    {roles}
                </GridCell>
            </Grid>
        );
    }
}
class NewStatusReader{
    readCellValue(row) {
        if(row._new){
            return {style: "success", text: "Merged"};
        }else{
            return {style: "outline", text: "Own"};
        }
    };

    readSortValue(row) {
        return row._new ? "MERGED" : "OWN";
    };
}

class EmployeeReader{
    readCellValue(row) {
        return row.employeeRelations;
    };

    readSortValue(row) {
        return null;
    };
}
class ListPrinter{
    print(data){
        return data.map(item => <div key = {uuid.v4()} style = {{marginBottom: "8px"}}><i className="uk-badge uk-badge-small uk-badge" style = {{marginRight: "8px"}}>{item.relation.name}</i><span>{item.employeeAccount}</span></div>);

    }
}