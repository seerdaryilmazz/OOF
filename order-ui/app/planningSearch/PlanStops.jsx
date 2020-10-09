import moment from 'moment';
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, Span } from "susam-components/basic";
import { Grid, GridCell } from "susam-components/layout";
import { DateTimeMini } from "./DateTimeMini";
import { PlanningSearchConstans } from "./PlanningSearchConstans";
import { PlanStopStatus } from "./PlanStopStatus";
import { RouteModal } from "./RouteModal";



export class PlanStops extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentWillMount() {
    }

    componentDidMount() {
        this.setState({tripStops: this.props.tripStops, trips: this.props.trips});
    }

    componentWillReceiveProps(nextProps) {
        this.setState({tripStops: nextProps.tripStops, trips: nextProps.trips});
    }

    retrieveTripOperations(tripStop) {

        let tripOperations = tripStop.tripOperations;

        if (!tripOperations) return null;

        return (
            tripOperations.map(op => {
                let iconClassName = null;
                if (op.tripOperationType) {
                    if (op.tripOperationType == PlanningSearchConstans.OP_TYPE_LOAD) {
                        iconClassName = "uk-icon-plus-square-o";
                    } else if (op.tripOperationType == PlanningSearchConstans.OP_TYPE_UNLOAD) {
                        iconClassName = "uk-icon-minus-square-o";
                    } else if (op.tripOperationType == PlanningSearchConstans.OP_TYPE_NONE) {
                        iconClassName = "uk-icon-ban";
                    }
                }

                let shipmentIdDisplay = "#" + op.transport.shipmentCode;

                return (
                    <div key={tripStop.id + "-" + op.transport.shipmentId + "-" + op.tripOperationType} style={{paddingLeft: "15px"}}>
                        <div className="uk-text-small uk-text-truncate">
                            <i className={iconClassName} style={{paddingRight: "5px"}}/>
                            Shipment {shipmentIdDisplay}
                        </div>
                    </div>
                );
            })
        );

    }

    dateUpdateHandler(tripStopId, field, value) {
        this.props.dateUpdateHandler(tripStopId, field, value);
    }


    renderVehicleGroup(vehicleGroup) {
        let plateNumber = vehicleGroup.trailable &&  vehicleGroup.trailable.plateNumber ? vehicleGroup.trailable.plateNumber : "-";

        return  <div className="uk-margin-left">
            <Grid>
                <GridCell>
                    <span className="uk-text-primary">Vehicle Group: </span>
                </GridCell>
                <GridCell>
                    <div className="uk-margin-left">Trailer: {plateNumber}</div>
                </GridCell>
            </Grid>
        </div>
    }

    renderSpotVehicle(spotVehicle) {
        let spotPurchaseCode = spotVehicle.code;
        let carrierPlateNumber = spotVehicle.carrierPlateNumber;
        let motorVehiclePlateNumber = spotVehicle.motorVehiclePlateNumber;
        let invoiceCompanyName = spotVehicle.invoiceCompanyName;

        return <div className="uk-margin-left">
            <Grid>
                <GridCell>
                    <span className="uk-text-primary">Vehicle Group: </span>
                </GridCell>
                <GridCell>
                    <div className="uk-margin-left">Spot Vehicle Code: {spotPurchaseCode}</div>
                    <div className="uk-margin-left">Carrier: {carrierPlateNumber}</div>
                    <div className="uk-margin-left">MV: {motorVehiclePlateNumber}</div>
                    <div className="uk-margin-left">Company: {invoiceCompanyName}</div>
                </GridCell>
            </Grid>
        </div>
    }

    renderVehicleInfo(trips) {

        if(!trips || trips.length == 0) {
            return null;
        }

        let firstTrip = trips[0];

        if(firstTrip.vehicleGroup) {
            return this.renderVehicleGroup(firstTrip.vehicleGroup);
        } else if(firstTrip.spotVehicle) {
            return this.renderSpotVehicle(firstTrip.spotVehicle);
        } else {
            return null;
        }

    }

    renderDates(tripStop) {

        let arrivalDate = null;
        let departureDate = null;

        if (!tripStop.trailerLocation) {
            if (tripStop._status.id == PlanningSearchConstans.STOP_STATUS_PENDING.id) {
                arrivalDate =
                    <div>
                        <DateTimeMini label="ETA"
                                      data={tripStop.estimatedTimeArrival ? tripStop.estimatedTimeArrival.localDateTime + " " + tripStop.estimatedTimeArrival.timezone : null}
                                      onchange={(value) => {
                                          this.dateUpdateHandler(tripStop.id, "estimatedTimeArrival", value)
                                      }}/>
                    </div>
            } else {
                let timeDiff = "";
                if(tripStop.plannedTimeArrival){
                    let planned = moment(tripStop.plannedTimeArrival.utcDateTime, "DD/MM/YYYY HH:mm");
                    let actual = moment(tripStop.actualTimeArrival.utcDateTime, "DD/MM/YYYY HH:mm");
                    let isLate = actual.isAfter(planned);
                    timeDiff = actual.from(planned, true) + " " + (isLate ? "late" : "early");
                }
                let actualDateTimeWithZone = tripStop.actualTimeArrival.localDateTime + " " + tripStop.actualTimeArrival.timezone
                arrivalDate = <Span label="ATA" value = {actualDateTimeWithZone} helperText={timeDiff} />;
            }
        }

        if (!tripStop._isLast) {
            if (tripStop._status.id != PlanningSearchConstans.STOP_STATUS_DEPARTED.id) {
                departureDate =
                    <DateTimeMini label="ETD"
                                  data={tripStop.estimatedTimeDeparture ? tripStop.estimatedTimeDeparture.localDateTime + " " + tripStop.estimatedTimeDeparture.timezone  : null}
                                  onchange={(value) => {
                                      this.dateUpdateHandler(tripStop.id, "estimatedTimeDeparture", value)
                                  }}/>;
            } else {
                let timeDiff = "";
                if(tripStop.plannedTimeDeparture){
                    let planned = moment(tripStop.plannedTimeDeparture.utcDateTime, "DD/MM/YYYY HH:mm");
                    let actual = moment(tripStop.actualTimeDeparture.utcDateTime, "DD/MM/YYYY HH:mm");
                    let isLate = actual.isAfter(planned);
                    timeDiff = actual.from(planned, true) + " " + (isLate ? "late" : "early");
                }
                let actualDateTimeWithZone = tripStop.actualTimeDeparture.localDateTime + " " + tripStop.actualTimeDeparture.timezone
                departureDate = <Span label="ATD" value = {actualDateTimeWithZone} helperText={timeDiff} />;
            }

        }

        return (
            <Grid>
                <GridCell width="1-3">
                    {arrivalDate}
                </GridCell>
                <GridCell width="1-3">
                    {departureDate}
                </GridCell>
            </Grid>
        )
    }

    render() {

        let tripStops = this.state.tripStops;
        let trips = this.state.trips;

        if (!tripStops) {
            return null;
        }

        return (
            <div>
                <ul className="md-list md-list-addon">
                    <div className="uk-margin-left">
                        {this.renderVehicleInfo(trips)}
                    </div>
                    <li key="vehicle-elem-divider"/>
                    {tripStops.map((tripStop, index) => {
                        return (
                            <li key={'li' + tripStop.id}>
                                <div className="md-list-addon-element">
                                    <div className={"map-icon map_" + tripStop.icon}/>
                                    {index < tripStops.length-1 ?
                                        <Button label="Route" flat={true} style="primary" onclick={() => {
                                            this.routeModal.openFor(tripStop.id)
                                        }}/>
                                        : null
                                    }
                                </div>
                                <div className="md-list-content">
                                    <span className="uk-text-truncate">
                                        <PlanStopStatus data={tripStop}
                                                        handleArrive={() => {this.props.handleArrive(tripStop)}}
                                                        handleDepart={() => {this.props.handleDepart(tripStop)}}
                                                        handleStartUnloadJob={() => {this.props.handleStartUnloadJob(tripStop)}}
                                                        handleCompleteUnloadJob={() => {this.props.handleCompleteUnloadJob(tripStop)}}
                                                        handleStartLoadJob={() => {this.props.handleStartLoadJob(tripStop)}}
                                                        handleCompleteLoadJob={() => {this.props.handleCompleteLoadJob(tripStop)}}
                                                        handleDetailsClick={() => {this.props.handleDetailsClick(tripStop)}}>
                                        </PlanStopStatus>
                                    </span>
                                    <span>{this.retrieveTripOperations(tripStop)}</span>
                                    {this.renderDates(tripStop)}
                                </div>
                                <RouteModal ref={(c) => this.routeModal = c}/>
                            </li>
                        );
                    })}
                </ul>
            </div>
        )
    }
}

PlanStops.contextTypes = {
    translator: React.PropTypes.object
};
