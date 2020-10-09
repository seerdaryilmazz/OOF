import React from "react";
import ReactDOM from "react-dom";
import uuid from "uuid";
import _ from "lodash";

export class GoogleMaps {

    static log(str) {
        if (_.isString(str)) {
            console.log("GoogleMaps:" + str);
        } else {
            console.log(str);
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

    static updateMarkers(map, newData, baseImageUrl, onShowInfo, onMarkerClicked) {
        GoogleMaps.log("inside updateMarkers");
        GoogleMaps.log("new marker data is:");
        GoogleMaps.log(newData);

        GoogleMaps.clearMarkers(map);

        let markers = null;
        let types = [];
        if (newData) {
            markers = newData.map((d, i) => {
                let marker = new google.maps.Marker({
                    position: d.position,
                    icon: baseImageUrl + d.icon + ".png",
                    map: map,
                });

                if (d.types && d.types.length > 0) {
                    d.types.forEach(type => {
                        if (types.indexOf(type) === -1) {
                            types.push(type);
                        }
                    });
                }

                marker.addListener('click', () => {
                    GoogleMaps.log("marker clicked");

                    if (onShowInfo) {
                        let infoWindowId = uuid.v4();
                        let infoDiv = document.createElement('div');

                        try {
                            ReactDOM.render(onShowInfo(d), infoDiv);
                        } catch (e) {
                            GoogleMaps.log("error while rendering info");
                            GoogleMaps.log(d);
                        }

                        map.infoWindow.setContent(infoDiv);
                        map.infoWindow.id = infoWindowId;
                        map.infoWindow.open(map, marker);
                        window.setTimeout(() => {
                            if (map.infoWindow.id === infoWindowId) {
                                GoogleMaps.log("automatically closing info window");
                                map.infoWindow.close();
                            } else {
                                GoogleMaps.log("not closing info window");
                            }
                        }, 3000);
                    }

                    if (onMarkerClicked) {
                        onMarkerClicked(d);
                    }
                });

                if (d.types && d.types.length > 0) {
                    marker.types = d.types;
                }

                return marker;
            });
        }

        map.markers = markers;
        map.types = types.length > 0 ? types.map(type => {
            return {name: type, selected: true}
        }) : null;

        GoogleMaps.log("New markers are:");
        GoogleMaps.log(map.markers);

        GoogleMaps.log("New types are:");
        GoogleMaps.log(map.types);

        if (map.markerCluster && map.markers) {
            map.markerCluster.addMarkers(map.markers);
        }

        if (!markers) {
            GoogleMaps.centerMap(map);
        }

        GoogleMaps.fitToSeeAllMarkers(map);
        GoogleMaps.updateTypesControl(map);
    }

    static clearMarkers(map) {
        GoogleMaps.log("inside clearMarkers");

        if (map.markerCluster) {
            GoogleMaps.log("removing markers from cluster");
            map.markerCluster.clearMarkers();
        }

        map.oldMarkers = _.union(map.markers, map.oldMarkers);

        if (map.oldMarkers && map.oldMarkers.length > 0) {
            GoogleMaps.log("will clear " + map.oldMarkers.length + " markers");
            map.oldMarkers.forEach(marker => {
                marker.setVisible(false);
                marker.setMap(null);
            });
        }

        if (window.mapOldMarkersClearTimeout) {
            window.clearTimeout(window.mapOldMarkersClearTimeout);
        }

        window.mapOldMarkersClearTimeout = window.setTimeout(()=> {
            GoogleMaps.log("deleting old markers cache");
            map.oldMarkers = [];
        }, 5000);

        map.types = null;
    }

    static clearRoute(map) {
        GoogleMaps.log("inside clearRoute");

        if (map && map.directionsDisplay) {
            map.directionsDisplay.setMap(null);
            map.directions = null;
            GoogleMaps.clearRoutePolylines(map);
        }
    }

    static drawRoute(map, route, onRouteDrawn, optimization, routeCheckFunction, customOptimization, getLegPolylineOptions) {
        GoogleMaps.log("inside drawRoute");
        GoogleMaps.log("optimization is " + optimization);
        GoogleMaps.log("custom optimization is " + customOptimization);

        if (map) {
            if (route) {
                let start = null;
                let end = null;
                let waypoints = [];

                route.forEach((item, index) => {
                    if (index == 0) {
                        start = item.position;
                    } else if (index == route.length - 1) {
                        end = item.position;
                    } else {
                        waypoints.push({location: item.position, stopover: true});
                    }
                });

                map.directionsService.route({
                    origin: start,
                    destination: end,
                    waypoints: waypoints,
                    optimizeWaypoints: optimization,
                    travelMode: 'DRIVING',
                    provideRouteAlternatives: true
                }, (response, status) => {
                    if (status === 'OK') {
                        GoogleMaps.log("route response is");
                        GoogleMaps.log(response);

                        let routeInfo = GoogleMaps.constructRouteInfo(route, response, map, optimization, routeCheckFunction, customOptimization);
                        GoogleMaps.log("found route info is");
                        GoogleMaps.log(routeInfo);

                        if (routeInfo && !routeInfo.isRouteValid && optimization) {
                            GoogleMaps.log("google maps optimization results are invalid. Retrying with custom optimization");
                            GoogleMaps.findShortestRoute(route, routeCheckFunction, function (list) {
                                GoogleMaps.log("custom optimization returned");
                                GoogleMaps.log(list);

                                if (list) {
                                    GoogleMaps.log("Custom optimization is ok. Drawing optimized results.");
                                    GoogleMaps.drawRoute(map, list, onRouteDrawn, false, routeCheckFunction, true);
                                } else {
                                    GoogleMaps.log("No result from custom optimization. Drawing with no optimization.");
                                    GoogleMaps.drawRoute(map, route, onRouteDrawn, false, routeCheckFunction, false);
                                }
                            });
                        } else {
                            GoogleMaps.log("displaying route")
                            map.directionsDisplay.setMap(map);
                            map.directionsDisplay.setDirections(response);
                            map.directions = response;
                            GoogleMaps.drawRoutePolylines(map, getLegPolylineOptions);
                            onRouteDrawn(routeInfo);
                        }
                    }
                });
            }
        }
    }

    static redrawRoute(map) {
        if (GoogleMaps.hasDrownRoute(map)) {
            map.directionsDisplay.setDirections(map.directions);
            GoogleMaps.drawRoutePolylines(map, map.getLegPolylineOptions);
        }
    }

    static findControlWithId(map, id) {
        GoogleMaps.log("inside findControlWithId");

        let controlsDiv = map.controls[google.maps.ControlPosition.TOP_RIGHT].getAt(0);

        GoogleMaps.log("controlsDiv is");
        GoogleMaps.log(controlsDiv);

        let controlId = id + map.mapId;
        let control = $(controlsDiv).find('#' + controlId);

        GoogleMaps.log("control with id " + controlId + " is");
        GoogleMaps.log(control);

        return control;
    }

    static changeControlVisibility(map, id, val) {
        GoogleMaps.log("inside changeControlVisibility");

        let control = GoogleMaps.findControlWithId(map, id);
        control.css("display", val ? "inline" : "none");

        GoogleMaps.log("changed visibility of " + id + " to " + val);
    }

    static changeTrafficVisibility(map, val) {
        GoogleMaps.changeControlVisibility(map, "ctrlTraffic", val);
    }

    static changeClusteringVisibility(map, val) {
        GoogleMaps.changeControlVisibility(map, "ctrlClustering", val);
    }

    static changeOptimizationVisibility(map, val) {
        GoogleMaps.changeControlVisibility(map, "ctrlOptimization", val);
    }

    static updateTypeVisibility(map, type, hrefId) {
        GoogleMaps.log("inside updateTypeVisibility");

        let href = $("#" + hrefId);
        let val = href.hasClass("uk-icon-check-circle-o") ? false : true;

        GoogleMaps.log("updating visiblity of type " + type + " to " + val);

        map.types.forEach(mt => {
            if (mt.name == type) {
                mt.selected = val;
            }
        });

        GoogleMaps.log("New types are");
        GoogleMaps.log(map.types);

        if (map.markers) {
            map.markers.forEach(marker => {
                if (marker.types && marker.types.length > 0) {

                    let visibleCount = 0;
                    marker.types.forEach(markerType => {
                        let mapType = _.filter(map.types, mt => {
                            return mt.name == markerType;
                        });

                        if (mapType && mapType.length == 1 && mapType[0].selected == true) {
                            visibleCount++;
                        }
                    });

                    marker.setVisible(visibleCount > 0 ? true : false);
                    marker.setMap(visibleCount > 0 ? map : null);
                }
            });

            if (map.markerCluster) {
                map.markerCluster.clearMarkers();
                map.markerCluster.addMarkers(_.filter(map.markers, m => {
                    return m.getVisible();
                }));
            }
        }

        if (val) {
            href.addClass("uk-icon-check-circle-o");
            href.removeClass("uk-icon-circle-o");
        } else {
            href.addClass("uk-icon-circle-o");
            href.removeClass("uk-icon-check-circle-o");
        }
    }

    static updateTypesControl(map) {
        GoogleMaps.log("inside updateTypesControl");

        let ctrlTypesControl = GoogleMaps.findControlWithId(map, "ctrlTypes");

        GoogleMaps.log("ctrlTypesControl is");
        GoogleMaps.log(ctrlTypesControl);

        if (ctrlTypesControl && ctrlTypesControl[0] && map.types) {
            let types = map.types.map(type => {
                let hrefId = "ctrlType_a_" + _.snakeCase(type.name) + "_" + map.mapId;
                return (
                    <li>
                        <a key={hrefId}
                           id={hrefId}
                           href="javascript:void(0);"
                           className="uk-icon uk-icon-small uk-icon-check-circle-o"
                           onClick={(e) => GoogleMaps.updateTypeVisibility(map, type.name, hrefId)}>
                            <span className="uk-margin uk-margin-left md-color-grey-900">
                                {type.name}
                            </span>
                        </a>
                    </li>
                );
            });

            let dropDown = (
                <div className="uk-button-dropdown" data-uk-dropdown>
                    <button className="uk-button uk-button-mini">
                        Show
                        <i className="uk-margin-left uk-icon-chevron-down"></i>
                    </button>
                    <div className="uk-dropdown uk-dropdown-small uk-dropdown-bottom" style={{width: "250px"}}>
                        <ul className="uk-nav uk-nav-dropdown">
                            {types}
                        </ul>
                    </div>
                </div>
            );

            ReactDOM.render(dropDown, ctrlTypesControl[0]);
        }
    }

    static attachControlsToMap(map, traffic, clustering, optimization, onOptimizationChange, baseImageUrl) {
        GoogleMaps.log("inside attachControlsToMap");

        let className = "uk-margin-small-right uk-border-rounded uk-block-default";
        let style = {padding: "3px"};

        let controls = (
            <div className="uk-margin-small-top">
                <div id={"ctrlTypes" + map.mapId} style={_.merge({display: "inline"}, style)}>
                </div>
                <label id={"ctrlTraffic" + map.mapId} className={className} style={style}>
                    <input type="checkbox" ref={(input) => map.trafficCheckbox = input}/>
                    Traffic
                </label>
                <label id={"ctrlClustering" + map.mapId} className={className} style={style}>
                    <input type="checkbox" ref={(input) => map.clusteringCheckbox = input}/>
                    Clustering
                </label>
                <label id={"ctrlOptimization" + map.mapId} className={className} style={style}>
                    <input type="checkbox" ref={(input) => map.optimizationCheckbox = input}/>
                    Optimization
                </label>
            </div>
        );

        let controlsDiv = document.createElement('div');
        ReactDOM.render(controls, controlsDiv, () => {
            GoogleMaps.updateTypesControl(map)
        });
        map.controls[google.maps.ControlPosition.TOP_RIGHT].push(controlsDiv);

        $(map.trafficCheckbox).on('change', () => {
            GoogleMaps.log("inside jquery trafficCheckbox change");
            GoogleMaps.onTrafficChange(map);
        });
        $(map.trafficCheckbox).prop('checked', traffic);
        map.traffic = (val) => {
            if (val) {
                $(map.trafficCheckbox).prop('checked', val);
            } else {
                return $(map.trafficCheckbox).prop('checked');
            }
        };

        $(map.clusteringCheckbox).on('change', () => {
            GoogleMaps.log("inside jquery clusteringCheckbox change");
            GoogleMaps.onClusteringChange(map);
        });
        $(map.clusteringCheckbox).prop('checked', clustering);
        map.clustering = (val) => {
            if (val) {
                $(map.clusteringCheckbox).prop('checked', val);
            } else {
                return $(map.clusteringCheckbox).prop('checked');
            }
        };

        $(map.optimizationCheckbox).on('change', () => {
            GoogleMaps.log("inside jquery optimizationCheckbox change");
            onOptimizationChange();
        });
        $(map.optimizationCheckbox).prop('checked', optimization);
        map.optimization = (val) => {
            if (val) {
                $(map.optimizationCheckbox).prop('checked', val);
            } else {
                return $(map.optimizationCheckbox).prop('checked');
            }
        };

        GoogleMaps.addClusteringToMap(map, clustering, baseImageUrl);
    }

    static addClusteringToMap(map, clustering, baseImageUrl) {
        GoogleMaps.log("adding clustering to map");
        if (typeof MarkerClusterer === 'function') {
            GoogleMaps.log("clustering function is already loaded. Adding clustering");
            map.markerCluster = new MarkerClusterer(map, [], {
                imagePath: baseImageUrl + 'm',
                maxZoom: clustering ? 10 : 1
            });

            map.markerCluster.clearMarkers();
            if (map.markers && map.markers.length > 0) {
                map.markerCluster.addMarkers(map.markers);
            }
        } else {
            window.setTimeout(() => {
                GoogleMaps.log("clustering function not yet loaded. Will retry");
                GoogleMaps.addClusteringToMap(map, clustering, baseImageUrl);
            }, 1000);
        }
    }

    static resizeMap(map) {
        GoogleMaps.log("inside resizeMap");

        google.maps.event.trigger(map, "resize");
    }

    static isOrdered(arr) {
        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i] > arr[i + 1]) {
                return false;
            }
        }

