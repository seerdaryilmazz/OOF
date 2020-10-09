import React from "react";
import {Card, Grid, GridCell} from "susam-components/layout";
import {Table} from "susam-components/table";
import uuid from "uuid";

export class ShipmentsTable extends React.Component {

    constructor(props) {
        super(props);
        this.headers = [
            {
                name: "Customer",
                data: "customerName",
                width: "27%",
                render: (values) => {
                    return (
                        <div key={uuid.v4()} className="whiteSpaceNormal">
                            <div key={uuid.v4()} className="tableCellStyle">Shipment No: <b>{values.code}</b></div>
                            <div key={uuid.v4()} className="tableCellStyle">Customer: <b>{values.customerName}</b></div>
                            <div key={uuid.v4()} className="tableCellStyle">Order No: <b>{values.transportOrderId}</b>
                            </div>
                            <div key={uuid.v4()} className="tableCellStyle">Ready At: <b>{values.readyAtDate.localDateTime}</b></div>
                        </div>
                    );
                }
            },
            {
                name: "Status",
                data: "status",
                width: "6%",
                render: (values) => {
                    let statusBadgeClass = ["uk-badge"];
                    let status = values.status;
                    switch (values.status) {
                        case "CREATED":
                            statusBadgeClass.push("uk-badge-outline");
                            statusBadgeClass.push("md-bg-grey-400");
                            status = "Created";
                            break;
                        case "CONFIRMED":
                            statusBadgeClass.push("uk-badge-outline");
                            statusBadgeClass.push("md-bg-grey-200");
                            status = "Confirmed";
                            break;
                        case "PLANNED":
                            statusBadgeClass.push("uk-badge-warning");
                            status = "Planned";
                            break;
                        case "COLLECTED":
                            statusBadgeClass.push("uk-badge-success");
                            status = "Collected";
                            break;
                        case "DELIVERED":
                            statusBadgeClass.push("uk-badge-primary");
                            status = "Delivered";
                            break;
                        case "CLOSED":
                            break;
                    }

                    return (
                        <div>
                            <div className={statusBadgeClass.join(" ")}>{status}</div>
                        </div>
                    );
                }
            },
            {
                name: "Sender",
                data: "sender",
                width: "27%",
                render: (values) => {
                    return this.getSenderOrReceiverRender(values.sender, values.pickupAppointment);
                }
            },
            {
                name: "Consignee",
                data: "receiver",
                width: "27%",
                render: (values) => {
                    return this.getSenderOrReceiverRender(values.receiver, values.deliveryAppointment);
                }
            },
            {
                name: "Packaging",
                data: "transportOrderId",
                width: "6%",
                render: (values) => {
                    let items = null;
                    if (values.packageTypes && values.packageTypes.length > 0) {
                        items = values.packageTypes.map(packageType => {
                            return (
                                <div key={uuid.v4()} className="tableCellStyle">
                                    <b>{packageType.count}</b> {packageType.name}</div>
                            );
                        })
                    }

                    return (
                        <div key={uuid.v4()} className="whiteSpaceNormal">
                            {items}
                        </div>
                    );
                }
            },
            {
                name: "Size",
                data: "grossWeight",
                width: "6%",
                render: (values) => {
                    return (
                        <div key={uuid.v4()} className="whiteSpaceNormal">
                            <div key={uuid.v4()} className="tableCellStyle"><b>{values.grossWeight}</b> kg</div>
                            <div key={uuid.v4()} className="tableCellStyle"><b>{values.volume}</b> m<sup>3</sup></div>
                            <div key={uuid.v4()} className="tableCellStyle"><b>{values.ldm}</b> ldm</div>
                        </div>
                    );
                }
            },
        ];
        this.tableActions = {
            actionButtons: [
                {
                    icon: "info-circle",
                    action: (elem) => this.handleShipmentPreview(elem),
                    title: "Preview"
                },
                {
                    icon: "edit",
                    action: (elem) => this.handleShipmentEdit(elem),
                    title: "Edit"
                },
                {
                    icon: "barcode",
                    action: (elem) => this.handleShipmentBarcodes(elem),
                    title: "Barcodes"
                },
                {
                    icon: "truck",
                    action: (elem) => this.handlePreviewPlan(elem),
                    title: "Plan"
                }
            ]
        };
    }

    handleShipmentPreview(elem) {
        this.props.onPreviewShipment(elem);
    }

    handleShipmentEdit(elem) {
        this.props.onEditShipment(elem);
    }
    handleShipmentBarcodes(elem){
        this.props.onViewBarcodes(elem);
    }
    handlePreviewPlan(elem){
        this.props.onPreviewPlan(elem);
    }

    handleOpenShipmentTransportHistoryModal(elem) {
        this.props.onOpenShipmentTransportHistoryModal(elem);
    }

    getSenderOrReceiverRender(values, appointment) {
        return (
            <div key={uuid.v4()} className="whiteSpaceNormal">
                <div key={uuid.v4()} className="tableCellStyle">Company: <b>{values.companyName}</b></div>
                <div key={uuid.v4()} className="tableCellStyle">Location:
                    <b>{values.location ? values.location.name : ''}</b></div>
                <div
                    key={uuid.v4()}
                    className="tableCellStyle">{values.location ? values.location.countryIsoCode : ''}-{values.location ? values.location.postalCode : ''}</div>
                <div
                    key={uuid.v4()} className="tableCellStyle">Appointment:
                    <b>{appointment && appointment.start ? appointment.start.localDateTime + " " + appointment.start.timezone : ''}</b></div>
            </div>
        );
    }

    render() {
        let results = null;
        let title = null;

        if (this.props.shipmentList && this.props.shipmentList.length > 0) {
            title = this.props.groupField ? this.props.shipmentList[0][this.props.groupField] : "";

            results = (
                <Card title={title}>
                    <Grid>
                        <GridCell width="1-1" noMargin="true">
                            <Table headers={this.headers} data={this.props.shipmentList} actions={this.tableActions}/>
                        </GridCell>
                    </Grid>
                </Card>
            );
        }

        return results;
    }
}