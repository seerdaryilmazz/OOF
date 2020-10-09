import React from 'react';
import { DropDown, Notify } from 'susam-components/basic';
import { Grid, GridCell } from 'susam-components/layout';
import { TeamService } from '../../services/AuthorizationService';


export class TeamSelector extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            teams: []
        };
    };

    componentDidMount() {
        TeamService.list().then(response=>{
            this.setState({teams: response.data});
        }).catch((error) => {
            Notify.showError(error);
        });
    }

    handleOnChange(value) {
        this.props.onChange && this.props.onChange(value);
    }

    render() {
        return (
            <Grid>
                <GridCell width="1-1" noMargin="true">
                    <DropDown label={this.props.label} required = {this.props.required}
                              value={this.props.value}
                              options={this.state.teams}
                              onchange={(value) => this.handleOnChange(value)}/>
                </GridCell>
            </Grid>
        );
    }
}
