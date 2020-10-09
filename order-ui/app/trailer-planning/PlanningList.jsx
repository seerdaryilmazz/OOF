import * as axios from 'axios';
import _ from "lodash";
import React from "react";
import { TranslatingComponent } from "susam-components/abstract";
import { Sortable } from "susam-components/advanced";
import { Button, Notify } from "susam-components/basic";
import { Grid, GridCell } from "susam-components/layout";
import uuid from 'uuid';
import { DateTimeMini } from '../planning/DateTimeMini';
import { LocationService, OrderService, TripService } from '../services';
import { GoogleMaps } from './map/GoogleMaps';
import { Planner } from './plan/Planner';
import { TrailerDistanceCalculation } from './plan/TrailerDistanceCalculation';
import { PlanningShipmentsTab } from './PlanningShipmentsTab';
import { PlanSummary } from './PlanSummary';
import { RouteSelectionModal } from './route/RouteSelectionModal';
import { SpotVehicleList } from './SpotVehicleList';
import { Storage } from './storage/Storage';
import { TrailerList } from './TrailerList';
import { StorageDataUpdater } from './updater/StorageDataUpdater';
import { VehicleFeature } from './VehicleFeature';







export class PlanningList extends TranslatingComponent{

    constructor(props){
        super(props);
        this.TAB_STOPS = "STOPS";
        this.TAB_SHIPMENTS = "SHIPMENTS";
        this.state = {sortableKey: uuid.v4(), display: this.TAB_STOPS};

    }

    handleResize = () => {
        this.checkMountSetState({contentHeight: window.innerHeight - $("#header_main").height(), saveButtonHeight: $("#save_plan").height()});
    };

    componentDidMount(){
        this.storage = new Storage(this.context);
        this._isMounted = true;
        $(window).resize(this.handleResize);
        $(window).trigger('resize');
        this.loadOptions();
        this.startSegmentPolling();
        this.startTrailerPolling();
        this.startSpotVehiclePolling();
    }
    componentWillUnmount(){
        this._isMounted = false;
        $(window).off("resize", this.handleResize);
        setTimeout(() => {
            this.selectedSegmentUpdater.clearInterval();
            this.selectedTrailerUpdater.clearInterval();
            this.allTrailerUpdater.clearInterval();
            this.trailerFilterUpdater.clearInterval();
            this.spotVehicleUpdater.clearInterval();
        }, 500);
    }

    shouldComponentUpdate(nextProps, nextState){
        return !_.isEqual(nextState, this.state) || !_.isEqual(nextProps, this.props);
    }

    loadOptions() {
        axios.all([
            LocationService.getRouteLegStops()])
            .then(axios.spread((routeLegStops) => {
                let options = {};
                options.routeLegStops = routeLegStops.data;
                this.setState({options: options})
            })).catch((error) => {
            Notify.showError(error);
        })
    }

    startSegmentPolling(){
        this.selectedSegmentUpdater =
            new StorageDataUpdater(this.context.storage,
                "trailer-planning.selected-segments", (prevData, nextData) => {
                    this.updateSelectedSegments(prevData, nextData);
                });
        this.selectedSegmentUpdater.startPolling(300);
    }
    startTrailerPolling(){
        this.allTrailerUpdater =
            new StorageDataUpdater(this.context.storage,
                "trailer-planning.all-trailers", (prevData, nextData) => {
                    let sortedTrailers = this.calculateTrailerDistances(_.cloneDeep(nextData), this.firstStop);
                    let filteredTrailers = this.applyTrailerFilter(this.state.trailerFilter, sortedTrailers);
                    this.checkMountSetState({filteredTrailers: filteredTrailers, sortedTrailers: sortedTrailers});
                });
        this.allTrailerUpdater.startPolling(1000);

        this.selectedTrailerUpdater =
            new StorageDataUpdater(this.context.storage,
                "trailer-planning.selected-trailer", (prevData, nextData) => {
                    this.updateSelectedTrailer(nextData);
                });
        this.selectedTrailerUpdater.startPolling(300);

        this.trailerFilterUpdater =
            new StorageDataUpdater(this.context.storage,
                "trailer-planning.trailer-filter", (prevData, nextData) => {
                    this.handleUpdateTrailerFilter(nextData);
                });
        this.trailerFilterUpdater.startPolling(300);
    }

    startSpotVehiclePolling(){
        this.spotVehicleUpdater =
            new StorageDataUpdater(this.context.storage,
                "trailer-planning.spot-vehicles", (prevData, nextData) => {
                    this.checkMountSetState({spotVehicles: _.cloneDeep(nextData)});
                });
        this.spotVehicleUpdater.startPolling(1000);

        this.selectedSpotVehicleUpdater =
            new StorageDataUpdater(this.context.storage,
                "trailer-planning.selected-spot-vehicle", (prevData, nextData) => {
                    this.updateSelectedSpotVehicle(nextData);
                });
        this.selectedSpotVehicleUpdater.startPolling(300);
    }

    updateSelectedSegments(previousSegments, segments){
        let trailer = null;
        if(!segments || segments.length == 0){
            JSON.parse(this.storage.writeStorage("trailer-planning.selected-trailer", null));
        }
        trailer = JSON.parse(this.storage.readStorage("trailer-planning.selected-trailer"));

        this.convertSelectedSegmentsToTripStops(segments, trailer, previousSegments);
    }


    updateSelectedTrailer(trailer){
        let segments = JSON.parse(this.storage.readStorage("trailer-planning.selected-segments"));
        this.convertSelectedSegmentsToTripStops(segments, trailer);
    }

    updateSelectedSpotVehicle(spotVehicle) {
        let segments = JSON.parse(this.storage.readStorage("trailer-planning.selected-segments"));
        this.convertSelectedSegmentsToTripStops(segments, null);
    }

    convertSelectedSegmentsToTripStops(selectedSegments, trailer, previousSegments){
        let stops = Planner.convertSelectedSegmentsToTripStops(selectedSegments, trailer, _.cloneDeep(this.state.stops));
        let totalTrailerLoad = this.calculateTotalLoad(stops);
        this.checkMountSetState({selectedSegments: selectedSegments, totalTrailerLoad: totalTrailerLoad}, () => {
            this.handleValidateVehicleFeatures(selectedSegments, trailer, () => {
                this.loadStopRouteInfo(stops, () => {
                    this.updateStops(stops, previousSegments, selectedSegments);
                });
            });
        });

        return stops;
    }
    calculateTotalLoad(stops) {
        let totalTrailerLoad = {
            grossWeight: 0,
            ldm: 0,
            packageTypes:[],
            payWeight: 0,
            volume: 0
        }

        let includedShipmentIds = [];
        if(stops) {
            stops.forEach(stop => {
                if(stop.ops) {
                    stop.ops.forEach(op => {
                        if(op.loads) {
                            op.loads.forEach(load => {
                                if(!includedShipmentIds.includes(load.shipment.id)) {
                                    totalTrailerLoad.grossWeight += load.grossWeight ? load.grossWeight : 0;
                                    totalTrailerLoad.ldm += load.ldm ? load.ldm : 0;
                                    totalTrailerLoad.payWeight += load.payWeight ? load.payWeight : 0;
                                    totalTrailerLoad.volume += load.volume ? load.volume : 0;
                                    if(load.packageTypes) {
                                        load.packageTypes.forEach(packageType => {
                                           let existedPackageType = totalTrailerLoad.packageTypes.find(type => type.name == packageType.name);
                                           if(existedPackageType) {
                                               existedPackageType.count += packageType.count ? packageType.count : 0;
                                           } else {
                                               totalTrailerLoad.packageTypes.push(packageType);
                                           }
                                        })
                                    }
                                }
                                includedShipmentIds.push(load.shipment.id);
                            })
                        }
                    })
                }
            })
        }
        return totalTrailerLoad;
    }

