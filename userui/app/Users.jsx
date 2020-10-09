import _ from 'lodash';
import React from 'react';
import { Button } from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';
import { Card } from 'susam-components/layout/Card';
import { CardHeader } from 'susam-components/layout/Header';
import { AuthorizationService, UserService } from '../services';

var membershipLevels = [
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
];

export class Users extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            users: []
        }
    }

    componentDidMount() {
        this.loadUsers(this.props.team);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.team !== this.props.team) {
            this.loadUsers(this.props.team);
        }
    }

    loadUsers(value) {
        if (value) {
            AuthorizationService.getUserByNode(value).then(response => {
                UserService.getUsers(response.data.map(user=>user.from.name)).then(usersResponse=>{
                    let activeUsernames = usersResponse.data.filter(i=>i.status.code === 'ACTIVE').map(i=>i.username);
                    let activeUsers = response.data.filter(r=>_.find(activeUsernames, i => i === r.from.name))
                    this.setState({ users: activeUsers });
                }).catch(error => {
                    Notify.showError(error);
                });
            }).catch(error => {
                Notify.showError(error);
            });
        } else {
            this.setState({ users: null });
        }
    }

    render() {
        return (
            <Card>
                <CardHeader title={this.props.title}/>
                <ul style={{ margin: "0", padding: "0" }}>
                    <li style={{ display: "inline" }}><Button style="success" flat={true} label="Add New User" size="small"></Button></li>
                </ul>
                <DataTable.Table data={this.state.users}
                    height="22vh" sortable={true} >
                    <DataTable.Text header="Name" field="from.name" sortable={true} />
                    <DataTable.Text header="Level" field="level" printer={new LevelPrinter()} sortable={true} />
                    <DataTable.Text header="Valid Between" field="membershipDateRange" printer={new DateRangePrinter()} sortable={true} />
                    <DataTable.ActionColumn >
                        <div style={{float:"right", marginRight: "48px"}}>
                            <DataTable.ActionWrapper track="onclick"
                                onaction={(item) => { this.handleDeactivateClick(item) }}>
                                <Button label="Remove" flat={true} style="danger" size="small" />
                            </DataTable.ActionWrapper>
                            <DataTable.ActionWrapper track="onclick"
                                onaction={(item) => { this.handleEditClick(item) }}>
                                <Button label="Edit User" flat={true} style="success" size="small" />
                            </DataTable.ActionWrapper>
                        </div>
                    </DataTable.ActionColumn>
                </DataTable.Table>
            </Card>
        );
    }
}

class LevelPrinter {
    print(data) {
        let level = _.find(membershipLevels, { id: data })
        return level ? level.name : "";
    }
}

class DateRangePrinter {
    print(data) {
        if(data.startDate || data.endDate){
            let text = "";
            text += data.startDate && data.startDate;
            text += " - ";
            text += data.endDate && data.endDate;
            return text;
        } else {
            return "Permanent";
        }
    }
}