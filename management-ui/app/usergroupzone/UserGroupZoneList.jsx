import _ from "lodash";
import uuid from "uuid";
import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card} from "susam-components/layout";
import {TextInput, Button, Notify} from "susam-components/basic";

import {ZoneService, UserGroupZoneService} from "../services";


export class UserGroupZoneList extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        if(this.props.data){
            this.setState({userGroupZones: this.props.data, userGroup: this.props.userGroup});
        }
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.data){
            this.setState({userGroupZones: nextProps.data, userGroup: this.props.userGroup});
        }
    }

    handleDeleteClick(userGroupZone){
        UIkit.modal.confirm("This assignment will be deleted, are you sure ?",
            () => {
                UserGroupZoneService.deleteUserGroupZone(userGroupZone.id).then(response => {
                    Notify.showSuccess("Zone assignment deleted");
                    this.props.ondelete && this.props.ondelete();
                }).catch(error => {
                    Notify.showError(error);
                })
            }
        );
    }

    render() {
        if(!this.state.userGroupZones){
            return null;
        }

        let title = "Zones of " + this.props.userGroup.name + " group";
        let savedGroupZones = null;
        if(this.state.userGroupZones){
            savedGroupZones = <ul className="md-list">
                {this.state.userGroupZones.map(item => {
                    return <li key={item.id}>
                        <div className="md-list-content">
                            <Grid>
                                <GridCell width="5-6">
                                    <span className="md-list-heading">
                                        {item.planningUserGroupName} - {item.zoneName}
                                    </span>
                                </GridCell>
                                <GridCell width="1-6">
                                    <Button label="delete" style="success" flat = {true} size="small" waves={true} onclick={() => this.handleDeleteClick(item)}/>
                                </GridCell>
                            </Grid>

                        </div>
                    </li>
                })
                }
                </ul>;
        }
        return (
            <Card title = {title}>
                {savedGroupZones}
            </Card>
        );
    }
}