    loadStopRouteInfo(stops, callback) {
        if (this.storage.readStorage("trailer-planning.map-status") != "READY") {
            setTimeout(() => this.loadStopRouteInfo(stops, callback), 300);
            return;
        }
        let positions = stops.map(stop => {
            return {position: stop.pointOnMap, name: stop.name};
        });
        this.storage.writeStorage("trailer-planning.route", positions);

        GoogleMaps.calculateRoute(positions, (response) => {
            let routeInfo = response.routes[0].legs.map(leg => {
                let asMinute = _.round(leg.duration.value / 60, 0);
                let hours = _.round(asMinute / 60, 0);
                let mins = asMinute % 60;
                return {duration: {hours: hours, minutes: mins}, distance: _.round(leg.distance.value / 1000, 0)};
            });
            stops.forEach((stop, index) => stop.routeInfo = routeInfo[index]);

            if(callback) {
                callback();
            }
        });
    }

    updatePlannedArrivalTime(stop, value){
        stop.plannedTimeArrival = {
            formatted: Planner.convertToTimezone(value.formatted, stop.timezone),
            timezone: stop.timezone,
            utcMoment: value.utcMoment
        };
        if(stop.plannedTimeDeparture && stop.plannedTimeDeparture.utcMoment.isBefore(stop.plannedTimeArrival.utcMoment)){
            stop.plannedTimeDeparture = _.cloneDeep(stop.plannedTimeArrival);
        }
    }

    updatePlannedDepartureTime(stop, value){
        stop.plannedTimeDeparture = {
            formatted: Planner.convertToTimezone(value.formatted, stop.timezone),
            timezone: stop.timezone,
            utcMoment: value.utcMoment
        };
    }

    adjustPlannedTimes(stop, prevStopDeparture){
        if(stop.plannedTimeArrival.utcMoment.isBefore(prevStopDeparture.utcMoment)){
            this.updatePlannedArrivalTime(stop, prevStopDeparture);
        }
    }

    checkMountSetState(state, callback){
        if(this._isMounted){
            this.setState(state, () => {if(callback) {callback()}});
        }
    }

    findFirstNonTrailerStop(stops){
        if(!stops){
            return null;
        }
        let nonTrailerStops = _.filter(stops, item => {return item.type != Planner.LOCATION_TYPE_TRAILER});
        if(nonTrailerStops.length > 0){
            return nonTrailerStops[0];
        }
        return null;
    }

    updateStops(stops, previousSegments, segments, callback){
        let filteredTrailers = [];
        let sortedTrailers = _.cloneDeep(this.state.sortedTrailers);
        let trailerFilter = _.cloneDeep(this.state.trailerFilter);
        let firstStop = this.findFirstNonTrailerStop(stops);
        if(firstStop){
            if(!trailerFilter){
                trailerFilter = this.getInitialTrailerFilter(firstStop);
            }else{
                let firstStopArrival = this.changeHourOfTrailerDateFilter(firstStop.plannedTimeArrival.formatted);
                if(this.toMomentWithTimezone(firstStopArrival).isAfter(this.toMomentWithTimezone(trailerFilter.date))){
                    trailerFilter.date = firstStopArrival;
                }
            }

            if(previousSegments || segments) {
                trailerFilter.vehicleFeature = VehicleFeature.handleTrailerFilterChangeFromSegmentSelectionUpdate(trailerFilter, previousSegments, segments);
            }
            this.storage.writeStorage("trailer-planning.trailer-filter", trailerFilter);
            if(!this.firstStop || this.firstStop.id != firstStop.id){
                this.firstStop = firstStop;
                let trailers = JSON.parse(this.storage.readStorage("trailer-planning.all-trailers"));
                sortedTrailers = this.calculateTrailerDistances(trailers, firstStop);
            }
            if(!sortedTrailers){
                let trailers = JSON.parse(this.storage.readStorage("trailer-planning.all-trailers"));
                sortedTrailers = this.calculateTrailerDistances(trailers, firstStop);
            }
            filteredTrailers = this.applyTrailerFilter(trailerFilter, sortedTrailers);
        }
        Planner.reviseRoutes(stops, () => {
            if(this._isMounted){
                this.setState({stops: stops, filteredTrailers: filteredTrailers, sortedTrailers: sortedTrailers, trailerFilter: trailerFilter}, () => {
                    if(callback) {
                        callback();
                    }
                    this.forceUpdate();
                });
            }
            this.calculateRouteDistance(filteredTrailers, firstStop);
        });

    }

    calculateTrailerDistances(trailers, firstStop){
        if(trailers && firstStop){
            let trailersWithLocation = _.filter(trailers, item => _.get(item, "assignment.location.pointOnMap"));
            return TrailerDistanceCalculation.sortByBeelineDistanceToFirstStop(trailersWithLocation, firstStop);
        }
        return trailers;
    }

    calculateRouteDistance(filteredTrailers, firstStop){
        if(!filteredTrailers || filteredTrailers.length == 0){
            return;
        }
        if(this.storage.readStorage("trailer-planning.map-status") != "READY"){
            setTimeout(() => this.calculateRouteDistance(filteredTrailers, firstStop), 300);
            return;
        }

        if(!firstStop){
            filteredTrailers.forEach(trailer => {
                let foundTrailer = _.find(filteredTrailers, {id: trailer.id});
                if(foundTrailer){
                    foundTrailer._groundDistanceToFirstStop = null;
                    foundTrailer._groundDurationToFirstStop = null;
                    foundTrailer._groundDistanceAndDurationText = null;
                }

            });
        }else{
            let clonedTrailers = _.cloneDeep(filteredTrailers);
            TrailerDistanceCalculation.calculateRouteDistance(
                filteredTrailers.slice(0, 3),
                firstStop.pointOnMap,
                (calculatedTrailers, distanceMatrices) => {
                    let closestTrailers = TrailerDistanceCalculation.applyDistanceMatricesToTrailers(calculatedTrailers, distanceMatrices);
                    closestTrailers.forEach(trailer => {
                        let foundTrailer = _.find(clonedTrailers, {id: trailer.id});
                        if(foundTrailer){
                            foundTrailer._groundDistanceToFirstStop = trailer._groundDistanceToFirstStop;
                            foundTrailer._groundDurationToFirstStop = trailer._groundDurationToFirstStop;
                            foundTrailer._groundDistanceAndDurationText = trailer._groundDistanceAndDurationText;
                        }
                    });
                    this.setState({filteredTrailers: clonedTrailers}, () => {
                        this.forceUpdate();
                    });
                }
            );
        }


    }

