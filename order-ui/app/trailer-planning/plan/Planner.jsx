import _ from "lodash";
import uuid from 'uuid';
import * as axios from 'axios';

import {TripService} from '../../services/TripService';

export class Planner{

    static OP_TYPE_LOAD = "LOAD";
    static OP_TYPE_UNLOAD = "UNLOAD";

    static LOCATION_TYPE_CUSTOMER = "CUSTOMER";
    static LOCATION_TYPE_WAREHOUSE = "WAREHOUSE";
    static LOCATION_TYPE_TRAILER = "TRAILER";

    static moment = require("moment");
    static momentTimezone = require('moment-timezone');
    static momentFormat = "DD/MM/YYYY HH:mm";

    static convertSelectedSegmentsToTripStops(selectedSegments, trailer, previousStops){
        let orderedSegments = Planner.reorderSegmentsUsingPreviousStops(selectedSegments, previousStops);
        let stops = Planner.calculateRoute(orderedSegments);
        Planner.calculateTrailerLoads(stops);
        Planner.calculatePlannedTimes(stops, previousStops);

        if(trailer){
            let trailerStop = Planner.convertTrailerLocationAsTripStop(trailer);
            if(stops && stops.length > 0) {
                let firstSTop = stops[0];
                if(firstSTop.id == trailerStop.id) {
                    //these 3 lines are not needed since default trip stops already has false as initial value
                    //these 3 lines exist because previous logic was to set the first stop as initial trailer location and it is changed
                    //the logic may change again so these 3 lines haven't been removed.
                    firstSTop.vehicleArrived = false;
                    firstSTop.vehicleDeparted = false;
                    firstSTop.vehicleStartPoint = false;
                } else {
                    stops.splice(0, 0, trailerStop);
                }
            }
        }

        Planner.copyRoutes(stops, previousStops);

        stops.forEach((stop, index) => {
            stop.index = index;
        });

        return stops;
    }
    static findSegmentsOfStop(stop){
        let loads = _.flatMap(stop.ops, op => op.loads);
        return loads.map(load => load.segmentId);
    }
    static reorderSegmentsUsingPreviousStops(selectedSegments, previousStops){
        if(!previousStops || previousStops.length == 0){
            return selectedSegments;
        }
        let orderedSegments = [];
        previousStops.forEach(stop => {
            if(stop.type != Planner.LOCATION_TYPE_CUSTOMER){
                return;
            }
            let segmentIds = Planner.findSegmentsOfStop(stop);
            segmentIds.forEach(segmentId => {
                let segment = _.find(selectedSegments, {id: segmentId});
                if (segment && !orderedSegments.includes(segment)) {
                    orderedSegments.push(segment);
                }
            });
        });
        let missingSegments = _.filter(selectedSegments, segment => {
           return !_.find(orderedSegments, {id: segment.id});
        });
        orderedSegments = orderedSegments.concat(missingSegments);
        return orderedSegments;
    }

    static calculateRoute(selectedSegments){
        let stops = [];
        selectedSegments.forEach(segment => {
            Planner.addLoadOperations(stops, segment);
            Planner.addUnloadOperations(stops, segment);
        });
        stops.forEach((stop, index) => {
            stop.index = index;
            stop.vehicleArrived = false;
            stop.vehicleDeparted = false;
            stop.vehicleStartPoint = false;
        });
        return stops;
    }
    static calculateTrailerLoads(stops){
        let trailerLoad = {
            grossWeight: 0,
            volume: 0,
            ldm: 0,
            payWeight: 0,
            packageTypes: []
        };
        stops.forEach(stop => {
            stop.ops.forEach(op => {
                if(op.type == Planner.OP_TYPE_LOAD){
                    op.loads.forEach(load => {
                        trailerLoad = Planner.addToTrailerLoad(trailerLoad, load);
                    });
                }
                if(op.type == Planner.OP_TYPE_UNLOAD){
                    op.loads.forEach(load => {
                        trailerLoad = Planner.subtractFromTrailerLoad(trailerLoad, load);
                    });
                }
            });
            stop.trailerLoad = _.cloneDeep(trailerLoad);
        });
    }
    static addToTrailerLoad(trailerLoad, load){
        let packageTypes = _.cloneDeep(trailerLoad.packageTypes);
        load.packageTypes.forEach(item => {
            let index = _.findIndex(packageTypes, {name: item.name});
            if(index >= 0){
                packageTypes[index] = {name: packageTypes[index].name, count: packageTypes[index].count + item.count};
            }else{
                packageTypes.push({name: item.name, count: item.count});
            }
        });

        return {
            grossWeight: load.grossWeight ? _.round(trailerLoad.grossWeight + load.grossWeight, 2) : trailerLoad.grossWeight,
            volume: load.volume ? _.round(trailerLoad.volume + load.volume, 2) : trailerLoad.volume,
            ldm: load.ldm ? _.round(trailerLoad.ldm + load.ldm, 2) : trailerLoad.ldm,
            payWeight: load.payWeight ? _.round(trailerLoad.payWeight + load.payWeight, 2) : trailerLoad.payWeight,
            packageTypes: packageTypes
        };
    }

