import _ from "lodash";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { DateRange } from "susam-components/advanced";
import { Button, DropDown, Form, Notify } from "susam-components/basic";
import * as DataTable from 'susam-components/datatable';
import { CardHeader, Grid, GridCell } from "susam-components/layout";
import uuid from 'uuid';
import { AuthorizationService } from '../services';
import { CustomerSelector } from './selector/CustomerSelector';
import { DepartmentSelector } from './selector/DepartmentSelector';
import { SectorSelector } from './selector/SectorSelector';
import { SubsidiarySelector } from './selector/SubsidiarySelector';
import { TeamSelector } from './selector/TeamSelector';

export class UserMembership extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.moment = require("moment");
        this.state = {
            membershipLevels: [
                {
                    id: AuthorizationService.MEMBERSHIP_LEVEL_MEMBER,
                    name: AuthorizationService.MEMBERSHIP_LEVEL_MEMBER_LABEL
                },
                {
                    id: AuthorizationService.MEMBERSHIP_LEVEL_SUPERVISOR,
                    name: AuthorizationService.MEMBERSHIP_LEVEL_SUPERVISOR_LABEL
                },
                {
                    id: AuthorizationService.MEMBERSHIP_LEVEL_MANAGER,
                    name: AuthorizationService.MEMBERSHIP_LEVEL_MANAGER_LABEL
                }
            ],
            membershipTypes: [
                {id: "PERMANENT", name:"Permanent"},
                {id: "TEMPORARY", name:"Temporary"}
            ],
            membership: this.initMembership()
        };
    }

    initMembership(){
        return {nodeType: {id: AuthorizationService.NODE_TYPE_TEAM}};
    }

    componentDidMount() {
        this.setState({
            nodeLabels: AuthorizationService.getAllNodeLabelsForAuthorization()
        });
        $(`#parentOf-membershipTable-table`).css("max-height", `320px`);
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.user && nextProps.user.username != this.username){
            this.username = nextProps.user.username;
            this.setState({membership: this.initMembership()});
        }
    }

    updateState(key, value){
        let membership = _.cloneDeep(this.state.membership);
        membership[key] = value;
        if(key==='type'){
            membership['dateRange'] = null;
        }
        this.setState({membership: membership});
    }

    convertMembershipFromEdit(user, membership){
        let to = {type: membership.nodeType.id};
        switch (membership.nodeType.id) {
            case AuthorizationService.NODE_TYPE_DEPARTMENT:
                to.externalId = membership.department.id;
                to.name = membership.department.name;
                break;
            case AuthorizationService.NODE_TYPE_TEAM:
                to.externalId = membership.team.id;
                to.name = membership.team.name;
                break;
            case AuthorizationService.NODE_TYPE_SECTOR:
                to.externalId = membership.sector.id;
                to.name = membership.sector.name;
                break;
            case AuthorizationService.NODE_TYPE_SUBSIDIARY:
                to.externalId = membership.subsidiary.id;
                to.name = membership.subsidiary.name;
                break;
            case AuthorizationService.NODE_TYPE_CUSTOMER:
                to.externalId = membership.customer.id;
                to.name = membership.customer.name;
                break;
        }
        let converted = {};
        converted.to = to;
        converted.from = {
            externalId: user.id,
            name: user.name,
            type: "User"
        };
        converted.level = membership.level.id;
        if(membership.dateRange){
            converted.startDate = membership.dateRange.startDate;
            converted.endDate = membership.dateRange.endDate;
        }
        converted._key = membership._key || uuid.v4();
        return converted;
    }

    convertMembershipToEdit(listItem){
        let membership = {};
        membership.nodeType = {id: listItem.to.type, name: listItem.to.type};
        switch (listItem.to.type) {
            case AuthorizationService.NODE_TYPE_DEPARTMENT:
                membership.department = {};
                membership.department.id = listItem.to.externalId;
                membership.department.name = listItem.to.name;
                break;
            case AuthorizationService.NODE_TYPE_TEAM:
                membership.team = {};
                membership.team.id = listItem.to.externalId;
                membership.team.name = listItem.to.name;
                break;
            case AuthorizationService.NODE_TYPE_SECTOR:
                membership.sector = {};
                membership.sector.id = listItem.to.externalId;
                membership.sector.name = listItem.to.name;
                break;
            case AuthorizationService.NODE_TYPE_SUBSIDIARY:
                membership.subsidiary = {};
                membership.subsidiary.id = listItem.to.externalId;
                membership.subsidiary.name = listItem.to.name;
                break;
            case AuthorizationService.NODE_TYPE_CUSTOMER:
                membership.customer = {};
                membership.customer.id = listItem.to.externalId ;
                membership.customer.name = listItem.to.name;
                break;
        }
        membership.level = {id: listItem.level};
        if(listItem.startDate || listItem.endDate){
            membership.type = _.find(this.state.membershipTypes, {id: "TEMPORARY"});
            membership.dateRange = {
                startDate: listItem.startDate,
                endDate: listItem.endDate
            }
        }else{
            membership.type = _.find(this.state.membershipTypes, {id: "PERMANENT"});
        }
        membership._key = listItem._key || uuid.v4();
        return membership;
    }
    handleAddMembershipClick() {
        if (!this.form.validate()) {
            return;
        }
        let memberships = _.cloneDeep(this.props.user.memberships) || [];
        let newMembership = this.convertMembershipFromEdit(this.props.user, this.state.membership);
        let existing = _.find(memberships, (each) => {
            return each.to.type ==  newMembership.to.type && (
                (each.to.id && each.to.id == newMembership.to.id) ||
                (each.to.externalId && each.to.externalId == newMembership.to.externalId)
                );
        });
        if(existing){
            Notify.showError("There is a membership for the same type");
            return;
        }
        memberships.push(newMembership);
        this.props.onChange && this.props.onChange(memberships);
    }
    handleSaveMembershipClick() {
        if (!this.form.validate()) {
            return;
        }
        let memberships = _.cloneDeep(this.props.user.memberships);
        let membership = this.convertMembershipFromEdit(this.props.user, this.state.membership);
        let index = _.findIndex(memberships, {_key: membership._key});
        if(index != -1){
            memberships[index] = membership;
        }
        this.setState({membership: this.initMembership()}, () => this.props.onChange && this.props.onChange(memberships));
    }
    handleEditMembershipClick(item) {
        this.setState({membership: this.convertMembershipToEdit(item)});
    }

    handleDeleteMembershipClick(item) {
        UIkit.modal.confirm("Are you sure?", () => {
            let memberships = _.cloneDeep(this.props.user.memberships);
            _.remove(memberships, {_key: item._key});
            this.props.onChange && this.props.onChange(memberships);
        });
    }

    renderSelector(){
        let nodeTypeId = _.get(this.state, "membership.nodeType.id");
        if(nodeTypeId == AuthorizationService.NODE_TYPE_SUBSIDIARY){
            return <SubsidiarySelector label="Subsidiary" required = {true}
                                           value={this.state.membership.subsidiary}
                                           onChange={(value) => this.updateState("subsidiary", value)}/>
        }else if(nodeTypeId == AuthorizationService.NODE_TYPE_DEPARTMENT){
            return <DepartmentSelector label="Department" required = {true}
                                           value={this.state.membership.department}
                                           onChange={(value) => this.updateState("department", value)}/>
        }else if(nodeTypeId == AuthorizationService.NODE_TYPE_SECTOR){
            return <SectorSelector label="Sector" required = {true}
                                           value={this.state.membership.sector}
                                           onChange={(value) => this.updateState("sector", value)}/>
        }else if(nodeTypeId == AuthorizationService.NODE_TYPE_CUSTOMER){
            return <CustomerSelector label="Customer" required = {true}
                                   value={this.state.membership.customer}
                                   onChange={(value) => this.updateState("customer", value)}/>
        }else if(nodeTypeId == AuthorizationService.NODE_TYPE_TEAM){
            return <TeamSelector label="Team" required = {true}
                                     value={this.state.membership.team}
                                     onChange={(value) => this.updateState("team", value)}/>
        }
        return null;
    }

    render(){
        let saveButton = <Button label="add" waves = {true} style="success" size="small" onclick = {() => this.handleAddMembershipClick() } />;
        if(this.state.membership && this.state.membership._key){
            saveButton = <Button label="save" waves = {true} style="success" size="small" onclick = {() => this.handleSaveMembershipClick() } />;
        }
        let dateRange = null;
        let isTemporary = _.get(this.state.membership, "type.id") == "TEMPORARY";
        if(isTemporary){
            let today = this.moment().format('DD/MM/YYYY');
            dateRange = <DateRange startDateLabel="Membership Starts At" endDateLabel="Membership Ends At"
                       value = {this.state.membership.dateRange} minDate = {today} required = {true}
                       onchange = {(value) => this.updateState("dateRange", value)} />;
        }
        return(

                <Grid>
                    <GridCell width="1-1">
                        <CardHeader title="Memberships"/>
                    </GridCell>
                    <GridCell width="1-1" noMargin = {true}>
                        <Form ref = {(c) => this.form = c}>
                            <Grid>
                                <GridCell width="2-4">
                                    {this.renderSelector()}
                                </GridCell>
                                <GridCell width="1-4">
                                    <DropDown label="Membership Type" options = {this.state.membershipLevels} required = {true}
                                              value = {this.state.membership.level}
                                              onchange = {(value) => this.updateState("level", value)} />
                                </GridCell>
                                <GridCell width="1-4">
                                    <DropDown label="Type" options = {this.state.membershipTypes} required = {true}
                                              value = {this.state.membership.type}
                                              onchange = {(value) => this.updateState("type", value)}/>
                                </GridCell>
                                <GridCell width="3-4">
                                    {dateRange}
                                </GridCell>
                                <GridCell width="1-4">
                                    <div className="uk-margin-top uk-text-right">
                                    {saveButton}
                                    </div>
                                </GridCell>
                            </Grid>
                        </Form>
                    </GridCell>
                    <GridCell width="1-1">
                        <DataTable.Table id="membershipTable"
                            data={this.props.user.memberships}
                                         sortable = {true}>
                            <DataTable.Text header="Type" width="15" field="to.type"/>
                            <DataTable.Text header="Name" width="25" field="to.name"/>
                            <DataTable.Text header="Level" width="15" reader={new AuthLevelReader(this.state.membershipLevels)}/>
                            <DataTable.Text header="Valid Between" width="25" reader={new DateRangeReader()}/>
                            <DataTable.ActionColumn>
                                <DataTable.ActionWrapper shouldRender={data=>data.to.type === 'Team'} track="onclick" onaction={(data) => {this.handleEditMembershipClick(data)}}>
                                    <Button label="Edit" flat={true} style="success" size="small"/>
                                </DataTable.ActionWrapper>
                            </DataTable.ActionColumn>
                            <DataTable.ActionColumn>
                                <DataTable.ActionWrapper track="onclick" onaction={(data) => {this.handleDeleteMembershipClick(data)}}>
                                    <Button label="Delete" flat={true} style="danger" size="small"/>
                                </DataTable.ActionWrapper>
                            </DataTable.ActionColumn>
                        </DataTable.Table>
                    </GridCell>
                </Grid>

        );
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

class DateRangeReader{

    readCellValue(row) {
        let result = "";
        if(row.startDate && row.endDate){
            result = row.startDate + " - " + row.endDate;
        }else if(row.startDate){
            result = row.startDate + " - ..." ;
        }else if(row.endDate){
            result = "... - " + row.endDate;
        }
        return result;
    }
    readSortValue(row) {
        return this.readCellValue(row);
    }
}