import React from "react";
import {Grid, GridCell} from "susam-components/layout";
import _ from "lodash";

export class OrderPagePreviewContents extends React.Component {
    constructor(props) {
        super(props);
    }

    getLabelAndData(label, data, optionsParam = {}) {
        let options = _.merge({display: "block", bold: false, smallText: false}, optionsParam);

        let labelDiv = null;
        if (!_.isEmpty(label)) {
            labelDiv = (
                <div className="uk-text-muted uk-text-small uk-text-italic"
                     style={{minWidth: "100px", display: "inline-block"}}>
                    {label}
                </div>
            );
        }

        let dataDiv = null;
        if (data) {
            dataDiv = (
                <div className={(options.bold ? " uk-text-bold " : "") + (options.smallText ? " uk-text-small " : "")}
                     style={{display: "inline-block"}}>
                    {data}
                </div>
            );
        }

        return (
            <div style={{display: options.display}}>
                {labelDiv}
                {dataDiv}
            </div>
        );
    }

    getSenderOrReceiver(title, val, app) {
        let companyName = val && val.company && val.company.name ? val.company.name : "";
        let contactName = val && val.companyContact ? (val.companyContact.firstName ? val.companyContact.firstName : "") + " " + (val.companyContact.lastName ? val.companyContact.lastName : "") : "";
        if (_.isEmpty(contactName)) {
            contactName = val && val.contact ? (val.contact.firstName ? val.contact.firstName : "") + " " + (val.contact.lastName ? val.contact.lastName : "") : "";
        }
        contactName = !_.isEmpty(contactName) ? " (" + contactName + ")" : "";
        let locationName = val && val.location && val.location.name ? val.location.name : "";
        let locationContactName = val && val.locationContact ? (val.locationContact.firstName ? val.locationContact.firstName : "") + " " + (val.locationContact.lastName ? val.locationContact.lastName : "") : "";
        locationContactName = !_.isEmpty(locationContactName) ? " (" + locationContactName + ")" : "";
        let locationAddress = val && val.location && val.location.postaladdress && val.location.postaladdress.formattedAddress ? val.location.postaladdress.formattedAddress : "";
        let appointment = app ? (app.start ? app.start : "") + " - " + (app.end ? app.end : "") : "";

        return (
            <div style={{marginTop: "10px", border: "1px solid rgba(0, 0, 0, 0.12)", padding: "5px"}}
                 className="uk-border-rounded">
                {this.getLabelAndData(title)}
                <div style={{marginLeft: "5px"}}>
                    {this.getLabelAndData("", companyName, {bold: true, display: "inline"})}
                    {this.getLabelAndData("", contactName, {display: "inline"})}
                    {this.getLabelAndData("Location")}
                    <div style={{marginLeft: "5px"}}>
                        {this.getLabelAndData("", locationName, {display: "inline", smallText: true})}
                        {this.getLabelAndData("", locationContactName, {display: "inline", smallText: true})}
                        {this.getLabelAndData("", locationAddress, {smallText: true})}
                    </div>
                    {this.getLabelAndData("Appointment", appointment, {smallText: true})}
                </div>
            </div>
        );
    }

    getShipment(shipment) {
        let code = shipment && shipment.code ? shipment.code : "";
        let readyAtDate = shipment && shipment.readyAtDate ? shipment.readyAtDate : "";
        let adrClass = shipment && shipment.adrClass && shipment.adrClass.name ? shipment.adrClass.name : "";
        let certificatedLoad = shipment && shipment.certificatedLoad && shipment.certificatedLoad.name ? shipment.certificatedLoad.name : "";
        let specialLoad = shipment && shipment.specialLoad && shipment.specialLoad.name ? shipment.specialLoad.name : "";

        return (
            <div
                style={{borderLeft: "5px solid rgba(0, 0, 0, 0.12)", marginBottom: "50px", paddingLeft: "20px"}} key = {code}>
                <Grid>
                    <GridCell noMargin="true" width="1-2">
                        {this.getLabelAndData("Shipment #", code)}
                    </GridCell>
                    <GridCell noMargin="true" width="1-2">
                        {this.getLabelAndData("ADR Class:", adrClass)}
                    </GridCell>
                    <GridCell noMargin="true" width="1-2">
                        {this.getLabelAndData("Ready Date:", readyAtDate, {bold: true})}
                    </GridCell>
                    <GridCell noMargin="true" width="1-2">
                        {this.getLabelAndData("Certified Load:", certificatedLoad)}
                    </GridCell>
                    <GridCell noMargin="true" width="1-2">
                    </GridCell>
                    <GridCell noMargin="true" width="1-2">
                        {this.getLabelAndData("Special Load:", specialLoad)}
                    </GridCell>
                    <GridCell noMargin="true" width="1-2">
                        {this.getSenderOrReceiver("Sender", shipment ? shipment.sender : null, shipment ? shipment.pickupAppointment : null)}
                    </GridCell>
                    <GridCell noMargin="true" width="1-2">
                        {this.getSenderOrReceiver("Consignee", shipment ? shipment.receiver : null, shipment ? shipment.deliveryAppointment : null)}
                    </GridCell>
                    <GridCell width="3-5">
                        {this.getShipmentUnits(shipment && shipment.shipmentUnits ? shipment.shipmentUnits : null)}
                    </GridCell>
                </Grid>
            </div>
        );
    }

