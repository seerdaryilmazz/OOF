import React from "react";
import _ from "lodash";
import {TranslatingComponent} from "susam-components/abstract";
import {Grid, GridCell, Card, Tab} from "susam-components/layout";
import {Notify, Button} from "susam-components/basic";

import {ShipmentSummary} from "./ShipmentSummary";
import {PlanStops} from "./PlanStops";
import {PlanShipments} from "./PlanShipments";
import {TrailerSelection} from "../planning/TrailerSelection"
import {TripService} from "../services";
import {PlanningSearchConstans} from "./PlanningSearchConstans";

export class PlanDetails extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {};

        this.moment = require('moment');

    }

    componentWillMount() {
    }

    componentDidMount() {
        this.setState({data: this.props.data}, () => {this.constructTripStops()});
    }

    componentWillReceiveProps(nextProps) {
        this.setState({data: nextProps.data}, () => {this.constructTripStops()});
    }

    extractShipmentList(dataList) {
        let ids = [];
        let shipments = [];

        if (dataList && dataList.length > 0) {
            dataList.forEach(data => {
                if (data.ops && data.ops.length > 0) {
                    data.ops.forEach(o => {
                        if (o.shipment && o.shipment.id && ids.indexOf(o.shipment.id) < 0) {
                            ids.push(o.shipment.id);
                            shipments.push(o.shipment);
                        }
                    })
                }
            })
        }

        return shipments;
    }

    sortShipments(shipmentList) {
        if (shipmentList && shipmentList.length > 0) {
            shipmentList.sort(function (a, b) {
                let i = new Number(a.id);
                let j = new Number(b.id);
                return i > j ? 1 : (i < j ? -1 : 0);
            })
        }
        return shipmentList;
    }

    constructTripStops() {

        let tripPlan = this.state.data;
        if(!tripPlan || !tripPlan.trips) {
            return;
        }

        let trips = _.cloneDeep(tripPlan.trips);
        let stops =[];

        trips.forEach((trip, index) => {

            let from = trip.fromTripStop;
            let to = trip.toTripStop;

            if(!from || !to) {
                throw new EventException("Format of Trip Plan, Trip Operations and start&End points are corrupted")
            }
            if(!from.tripOperations) {
                from.tripOperations = [];
            }
            if (!to.tripOperations) {
                to.tripOperations = [];
            }

            from._index = index;
            to._index = index + 1;

            if(index == 0) {
                from._isFirst = true;
                this.determineButtonAndStatusToDisplay(null, from);
                stops.push(from);
            }

            if(index == trips.length -1) {
                to._isLast = true;
            }

            this.determineButtonAndStatusToDisplay(from, to);
            if(to._departButton && to._isLast) {
                to._departButton = false;
                to._subStatus = tripPlan.planCompleted ? PlanningSearchConstans.STOP_SUBSTATUS_PLAN_COMPLETED: to._subStatus;
            }
            stops.push(to);
        });

        this.setIconsAndTypes(stops);
        this.setState({tripStops: stops});

    }

    determineButtonAndStatusToDisplay(prevStop, currentStop) {

        if(currentStop.vehicleDeparted) {
            currentStop._status = PlanningSearchConstans.STOP_STATUS_DEPARTED;
        } else if(prevStop) {
            if(prevStop.vehicleDeparted) {
                if(!currentStop.vehicleArrived) {
                    currentStop._status = PlanningSearchConstans.STOP_STATUS_PENDING;
                    currentStop._arriveButton = true;
                } else {
                    currentStop._status = PlanningSearchConstans.STOP_STATUS_ARRIVED;
                    this.determineButtonAndSubStatusDetails(currentStop);
                }
            } else {
                currentStop._status = PlanningSearchConstans.STOP_STATUS_PENDING;
            }
        } else {
            if(currentStop.initialVehicleStop) {
                    currentStop._status = PlanningSearchConstans.STOP_STATUS_ARRIVED;
                    this.determineButtonAndSubStatusDetails(currentStop);
            } else {
                if(!currentStop.vehicleArrived) {
                    currentStop._status = PlanningSearchConstans.STOP_STATUS_PENDING;
                    currentStop._arriveButton = true;
                } else {
                    currentStop._status = PlanningSearchConstans.STOP_STATUS_ARRIVED;
                    this.determineButtonAndSubStatusDetails(currentStop);
                }
            }
        }
    }

    determineButtonAndSubStatusDetails(currentStop) {

        let isCustomerLocation = currentStop.locationType == PlanningSearchConstans.LOCATION_TYPE_CUSTOMER;

        let loadOperationObligates = false;
        if(currentStop.hasUnloadingOperation) {
            loadOperationObligates = true;
            if (!currentStop.unloadingOperationsStarted) {
                if(isCustomerLocation) {
                    currentStop._startUnloadButton = true;
                }
            } else if (!currentStop.unloadingOperationsCompleted) {
                if(isCustomerLocation) {
                    currentStop._completeUnloadButton = true;
                }
                currentStop._subStatus = PlanningSearchConstans.STOP_SUBSTATUS_UNLOADING_STARTED;
            } else {
                loadOperationObligates = false;
                currentStop._subStatus = PlanningSearchConstans.STOP_SUBSTATUS_UNLOADING_COMPLETED;
            }
        }

        let unloadOperationObligates = false;
        if(!loadOperationObligates && currentStop.hasLoadingOperation) {
            unloadOperationObligates = true;
            if (!currentStop.loadingOperationsStarted) {
                if(isCustomerLocation) {
                    currentStop._startLoadButton = true;
                }
            } else if (!currentStop.loadingOperationsCompleted) {
                if(isCustomerLocation) {
                    currentStop._completeLoadButton = true;
                }
                currentStop._subStatus = PlanningSearchConstans.STOP_SUBSTATUS_LOADING_STARTED;
            } else {
                unloadOperationObligates = false;
                currentStop._subStatus = PlanningSearchConstans.STOP_SUBSTATUS_LOADING_COMPLETED;
            }
        }

        if(!loadOperationObligates && !unloadOperationObligates) {
            currentStop._departButton = true;
        }
    }

    setIconsAndTypes(dataList) {
        if (dataList && dataList.length > 0) {
            dataList.forEach(data => {
                if (data.locationType == PlanningSearchConstans.LOCATION_TYPE_CUSTOMER) {
                    let loads = 0, unloads = 0;

                    if (data.tripOperations && data.tripOperations.length > 0) {
                        data.tripOperations.forEach(op => {
                            if (op.tripOperationType == PlanningSearchConstans.OP_TYPE_LOAD) {
                                loads++;
                            } else if (op.tripOperationType == PlanningSearchConstans.OP_TYPE_UNLOAD) {
                                unloads++;
                            }
                        });
                    }

                    if (loads > 0 && unloads > 0) {
                        data.icon = "customer_load_unload";
                        data.types = ["Pickup Customers", "Delivery Customers", "Pickup and Delivery Customers"];
                    } else if (loads > 0) {
                        data.icon = "customer_load";
                        data.types = ["Pickup Customers"];
                    } else {
                        data.icon = "customer_unload";
                        data.types = ["Delivery Customers"];
                    }
                } else if (data.locationType == PlanningSearchConstans.LOCATION_TYPE_WAREHOUSE) {
                    data.icon = "warehouse";
                    data.types = ["Warehouses"];
                } else if (data.locationType == PlanningSearchConstans.LOCATION_TYPE_TRAILER) {
                    data.icon = "trailer";
                    data.types = ["Trailers"];
                }
            });
        }

        return this.setIndexes(dataList);
    }


    setIndexes(dataList) {
        if (dataList && dataList.length > 0) {
            for (let i = 0; i < dataList.length; i++) {
                dataList[i].index = i;
            }
        }

        return dataList;
    }

    onSelectTrailer(trailer){
        this.props.onSelectTrailer(trailer);
    }

    handleSaveTripEstimatedDates() {
        let tripPlan = this.state.data;
        let tripStops = this.state.tripStops;
        let postData = tripStops.map(tripStop => { return {
                id: tripStop.id,
                estimatedTimeArrival: tripStop.estimatedTimeArrival ? tripStop.estimatedTimeArrival.localDateTime + " " + tripStop.estimatedTimeArrival.timezone : null,
                estimatedTimeDeparture: tripStop.estimatedTimeDeparture ? tripStop.estimatedTimeDeparture.localDateTime + " " + tripStop.estimatedTimeDeparture.timezone : null
        }});

       this.props.handleSaveTripEstimatedDates(tripPlan.id, postData);
    }

    dateUpdateHandler(tripStopId, field, value) {
        let tripStops = this.state.tripStops;

        let oldValue;

        let tripStop = tripStops.find(tripStop => tripStop.id == tripStopId);

        oldValue = _.cloneDeep(tripStop[field]);

        let valueArr = value.split(" ");
        tripStop[field].localDateTime = valueArr[0] + " " + valueArr[1];
        tripStop[field].timezone = valueArr[2];

        //this.adjustPlannedDatesWithWarnings(tripStops, tripStop, field, oldValue);

        this.setState({tripStops: tripStops});
    }

    adjustPlannedDatesWithWarnings(dataList, dataToBeUpdated, field, oldValue) {

        let adjustmentExist = this.adjustPlannedDates(dataList);

        let finalValue = dataToBeUpdated[field];

        if (adjustmentExist) {
            if(finalValue == oldValue) {
                UIkit.notify("Dates should be in order.");
            }
        }
    }

    adjustPlannedDates(dataList) {

        if (!dataList || dataList.length == 0) {
            return;
        }

        let isUpdated = false;

        let previousElemDeparture;
        let previousElemDepartureMoment;

        dataList.forEach((data, index) => {


            let arrivalMoment = this.moment(data.estimatedTimeArrival, "DD/MM/YYYY HH:mm");

            //ARRIVAL DATE of trio stop
            //If there exist any previousElemDepartureMoment (any date from previous trip stop if exist)
            //Ensure that current Trip Stop arrival dates > Previous Trip Stop Departure Date
            if (previousElemDepartureMoment && arrivalMoment < previousElemDepartureMoment) {
                data.estimatedTimeArrival = _.cloneDeep(previousElemDeparture);
                arrivalMoment = _.cloneDeep(previousElemDepartureMoment);
                isUpdated = true;
            }

            //DEPARTURE DATE of trip stop
            //last trip stop does not have departure time so skip it
            if (index < (dataList.length - 1)) {
                let departureMoment = this.moment(data.estimatedTimeDeparture, "DD/MM/YYYY HH:mm");

                //Ensure that current Trip Stop departure date > arrival date
                if (departureMoment < arrivalMoment) {
                    data.estimatedTimeDeparture = _.cloneDeep(data.estimatedTimeArrival);
                    departureMoment = _.cloneDeep(arrivalMoment);
                    isUpdated = true;
                }

                 previousElemDeparture = data.estimatedTimeDeparture;
                 previousElemDepartureMoment = departureMoment;


            }
        });

        return isUpdated;
    }

    render() {
        let data = this.state.data;


        if(!data) {
            return null;
        }


        let trips = null;
        if (data && data.trips) {
            trips = data.trips;

        }

        let shipments = null;
        if (data && data.shipments) {
            shipments = data.shipments;
        }

        let details = null;
        if (data && data.details) {
            details = data.details;
        }

        let tripStops = null;
        if(this.state.tripStops) {
            tripStops = this.state.tripStops;
        }

        let progress = {};
        let origin = null;
        if (trips
            && trips.length > 0
            && trips[0].fromTripStop
            && trips[0].fromTripStop.location
            && trips[0].fromTripStop.location.location) {
            origin = {
                lat: trips[0].fromTripStop.location.location.lat,
                lng: trips[0].fromTripStop.location.location.lon
            };
        }


        console.log(shipments);
        return (
            <Grid>
                <GridCell width="1-1">
                    <Card>
                        <ShipmentSummary data={details}></ShipmentSummary>
                    </Card>
                </GridCell>
                <GridCell width="1-1">
                    <Card>
                        <Grid>
                            <GridCell noMargin="true">
                                <Tab labels={["Stops", "Shipments"]} active="Model"
                                     align="vertical">
                                    <PlanStops tripStops={tripStops} trips={trips}
                                               handleArrive={(tripStop)=> {this.props.handleArrive(data.id, tripStop)}}
                                               handleDepart={(tripStop)=> {this.props.handleDepart(data.id, tripStop)}}
                                               handleStartUnloadJob={(tripStop)=> {this.props.handleStartUnloadJob(data.id, tripStop)}}
                                               handleCompleteUnloadJob={(tripStop)=> {this.props.handleCompleteUnloadJob(data.id, tripStop)}}
                                               handleStartLoadJob={(tripStop)=> {this.props.handleStartLoadJob(data.id, tripStop)}}
                                               handleCompleteLoadJob={(tripStop)=> {this.props.handleCompleteLoadJob(data.id, tripStop)}}
                                               dateUpdateHandler={(tripStopId, field, value) => {this.dateUpdateHandler(tripStopId, field, value)}}
                                               handleDetailsClick={(tripStop) => {this.props.handleDetailsClick(data.id, tripStop)}}
                                               />
                                    <PlanShipments data={shipments}/>
                                </Tab>
                            </GridCell>
                            <GridCell noMargin="true" width="1-5">
                                <TrailerSelection origin={origin}
                                                  onSelectTrailer={(trailer) => this.onSelectTrailer(trailer)}/>
                            </GridCell>
                            <GridCell noMargin="true" width="1-5">
                                <Button style="success" label="Save" onclick={() => {this.handleSaveTripEstimatedDates()}}/>
                            </GridCell>
                        </Grid>
                    </Card>
                </GridCell>
            </Grid>
        )
    }
}


PlanDetails.contextTypes = {
    translator: React.PropTypes.object
};
