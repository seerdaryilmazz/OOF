import React from "react";
import _ from "lodash";

export class QuoteStatusPrinter {
    constructor(translator) {
        this.translator = translator;
    }

    translate(text) {
        return this.translator ? this.translator.translate(text) : text;
    }

    printUsingRow(row) {
        if (row.status.code == "WON") {
            return <span className="uk-badge md-bg-green-600">{this.translate(_.capitalize(row.status.name))}</span>
        } else if (row.status.code == "PARTIAL_WON") {
            return <span className="uk-badge md-bg-green-400">{this.translate(_.capitalize(row.status.name))}</span>
        } else if (row.status.code == "OPEN") {
            return <span className="uk-badge md-bg-blue-500">{this.translate(_.capitalize(row.status.name))}</span>
        } else if (row.status.code == "CANCELED") {
            return <span className="uk-badge uk-badge-muted">{this.translate(_.capitalize(row.status.name))}</span>
        } else if (row.status.code == "LOST") {
            return <span className="uk-badge md-bg-red-600">{this.translate(_.capitalize(row.status.name))}</span>
        } else if (row.status.code == "PDF_CREATED") {
            let statusName = this.translate(_.capitalize(row.status.name));
            statusName = statusName.replace("Pdf", "PDF");
            return <span className="uk-badge md-bg-blue-700">{statusName}</span>
        }
        else {
            return null;
        }
    }
}