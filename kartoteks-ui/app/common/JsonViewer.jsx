import React from "react";

import {TranslatingComponent} from "susam-components/abstract";

export class JsonViewer extends TranslatingComponent {

    render() {
        return (
            <pre className="line-numbers">
                <code className="language-json">
                    {JSON.stringify(this.props.data ? JSON.parse(this.props.data) : "", null, 4)}
                </code>
            </pre>
        );
    }
}
