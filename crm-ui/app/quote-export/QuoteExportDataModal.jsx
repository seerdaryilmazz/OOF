import React from "react";
import { Modal } from "susam-components/layout";
import { TranslatingComponent } from "susam-components/abstract/";
import ReactJson from 'react-json-view'

export default class QuoteExportDataModal extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {};
    }

    openFor(row) {
        this.setState({
            rowData: row.quote
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
                title="Quote Export Data"
                onclose={() => this.onClose()}
                onopen={() => this.onOpen()}
                medium={true}
                style={{ height: "70%" }}>
                <div style={{ overflow: "hidden auto", display: "block", minHeight: "70%" }}>
                    <ReactJson src={this.state.rowData}
                        name="quote"
                        iconStyle="triangle"
                        theme="ocean"
                        displayObjectSize={false}
                        displayDataTypes={false} />
                </div>
            </Modal>
        );
    }
}