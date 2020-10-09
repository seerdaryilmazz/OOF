import React from "react";
import {Modal} from "susam-components/layout";
import {ShipmentTransportHistory} from "./ShipmentTransportHistory";

export class ShipmentTransportHistoryModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            openRequested: false,
            shipmentId: null,
        }
    }

    openShipmentTransportHistoryModal(shipmentId) {
        this.setState({openRequested: true, shipmentId: shipmentId});
    }

    closeShipmentTransportHistoryModal() {
        this.modal.close();
    }

    onShipmentTransportHistoryLoad() {
        if (this.state.openRequested) {
            this.modal.open();
            this.setState({openRequested: false});
        }
    }

    render() {
        return (
            <Modal ref={(c) => this.modal = c} large={true}>
                <ShipmentTransportHistory shipmentId={this.state.shipmentId}
                                          onShipmentTransportHistoryLoad={() => this.onShipmentTransportHistoryLoad()}/>
            </Modal>
        );
    }
}
