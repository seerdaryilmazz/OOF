import React from "react";
import _ from "lodash";
import {TranslatingComponent} from "susam-components/abstract";
import {DropDown, RadioGroup, Notify} from "susam-components/basic";
import {Chip} from "susam-components/advanced";
import {Grid, GridCell, Modal} from "susam-components/layout";
import {OrderService, VehicleService} from "../../services/";
import * as axios from "axios";

export class VehicleRequirementModal extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {requirement: {}, permissionTypeOptions: [], vehicleTypeOptions: [], vehicleDetailTypeOptions: []};
    }

    componentDidMount() {
        axios.all([
            OrderService.getPermissionTypes(),
            OrderService.getVehicleTypes()
        ]).then(axios.spread((permissionTypeResponse, vehicleTypeResponse) => {
            let permissionTypeOptions = permissionTypeResponse.data;

            this.setState({
                permissionTypeOptions: permissionTypeOptions,
                vehicleTypeOptions: vehicleTypeResponse.data
            });
        })).catch(error => {
            Notify.showError(error);
        });
    }

    updateState(field, value) {
        let requirement = _.cloneDeep(this.state.requirement);
        requirement[field] = value;

        if ("vehicleType" == field) {
            requirement["vehicleFeatures"] = null;
            if (value) {
                if(value.code == "TRAILER") {
                    VehicleService.trailerProperties().then(response => {
                        this.setState({requirement: requirement, vehicleDetailTypeOptions: response.data});
                    }).catch(error => {
                        Notify.showError(error);
                    });

                } else if(value.code == "TRUCK") {
                    VehicleService.truckProperties().then(response => {
                        this.setState({requirement: requirement, vehicleDetailTypeOptions: response.data});
                    }).catch(error => {
                        Notify.showError(error);
                    });
                }
            } else {
                this.setState({vehicleDetailTypeOptions: [], requirement: requirement});
            }
        } else {
            this.setState({requirement: requirement});
        }
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
        let details = null;
        if (this.state.vehicleDetailTypeOptions.length > 0) {
            details =
                <GridCell width="1-1">
                    <Chip valueField="id" labelField="name" options={this.state.vehicleDetailTypeOptions}
                          label="Details"
                          onchange={(value)=> this.updateState("vehicleFeatures", value)}
                          value={this.state.requirement.vehicleFeatures}/>
                </GridCell>;
        }

        return (
            <Modal ref={(c) => this.modal = c} title="New Vehicle Requirement"
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
                        <DropDown label="Vehicle" value={this.state.requirement.vehicleType}
                                  options={this.state.vehicleTypeOptions}
                                  onchange={(value)=> this.updateState("vehicleType", value)}>
                        </DropDown>
                    </GridCell>
                    {details}
                </Grid>
            </Modal>
        );
    }
}