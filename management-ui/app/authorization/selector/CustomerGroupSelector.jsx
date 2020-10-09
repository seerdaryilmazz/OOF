import React from "react";
import _ from "lodash";
import uuid from 'uuid';
import * as axios from "axios";

import {Notify, DropDown} from 'susam-components/basic';
import {Grid, GridCell} from 'susam-components/layout';
import {CustomerGroupService} from '../../services/AuthorizationService';

export class CustomerGroupSelector extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            customerGroup: props.value ? props.value : null,
            customerGroups: []
        };
    };

    componentDidMount() {
        CustomerGroupService.getAll().then((response) => {
            let customerGroups = _.sortBy(response.data, ["name"]);
            this.setState({customerGroups: customerGroups});
        }).catch((error) => {
            Notify.showError(error);
        });
    }

    handleOnChange(value) {
        this.setState({customerGroup: value});
        if (this.props.onChange) {
            this.props.onChange(value);
        }
    }

    render() {
        return (
            <Grid>
                <GridCell width="1-1" noMargin="true">
                    <DropDown label={this.props.label}
                              value={this.state.customerGroup}
                              options={this.state.customerGroups}
                              onchange={(value) => this.handleOnChange(value)}/>
                </GridCell>
            </Grid>
        );
    }
}