    static subtractFromTrailerLoad(trailerLoad, load){
        let packageTypes = _.cloneDeep(trailerLoad.packageTypes);
        load.packageTypes.forEach(item => {
            let index = _.findIndex(packageTypes, {name: item.name});
            if(index >= 0){
                packageTypes[index] = {name: packageTypes[index].name, count: packageTypes[index].count - item.count};
            }
        });
        return {
            grossWeight: load.grossWeight ? _.round(trailerLoad.grossWeight - load.grossWeight, 2) : trailerLoad.grossWeight,
            volume: load.volume ? _.round(trailerLoad.volume - load.volume, 2) : trailerLoad.volume,
            ldm: load.ldm ? _.round(trailerLoad.ldm - load.ldm, 2) : trailerLoad.ldm,
            payWeight: load.payWeight ? _.round(trailerLoad.payWeight - load.payWeight, 2) : trailerLoad.payWeight,
            packageTypes: packageTypes
        };
    }

    static copyPreviousPlannedDates(stops, previousStops){
        if(!previousStops){
            return;
        }
        previousStops.forEach(prevStop => {
            if(prevStop.type != Planner.LOCATION_TYPE_TRAILER){
                let stop = _.find(stops, {id: prevStop.id});
                if(stop){
                    stop.plannedTimeArrival = prevStop.plannedTimeArrival;
                    stop.plannedTimeDeparture = prevStop.plannedTimeDeparture;
                }
            }
        });
    }

    static calculatePlannedTimes(stops, previousStops){
        Planner.copyPreviousPlannedDates(stops, previousStops);
        let currentPlan = {utcMoment: Planner.moment("01/01/2000 00:00", Planner.momentFormat)};
        stops.forEach(stop => {
            if(stop.type != Planner.LOCATION_TYPE_TRAILER){
                let plannedTimes = Planner.calculatePlannedTime(currentPlan, stop);
                if((!stop.plannedTimeArrival) || plannedTimes.plannedTimeArrival.utcMoment.isAfter(stop.plannedTimeArrival.utcMoment)){
                    stop.plannedTimeArrival = {
                        formatted: this.convertToTimezone(plannedTimes.plannedTimeArrival.formatted, stop.timezone),
                        timezone: stop.timezone,
                        utcMoment: plannedTimes.plannedTimeArrival.utcMoment
                    };
                }
                if((!stop.plannedTimeDeparture) || plannedTimes.plannedTimeDeparture.utcMoment.isAfter(stop.plannedTimeDeparture.utcMoment)){
                    stop.plannedTimeDeparture = {
                        formatted: this.convertToTimezone(plannedTimes.plannedTimeDeparture.formatted, stop.timezone),
                        timezone: stop.timezone,
                        utcMoment: plannedTimes.plannedTimeDeparture.utcMoment
                    } ;
                }
                currentPlan = stop.plannedTimeDeparture;
            }
        });
        if(stops && stops.length > 0) {
            stops[stops.length - 1].plannedTimeDeparture = null;
        }
    }


    static convertToTimezone(dateTime, timeZone) {

        if(!dateTime) {
            return dateTime;
        }

        let dateArr = dateTime.split(" ");
        let dateTimeWithoutTz = dateArr[0] + " " + dateArr[1];
        let baseTz = dateArr.length == 3 ? dateArr[2] : 'UTC';

        if(baseTz == timeZone) {
            return dateTime;
        }
        let dateTimeMoment  = Planner.momentTimezone.tz(dateTimeWithoutTz, Planner.momentFormat, true, baseTz);
        dateTimeMoment.tz(timeZone);
        return dateTimeMoment.format(Planner.momentFormat) + " " + timeZone;

    }

