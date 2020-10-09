import React from 'react';
import { Grid, GridCell } from "susam-components/layout";
import {AuthorizationService, UserService} from "../services";
import { Form, DropDown, Span } from 'susam-components/basic';
import { DateRange } from "susam-components/advanced";
import uuid from "uuid";
import _ from "lodash";

export class UserForm extends React.Component {

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
            membership: {
                to: this.props.team,
                from: {},
                level: {},
                type: {},
                membershipDateRange: {}
            }
        };
        this.loadUsers();
    }

    componentDidMount() {
        if (this.props.user && !_.isEmpty(this.props.user)) {
            this.setState({
                membership: this.convertMembershipToEdit(this.props.user),
                readOnly: true
            });
        }
    }

    loadUsers(){
        let filter = {
            username: null,
            displayName: null,
            inactiveUsers: false
        };
        UserService.searchUsers(filter).then(response => {
            this.setState({ users: response.data });
        }).catch((error) => {
            Notify.showError(error);
        });
    }

    convertMembershipToEdit(item) {
        let membership = {};
        membership.from = {};
        membership.from.id = item.from.externalId;
        membership.from.username = item.from.name;
        membership.from.type = item.from.type;
        membership.level = {id: item.level};
        if(item.membershipDateRange.startDate || item.membershipDateRange.endDate){
            membership.type = _.find(this.state.membershipTypes, {id: "TEMPORARY"});
            membership.membershipDateRange = item.membershipDateRange;
        }else{
            membership.type = _.find(this.state.membershipTypes, {id: "PERMANENT"});
        }
        membership._key = item._key || uuid.v4();
        return membership;
    }

    updateState(key, value) {
        let membership = _.cloneDeep(this.state.membership);
        if (key === 'from') {
            membership[key] = {};
            membership[key].username = value.username;
            membership[key].name = value.username;
            membership[key].externalId = value.id;
            membership[key].type = "User";
        }
        else if (key === 'level') {
            membership[key] = value.id;
        }
        else {
            membership[key] = value;
        }

        if(key==='type'){
            membership['membershipDateRange'] = null;
        }

        this.setState({membership: membership});
        this.props.onChange && this.props.onChange(membership, this.form);
    }

    render() {

        let dateRange = null;
        let isTemporary = _.get(this.state.membership, "type.id") == "TEMPORARY";
        if(isTemporary){
            let today = this.moment().format('DD/MM/YYYY');
            dateRange = <DateRange startDateLabel="Membership Starts At" endDateLabel="Membership Ends At"
                                   value = {this.state.membership.membershipDateRange} minDate = {today} required = {true}
                                   onchange = {(value) => this.updateState("membershipDateRange", value)} />;
        }

        let userInfo = null;
        if (this.state.readOnly) {
            userInfo = <Span label="User" value = {this.state.membership.from.username}/>
        }
        else {
            userInfo = <DropDown label="User Name" required = {true}
                      value={this.state.membership.from}
                      valueField="username"
                      labelField="displayName"
                      options={this.state.users}
                      onchange={(value) => this.updateState("from", value)}/>
        }

        return (
            <Grid>
                <GridCell width="1-1" noMargin = {true}>
                    <Form ref = {(c) => this.form = c}>
                        <Grid>
                            <GridCell width="2-4">
                                {userInfo}
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
                        </Grid>
                    </Form>
                </GridCell>
            </Grid>
        );
    }
}