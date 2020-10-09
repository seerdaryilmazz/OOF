import React from 'react';
import * as axios from 'axios';

import {Notify} from 'susam-components/basic';
import {Grid, GridCell} from 'susam-components/layout';
import {CompanySearchAutoComplete} from "susam-components/oneorder";

export class CustomerSelector extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            customer: props.value ? props.value : null
        };
    };

    handleOnChange(value) {
        this.setState({customer: value});
        if (this.props.onChange) {
            this.props.onChange(value);
        }
    }

    handleOnClear() {
        this.setState({customer: null});
        if (this.props.onChange) {
            this.props.onChange(null);
        }
    }

    render() {
        return (
            <Grid>
                <GridCell width="1-1" noMargin="true">
                    <CompanySearchAutoComplete label={this.props.label}
                                               value={this.state.customer}
                                               onchange={(value) => this.handleOnChange(value)}
                                               onclear={() => this.handleOnClear()}/>
                </GridCell>
            </Grid>
        );
    }
}