    static calculatePlannedTime(prevStopDeparture, stop){
        let operationMinDueDateTime = Planner.findMinReadyDateInStop(stop);
        let operationMaxDueDateTime = Planner.findMaxReadyDateInStop(stop);
        if(prevStopDeparture.utcMoment.isAfter(operationMinDueDateTime.utcMoment)){
            operationMinDueDateTime = prevStopDeparture;
        }
        if(operationMaxDueDateTime.utcMoment.isBefore(operationMinDueDateTime.utcMoment)){
            operationMaxDueDateTime = operationMinDueDateTime;
        }

        return {plannedTimeArrival: operationMinDueDateTime, plannedTimeDeparture: operationMaxDueDateTime};

    }

    static findMinReadyDateInStop(stop){
        let minReadyDate = {utcMoment: Planner.moment("01/01/2099 00:00", Planner.momentFormat)};
        stop.ops.forEach(op => {
            op.loads.forEach(load => {
                if (load.dueDate.utcMoment.isBefore(minReadyDate.utcMoment)) {
                    minReadyDate = load.dueDate;
                }
            });
        });
        return minReadyDate;
    }
    static findMaxReadyDateInStop(stop){
        let maxReadyDate = {utcMoment: Planner.moment("01/01/2000 00:00", Planner.momentFormat)};
        stop.ops.forEach(op => {
            op.loads.forEach(load => {
                if (load.dueDate.utcMoment.isAfter(maxReadyDate.utcMoment)) {
                    maxReadyDate = load.dueDate;
                }
            });
        });
        return maxReadyDate;
    }

    static trailerPlaceholderAsTripStop(){
        let stop = {id: "trailer_placeholder", _key: "trailer_placeholder",
            type: Planner.LOCATION_TYPE_TRAILER,
            name: "",
            description: "",
            ops: [],
            trailerLoad: {
                grossWeight: 0,
                ldm: 0,
                volume: 0,
                packageTypes:[]
            }
        };
        return stop;
    }

    static convertTrailerLocationAsTripStop(trailer){
        let stop = {id: trailer.assignment.location.id, _key: Planner.LOCATION_TYPE_TRAILER + ":" + trailer.assignment.location.id,
            type: Planner.LOCATION_TYPE_TRAILER,
            name: trailer.vehicle.plateNumber,
            pointOnMap: {lat: trailer.assignment.location.pointOnMap.latitude, lng: trailer.assignment.location.pointOnMap.longitude},
            description: trailer.assignment.location.formattedAddress,
            ops: [],
            trailerLoad: {
                grossWeight: 0,
                ldm: 0,
                volume: 0,
                packageTypes:[]
            },
            vehicleArrived: true,
            vehicleDeparted: false,
            vehicleStartPoint: true
        };
        return stop;
    }

    static addLoadOperations(stops, segment){
        let loadOpAtFromLocation = Planner.findInExistingStops(stops, segment.fromLocation.id, Planner.OP_TYPE_LOAD);
        let unloadOpAtToLocation = Planner.findInExistingStops(stops, segment.toLocation.id, Planner.OP_TYPE_UNLOAD);
        let unloadOpAtFromLocation = Planner.findInExistingStops(stops, segment.fromLocation.id, Planner.OP_TYPE_UNLOAD);
        let loadOpAtToLocation = Planner.findInExistingStops(stops, segment.toLocation.id, Planner.OP_TYPE_LOAD);

        if(loadOpAtFromLocation >= 0){
            let existingFromLocationStop = stops[loadOpAtFromLocation];
            Planner.appendLoadOp(existingFromLocationStop, segment);
        }else{
            if(unloadOpAtToLocation >= 0){
                stops.splice(unloadOpAtToLocation, 0, Planner.createLoadStop(segment));
            }else{
                if(unloadOpAtFromLocation >= 0){
                    let unloadStop = stops[unloadOpAtFromLocation];
                    Planner.appendLoadOp(unloadStop, segment);
                }else{
                    stops.push(Planner.createLoadStop(segment));
                }
            }
        }
    }
    static findInExistingStops(stops, locationId, op){
        return _.findIndex(stops, item => {
            return item.id == locationId && _.find(item.ops, {type: op});
        });
    }
    static appendLoadOp(stop, segment){
        let loadOp = _.find(stop.ops, {type: this.OP_TYPE_LOAD});
        if(loadOp){
            loadOp.loads.push(Planner.createOpsLoadFromShipment(segment));
        }else{
            stop.ops.push({
                type: Planner.OP_TYPE_LOAD,
                loads: [Planner.createOpsLoadFromShipment(segment)]
            });
        }
    }
    static createOpsLoadFromShipment(segment){
        let dateRestriction = segment.dateRestriction.minDeparture || segment.shipment.readyAtDate;
        let dueDate = this.calculateDueDate(dateRestriction);
        let shipment = _.cloneDeep(segment.shipment);
        return {
            shipmentCode: shipment.code,
            shipment: shipment,
            segmentId: segment.id,
            dueDate: dueDate,
            grossWeight: shipment.grossWeight,
            volume: shipment.volume,
            ldm: shipment.ldm,
            payWeight: shipment.payWeight,
            packageTypes: shipment.packageTypes
        }
    }


