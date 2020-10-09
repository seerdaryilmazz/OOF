import React from "react";
import _ from "lodash";



export class QuoteTypePrinter {

    constructor(translator){
        this.translator = translator;
    }
    translate(text){
        return this.translator ? this.translator.translate(text) : text;
    }
    printUsingRow(row, data) {
        let shipmentLoadingType = null;

        if ("SPOT" === row.type.code && ("SEA" === row.serviceArea.code || "ROAD" === row.serviceArea.code)) {
            shipmentLoadingType = _.get(_.first(row.products),'shipmentLoadingType.name');
        }

        return (<div>
                    {this.printType(row)}
                    <sup className="uk-text-bold uk-text-italic" style={{padding: "4px"}}>{shipmentLoadingType}</sup>
                </div>)
    }

    printType(row){
        if (row.type.code == "SPOT") {
            return <span className="uk-badge uk-badge-primary">{this.translate(_.capitalize(row.type.name))}</span>
       } else if (row.type.code == "LONG_TERM") {
           return <span className="uk-badge uk-badge-warning">{this.translate(_.capitalize(row.type.name))}</span>
       } else if (row.type.code == "TENDER") {
           return <span className="uk-badge uk-badge-danger">{this.translate(_.capitalize(row.type.name))}</span>
       } else if (row.type.code == "CONTRACT") {
           return <span className="uk-badge md-bg-purple-350">{this.translate(_.capitalize(row.type.name))}</span>
    } else {
           return null;
       }
    }
}

