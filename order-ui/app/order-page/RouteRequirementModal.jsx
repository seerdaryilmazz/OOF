import React from "react";
import _ from "lodash";
import {TranslatingComponent} from "susam-components/abstract";
import {DropDown, RadioGroup, Notify} from "susam-components/basic";
import {Chip} from "susam-components/advanced";
import {Grid, GridCell, Modal} from "susam-components/layout";
import {LocationService, OrderService} from "../services";
import * as axios from "axios";

export class RouteRequirementModal extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {requirement: {}, routeOptions: [], transportTypeOptions: [], permissionTypeOptions: []};
    }

    componentDidMount() {
        axios
            .all([
                OrderService.getTransportTypes(),
                OrderService.getPermissionTypes()])
            .then(axios.spread((transportTypeResponse, permissionTypeResponse) => {

                let routeOptions = [];
                let transportTypeOptions = transportTypeResponse.data;
                let permissionTypeOptions = permissionTypeResponse.data;

                this.setState({
                    routeOptions: routeOptions,
                    transportTypeOptions: transportTypeOptions,
                    permissionTypeOptions: permissionTypeOptions,
                });
            }))
            .catch(error => {
                Notify.showError(error);
            });
    }

    updateState(field, value) {
        let requirement = _.cloneDeep(this.state.requirement);
        requirement[field] = value;
        this.setState({requirement: requirement});
    }

    componentWillReceiveProps(nextProps) {
        let state = _.cloneDeep(this.state);
        state.requirement = nextProps.value;
        this.setState(state);
    }

    clear() {
        this.setState({requirement: {}});
    }

    handleSave() {
        this.props.onsave && this.props.onsave(this.state.requirement);
        this.modal.close();
    };

    handleClose() {
        this.modal.close();
    }

    show() {
        this.modal.open();
    }

    render() {
        return (
            <Modal ref={(c) => this.modal = c} title="New Route Requirement"
                   actions={[{label: "Close", action: () => this.handleClose()},
                       {label: "Save", buttonStyle: "primary", action: () => this.handleSave()}]}>
                <Grid>
                    <GridCell width="1-1" noMargin={true}>
                        <RadioGroup value={this.state.requirement.permissionType} inline={true}
                                    options={this.state.permissionTypeOptions}
                                    onchange={(value)=> this.updateState("permissionType", value)}>
                        </RadioGroup>
                    </GridCell>
                    <GridCell width="1-1">
                        <DropDown label="Transport Type" value={this.state.requirement.transportType}
                                  options={this.state.transportTypeOptions}
                                  onchange={(value)=> this.updateState("transportType", value)}>
                        </DropDown>
                    </GridCell>
                    <GridCell width="1-1">
                        <Chip label="Routes" valueField="routeId" labelField="name" options={this.state.routeOptions}
                              onchange={(value)=> this.updateState("routes", value)}
                              value={this.state.requirement.routes}/>
                    </GridCell>
                </Grid>
            </Modal>
        );
    }
}