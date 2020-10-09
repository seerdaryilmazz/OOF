import _ from "lodash";
import React from "react";
import { TranslatingComponent } from "susam-components/abstract";
import { Button, Notify, Span } from "susam-components/basic";
import { Grid, GridCell } from "susam-components/layout";
import uuid from 'uuid';
import { LocationService } from '../services';
import { GoogleMaps } from "./map/GoogleMaps";
import { Planner } from './plan/Planner';
import { Storage } from './storage/Storage';
import { StorageDataUpdater } from './updater/StorageDataUpdater';
import { VehicleFeature } from './VehicleFeature';




export class PlanningMap extends TranslatingComponent{

    constructor(props) {
        super(props);
        this.id = "Planning";
        this.momentTimezone = require('moment-timezone');
        this.moment = require('moment');
        this.momentFormat = "DD/MM/YYYY HH:mm";

        this.baseImageUrl = window.baseResourceUrl + '/assets/img/map/';
        this.shipmentPinPath = 'M66.9,41.8c0-11.3-9.1-20.4-20.4-20.4c-11.3,0-20.4,9.1-20.4,20.4c0,11.3,20.4,32.4,20.4,32.4S66.9,53.1,66.9,41.8z    M37,41.4c0-5.2,4.3-9.5,9.5-9.5c5.2,0,9.5,4.2,9.5,9.5c0,5.2-4.2,9.5-9.5,9.5C41.3,50.9,37,46.6,37,41.4z';
        this.trailerPinPath = "M44.7,50.6v24.9h3.4V50.6c8.2-0.8,14.5-7.8,14.5-16.1c0-8.9-7.3-16.2-16.2-16.2s-16.2,7.3-16.2,16.2   C30.2,42.8,36.6,49.7,44.7,50.6z";
        this.loadPin = {
            path: this.shipmentPinPath,
            fillColor: "#ef5350",
            anchor: {x: 47, y: 75}
        };
        this.unloadPin = {
            path: this.shipmentPinPath,
            fillColor: "#64b5f6",
            anchor: {x: 47, y: 75}
        };
        this.warehousePin = {
            path: "M34.4,47.8h15.1v6.5c0,0.9,0.8,1.7,1.7,1.7h16.6c0.6,0,1.1-0.3,1.5-0.8s0.3-1.1,0-1.7l-6.6-12.2l6.6-12.2   c0.3-0.5,0.3-1.2,0-1.7s-0.9-0.8-1.5-0.8H52.9v-6.5c0-0.9-0.8-1.7-1.7-1.7H32.8c-0.9,0-1.7,0.8-1.7,1.7v26v27.1h3.4V47.8z",
            fillColor: "#66bb6a",
            anchor: {x: 33, y: 73}
        };
        this.selectedLoadPin = {
            path: this.shipmentPinPath,
            fillColor: "#d32f2f",
            anchor: {x: 47, y: 75},
            strokeWeight: 2,
            fillOpacity: 0.9,
            scale: 0.75
        };
        this.selectedUnloadPin = {
            path: this.shipmentPinPath,
            fillColor: "#1976d2",
            anchor: {x: 47, y: 75},
            strokeWeight: 2,
            fillOpacity: 0.9,
            scale: 0.75
        };
        this.availableNowTrailerPin = {
            path: this.trailerPinPath,
            fillColor: "#ffa726",
            anchor: {x: 46, y: 76}
        };
        this.availableLaterTrailerPin = {
            path: this.trailerPinPath,
            fillColor: "#cccccc",
            fillOpacity: 0.5,
            anchor: {x: 46, y: 76}
        };
        this.selectedTrailerPin = {
            path: this.trailerPinPath,
            fillColor: "#f57c00",
            anchor: {x: 46, y: 76},
            strokeWeight: 2,
            fillOpacity: 0.9,
            scale: 0.75
        };

        this.PIN_TYPE_COLLECTION = "COLLECTION";
        this.PIN_TYPE_DISTRIBUTION = "DISTRIBUTION";
        this.PIN_TYPE_WAREHOUSE = "WAREHOUSE";
        this.PIN_TYPE_TRAILER = "TRAILER";

        this.layers = [
            {id: this.PIN_TYPE_WAREHOUSE, name: "Warehouses"},
            {id: this.PIN_TYPE_COLLECTION, name: "Collection"},
            {id: this.PIN_TYPE_DISTRIBUTION, name: "Distribution"},
            {id: this.PIN_TYPE_TRAILER, name: "Trailers"}
        ];

        this.state = {selectedLayers: this.layers};

    }

