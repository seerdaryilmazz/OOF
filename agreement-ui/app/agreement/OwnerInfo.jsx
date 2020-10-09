import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { LoadingIndicator } from "../utils";
import { Form, Notify, ReadOnlyDropDown } from 'susam-components/basic';
import { Chip } from "susam-components/advanced";
import { Grid, GridCell } from 'susam-components/layout';
import * as axios from 'axios';
import {LookupService} from "../services/LookupService";
import {UserService} from "../services/UserService";
import {withReadOnly} from "../utils";

export class OwnerInfo extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.initializeLookups();
    }

    initializeLookups() {
        axios.all([
            LookupService.getServiceAreas(),
            UserService.getUsers(),
            LookupService.getResponsbilityTypes()
        ]).then(axios.spread((serviceAreas, users, responsibilityTypes) => {
            let state = _.cloneDeep(this.state);
            state.serviceAreas = serviceAreas.data;
            state.users = users.data.map(user => {
                return {id: user.id, name: user.displayName}
            });
            state.responsibilityTypes = responsibilityTypes.data;
            state.busy = false;
            this.setState(state);
        })).catch(error => {
            this.setState({busy: false});
            Notify.showError(error);
        });
    }

    handleChange(key, value) {
        let ownerInfo = _.cloneDeep(this.props.ownerInfo);
        _.set(ownerInfo, key, value);
        this.props.onChange(ownerInfo);
    }

    validate() {
        return this.form.validate();
    }

    getContent() {
        return(
            <Grid>
                <GridCell width="1-3">
                    <ReadOnlyDropDown options={this.state.users} label="Name"
                                      required={true}
                                      readOnly={this.props.readOnly}
                                      value={this.props.ownerInfo.name}
                                      onchange = {(value) => this.handleChange("name", value)}/>
                </GridCell>
                <GridCell width="1-3">
                    <ReadOnlyDropDown options={this.state.responsibilityTypes} label="Responsibility Type"
                                      required={true}
                                      readOnly={this.props.readOnly}
                                      value={this.props.ownerInfo.responsibilityType}
                                      onchange = {(value) => this.handleChange("responsibilityType", value)}/>
                </GridCell>
                <GridCell width="1-3">
                    <ReadOnlyChip options = {this.state.serviceAreas} label="Service Areas" labelField="name"
                                  value = {this.props.ownerInfo.serviceAreas} hideSelectAll = {true}
                                  readOnly = {this.props.readOnly}  valueField="code"
                                  onchange = {(value) => {value ? this.handleChange("serviceAreas", value) : null}}/>
                </GridCell>
            </Grid>
        );
    }

    render() {
        return(
            <div>
                <LoadingIndicator busy={this.state.busy}/>
                <Form ref={c => this.form = c}>
                    {this.getContent()}
                </Form>
            </div>
        );
    }
}

const ReadOnlyChip = withReadOnly(Chip);