        return true;
    }

    static constructRouteInfo(routeData, response, map, optimization, routeCheckFunction, customOptimization) {
        GoogleMaps.log("inside constructRouteInfo");

        let calculatedRouteInfos = [];

        if (response && response.routes && response.routes.length > 0) {
            response.routes.forEach(route => {
                if (route.legs && route.legs.length > 0) {
                    let distance = 0;
                    let duration = 0;

                    GoogleMaps.log("legs are:")
                    GoogleMaps.log(route.legs);

                    let legs = [];

                    route.legs.forEach(leg => {
                        let legDistance = leg.distance && leg.distance.value ? leg.distance.value : 0;
                        let legDuration = leg.duration && leg.duration.value ? leg.duration.value : 0;

                        distance += legDistance;
                        duration += legDuration;

                        legs.push({
                            distance: GoogleMaps.splitToMeasures(legDistance, map.distanceMeasures),
                            duration: GoogleMaps.splitToMeasures(legDuration, map.durationMeasures),
                            distanceValue: legDistance,
                            durationValue: legDuration,
                        });
                    });

                    let orderedRoute = null;
                    if ((optimization && route.waypoint_order && !GoogleMaps.isOrdered(route.waypoint_order)) || customOptimization) {
                        orderedRoute = [routeData[0]];
                        route.waypoint_order.forEach(wo => {
                            orderedRoute.push(routeData[wo + 1]);
                        });
                        orderedRoute.push(routeData[routeData.length - 1]);
                    }

                    let isRouteValid = orderedRoute ? routeCheckFunction(orderedRoute) : true;

                    calculatedRouteInfos.push({
                        distance: GoogleMaps.splitToMeasures(distance, map.distanceMeasures),
                        duration: GoogleMaps.splitToMeasures(duration, map.durationMeasures),
                        distanceValue: distance,
                        durationValue: duration,
                        legs: legs,
                        orderedRoute: isRouteValid ? orderedRoute : null,
                        isRouteValid: isRouteValid,
                        mapOptimization: map.optimization()
                    });
                }
            });
        }

        GoogleMaps.log("calculated route infos are");
        GoogleMaps.log(calculatedRouteInfos);

        for (let i = 0; i < calculatedRouteInfos.length; i++) {
            if (calculatedRouteInfos[i].isRouteValid) {
                GoogleMaps.log("returning valid route");
                GoogleMaps.log(calculatedRouteInfos[i]);
                return calculatedRouteInfos[i];
            }
        }

        if (calculatedRouteInfos.length > 0) {
            GoogleMaps.log("no valid routes, returning first route");
            GoogleMaps.log(calculatedRouteInfos[0]);
            return calculatedRouteInfos[0];
        }

        GoogleMaps.log("no routes found");
        return null;
    }

    static createMap(mapId, center, baseImageUrl, markCurrentPosition, onResize) {
        GoogleMaps.log("inside createMap");

        let mapProps = {
            zoom: 10,
            disableDefaultUI: true
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

        map.directionsService = new google.maps.DirectionsService();
        map.directionsDisplay = new google.maps.DirectionsRenderer({
            draggable: false,
            suppressPolylines: true
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

    static splitToMeasures(val, measures) {
        if (!val) {
            return;
        }

        let div = 0;
        let rem = val;
        let result = [];
        measures.forEach(measure => {
            div = Math.floor(rem / measure.unit);

            if (div > 0 && measure.show) {
                result.push(div + " " + measure.display);
            }

            rem = rem % measure.unit;
        });

        return _.join(result, ' ');
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

    static addScripts(key, initFunctionName, initFunction) {
        GoogleMaps.log("inside addScripts");
        GoogleMaps.log("base resource url is " + window.baseResourceUrl);

        let googleMapsBaseScriptUrl = 'https://maps.googleapis.com/maps/api/js';
        let googleMapsScriptUrl = googleMapsBaseScriptUrl + "?libraries=geometry&key=" + key + "&callback=" + initFunctionName;
        let markerClustererJsUrl = window.baseResourceUrl + "/assets/js/markerclusterer.js";

        let callInitFunction = false;

        // Script zaten yüklendiyse aşağısı false dönecektir, dolayısıyla initFunction maps.googleapis.com tarafından çağırılmayacaktır.
        // Bu durumda initFunction'ı bizim çağırmamız gerekmektedir.
        // Bu durumla ne zaman karşılaşıyoruz? Ana sayfada bir harita yüklüyse, ana sayfadan açılan bir modal içinde de başka bir harita
        // göstermek istediğimizde script sadece bir kere yükleniyor.
        if (!GoogleMaps.addScript(googleMapsBaseScriptUrl, googleMapsScriptUrl, true, true)) {
            callInitFunction = true;
        }

        GoogleMaps.addScript(markerClustererJsUrl, markerClustererJsUrl, false, false);

        window[initFunctionName] = initFunction;

        if (callInitFunction) {
            window[initFunctionName]();
        }
    }

    static onTrafficChange(map) {
        GoogleMaps.log("inside onTrafficChange");

        if (map.traffic()) {
            map.trafficLayer.setMap(map);
        } else {
            map.trafficLayer.setMap(null);
        }
    }

    static onClusteringChange(map) {
        GoogleMaps.log("inside onClusteringChange");

        if (map.markerCluster) {
            if (map.clustering()) {
                map.markerCluster.setMaxZoom(10);
            } else {
                map.markerCluster.setMaxZoom(1);
            }

            map.markerCluster.repaint();
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

    static fitBounds(map, bounds) {
        if (map && bounds) {
            GoogleMaps.log("fitting bounds");
            GoogleMaps.log(bounds.toJSON());
            map.fitBounds(bounds);
        }
    }

    static hasDrownRoute(map) {
        return map && map.directionsDisplay && map.directionsDisplay.getMap() && map.directions;
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

    static calculateRouteDistanceMatrix(route, callbackFn) {
        GoogleMaps.log("inside calculateRouteDistanceMatrix");

        if (route && route.length > 0) {
            let points = route.map(data => {
                return data.position;
            });

            GoogleMaps.log("points are");
            GoogleMaps.log(points);

            GoogleMaps.calculateDistanceMatrix(points, points, callbackFn);
        }
    }

    static calculateDistance(perm, distanceMatrix) {
        let distance = 0;
        for (let i = 0; i < perm.length - 1; i++) {
            distance += distanceMatrix.rows[perm[i]].elements[perm[i + 1]].distance.value;
        }
        return distance;
    }

    static findShortestRoute(dataList, routeCheckFunction, callbackFn) {
        GoogleMaps.log("inside findShortestRoute");

        if (dataList && dataList.length > 3 && dataList.length < 9) {
            GoogleMaps.calculateRouteDistanceMatrix(dataList, (distanceMatrix) => {
                let poss = [];
                for (let i = 1; i < dataList.length - 1; i++) {
                    poss.push(i);
                }

                let perms = GoogleMaps.permutator(poss);

                let minDistance = Number.MAX_VALUE;
                let selectedList = null;

                perms.forEach(perm => {
                    perm.unshift(0);
                    perm.push(dataList.length - 1);

                    let list = perm.map(p => {
                        return dataList[p];
                    });

                    let valid = routeCheckFunction(list);

                    if (valid) {
                        let distance = GoogleMaps.calculateDistance(perm, distanceMatrix);

                        if (distance < minDistance) {
                            minDistance = distance;
                            selectedList = list;
                        }
                    }
                });

                let eq = _.isEqual(selectedList, dataList);
                if (eq) {
                    GoogleMaps.log("The current route is the shortest path already");
                    callbackFn(null);
                } else {
                    GoogleMaps.log("Returning the found shortest path");
                    callbackFn(selectedList);
                }
            });
        } else {
            GoogleMaps.log("too difficult to find a shortest path. calling back with null");
            callbackFn(null);
        }
    }

    static permutator(inputArr) {
        let results = [];

        function permute(arr, pmemo) {
            let cur, memo = pmemo || [];

            for (let i = 0; i < arr.length; i++) {
                cur = arr.splice(i, 1);
                if (arr.length === 0) {
                    results.push(memo.concat(cur));
                }
                permute(arr.slice(), memo.concat(cur));
                arr.splice(i, 0, cur[0]);
            }

            return results;
        }

        return permute(inputArr);
    }

    static clearPolygons(map, polygonIds) {
        GoogleMaps.log("inside clearPolygons");

        let polygonsToClear = _.remove(map.polygons, p => {
            return polygonIds.indexOf(p.id) > -1;
        });

        map.oldPolygons = _.union(polygonsToClear, map.oldPolygons);

        if (map.oldPolygons && map.oldPolygons.length > 0) {
            GoogleMaps.log("will clear " + map.oldPolygons.length + " polygons");
            map.oldPolygons.forEach(polygon => {
                polygon.setVisible(false);
                polygon.setMap(null);
            });
        }

        if (window.mapOldPolygonsClearTimeout) {
            window.clearTimeout(window.mapOldPolygonsClearTimeout);
        }

        window.mapOldPolygonsClearTimeout = window.setTimeout(()=> {
            GoogleMaps.log("deleting old polygons cache");
            map.oldPolygons = [];
        }, 5000);
    }

    static addPolygons(map, newOnes, newData, onShowPolygonInfo, editablePoligons) {
        GoogleMaps.log("inside addPolygons");

        GoogleMaps.log("initiating polygon overlay");

        function PolygonOverlay(polygon) {
            this.polygon_ = polygon;
            this.div_ = null;
            this.setMap(map);
        }

        PolygonOverlay.prototype = new google.maps.OverlayView();

        PolygonOverlay.prototype.onAdd = function () {
            let div = document.createElement('div');
            div.style.position = 'absolute';
            div.style.display = "none";
            this.div_ = div;

            let panes = this.getPanes();
            panes.overlayMouseTarget.appendChild(div);

            let me = this;
            google.maps.event.addDomListener(div, 'click', function () {
                me.hideMe();
                google.maps.event.trigger(me, 'click');
            });
        };

        PolygonOverlay.prototype.draw = function () {
            let overlayProjection = this.getProjection();

            let sw = overlayProjection.fromLatLngToDivPixel(this.polygon_.bounds.getSouthWest());
            let ne = overlayProjection.fromLatLngToDivPixel(this.polygon_.bounds.getNorthEast());

            let div = this.div_;
            div.style.left = sw.x + 'px';
            div.style.top = ne.y + 'px';
            div.style.width = (ne.x - sw.x) + 'px';
            div.style.height = (sw.y - ne.y) + 'px';
            div.style.lineHeight = div.style.height;
            div.style.textAlign = "center";
        };

        PolygonOverlay.prototype.onRemove = function () {
            this.div_.parentNode.removeChild(this.div_);
            this.div_ = null;
        };

        PolygonOverlay.prototype.showMe = function () {
            try {
                ReactDOM.render(onShowPolygonInfo(this.polygon_.data), this.div_);
            } catch (e) {
                GoogleMaps.log("error while rendering polygon data");
                GoogleMaps.log(this.polygon_.data);
            }
            if (this.div_) {
                this.div_.style.display = "block";
            }
        };

        PolygonOverlay.prototype.hideMe = function () {
            this.div_.style.display = "none";
        };

        GoogleMaps.log("initiated polygon overlay");

        let newPolygons = [];
        if (newData) {
            newData.forEach(d => {
                if (newOnes.indexOf(d.id) > -1) {
                    let paths = [];
                    d.paths.forEach(path => {
                        paths.push(google.maps.geometry.encoding.decodePath(path));
                    });

                    let polygon = new google.maps.Polygon({
                        paths: paths,
                        strokeColor: d.color ? d.color : '#FF0000',
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                        fillColor: d.color ? d.color : '#FF0000',
                        fillOpacity: 0.20,
                        map: map,
                        zIndex: d.zIndex,
                    });

                    if (editablePoligons) {
                        polygon.overlay = new PolygonOverlay(polygon, map);

                        google.maps.event.addListener(polygon, "mouseover", () => {
                            polygon.setOptions({fillOpacity: 0.40});
                            polygon.overlay.showMe();
                        });

                        google.maps.event.addListener(polygon, "mouseout", () => {
                            polygon.setOptions({fillOpacity: 0.20});
                            polygon.overlay.hideMe();
                        });

                        google.maps.event.addListener(polygon, "mousemove", () => {
                            polygon.overlay.showMe();
                        });
                    }

                    let bounds = new google.maps.LatLngBounds();
                    if (paths && paths.length > 0) {
                        paths.forEach(path => {
                            path.forEach(p => {
                                bounds.extend(p);
                            });
                        });
                    }

                    GoogleMaps.log("bounds are calculated as");
                    GoogleMaps.log(bounds.toJSON());

                    polygon.id = d.id;
                    polygon.bounds = bounds;
                    polygon.data = d;
                    newPolygons.push(polygon);
                }
            });
        }

        if (map.polygons) {
            newPolygons.forEach(p => {
                map.polygons.push(p);
            });
        } else {
            map.polygons = newPolygons;
        }
    }

    static calculatePolygonDelta(oldData, newData) {
        let od = oldData ? oldData : [];
        let nd = newData ? newData : [];

        let oldIds = od.map(d => d.id);
        let newIds = nd.map(d => d.id);

        let newOnes = _.difference(newIds, oldIds);
        let deletedOnes = _.difference(oldIds, newIds);
        let updatedOnes = [];
        for (let i = 0; i < od.length; i++) {
            for (let j = 0; j < nd.length; j++) {
                if (od[i].id == nd[j].id && od[i].color != nd[j].color && updatedOnes.indexOf(od[i].id) == -1) {
                    updatedOnes.push(od[i].id);
                }
            }
        }

        return {
            newOnes: _.concat(newOnes, updatedOnes),
            deletedOnes: _.concat(deletedOnes, updatedOnes)
        }
    }

    static updatePolygons(map, newData, onShowPolygonInfo, editablePoligons) {
        GoogleMaps.log("inside updatePolygons");

        if (map) {
            let delta = GoogleMaps.calculatePolygonDelta(map.polygonData, newData);
            GoogleMaps.log("data delta is");
            GoogleMaps.log(delta);

            // Delete deleted ones
            if (delta.deletedOnes) {
                GoogleMaps.clearPolygons(map, delta.deletedOnes);
            }

            // Insert new ones
            if (delta.newOnes) {
                GoogleMaps.addPolygons(map, delta.newOnes, newData, onShowPolygonInfo, editablePoligons);
            }

            map.oldPolygonData = map.oldPolygonData ? map.polygonData : newData;
            map.polygonData = newData;

            GoogleMaps.log("Updated polygons are:");
            GoogleMaps.log(map.polygons);
        }
    }

    static getBounds(outerPaths) {
        GoogleMaps.log("inside getBounds");

        GoogleMaps.log("outerPaths are");
        GoogleMaps.log(outerPaths);

        if (outerPaths && outerPaths.length > 0) {
            let decodedOuterPaths = outerPaths.map(outerPath => {
                return google.maps.geometry.encoding.decodePath(outerPath);
            });

            GoogleMaps.log("decoded outer paths are");
            GoogleMaps.log(decodedOuterPaths);

            let bounds = new google.maps.LatLngBounds();

            decodedOuterPaths.forEach(decodedOuterPath => {
                let decodedOuterPathBounds = new google.maps.LatLngBounds();
                decodedOuterPath.forEach(p => {
                    decodedOuterPathBounds.extend(p);
                });
                bounds.union(decodedOuterPathBounds);
            });

            GoogleMaps.log("Got bounds");
            GoogleMaps.log(bounds.toJSON());

            return bounds;
        }

        return null;
    }

    static unionBounds(bounds) {
        GoogleMaps.log("inside unionBounds");

        let combinedBounds = new google.maps.LatLngBounds();

        bounds.forEach(bound => {
            combinedBounds.union(bound);
        });

        GoogleMaps.log("Got combined bounds");
        GoogleMaps.log(combinedBounds.toJSON());

        return combinedBounds;
    }

    static drawBounds(map, bounds) {
        GoogleMaps.log("inside drawBounds");

        new google.maps.Rectangle({
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.35,
            map: map,
            bounds: bounds
        });
    }

    static clearRoutePolylines(map) {
        GoogleMaps.log("inside clearRoutePolylines");

        map.oldRoutePolylines = _.union(map.routePolylines, map.oldRoutePolylines);

        if (map.oldRoutePolylines && map.oldRoutePolylines.length > 0) {
            GoogleMaps.log("will clear " + map.oldRoutePolylines.length + " route polylines");
            map.oldRoutePolylines.forEach(pl => {
                pl.setVisible(false);
                pl.setMap(null);
            });
        }

        if (window.mapOldRoutePolylinesClearTimeout) {
            window.clearTimeout(window.mapOldRoutePolylinesClearTimeout);
        }

        window.mapOldRoutePolylinesClearTimeout = window.setTimeout(()=> {
            GoogleMaps.log("deleting old route polylines cache");
            map.oldRoutePolylines = [];
        }, 5000);
    }

    static drawRoutePolylines(map, getLegPolylineOptions) {
        GoogleMaps.log("inside drawRoutePolylines");

        GoogleMaps.clearRoutePolylines(map);

        if (map.directions) {
            let polylines = [];
            let bounds = new google.maps.LatLngBounds();
            let legs = map.directions.routes[0].legs;
            for (let i = 0; i < legs.length; i++) {
                let polylineOptions = getLegPolylineOptions ? getLegPolylineOptions(i) : null;
                if (!polylineOptions) {
                    polylineOptions = {strokeColor: "#0000FF", strokeOpacity: 1.0, strokeWeight: 5};
                }

                let polyline = new google.maps.Polyline(polylineOptions);
                let steps = legs[i].steps;
                for (let j = 0; j < steps.length; j++) {
                    let nextSegment = steps[j].path;
                    for (let k = 0; k < nextSegment.length; k++) {
                        polyline.getPath().push(nextSegment[k]);
                        bounds.extend(nextSegment[k]);
                    }
                }

                polyline.setMap(map);
                polylines.push(polyline);
            }

            map.routePolylines = polylines;
            map.getLegPolylineOptions = getLegPolylineOptions;
            GoogleMaps.fitBounds(map, bounds);
        }
    }
}