    componentDidMount(){
        this.storage = new Storage(this.context);
        GoogleMaps.addScripts("initMapPlanning", () => setTimeout(() => {
            this.map = GoogleMaps.createMap("mapPlanning", null, this.baseImageUrl, false, () => {});
            if(this.props.settings){
                GoogleMaps.renderControlButtons(this.map, this.props.settings, (item) => this.handleControlClick(item));
                GoogleMaps.renderLayersDropDown(this.map, this.layers, this.state.selectedLayers, (value) => this.handleLayerSelection(value));
                GoogleMaps.renderInitialSegmentDetails(this.map);
            }
            this.storage.writeStorage("trailer-planning.map-status", "READY");
            this.startSegmentPolling();
            this.startTrailerPolling();
            this.loadWarehouses();
        }, 500));

    }
    startSegmentPolling(){
        this.segmentUpdater =
            new StorageDataUpdater(this.context.storage,
                "trailer-planning.all-segments", (prevData, nextData) => {
                    this.allSegments = nextData;
                    let markers = this.convertSegmentsToMarkers(nextData);
                    GoogleMaps.updateMarkersOfType(this.map, markers, this.PIN_TYPE_COLLECTION, this.PIN_TYPE_DISTRIBUTION);
                    GoogleMaps.fitToSeeAllMarkers(this.map);
                });
        this.segmentUpdater.startPolling(30000);

        this.selectedSegmentUpdater =
            new StorageDataUpdater(this.context.storage,
                "trailer-planning.selected-segments", (prevData, nextData) => {
                    if(prevData) {
                        let markers = this.convertSelectedSegmentsToMarkers(prevData, false);
                        GoogleMaps.updateMarker(this.map, markers);
                    }
                    if(nextData) {
                        this.selectedSegments = nextData;
                        let markers = this.convertSelectedSegmentsToMarkers(nextData, true);
                        GoogleMaps.updateMarker(this.map, markers);
                    }
                });
        this.selectedSegmentUpdater.startPolling(300);

        this.bounceUpdater =
            new StorageDataUpdater(this.context.storage,
                "trailer-planning.bounce-segment", (prevData, nextData) => {
                    if(nextData && nextData.loadId){
                        GoogleMaps.animateMarker(this.map, nextData.loadId);
                    }
                    if(nextData && nextData.unloadId){
                        GoogleMaps.animateMarker(this.map, nextData.unloadId);
                    }
                });
        this.bounceUpdater.startPolling(300);

        this.routeUpdater =
            new StorageDataUpdater(this.context.storage,
                "trailer-planning.route", (prevData, nextData) => {
                    GoogleMaps.updateRoute(this.map, nextData);
                });
        this.routeUpdater.startPolling(300);

        this.closeSegmentDetailsUpdater =
            new StorageDataUpdater(this.context.storage,
                "trailer-planning.close-segment-details", (prevData, nextData) => {

                    if(nextData) {
                        let markers = this.convertSelectedSegmentsToMarkers(nextData, true);
                        this.handleCloseSegmentDetails(this.map, markers);
                    }
                });
        this.closeSegmentDetailsUpdater.startPolling(300);

    }
    startTrailerPolling(){
        this.trailerUpdater =
            new StorageDataUpdater(this.context.storage,
                "trailer-planning.filtered-trailers", (prevData, nextData) => {
                    let markers = this.convertTrailerDataToMapsData(nextData);
                    GoogleMaps.updateMarkersOfType(this.map, markers, this.PIN_TYPE_TRAILER);
                });
        this.trailerUpdater.startPolling(1000);

        this.selectedTrailerUpdater =
            new StorageDataUpdater(this.context.storage,
                "trailer-planning.selected-trailer", (prevData, nextData) => {
                    if(prevData) {
                        let data = this.convertSingleTrailerDataToMapsData(prevData, false);
                        GoogleMaps.updateMarker(this.map, [data]);
                    }
                    if(nextData){
                        let data = this.convertSingleTrailerDataToMapsData(nextData, true);
                        GoogleMaps.updateMarker(this.map, [data]);
                    }
                });
        this.selectedTrailerUpdater.startPolling(300);

        this.trailerFilterUpdater =
            new StorageDataUpdater(this.context.storage,
                "trailer-planning.trailer-filter", (prevData, nextData) => {
                    GoogleMaps.renderTrailerFilter(this.map, nextData, () => {
                        let filter = JSON.parse(this.storage.readStorage("trailer-planning.trailer-filter"));
                        filter.distance = -1;
                        this.storage.writeStorage("trailer-planning.trailer-filter", filter);
                    });
                });
        this.trailerFilterUpdater.startPolling(1000);
    }

