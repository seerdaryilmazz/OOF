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
            subsidiary: props.value ? props.value : null,
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
        this.setState({subsidiary: value});
        if (this.props.onChange) {
            this.props.onChange(value);
        }
    }

    render() {
        return (
            <Grid>
                <GridCell width="1-1" noMargin="true">
                    <DropDown label={this.props.label}
                              value={this.state.subsidiary}
                              options={this.state.subsidiaries}
                              onchange={(value) => this.handleOnChange(value)}/>
                </GridCell>
            </Grid>
        );
    }
}
