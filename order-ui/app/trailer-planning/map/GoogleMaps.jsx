import React from "react";
import ReactDOM from "react-dom";
import uuid from "uuid";
import _ from "lodash";

import {Button, DropDown, Notify, Checkbox, Span} from 'susam-components/basic';
import {Grid, GridCell, Card} from 'susam-components/layout';
import {VehicleFeature} from "../VehicleFeature";
import { Kartoteks } from "../../services";

export class GoogleMaps {
    //static key = "AIzaSyChgiAMDKWpPRM8b3ajXfyrrLnOt_cG3tM";
    static key = "AIzaSyDE6jFmZfiFjIYBu9CD2lNKSxYaJhAF4nI";
    static baseScriptUrl = 'https://maps.googleapis.com/maps/api/js';
    static log(str) {
        return;
        if (_.isString(str)) {
            console.log("GoogleMaps:" + str);
        } else {
            console.log(str);
        }
    }
    static isScriptLoaded(url) {
        GoogleMaps.log("inside isScriptLoaded");

        let scripts = document.getElementsByTagName('script');

        for (let i = 0; i < scripts.length; i++) {
            if (scripts[i].src.indexOf(url) != -1) {
                return true;
            }
        }

        return false;
    }
    static addScript(urlCheck, url, async, defer) {
        GoogleMaps.log("inside addScript");

        if (!GoogleMaps.isScriptLoaded(urlCheck)) {

            GoogleMaps.log("adding script " + url);

            let script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = url;

            if (async) {
                script.async = true;
            }

            if (defer) {
                script.defer = true;
            }

            $("body").append(script);
            return true;
        }
        return false;
    }

