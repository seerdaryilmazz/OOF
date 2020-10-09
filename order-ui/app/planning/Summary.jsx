import React from "react";
import {Card} from "susam-components/layout";
import _ from "lodash";

export class Summary extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            details: "",
            grossWeight: 0.0,
            volume: 0.0,
            ldm: 0.0,
            payWeight: 0.0
        }
    }

    componentWillReceiveProps(nextProps) {
        let details = "", grossWeight = 0.0, volume = 0.0, ldm = 0.0, payWeight = 0.0, detailsMap = {};

        if (nextProps.selectedShipments && nextProps.selectedShipments.length > 0) {
            nextProps.selectedShipments.forEach(shipment => {
                if (shipment.packageTypes && shipment.packageTypes.length > 0) {
                    shipment.packageTypes.forEach(packageType => {
                        if (detailsMap[packageType.name]) {
                            detailsMap[packageType.name] += packageType.count;
                        } else {
                            detailsMap[packageType.name] = packageType.count;
                        }
                    });
                }

                grossWeight += shipment.grossWeight ? shipment.grossWeight : 0.0;
                volume += shipment.volume ? shipment.volume : 0.0;
                ldm += shipment.ldm ? shipment.ldm : 0.0;
                payWeight += shipment.payWeight ? shipment.payWeight : 0.0;

            });

            _.keys(detailsMap).forEach(k => {
                details += ", " + detailsMap[k] + " " + k;
            })
        }

        let summary = {details: _.trim(details, ' ,'), grossWeight: grossWeight, volume: volume, ldm: ldm, payWeight: payWeight};
        this.setState(summary);
    }

    getSummary() {
        return this.state;
    }

    render() {
        let results = null;

        if (this.props.selectedShipments && this.props.selectedShipments.length > 0) {
            results = (
                <table className="uk-table uk-table-nowrap uk-margin-remove">
                    <thead>
                    <tr>
                        <th className="uk-text-center">Details</th>
                        <th className="uk-text-center">Gross Weight</th>
                        <th className="uk-text-center">Volume</th>
                        <th className="uk-text-center">LDM</th>
                        <th className="uk-text-center">PW</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td className="uk-text-center">{this.state.details}</td>
                        <td className="uk-text-center">{this.state.grossWeight}</td>
                        <td className="uk-text-center">{this.state.volume}</td>
                        <td className="uk-text-center">{this.state.ldm}</td>
                        <td className="uk-text-center">{this.state.payWeight}</td>
                    </tr>
                    </tbody>
                </table>
            );
        }

        return results;
    }
}