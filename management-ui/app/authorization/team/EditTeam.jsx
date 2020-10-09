import React from 'react';
import { DropDown, TextInput } from 'susam-components/basic';
import { Grid, GridCell } from "susam-components/layout";
import { AuthorizationService } from '../../services';
import { CustomerGroupSelector } from '../selector/CustomerGroupSelector';
import { CustomerSelector } from '../selector/CustomerSelector';
import { DepartmentSelector } from '../selector/DepartmentSelector';
import { SectorSelector } from '../selector/SectorSelector';
import { SubsidiarySelector } from '../selector/SubsidiarySelector';
import { TeamSelector } from '../selector/TeamSelector';

export class EditTeam extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            teamName: this.props.team ? this.props.team.name : null,
            team: this.props.team,
            node2Type: null,
            node2Types: AuthorizationService.getAllNodeLabelsForAuthorization(),
        };
    }

    handleNode2TypeChange(value) {
        this.setState({ node2Type: value });
        this.setState({ node: null }, () => {
            this.props.onValueChange && this.props.onValueChange(this.state.team, this.state.node);
        });
    }

    handleNode2Change(type, item) {
        let node = {
            externalId: item.id,
            type: type.id,
            name: item.name
        }
        this.setState({ node: node }, () => {
            this.props.onValueChange && this.props.onValueChange(this.state.team, this.state.node);
        });
    }

    handleTeamNameChange(value) {
        let team = this.props.team ? _.cloneDeep(this.props.team) : { type: "Team" }
        team.name = value
        this.setState({ team: team, teamName: value }, () => {
            this.props.onValueChange && this.props.onValueChange(this.state.team, this.state.node);
        });
    }

    renderSelector() {
        let selector = null;
        let node2Type = this.state.node2Type;
        if (node2Type && node2Type.id == AuthorizationService.NODE_TYPE_SUBSIDIARY) {
            selector = <SubsidiarySelector label="Subsidiary"
                value={this.state.subsidiary}
                onChange={(value) => this.handleNode2Change(this.state.node2Type, value)} />;
        } else if (node2Type && node2Type.id == AuthorizationService.NODE_TYPE_DEPARTMENT) {
            selector = <DepartmentSelector label="Department"
                value={this.state.department}
                onChange={(value) => this.handleNode2Change(this.state.node2Type, value)} />;
        } else if (node2Type && node2Type.id == AuthorizationService.NODE_TYPE_SECTOR) {
            selector = <SectorSelector label="Sector"
                allowSubsectors={false}
                value={[this.state.sector]}
                onChange={(value) => this.handleNode2Change(this.state.node2Type, value)} />;
        } else if (node2Type && node2Type.id == AuthorizationService.NODE_TYPE_CUSTOMER) {
            selector = <CustomerSelector label="Customer"
                value={this.state.customer}
                onChange={(value) => this.handleNode2Change(this.state.node2Type, value)} />;
        } else if (node2Type && node2Type.id == AuthorizationService.NODE_TYPE_TEAM) {
            selector = <TeamSelector label="Team"
                value={this.state.teamAsNode2}
                onChange={(value) => this.handleNode2Change(this.state.node2Type, value)} />;
        } else if (node2Type && node2Type.id == AuthorizationService.NODE_TYPE_CUSTOMER_GROUP) {
            selector = <CustomerGroupSelector label="Customer Service Portfolio"
                value={this.state.customerGroup}
                onChange={(value) => this.handleNode2Change(this.state.node2Type, value)} />;
        }
        return selector ? <GridCell>{selector}</GridCell> : null;
    }

    renderNode2Type() {
        if ("create" === this.props.behavior || "addRelation" === this.props.behavior) {
            return (
                <GridCell>
                    <DropDown label="Inherit From"
                        value={this.state.node2Type}
                        options={this.state.node2Types}
                        onchange={(value) => this.handleNode2TypeChange(value)} />
                </GridCell>
            );
        }
        return null;
    }
    renderTeamName() {
        if ("create" === this.props.behavior || "edit" === this.props.behavior) {
            return (
                <GridCell>
                    <TextInput label="Name"
                        value={this.state.teamName}
                        onchange={(value) => this.handleTeamNameChange(value)} />
                </GridCell>
            );
        }
        return null;
    }

    render() {
        return (
            <Grid>
                {this.renderTeamName()}
                {this.renderNode2Type()}
                {this.renderSelector()}
            </Grid>
        )
    }
}
