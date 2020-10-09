import * as axios from 'axios';
import _ from "lodash";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { DateRange } from "susam-components/advanced";
import { Button, DropDown, Form, Notify, Span, TextInput } from "susam-components/basic";
import * as DataTable from 'susam-components/datatable';
import { Card, CardHeader, Grid, GridCell, PageHeader } from "susam-components/layout";
import { CompanySearchAutoComplete } from 'susam-components/oneorder';
import uuid from 'uuid';
import { AuthorizationService, KartoteksService } from '../services';

export class Authorization extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            filter: {}, authList: [], authorization: {}, authLevels: [
                {
                    id: AuthorizationService.AUTH_LEVEL_MEMBER,
                    name: "Member"
                },
                {
                    id: AuthorizationService.AUTH_LEVEL_SUPERVISOR,
                    name: "Supervisor"
                },
                {
                    id: AuthorizationService.AUTH_LEVEL_MANAGER,
                    name: "Manager"
                }
            ]
        };
    }

    componentDidMount() {
        axios.all([
            AuthorizationService.getAuthTeams(),
            AuthorizationService.getAllDepartments(),
            AuthorizationService.getSubsidiaries(),
            KartoteksService.getParentSectors()
        ]).then(axios.spread((teams, departments, subsidiaries, sectors) => {
            this.setState(
                {
                    teams: teams.data,
                    departments: departments.data,
                    subsidiaries: _.sortBy(subsidiaries.data, ["name"]),
                    sectors: sectors.data,
                    nodeTypes: _.reject(AuthorizationService.getAllNodeLabelsForAuthorization() ,i=>i.id==AuthorizationService.NODE_TYPE_CUSTOMER_GROUP)
                }
            );
        })).catch((error) => {
            Notify.showError(error);
        });
    }

    componentDidUpdate(prevProps, prevState){
        if('none' === $(`#parentOf-authorizedTable-table`).css("max-height")){
            $(`#parentOf-authorizedTable-table`).css("max-height", `480px`);
        }
    }

    updateFilterState(key, value) {
        let filter = _.cloneDeep(this.state.filter);
        filter[key] = value;
        this.setState({filter: filter});
    }

    updateState(key, value) {
        let op = _.cloneDeep(this.state.operation);
        op[key] = value;
        this.setState({operation: op});
    }

    updateAuthState(key, value) {
        let auth = _.cloneDeep(this.state.authorization);
        auth[key] = value;
        this.setState({authorization: auth});
    }

    handleSearchClick() {
        AuthorizationService.searchOperation(this.state.filter).then(response => {
            this.setState({operations: response.data});
        }).catch((error) => {
            Notify.showError(error);
        });
    }

    convertAuthorizationFromList(operation, authList){
        if(!authList){
            return [];
        }
        return authList.map(item => {
            let converted = {};
            converted.from = item.node;
            converted.to = {
                externalId: operation.id,
                name: operation.name,
                type: "Operation"
            };
            converted.level = item.level;
            converted._key = item._key || uuid.v4();
            return converted;
        });
    }

    handleEditClick(item) {
        let operation = _.cloneDeep(item);
        AuthorizationService.getAuthorizations(operation).then(response => {
            let authList = [];
            if(response.data && response.data.authorizations){
                authList = this.convertAuthorizationFromList(operation, response.data.authorizations);
            }
            this.setState({operation: operation, authorization: {}, authList: authList});
        }).catch(error => {
            Notify.showError(error);
        });

    }

    handleEditAuthorizationClick(item) {
        this.setState({authorization: this.convertAuthorizationToEdit(item)});
    }

    handleDeleteAuthorizationClick(item) {
        UIkit.modal.confirm("Are you sure?", () => {
            let authList = _.cloneDeep(this.state.authList);
            _.remove(authList, {_key: item._key});
            this.setState({authList: authList});
        });
    }

    handleAddAuthorizationClick() {
        if (!this.form.validate()) {
            return;
        }
        let authList = _.cloneDeep(this.state.authList);
        let newAuth = this.convertAuthorizationFromEdit(this.state.operation, this.state.authorization);
        let existing = _.find(authList,
            (each) => { return each.from.type ==  newAuth.from.type &&
                ((each.from.id && each.from.id == newAuth.from.id) || (each.from.externalId && each.from.externalId == newAuth.from.externalId))});
        if(existing){
            Notify.showError("There is an authorization for the same type");
            return;
        }
        authList.push(newAuth);
        this.setState({authList: authList});
    }
    handleSaveAuthorizationClick() {
        if (!this.form.validate()) {
            return;
        }
        let authList = _.cloneDeep(this.state.authList);
        let auth = this.convertAuthorizationFromEdit(this.state.operation, this.state.authorization);
        let index = _.findIndex(authList, {_key: auth._key});
        if(index != -1){
            authList[index] = auth;
        }
        this.setState({authList: authList, authorization: {}});
    }

    handleSaveOperation(){
        AuthorizationService.saveOperation(this.state.operation).then(response => {
            Notify.showSuccess("Operation saved");
        }).catch(error => {
            Notify.showError(error);
        });

        this.saveAuthList();
    }

    saveAuthList(){
        let authOperation = {name: this.state.operation.name, externalId: this.state.operation.id};
        AuthorizationService.saveAuthorization(authOperation, this.state.authList).then(response => {
            Notify.showSuccess("Authorizations saved");
        }).catch(error => {
            Notify.showError(error);
        });
    }

    convertAuthorizationFromEdit(operation, auth){
        let from = {type: auth.nodeType.id};
        switch (auth.nodeType.id) {
            case AuthorizationService.NODE_TYPE_DEPARTMENT:
                from.externalId = auth.department.id;
                from.name = auth.department.name;
                break;
            case AuthorizationService.NODE_TYPE_TEAM:
                from.id = auth.team.id;
                from.name = auth.team.name;
                break;
            case AuthorizationService.NODE_TYPE_SECTOR:
                from.externalId = auth.sector.id;
                from.name = auth.sector.name;
                break;
            case AuthorizationService.NODE_TYPE_SUBSIDIARY:
                from.externalId = auth.subsidiary.id;
                from.name = auth.subsidiary.name;
                break;
            case AuthorizationService.NODE_TYPE_CUSTOMER:
                from.externalId = auth.customer.id;
                from.name = auth.customer.name;
                break;
        }
        let converted = {};
        converted.from = from;
        converted.to = {
            externalId: operation.id,
            name: operation.name,
            type: "Operation"
        };
        converted.level = auth.level.id;
        converted._key = auth._key || uuid.v4();
        return converted;
    }

    convertAuthorizationToEdit(listItem){
        let auth = {};
        auth.nodeType = {id: listItem.from.type, name: listItem.from.type};
        switch (listItem.from.type) {
            case AuthorizationService.NODE_TYPE_DEPARTMENT:
                auth.department = {};
                auth.department.id = listItem.from.externalId;
                auth.department.name = listItem.from.name;
                break;
            case AuthorizationService.NODE_TYPE_TEAM:
                auth.team = {};
                auth.team.id = listItem.from.id;
                auth.team.name = listItem.from.name;
                break;
            case AuthorizationService.NODE_TYPE_SECTOR:
                auth.sector = {};
                auth.sector.id = listItem.from.externalId;
                auth.sector.name = listItem.from.name;
                break;
            case AuthorizationService.NODE_TYPE_SUBSIDIARY:
                auth.subsidiary = {};
                auth.subsidiary.id = listItem.from.externalId;
                auth.subsidiary.name = listItem.from.name;
                break;
            case AuthorizationService.NODE_TYPE_CUSTOMER:
                auth.customer = {};
                auth.customer.id = listItem.from.externalId ;
                auth.customer.name = listItem.from.name;
                break;
        }
        auth.level = {id: listItem.level};
        auth._key = listItem._key || uuid.v4();
        return auth;
    }

    renderNodeTypeOptions(){
        if(!this.state.authorization.nodeType){
            return <DropDown uninitializedText="Please Select Type" />;
        }
        let typeOptions = null;
        switch (this.state.authorization.nodeType.id) {
            case AuthorizationService.NODE_TYPE_DEPARTMENT:
                typeOptions = <DropDown label="Departments" options = {this.state.departments}
                                        value = {this.state.authorization.department}
                                        onchange={(value) => this.updateAuthState("department", value)}
                                        required = {true}/>;
                break;
            case AuthorizationService.NODE_TYPE_TEAM:
                typeOptions = <DropDown label="Teams" options = {this.state.teams}
                                        value = {this.state.authorization.team}
                                        onchange={(value) => this.updateAuthState("team", value)}
                                        required = {true}/>;
                break;
            case AuthorizationService.NODE_TYPE_SECTOR:
                typeOptions = <DropDown label="Sectors" options = {this.state.sectors}
                                        value = {this.state.authorization.sector}
                                        onchange={(value) => this.updateAuthState("sector", value)}
                                        required = {true}/>;
                break;
            case AuthorizationService.NODE_TYPE_SUBSIDIARY:
                typeOptions = <DropDown label="Subsidiaries" options = {this.state.subsidiaries}
                                        value = {this.state.authorization.subsidiary}
                                        onchange={(value) => this.updateAuthState("subsidiary", value)}
                                        required = {true}/>;
                break;

            case AuthorizationService.NODE_TYPE_CUSTOMER:
                typeOptions = <CompanySearchAutoComplete label="Customer"
                                                         value={this.state.authorization.customer}
                                                         onchange={(value) => this.updateAuthState("customer", value)}
                                                         onclear={() => this.updateAuthState("customer", null)}
                                                         required = {true}/>;
                break;
            default:
                typeOptions = <DropDown uninitializedText="Please Select Type" options = {[]} />;
                break;

        }
        return typeOptions;
    }

    render(){
        let operation = null;
        if(this.state.operation){
            let saveButton = <Button label="add" waves = {true} style="success" size="small" onclick = {() => this.handleAddAuthorizationClick() } />;
            if(this.state.authorization && this.state.authorization._key){
                saveButton = <Button label="save" waves = {true} style="success" size="small" onclick = {() => this.handleSaveAuthorizationClick() } />;
            }

            operation = <Grid>

                <GridCell width="1-2">
                                <Span label="Name"
                                      value = {this.state.operation.name}/>
                </GridCell>
                <GridCell width="1-2">
                    <TextInput label="Description"
                               value = {this.state.operation.description}
                               onchange = {(value) => this.updateState("description", value)} />
                </GridCell>
                <GridCell width="1-1">
                    <CardHeader title="Authorization"/>
                </GridCell>
                <GridCell width="1-1" noMargin = {true}>
                    <Form ref = {(c) => this.form = c}>
                        <Grid>
                            <GridCell width="1-5">
                                <DropDown label="Select Type" options = {this.state.nodeTypes}
                                          value = {this.state.authorization.nodeType}
                                          onchange={(value) => this.updateAuthState("nodeType", value)}
                                          required = {true}/>
                            </GridCell>
                            <GridCell width="2-5">
                                {this.renderNodeTypeOptions()}
                            </GridCell>
                            <GridCell width="1-5">
                                <DropDown label="Authorization Level" options = {this.state.authLevels}
                                          value = {this.state.authorization.level}
                                          onchange={(value) => this.updateAuthState("level", value)}
                                          required = {true}/>
                            </GridCell>
                            <GridCell width="1-5">
                                <div className="uk-align-left">
                                    {saveButton}
                                </div>
                            </GridCell>
                        </Grid>
                    </Form>
                </GridCell>
                <GridCell width="1-1">
                    <DataTable.Table id="authorizedTable"
                            data={this.state.authList}
                            sortable = {true}>
                        <DataTable.Text header="Type" width="25" field="from.type"/>
                        <DataTable.Text header="Name" width="25" field="from.name"/>
                        <DataTable.Text header="Level" width="25" reader={new AuthLevelReader(this.state.authLevels)}/>
                        <DataTable.ActionColumn >
                            <DataTable.ActionWrapper track="onclick" onaction={(data) => {this.handleEditAuthorizationClick(data)}}>
                                <Button label="Edit" flat={true} style="success" size="small"/>
                            </DataTable.ActionWrapper>
                            <DataTable.ActionWrapper track="onclick" onaction={(data) => {this.handleDeleteAuthorizationClick(data)}}>
                                <Button label="Delete" flat={true} style="danger" size="small"/>
                            </DataTable.ActionWrapper>
                        </DataTable.ActionColumn>
                    </DataTable.Table>
                </GridCell>
                <GridCell width="1-1">
                    <Button label="Save" waves = {true} style="primary" onclick={() => this.handleSaveOperation()}/>
                </GridCell>
            </Grid>;
        }
        return(
        <div>
            <PageHeader title="Authorization" />
            <Card style={{minHeight: `${window.innerHeight-150}px`}}>
                <Grid divider = {true}>
                    <GridCell width="1-2">
                        <Grid collapse = {true}>
                            <GridCell width="1-1">
                                <CardHeader title="Filter"/>
                            </GridCell>
                            <GridCell width="1-5">
                                <TextInput label="Operation"
                                           value = {this.state.filter.name}
                                           onchange = {(value) => this.updateFilterState("name", value)} />
                            </GridCell>
                            <GridCell width="1-5">
                                <TextInput label="Description"
                                           value = {this.state.filter.description}
                                           onchange = {(value) => this.updateFilterState("description", value)} />
                            </GridCell>
                            <GridCell width="2-5">
                                <DateRange startDateLabel="Start Date" endDateLabel="End Date"
                                           value = {this.state.filter.dateRange} hideIcon={true}
                                           onchange = {(value) => this.updateFilterState("dateRange", value)} />
                            </GridCell>
                            <GridCell width="1-5">
                                <Button fullWidth={true} label="search" style="success" waves = {true} size="small" onclick = {() => this.handleSearchClick()} />
                            </GridCell>
                            <GridCell width="1-1">
                                <CardHeader title="Operations"/>
                            </GridCell>
                            <GridCell width="1-1">
                                <DataTable.Table data={this.state.operations} sortable = {true} selectedRows={[this.state.operation]}>
                                    <DataTable.Text field="name" header="Operation" width="30" sortable = {true} printer={new LinkPrinter(item=>this.handleEditClick(item))}/>
                                    <DataTable.Text field="description" header="Description" width="45" sortable = {true}/>
                                    <DataTable.Date field="createdAt" header="Created At" width="25" sortable = {true}/>
                                </DataTable.Table>
                            </GridCell>
                        </Grid>
                    </GridCell>
                    <GridCell width="1-2" noMargin = {true}>
                        <div id="authorizationForm" style={{float: 'left', position: 'fixed', margin:"0 24px 0 8px"}}>
                            {operation}
                        </div>
                    </GridCell>
                </Grid>
            </Card>
        </div>
        );
    }
}

class LinkPrinter {
    constructor(onclick){
        this.onclickEvent = onclick;
    }

    printUsingRow(row) {
        return <a className='uk-text-primary' 
            onClick={()=>this.onclickEvent && this.onclickEvent(row)} 
            href='javascript:;'>{row.name}</a>
    }
}
class AuthLevelReader{
    constructor(levels){
        this.levels = levels;
    }
    readCellValue(row) {
        let authLevel = _.find(this.levels, {id: row.level});
        return authLevel != null ? authLevel.name : "";
    }
    readSortValue(row) {
        return this.readCellValue(row);
    }
}