import React from 'react';
import * as axios from 'axios';

import {Notify} from 'susam-components/basic';
import {Grid, GridCell} from 'susam-components/layout';
import {CompanySearchAutoComplete} from "susam-components/oneorder";

export class CustomerSelector extends React.Component {

    constructor(props) {
        super(props);
        this.state = {

        };
    };

    handleOnChange(value) {
        this.props.onChange && this.props.onChange(value);
    }

    handleOnClear() {
        this.handleOnChange(null);
    }

    render() {
        return (
            <Grid>
                <GridCell width="1-1" noMargin="true">
                    <CompanySearchAutoComplete label={this.props.label} required = {this.props.required}
                                               value={this.props.value}
                                               onchange={(value) => this.handleOnChange(value)}
                                               onclear={() => this.handleOnClear()}/>
                </GridCell>
            </Grid>
        );
    }
}