    getEquipmentRequirements(ers) {
        let ersDisplay = null;

        if (ers && ers.length > 0) {
            let rows = ers.map(er => {
                let name = er && er.equipmentType && er.equipmentType.name ? er.equipmentType.name : "";
                let count = er && er.count ? er.count : "";

                return (
                    <tr key = {er.id} className="uk-table-middle">
                        <td className="uk-text-center">
                            <span className="uk-text-small">{name}</span>
                        </td>
                        <td className="uk-text-center">
                            <span className="uk-text-small">{count}</span>
                        </td>
                    </tr>
                );
            });

            ersDisplay = (
                <div>
                    <h2>Equipment Reqs.</h2>
                    <table className="uk-table">
                        <thead>
                        <tr className="uk-text-upper">
                            <th className="uk-text-center">Name</th>
                            <th className="uk-text-center">Count</th>
                        </tr>
                        </thead>
                        <tbody>
                        {rows}
                        </tbody>
                    </table>
                </div>
            );
        }

        return ersDisplay
    }

    getVehicleRequirements(vrs) {
        let vrsDisplay = null;

        if (vrs && vrs.length > 0) {
            let rows = vrs.map(vr => {
                let permissionType = vr && vr.permissionType && vr.permissionType.name ? vr.permissionType.name : "";
                let vehicleType = vr && vr.vehicleType && vr.vehicleType.name ? vr.vehicleType.name : "";
                let vehicleFeatures = vr && vr.vehicleFeatures && vr.vehicleFeatures.length > 0 ? _.join(vr.vehicleFeatures.map(vd => vd.name), ", ") : "";
                return (
                    <tr key = {vr.id} className="uk-table-middle">
                        <td className="uk-text-center">
                            <span className="uk-text-small">{permissionType}</span>
                        </td>
                        <td className="uk-text-center">
                            <span className="uk-text-small">{vehicleType}</span>
                        </td>
                        <td>
                            <span className="uk-text-small">{vehicleFeatures}</span>
                        </td>
                    </tr>
                );
            });

            vrsDisplay = (
                <div>
                    <h2>Vehicle Reqs.</h2>
                    <table className="uk-table">
                        <thead>
                        <tr className="uk-text-upper">
                            <th className="uk-text-center">Permission</th>
                            <th className="uk-text-center">Type</th>
                            <th className="uk-text-center">Details</th>
                        </tr>
                        </thead>
                        <tbody>
                        {rows}
                        </tbody>
                    </table>
                </div>
            );
        }

        return vrsDisplay;
    }

    getRouteRequirements(rrs) {
        let rrsDisplay = null;

        if (rrs && rrs.length > 0) {
            let rows = rrs.map(rr => {
                let permissionType = rr && rr.permissionType && rr.permissionType.name ? rr.permissionType.name : "";
                let transportType = rr && rr.transportType && rr.transportType.name ? rr.transportType.name : "";
                let routes = rr && rr.routes && rr.routes.length > 0 ? _.join(rr.routes.map(r => r.name), ", ") : "";
                return (
                    <tr key = {rr.id} className="uk-table-middle">
                        <td className="uk-text-center">
                            <span className="uk-text-small">{permissionType}</span>
                        </td>
                        <td className="uk-text-center">
                            <span className="uk-text-small">{transportType}</span>
                        </td>
                        <td>
                            <span className="uk-text-small">{routes}</span>
                        </td>
                    </tr>
                );
            });

            rrsDisplay = (
                <div>
                    <h2>Route Reqs.</h2>
                    <table className="uk-table">
                        <thead>
                        <tr className="uk-text-upper">
                            <th className="uk-text-center">Permission</th>
                            <th className="uk-text-center">Type</th>
                            <th className="uk-text-center">Routes</th>
                        </tr>
                        </thead>
                        <tbody>
                        {rows}
                        </tbody>
                    </table>
                </div>
            );
        }

        return rrsDisplay;
    }

