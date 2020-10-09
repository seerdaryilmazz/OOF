import React from 'react';
import * as axios from 'axios';

import {Notify, DropDown} from 'susam-components/basic';
import {Grid, GridCell} from 'susam-components/layout';
import {TeamService} from '../../services/AuthorizationService';

export class TeamSelector extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            team: props.value ? props.value : null,
            teams: []
        };
    };

    componentDidMount() {
        TeamService.list().then((response) => {
            this.setState({teams: response.data});
        }).catch((error) => {
            Notify.showError(error);
        });
    }

    handleOnChange(value) {
        let selectedTeam = _.find(this.state.teams, {id: value.id});
        this.setState({team: selectedTeam});
        if (this.props.onChange) {
            this.props.onChange(selectedTeam);
        }
    }

    render() {
        return (
            <Grid>
                <GridCell width="1-1" noMargin="true">
                    <DropDown label={this.props.label}
                              value={this.state.team}
                              options={this.state.teams}
                              onchange={(value) => this.handleOnChange(value)}/>
                </GridCell>
            </Grid>
        );
    }
}