    handleDistanceCalculateForTrailer(trailer){
        let firstStop = this.findFirstNonTrailerStop(this.state.stops);
        if(!firstStop){
             return;
        }
        TrailerDistanceCalculation.calculateGroundDistanceForSingleVehicle(
            trailer.assignment.location.pointOnMap,
            firstStop.pointOnMap,
            (distanceMatrix) => {
                if (distanceMatrix) {
                    let filteredTrailers = _.cloneDeep(this.state.filteredTrailers);
                    let foundTrailer = _.find(filteredTrailers, {id: trailer.id});
                    TrailerDistanceCalculation.applyDistanceMatrix(foundTrailer, distanceMatrix);
                    this.setState({filteredTrailers: filteredTrailers});
                }
            });
    }

    handleDistanceCalculateForSpotVehicle(spotVehicle){
        let firstStop = this.findFirstNonTrailerStop(this.state.stops);
        if(!firstStop){
            return;
        }
        TrailerDistanceCalculation.calculateGroundDistanceForSingleVehicle(
            {latitude: spotVehicle.pointOnMap.lat, longitude: spotVehicle.pointOnMap.lng},
            firstStop.pointOnMap,
            (distanceMatrix) => {
                if (distanceMatrix) {
                    let spotVehicles = _.cloneDeep(this.state.spotVehicles);
                    let foundSpotVehicle = _.find(spotVehicles, {id: spotVehicle.id});
                    TrailerDistanceCalculation.applyDistanceMatrix(foundSpotVehicle, distanceMatrix);
                    this.setState({spotVehicles: spotVehicles});
                }
            });
    }

    getInitialTrailerFilter(firstStop){
        return {distance: 100,
            date:  this.changeHourOfTrailerDateFilter(firstStop.plannedTimeArrival.formatted),
            vehicleFeature: {}}
    }

    changeHourOfTrailerDateFilter(date){
        let dateSplit = date.split(" ");
        return (dateSplit[0] + " 23:59 " + dateSplit[2]);
    }

    applyTrailerFilter(filter, trailers){
        if(!filter || !trailers){
            return [];
        }
        let distanceFilter = filter.distance != -1 ? filter.distance * 1000 : null;
        let dateFilterMoment = this.toMomentWithTimezone(filter.date);
        let filteredTrailers = _.filter(trailers, trailer => {
            let distanceFilterSuccess = false;
            if(!distanceFilter){
                distanceFilterSuccess = true;
            }else{
                distanceFilterSuccess = _.isNumber(trailer._airDistanceToFirstStop) && trailer._airDistanceToFirstStop <= distanceFilter;
            }
            let dateFilterSuccess = trailer.availableTime && this.toMomentWithTimezone(trailer.availableTime).isBefore(dateFilterMoment);

            let featureFilter = true;
            if(filter.vehicleFeature) {
                featureFilter = VehicleFeature.isTrailerAppropriate(filter.vehicleFeature, trailer);
            }

            return distanceFilterSuccess && dateFilterSuccess && featureFilter;
        });
        this.storage.writeStorage("trailer-planning.filtered-trailers", filteredTrailers);
        return filteredTrailers;
    }

    verifyRoute(stops){
        let loaded = [];
        let locTypeTrailer = Planner.LOCATION_TYPE_TRAILER;
        let opTypeLoad = Planner.OP_TYPE_LOAD;
        let opTypeUnload = Planner.OP_TYPE_UNLOAD;
        if(!checkTrailer(stops)){
            return false;
        }
        if(!checkLoadSanity(stops)){
            return false;
        }
        return true;

        function checkLoadSanity(stops){
            let result = true;
            stops.forEach(stop => {
                stop.ops.forEach(op => {
                    if(op.type == opTypeLoad){
                        addToLoaded(op.loads);
                    }
                    if(op.type == opTypeUnload){
                        let allLoaded = checkIfLoaded(op.loads);
                        if(allLoaded){
                            removeFromLoaded(op.loads);
                        }else{
                            result = false;
                        }
                    }
                })
            });
            return result;
        }

        function checkTrailer(stops){
            let trailerIndex = _.findIndex(stops, stop => stop.type == locTypeTrailer);
            if(trailerIndex > 0){
                Notify.showError("Trailer location should be the very first stop in planning");
                return false;
            }
            return true;
        }

        function addToLoaded(loads){
            loads.forEach(load => {
                loaded.push(load.shipmentCode);
            });
        }
        function checkIfLoaded(loads){
            let result = true;
            loads.forEach(load => {
                let index = _.findIndex(loaded, item => item == load.shipmentCode);
                if(index == -1){
                    Notify.showError("Shipment  #" + load.shipmentCode + " is not loaded at the time of unloading");
                    result = false;
                }
            });
            return result;
        }
        function removeFromLoaded(loads){
            loads.forEach(load => {
                let index = _.findIndex(loaded, item => item == load.shipmentCode);
                if(index != -1){
                    loaded.splice(index, 1);
                }
            });
        }
    }


    toMomentWithTimezone(dateTimeStr){
        let dateSplit = dateTimeStr.split(" ");
        return Planner.momentTimezone.tz(dateSplit[0] + " " + dateSplit[1], Planner.momentFormat, true, dateSplit[2]);
    }

    isLastStop(stop){
        return this.state.stops.length -1 == stop.index;
    }
    isFirstStop(stop){
        return stop.index == 0;
    }

    handleRouteChanged(stops){
        if(this.verifyRoute(stops)){
            Planner.calculateTrailerLoads(stops);
            Planner.calculatePlannedTimes(stops);
            this.loadStopRouteInfo(stops, () => {
                this.updateStops(stops);
            });
        }else{
            this.checkMountSetState({sortableKey: uuid.v4()});
        }
    }

    handleRouteUpdate(stopKey, route) {
        let stops = this.state.stops;
        let stop = stops.find(stop => stop._key == stopKey);

        if (stop || this._isMounted) {
            stop.route = route;

            if(!this.verifyRouteDateSelectionConfliction(stop)) {
                return false;
            }
            this.updateStops(stops);
            return true;
        } else {
            return false;
        }
    }

