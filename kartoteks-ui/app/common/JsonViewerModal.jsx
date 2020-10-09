import React from "react";

import {TranslatingComponent} from "susam-components/abstract";
import {Modal} from "susam-components/layout";
import {JsonViewer} from "./JsonViewer";

export class JsonViewerModal extends TranslatingComponent {

    open() {
        this.modal.open();
    }

    close() {
        this.modal.close();
    }

    render() {
        return (
            <Modal ref={(c) => this.modal = c}
                   title={this.props.title}
                   minHeight="500px"
                   large={true}
                   actions={[{label: "Close", action: () => this.close()}]}>
                <JsonViewer data={this.props.data}/>
            </Modal>
        );
    }
}
