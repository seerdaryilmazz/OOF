import _ from 'lodash';
import React from 'react';
import { Button, Notify } from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';
import { Card } from 'susam-components/layout/Card';
import { CardHeader } from 'susam-components/layout/Header';
import { Modal } from 'susam-components/layout/Modal';
import uuid from 'uuid';
import { AuthorizationService, UserService } from '../services';
import { UserForm } from "./UserForm";

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

const MODAL_CONTENT = {
    ADD_NEW_MEMBER: "ADD_NEW_MEMBER",
    EDIT_TEAM_MEMBER: "EDIT_TEAM_MEMBER"
};

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

    renderModalTitle(contentType){
        if (contentType === MODAL_CONTENT.ADD_NEW_MEMBER) {
            return "New User";
        } else if (contentType === MODAL_CONTENT.EDIT_TEAM_MEMBER) {
            return "Edit User";
        }
        return null;
    }

    renderModalActions() {
        let contentType = this.state.contentType;
        let actions = [{ label: "Cancel", action: () => this.modal.close(), buttonStyle: "mute" }];

        if (contentType === MODAL_CONTENT.ADD_NEW_MEMBER) {
            actions.push({label: "Save", action: () => this.handAddRelationForMember(), buttonStyle: "primary" });
        }
        else if (contentType === MODAL_CONTENT.EDIT_TEAM_MEMBER) {
            actions.push({label: "Save", action: () => this.handleEditRelationForMember(), buttonStyle: "primary" });
        }

        return actions;
    }

    renderModal() {
        return (
            this.state.contentType && <UserForm team={this.props.team}
                                                user={(this.state.contentType === MODAL_CONTENT.ADD_NEW_MEMBER ? {} : this.state.user)}
                                                onChange={(value, userForm) => this.handleMembersChange(value, userForm)} />
        );
    }

    handleMembersChange(value, isValid) {
        this.setState({ member: value, userForm: isValid });
    }

    handAddRelationForMember() {
        if (!this.state.userForm.validate()) {
            return;
        }
        AuthorizationService.mergeMemberOfRelation(this.state.member).then((response) => {
            Notify.showSuccess("Membership created successfully.");
            this.modal.close();
            this.loadUsers(this.props.team);
        }).catch((error) => {
            Notify.showError(error);
        });
    }

    handleEditRelationForMember() {
        if (!this.state.userForm.validate()) {
            return;
        }

        let membership = this.handleEditMember(this.state.member);

        AuthorizationService.deleteMemberOfRelation(this.state.user.from.id, this.props.team.id).then((response) => {
            return AuthorizationService.mergeMemberOfRelation(membership);
        }).then((response) => {
            Notify.showSuccess("Membership updated successfully.");
            this.modal.close();
            this.loadUsers(this.props.team);
        }).catch((error) => {
            Notify.showError(error);
        });

    }

    handleEditMember(member) {
        let membership = {}
        membership.to = this.props.team;
        membership.from = {
            externalId: this.state.user.from.id,
            name: this.state.user.from.name,
            type: member.from.type
        };

        if (member.level.id) {
            membership.level = member.level.id;
        }
        else {
            membership.level = member.level;
        }

        if (member.membershipDateRange) {
            membership.membershipDateRange = member.membershipDateRange;
        }
        else {
            membership.membershipDateRange = null;
        }
        membership._key = member._key || uuid.v4();
        return membership;
    }


    handleRemoveUser(item) {
        UIkit.modal.confirm("Are you sure?", () => {
            AuthorizationService.deleteMemberOfRelation(item.from.id, this.props.team.id).then((response) => {
                Notify.showSuccess("Membership deleted successfully.");
                this.modal.close();
                this.loadUsers(this.props.team);
            }).catch((error) => {
                Notify.showError(error);
            });
        });
    }

    handleEditClick(item) {
        this.setState({user: item}, () => this.openModal(MODAL_CONTENT.EDIT_TEAM_MEMBER));
    }

    openModal(contentType) {
        this.setState({contentType: contentType}, () => this.modal.open());
    }

    render() {
        let { hideAddUserButton, hideEditUserButton, hideRemoveUserButton } = this.props;
        let height = "22vh";
        if(this.props.height) {
            height = this.props.height;
        }

        return (
            <Card>
                <CardHeader title={this.props.title}/>
                {!hideAddUserButton &&
                <ul style={{ margin: "0", padding: "0" }}>
                    <li style={{ display: "inline" }}><Button style="success" flat={true} label="Add New User" size="small" onclick={() => this.openModal(MODAL_CONTENT.ADD_NEW_MEMBER)} ></Button></li>
                </ul>}
                <DataTable.Table data={this.state.users}
                    height={height} sortable={true} >
                    <DataTable.Text header="Name" field="from.name" sortable={true} />
                    <DataTable.Text header="Level" field="level" printer={new LevelPrinter()} sortable={true} />
                    <DataTable.Text header="Valid Between" field="membershipDateRange" printer={new DateRangePrinter()} sortable={true} />
                    {!hideEditUserButton && !hideRemoveUserButton && 
                    <DataTable.ActionColumn >
                        {!hideRemoveUserButton && 
                        <DataTable.ActionWrapper track="onclick"
                            onaction={(item) => { this.handleRemoveUser(item) }}>
                            <Button label="Remove" flat={true} style="danger" size="small" />
                        </DataTable.ActionWrapper>}
                        {!hideEditUserButton &&
                        <DataTable.ActionWrapper track="onclick"
                            onaction={(item) => { this.handleEditClick(item) }}>
                            <Button label="Edit User" flat={true} style="success" size="small" />
                        </DataTable.ActionWrapper>}
                    </DataTable.ActionColumn>}
                </DataTable.Table>
                <Modal
                    onclose={()=>this.setState({contentType: null})}
                    title={this.renderModalTitle(this.state.contentType)}
                    actions={this.renderModalActions()}
                    ref={c => this.modal = c}>
                    {this.renderModal()}
                </Modal>
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