    handleRemoveSegment(segment){
        let selectedSegments = JSON.parse(this.storage.readStorage("trailer-planning.selected-segments"));
        if(!selectedSegments){
            selectedSegments = [];
        }
        let segmentIndex = _.findIndex(selectedSegments, {_key: segment._key});
        if(segmentIndex >= 0){
            selectedSegments.splice(segmentIndex, 1);
        }
        this.storage.writeStorage("trailer-planning.selected-segments", selectedSegments);
        if(selectedSegments.length == 0) {
            this.storage.writeStorage("trailer-planning.selected-trailer", null);
            this.storage.writeStorage("trailer-planning.selected-spot-vehicle", null);
        }
    }

    handleTrailerRemove(){
        this.storage.writeStorage("trailer-planning.selected-trailer", null);
    }

    handleSpotVehicleRouteRemove(){
        this.storage.writeStorage("trailer-planning.selected-spot-vehicle", null);
    }


    convertFormattedDate(value){
        let dateSplit = value.split(" ");
        let utcMoment = this.toMomentWithTimezone(value).tz("UTC");
        return {
            formatted: value,
            timezone: dateSplit[2],
            utcMoment: utcMoment
        };
    }

    handleRequiredVehicleEnableDisable(segmentKey, vehicleFeatureId) {
        let selectedSegments = JSON.parse(this.storage.readStorage("trailer-planning.selected-segments"));
        if(selectedSegments){
            let segmentIndex = _.findIndex(selectedSegments, {_key: segmentKey});
            let segment = selectedSegments[segmentIndex];
            if(segment) {
                VehicleFeature.switchSegmentRequiredVehicleFeature(segment, vehicleFeatureId);
                this.storage.writeStorage("trailer-planning.selected-segments", selectedSegments);
            }
        }
    }

    handleNotAllowedVehicleEnableDisable(segmentKey, vehicleFeatureId) {
        let selectedSegments = JSON.parse(this.storage.readStorage("trailer-planning.selected-segments"));
        if(selectedSegments) {
            let segmentIndex = _.findIndex(selectedSegments, {_key: segmentKey});
            let segment = selectedSegments[segmentIndex];
            if(segment) {
                VehicleFeature.switchSegmentNotAllowedVehicleFeature(segment, vehicleFeatureId);
                this.storage.writeStorage("trailer-planning.selected-segments", selectedSegments);
            }
        }
    }

    handleValidateVehicleFeatures(selectedSegments, selectedTrailer, callback) {

        let conflictionRequest = VehicleFeature.prepareRequestForIsVehicleFeaturesConflict(selectedSegments);
        let appropriatenessRequest = VehicleFeature.prepareRequestForIsTrailerAppropriate(selectedTrailer, selectedSegments);

        axios.all([OrderService.isVehicleFeaturesConflict(conflictionRequest), OrderService.isVehicleAppropriate(appropriatenessRequest)])
            .then(axios.spread((conflictionResponse, appropriatenessResponse) => {
                let vehicleFeatureConfliction = false;
                let vehicleFeatureConflictionMessage = null;
                let vehicleAppropriateProblem = false;
                let vehicleAppropriateProblemMessage = null;
                if (conflictionResponse.data) {
                    vehicleFeatureConfliction = true;
                    vehicleFeatureConflictionMessage = conflictionResponse.data;
                }
                if (appropriatenessResponse.data) {
                    vehicleAppropriateProblem = true;
                    vehicleAppropriateProblemMessage = appropriatenessResponse.data;
                }
                this.setState({
                    vehicleFeatureConfliction: vehicleFeatureConfliction,
                    vehicleFeatureConflictionMessage: vehicleFeatureConflictionMessage,
                    vehicleAppropriateProblem: selectedTrailer ? vehicleAppropriateProblem : false,
                    vehicleAppropriateProblemMessage: selectedTrailer ? vehicleAppropriateProblemMessage : ""
                }, () => {
                    if (callback) {
                        callback();
                    }
                })
            })).catch((error) => {
            this.setState({
                vehicleFeatureConfliction: true,
                vehicleFeatureConflictionMessage: "An Error Occured while validating features",
                vehicleAppropriateProblem: false,
                vehicleAppropriateProblemMessage: ""
            }, () => {
                if (callback) {
                    callback();
                }
            })
        });
    }

    handleStopPTAUpdate(stop, value){
        let stops = _.cloneDeep(this.state.stops);
        let stopIndex = _.findIndex(stops, {index: stop.index});
        let converted = this.convertFormattedDate(value);
        if(stopIndex >= 0){
            this.updatePlannedArrivalTime(stops[stopIndex], converted);
            let prevDeparture = stops[stopIndex].plannedTimeDeparture;
            stopIndex++;
            while(stopIndex < stops.length){
                this.adjustPlannedTimes(stops[stopIndex], prevDeparture);
                prevDeparture = stops[stopIndex].plannedTimeDeparture;
                stopIndex++;
            }
        }

        this.updateStops(stops);
    }

    handleStopPTDUpdate(stop, value){
        let stops = _.cloneDeep(this.state.stops);
        let stopIndex = _.findIndex(stops, {index: stop.index});
        let converted = this.convertFormattedDate(value);
        if(stopIndex >= 0){
            if(stops[stopIndex].plannedTimeArrival.utcMoment.isAfter(converted.utcMoment)){
                Notify.showError("Planned departure should be after planned arrival");
                this.updatePlannedDepartureTime(stops[stopIndex], stops[stopIndex].plannedTimeDeparture);
                this.updateStops(stops);
                return;
            }
            this.updatePlannedDepartureTime(stops[stopIndex], converted);
            let prevDeparture = stops[stopIndex].plannedTimeDeparture;
            stopIndex++;
            while(stopIndex < stops.length){
                this.adjustPlannedTimes(stops[stopIndex], prevDeparture);
                prevDeparture = stops[stopIndex].plannedTimeDeparture;
                stopIndex++;
            }
        }

        this.updateStops(stops);
    }

    handleStopsTabClick(e){
        e.preventDefault();
        this.checkMountSetState({display: this.TAB_STOPS});
    }
    handleShipmentsTabClick(e){
        e.preventDefault();

        this.checkMountSetState({display: this.TAB_SHIPMENTS});
    }
    validatePlan() {
        let selectedTrailer = JSON.parse(this.storage.readStorage("trailer-planning.selected-trailer"));
        let selectedSpotVehicleRoute = JSON.parse(this.storage.readStorage("trailer-planning.selected-spot-vehicle"));

        if (!selectedTrailer && !selectedSpotVehicleRoute) {
            Notify.showError("Please select a trailer or spot vehicle");
            return;
        }
        else if (selectedTrailer && selectedSpotVehicleRoute) {
            Notify.showError("Please select either a trailer or spot vehicle, not both.");
            return;
        }

        return ( this.verifyRouteSelections(this.state.stops)
            && this.verifyRoute(this.state.stops)
            && this.verifyPlannedDates(selectedTrailer, selectedSpotVehicleRoute, this.state.stops)
            && this.verifyRouteDates(this.state.stops) );
    }

