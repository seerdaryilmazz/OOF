import React from 'react';
import * as axios from 'axios';

import {Notify, DropDown} from 'susam-components/basic';
import {Grid, GridCell} from 'susam-components/layout';
import {KartoteksService} from '../../services';

export class SectorSelector extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
        };
    };

    componentDidMount() {
        KartoteksService.getParentSectors().then((response) => {
            this.setState({sectors: response.data});
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
                              options={this.state.sectors}
                              onchange={(value) => this.handleOnChange(value)}/>
                </GridCell>
            </Grid>
        );
    }
}
