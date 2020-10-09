import React from "react";
import _ from "lodash";
import uuid from "uuid";
import * as axios from "axios";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, CardHeader, Wizard, Loader} from "susam-components/layout";
import {Notify, TextInput, Button, DropDown, Checkbox, CheckboxGroup, Span, Form} from 'susam-components/basic';
import {DateRange} from 'susam-components/advanced';
import * as DataTable from 'susam-components/datatable';

import {LookupService} from '../../../services/KartoteksService';


export class CompanyRole extends TranslatingComponent {

    constructor(props){
        super(props);
        this.state = {};
    }

    initializeState(props){
        let state = _.cloneDeep(this.state);
        state.role = props.role;
        this.setState(state);
    }

    initializeLookups(){
        axios.all([
            LookupService.getBusinessSegmentTypes(),
            LookupService.getCompanyRoleTypes(),
            LookupService.getEmployeeCustomerRelations()
        ]).then(axios.spread((segmentTypes, roleTypes, employeeCustomerRelations) => {
            let state = _.cloneDeep(this.state);
            state.segmentTypes = segmentTypes.data;
            state.roleTypes = roleTypes.data;
            state.employeeCustomerRelations = employeeCustomerRelations.data;
            _.remove(state.employeeCustomerRelations, {code: "PORTFOLIO_OWNER"});
            this.setState(state);
        })).catch(error => {
            Notify.showError(error);
        })
    }
    componentDidMount(){
        this.initializeLookups();
        this.initializeState(this.props);
        this.validate();
    }
    componentWillReceiveProps(nextProps){
        this.initializeState(nextProps);
        this.validate();
    }

    updateState(key, value){
        let role = _.cloneDeep(this.state.role);
        _.set(role, key, value);
        this.setState({role: role});
    }
    updateRoleType(value){
        this.updateState("roleType", value);
    }

    handleCancelClick(){
        this.props.oncancel && this.props.oncancel();
    }
    handleSaveClick(){
        if(this.validate()){
            this.props.onsave && this.props.onsave(this.state.role);
        }
    }
    validate(){
        return this.form && this.form.validate();
    }

    handleRelationCreate(item){
        let role = _.cloneDeep(this.state.role);
        item._key = uuid.v4();
        role.employeeRelations.push(item);
        this.setState({role: role});
    }
    handleRelationDelete(item){
        let role = _.cloneDeep(this.state.role);
        _.remove(role.employeeRelations, {_key: item._key});
        this.setState({role: role});
    }
    handleRelationUpdate(item){
        let role = _.cloneDeep(this.state.role);
        let index = _.findIndex(role.employeeRelations, {_key: item._key});
        if(index != -1){
            role.employeeRelations[index] = item;
        }else{
            console.warn("Can not find employee relation with _key: " + JSON.stringify(item));
        }
        this.setState({role: role});
    }

    render(){
        if(!this.state.role){
            return <Loader />;
        }
        let employeeRelations = null;
        if(_.get(this.state, "role.roleType.code") == "CUSTOMER" && this.state.employeeCustomerRelations){
            employeeRelations =
                <Grid>
                    <GridCell width="1-1">
                        <DataTable.Table data={this.state.role.employeeRelations} title="Employee Roles"
                                         editable = {true} insertable = {true} filterable = {false} deletable = {true} sortable = {true}
                                         ondelete = {(data) => this.handleRelationDelete(data)}
                                         onupdate = {(data) => this.handleRelationUpdate(data)}
                                         oncreate = {(data) => this.handleRelationCreate(data)}>
                            <DataTable.Lookup field="relation" header="Relation" width="40" sortable = {true} required = {true}
                                              options = {this.state.employeeCustomerRelations} />
                            <DataTable.Text header="Managed By" field="employeeAccount" width="40" sortable = {true}  required = {true} />
                        </DataTable.Table>
                    </GridCell>
                </Grid>;
        }
        return (
            <Grid>
                <GridCell width="1-1">
                    <CardHeader title="Role Information"/>
                </GridCell>
                <GridCell width="1-1">
                    <Form ref = {(c) => this.form = c}>
                        <Grid>
                            <GridCell width="1-4">
                                <DropDown label="Role" required = {true}
                                          options = {this.state.roleTypes}
                                          value = {this.state.role.roleType}
                                          onchange = {(value) => this.updateRoleType(value)} />
                            </GridCell>
                            <GridCell width="1-4">
                                <DropDown label="Service" required = {true}
                                          options = {this.state.segmentTypes}
                                          value = {this.state.role.segmentType}
                                          onchange = {(value) => this.updateState("segmentType", value)} />
                            </GridCell>
                            <GridCell width="1-4">
                                <DateRange startDateLabel="Start Date" endDateLabel="End Date" noMargin = {true}
                                           value={this.state.role.dateRange}
                                           onchange = {(value) => this.updateState("dateRange", value)} />
                            </GridCell>
                        </Grid>
                    </Form>
                    <Grid>
                        <GridCell width="1-1">
                            {employeeRelations}
                        </GridCell>
                        <GridCell width="1-1">
                            <div className="uk-align-right">
                                <Button label="cancel" waves = {true} onclick = {() => this.handleCancelClick()}/>
                                <Button label="Save" waves = {true} style = "primary" onclick = {() => this.handleSaveClick()}/>
                            </div>
                        </GridCell>
                    </Grid>
                </GridCell>
            </Grid>
        );
    }
}
class RelationReader{
    readCellValue(row) {
        return row.relation ? row.relation.name : "";
    }
    readSortValue(row) {
        return this.readCellValue(row);
    }
    setValue(row, value){
        row.relation = value;
    }
}