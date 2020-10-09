import React from "react";
import _ from "lodash";
import uuid from 'uuid';
import * as axios from "axios";

import {Notify, DropDown} from 'susam-components/basic';
import {Grid, GridCell} from 'susam-components/layout';
import {AuthorizationService} from '../../services';

export class SubsidiarySelector extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            subsidiaries: []
        };
    };

    componentDidMount() {
        AuthorizationService.getSubsidiaries().then((response) => {
            let subsidiaries = response.data;
            subsidiaries = _.sortBy(subsidiaries, ["name"]);
            this.setState({subsidiaries: subsidiaries});
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
                              options={this.state.subsidiaries}
                              onchange={(value) => this.handleOnChange(value)}/>
                </GridCell>
            </Grid>
        );
    }
}
