import * as axios from 'axios';
import _ from "lodash";
import React from 'react';
import { Button, DropDown, Notify } from 'susam-components/basic';
import { Card, Modal, Page } from 'susam-components/layout';
import { Grid, GridCell } from 'susam-components/layout/Grid';
import { CardHeader } from 'susam-components/layout/Header';
import Graph from '../authorization/graph';
import { AuthorizationService, UserService } from '../services';
import { CustomerGroupService, TeamService } from '../services/AuthorizationService';
import { CustomerGroups } from './CustomerGroups';
import { EditTeam } from './EditTeam';
import { Users } from './Users';
import { withAuthorization } from '../security';

var colors = {
    text: "black",
    nodes: {
        Team: "yellow",
        Department: "pink",
        Subsidiary: "cyan",
        Customer: "purple",
        CustomerGroup: "magenta"
    },
    links: {
        INHERIT: {
            stroke: "black",
            style: "4,4"
        }
    }
};

const MODAL_CONTENT = {
    CREATE_TEAM: "CREATE_TEAM",
    EDIT_NAME: "EDIT_NAME",
    EDIT_INHERITANCE: "EDIT_INHERITANCE"
}

const SecuredCustomerGroups = withAuthorization(CustomerGroups, ["customer-portfolio.manage"], {hideWhenNotAuthorized: true});
const SecuredUsers = withAuthorization(Users, ["user.manage"], {hideWhenNotAuthorized: true});
const SecuredPage = withAuthorization(Page, ["team.manage"], {hideWhenNotAuthorized: false});
export default class DepartmentManagement extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            team: null
        }
    }

    componentDidMount() {
        this.init();
    }

    init(team) {
        let calls = [
            AuthorizationService.getDepartmentTeams(this.props.params.code, { status: 'ACTIVE' }),
            AuthorizationService.getDepartmentByCode(this.props.params.code)
        ]

        axios.all(calls).then(axios.spread((teams, department) => {
            this.setState({ teams: teams.data, department: department.data });
            return AuthorizationService.getNode(department.data.id, 'department');
        })).then(response => {
            this.setState({ departmentNode: response.data });
            if (team) {
                this.handleTeamChange(team)
            } else {
                this.setState({ team: null, teamEntity: null });
            }
        });
    }

    handleTeamChange(value) {
        TeamService.get({ id: value.externalId }).then(response => {
            this.setState({ team: value, teamEntity: response.data }, () => this.loadGraph(value));
        });
    }

    loadGraph(value) {
        if (value) {
            AuthorizationService.getGraph(value).then(response => {
                this.setState({ graph: response.data });
            }).catch(error => {
                Notify.showError(error);
            });
        } else {
            this.setState({ graph: { nodes: [], links: [] } });
        }
    }

    deactivateTeam() {
        axios.all([
            AuthorizationService.getGraph(this.state.team, { depth: 1, direction: 'INCOMING' }),
            AuthorizationService.getActiveUserByNode(this.state.team),
        ]).then(axios.spread((inheritedNodes, userActiveMembership) => {
            let incomingNodes = _.reject(inheritedNodes.data.nodes, i => i.id === this.state.team.id);
            if (!_.isEmpty(incomingNodes)) {
                throw new Error("The team cannot be deactivated. There are teams which inherit from selected team.");
            }

            return axios.all([
                UserService.getUsers(userActiveMembership.data.map(u => u.from.name)),
                AuthorizationService.getUserByNode(this.state.team),
                CustomerGroupService.getByInheritedEntity(this.state.team),
                AuthorizationService.getGraph(this.state.team, { depth: 1, direction: 'OUTCOMING' }),
            ]);
        })).then(axios.spread((users, userMembership, customerGroup, inheritorNodes) => {
            let activeUsers = _.filter(users.data, i => i.status.code === 'ACTIVE');
            if (!_.isEmpty(customerGroup.data) || !_.isEmpty(activeUsers)) {
                throw new Error("Teams which are associated with portfolios or which have active members, cannot be deactivated.");
            }

            let removeRelationCalls = [];
            _.reject(inheritorNodes.data.nodes, i => i.id === this.state.team.id).forEach(node => {
                removeRelationCalls.push(AuthorizationService.deleteInheritRelation(this.state.team.id, node.id));
            });

            userMembership.data.forEach(membership => {
                removeRelationCalls.push(AuthorizationService.deleteMemberOfRelation(membership.from.id, membership.to.id));
            });

            return axios.all(removeRelationCalls);
        })).then(axios.spread(() => {
            let team = _.cloneDeep(this.state.teamEntity);
            team.status.id = 'INACTIVE';
            team.status.code = 'INACTIVE';
            return TeamService.updateStatus(team);
        })).then(response => {
            this.init();
            Notify.showSuccess("Team is deactivated");
        }).catch(error => Notify.showError(error));
    }

    renderGraph() {
        if (!this.state.team) {
            return null;
        }

        return (
            <Card>
                <CardHeader title={this.state.team && this.state.team.name} />
                <ul style={{ textAlign: "right", margin: "0", padding: "0" }}>
                    <li style={{ display: "inline" }}>
                        <Button style="danger" flat={true} label="Deactivate Team" size="small" onclick={() => Notify.confirm("Team will be deactivated. Are you sure?", () => this.deactivateTeam())} />
                    </li>
                    <li style={{ display: "inline" }}>
                        <Button style="success" flat={true} label="Edit Name" size="small" onclick={() => this.openModal(MODAL_CONTENT.EDIT_NAME)} />
                    </li>
                    <li style={{ display: "inline" }}>
                        <Button style="success" flat={true} label="Edit Inheritance" size="small" onclick={() => this.openModal(MODAL_CONTENT.EDIT_INHERITANCE)} />
                    </li>
                </ul>
                <Graph data={this.state.graph}
                    colors={colors}
                    height={`${window.innerHeight - 370}px`}
                    minHeight={`${window.innerHeight - 370}px`}
                    selectedNode={this.state.team}
                />
            </Card>
        );
    }

    renderUser() {
        if (!this.state.team) {
            return null;
        }

        return <SecuredUsers team={this.state.team} title="Team Members" />;
    }

    renderCustomerGroup() {
        if (!this.state.team) {
            return null;
        }

        return <SecuredCustomerGroups team={this.state.team} title="Customer Service Portfolios & Customers" onPortfolioChange={(value) => this.handlePortfolioChange(value)} />;
    }

    handlePortfolioChange(value) {
        this.loadGraph(value);
    }

    handleCreateTeam() {
        TeamService.getByName(this.state.edit.from.name, true).then(response => {
            if (!response || !response.data) {
                return AuthorizationService.mergeInheritRelation(this.state.edit);
            } else {
                throw new Error("Team with name " + response.data.name + " is exist");
            }
        }).then(response => {
            this.setState({ team: response.data.source }, () => this.init(this.state.team));
            this.modal.close();
        }).catch(error => {
            Notify.showError(error);
        });
    }

    handleUpdateTeam() {
        TeamService.getByName(this.state.edit.from.name, true).then(response => {
            if (!response || !response.data) {
                let team = _.cloneDeep(this.state.teamEntity);
                team.name = this.state.edit.from.name;
                team.code = this.state.edit.from.name;
                return TeamService.saveOrUpdate(team);
            } else {
                throw new Error("Team with name " + response.data.name + " is exist");
            }
        }).then(response => {
            return TeamService.getNode(response.data);
        }).then(response => {
            this.init(response.data);
            Notify.showSuccess("Team renamed");
            this.modal.close();
        }).catch(error => Notify.showError(error));
    }

    handleUpdateInheritance() {
        let { edit, team, relatedNode } = this.state;
        AuthorizationService.deleteInheritRelation(team.id, relatedNode.id).then(response => {
            return AuthorizationService.mergeInheritRelation(edit);
        }).then(response => {
            this.init(team);
            Notify.showSuccess("Team Inheritance is changed");
            this.modal.close();
        }).catch(error => Notify.showError(error));
    }

    initEdit(contentType, to) {
        let edit = {
            from: { type: 'Team' },
            to: null
        };
        if (MODAL_CONTENT.CREATE_TEAM !== contentType) {
            edit.from = _.cloneDeep(this.state.team);
            edit.to = to;
        }
        return edit;
    }

    handleEditTeam(value) {
        this.setState({
            edit: value
        });
    }

    renderModal() {
        if (this.state.contentType) {
            return <EditTeam teams={this.state.teams}
                department={this.state.departmentNode}
                mode={this.state.contentType}
                value={this.state.edit}
                onChange={value => this.handleEditTeam(value)} />
        }
        return null;
    }

    renderModalActions() {
        let contentType = this.state.contentType;
        let actions = [{ label: "Cancel", action: () => this.modal.close(), buttonStyle: "mute" }];

        if (contentType === MODAL_CONTENT.CREATE_TEAM) {
            actions.push({ label: "Save", action: () => this.handleCreateTeam(), buttonStyle: "primary" });
        } else if (contentType === MODAL_CONTENT.EDIT_NAME) {
            actions.push({ label: "Save", action: () => this.handleUpdateTeam(), buttonStyle: "primary" });
        } else if (contentType === MODAL_CONTENT.EDIT_INHERITANCE) {
            actions.push({ label: "Save", action: () => this.handleUpdateInheritance(), buttonStyle: "primary" });
        }

        return actions;
    }

    renderModalTitle(contentType) {
        if (contentType === MODAL_CONTENT.CREATE_TEAM) {
            return "New Team";
        } else if (contentType === MODAL_CONTENT.EDIT_NAME) {
            return "Edit Name";
        } else if (contentType === MODAL_CONTENT.EDIT_INHERITANCE) {
            return "Edit Inheritance"
        }
        return null;
    }

    openModal(contentType) {
        let openModal = true;
        let inheritFrom = [];
        let inheritTo = []
        if (MODAL_CONTENT.EDIT_INHERITANCE === contentType) {
            inheritFrom = _.filter(this.state.graph.links, i => i.target.type !== "CustomerGroup" && i.source.id === this.state.team.id);
            inheritTo = _.filter(this.state.graph.links, i => i.target.id === this.state.team.id);
            openModal = inheritFrom.length == 1 && inheritTo.length == 0;
        }
        if (openModal) {
            let relatedNode = _.first(inheritFrom.map(i => i.target));
            this.setState({ contentType: contentType, edit: this.initEdit(contentType, relatedNode), relatedNode: relatedNode }, () => this.modal.open());
        } else {
            Notify.showError(this.renderModalTitle(contentType) + " operation can non be made.");
        }
    }

    render() {
        let departmentName = this.state.department ? _.startCase(_.camelCase(this.state.department.name)) : "";
        return (
            <SecuredPage title={departmentName + " Teams"}>
                <Grid>
                    <GridCell width="3-8">
                        <DropDown options={this.state.teams}
                            value={this.state.team}
                            label={departmentName + " Team"}
                            onchange={value => this.handleTeamChange(value)} />
                    </GridCell>
                    <GridCell width="1-8">
                        <Button label="Create New" style="primary" fullWidth={true} onclick={() => this.openModal(MODAL_CONTENT.CREATE_TEAM)} />
                    </GridCell>
                    <GridCell width="1-2">
                    </GridCell>
                    <GridCell width="1-2">
                        {this.renderGraph()}
                    </GridCell>
                    <GridCell width="1-2">
                        {this.renderUser()}
                        {this.renderCustomerGroup()}
                    </GridCell>
                </Grid>
                <Modal
                    title={this.renderModalTitle(this.state.contentType)}
                    actions={this.renderModalActions()}
                    onclose={() => this.setState({ edit: this.initEdit(this.state.contentType) })}
                    ref={c => this.modal = c}>
                    {this.renderModal()}
                </Modal>
            </SecuredPage>
        );
    }
}