    verifyRouteSelections(stops) {

        let errorMessage = null;
        stops.forEach((stop, index) => {
            //last element does not have  route, exclude its eori
            if(index < stops.length - 1) {
                if (!stop.route || !stop.route.routeLegs || stop.route.routeLegs.length == 0) {
                    errorMessage = "Missing Route Selection from Stop: " + stop.name;
                }
                else {
                    //find routelges that have at least one expeditions in expedition options
                    let routeLegsWithExpeditions = stop.route.routeLegs.filter(routeLeg => routeLeg.expeditions && routeLeg.expeditions.length > 0);

                    //if there exist a route leg with "more than one selectable expedition" and "no expedition is selected", do not validate
                    routeLegsWithExpeditions.forEach(routeLegsWithExpedition => {
                        if(!routeLegsWithExpedition.expedition) {
                            errorMessage = "Missing Tariff Selection from Stop: " + stop.name;
                        }
                    });
                }
            }
        });

        if(errorMessage) {
            Notify.showError(errorMessage);
            return false;
        }

        return true;
    }


    verifyPlannedDates(selectedTrailer, selectedSpotVehicleRoute, stops) {

        if (!stops || stops.length == 0) {
            return true;
        }

        let verified = true;
        try {
            let vehicleDate = null;
            if (selectedTrailer) {
                vehicleDate = this.toMomentWithTimezone(selectedTrailer.availableTime);
            } else if (selectedSpotVehicleRoute) {
                vehicleDate = this.toMomentWithTimezone(selectedSpotVehicleRoute.availableTime);
            }

            let previousStop = null;
            stops.forEach(stop => {
                let plannedArrivalDate = stop.plannedTimeArrival ? stop.plannedTimeArrival.utcMoment : null;
                let plannedDepartureDate = stop.plannedTimeDeparture ? stop.plannedTimeDeparture.utcMoment : null;

                if (!previousStop) {
                    if (vehicleDate && plannedArrivalDate && plannedArrivalDate < vehicleDate) {
                        throw "First Stop's arrival date can not be earlier than Vehicle Available Date";
                    }
                } else {
                    let departureDateOfPreviousStop = previousStop && previousStop.plannedTimeDeparture ? previousStop.plannedTimeDeparture.utcMoment : null;
                    if (departureDateOfPreviousStop && plannedArrivalDate && plannedArrivalDate < departureDateOfPreviousStop) {
                        throw "Trip Stop's arrival date can not be earlier than Previous Stop's Departure Date";
                    }
                }

                if (plannedArrivalDate && plannedDepartureDate && plannedDepartureDate < plannedArrivalDate) {
                    throw "Departure Date can not be before Arrival Date";
                }
                //handle PTD verifications second
                if (plannedDepartureDate) {
                    this.validateDepartureDateAndOperationDueDates(plannedDepartureDate, stop);
                }

                previousStop = stop;
            });

        } catch (err) {
            verified = false;
            Notify.showError(err);
        }

        return verified;
    }

    validateDepartureDateAndOperationDueDates(plannedDepartureDate, stop) {
        if (stop.ops) {
            stop.ops.forEach(op => {
                if (op.loads) {
                    op.loads.forEach(load => {
                        if(load.dueDate) {
                            let loadDueDate = load.dueDate.utcMoment;
                            if(plannedDepartureDate < loadDueDate ) {
                                throw ("Departure Date from '" + stop.name + "' can not be less than Min. Departure/Ready Date of" + (load.shipment ? (" shipment '" + load.shipment.code +  "'." ) : " a shipment."));
                            }
                        }
                    });
                }
            });
        }
    }

    /**
     * @description, called before saving the whole plan to validate the relations between all dates, including selected schedules
     * @param stops
     * @returns {boolean}
     */
    verifyRouteDates(stops) {

        let verified = true;
        try {
            stops.forEach((stop, index) => {

                let nextStop = index < stops.length-1 ? stops[index + 1] : null;

                let firstExpedition;
                let previouslyEvaluatedExpedition;
                let currentExpedition;

                if (stop.route && stop.route.routeLegs) {
                    stop.route.routeLegs.forEach(routeLeg => {
                        if (routeLeg.expedition) {
                            currentExpedition = _.cloneDeep(routeLeg.expedition);

                            currentExpedition.departureUtcMoment = this.toMomentWithTimezone(currentExpedition.departure).tz("UTC");
                            currentExpedition.arrivalUtcMoment = this.toMomentWithTimezone(currentExpedition.arrival).tz("UTC");

                            if (currentExpedition.departureUtcMoment.isAfter(currentExpedition.arrivalUtcMoment)) {
                                throw "'Arrival Date' of schedule is before 'Departure Date' of same schedule for Route: " + stop.route.name;
                            }
                            if (!firstExpedition) {
                                firstExpedition = currentExpedition;
                            }
                            if(previouslyEvaluatedExpedition
                                && previouslyEvaluatedExpedition.arrivalUtcMoment.isAfter(currentExpedition.departureUtcMoment)) {
                                throw "Schedules have confliction for Route: " + stop.route.name;
                            }
                            previouslyEvaluatedExpedition = currentExpedition;
                        }
                    })
                }

                if(stop.plannedTimeDeparture && firstExpedition) {
                    if(stop.plannedTimeDeparture.utcMoment.isAfter(firstExpedition.departureUtcMoment)) {
                        throw "Route " + stop.route.name + " 'Schedule Departure Date' is before than Stop '" + stop.name + "' Departure Date." ;
                    }
                }

                if(nextStop && nextStop.plannedTimeArrival && previouslyEvaluatedExpedition) {
                    if(nextStop.plannedTimeArrival.utcMoment.isBefore(previouslyEvaluatedExpedition.arrivalUtcMoment)) {
                        throw "Route " + stop.route.name + " 'Schedule Arrival Date' is later than Stop '" + nextStop.name + "' Arrival Date." ;
                    }
                }
            });
        } catch(err) {
            verified = false;
            Notify.showError(err);
        }
        return verified;
    }

    /**
     * @description called before saving&closing route modal to ensure selected multiple tariffs for that single stop does not conflict with each other.
     *              tariff's relation with PTA'S & PTD'S are not controlled here
     * @param stop
     */
    verifyRouteDateSelectionConfliction(stop) {
        let verified = true;
        try {
            let previouslyEvaluatedExpedition;
            stop.route.routeLegs.forEach(routeLeg => {
                if (routeLeg.expedition) {
                    let currentExpedition = _.cloneDeep(routeLeg.expedition);

                    currentExpedition.departureUtcMoment = this.toMomentWithTimezone(currentExpedition.departure).tz("UTC");
                    currentExpedition.arrivalUtcMoment = this.toMomentWithTimezone(currentExpedition.arrival).tz("UTC");

                    if (currentExpedition.departureUtcMoment.isAfter(currentExpedition.arrivalUtcMoment)) {
                        throw "'Arrival Date' of schedule is before 'Departure Date' of same schedule";
                    }

                    if(previouslyEvaluatedExpedition
                        && previouslyEvaluatedExpedition.arrivalUtcMoment.isAfter(currentExpedition.departureUtcMoment)) {
                        throw "Schedules have confliction";
                    }
                    previouslyEvaluatedExpedition = currentExpedition;
                }
            })
        } catch(err) {
            verified = false;
            Notify.showError(err);
        }
        return verified;
    }

