import React from 'react';
import * as axios from 'axios';

import {Notify, DropDown} from 'susam-components/basic';
import {Grid, GridCell} from 'susam-components/layout';
import {AuthorizationService} from '../../services';

export class DepartmentSelector extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            department: props.value ? props.value : null,
            departments: []
        };
    };

    componentDidMount() {
        AuthorizationService.getAllDepartments().then((response) => {
            this.setState({departments: response.data});
        }).catch((error) => {
            Notify.showError(error);
        });
    }

    handleOnChange(value) {
        this.setState({department: value});
        if (this.props.onChange) {
            this.props.onChange(value);
        }
    }

    render() {
        return (
            <Grid>
                <GridCell width="1-1" noMargin="true">
                    <DropDown label={this.props.label}
                              value={this.state.department}
                              options={this.state.departments}
                              onchange={(value) => this.handleOnChange(value)}/>
                </GridCell>
            </Grid>
        );
    }
}
