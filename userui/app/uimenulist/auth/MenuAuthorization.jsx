import _ from 'lodash';
import React from "react";
import { connect } from "react-redux";
import { Button, DropDown, Form } from "susam-components/basic";
import * as DataTable from 'susam-components/datatable';
import { CardHeader, Grid, GridCell, Secure } from "susam-components/layout";
import { CompanySearchAutoComplete } from "susam-components/oneorder";
import { addAuthorizationToList, confirmDeleteAuthorization, Constants, deleteAuthorization, editAuthorization, fetchAuthLookups, updateAuthField } from "./Actions";

class _MenuAuthorization extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount(){
        this.props.fetchAuthLookups();
    }

    componentWillReceiveProps(){

    }

    handleSaveClick(){
        if(!this.form.validate()){
            return;
        }
        this.props.addAuthorizationToList(this.props);
    }

    renderNodeTypeOptions(){
        if(!this.props.auth.nodeType){
            return <DropDown uninitializedText="Please Select Type" />;
        }
        let typeOptions = null;
        switch (this.props.auth.nodeType.id) {
            case Constants.NODE_TYPE_DEPARTMENT:
                typeOptions = <DropDown label="Departments" options = {this.props.departments}
                                        value = {this.props.auth.department}
                                        onchange={(value) => this.props.updateAuthField("department", value)}
                                        required = {true}/>;
                break;
            case Constants.NODE_TYPE_TEAM:
                typeOptions = <DropDown label="Teams" options = {this.props.teams}
                                        value = {this.props.auth.team}
                                        onchange={(value) => this.props.updateAuthField("team", value)}
                                        required = {true}/>;
                break;
            case Constants.NODE_TYPE_SECTOR:
                typeOptions = <DropDown label="Sectors" options = {this.props.sectors}
                                        value = {this.props.auth.sector}
                                        onchange={(value) => this.props.updateAuthField("sector", value)}
                                        required = {true}/>;
                break;
            case Constants.NODE_TYPE_SUBSIDIARY:
                typeOptions = <DropDown label="Subsidiaries" options = {this.props.subsidiaries}
                                        value = {this.props.auth.subsidiary}
                                        onchange={(value) => this.props.updateAuthField("subsidiary", value)}
                                        required = {true}/>;
                break;

            case Constants.NODE_TYPE_CUSTOMER:
                typeOptions = <CompanySearchAutoComplete label="Customer"
                                                         value={this.props.auth.customer}
                                                         onchange={(value) => this.props.updateAuthField("customer", value)}
                                                         onclear={() => this.props.updateAuthField("customer", null)}
                                                         required = {true}/>;
                break;
            default:
                typeOptions = <DropDown uninitializedText="Please Select Type" options = {[]} />;
                break;

        }
        return typeOptions;
    }

    renderAuthList(){
        return (
            <DataTable.Table data={this.props.authList}
                             sortable = {true}>
                <DataTable.Text header="Type" width="25" field="from.type"/>
                <DataTable.Text header="Name" width="25" field="from.name"/>
                <DataTable.Text header="Level" width="25" reader={new AuthLevelReader(this.props.authLevels)}/>
                <DataTable.ActionColumn >
                    <DataTable.ActionWrapper track="onclick" onaction={(data) => {this.props.editAuthorization(data)}}>
                        <Button label="Edit" flat={true} style="success" size="small"/>
                    </DataTable.ActionWrapper>
                    <DataTable.ActionWrapper track="onclick" onaction={(data) => {this.props.confirmDeleteAuthorization(data)}}>
                        <Button label="Delete" flat={true} style="danger" size="small"/>
                    </DataTable.ActionWrapper>
                </DataTable.ActionColumn>
            </DataTable.Table>
        );
    }
    render() {



        return (
            <Grid>
                <GridCell width="1-1">
                    <CardHeader title="Authorized Viewers" />
                </GridCell>
                <GridCell width="1-1">
                    <Form ref = {(c) => this.form = c}>
                        <Grid>
                            <GridCell width="1-5">
                                <DropDown label="Select Type" options = {this.props.nodeTypes}
                                          value = {this.props.auth.nodeType}
                                          onchange={(value) => this.props.updateAuthField("nodeType", value)}
                                          required = {true}/>
                            </GridCell>
                            <GridCell width="2-5">
                                {this.renderNodeTypeOptions()}
                            </GridCell>
                            <GridCell width="1-5">
                                <DropDown label="Authorization Level" options = {this.props.authLevels}
                                          value = {this.props.auth.level}
                                          onchange={(value) => this.props.updateAuthField("level", value)}
                                          required = {true}/>
                            </GridCell>
                            <GridCell width="1-5">
                                <div className="uk-align-left">
                                    <Secure operations={["user.menu.manage"]}>
                                        <Button label="add" waves = {true} style="success" size="small" onclick = {() => this.handleSaveClick() } />
                                    </Secure>
                                </div>
                            </GridCell>
                        </Grid>
                    </Form>
                </GridCell>
                <GridCell width="1-1">
                    {this.renderAuthList()}
                </GridCell>

            </Grid>
        );
    }
}

export const MenuAuthorization = connect(
    function mapStateToProps(state) {
        return {
            menu: state.menuList.menu,
            auth: state.authState.auth,
            nodeTypes: state.authState.nodeTypes,
            authLevels: state.authState.authLevels,
            teams: state.authState.teams,
            departments: state.authState.departments,
            sectors: state.authState.sectors,
            subsidiaries: state.authState.subsidiaries,
            authList: state.authState.authList
        };
    },

    function mapDispatchToProps(dispatch) {
        return {
            fetchAuthLookups: () => dispatch(fetchAuthLookups()),
            updateAuthField: (key, value) => dispatch(updateAuthField(key, value)),
            addAuthorizationToList: (props) => dispatch(addAuthorizationToList(props)),
            confirmDeleteAuthorization: (auth) => dispatch(confirmDeleteAuthorization(auth)),
            editAuthorization: (auth) => {dispatch(editAuthorization(auth)); dispatch(deleteAuthorization(auth));},
        };
    },
)(_MenuAuthorization);

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