import React from "react";
import { Modal } from "susam-components/layout";
import { TranslatingComponent } from "susam-components/abstract/";
import ReactJson from 'react-json-view'

export default class ShipmentImportDataModal extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {};
    }

    openFor(row) {
        this.setState({
            rowData: row.data
        }, () => {
            this.modal.open();
        });
    }

    onOpen() {
    }

    onClose() {
    }

    render() {
        return (
            <Modal
                ref={(c) => this.modal = c}
                fullscreen={this.props.fullscreen}
                closeOnEscKeyPressed={this.props.closeOnEscKeyPressed}
                title="Shipment Import Data"
                onclose={() => this.onClose()}
                onopen={() => this.onOpen()}
                medium={true}
                style={{ height: "70%" }}>
                <div style={{ overflow: "hidden auto", display: "block", minHeight: "70%" }}>
                    <ReactJson src={this.state.rowData}
                        name="shipment"
                        iconStyle="triangle"
                        theme="ocean"
                        displayObjectSize={false}
                        displayDataTypes={false} />
                </div>
            </Modal>
        );
    }
}