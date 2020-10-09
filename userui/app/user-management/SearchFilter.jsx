import _ from "lodash";
import * as axios from 'axios';
import React from "react";
import uuid from 'uuid';

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card, Loader, CardHeader, PageHeader} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown, Form, Checkbox} from "susam-components/basic";
import {DateRange} from "susam-components/advanced";
import {CompanySearchAutoComplete} from 'susam-components/oneorder';
import * as DataTable from 'susam-components/datatable';

import {AuthorizationService, KartoteksService, UserService} from '../services';

export class SearchFilter extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {filter: {}};
    }

    componentDidMount() {

    }

    updateFilterState(key, value) {
        let filter = _.cloneDeep(this.state.filter);
        filter[key] = value;
        this.setState({filter: filter});
    }

    handleSearchClick() {
        this.props.onSearch && this.props.onSearch(this.state.filter);
    }

    render(){
        return(
            <Grid>
                <GridCell width="1-1" noMargin = {true}>
                    <CardHeader title="Filter"/>
                </GridCell>
                <GridCell width="2-5">
                    <TextInput label="Display Name"
                               value = {this.state.filter.displayName}
                               onchange = {(value) => this.updateFilterState("displayName", value)} />
                </GridCell>
                <GridCell width="1-5">
                    <TextInput label="Username"
                               value = {this.state.filter.username}
                               onchange = {(value) => this.updateFilterState("username", value)} />
                </GridCell>
                <GridCell width="1-5">
                    <div className="uk-margin-top">
                    <Checkbox label="Inactive Users"
                              value = {this.state.filter.inactiveUsers}
                              onchange = {(value) => this.updateFilterState("inactiveUsers", value)} />
                    </div>
                </GridCell>
                <GridCell width="1-5">
                    <div className="uk-align-right uk-margin-top">
                        <Button label="search" style="success" waves = {true} size="small" onclick = {() => this.handleSearchClick()} />
                    </div>
                </GridCell>
            </Grid>
        );
    }

}