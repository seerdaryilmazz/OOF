import React from 'react';
import { Button, Checkbox, DropDown, Notify } from "susam-components/basic";
import { Grid, GridCell, Page, Secure } from "susam-components/layout";
import { Card } from 'susam-components/layout/Card';
import { CardHeader } from 'susam-components/layout/Header';
import { Modal } from "susam-components/layout/Modal";
import { Users } from '../../department-management/Users';
import { AuthorizationService } from "../../services";
import { TeamService } from "../../services/AuthorizationService";
import Graph from '../graph';
import { EditTeam } from "./EditTeam";
import { RemoveRelation } from './RemoveRelation';

export default class TeamManagement extends React.Component {

    modalContentTypes = {
        create: "create",
        edit: "edit",
        addRelation: "addRelation",
        removeRelation: "removeRelation",
    }

    colors = {
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

    teamStatusStyle = {
        ACTIVE: {
            style: "danger",
            label: "DEACTIVE",
            onclick: () => Notify.confirm("Team will be INACTIVE. Are you sure?", () => this.updateTeamStatus('INACTIVE'))
        },
        INACTIVE: {
            style: "primary",
            label: "ACTIVE",
            onclick: () => Notify.confirm("Team will be ACTIVE. Are you sure?", () => this.updateTeamStatus('ACTIVE'))
        }
    };

    constructor(props) {
        super(props);
        this.state = {
            graph: this.initGraphData(),
            inherit: {},
            teamStatus: false,
            selectedTeamStatus: null
        }
    }

    initGraphData() {
        return {
            nodes: [],
            links: []
        };
    }

    componentDidMount() {
        this.loadTeams(this.adjustStatus());
    }

    updateTeamStatus(status) {
        let team = _.cloneDeep(this.state.team);
        team.status.id = status;
        team.status.code = status;
        TeamService.updateStatus(team).then(response => {
            this.loadTeams(this.adjustStatus(), (teams) => {
                if (_.find(teams, { id: response.data.id })) {
                    this.handleTeamChange(response.data);
                } else {
                    this.setState({
                        team: null,
                        selectedNode: null,
                        graph: {
                            nodes: [],
                            links: []
                        }
                    });
                }
            })
        }).catch(error => {
            Notify.showError(error);
        });
    }

    loadTeams(status, callback) {
        TeamService.list(status).then(response => {
            this.setState({ teams: response.data }, () => callback && callback(this.state.teams));
        }).catch(error => {
            Notify.showError(error);
        });
    }

    loadGraph(value) {
        if(value){
            TeamService.getNode(value).then(response => {
                this.setState({ selectedNode: response.data }, () => {
                    AuthorizationService.getGraph(response.data).then(response => {
                        this.setState({ graph: response.data });
                    }).catch(error => {
                        Notify.showError(error);
                    });
                })
            }).catch(error => {
                Notify.showError(error);
            });
        } else {
            this.setState({
                selectedNode: undefined,
                graph: this.initGraphData()
            });
        }
    }

    expandGraph(value, depth) {
        AuthorizationService.getGraph(value, { depth: depth }).then(response => {
            let graph = _.cloneDeep(this.state.graph);
            graph.nodes = _.unionWith(graph.nodes, response.data.nodes, (x, y) => _.isEqual(x.id, y.id));
            graph.links = _.unionWith(graph.links, response.data.links, (x, y) => _.isEqual(x.source.id, y.source.id) && _.isEqual(x.target.id, y.target.id));
            this.setState({ graph: graph });
        }).catch(error => {
            Notify.showError(error);
        });
    }

    handleTeamChange(value) {
        this.setState({ team: value }, () => {
            this.loadGraph(value);
        });
    }

    handleDeleteRelation() {
        let { selectedNode, node } = this.state;
        AuthorizationService.deleteInheritRelation(selectedNode.id, node.id).then((response) => {
            this.loadTeams(this.adjustStatus(), () => {
                this.loadGraph(this.state.team);
                this.modal.close();
            });
        }).catch((error) => {
            Notify.showError(error);
        });
    }

    handleCreateTeam() {
        TeamService.getByName(this.state.selectedNode.name, true).then(response => {
            if (!response.data) {
                this.handleAddRelation();
            } else {
                Notify.showError("Team with name " + response.data.name + " is exist");
            }
        })
    }

    handleAddRelation() {
        let inherit = {
            to: this.state.node,
            from: this.state.selectedNode
        }
        AuthorizationService.mergeInheritRelation(inherit).then(response => {
            this.loadTeams(this.adjustStatus(), teams => {
                let team = _.find(teams, { id: response.data.source.externalId });
                this.setState({ team: team }, () => {
                    this.loadGraph(this.state.team);
                });
                this.modal.close();
            });
        }).catch((error) => {
            Notify.showError(error);
        });
    }

    handleUpdateTeam() {
        let team = _.cloneDeep(this.state.team);
        team.name = this.state.selectedNode.name;
        TeamService.getByName(team.name, true).then(response => {
            if (response.data && response.data.id !== team.id) {
                Notify.showError("Team with name " + response.data.name + " is exist");
            } else {
                return TeamService.saveOrUpdate(team);
            }
        }).then(response => {
            if(response){
                this.loadTeams(this.adjustStatus(), teams => {
                    team = _.find(teams, { id: response.data.id });
                    this.setState({ team: team }, () => {
                        this.loadGraph(team);
                    });
                    this.modal.close();
                });
            }
        }).catch((error) => {
            Notify.showError(error);
        });
    }

    handleEditTeam(team, node) {
        this.setState({
            selectedNode: team,
            node: node
        });
    }

    adjustStatus(value) {
        let isChecked = _.isUndefined(value) ? this.state.teamStatus : value;
        let status = ['ACTIVE'];
        if (isChecked) {
            status.push('INACTIVE');
        }
        return status;
    }

    handleTeamStatusChange(value) {
        this.loadTeams(this.adjustStatus(value), teams => {
            let state = {
                teamStatus: value,
            }
            let team = _.cloneDeep(this.state.team);
            if (team) {
                if (0 > _.findIndex(teams, { id: team.id })) {
                    team = null;
                    state.graph = { nodes: [], links: [] };
                }
                state.team = team;
            }
            this.setState(state);
        });
    }

    handleOpenModel(modalContentType) {
        if (this.modalContentTypes.create !== modalContentType && !this.state.team) {
            Notify.showError("team must be selected")
            return;
        }
        this.setState({ modalContentType: modalContentType }, () => this.modal.open())
    }

    isActive() {
        if (!this.state.team) {
            return false;
        } else if (!this.state.team.status) {
            return false;
        } else {
            return 'ACTIVE' === this.state.team.status.code;
        }
    }

    renderModalContent(modalContentType) {
        if (this.modalContentTypes.create === modalContentType) {
            return <EditTeam onValueChange={(team, node) => this.handleEditTeam(team, node)} behavior={modalContentType} />
        }
        if (this.modalContentTypes.edit === modalContentType) {
            return <EditTeam team={this.state.selectedNode} onValueChange={(team) => this.handleEditTeam(team)} behavior={modalContentType} />
        }
        if (this.modalContentTypes.addRelation === modalContentType) {
            return <EditTeam team={this.state.selectedNode} onValueChange={(team, node) => this.handleEditTeam(team, node)} behavior={modalContentType} />
        }
        if (this.modalContentTypes.removeRelation === modalContentType) {
            return <RemoveRelation team={this.state.selectedNode} onValueChange={(team, node) => this.handleEditTeam(team, node)} />
        }
        return null;

    }

    renderModalActions(modalContentType) {
        let actions = [];
        actions.push({ label: "Cancel", action: () => this.modal.close(), buttonStyle: "mute" });
        if (this.modalContentTypes.create === modalContentType) {
            actions.push({ label: "Save", action: () => this.handleCreateTeam(), buttonStyle: "primary" })
        }
        if (this.modalContentTypes.edit === modalContentType) {
            actions.push({ label: "Save", action: () => this.handleUpdateTeam(), buttonStyle: "primary" })
        }
        if (this.modalContentTypes.addRelation === modalContentType) {
            actions.push({ label: "Save", action: () => this.handleAddRelation(), buttonStyle: "primary" })
        }
        if (this.modalContentTypes.removeRelation === modalContentType) {
            actions.push({ label: "Save", action: () => this.handleDeleteRelation(), buttonStyle: "primary" })
        }
        return actions;
    }

    renderModalTitle(modalContentType) {
        if (this.modalContentTypes.create === modalContentType) {
            return "New Team";
        }
        if (this.modalContentTypes.edit === modalContentType) {
            return "Edit Team Name";
        }
        if (this.modalContentTypes.addRelation === modalContentType) {
            return "New Relation";
        }
        if (this.modalContentTypes.removeRelation === modalContentType) {
            return "Remove Relation";
        }
        return "";
    }

    render() {
        let changeStatusButton = this.state.team && this.state.team.status ? (
                <Button
                    label={this.teamStatusStyle[this.state.team.status.code].label}
                    size="small"
                    style={this.teamStatusStyle[this.state.team.status.code].style}
                    onclick={this.teamStatusStyle[this.state.team.status.code].onclick}
                    fullWidth={true}
                />) : null;
        return (
            <Page title="Team Inheritence">
                <Grid>
                    <GridCell width="1-3">
                        <DropDown label="Team" value={this.state.team}
                            options={this.state.teams}
                            onchange={value => this.handleTeamChange(value)} />
                        <Checkbox
                            value={this.state.teamStatus}
                            label="List Inactive Teams"
                            onchange={value => this.handleTeamStatusChange(value)}
                        />
                    </GridCell>
                    <GridCell width="1-6">
                        <Button
                            label="Create New"
                            size="small"
                            style="primary"
                            onclick={() => this.handleOpenModel(this.modalContentTypes.create)}
                        />
                    </GridCell>
                    <GridCell width="1-2">
                        <Grid collapse={true}>
                            <GridCell width="1-2">
                                <Button
                                    label="Edit Name"
                                    size="small"
                                    style="success"
                                    fullWidth={true}
                                    disabled={!this.isActive()}
                                    onclick={() => this.handleOpenModel(this.modalContentTypes.edit)}
                                />
                            </GridCell>
                            <GridCell width="1-2">
                                {changeStatusButton}
                            </GridCell>
                            <GridCell width="1-2">
                                <Button
                                    label="Add New Relation"
                                    size="small"
                                    style="success"
                                    fullWidth={true}
                                    disabled={!this.isActive()}
                                    onclick={() => this.handleOpenModel(this.modalContentTypes.addRelation)}
                                />
                            </GridCell>
                            <GridCell width="1-2">
                                <Button
                                    label="Remove Relation"
                                    size="small"
                                    style="danger"
                                    fullWidth={true}
                                    disabled={!this.isActive()}
                                    onclick={() => this.handleOpenModel(this.modalContentTypes.removeRelation)}
                                />
                            </GridCell>
                        </Grid>
                    </GridCell>
                    {this.state.team && <GridCell width="3-4">
                        <Card>
                            {this.state.team && <CardHeader title={_.get(this.state,'team.name')} />}
                            <Graph data={this.state.graph}
                                colors={this.colors}
                                selectedNode={this.state.selectedNode}
                                onNodeDoubleClick={(node, depth) => this.expandGraph(node, _.isNumber(depth) ? depth : 1)}
                                onNodeSelect={node => this.handleNodeSelect(node)}
                                width="100%"
                                minHeight={`${window.innerHeight-290}px`} />
                        </Card>
                    </GridCell>}
                    {this.state.team && <GridCell width="1-4">
                        <Secure operations={["user.manage"]}>
                            <Users 
                                height="100%"
                                hideAddUserButton={true}
                                hideEditUserButton={true}
                                hideRemoveUserButton={true}
                                team={this.state.selectedNode} 
                                title="Team Members" />
                        </Secure>
                    </GridCell>}
                </Grid>
                <Modal
                    ref={c => this.modal = c}
                    onclose={() => this.setState({ modalContentType: null })}
                    title={this.renderModalTitle(this.state.modalContentType)}
                    actions={this.renderModalActions(this.state.modalContentType)}
                >
                    {this.renderModalContent(this.state.modalContentType)}
                </Modal>
            </Page>
        )

    }
}