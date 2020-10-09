import React from "react";
import _ from 'lodash';
import * as axios from 'axios';
import {Button} from "susam-components/basic";
import {Modal, Grid, GridCell, Loader} from "susam-components/layout";
import {Notify} from 'susam-components/basic';
import {TripService, ShipmentAssignmentPlanningService} from '../services';

export class ShipmentPlanPreview extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.shipment) {
            this.loadShipmentPlan(nextProps.shipment);
        }
    }

    createStopWithLocation(id, location){
        return {status: {text: "Pending", style: "danger"}, location: location, id: id};
    }
    buildStopWithFromLocation(stop, tripPlanCode, tripStop){
        this.setArrivalTimeAndStatus(stop, tripStop);
        stop.tripPlanCode = tripPlanCode;
        if (tripStop.hasLoadingOperation) {
            stop.hasLoading = tripStop.hasLoadingOperation;
            stop.loadingStart = tripStop.shipmentLoadingStartDate;
            if(stop.loadingStart){
                stop.status = {text: "Loading Started", style: "success"};
            }
            stop.loadingFinish = tripStop.shipmentLoadingEndDate;
            if(stop.loadingFinish){
                stop.status = {text: "Loading Completed", style: "success"};
            }
        }
        this.setDepartureTimeAndStatus(stop, tripStop);
    }
    buildStopWithToLocation(stop, tripPlanCode, tripStop){
        this.setArrivalTimeAndStatus(stop, tripStop);
        if (tripStop.hasUnloadingOperation) {
            stop.hasUnloading = tripStop.hasUnloadingOperation;
            stop.unloadingStart = tripStop.shipmentUnloadingStartDate;
            if(stop.unloadingStart){
                stop.status = {text: "Unloading Started", style: "success"};
            }
            stop.unloadingFinish = tripStop.shipmentUnloadingEndDate;
            if(stop.unloadingFinish){
                stop.status = {text: "Unloading Completed", style: "success"};
            }
        }
        this.setDepartureTimeAndStatus(stop, tripStop);
    }


    setArrivalTimeAndStatus(stop, tripStop){
        if(tripStop.actualTimeArrival){
            stop.arrival = tripStop.actualTimeArrival;
            stop.actualArrival = true;
            stop.status = {text: "Arrived", style: "success"};
        } else if(tripStop.estimatedTimeArrival && !stop.arrival){
            stop.arrival = tripStop.estimatedTimeArrival;
        } else if(!stop.arrival){
            stop.arrival = tripStop.plannedTimeArrival;
        }
    }
    setDepartureTimeAndStatus(stop, tripStop){
        if(tripStop.actualTimeDeparture){
            stop.departure = tripStop.actualTimeDeparture;
            stop.actualDeparture = true;
            stop.status = {text: "Departed", style: "primary"};
        } else if(tripStop.estimatedTimeDeparture && !stop.departure){
            stop.departure = tripStop.estimatedTimeDeparture;
        } else if(!stop.departure){
            stop.departure = tripStop.plannedTimeDeparture;
        }
    }
    getDetailsOfStopFromTripPlan(tripPlans, stop){
        tripPlans.forEach(tripPlan => {
            let nonTrailerTrips = _.filter(tripPlan.trips, trip => {
                return trip.fromTripStop.locationType != "Trailer";
            });
            nonTrailerTrips.forEach(trip => {
                if(trip.fromTripStop.locationId == stop.location.id){
                    this.buildStopWithFromLocation(stop, tripPlan.code, trip.fromTripStop);
                }
                if(trip.toTripStop.locationId == stop.location.id){
                    this.buildStopWithToLocation(stop, tripPlan.code, trip.toTripStop);
                }
            });
        });
    }

    loadShipmentPlan(shipment){
        this.setState({busy: true});
        axios.all([
            ShipmentAssignmentPlanningService.getShipmentAssignments(shipment.id),
            TripService.searchTripPlansByShipmentId(shipment.id)
        ]).then(axios.spread((assignmentsResponse, tripPlanResponse) => {
            console.log(assignmentsResponse.data);
            console.log(tripPlanResponse.data);
            let stops = [];
            assignmentsResponse.data.forEach((assignment, assignmentIndex) => {
                assignment.segments.forEach((segment, segmentIndex) => {
                    if(assignmentIndex == 0 && segmentIndex == 0){
                        stops.push(this.createStopWithLocation("from" + segment.id, segment.fromLocation));
                    }
                    stops.push(this.createStopWithLocation("to" + segment.id, segment.toLocation));
                });
            });

            stops.forEach(stop => this.getDetailsOfStopFromTripPlan(tripPlanResponse.data.tripPlans, stop));
            console.log("stops", stops);
            this.setState({shipmentId: shipment.id, stops: stops, busy: false});
        })).catch((error) => {
            Notify.showError(error);
            this.setState({busy: false});
        });

    }

    openPreviewModal() {
        this.modal.open();
    }

    closePreviewModal() {
        this.modal.close();
    }
    renderTime(dateTime){
        if(!dateTime){
            return null;
        }
        return (
            <span className = "uk-text-muted">{dateTime.localDateTime + " " + dateTime.timezone}</span>
        );
    }
    renderUnloadingOperation(stop){
        if(!stop.hasUnloading){
            return null;
        }
        let unloadingStart = <div>
            <span className = "uk-text-muted uk-text-small">Unloading Started</span>
        </div>;
        if(stop.unloadingStart){
            unloadingStart = <div>
                <span className = "label uk-margin-right">Unloading Started</span>
                {this.renderTime(stop.unloadingStart)}
            </div>;
        }
        let unloadingFinish = <div>
            <span className = "uk-text-muted uk-text-small">Completed</span>
        </div>;
        if(stop.unloadingFinish){
            unloadingFinish = <div>
                <span className = "label uk-margin-right">Completed</span>
                {this.renderTime(stop.unloadingFinish)}
            </div>;
        }

        return (
            <GridCell width="1-3">
                {unloadingStart}
                {unloadingFinish}
            </GridCell>
        );
    }
    renderLoadingOperation(stop){
        if(!stop.hasLoading){
            return null;
        }
        let loadingStart = <div>
            <span className = "uk-text-muted uk-text-small">Loading Started</span>
        </div>;
        if(stop.loadingStart){
            loadingStart = <div>
                <span className = "label uk-margin-right">Loading Started</span>
                {this.renderTime(stop.loadingStart)}
            </div>;
        }
        let loadingFinish = <div>
            <span className = "uk-text-muted uk-text-small">Completed</span>
        </div>;
        if(stop.loadingFinish){
            loadingFinish = <div>
                <span className = "label uk-margin-right">Completed</span>
                {this.renderTime(stop.loadingFinish)}
            </div>;
        }
        return (
            <GridCell width="1-3">
                {loadingStart}
                {loadingFinish}
            </GridCell>
        );
    }
    renderTripCode(stop){
        let tripPlan = <span className="uk-text-danger">Not Planned</span>;
        if(stop.tripPlanCode){
            tripPlan = <span><span className="label uk-margin-right">Trip Code</span> <span className="uk-text-muted uk-text-bold">{stop.tripPlanCode}</span></span>;
        }
        return(
            <GridCell width="1-1" noMargin = {true}>
                {tripPlan}
            </GridCell>
        );

    }
    renderStop(stop, isLastStop){
        let badgeClasses = ["uk-badge", "uk-margin-right"];
        badgeClasses.push("uk-badge-" + stop.status.style);
        let arrivalLabel = stop.actualArrival ? "ATA" : "ETA";
        let departureLabel = stop.actualDeparture ? "ATD" : "ETD";
        let departure = isLastStop ? "" :
            <div>
                <span className = "label uk-margin-right">{departureLabel}</span>
                {this.renderTime(stop.departure)}
            </div>;
        return(
        <div key = {stop.id} className="timeline_item">
            <div className="timeline_icon"><i className="material-icons">place</i></div>
            <div className="timeline_content" style = {{marginTop: "-5px"}}>
                <span className={badgeClasses.join(" ")}>{stop.status.text}</span>
                <span className="uk-text-large">{stop.location.name}</span>
            </div>
            <Grid>
                <GridCell width="1-3" noMargin = {true}>
                    <div>
                        <span className = "label uk-margin-right">{arrivalLabel}</span>
                        {this.renderTime(stop.arrival)}
                    </div>
                    {departure}
                </GridCell>
                {this.renderUnloadingOperation(stop)}
                {this.renderLoadingOperation(stop)}
                {isLastStop ? "" : this.renderTripCode(stop) }
            </Grid>

        </div>
        );
    }
    renderPlan(){
        if(this.state.stops.length == 0) {
            return <span>There is no segments & trip information</span>;
        }
        return (
            <div className="timeline">
                {
                    this.state.stops.map((stop, index) => {
                        let isLastStop = index == this.state.stops.length - 1;
                        return this.renderStop(stop, isLastStop);
                    })
                }
            </div>
        );
    }

    render() {
        if(!this.props.shipment){
            return null;
        }
        return (
            <Modal ref={(c) => this.modal = c} title="Segments & Trips" large = {true}
                   actions = { [ {label: "Close", action: () => this.closePreviewModal()} ] }>
                <Grid style = {{minHeight: "500px"}}>
                    {
                        this.state.busy ?
                        <Loader size="M" /> :
                        <GridCell width="1-1">
                            {this.renderPlan()}
                        </GridCell>
                    }
                </Grid>
            </Modal>
        );
    }
}