    static calculateDueDate(dateRestriction) {


        let now = Planner.moment().seconds(0).milliseconds(0);
        now.tz('UTC');
        let utcMoment = Planner.toMomentIgnoreTimezone(dateRestriction.utcDateTime);

        if(now > utcMoment) {
            utcMoment = now.clone();
        }

        // rounds the minutes to the multiplication of 15
        let utcRemainder = 15 - (utcMoment.minute() % 15);
        if(utcRemainder != 15) {
            utcMoment.add(utcRemainder,'minutes');
        }

        let timezone = dateRestriction.timezone;

        let localMoment = utcMoment.tz(timezone);
        return {
            formatted: localMoment.format(Planner.momentFormat) + " " + timezone,
            timezone: timezone,
            utcMoment: utcMoment
        }

    }

    static toMomentIgnoreTimezone(dateTimeStr){
        let dateSplit = dateTimeStr.split(" ");
        return Planner.moment(dateSplit[0] + " " + dateSplit[1], Planner.momentFormat);
    }
    static createLoadStop(segment){
        let stop = {id: segment.fromLocation.id, _key: segment.fromLocation.type + ":" + segment.fromLocation.id,
            type: segment.fromLocation.type,
            name: segment.fromLocation.name,
            pointOnMap: {lat: segment.fromLocation.location.lat, lng: segment.fromLocation.location.lon},
            ops: [{
                type: Planner.OP_TYPE_LOAD,
                loads:[Planner.createOpsLoadFromShipment(segment)]
            }],
            timezone: segment.fromLocation.timezone
        };
        return stop;
    }
    static addUnloadOperations(stops, segment){
        let loadOpAtFromLocation = Planner.findInExistingStops(stops, segment.fromLocation.id, Planner.OP_TYPE_LOAD);
        let unloadOpAtToLocation = Planner.findInExistingStops(stops, segment.toLocation.id, Planner.OP_TYPE_UNLOAD);
        let unloadOpAtFromLocation = Planner.findInExistingStops(stops, segment.fromLocation.id, Planner.OP_TYPE_UNLOAD);
        let loadOpAtToLocation = Planner.findInExistingStops(stops, segment.toLocation.id, Planner.OP_TYPE_LOAD);

        if(unloadOpAtToLocation >= 0){
            let existingToLocationStop = stops[unloadOpAtToLocation];
            Planner.appendUnloadOp(existingToLocationStop, segment);
        } else {
            if(unloadOpAtFromLocation >= 0 && loadOpAtToLocation > unloadOpAtFromLocation){
                let loadStop = stops[loadOpAtToLocation];
                Planner.appendUnloadOp(loadStop, segment);
            }else{
                stops.push(Planner.createUnloadStop(segment));
            }
        }
    }

    static appendUnloadOp(stop, segment){
        let unloadOp = _.find(stop.ops, {type: Planner.OP_TYPE_UNLOAD});
        if(unloadOp){
            unloadOp.loads.push(Planner.createOpsLoadFromShipment(segment));
        }else{
            stop.ops.push({
                type: this.OP_TYPE_UNLOAD,
                loads: [Planner.createOpsLoadFromShipment(segment)]
            });
        }
    }

