import React from "react";
import uuid from "uuid";
import {GoogleMaps} from "./GoogleMaps";

export class Map extends React.Component {

    log(str) {
        //console.log(str);
    }

    constructor(props) {
        super(props);

        this.log("inside constructor");

        this.id = (props.id ? props.id : uuid.v4()).replace(/-/g, '');
        this.mapId = "map" + this.id;
        this.initFunctionName = 'initMap' + this.id;

        this.baseImageUrl = window.baseResourceUrl + '/assets/img/map/';
    }

    componentWillReceiveProps(nextProps) {
        if (!this.map) {
            return;
        }

        this.log("inside componentWillReceiveProps");

        let newWidth = nextProps.width;
        let oldWidth = this.props.width;
        if (!_.isEqual(newWidth, oldWidth)) {
            this.log("props.width changed. resizing map.");
            GoogleMaps.resizeMap(this.map);
        }

        let newHeight = nextProps.height;
        let oldHeight = this.props.height;
        if (!_.isEqual(newHeight, oldHeight)) {
            this.log("props.height changed. resizing map.");
            GoogleMaps.resizeMap(this.map);
        }

        let newCenter = nextProps.center;
        let oldCenter = this.props.center;
        if (!_.isEqual(newCenter, oldCenter)) {
            this.log("props.center changed. centering map.");
            GoogleMaps.centerMap(this.map, newCenter);
        }

        let newData = nextProps.data;
        let oldData = this.props.data;
        let data_no = _.differenceBy(newData, oldData, d => d.id);
        let data_on = _.differenceBy(oldData, newData, d => d.id);
        if (data_no.length > 0 || data_on.length > 0) {
            this.log("props.data changed. updating data.");
            GoogleMaps.updateMarkers(this.map, newData, this.baseImageUrl, nextProps.onShowInfo, nextProps.onMarkerClicked);
        }

        let newTraffic = nextProps.traffic;
        let oldTraffic = this.props.traffic;
        if (!_.isEqual(newTraffic, oldTraffic)) {
            this.log("props.traffic changed. updating traffic.");
            this.map.traffic(newTraffic);
        }

        let newClustering = nextProps.clustering;
        let oldClustering = this.props.clustering;
        if (!_.isEqual(newClustering, oldClustering)) {
            this.log("props.clustering changed. updating clustering.");
            this.map.clustering(newClustering);
        }

        let newOptimization = nextProps.optimization;
        let oldOptimization = this.props.optimization;
        if (!_.isEqual(newOptimization, oldOptimization)) {
            this.log("props.optimization changed. updating optimization.");
            this.map.optimization(newOptimization);
        }

        let newRouteDrawRequestTime = nextProps.routeDrawRequestTime;
        let oldRouteDrawRequestTime = this.props.routeDrawRequestTime;
        if (!_.isEqual(newRouteDrawRequestTime, oldRouteDrawRequestTime)) {
            this.log("props.routeDrawRequestTime changed. drawing route.");
            if (newRouteDrawRequestTime == -1) {
                GoogleMaps.clearRoute(this.map);
            } else {
                GoogleMaps.drawRoute(this.map, nextProps.route, nextProps.onRouteDrawn, this.map.optimization(), nextProps.routeCheckFunction, false, this.props.getLegPolylineOptions);
            }
        }

        let newPolygonData = nextProps.polygonData;
        let oldPolygonData = this.props.polygonData;
        if (!_.isEqual(newPolygonData, oldPolygonData)) {
            this.log("props.polygonData changed. updating polygonData.");
            GoogleMaps.updatePolygons(this.map, newPolygonData, this.props.onShowPolygonInfo, this.props.editablePoligons);
        }

        let newShowTraffic = nextProps.showTraffic;
        let oldShowTraffic = this.props.showTraffic;
        if (!_.isEqual(newShowTraffic, oldShowTraffic)) {
            this.log("props.showTraffic changed. updating showTraffic.");
            GoogleMaps.changeTrafficVisibility(this.map, newShowTraffic);
        }

        let newShowClustering = nextProps.showClustering;
        let oldShowClustering = this.props.showClustering;
        if (!_.isEqual(newShowClustering, oldShowClustering)) {
            this.log("props.showClustering changed. updating showClustering.");
            GoogleMaps.changeClusteringVisibility(this.map, newShowClustering);
        }

        let newShowOptimization = nextProps.showOptimization;
        let oldShowOptimization = this.props.showOptimization;
        if (!_.isEqual(newShowOptimization, oldShowOptimization)) {
            this.log("props.showOptimization changed. updating showOptimization.");
            GoogleMaps.changeOptimizationVisibility(this.map, newShowOptimization);
        }
    }

    componentDidMount() {
        this.log("inside componentDidMount");
        GoogleMaps.addScripts(this.props.key, this.initFunctionName, () => {
            this.initMap();
        });
    }

    initMap() {
        this.log("inside initMap");

        this.map = GoogleMaps.createMap(this.mapId, this.props.center, this.baseImageUrl, this.props.markCurrentPosition, this.props.onResize);
        GoogleMaps.attachControlsToMap(this.map, this.props.traffic, this.props.clustering, this.props.optimization, () => {
            this.onOptimizationChange()
        }, this.baseImageUrl);
        GoogleMaps.changeTrafficVisibility(this.map, this.props.showTraffic);
        GoogleMaps.changeClusteringVisibility(this.map, this.props.showClustering);
        GoogleMaps.changeOptimizationVisibility(this.map, this.props.showOptimization);
        GoogleMaps.updateMarkers(this.map, this.props.data, this.baseImageUrl, this.props.onShowInfo, this.props.onMarkerClicked);
        GoogleMaps.updatePolygons(this.map, this.props.polygonData, this.props.onShowPolygonInfo, this.props.editablePoligons);
    }

    onOptimizationChange() {
        this.log("inside onOptimizationChange");

        if (GoogleMaps.hasDrownRoute(this.map)) {
            GoogleMaps.drawRoute(this.map, this.props.route, this.props.onRouteDrawn, this.map.optimization(), this.props.routeCheckFunction, false, this.props.getLegPolylineOptions);
        }

        this.props.onOptimizationChange();
    }

    calculateDistanceMatrix(origins, destinations, callbackFn) {
        GoogleMaps.calculateDistanceMatrix(origins, destinations, callbackFn);
    }

    getBounds(outerPaths) {
        return GoogleMaps.getBounds(outerPaths);
    }

    unionBounds(bounds) {
        return GoogleMaps.unionBounds(bounds);
    }

    fitBounds(bounds) {
        GoogleMaps.fitBounds(this.map, bounds);
    }

    drawBounds(bounds) {
        GoogleMaps.drawBounds(this.map, bounds);
    }

    render() {
        this.log("inside render");

        return (
            <div key={this.id} id={this.mapId}
                 style={{width: this.props.width, height: this.props.height}}/>
        );
    }
}