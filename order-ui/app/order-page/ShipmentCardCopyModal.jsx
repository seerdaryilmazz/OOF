import React from 'react';
import uuid from 'uuid';
import * as axios from 'axios';
import _ from 'lodash';

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Modal} from 'susam-components/layout';
import {Checkbox} from 'susam-components/basic';

export class ShipmentCardCopyModal extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            data: {},
            copyReadyDate: true,
            copySender: true,
            copyPickupAppointment: true,
            copyConsignee: true,
            copyDeliveryAppointment: true,
            copyAdrAndCertificates: true,
            copyShipmentUnits: false
        };
    }

    componentDidMount() {
        if (this.props.value) {
            this.prepareState(this.props.value);
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.value) {
            this.prepareState(nextProps.value);
        }
    }

    handleStateChange(field, value) {
        let state = _.cloneDeep(this.state);
        state[field] = value;
        this.setState(state);
    }

    close() {
        this.modal.close();
    }

    show() {
        // Burada özellikle her zaman aynı şekilde açılsın diye böyle yapıyoruz.
        let data = {
            copyReadyDate: true,
            copySender: true,
            copyPickupAppointment: true,
            copyConsignee: true,
            copyDeliveryAppointment: true,
            copyAdrAndCertificates: true,
            copyShipmentUnits: false
        };
        this.prepareState(data);
        this.modal.open();
    }

    handleSave() {

        let data = _.cloneDeep(this.state.data);

        data.copyReadyDate = this.state.copyReadyDate;
        data.copySender = this.state.copySender;
        data.copyPickupAppointment = this.state.copyPickupAppointment;
        data.copyConsignee = this.state.copyConsignee;
        data.copyDeliveryAppointment = this.state.copyDeliveryAppointment;
        data.copyAdrAndCertificates = this.state.copyAdrAndCertificates;
        data.copyShipmentUnits = this.state.copyShipmentUnits;

        this.setState({data: data});

        this.props.onsave && this.props.onsave(this.state.data);

        this.modal.close();
    }

    prepareState(data) {

        let state = {};

        state.data = data;

        state.copyReadyDate = data.copyReadyDate;
        state.copySender = data.copySender;
        state.copyPickupAppointment = data.copyPickupAppointment;
        state.copyConsignee = data.copyConsignee;
        state.copyDeliveryAppointment = data.copyDeliveryAppointment;
        state.copyAdrAndCertificates = data.copyAdrAndCertificates;
        state.copyShipmentUnits = data.copyShipmentUnits;

        this.setState(state);
    }

    render() {
        return(
            <Modal ref={(c) => this.modal = c}
                   title="Select parts of shipment to copy"
                   actions={[
                                {label: "Close", action: () => this.close()},
                                {label: "Save", buttonStyle: "primary", action: () => this.handleSave()}]}>
                <Grid>
                    <GridCell width="1-1">
                        <Checkbox label="Copy Ready Date"
                                  checked={this.state.copyReadyDate}
                                  onchange={(value) => this.handleStateChange("copyReadyDate", value)}/>
                    </GridCell>
                    <GridCell width="1-1">
                        <Checkbox label="Copy Sender"
                                  checked={this.state.copySender}
                                  onchange={(value) => this.handleStateChange("copySender", value)}/>
                    </GridCell>
                    <GridCell width="1-1">
                        <Checkbox label="Copy Pickup Appointment"
                                  checked={this.state.copyPickupAppointment}
                                  onchange={(value) => this.handleStateChange("copyPickupAppointment", value)}/>
                    </GridCell>
                    <GridCell width="1-1">
                        <Checkbox label="Copy Consignee"
                                  checked={this.state.copyConsignee}
                                  onchange={(value) => this.handleStateChange("copyConsignee", value)}/>
                    </GridCell>
                    <GridCell width="1-1">
                        <Checkbox label="Copy Delivery Appointment"
                                  checked={this.state.copyDeliveryAppointment}
                                  onchange={(value) => this.handleStateChange("copyDeliveryAppointment", value)}/>
                    </GridCell>
                    <GridCell width="1-1">
                        <Checkbox label="Copy ADR & Certificates"
                                  checked={this.state.copyAdrAndCertificates}
                                  onchange={(value) => this.handleStateChange("copyAdrAndCertificates", value)}/>
                    </GridCell>
                </Grid>
            </Modal>
        );
    }
}
ShipmentCardCopyModal.contextTypes = {
    translator: React.PropTypes.object
};