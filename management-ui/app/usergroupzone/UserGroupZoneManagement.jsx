import _ from "lodash";
import uuid from "uuid";
import React from "react";

import {Grid, GridCell, PageHeader} from "susam-components/layout";
import {Notify} from "susam-components/basic";
import {List} from 'susam-components/list';

import {UserGroupList} from './UserGroupList';
import {UserGroupZoneList} from './UserGroupZoneList';
import {AssignUserGroupZone} from './AssignUserGroupZone';

import {ZoneService, UserGroupZoneService} from "../services";


export class UserGroupZoneManagement extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            zones: null,
            selectedUserGroup: null
        }
    }

    loadUserGroupZones(userGroupId){
        UserGroupZoneService.getUserGroupZones(userGroupId).then(response => {
            let state = _.cloneDeep(this.state);
            state.userGroupZones = response.data;
            this.setState(state);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    handleUserGroupSelected(userGroup){
        this.setState({selectedUserGroup: userGroup});
        this.loadUserGroupZones(userGroup.id);
    }

    handleUserGroupZoneSave(userGroupZone){
        this.loadUserGroupZones(userGroupZone.planningUserGroupId);
    }

    handleUserGroupZoneDelete(){
        this.loadUserGroupZones(this.state.selectedUserGroup.id);
    }

    render() {
        return (
            <div>
                <PageHeader title="User Group Zone Assignment"/>
                <Grid>
                    <GridCell width="1-1">
                        <Grid>
                            <GridCell width="1-2">
                                <UserGroupList onselect = {(userGroup) => this.handleUserGroupSelected(userGroup)}/>
                            </GridCell>
                            <GridCell width="1-2">
                                <UserGroupZoneList data = {this.state.userGroupZones}
                                                   ondelete = {() => this.handleUserGroupZoneDelete()}
                                                   userGroup = {this.state.selectedUserGroup}/>
                            </GridCell>
                        </Grid>
                    </GridCell>
                    <GridCell width="1-1">
                        <AssignUserGroupZone userGroup = {this.state.selectedUserGroup}
                                             onsave = {(userGroupZone) => this.handleUserGroupZoneSave(userGroupZone)}/>
                    </GridCell>
                </Grid>
            </div>
        );
    }
}