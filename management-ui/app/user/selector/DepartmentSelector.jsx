import React from 'react';
import * as axios from 'axios';

import {Notify, DropDown} from 'susam-components/basic';
import {Grid, GridCell} from 'susam-components/layout';
import {AuthorizationService} from '../../services';

export class DepartmentSelector extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
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
        this.props.onChange && this.props.onChange(value);
    }

    render() {
        return (
            <Grid>
                <GridCell width="1-1" noMargin="true">
                    <DropDown label={this.props.label} required = {this.props.required}
                              value={this.props.value}
                              options={this.state.departments}
                              onchange={(value) => this.handleOnChange(value)}/>
                </GridCell>
            </Grid>
        );
    }
}