    getShipmentUnits(sus) {
        let susDisplay = null;

        if (sus && sus.length > 0) {
            let rows = sus.map(su => {
                
                let packageCount = 0;

                if (su && su.shipmentUnitPackages) {
                    su.shipmentUnitPackages.forEach(item => {
                        packageCount = packageCount + item.count;
                    });
                }

                let packageType = su && su.type && su.type.name ? su.type.name : "";
                let volume = su && su.totalVolumeInCubicMeters ? su.totalVolumeInCubicMeters : "";
                let grossWeight = su && su.totalGrossWeightInKilograms ? su.totalGrossWeightInKilograms : "";
                let netWeight = su && su.totalNetWeightInKilograms ? su.totalNetWeightInKilograms : "";
                return (
                    <tr key = {su.id} className="uk-table-middle">
                        <td className="uk-text-center">
                            <span className="uk-text-small">{packageCount}</span>
                        </td>
                        <td className="uk-text-center">
                            <span className="uk-text-small">{packageType}</span>
                        </td>
                        <td className="uk-text-center">
                            <span className="uk-text-small">{volume}</span>
                        </td>
                        <td className="uk-text-center">
                            <span className="uk-text-small">{grossWeight}</span>
                        </td>
                        <td className="uk-text-center">
                            <span className="uk-text-small">{netWeight}</span>
                        </td>
                    </tr>
                );
            });

            susDisplay = (
                <div>
                    {this.getLabelAndData("Shipment Units:")}
                    <table className="uk-table">
                        <thead>
                        <tr className="uk-text-upper">
                            <th className="uk-text-center">Count</th>
                            <th className="uk-text-center">Type</th>
                            <th className="uk-text-center">Volume</th>
                            <th className="uk-text-center">Gross Weight</th>
                            <th className="uk-text-center">Net Weight</th>
                        </tr>
                        </thead>
                        <tbody>
                        {rows}
                        </tbody>
                    </table>
                </div>
            );
        }

        return susDisplay;
    }

    getOrder(order) {
        let shipments = order && order.shipments ? order.shipments.map(shipment => this.getShipment(shipment)) : null;
        let serviceType = order && order.serviceType && order.serviceType.name ? order.serviceType.name : "";
        let incoterm = order && order.incoterm && order.incoterm.name ? order.incoterm.name : "";
        let truckLoadType = order && order.truckLoadType && order.truckLoadType.name ? order.truckLoadType.name : "";
        let insuredByEkol = order && order.insuredByEkol;

        return (
            <Grid>
                <GridCell width="1-1">
                    <h2>General</h2>
                    <Grid>
                        <GridCell noMargin="true" width="1-4">
                            {this.getLabelAndData("Service Type:", serviceType)}
                        </GridCell>
                        <GridCell noMargin="true" width="1-4">
                            {this.getLabelAndData("Incoterms:", incoterm)}
                        </GridCell>
                        <GridCell noMargin="true" width="1-4">
                            {this.getLabelAndData("FTL/LTL:", truckLoadType)}
                        </GridCell>
                        <GridCell noMargin="true" width="1-4">
                            {this.getLabelAndData("Insured by Ekol:", insuredByEkol ? "X" : "-")}
                        </GridCell>
                    </Grid>
                </GridCell>
                <GridCell width="1-1">
                    <h2>Shipments</h2>
                    {shipments}
                </GridCell>
                <GridCell width="2-5">
                    {this.getRouteRequirements(order ? order.routeRequirements : null)}
                </GridCell>
                <GridCell width="2-5">
                    {this.getVehicleRequirements(order ? order.vehicleRequirements : null)}
                </GridCell>
                <GridCell width="1-5">
                    {this.getEquipmentRequirements(order ? order.equipmentRequirements : null)}
                </GridCell>
            </Grid>
        );
    }

    render() {
        let order = this.getOrder(this.props.order);

        return (
            <div className="md-card-content invoice_content print_bg uk-overflow-container"
                 style={{marginTop: "-30px", marginBottom: "-30px"}}>
                {order}
            </div>
        );
    }
}
        