    handleUpdateTrailerFilter(filter){
        if(this.state.sortedTrailers){
            let filteredTrailers = this.applyTrailerFilter(filter, this.state.sortedTrailers);
            this.setState({trailerFilter: filter, filteredTrailers: filteredTrailers});
            this.calculateRouteDistance(filteredTrailers, this.firstStop);
        }
        this.storage.writeStorage("trailer-planning.trailer-filter", filter);
    }

    handlePlanningListSelect(){
        this.checkMountSetState({showTrailers: false, showSpotVehicles: false});
    }
    handleTrailerListSelect(){
        this.checkMountSetState({showTrailers: true, showSpotVehicles: false});
    }
    handleSpotVehicleListSelect(){
        this.checkMountSetState({showSpotVehicles: true, showTrailers: false});
    }

    handleSavePlan() {
        if (!this.validatePlan()) {
            return;
        }

        let selectedTrailer = JSON.parse(this.storage.readStorage("trailer-planning.selected-trailer"));
        let selectedSpotVehicleRoute = JSON.parse(this.storage.readStorage("trailer-planning.selected-spot-vehicle"));

        let totalTrailerLoad = _.cloneDeep(this.state.totalTrailerLoad);
        let packageNames = totalTrailerLoad.packageTypes.map(item => item.count + " " + item.name);
        totalTrailerLoad.details = packageNames.join(", ");

        let stops = this.state.stops.map(stop => {
            let opLoads = stop.ops.map(op => {
                return op.loads.map(load => {
                    return {
                        segmentId: load.segmentId,
                        opType: {id: op.type},
                        shipment: load.shipment
                    }
                })

            });
            let ops = _.flatten(opLoads);
            let info = {
                id: stop.id,
                name: stop.name,
                type: stop.type
            };
            return {
                info: info,
                ops: ops,
                plannedTimeArrival: stop.plannedTimeArrival ? stop.plannedTimeArrival.formatted : "",
                plannedTimeDeparture: stop.plannedTimeDeparture ? stop.plannedTimeDeparture.formatted : "",
                route: stop.route,
                vehicleArrived: stop.vehicleArrived,
                vehicleDeparted: stop.vehicleDeparted,
                vehicleStartPoint: stop.vehicleStartPoint
            }
        });
        let data = {
            summary: totalTrailerLoad,
            stops: stops,
            trailer: selectedTrailer ? selectedTrailer.vehicle : null,
            spotVehicleRoute: selectedSpotVehicleRoute
        };

        TripService.requestPlanning(data).then((response) => {
            let selectedSegments = JSON.parse(this.storage.readStorage("trailer-planning.selected-segments"));
            let allSegments = JSON.parse(this.storage.readStorage("trailer-planning.all-segments"));

            _.remove(allSegments, segment => _.find(selectedSegments, {id: segment.id}));

            this.storage.writeStorage("trailer-planning.all-segments", allSegments);
            this.storage.writeStorage("trailer-planning.selected-segments", []);
            this.storage.writeStorage("trailer-planning.close-segment-details", selectedSegments);
            this.storage.writeStorage("trailer-planning.selected-trailer", null);
            this.storage.writeStorage("trailer-planning.selected-spot-vehicle", null);

            //setting the spot vehicle as used is asynch in backend, frontend does not know when it is done
            //so we manually remove the used spot vehicle from the list
            if(data.spotVehicleRoute != null) {
                let spotVehicles = JSON.parse(this.storage.readStorage("trailer-planning.spot-vehicles"));
                spotVehicles = spotVehicles.filter(vehicle => {return vehicle.id != data.spotVehicleRoute.id});
                this.storage.writeStorage("trailer-planning.spot-vehicles",spotVehicles);
            }

            Notify.showSuccess("Planning saved");
        }).catch((error) => {
            Notify.showError(error);
        });
    }


    renderStopIcon(stop){
        let iconClass = ["timeline_icon"];
        if(_.find(stop.ops, {type: Planner.OP_TYPE_LOAD})){
            iconClass.push("timeline_icon_danger");
        }
        if(_.find(stop.ops, {type: Planner.OP_TYPE_UNLOAD})){
            iconClass.push("timeline_icon_primary");
        }
        let style = {cursor: "move"};
        if (stop.type == Planner.LOCATION_TYPE_CUSTOMER) {
            return <div className={iconClass.join(" ")} style = {style}><i className="material-icons">place</i></div>;
        } else if (stop.type == Planner.LOCATION_TYPE_WAREHOUSE) {
            return <div className="timeline_icon timeline_icon_success" style = {style}><i className="material-icons">home</i></div>;
        } else if (stop.type == Planner.LOCATION_TYPE_TRAILER) {
            return <div className="timeline_icon timeline_icon_warning" style = {style}><i className="material-icons">local_shipping</i></div>;
        }
    }
    renderTrailerStop(stop){
            let routeDistance = this.renderRouteDistance(stop);
            let routeDuration = this.renderRouteDuration(stop);
            let routeContent = this.renderRouteContent(stop);

            return (
                <div className="timeline_item">
                    {this.renderStopIcon(stop)}
                    <div className="timeline_content">
                        {stop.name}
                    </div>
                    <div className="timeline_subcontent">
                        <div>
                            <i className="material-icons">place</i>
                            {stop.description}
                        </div>
                    </div>
                    <Grid>
                        <GridCell width="1-1" noMargin={true}>
                            {routeDistance}
                            {routeDuration}
                        </GridCell>
                        <GridCell width="1-1" noMargin={true}>
                            {routeContent}
                        </GridCell>
                    </Grid>
                </div>

            );
    }

    renderRouteDuration(stop){
        let routeDuration = null;
        if(stop.routeInfo && stop.routeInfo.duration){
            if(stop.routeInfo.duration.hours > 0){
                routeDuration = <div className="timeline_route">
                    {stop.routeInfo.duration.hours}<span style = {{marginRight: "8px"}}>h.</span>
                    {stop.routeInfo.duration.minutes}<span>min.</span>
                </div>;
            }else{
                routeDuration = <div className="timeline_route">
                    {stop.routeInfo.duration.minutes}<span>min.</span>
                </div>;
            }
        }
        return routeDuration;
    }
    renderRouteDistance(stop){
        let routeDistance = null;
        if(stop.routeInfo && stop.routeInfo.distance){
            routeDistance = <div className="timeline_route" style = {{clear: "both"}}>
                {stop.routeInfo.distance} <span>km</span>
            </div>;
        }
        return routeDistance;
    }

