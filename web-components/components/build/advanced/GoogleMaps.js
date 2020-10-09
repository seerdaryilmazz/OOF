"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.GoogleMaps = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _reactDom = require("react-dom");

var _reactDom2 = _interopRequireDefault(_reactDom);

var _uuid = require("uuid");

var _uuid2 = _interopRequireDefault(_uuid);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GoogleMaps = exports.GoogleMaps = function () {
    function GoogleMaps() {
        _classCallCheck(this, GoogleMaps);
    }

    _createClass(GoogleMaps, null, [{
        key: "log",
        value: function log(str) {
            if (_lodash2.default.isString(str)) {
                console.log("GoogleMaps:" + str);
            } else {
                console.log(str);
            }
        }
    }, {
        key: "centerMap",
        value: function centerMap(map, position) {
            GoogleMaps.log("inside centerMap");

            if (!position) {
                GoogleMaps.log("no position available, centering to default coordinates");
                map.setCenter({ lat: 40.973678, lng: 29.253669 });
            } else {
                GoogleMaps.log("New center is " + position.lat + "," + position.lng);
                map.setCenter(position);
            }
        }
    }, {
        key: "updateMarkers",
        value: function updateMarkers(map, newData, baseImageUrl, onShowInfo, onMarkerClicked) {
            GoogleMaps.log("inside updateMarkers");
            GoogleMaps.log("new marker data is:");
            GoogleMaps.log(newData);

            GoogleMaps.clearMarkers(map);

            var markers = null;
            var types = [];
            if (newData) {
                markers = newData.map(function (d, i) {
                    var marker = new google.maps.Marker({
                        position: d.position,
                        icon: baseImageUrl + d.icon + ".png",
                        map: map
                    });

                    if (d.types && d.types.length > 0) {
                        d.types.forEach(function (type) {
                            if (types.indexOf(type) === -1) {
                                types.push(type);
                            }
                        });
                    }

                    marker.addListener('click', function () {
                        GoogleMaps.log("marker clicked");

                        if (onShowInfo) {
                            var infoWindowId = _uuid2.default.v4();
                            var infoDiv = document.createElement('div');

                            try {
                                _reactDom2.default.render(onShowInfo(d), infoDiv);
                            } catch (e) {
                                GoogleMaps.log("error while rendering info");
                                GoogleMaps.log(d);
                            }

                            map.infoWindow.setContent(infoDiv);
                            map.infoWindow.id = infoWindowId;
                            map.infoWindow.open(map, marker);
                            window.setTimeout(function () {
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
            map.types = types.length > 0 ? types.map(function (type) {
                return { name: type, selected: true };
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
    }, {
        key: "clearMarkers",
        value: function clearMarkers(map) {
            GoogleMaps.log("inside clearMarkers");

            if (map.markerCluster) {
                GoogleMaps.log("removing markers from cluster");
                map.markerCluster.clearMarkers();
            }

            map.oldMarkers = _lodash2.default.union(map.markers, map.oldMarkers);

            if (map.oldMarkers && map.oldMarkers.length > 0) {
                GoogleMaps.log("will clear " + map.oldMarkers.length + " markers");
                map.oldMarkers.forEach(function (marker) {
                    marker.setVisible(false);
                    marker.setMap(null);
                });
            }

            if (window.mapOldMarkersClearTimeout) {
                window.clearTimeout(window.mapOldMarkersClearTimeout);
            }

            window.mapOldMarkersClearTimeout = window.setTimeout(function () {
                GoogleMaps.log("deleting old markers cache");
                map.oldMarkers = [];
            }, 5000);

            map.types = null;
        }
    }, {
        key: "clearRoute",
        value: function clearRoute(map) {
            GoogleMaps.log("inside clearRoute");

            if (map && map.directionsDisplay) {
                map.directionsDisplay.setMap(null);
                map.directions = null;
                GoogleMaps.clearRoutePolylines(map);
            }
        }
    }, {
        key: "drawRoute",
        value: function drawRoute(map, route, onRouteDrawn, optimization, routeCheckFunction, customOptimization, getLegPolylineOptions) {
            GoogleMaps.log("inside drawRoute");
            GoogleMaps.log("optimization is " + optimization);
            GoogleMaps.log("custom optimization is " + customOptimization);

            if (map) {
                if (route) {
                    var start = null;
                    var end = null;
                    var waypoints = [];

                    route.forEach(function (item, index) {
                        if (index == 0) {
                            start = item.position;
                        } else if (index == route.length - 1) {
                            end = item.position;
                        } else {
                            waypoints.push({ location: item.position, stopover: true });
                        }
                    });

                    map.directionsService.route({
                        origin: start,
                        destination: end,
                        waypoints: waypoints,
                        optimizeWaypoints: optimization,
                        travelMode: 'DRIVING',
                        provideRouteAlternatives: true
                    }, function (response, status) {
                        if (status === 'OK') {
                            GoogleMaps.log("route response is");
                            GoogleMaps.log(response);

                            var routeInfo = GoogleMaps.constructRouteInfo(route, response, map, optimization, routeCheckFunction, customOptimization);
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
                                GoogleMaps.log("displaying route");
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
    }, {
        key: "redrawRoute",
        value: function redrawRoute(map) {
            if (GoogleMaps.hasDrownRoute(map)) {
                map.directionsDisplay.setDirections(map.directions);
                GoogleMaps.drawRoutePolylines(map, map.getLegPolylineOptions);
            }
        }
    }, {
        key: "findControlWithId",
        value: function findControlWithId(map, id) {
            GoogleMaps.log("inside findControlWithId");

            var controlsDiv = map.controls[google.maps.ControlPosition.TOP_RIGHT].getAt(0);

            GoogleMaps.log("controlsDiv is");
            GoogleMaps.log(controlsDiv);

            var controlId = id + map.mapId;
            var control = $(controlsDiv).find('#' + controlId);

            GoogleMaps.log("control with id " + controlId + " is");
            GoogleMaps.log(control);

            return control;
        }
    }, {
        key: "changeControlVisibility",
        value: function changeControlVisibility(map, id, val) {
            GoogleMaps.log("inside changeControlVisibility");

            var control = GoogleMaps.findControlWithId(map, id);
            control.css("display", val ? "inline" : "none");

            GoogleMaps.log("changed visibility of " + id + " to " + val);
        }
    }, {
        key: "changeTrafficVisibility",
        value: function changeTrafficVisibility(map, val) {
            GoogleMaps.changeControlVisibility(map, "ctrlTraffic", val);
        }
    }, {
        key: "changeClusteringVisibility",
        value: function changeClusteringVisibility(map, val) {
            GoogleMaps.changeControlVisibility(map, "ctrlClustering", val);
        }
    }, {
        key: "changeOptimizationVisibility",
        value: function changeOptimizationVisibility(map, val) {
            GoogleMaps.changeControlVisibility(map, "ctrlOptimization", val);
        }
    }, {
        key: "updateTypeVisibility",
        value: function updateTypeVisibility(map, type, hrefId) {
            GoogleMaps.log("inside updateTypeVisibility");

            var href = $("#" + hrefId);
            var val = href.hasClass("uk-icon-check-circle-o") ? false : true;

            GoogleMaps.log("updating visiblity of type " + type + " to " + val);

            map.types.forEach(function (mt) {
                if (mt.name == type) {
                    mt.selected = val;
                }
            });

            GoogleMaps.log("New types are");
            GoogleMaps.log(map.types);

            if (map.markers) {
                map.markers.forEach(function (marker) {
                    if (marker.types && marker.types.length > 0) {

                        var visibleCount = 0;
                        marker.types.forEach(function (markerType) {
                            var mapType = _lodash2.default.filter(map.types, function (mt) {
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
                    map.markerCluster.addMarkers(_lodash2.default.filter(map.markers, function (m) {
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
    }, {
        key: "updateTypesControl",
        value: function updateTypesControl(map) {
            GoogleMaps.log("inside updateTypesControl");

            var ctrlTypesControl = GoogleMaps.findControlWithId(map, "ctrlTypes");

            GoogleMaps.log("ctrlTypesControl is");
            GoogleMaps.log(ctrlTypesControl);

            if (ctrlTypesControl && ctrlTypesControl[0] && map.types) {
                var types = map.types.map(function (type) {
                    var hrefId = "ctrlType_a_" + _lodash2.default.snakeCase(type.name) + "_" + map.mapId;
                    return _react2.default.createElement(
                        "li",
                        null,
                        _react2.default.createElement(
                            "a",
                            { key: hrefId,
                                id: hrefId,
                                href: "javascript:void(0);",
                                className: "uk-icon uk-icon-small uk-icon-check-circle-o",
                                onClick: function onClick(e) {
                                    return GoogleMaps.updateTypeVisibility(map, type.name, hrefId);
                                } },
                            _react2.default.createElement(
                                "span",
                                { className: "uk-margin uk-margin-left md-color-grey-900" },
                                type.name
                            )
                        )
                    );
                });

                var dropDown = _react2.default.createElement(
                    "div",
                    { className: "uk-button-dropdown", "data-uk-dropdown": true },
                    _react2.default.createElement(
                        "button",
                        { className: "uk-button uk-button-mini" },
                        "Show",
                        _react2.default.createElement("i", { className: "uk-margin-left uk-icon-chevron-down" })
                    ),
                    _react2.default.createElement(
                        "div",
                        { className: "uk-dropdown uk-dropdown-small uk-dropdown-bottom", style: { width: "250px" } },
                        _react2.default.createElement(
                            "ul",
                            { className: "uk-nav uk-nav-dropdown" },
                            types
                        )
                    )
                );

                _reactDom2.default.render(dropDown, ctrlTypesControl[0]);
            }
        }
    }, {
        key: "attachControlsToMap",
        value: function attachControlsToMap(map, traffic, clustering, optimization, onOptimizationChange, baseImageUrl) {
            GoogleMaps.log("inside attachControlsToMap");

            var className = "uk-margin-small-right uk-border-rounded uk-block-default";
            var style = { padding: "3px" };

            var controls = _react2.default.createElement(
                "div",
                { className: "uk-margin-small-top" },
                _react2.default.createElement("div", { id: "ctrlTypes" + map.mapId, style: _lodash2.default.merge({ display: "inline" }, style) }),
                _react2.default.createElement(
                    "label",
                    { id: "ctrlTraffic" + map.mapId, className: className, style: style },
                    _react2.default.createElement("input", { type: "checkbox", ref: function ref(input) {
                            return map.trafficCheckbox = input;
                        } }),
                    "Traffic"
                ),
                _react2.default.createElement(
                    "label",
                    { id: "ctrlClustering" + map.mapId, className: className, style: style },
                    _react2.default.createElement("input", { type: "checkbox", ref: function ref(input) {
                            return map.clusteringCheckbox = input;
                        } }),
                    "Clustering"
                ),
                _react2.default.createElement(
                    "label",
                    { id: "ctrlOptimization" + map.mapId, className: className, style: style },
                    _react2.default.createElement("input", { type: "checkbox", ref: function ref(input) {
                            return map.optimizationCheckbox = input;
                        } }),
                    "Optimization"
                )
            );

            var controlsDiv = document.createElement('div');
            _reactDom2.default.render(controls, controlsDiv, function () {
                GoogleMaps.updateTypesControl(map);
            });
            map.controls[google.maps.ControlPosition.TOP_RIGHT].push(controlsDiv);

            $(map.trafficCheckbox).on('change', function () {
                GoogleMaps.log("inside jquery trafficCheckbox change");
                GoogleMaps.onTrafficChange(map);
            });
            $(map.trafficCheckbox).prop('checked', traffic);
            map.traffic = function (val) {
                if (val) {
                    $(map.trafficCheckbox).prop('checked', val);
                } else {
                    return $(map.trafficCheckbox).prop('checked');
                }
            };

            $(map.clusteringCheckbox).on('change', function () {
                GoogleMaps.log("inside jquery clusteringCheckbox change");
                GoogleMaps.onClusteringChange(map);
            });
            $(map.clusteringCheckbox).prop('checked', clustering);
            map.clustering = function (val) {
                if (val) {
                    $(map.clusteringCheckbox).prop('checked', val);
                } else {
                    return $(map.clusteringCheckbox).prop('checked');
                }
            };

            $(map.optimizationCheckbox).on('change', function () {
                GoogleMaps.log("inside jquery optimizationCheckbox change");
                onOptimizationChange();
            });
            $(map.optimizationCheckbox).prop('checked', optimization);
            map.optimization = function (val) {
                if (val) {
                    $(map.optimizationCheckbox).prop('checked', val);
                } else {
                    return $(map.optimizationCheckbox).prop('checked');
                }
            };

            GoogleMaps.addClusteringToMap(map, clustering, baseImageUrl);
        }
    }, {
        key: "addClusteringToMap",
        value: function addClusteringToMap(map, clustering, baseImageUrl) {
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
                window.setTimeout(function () {
                    GoogleMaps.log("clustering function not yet loaded. Will retry");
                    GoogleMaps.addClusteringToMap(map, clustering, baseImageUrl);
                }, 1000);
            }
        }
    }, {
        key: "resizeMap",
        value: function resizeMap(map) {
            GoogleMaps.log("inside resizeMap");

            google.maps.event.trigger(map, "resize");
        }
    }, {
        key: "isOrdered",
        value: function isOrdered(arr) {
            for (var i = 0; i < arr.length - 1; i++) {
                if (arr[i] > arr[i + 1]) {
                    return false;
                }
            }

            return true;
        }
    }, {
        key: "constructRouteInfo",
        value: function constructRouteInfo(routeData, response, map, optimization, routeCheckFunction, customOptimization) {
            GoogleMaps.log("inside constructRouteInfo");

            var calculatedRouteInfos = [];

            if (response && response.routes && response.routes.length > 0) {
                response.routes.forEach(function (route) {
                    if (route.legs && route.legs.length > 0) {
                        var distance = 0;
                        var duration = 0;

                        GoogleMaps.log("legs are:");
                        GoogleMaps.log(route.legs);

                        var legs = [];

                        route.legs.forEach(function (leg) {
                            var legDistance = leg.distance && leg.distance.value ? leg.distance.value : 0;
                            var legDuration = leg.duration && leg.duration.value ? leg.duration.value : 0;

                            distance += legDistance;
                            duration += legDuration;

                            legs.push({
                                distance: GoogleMaps.splitToMeasures(legDistance, map.distanceMeasures),
                                duration: GoogleMaps.splitToMeasures(legDuration, map.durationMeasures),
                                distanceValue: legDistance,
                                durationValue: legDuration
                            });
                        });

                        var orderedRoute = null;
                        if (optimization && route.waypoint_order && !GoogleMaps.isOrdered(route.waypoint_order) || customOptimization) {
                            orderedRoute = [routeData[0]];
                            route.waypoint_order.forEach(function (wo) {
                                orderedRoute.push(routeData[wo + 1]);
                            });
                            orderedRoute.push(routeData[routeData.length - 1]);
                        }

                        var isRouteValid = orderedRoute ? routeCheckFunction(orderedRoute) : true;

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

            for (var i = 0; i < calculatedRouteInfos.length; i++) {
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
    }, {
        key: "createMap",
        value: function createMap(mapId, center, baseImageUrl, markCurrentPosition, onResize) {
            GoogleMaps.log("inside createMap");

            var mapProps = {
                zoom: 10,
                disableDefaultUI: true
            };

            if (center) {
                _lodash2.default.merge(mapProps, { center: center });
            }

            var map = new google.maps.Map(document.getElementById(mapId), mapProps);
            map.mapId = mapId;

            if (markCurrentPosition) {
                try {
                    GoogleMaps.log("adding current position");

                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(function (position) {
                            var pos = {
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
                                }
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
            map.addListener('click', function () {
                map.infoWindow.close();
            });

            map.trafficLayer = new google.maps.TrafficLayer();

            map.directionsService = new google.maps.DirectionsService();
            map.directionsDisplay = new google.maps.DirectionsRenderer({
                draggable: false,
                suppressPolylines: true
            });

            map.distanceMeasures = [{
                display: "km",
                unit: 1000,
                show: true
            }, {
                display: "m",
                unit: 1,
                show: false
            }];

            map.durationMeasures = [{
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
            }];

            if (onResize) {
                google.maps.event.addListener(map, 'bounds_changed', function () {
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
    }, {
        key: "splitToMeasures",
        value: function splitToMeasures(val, measures) {
            if (!val) {
                return;
            }

            var div = 0;
            var rem = val;
            var result = [];
            measures.forEach(function (measure) {
                div = Math.floor(rem / measure.unit);

                if (div > 0 && measure.show) {
                    result.push(div + " " + measure.display);
                }

                rem = rem % measure.unit;
            });

            return _lodash2.default.join(result, ' ');
        }
    }, {
        key: "isScriptLoaded",
        value: function isScriptLoaded(url) {
            GoogleMaps.log("inside isScriptLoaded");

            var scripts = document.getElementsByTagName('script');

            for (var i = 0; i < scripts.length; i++) {
                if (scripts[i].src.indexOf(url) != -1) {
                    return true;
                }
            }

            return false;
        }
    }, {
        key: "addScript",
        value: function addScript(urlCheck, url, async, defer) {
            GoogleMaps.log("inside addScript");

            if (!GoogleMaps.isScriptLoaded(urlCheck)) {

                GoogleMaps.log("adding script " + url);

                var script = document.createElement('script');
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
    }, {
        key: "addScripts",
        value: function addScripts(key, initFunctionName, initFunction) {
            GoogleMaps.log("inside addScripts");
            GoogleMaps.log("base resource url is " + window.baseResourceUrl);

            var googleMapsBaseScriptUrl = 'https://maps.googleapis.com/maps/api/js';
            var googleMapsScriptUrl = googleMapsBaseScriptUrl + "?libraries=geometry&key=" + key + "&callback=" + initFunctionName;
            var markerClustererJsUrl = window.baseResourceUrl + "/assets/js/markerclusterer.js";

            var callInitFunction = false;

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
    }, {
        key: "onTrafficChange",
        value: function onTrafficChange(map) {
            GoogleMaps.log("inside onTrafficChange");

            if (map.traffic()) {
                map.trafficLayer.setMap(map);
            } else {
                map.trafficLayer.setMap(null);
            }
        }
    }, {
        key: "onClusteringChange",
        value: function onClusteringChange(map) {
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
    }, {
        key: "registerResize",
        value: function registerResize(map) {
            var mapElement = document.getElementById(map.mapId);
            if (map.prevMapWidth != mapElement.offsetWidth || map.prevMapHeight != mapElement.offsetHeight) {
                GoogleMaps.log("resizing map");
                map.prevMapWidth = mapElement.offsetWidth;
                map.prevMapHeight = mapElement.offsetHeight;
                GoogleMaps.resizeMap(map);
            }

            window.setTimeout(function () {
                GoogleMaps.registerResize(map);
            }, 1000);
        }
    }, {
        key: "fitToSeeAllMarkers",
        value: function fitToSeeAllMarkers(map) {
            GoogleMaps.log("inside fitToSeeAllMarkers");

            if (map.markers && map.markers.length > 0) {
                if (map.markers.length == 1) {
                    GoogleMaps.centerMap(map, map.markers[0].getPosition());
                } else {
                    var bounds = new google.maps.LatLngBounds();
                    for (var i = 0; i < map.markers.length; i++) {
                        bounds.extend(map.markers[i].getPosition());
                    }

                    GoogleMaps.fitBounds(map, bounds);
                }
            }
        }
    }, {
        key: "fitBounds",
        value: function fitBounds(map, bounds) {
            if (map && bounds) {
                GoogleMaps.log("fitting bounds");
                GoogleMaps.log(bounds.toJSON());
                map.fitBounds(bounds);
            }
        }
    }, {
        key: "hasDrownRoute",
        value: function hasDrownRoute(map) {
            return map && map.directionsDisplay && map.directionsDisplay.getMap() && map.directions;
        }
    }, {
        key: "calculateDistanceMatrix",
        value: function calculateDistanceMatrix(origins, destinations, callbackFn) {
            GoogleMaps.log("inside calculateDistanceMatrix");

            if (origins && origins.length > 0 && destinations && destinations.length > 0) {
                var service = new google.maps.DistanceMatrixService();
                service.getDistanceMatrix({
                    origins: origins,
                    destinations: destinations,
                    travelMode: 'DRIVING',
                    unitSystem: google.maps.UnitSystem.METRIC
                }, function (response, status) {
                    GoogleMaps.log("distance matrix result is");
                    GoogleMaps.log(response);
                    callbackFn(response);
                });
            }
        }
    }, {
        key: "calculateRouteDistanceMatrix",
        value: function calculateRouteDistanceMatrix(route, callbackFn) {
            GoogleMaps.log("inside calculateRouteDistanceMatrix");

            if (route && route.length > 0) {
                var points = route.map(function (data) {
                    return data.position;
                });

                GoogleMaps.log("points are");
                GoogleMaps.log(points);

                GoogleMaps.calculateDistanceMatrix(points, points, callbackFn);
            }
        }
    }, {
        key: "calculateDistance",
        value: function calculateDistance(perm, distanceMatrix) {
            var distance = 0;
            for (var i = 0; i < perm.length - 1; i++) {
                distance += distanceMatrix.rows[perm[i]].elements[perm[i + 1]].distance.value;
            }
            return distance;
        }
    }, {
        key: "findShortestRoute",
        value: function findShortestRoute(dataList, routeCheckFunction, callbackFn) {
            GoogleMaps.log("inside findShortestRoute");

            if (dataList && dataList.length > 3 && dataList.length < 9) {
                GoogleMaps.calculateRouteDistanceMatrix(dataList, function (distanceMatrix) {
                    var poss = [];
                    for (var i = 1; i < dataList.length - 1; i++) {
                        poss.push(i);
                    }

                    var perms = GoogleMaps.permutator(poss);

                    var minDistance = Number.MAX_VALUE;
                    var selectedList = null;

                    perms.forEach(function (perm) {
                        perm.unshift(0);
                        perm.push(dataList.length - 1);

                        var list = perm.map(function (p) {
                            return dataList[p];
                        });

                        var valid = routeCheckFunction(list);

                        if (valid) {
                            var distance = GoogleMaps.calculateDistance(perm, distanceMatrix);

                            if (distance < minDistance) {
                                minDistance = distance;
                                selectedList = list;
                            }
                        }
                    });

                    var eq = _lodash2.default.isEqual(selectedList, dataList);
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
    }, {
        key: "permutator",
        value: function permutator(inputArr) {
            var results = [];

            function permute(arr, pmemo) {
                var cur = void 0,
                    memo = pmemo || [];

                for (var i = 0; i < arr.length; i++) {
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
    }, {
        key: "clearPolygons",
        value: function clearPolygons(map, polygonIds) {
            GoogleMaps.log("inside clearPolygons");

            var polygonsToClear = _lodash2.default.remove(map.polygons, function (p) {
                return polygonIds.indexOf(p.id) > -1;
            });

            map.oldPolygons = _lodash2.default.union(polygonsToClear, map.oldPolygons);

            if (map.oldPolygons && map.oldPolygons.length > 0) {
                GoogleMaps.log("will clear " + map.oldPolygons.length + " polygons");
                map.oldPolygons.forEach(function (polygon) {
                    polygon.setVisible(false);
                    polygon.setMap(null);
                });
            }

            if (window.mapOldPolygonsClearTimeout) {
                window.clearTimeout(window.mapOldPolygonsClearTimeout);
            }

            window.mapOldPolygonsClearTimeout = window.setTimeout(function () {
                GoogleMaps.log("deleting old polygons cache");
                map.oldPolygons = [];
            }, 5000);
        }
    }, {
        key: "addPolygons",
        value: function addPolygons(map, newOnes, newData, onShowPolygonInfo, editablePoligons) {
            GoogleMaps.log("inside addPolygons");

            GoogleMaps.log("initiating polygon overlay");

            function PolygonOverlay(polygon) {
                this.polygon_ = polygon;
                this.div_ = null;
                this.setMap(map);
            }

            PolygonOverlay.prototype = new google.maps.OverlayView();

            PolygonOverlay.prototype.onAdd = function () {
                var div = document.createElement('div');
                div.style.position = 'absolute';
                div.style.display = "none";
                this.div_ = div;

                var panes = this.getPanes();
                panes.overlayMouseTarget.appendChild(div);

                var me = this;
                google.maps.event.addDomListener(div, 'click', function () {
                    me.hideMe();
                    google.maps.event.trigger(me, 'click');
                });
            };

            PolygonOverlay.prototype.draw = function () {
                var overlayProjection = this.getProjection();

                var sw = overlayProjection.fromLatLngToDivPixel(this.polygon_.bounds.getSouthWest());
                var ne = overlayProjection.fromLatLngToDivPixel(this.polygon_.bounds.getNorthEast());

                var div = this.div_;
                div.style.left = sw.x + 'px';
                div.style.top = ne.y + 'px';
                div.style.width = ne.x - sw.x + 'px';
                div.style.height = sw.y - ne.y + 'px';
                div.style.lineHeight = div.style.height;
                div.style.textAlign = "center";
            };

            PolygonOverlay.prototype.onRemove = function () {
                this.div_.parentNode.removeChild(this.div_);
                this.div_ = null;
            };

            PolygonOverlay.prototype.showMe = function () {
                try {
                    _reactDom2.default.render(onShowPolygonInfo(this.polygon_.data), this.div_);
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

            var newPolygons = [];
            if (newData) {
                newData.forEach(function (d) {
                    if (newOnes.indexOf(d.id) > -1) {
                        var paths = [];
                        d.paths.forEach(function (path) {
                            paths.push(google.maps.geometry.encoding.decodePath(path));
                        });

                        var polygon = new google.maps.Polygon({
                            paths: paths,
                            strokeColor: d.color ? d.color : '#FF0000',
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                            fillColor: d.color ? d.color : '#FF0000',
                            fillOpacity: 0.20,
                            map: map,
                            zIndex: d.zIndex
                        });

                        if (editablePoligons) {
                            polygon.overlay = new PolygonOverlay(polygon, map);

                            google.maps.event.addListener(polygon, "mouseover", function () {
                                polygon.setOptions({ fillOpacity: 0.40 });
                                polygon.overlay.showMe();
                            });

                            google.maps.event.addListener(polygon, "mouseout", function () {
                                polygon.setOptions({ fillOpacity: 0.20 });
                                polygon.overlay.hideMe();
                            });

                            google.maps.event.addListener(polygon, "mousemove", function () {
                                polygon.overlay.showMe();
                            });
                        }

                        var bounds = new google.maps.LatLngBounds();
                        if (paths && paths.length > 0) {
                            paths.forEach(function (path) {
                                path.forEach(function (p) {
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
                newPolygons.forEach(function (p) {
                    map.polygons.push(p);
                });
            } else {
                map.polygons = newPolygons;
            }
        }
    }, {
        key: "calculatePolygonDelta",
        value: function calculatePolygonDelta(oldData, newData) {
            var od = oldData ? oldData : [];
            var nd = newData ? newData : [];

            var oldIds = od.map(function (d) {
                return d.id;
            });
            var newIds = nd.map(function (d) {
                return d.id;
            });

            var newOnes = _lodash2.default.difference(newIds, oldIds);
            var deletedOnes = _lodash2.default.difference(oldIds, newIds);
            var updatedOnes = [];
            for (var i = 0; i < od.length; i++) {
                for (var j = 0; j < nd.length; j++) {
                    if (od[i].id == nd[j].id && od[i].color != nd[j].color && updatedOnes.indexOf(od[i].id) == -1) {
                        updatedOnes.push(od[i].id);
                    }
                }
            }

            return {
                newOnes: _lodash2.default.concat(newOnes, updatedOnes),
                deletedOnes: _lodash2.default.concat(deletedOnes, updatedOnes)
            };
        }
    }, {
        key: "updatePolygons",
        value: function updatePolygons(map, newData, onShowPolygonInfo, editablePoligons) {
            GoogleMaps.log("inside updatePolygons");

            if (map) {
                var delta = GoogleMaps.calculatePolygonDelta(map.polygonData, newData);
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
    }, {
        key: "getBounds",
        value: function getBounds(outerPaths) {
            GoogleMaps.log("inside getBounds");

            GoogleMaps.log("outerPaths are");
            GoogleMaps.log(outerPaths);

            if (outerPaths && outerPaths.length > 0) {
                var decodedOuterPaths = outerPaths.map(function (outerPath) {
                    return google.maps.geometry.encoding.decodePath(outerPath);
                });

                GoogleMaps.log("decoded outer paths are");
                GoogleMaps.log(decodedOuterPaths);

                var bounds = new google.maps.LatLngBounds();

                decodedOuterPaths.forEach(function (decodedOuterPath) {
                    var decodedOuterPathBounds = new google.maps.LatLngBounds();
                    decodedOuterPath.forEach(function (p) {
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
    }, {
        key: "unionBounds",
        value: function unionBounds(bounds) {
            GoogleMaps.log("inside unionBounds");

            var combinedBounds = new google.maps.LatLngBounds();

            bounds.forEach(function (bound) {
                combinedBounds.union(bound);
            });

            GoogleMaps.log("Got combined bounds");
            GoogleMaps.log(combinedBounds.toJSON());

            return combinedBounds;
        }
    }, {
        key: "drawBounds",
        value: function drawBounds(map, bounds) {
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
    }, {
        key: "clearRoutePolylines",
        value: function clearRoutePolylines(map) {
            GoogleMaps.log("inside clearRoutePolylines");

            map.oldRoutePolylines = _lodash2.default.union(map.routePolylines, map.oldRoutePolylines);

            if (map.oldRoutePolylines && map.oldRoutePolylines.length > 0) {
                GoogleMaps.log("will clear " + map.oldRoutePolylines.length + " route polylines");
                map.oldRoutePolylines.forEach(function (pl) {
                    pl.setVisible(false);
                    pl.setMap(null);
                });
            }

            if (window.mapOldRoutePolylinesClearTimeout) {
                window.clearTimeout(window.mapOldRoutePolylinesClearTimeout);
            }

            window.mapOldRoutePolylinesClearTimeout = window.setTimeout(function () {
                GoogleMaps.log("deleting old route polylines cache");
                map.oldRoutePolylines = [];
            }, 5000);
        }
    }, {
        key: "drawRoutePolylines",
        value: function drawRoutePolylines(map, getLegPolylineOptions) {
            GoogleMaps.log("inside drawRoutePolylines");

            GoogleMaps.clearRoutePolylines(map);

            if (map.directions) {
                var polylines = [];
                var bounds = new google.maps.LatLngBounds();
                var legs = map.directions.routes[0].legs;
                for (var i = 0; i < legs.length; i++) {
                    var polylineOptions = getLegPolylineOptions ? getLegPolylineOptions(i) : null;
                    if (!polylineOptions) {
                        polylineOptions = { strokeColor: "#0000FF", strokeOpacity: 1.0, strokeWeight: 5 };
                    }

                    var polyline = new google.maps.Polyline(polylineOptions);
                    var steps = legs[i].steps;
                    for (var j = 0; j < steps.length; j++) {
                        var nextSegment = steps[j].path;
                        for (var k = 0; k < nextSegment.length; k++) {
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
    }]);

    return GoogleMaps;
}();