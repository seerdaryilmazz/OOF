import React from "react";
import {Grid, GridCell, Card} from "susam-components/layout";
import {Table} from "susam-components/table";
import {TripService, OrderService} from "../services";
import * as axios from "axios";

export class ShipmentTransportHistory extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            shipment: null,
            transport: null,
            tripOperations: null,
            trips: null,
            tripOperationsHeaders: [
                {
                    name: "Date",
                    data: "operationDate",
                    width: "33%"
                },
                {
                    name: "Location",
                    data: "locationName",
                    width: "33%",
                    render: (values) => {
                        return values.tripStop.locationName;
                    },
                },
                {
                    name: "Operation",
                    data: "tripOperationType",
                    width: "33%",
                    render: (values) => {
                        return values.tripOperationType.name;
                    },
                },
            ],
            tripsHeaders: [
                {
                    name: "From",
                    data: "fromTripStop",
                    width: "15%",
                    render: (values) => {
                        return values.fromTripStop.locationName;
                    },
                },
                {
                    name: "To",
                    data: "toTripStop",
                    width: "15%",
                    render: (values) => {
                        return values.toTripStop.locationName;
                    },
                },
                {
                    name: "Status",
                    data: "tripStatus",
                    width: "15%",
                    render: (values) => {
                        return this.getTripStatus(values)
                    },
                },
                {
                    name: "Plan Date",
                    data: "planDate",
                    width: "15%"
                },
                {
                    name: "Start Date",
                    data: "startDate",
                    width: "15%"
                },
                {
                    name: "End Date",
                    data: "endDate",
                    width: "15%"
                },
            ],
        }
    }

    load(shipmentId) {
        let shipment = null;
        let transport = null;
        let tripOperations = null;
        let trips = null;

        this.setState({shipment: shipment, transport: transport, tripOperations: tripOperations, trips: trips}, () => {
            if (shipmentId) {
                axios.all([
                    OrderService.getShipment(shipmentId),
                    TripService.findTransportByShipmentId(shipmentId)
                ]).then(axios.spread((shipmentResponse, transportResponse) => {
                    shipment = shipmentResponse.data;
                    transport = transportResponse.data;

                    if (shipment && shipment.id && transport && transport.id) {
                        axios.all([
                            TripService.findTripOperationsByTransportId(transport.id),
                            TripService.findTripsByTransportId(transport.id)
                        ]).then(axios.spread((tripOperationsResponse, tripsResponse) => {
                            tripOperations = tripOperationsResponse.data;
                            trips = tripsResponse.data;

                            if (tripOperations && trips) {
                                this.setState({
                                    shipment: shipment,
                                    transport: transport,
                                    tripOperations: tripOperations,
                                    trips: trips
                                }, () => {
                                    if (this.props.onShipmentTransportHistoryLoad) {
                                        this.props.onShipmentTransportHistoryLoad();
                                    }
                                });
                            }
                        })).catch(error => {
                            Notify.showError(error);
                        });
                    }
                })).catch(error => {
                    Notify.showError(error);
                });
            }
        });
    }

    componentWillReceiveProps(nextProps) {
        this.load(nextProps.shipmentId);
    }

    getShipmentStatus() {
        let statusBadgeClass = "uk-badge ";
        switch (this.state.shipment.planningStatus.id) {
            case "NOT_PLANNED":
                statusBadgeClass += "uk-badge-danger";
                break;
            case "ONGOING":
                statusBadgeClass += "uk-badge-warning";
                break;
            case "FINISHED":
                statusBadgeClass += "uk-badge-success";
                break;
        }
        return <span className={statusBadgeClass}>{this.state.shipment.planningStatus.name}</span>
    }

    getTransportStatus() {
        let statusBadgeClass = "uk-badge ";
        switch (this.state.transport.transportStatus.id) {
            case "TO_BE_RECEIVED":
                statusBadgeClass += "uk-badge-danger";
                break;
            case "RECEIVED":
                statusBadgeClass += "uk-badge-warning";
                break;
            case "DELIVERED":
                statusBadgeClass += "uk-badge-success";
                break;
        }

        return <span className={statusBadgeClass}>{this.state.transport.transportStatus.name}</span>
    }

    getTripStatus(trip) {
        let statusBadgeClass = "uk-badge ";
        switch (trip.tripStatus.id) {
            case "PENDING":
                statusBadgeClass += "uk-badge-danger";
                break;
            case "INPROGRESS":
                statusBadgeClass += "uk-badge-warning";
                break;
            case "DONE":
                statusBadgeClass += "uk-badge-success";
                break;
        }

        return <span className={statusBadgeClass}>{trip.tripStatus.name}</span>
    }

    render() {
        let result = null;

        if (this.state.transport) {

            result = (
                <Card title="Shipment Transport History">
                    <Grid>
                        <GridCell width="1-1" noMargin="true">
                            <div className="uk-text-center">
                                {this.state.transport.fromLocationName}
                                <i className="uk-icon-arrow-circle-o-right uk-margin-left uk-margin-right"/>
                                {this.state.transport.toLocationName}
                            </div>
                        </GridCell>
                        <GridCell width="1-1" noMargin="true">
                            <div className="uk-text-center">
                                Planning Status : {this.getShipmentStatus()} <br/>
                                Transport Status : {this.getTransportStatus()}
                            </div>
                        </GridCell>
                        <GridCell width="1-1">
                            <Card title="Trips">
                                <Table headers={this.state.tripsHeaders}
                                       data={this.state.trips}/>
                            </Card>
                        </GridCell>
                        <GridCell width="1-1">
                            <Card title="Operations">
                                <Table headers={this.state.tripOperationsHeaders}
                                       data={this.state.tripOperations}/>
                            </Card>
                        </GridCell>
                    </Grid>
                </Card>
            );
        }

        return result;
    }
}
