import * as axios from 'axios';
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Chip } from "susam-components/advanced";
import { Form, Notify, ReadOnlyDropDown } from 'susam-components/basic';
import { Grid, GridCell } from 'susam-components/layout';
import { LookupService } from "../services/LookupService";
import { LoadingIndicator, withReadOnly } from "../utils";

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
            LookupService.getResponsbilityTypes()
        ]).then(axios.spread((serviceAreas, responsibilityTypes) => {
            this.setState({
                serviceAreas: serviceAreas.data,
                users: this.context.getUsers().map(user => ({id: user.id, name: user.displayName})),
                responsibilityTypes: responsibilityTypes.data,
                busy: false,
            });
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
                                      required={true} translate={true}
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

OwnerInfo.contextTypes = {
    getUsers: React.PropTypes.func,
    getAllUsers: React.PropTypes.func,
}

const ReadOnlyChip = withReadOnly(Chip);