import _ from "lodash";
import uuid from "uuid";
import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown} from "susam-components/basic";
import {ZoneMap} from '../zone/ZoneMap';

import {ZoneService, UserGroupZoneService} from "../services";


export class AssignUserGroupZone extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {userGroupZone: {}};
    }

    loadZoneTypes(){
        ZoneService.getZoneTypes().then(response => {
            this.setState({zoneTypes: response.data});
        }).catch(error => {
            Notify.showError(error);
        });
    }

    loadZones(zoneType) {
        ZoneService.getZonesWithType(zoneType).then(response => {
            this.setState({zones: response.data});
        }).catch(error => {
            Notify.showError(error);
        });
    }

    componentDidMount() {
        this.loadZoneTypes();
        if(this.props.userGroup){
            this.handleUserGroupSelect(this.props.userGroup);
        }
        if(this.props.userGroupZone){

        }
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.userGroup){
            this.handleUserGroupSelect(nextProps.userGroup)
        }
        if(nextProps.userGroupZone){

        }
    }

    handleUserGroupSelect(userGroup){
        let userGroupZone = _.cloneDeep(this.state.userGroupZone);
        userGroupZone.planningUserGroupId = userGroup.id;
        userGroupZone.planningUserGroupName = userGroup.name;
        this.setState({userGroupZone: userGroupZone});
    }

    handleSaveClick(){
        UserGroupZoneService.saveUserGroupZone(this.state.userGroupZone).then(response => {
            Notify.showSuccess("Zone assignment saved");
            this.props.onsave && this.props.onsave(this.state.userGroupZone);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    updateState(key, value){
        let userGroupZone = _.cloneDeep(this.state.userGroupZone);
        userGroupZone[key] = value;
        this.setState({userGroupZone: userGroupZone});
    }

    handleZoneTypeSelect(zoneType){
        this.setState({selectedZoneType: zoneType});
        this.loadZones(zoneType.code);
    }

    handleZoneSelect(zone){
        let userGroupZone = _.cloneDeep(this.state.userGroupZone);
        userGroupZone.zoneId = zone.id;
        userGroupZone.zoneName = zone.name;
        this.setState({userGroupZone: userGroupZone});

        ZoneService.getZone(zone.id).then(response => {
            this.setState({selectedZone: response.data});

        }).catch(error => {
            Notify.showError(error);
        })
    }

    render() {
        if(!this.props.userGroup){
            return null;
        }
        let title = "Assign zone for " + this.props.userGroup.name + " group";
        return (
            <Card title = {title}>
                <Grid>
                    <GridCell width="1-3">
                        <Grid>
                            <GridCell width="1-1">
                                <DropDown options = {this.state.zoneTypes} value = {this.state.selectedZoneType}
                                          onchange = {(value) => this.handleZoneTypeSelect(value)} label="Zone Type"/>
                            </GridCell>
                            <GridCell width="1-1">
                                <DropDown options = {this.state.zones} value = {this.state.userGroupZone.zoneId}
                                          onchange = {(value) => this.handleZoneSelect(value)} label="Zone" uninitializedText="Please select zone type"/>
                            </GridCell>
                            <GridCell width="1-1">
                                <Button label="save" style="primary" waves={true} onclick={() => this.handleSaveClick()}/>
                            </GridCell>
                        </Grid>
                    </GridCell>
                    <GridCell width="2-3">
                        <ZoneMap zone = {this.state.selectedZone}/>
                    </GridCell>
                </Grid>
            </Card>
        );
    }
}