    static addScripts(initFunctionName, initFunction) {
        Kartoteks.readProperty('google.apikey').then(response=>{
            GoogleMaps.log("inside addScripts");
            GoogleMaps.log("base resource url is " + window.baseResourceUrl);

            let googleMapsScriptUrl = GoogleMaps.baseScriptUrl + "?libraries=geometry&key=" + response.data + "&callback=" + initFunctionName;

            let callInitFunction = false;

            // Script zaten yüklendiyse aşağısı false dönecektir, dolayısıyla initFunction maps.googleapis.com tarafından çağırılmayacaktır.
            // Bu durumda initFunction'ı bizim çağırmamız gerekmektedir.
            // Bu durumla ne zaman karşılaşıyoruz? Ana sayfada bir harita yüklüyse, ana sayfadan açılan bir modal içinde de başka bir harita
            // göstermek istediğimizde script sadece bir kere yükleniyor.
            if (!GoogleMaps.addScript(GoogleMaps.baseScriptUrl, googleMapsScriptUrl, true, true)) {
                callInitFunction = true;
            }

            window[initFunctionName] = initFunction;

            if (callInitFunction) {
                window[initFunctionName]();
            }
        })
    }
    static createMap(mapId, center, baseImageUrl, markCurrentPosition, onResize) {
        GoogleMaps.log("inside createMap");

        let mapProps = {
            zoom: 10,
            disableDefaultUI: true,
            styles: [
                {
                    "featureType": "administrative",
                    "elementType": "geometry",
                    "stylers": [
                        {
                            "visibility": "on"
                        }
                    ]
                },
                {
                    "featureType": "administrative.land_parcel",
                    "stylers": [
                        {
                            "visibility": "off"
                        }
                    ]
                },
                {
                    "featureType": "administrative.neighborhood",
                    "stylers": [
                        {
                            "visibility": "off"
                        }
                    ]
                },
                {
                    "featureType": "poi",
                    "stylers": [
                        {
                            "visibility": "off"
                        }
                    ]
                },
                {
                    "featureType": "poi",
                    "elementType": "geometry.fill",
                    "stylers": [
                        {
                            "color": "#C5E3BF"
                        }
                    ]
                },
                {
                    "featureType": "poi",
                    "elementType": "labels.text",
                    "stylers": [
                        {
                            "visibility": "off"
                        }
                    ]
                },
                {
                    "featureType": "road",
                    "elementType": "geometry",
                    "stylers": [
                        {
                            "lightness": 100
                        },
                        {
                            "visibility": "simplified"
                        }
                    ]
                },
                {
                    "featureType": "road",
                    "elementType": "geometry.fill",
                    "stylers": [
                        {
                            "color": "#D1D1B8"
                        }
                    ]
                },
                {
                    "featureType": "road",
                    "elementType": "labels",
                    "stylers": [
                        {
                            "visibility": "off"
                        }
                    ]
                },
                {
                    "featureType": "road",
                    "elementType": "labels.icon",
                    "stylers": [
                        {
                            "visibility": "off"
                        }
                    ]
                },
                {
                    "featureType": "road.arterial",
                    "elementType": "labels",
                    "stylers": [
                        {
                            "visibility": "off"
                        }
                    ]
                },
                {
                    "featureType": "road.highway",
                    "elementType": "labels",
                    "stylers": [
                        {
                            "visibility": "off"
                        }
                    ]
                },
                {
                    "featureType": "road.local",
                    "stylers": [
                        {
                            "visibility": "off"
                        }
                    ]
                },
                {
                    "featureType": "transit",
                    "stylers": [
                        {
                            "visibility": "off"
                        }
                    ]
                },
                {
                    "featureType": "water",
                    "elementType": "geometry",
                    "stylers": [
                        {
                            "color": "#C6E2FF"
                        },
                        {
                            "visibility": "on"
                        }
                    ]
                },
                {
                    "featureType": "water",
                    "elementType": "labels.text",
                    "stylers": [
                        {
                            "visibility": "off"
                        }
                    ]
                }
            ]
        };

        if (center) {
            _.merge(mapProps, {center: center});
        }

        let map = new google.maps.Map(document.getElementById(mapId), mapProps);
        map.mapId = mapId;

        if (markCurrentPosition) {
            try {
                GoogleMaps.log("adding current position");

                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((position) => {
                        let pos = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };

                        new google.maps.Marker({
                            position: pos,
                            map: map,
                            animation: google.maps.Animation.DROP,
                            icon: {
                                url: baseImageUrl + 'gpsloc.png',
                                scaledSize: new google.maps.Size(16, 16),
                                origin: new google.maps.Point(0, 0),
                                anchor: new google.maps.Point(0, 0)
                            },
                        });

                        GoogleMaps.centerMap(map, pos);
                    });
                }
            } catch (e) {
                GoogleMaps.log("could not add current position");
            }
        }

        GoogleMaps.log("creating info window");

        map.infoWindow = new google.maps.InfoWindow({});
        map.addListener('click', () => {
            map.infoWindow.close();
        });

        map.trafficLayer = new google.maps.TrafficLayer();

        map.directionsDisplay = new google.maps.DirectionsRenderer({
            draggable: false,
            hideRouteList: true,
            map: map,
            preserveViewport: true,
            markerOptions: {visible: false},
            polylineOptions: {
                strokeColor: "#3e2723",
                strokeOpacity: 0.5,
                strokeWeight: 6
            }
        });

        map.distanceMeasures = [
            {
                display: "km",
                unit: 1000,
                show: true
            }, {
                display: "m",
                unit: 1,
                show: false
            }
        ];

        map.durationMeasures = [
            {
                display: "hour",
                unit: 60 * 60,
                show: true
            }, {
                display: "min",
                unit: 60,
                show: true
            }, {
                display: "sec",
                unit: 1,
                show: false
            }
        ];

        if (onResize) {
            google.maps.event.addListener(map, 'bounds_changed', () => {
                onResize();
            });
        }

        GoogleMaps.registerResize(map);

        if (!map.getCenter()) {
            GoogleMaps.log("no center specified for the map. Will center to default");
            GoogleMaps.centerMap(map);
        }

        return map;
    }

    static createIcon(icon){
        return {
            path: icon.path,
            fillColor: icon.fillColor || "#FFFFFF",
            fillOpacity: icon.fillOpacity || 0.75,
            scale: icon.scale || 0.6,
            strokeColor: icon.strokeColor || '#424242',
            strokeWeight: icon.strokeWeight || 1,
            anchor: new google.maps.Point(icon.anchor.x, icon.anchor.y)
        };
    }

    static removeMarker(map, data){
        data.forEach(item => {
            let index = _.findIndex(map.markers, {_id: item.id});
            if(index >= 0){
                map.markers[index].setMap(null);
            }
            _.remove(map.markers, marker => marker._id == item.id);
        });
    }
    static updateMarker(map, data){
        GoogleMaps.removeMarker(map, data);

        let markers = data.map(item => {
            return GoogleMaps.createMarker(map, item);
        });
        if(!map.markers){
            map.markers = [];
        }
        map.markers = map.markers.concat(markers);
    }

    static removeMarkersOfType(map, types) {
        GoogleMaps.hideMarkersOfType(map, types);
        _.remove(map.markers, item => _.intersection(item.types, types).length > 0);
    }
    static showMarkersOfType(map, types){
        if(!map.markers){
            return;
        }
        map.markers.forEach(item => {
            if(_.intersection(item.types, types).length > 0){
                item.setMap(map);
            }
        });
    }
    static hideMarkersOfType(map, types){
        if(!map.markers){
            return;
        }
        map.markers.forEach(item => {
            if(_.intersection(item.types, types).length > 0){
                item.setMap(null);
            }
        });
    }
    static updateInfoWindow(map, data){
        let infoDiv = document.createElement('div');
        ReactDOM.render(data.onShowInfo(data), infoDiv);
        map.infoWindow.setContent(infoDiv);

    }
    static renderInfoWindow(map, marker, data){
        if (data.onShowInfo) {
            let infoWindowId = uuid.v4();
            let infoDiv = document.createElement('div');
            ReactDOM.render(data.onShowInfo(data), infoDiv);

            map.infoWindow.setContent(infoDiv);
            map.infoWindow.id = infoWindowId;
            map.infoWindow.open(map, marker);
            window.setTimeout(() => {
                if (map.infoWindow.id === infoWindowId) {
                    map.infoWindow.close();
                }
            }, 10 * 1000);
        }
    }
    static addMarkerListener(map, marker, data){
        marker.addListener('click', () => {
            this.renderInfoWindow(map, marker, data);
        });
    }
    static createMarker(map, data){
        let icon = GoogleMaps.createIcon(data.icon);
        let marker = new google.maps.Marker({
            position: data.position,
            icon: icon,
            map: data.hidden ? null : map,
        });
        GoogleMaps.addMarkerListener(map, marker, data);

        marker._id = data.id;
        marker.types = data.types;
        marker.selected = data.selected;
        return marker;
    }
    static updateMarkersOfType(map, newData, ...types) {
        if (!newData) {
            return;
        }

        this.removeMarkersOfType(map, types);
        let markers = newData.map(data => {
            return GoogleMaps.createMarker(map, data);
        });
        if(!map.markers){
            map.markers = [];
        }
        map.markers = map.markers.concat(markers);

    }
    static animateMarker(map, id){
        let marker = _.find(map.markers, {_id: id});
        if(marker){
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(() => { marker.setAnimation(null); }, 750);
        }
    }
    static centerMap(map, position) {
        GoogleMaps.log("inside centerMap");

        if (!position) {
            GoogleMaps.log("no position available, centering to default coordinates");
            map.setCenter({lat: 40.973678, lng: 29.253669});
        } else {
            GoogleMaps.log("New center is " + position.lat + "," + position.lng);
            map.setCenter(position);
        }
    }
    static fitBounds(map, bounds) {
        if (map && bounds) {
            GoogleMaps.log("fitting bounds");
            GoogleMaps.log(bounds.toJSON());
            map.fitBounds(bounds);
        }
    }
    static registerResize(map) {
        let mapElement = document.getElementById(map.mapId);
        if (map.prevMapWidth != mapElement.offsetWidth || map.prevMapHeight != mapElement.offsetHeight) {
            GoogleMaps.log("resizing map");
            map.prevMapWidth = mapElement.offsetWidth;
            map.prevMapHeight = mapElement.offsetHeight;
            GoogleMaps.resizeMap(map);
        }

        window.setTimeout(() => {
            GoogleMaps.registerResize(map);
        }, 1000);
    }
    static resizeMap(map) {
        GoogleMaps.log("inside resizeMap");

        google.maps.event.trigger(map, "resize");
    }

    static fitToSeeAllMarkers(map) {
        GoogleMaps.log("inside fitToSeeAllMarkers");

        if (map.markers && map.markers.length > 0) {
            if (map.markers.length == 1) {
                GoogleMaps.centerMap(map, map.markers[0].getPosition());
            } else {
                let bounds = new google.maps.LatLngBounds();
                for (let i = 0; i < map.markers.length; i++) {
                    bounds.extend(map.markers[i].getPosition());
                }

                GoogleMaps.fitBounds(map, bounds);
            }
        }
    }

    static calculateDistanceMatrix(origins, destinations, callbackFn) {
        GoogleMaps.log("inside calculateDistanceMatrix");

        if (origins && origins.length > 0 && destinations && destinations.length > 0) {
            let service = new google.maps.DistanceMatrixService;
            service.getDistanceMatrix({
                origins: origins,
                destinations: destinations,
                travelMode: 'DRIVING',
                unitSystem: google.maps.UnitSystem.METRIC,
            }, (response, status) => {
                GoogleMaps.log("distance matrix result is");
                GoogleMaps.log(response);
                callbackFn(response);
            });
        }
    }

    static calculateRoute(markers, callback){
        let start = _.first(markers).position;
        let end = _.last(markers).position;
        let waypoints = [];
        markers.forEach((item, index) => {
            if(index != 0 && index != markers.length - 1){
                waypoints.push({location: item.position, stopover: true});
            }
        });
        let directionsService = new google.maps.DirectionsService();
        directionsService.route({
            origin: start,
            destination: end,
            waypoints: waypoints,
            optimizeWaypoints: false,
            travelMode: 'DRIVING',
            provideRouteAlternatives: false
        },(response, status) => {
            if (status === 'OK') {
                callback(response);
            }else{
                Notify.showError('Directions request failed due to ' + status);
            }
        });
    }

    static clearRoute(map){
        map.directionsDisplay.setMap(null);
    }

    static updateRoute(map, markers){
        if(!markers || markers.length == 0){
            GoogleMaps.clearRoute(map);
        }else{
            if(markers && markers.length > 0){
                GoogleMaps.calculateRoute(markers, (response) => {
                    GoogleMaps.displayRoute(map, response);
                });
            }
        }
    }
    static displayRoute(map, routeResponse){
        if(routeResponse){
            map.directionsDisplay.setMap(map);
            map.directionsDisplay.setDirections(routeResponse);
        }
    }

    static createControlsDivIfNotExists(prefix){
        let div = document.getElementById(prefix + "ControlsDiv");
        if(!div){
            div = document.createElement('div');
            div.setAttribute("id", prefix + "ControlsDiv");
        }
        return div;
    }

    static renderControlButtons(map, settings, onClick) {
        let topRightButtons = [];
        if(settings.showExpandButton){
            topRightButtons.push(<div key="expand" className="uk-margin-top uk-margin-right"><Button id="mapExpandButton" icon="expand" onclick = {() => onClick("EXPAND")}/></div>);
        }
        if(settings.showCompressButton){
            topRightButtons.push(<div key="compress" className="uk-margin-top uk-margin-right"><Button id="mapCompressButton" icon="compress" onclick = {() => onClick("COMPRESS")}/></div>);
        }

        let topRightDiv = GoogleMaps.createControlsDivIfNotExists("topRight");
        ReactDOM.render(<div style = {{opacity: 0.85}}>{topRightButtons}</div>, topRightDiv);
        map.controls[google.maps.ControlPosition.TOP_RIGHT] = [topRightDiv];

        let bottomRightButtons = [];
        if(settings.showNarrowButton){
            bottomRightButtons.push(<div key="narrow" className="uk-margin-bottom uk-margin-right"><Button id="mapNarrowButton" label="Show list" icon="arrow-up" onclick = {() => onClick("NARROW")}/></div>);
        }
        if(settings.showEnlargeButton){
            bottomRightButtons.push(<div key="enlarge" className="uk-margin-bottom uk-margin-right"><Button id="mapEnlargeButton" label="hide list" icon="arrow-down" onclick = {() => onClick("ENLARGE")}/></div>);
        }

        let bottomRightDiv = GoogleMaps.createControlsDivIfNotExists("bottomRight");
        ReactDOM.render(<div style = {{opacity: 0.85}}>{bottomRightButtons}</div>, bottomRightDiv);
        map.controls[google.maps.ControlPosition.RIGHT_BOTTOM] = [bottomRightDiv];

    }
    static renderLayersDropDown(map, options, selectedLayers, onSelect) {
        let types = options.map(option => {
            let hrefId = "ctrlType_a_" + _.snakeCase(option.name) + "_" + map.mapId;
            let iconClass = _.find(selectedLayers, {id: option.id}) ? "uk-icon-check-circle-o" : "uk-icon-circle-o";
            return (
                <li key={hrefId}>
                    <a className={"uk-icon uk-icon-small " + iconClass}
                       onClick={(e) => {e.preventDefault(); onSelect(option)}}>
                            <span className="uk-margin uk-margin-left uk-text-large">
                                {option.name}
                            </span>
                    </a>
                </li>
            );
        });

        let dropDown = (
            <div className="uk-button-dropdown" data-uk-dropdown>
                <Button label="layers" />
                <div className="uk-dropdown uk-dropdown-bottom" style={{width: "150px"}}>
                    <ul className="uk-nav uk-nav-dropdown">
                        {types}
                    </ul>
                </div>
            </div>
        );

        let layersDiv = GoogleMaps.createControlsDivIfNotExists("layers");
        ReactDOM.render(<div key="layers" className="uk-margin-top uk-margin-right" style = {{opacity: 0.85}}>{dropDown}</div>, layersDiv);
        map.controls[google.maps.ControlPosition.TOP_RIGHT] = map.controls[google.maps.ControlPosition.TOP_RIGHT].concat(layersDiv);
    }
    static renderTrailerFilter(map, filter, onRemove) {

        let filterDiv = GoogleMaps.createControlsDivIfNotExists("trailerFilter");
        let filterCard = null;
        if(filter && filter.distance != -1){
            filterCard =
                <div className="md-card">
                    <div className="md-card-content">
                        <span className="uk-text-muted uk-margin-right">Vehicles within {filter.distance} km radius are shown</span>
                        <Button label="remove" flat = {true} style="danger" size="mini" onclick = {() => onRemove()} />
                    </div>
                </div>;

        }
        ReactDOM.render(<div key="filters" className="uk-margin-top" style = {{opacity: 0.85}}>{filterCard}</div>, filterDiv);
        map.controls[google.maps.ControlPosition.TOP_CENTER] = [filterDiv];
    }
    static renderInitialSegmentDetails(map) {
        let segmentsDiv = GoogleMaps.createControlsDivIfNotExists("segments");
        map.controls[google.maps.ControlPosition.TOP_LEFT] = [segmentsDiv];
    }
    static renderSegmentDetails(map, marker, selectedSegments, onSelect, onClose) {
        let segmentsDiv = GoogleMaps.createControlsDivIfNotExists("segments");
        let padding = 30;
        let cardHeader = 49;
        let height = ($("#mapPlanning").height() - (padding + cardHeader)) + "px";
        ReactDOM.render(<div key="segments" className="uk-margin-top uk-margin-left gm-style-iw"
                             style = {{width: "360px", display: marker._detailsVisible ? "block" : "none"}}>
            <div className="md-card">
                <div className="md-card-toolbar">
                    <div className="md-card-toolbar-actions">
                        <a href="#" onClick = {(e) => {e.preventDefault(); onClose()}}><i className="md-icon material-icons md-card-close"></i></a>
                    </div>
                    <h3 className="md-card-toolbar-heading-text">
                        Shipments At Selected Location
                    </h3>
                </div>
                <div className="md-card-content uk-padding-remove">
                    <div className="uk-overflow-container" style = {{height: height}}>
                        <ul className="md-list md-list-addon-small">
                            {marker.segments.map(item => GoogleMaps.renderSingleSegmentDetail(item, _.find(selectedSegments, {id: item.id}), onSelect))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>, segmentsDiv);
        map.controls[google.maps.ControlPosition.TOP_LEFT] = [segmentsDiv];
    }
    static renderSingleSegmentDetail(segment, selected, onSelect) {
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
                            <span>{item.count + " " + type}</span>
                            <span className="uk-text-bold" style = {{marginLeft:"3px"}}>{item.width + "*" + item.length + "*" + item.height}</span>
                            <span style = {{marginLeft:"3px"}}>stackability: </span>
                            <span className="uk-text-bold" style = {{marginLeft:"3px"}}>{item.stackSize}</span>
                        </div>
                    );
                })
            });
        }
        return(
            <li key = {segment.id}>
                <div className="md-list-addon-element">
                    <Checkbox value = {selected} onchange = {value => onSelect(value, segment)}/>
                </div>
                <div className="md-list-content">
                    <Grid>
                        <GridCell width="1-2" noMargin = {true}>
                            <div className="uk-text-x-large">{segment.shipment.code}</div>
                        </GridCell>
                        <GridCell width="1-2" noMargin = {true}>
                            <div className="uk-text-bold">{readyAtDate}</div>
                            <div className="uk-text-muted">{readyAtTimezone}</div>
                        </GridCell>
                        <GridCell width="1-1">
                            <div className="uk-text-bold">{segment.shipment.customerName}</div>
                        </GridCell>
                        <GridCell width="1-1">
                            {dimensions}
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
                        <GridCell width="1-1">
                            {VehicleFeature.createVehicleRequirementElementsOfSegment(segment)}
                        </GridCell>
                    </Grid>
                </div>
            </li>
        );
    }
}