    componentWillReceiveProps(nextProps){
        if(this.map){
            if(nextProps.settings){
                GoogleMaps.renderControlButtons(this.map, nextProps.settings, (item) => this.handleControlClick(item));
            }
        }
    }
    componentDidUpdate(prevProps, prevState){
        if(!_.isEqual(prevState.selectedLayers, this.state.selectedLayers)){
            GoogleMaps.renderLayersDropDown(this.map, this.layers, this.state.selectedLayers, (value) => this.handleLayerSelection(value));
        }
    }

    showLayer(layer){
        GoogleMaps.showMarkersOfType(this.map, [layer.id]);
    }
    hideLayer(layer){
        GoogleMaps.hideMarkersOfType(this.map, [layer.id]);
    }

    handleLayerSelection(value) {
        let selectedLayers = _.cloneDeep(this.state.selectedLayers);
        let index = _.findIndex(selectedLayers, {id: value.id});
        if (index >= 0) {
            selectedLayers.splice(index, 1);
            this.hideLayer(value);
        } else {
            selectedLayers.push(value);
            this.showLayer(value);
        }
        this.setState({selectedLayers: selectedLayers});
    }
    isLayerSelected(id){
        return _.findIndex(this.state.selectedLayers, {id: id}) >= 0;
    }

    handleControlClick(item){
        switch(item){
            case "EXPAND":
                this.handleExpandMapClick();
                return;
            case "COMPRESS":
                this.handleCompressMapClick();
                return;
            case "NARROW":
                this.handleNarrowMapClick();
                return;
            case "ENLARGE":
                this.handleEnlargeMapClick();
                return;
        }
    }

    handleCloseSegmentDetails(map, markers){
        markers.forEach(marker => {
            marker._detailsVisible = false;
            GoogleMaps.renderSegmentDetails(map, marker, [],
                (value, segment) => this.handleSelectSegmentFromDetails(value, segment),
                () => this.handleToggleSegmentsDetails(marker, []));
            GoogleMaps.updateInfoWindow(map, marker);
        });
    }

    componentWillUnmount(){
        setTimeout(() => {
            this.segmentUpdater.clearInterval();
            this.selectedSegmentUpdater.clearInterval();
            this.trailerUpdater.clearInterval();
            this.selectedTrailerUpdater.clearInterval();
            this.bounceUpdater.clearInterval();
            this.routeUpdater.clearInterval();
            this.closeSegmentDetailsUpdater.clearInterval();
            this.trailerFilterUpdater.clearInterval();
        }, 500);

    }