    renderCustomerOrWarehouseStop(stop){
        let grossWeight = null;
        if(stop.trailerLoad.grossWeight){
            grossWeight = <div className="timeline_load">
                {stop.trailerLoad.grossWeight} kg
            </div>;
        }
        let ldm = null;
        if(stop.trailerLoad.ldm){
            ldm = <div className="timeline_load">
                {stop.trailerLoad.ldm} ldm
            </div>;
        }
        let volume = null;
        if(stop.trailerLoad.volume){
            volume = <div className="timeline_load">
                {stop.trailerLoad.volume} m³
            </div>;
        }
        let payWeight = null;
        if(stop.trailerLoad.volume){
            payWeight = <div className="timeline_load">
                {stop.trailerLoad.payWeight} pw
            </div>;
        }
        let pta = null;
        if(stop.plannedTimeArrival){
            pta = <DateTimeMini label="PTA" data={stop.plannedTimeArrival.formatted} onchange = {(value) => this.handleStopPTAUpdate(stop, value)}/>;
        }
        let ptd = null;
        if(stop.plannedTimeDeparture){
            ptd = <DateTimeMini label="PTD" data={stop.plannedTimeDeparture.formatted} onchange = {(value) => this.handleStopPTDUpdate(stop, value)}/>;
        }

        let routeDistance = this.renderRouteDistance(stop);
        let routeDuration = this.renderRouteDuration(stop);

        let routeContent = this.renderRouteContent(stop);


        return (
            <div className="timeline_item">
                {this.renderStopIcon(stop)}
                <div className="timeline_content">{stop.name}</div>
                {
                    stop.ops.map(item => {
                        let isLoad = item.type == Planner.OP_TYPE_LOAD;
                        return <div key = {item.type} className="timeline_subcontent">
                            {item.loads.map(load => {
                                let info = "Shipment #" + load.shipmentCode + (isLoad ? (", " + load.dueDate.formatted) : "");
                                return <div key = {load.shipment.id}>
                                    <i className="material-icons">{item.type == Planner.OP_TYPE_UNLOAD ? "file_download" : "file_upload"}</i>
                                    {info}
                                </div>
                            })}
                        </div>
                    })
                }
                <Grid>
                    <GridCell width="1-2" noMargin = {true}>
                        {pta}
                    </GridCell>
                    <GridCell width="1-2" noMargin = {true}>
                        {ptd}
                    </GridCell>
                    <GridCell width="1-1" noMargin = {true}>
                        {grossWeight}
                        {volume}
                        {ldm}
                        {payWeight}
                    </GridCell>
                    <GridCell width="1-1" noMargin = {true}>
                        {routeDistance}
                        {routeDuration}
                    </GridCell>
                    <GridCell width="1-1" noMargin = {true}>
                        {routeContent}
                    </GridCell>
                </Grid>
            </div>

        );
    }

    renderRouteLegTitle(routeLeg) {
        return "From: " + routeLeg.from.map(from => from.name).join(", ") + "\nTo:      " + routeLeg.to.map(to => to.name).join(", ");
    }

    getRouteLegIconAccordingToType(routeLeg) {

        let legTypeCode = "";
        if(routeLeg && routeLeg.legType) {
            legTypeCode = routeLeg.legType.id;
        }

        let title = this.renderRouteLegTitle(routeLeg);

        if (legTypeCode == TripService.ROUTE_LEG_TYPE_ROAD) {
            return (<i className="uk-icon uk-icon-road uk-icon-medium" title={title}/>);
        } else if (legTypeCode == TripService.ROUTE_LEG_TYPE_SEAWAY) {
            return (<i className="material-icons md-36" title={title}>directions_boat</i>);
        } else if (legTypeCode == TripService.ROUTE_LEG_TYPE_RAILWAY) {
            return (<i className="material-icons md-36" title={title}>directions_train</i>);
        } else {
            return (<span key="uk-text-danger">Unknown Leg Type for {title}</span>);
        }
    }



    renderRouteContent(stop) {

        if (!stop.route || !stop.route.routeLegs) {
            return null;
        }

        let content = [];

        stop.route.routeLegs.forEach(routeLeg => {
            content.push(
                <div key={"leg-" + stop.id + "-" + content.length} className="uk-align-left">
                    {this.getRouteLegIconAccordingToType(routeLeg)}
                </div>
            )
        })

        content.push(
            <div key={"leg-" + stop.id + "-" + content.length}>
                <Button label="Route" flat={true} style="primary"
                        onclick={() => {
                            this.routeSelectionModal.openFor(stop, this.state.stops, this.state.options ? this.state.options.routeLegStops : [])
                        }}></Button>
            </div>
        )

        return <div className="timeline_route">{content}</div>;
    }


    onRouteRender(stop){
        if(stop.type == Planner.LOCATION_TYPE_CUSTOMER || stop.type == Planner.LOCATION_TYPE_WAREHOUSE){
            return this.renderCustomerOrWarehouseStop(stop);
        }else if(stop.type == Planner.LOCATION_TYPE_TRAILER){
            return this.renderTrailerStop(stop);
        }
    }

    renderVehicleSelectionContent() {
        if(!this.storage) {
            return null;
        }
        let selectedTrailer = JSON.parse(this.storage.readStorage("trailer-planning.selected-trailer"));
        let selectedSpotVehicleRoute = JSON.parse(this.storage.readStorage("trailer-planning.selected-spot-vehicle"));

        if(!selectedTrailer && !selectedSpotVehicleRoute){
            return (
                <div className="timeline_item">
                    {this.renderStopIcon(stop)}
                    <div className="timeline_content uk-align-left">
                        <Button label="Select Trailer" size="small" style="warning" onclick = {() => this.handleTrailerListSelect()} />
                    </div>
                    <div className="timeline_content uk-align-lefte1w">
                        <Button label="Select Spot Vehicle" size="small" style="success" onclick = {() => this.handleSpotVehicleListSelect()} />
                    </div>
                </div>
            );
        }
        else if(selectedSpotVehicleRoute) {
            return (
                <div className="uk-margin-left">
                    <Grid>
                        <GridCell>
                            <span className="uk-text-primary">Vehicle Group: </span>
                        </GridCell>
                        <GridCell noMargin="true">
                            <span>Spot Vehicle Code: {selectedSpotVehicleRoute.code}</span>
                            <span style={{marginLeft: "12px"}}>
                                <Button label="change" flat={true} size="small" style="primary"
                                        onclick={() => {
                                            this.handleSpotVehicleListSelect()
                                        }}/>
                                <Button label="remove" flat={true} size="small" style="danger"
                                        onclick={() => {
                                            this.handleSpotVehicleRouteRemove()
                                        }}/>
                            </span>
                        </GridCell>
                        <GridCell noMargin="true">Carrier: {selectedSpotVehicleRoute.carrierPlateNumber ? selectedSpotVehicleRoute.carrierPlateNumber : "-"}</GridCell>
                        <GridCell noMargin="true">MV: {selectedSpotVehicleRoute.motorVehiclePlateNumber ? selectedSpotVehicleRoute.motorVehiclePlateNumber : "-"}</GridCell>
                        <GridCell noMargin="true">Company: {selectedSpotVehicleRoute.invoiceCompany ? selectedSpotVehicleRoute.invoiceCompany.name : "-"}</GridCell>
                    </Grid>
                </div>
            );
        } else if(selectedTrailer) {
            return (
                <div className="uk-margin-left">
                <Grid>
                    <GridCell>
                        <span className="uk-text-primary">Vehicle Group: </span>
                    </GridCell>
                    <GridCell noMargin="true">
                        Trailer: {selectedTrailer.vehicle ? selectedTrailer.vehicle.plateNumber : "-"}
                    <span style={{marginLeft: "12px"}}>
                            <Button label="change" flat={true} size="small" style="primary"
                                    onclick={() => {
                                        this.handleTrailerListSelect()
                                    }}/>
                            <Button label="remove" flat={true} size="small" style="danger"
                                    onclick={() => {
                                        this.handleTrailerRemove()
                                    }}/>
                        </span>
                    </GridCell>
                </Grid>
                </div>
            );
        }
        else {
            return null;
        }
    }