    static createUnloadStop(segment){
        let stop = {id: segment.toLocation.id, _key: segment.toLocation.type + ":" + segment.toLocation.id,
            type: segment.toLocation.type,
            name: segment.toLocation.name,
            pointOnMap: {lat: segment.toLocation.location.lat, lng: segment.toLocation.location.lon},
            ops: [{
                type: this.OP_TYPE_UNLOAD,
                loads:[Planner.createOpsLoadFromShipment(segment)]
            }],
            timezone: segment.toLocation.timezone
        };
        return stop;
    }

    /**
     * @description when tripstops are somehow updated (order change, segment selection/removal), all the stops are re-created.
     *              this function is only responsible of copying the routes from previously trip stops to re-created trip stops
     *              later, another function "reviseRoutes" is called to decide whether any routes should be removed or initialize, it is not this functions responsibility
     * @param stops
     * @param previousStops
     */
    static copyRoutes(stops, previousStops) {

        let routeMap = {};
        if (previousStops) {
            previousStops.forEach(stop => {
                routeMap[stop._key] = _.cloneDeep(stop.route)
            });
        }

        if (stops) {
            stops.forEach((stop, index) => {
                if (index < stops.length - 1) {
                    let route = routeMap[stop._key];
                    if (route) {
                        stop.route = route;
                    }
                }
            });
        }
    }

    static createDefaultRoute() {
        return {
            routeLegs: []
        }
    }


    /**
     * @descirption removes routes whose destination stop is no more there
     * @param stops
     */
    static reviseRoutes(stops, callback) {

        let routeRequestParamQuee = [];

        stops.forEach((stop, index) => {
            if (index == stops.length - 1) {
                //last stop, should not have any route
                stop.route = null;
            } else {
                let nextStop = stops[index + 1];

                if (!stop.route) {
                    //doe snot have route, which means there is no route operationmade for this stop yet, it is probably just added,
                    // get routes and set if there exist only one option
                    routeRequestParamQuee.push({fromStop: stop, toStop: nextStop});
                } else {
                    if (stop.route && stop.route.routeLegs && stop.route.routeLegs.length > 0) {
                        let routeLegs = stop.route.routeLegs;
                        let companyLocationIds = routeLegs[routeLegs.length - 1].to.map(stop => stop.companyLocationId + "");
                        if (!companyLocationIds.includes(nextStop.id + "")) {
                            //has routelegs but next stop is changed, so get routes and set if there exist only one option
                            routeRequestParamQuee.push({fromStop: stop, toStop: nextStop});
                        } else {
                            //do nothing
                        }
                    }
                }
            }
        });

        if(routeRequestParamQuee.length == 0) {
            callback();
        } else {
            this.listRoutesSetIfSingleAvailable(routeRequestParamQuee, callback);
        }

    }


    /**
     * @description for each fromStop - ToStop pair in routeRequestParamQuee, gets the available routes from server.
     *              If there exist only one option, sets it as default route for the fromTripStop. Otherwise, sets a route with 0 route leg for the fromTripStop
     * @param routeRequestParamQuee
     * @param callback
     */
    static listRoutesSetIfSingleAvailable(routeRequestParamQuee, callback) {

        let requests = [];

        routeRequestParamQuee.forEach(params => {
            requests.push(TripService.findUsableRoutes(params.fromStop.id, params.fromStop.type, params.toStop.id, params.toStop.type));
        });

        Promise.all(requests).then((responses) => {
            //response is not array for single request
            let responseArray;
            if(!Array.isArray(responses)) {
                responseArray = [];
                responseArray.push(responses);
            } else {
                responseArray = responses;
            }

            responseArray.forEach((response, index) => {
                response.data.forEach(data => {
                    data._guiKey = uuid.v4();
                    if(data.routeLegs) {
                        data.routeLegs.forEach(data => {
                            data._guiKey = uuid.v4();
                        });
                    }
                });
                if(response.data.length == 1) {
                    routeRequestParamQuee[index].fromStop.route = response.data[0];
                } else {
                    routeRequestParamQuee[index].fromStop.route  = this.createDefaultRoute();
                }
            })
            callback();
        }).catch((error) => {
            throw error
        });


    }

}