    loadWarehouses(){
        LocationService.getWarehouses().then(response => {
            let markers = this.convertWarehouseDataToMapsData(response.data);
            GoogleMaps.updateMarkersOfType(this.map, markers, this.PIN_TYPE_WAREHOUSE);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    convertWarehouseDataToMapsData(warehouses){
        if(!warehouses) return [];
        let layerSelected = this.isLayerSelected(this.PIN_TYPE_WAREHOUSE);
        return warehouses.map(warehouse => {
            let icon = this.warehousePin;
            let position = {lat: warehouse.location.pointOnMap.lat, lng: warehouse.location.pointOnMap.lng};
            return {position: position, icon: icon, types: [this.PIN_TYPE_WAREHOUSE],
                hidden: !layerSelected, warehouse: warehouse,
                onShowInfo: (item) => this.showWarehouseInfo(item)}
        });
    }
    convertSingleTrailerDataToMapsData(item, isSelected){
        let layerSelected = this.isLayerSelected(this.PIN_TYPE_TRAILER);
        let icon =  isSelected ? this.selectedTrailerPin : (item.availableNow ? this.availableNowTrailerPin : this.availableLaterTrailerPin);
        let position = {lat: item.assignment.location.pointOnMap.latitude, lng: item.assignment.location.pointOnMap.longitude};
        return {id: item._key, position: position, icon: icon, types: [this.PIN_TYPE_TRAILER],
            trailer: item, selected: isSelected, hidden: !layerSelected,
            onShowInfo: (trailer) => this.showTrailerInfo(trailer)};
    }
    convertTrailerDataToMapsData(trailers){
        if(!trailers) return [];
        let hasLocation = _.filter(trailers, item => item.assignment && item.assignment.location && item.assignment.location.pointOnMap);
        let markers = [];
        hasLocation.forEach(item => {
            markers.push(this.convertSingleTrailerDataToMapsData(item));
        });
        return markers;
    }

    addCollectionMarker(segments, id, position, isSelected){
        let collectionsSelected = this.isLayerSelected(this.PIN_TYPE_COLLECTION);
        let pin = isSelected ? this.selectedLoadPin : this.loadPin;
        return{id: Planner.OP_TYPE_LOAD + ":" + id, position: position, icon: pin, types: [this.PIN_TYPE_COLLECTION],
                segments: segments, operation:  Planner.OP_TYPE_LOAD, selected: isSelected, hidden: !collectionsSelected,
                onShowInfo: (marker) => this.showLoadInfo(marker)};

    }

    addDistributionMarker(segments, id, position, isSelected){
        let distributionsSelected = this.isLayerSelected(this.PIN_TYPE_DISTRIBUTION);
        let pin = isSelected ? this.selectedUnloadPin : this.unloadPin;
        return{id: Planner.OP_TYPE_UNLOAD + ":" + id, position: position, icon: pin, types: [this.PIN_TYPE_DISTRIBUTION],
            segments: segments, operation:  Planner.OP_TYPE_UNLOAD, selected: isSelected, hidden: !distributionsSelected,
            onShowInfo: (marker) => this.showLoadInfo(marker)};

    }

    convertCollectionSegmentsToMarkers(segments, isSelected){
        let markers = [];
        let collection = _.filter(segments, (item) => {
            return item.fromLocation.type == Planner.LOCATION_TYPE_CUSTOMER;
        });
        let collectionGrouped = _.groupBy(collection, item => {
            return item.fromLocation && item.fromLocation.id
        });

        Object.keys(collectionGrouped).forEach(key => {
            let segments = collectionGrouped[key];
            let position = {lat: segments[0].fromLocation.location.lat, lng: segments[0].fromLocation.location.lon};
            markers.push(this.addCollectionMarker(segments, key, position, isSelected));
        });
        return markers;
    }

    convertDistributionSegmentsToMarkers(segments, isSelected){
        let markers = [];
        let distribution = _.filter(segments, (item) => {
            return item.toLocation.type == Planner.LOCATION_TYPE_CUSTOMER;
        });
        let distributionGrouped = _.groupBy(distribution, item => {
            return item.toLocation && item.toLocation.id
        });
        Object.keys(distributionGrouped).forEach(key => {
            let segments = distributionGrouped[key];
            let position = {lat: segments[0].toLocation.location.lat, lng: segments[0].toLocation.location.lon};
            markers.push(this.addDistributionMarker(segments, key, position, isSelected));
        });
        return markers;
    }

    convertSelectedSegmentsToMarkers(selectedSegments, isSelected){
        let markers = [];
        let collectionSegments = [];
        let collectionGrouped = _.groupBy(selectedSegments, item => {
            return item.fromLocation && item.fromLocation.id
        });
        Object.keys(collectionGrouped).forEach(locationId => {
            collectionSegments = collectionSegments.concat(_.filter(this.allSegments, item => {
                return item.fromLocation.id == locationId;
            }));
        });

        markers = markers.concat(this.convertCollectionSegmentsToMarkers(collectionSegments, isSelected));

        let distributionSegments = [];
        let distributionGrouped = _.groupBy(selectedSegments, item => {
            return item.toLocation && item.toLocation.id
        });
        Object.keys(distributionGrouped).forEach(locationId => {
            distributionSegments = distributionSegments.concat(_.filter(this.allSegments, item => {
                return item.toLocation.id == locationId;
            }));
        });
        markers = markers.concat(this.convertDistributionSegmentsToMarkers(distributionSegments, isSelected));
        return markers;
    }

    convertSegmentsToMarkers(segments){
        let markers = [];
        markers = markers.concat(this.convertCollectionSegmentsToMarkers(segments, false));
        markers = markers.concat(this.convertDistributionSegmentsToMarkers(segments, false));
        return markers;
    }

    handleExpandMapClick(){
        this.props.onExpand && this.props.onExpand();
    }
    handleCompressMapClick(){
        this.props.onCompress && this.props.onCompress();
    }
    handleNarrowMapClick(){
        this.props.onNarrow && this.props.onNarrow();
    }
    handleEnlargeMapClick(){
        this.props.onEnlarge && this.props.onEnlarge();
    }

    handleSelectAllSegments(marker, segments){
        this.handleSelectSegment(segments);
        this.handleToggleSegmentsDetails(marker, marker.segments);
    }
    handleRemoveAllSegments(marker, segments){
        this.handleSelectSegment(segments);
        this.handleToggleSegmentsDetails(marker, []);
    }

    handleSelectSegment(segments){
        let selectedSegments = JSON.parse(this.storage.readStorage("trailer-planning.selected-segments"));
        if(!selectedSegments){
            selectedSegments = [];
        }
        segments.forEach(segment => {
            let segmentIndex = _.findIndex(selectedSegments, {_key: segment._key});
            if(segmentIndex < 0){
                selectedSegments.push(segment);
            }else{
                selectedSegments.splice(segmentIndex, 1);
            }
        });
        this.storage.writeStorage("trailer-planning.selected-segments", selectedSegments);
    }
    handleTrailerSelect(trailer){
        this.storage.writeStorage("trailer-planning.selected-trailer", trailer);
    }
    handleTrailerRemove(){
        this.storage.writeStorage("trailer-planning.selected-trailer", null);
    }
    handleToggleSegmentsDetails(marker, selectedSegments){

        marker._detailsVisible = !marker._detailsVisible;
        GoogleMaps.renderSegmentDetails(this.map, marker, selectedSegments,
            (value, segment) => this.handleSelectSegmentFromDetails(value, segment),
            () => this.handleToggleSegmentsDetails(marker, selectedSegments));
        GoogleMaps.updateInfoWindow(this.map, marker);
    }
    handleSelectSegmentFromDetails(value, segment){
        this.handleSelectSegment([segment]);
    }
    showLoadInfo(marker){
        if(marker.segments.length == 1){
            return this.showLoadInfoForSingleSegment(marker, marker.segments[0]);
        }else{
            return this.showLoadInfoForMultipleSegments(marker);
        }
    }
    showLoadInfoForMultipleSegments(marker){
        let matchingSelectedSegments =
            _.intersectionWith(marker.segments, this.selectedSegments, (source, dest) => source.id == dest.id);
        let detailsLabel = marker._detailsVisible ? "hide details" : "show details";
        let detailsButton = <Button label={detailsLabel} style="primary" size="small" flat = {true} disableCooldown = {true}
                                    onclick = {() => this.handleToggleSegmentsDetails(marker, matchingSelectedSegments)} />;

        let removeButton = null;
        if(matchingSelectedSegments.length > 0){
            removeButton = <Button label="remove all" style="primary" size="small" flat = {true}
                                   onclick = {() => this.handleRemoveAllSegments(marker, matchingSelectedSegments)} />;
        }
        let selectButton = null;
        if(matchingSelectedSegments.length != marker.segments.length){
            let unselectedSegments = _.differenceWith(marker.segments, matchingSelectedSegments, (source, dest) => source.id == dest.id);
            selectButton = <Button label="select all" style="primary" size="small" flat = {true}
                                   onclick = {() => this.handleSelectAllSegments(marker, unselectedSegments)} />;
        }
        let grossWeight = 0;
        marker.segments.forEach(item => grossWeight += item.shipment.grossWeight);
        let volume = 0;
        marker.segments.forEach(item => volume += item.shipment.volume);
        let ldm = 0;
        marker.segments.forEach(item => ldm += item.shipment.ldm);

        let segmentInfo = marker.segments.length + " Shipments";

        if(matchingSelectedSegments.length > 0){
            segmentInfo = segmentInfo + "(" + matchingSelectedSegments.length + " selected)";
        }

        let vehicleFeatureFilterExist = marker.segments.filter(segment =>
            VehicleFeature.createVehicleRequirementElementsOfSegment(segment).length > 0
            ).length > 0;

        let vehicleFilterContent = null;
        if(vehicleFeatureFilterExist) {
            vehicleFilterContent =  <GridCell width="1-1" textCenter = {true}>
                <span className="uk-text uk-text-bold md-color-red-900">Vehicle Requirement</span>
            </GridCell>
            }

        return (
            <div style = {{width: "300px"}}>
                <Grid>
                    <GridCell width="1-1" noMargin = {true}>
                        <div className="uk-text-x-large">{segmentInfo}</div>
                    </GridCell>
                    <GridCell width="1-1" textCenter = {true}>
                        {detailsButton}
                    </GridCell>

                    <GridCell width="1-3">
                        <Span label="Gr. Weight" value={grossWeight + " kg"} />
                    </GridCell>
                    <GridCell width="1-3">
                        <Span label="Volume" value={volume + " m³"} />
                    </GridCell>
                    <GridCell width="1-3">
                        <Span label="LDM" value={ldm + " ldm"} />
                    </GridCell>
                    {vehicleFilterContent}
                    <GridCell width="1-1" textCenter = {true}>
                        {selectButton}
                        {removeButton}
                    </GridCell>
                </Grid>
            </div>
        );
    }

    showLoadInfoForSingleSegment(marker, segment){
        let readyAtDate = segment.shipment.readyAtDate.localDateTime;
        let readyAtTimezone = segment.shipment.readyAtDate.timezone;
        let grossWeight = segment.shipment.grossWeight || "";
        let volume = segment.shipment.volume || "";
        let ldm = segment.shipment.ldm || "";
        let dimensions = [];
        if(segment.shipment.units){
            segment.shipment.units.forEach(unit => {
                let type = unit.type;
                unit.packages.forEach(item => {
                    dimensions.push(
                        <div key = {uuid.v4()}>
                            <span className="uk-text-bold">{item.count}</span>
                            <span style = {{marginLeft:"3px"}}> {type}</span>
                            <span className="uk-text-bold" style = {{marginLeft:"3px"}}>{item.width + "*" + item.length + "*" + item.height}</span>
                            <span style = {{marginLeft:"3px"}}>stack:</span>
                            <span className="uk-text-bold" style = {{marginLeft:"3px"}}>{item.stackSize}</span>
                        </div>
                    );
                })
            });
        }
        let actionButton = <Button label="select" style="primary" size="small" flat = {true} onclick = {() => this.handleSelectSegment([segment])} />;
        if(marker.selected){
            actionButton = <Button label="remove" style="primary" size="small" flat = {true} onclick = {() => this.handleSelectSegment([segment])} />;
        }

        return (
            <div style = {{width: "300px"}}>
                <Grid>
                    <GridCell width="1-2" noMargin = {true}>
                        <div className="uk-text-x-large">{segment.shipment.code}</div>
                    </GridCell>
                    <GridCell width="1-2" noMargin = {true}>
                        <div className="uk-text-bold">{readyAtDate}</div>
                        <div className="uk-text-muted">{readyAtTimezone}</div>
                    </GridCell>
                    <GridCell width="1-1">
                        <div>{segment.shipment.customerName}</div>
                    </GridCell>
                    <GridCell width="1-1">
                        {dimensions}
                    </GridCell>
                    <GridCell width="1-3">
                        <Span bold = {true} label="Gr. Weight" value={grossWeight + " kg"} />
                    </GridCell>
                    <GridCell width="1-3">
                        <Span bold = {true} label="Volume" value={volume + " m³"} />
                    </GridCell>
                    <GridCell width="1-3">
                        <Span bold = {true} label="LDM" value={ldm + " ldm"} />
                    </GridCell>
                    <GridCell width="1-1">
                        {VehicleFeature.createVehicleRequirementElementsOfSegment(segment)}
                    </GridCell>
                    <GridCell width="1-1" textCenter = {true}>
                        {actionButton}
                    </GridCell>
                </Grid>
            </div>
        );
    }
    showWarehouseInfo(marker){
        return (
            <div style = {{width: "200px"}}>
                <Grid>
                    <GridCell width="1-1">
                        <div className="uk-text-bold">{marker.warehouse.name}</div>
                    </GridCell>
                </Grid>
            </div>
        );
    }

    showTrailerInfo(marker){
        let actionButton = <Button label="select" style="primary" size="small" flat = {true} onclick = {() => this.handleTrailerSelect(marker.trailer)} />;
        if(marker.selected){
            actionButton = <Button label="remove" style="primary" size="small" flat = {true} onclick = {() => this.handleTrailerRemove(marker.trailer)} />;
        }
        let content = null;
        if(!marker.trailer.availableNow){
            let dateSplit = marker.trailer.availableTime.split(" ");
            let availableMoment = this.momentTimezone.tz(dateSplit[0] + " " + dateSplit[1], this.momentFormat, true, dateSplit[2]);
            let availableAfter = availableMoment.format("DD/MM HH:mm") + " " + dateSplit[2];
            content =
                <Grid>
                    <GridCell width="1-2"><Span label="Available After" value = {availableAfter} /></GridCell>
                    <GridCell width="1-2"><Span label="Trip Code" value = {marker.trailer.tripPlanCode} /></GridCell>
                </Grid>;
        }

        return (
            <div style = {{width: "300px"}}>
                <Grid>
                    <GridCell width="1-1">
                        <div className="uk-text-bold">{marker.trailer.vehicle.plateNumber}</div>
                    </GridCell>
                    <GridCell width="1-1">
                        {content}
                    </GridCell>
                    <GridCell width="1-1" textCenter = {true}>
                        {VehicleFeature.createVehicleRequirementElementsOfVehicle(marker.trailer)}
                    </GridCell>
                    <GridCell width="1-1" textCenter = {true}>
                        {actionButton}
                    </GridCell>
                </Grid>
            </div>
        );
    }

    render(){
        return(
            <div id="mapPlanning" style={{width: "100%", height: "100%", position: "relative"}}/>
        );
    }
}
PlanningMap.contextTypes = {
    storage: React.PropTypes.object
};