    renderTabContent() {
        if (this.state.display == this.TAB_STOPS) {

            let vehicleFeatureConflictionContent = this.state.vehicleFeatureConfliction ?
                <div><span className="md-color-red-500">{this.state.vehicleFeatureConflictionMessage}</span></div> : null;

            let vehicleAppropriatenessContent = this.state.vehicleAppropriateProblem ?
                <div><span className="md-color-red-500">{this.state.vehicleAppropriateProblemMessage}</span> </div> : null;

            let vehicleSelectionContent = this.renderVehicleSelectionContent();

            return (
                <div>
                    {vehicleFeatureConflictionContent}
                    {vehicleAppropriatenessContent}
                    {vehicleSelectionContent}
                    <div className="timeline" style={{marginLeft: "-10px", marginTop: "8px"}}>
                        <Sortable key={this.state.sortableKey} keyField="_key"
                                  onchange={(items) => this.handleRouteChanged(items)}
                                  renderItem={(item) => this.onRouteRender(item)}
                                  items={this.state.stops}
                                  handleClass="timeline_icon"
                                  dragCustomClass="timeline_drag"/>

                    </div>
                    <div>
                        <RouteSelectionModal ref={(c) => this.routeSelectionModal = c}
                                             onSave={(stopKey, route) => {return this.handleRouteUpdate(stopKey, route)}}/>
                    </div>
                </div>
            );
        } else {
            return (
                <PlanningShipmentsTab segments={this.state.selectedSegments}
                                      handleRequiredVehicleEnableDisable={(segmentKey, featId) => {
                                          this.handleRequiredVehicleEnableDisable(segmentKey, featId)
                                      }}
                                      handleNotAllowedVehicleEnableDisable={(segmentKey, featId) => {
                                          this.handleNotAllowedVehicleEnableDisable(segmentKey, featId)
                                      }}
                                      onRemoveSegment={(segment) => this.handleRemoveSegment(segment)}/>
            );
        }
    }

    renderStopsTab(){
        let stopsTabClasses = ["uk-width-1-2"];
        if(this.state.display == this.TAB_STOPS) {
            stopsTabClasses.push("uk-active");
        }
        return (
            <li className={stopsTabClasses.join(" ")}>
                <a onClick={(e) => this.handleStopsTabClick(e)}>Stops</a>
            </li>
        );
    }
    renderShipmentsTab(){
        let shipmentsTabClasses = ["uk-width-1-2"];
        if(this.state.display == this.TAB_SHIPMENTS){
            shipmentsTabClasses.push("uk-active");
        }
        return(
            <li className={shipmentsTabClasses.join(" ")}>
                <a onClick={(e) => this.handleShipmentsTabClick(e)}>Shipments</a>
            </li>
        );
    }
    renderTabs(){
        return(
            <ul className="uk-tab">
                {this.renderStopsTab()}
                {this.renderShipmentsTab()}
            </ul>
        );
    }

    renderSavePlanButton(){
        return(
            <div id="save_plan" style = {{position: "relative", bottom:"0px", left:"0px", right:"0px", borderTop: "1px solid rgb(224, 224, 224)"}}>
                <div style = {{padding: "12px"}}>
                    <Button disabled={this.state.vehicleFeatureConfliction || this.state.vehicleAppropriateProblem}
                            label="Save Plan" size="block" style="primary" onclick = {() => this.handleSavePlan()} />
                </div>
            </div>
        );
    }

    renderStops(){
        let style = { paddingRight: "8px"};
        if(this.state.contentHeight && this.state.saveButtonHeight){
            style.height = this.state.contentHeight - this.state.saveButtonHeight;
        }
        return(
            <div>
                <div className="uk-overflow-container" style = {style}>
                    <Grid>
                        <GridCell width="1-1">
                            <PlanSummary trailerLoad = {this.state.totalTrailerLoad}/>
                        </GridCell>
                    </Grid>
                    {this.renderTabs()}
                    {this.renderTabContent()}
                </div>
                {this.renderSavePlanButton()}
            </div>
        );
    }

    renderTrailers(){
        let style = {paddingRight: "8px"};
        if(this.state.contentHeight){
            style.height = this.state.contentHeight;
        }
        return(
            <div>
                <div className="uk-overflow-container" style = {style}>
                    <TrailerList
                        filter = {this.state.trailerFilter}
                        trailers = {this.state.filteredTrailers}
                        onPlanningListSelect = {() => this.handlePlanningListSelect()}
                        onChange = {(filter) => this.handleUpdateTrailerFilter(filter)}
                        onDistanceCalculate = {(trailer) => this.handleDistanceCalculateForTrailer(trailer)}/>
                </div>
            </div>
        );
    }

    renderSpotVehicles() {
        let style = {paddingRight: "8px"};
        if(this.state.contentHeight){
            style.height = this.state.contentHeight;
        }

        return(
            <div>
                <div className="uk-overflow-container" style = {style}>
                    <SpotVehicleList
                        spotVehicleRoutes = {this.state.spotVehicles}
                        onPlanningListSelect = {() => this.handlePlanningListSelect()}
                        onChange = {(filter) => this.handleUpdateTrailerFilter(filter)}
                        onDistanceCalculate = {(spotVehicle) => this.handleDistanceCalculateForSpotVehicle(spotVehicle)}/>
                </div>
            </div>
        );
    }

    render(){
        if(this.state.showTrailers){
            return this.renderTrailers();
        } else if(this.state.showSpotVehicles) {
            return this.renderSpotVehicles();
        } else {
            return this.renderStops();
        }
    }

}

PlanningList.contextTypes = {
    storage: React.PropTypes.object
};