import React from "react";
import {Button} from "susam-components/basic";
import {Modal} from "susam-components/layout";
import {OrderPagePreviewContents} from "./OrderPagePreviewContents";

export class OrderPagePreview extends React.Component {
    constructor(props) {
        super(props);
    }

    openPreviewModal() {
        this.modal.open();
    }

    closePreviewModal() {
        this.modal.close();
    }

    render() {
        let previewButton = null;
        if (!this.props.hideButton) {
            previewButton = (
                <Button label="preview" waves={true} onclick={() => this.openPreviewModal()}/>
            );
        }
        return (
            <div style={{display: "inline", marginLeft: "10px"}}>
                <Modal ref={(c) => this.modal = c} large={true}>
                    <OrderPagePreviewContents {...this.props} />
                </Modal>
                {previewButton}
            </div>
        );
    }
}