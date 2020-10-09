import React from "react";
import ReactDOM from "react-dom";
import { TranslatingComponent } from "susam-components/abstract/";
import { Modal } from "susam-components/layout";
import { Order } from "../view-order/Order";

export default class ShipmentViewModal extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {};
    }

    openFor(shipment) {
        this.setState({
            orderId: shipment.orderId,
            shipmentCode: shipment.shipmentCode
        }, () => {
            this.modal.open();
        });
    }

    close() {
        this.setState({
            orderId: null,
            shipmentCode: null
        }, () => {
            this.modal.close();
        });
    }

    onOpen() {
        this.content = <Order shipmentCode={this.state.shipmentCode} />;
        if(this.props.fullscreen){
            $("div.uk-modal-dialog.uk-modal-dialog-blank", ReactDOM.findDOMNode(this.modal)).removeClass("uk-height-viewport").css({"top":"0","min-height":"100%"});
        }
    }

    onClose() {
        this.props.onClose && this.props.onClose();
        this.content = null;
    }

    render() {
        return (
            <Modal
                ref={(c) => this.modal = c}
                fullscreen = {this.props.fullscreen}
                closeOnEscKeyPressed = {this.props.closeOnEscKeyPressed}
                id={this.state.orderId}
                actions={[{ label: "Close", action: () => this.close() }]}
                onclose={() => this.onClose()}
                onopen={() => this.onOpen()}
                large={true}>
                {this.content}
            </Modal>
        );
    }
}