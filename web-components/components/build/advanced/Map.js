"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Map = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _uuid = require("uuid");

var _uuid2 = _interopRequireDefault(_uuid);

var _GoogleMaps = require("./GoogleMaps");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Map = exports.Map = function (_React$Component) {
    _inherits(Map, _React$Component);

    _createClass(Map, [{
        key: "log",
        value: function log(str) {
            //console.log(str);
        }
    }]);

    function Map(props) {
        _classCallCheck(this, Map);

        var _this = _possibleConstructorReturn(this, (Map.__proto__ || Object.getPrototypeOf(Map)).call(this, props));

        _this.log("inside constructor");

        _this.id = (props.id ? props.id : _uuid2.default.v4()).replace(/-/g, '');
        _this.mapId = "map" + _this.id;
        _this.initFunctionName = 'initMap' + _this.id;

        _this.baseImageUrl = window.baseResourceUrl + '/assets/img/map/';
        return _this;
    }

    _createClass(Map, [{
        key: "componentWillReceiveProps",
        value: function componentWillReceiveProps(nextProps) {
            if (!this.map) {
                return;
            }

            this.log("inside componentWillReceiveProps");

            var newWidth = nextProps.width;
            var oldWidth = this.props.width;
            if (!_.isEqual(newWidth, oldWidth)) {
                this.log("props.width changed. resizing map.");
                _GoogleMaps.GoogleMaps.resizeMap(this.map);
            }

            var newHeight = nextProps.height;
            var oldHeight = this.props.height;
            if (!_.isEqual(newHeight, oldHeight)) {
                this.log("props.height changed. resizing map.");
                _GoogleMaps.GoogleMaps.resizeMap(this.map);
            }

            var newCenter = nextProps.center;
            var oldCenter = this.props.center;
            if (!_.isEqual(newCenter, oldCenter)) {
                this.log("props.center changed. centering map.");
                _GoogleMaps.GoogleMaps.centerMap(this.map, newCenter);
            }

            var newData = nextProps.data;
            var oldData = this.props.data;
            var data_no = _.differenceBy(newData, oldData, function (d) {
                return d.id;
            });
            var data_on = _.differenceBy(oldData, newData, function (d) {
                return d.id;
            });
            if (data_no.length > 0 || data_on.length > 0) {
                this.log("props.data changed. updating data.");
                _GoogleMaps.GoogleMaps.updateMarkers(this.map, newData, this.baseImageUrl, nextProps.onShowInfo, nextProps.onMarkerClicked);
            }

            var newTraffic = nextProps.traffic;
            var oldTraffic = this.props.traffic;
            if (!_.isEqual(newTraffic, oldTraffic)) {
                this.log("props.traffic changed. updating traffic.");
                this.map.traffic(newTraffic);
            }

            var newClustering = nextProps.clustering;
            var oldClustering = this.props.clustering;
            if (!_.isEqual(newClustering, oldClustering)) {
                this.log("props.clustering changed. updating clustering.");
                this.map.clustering(newClustering);
            }

            var newOptimization = nextProps.optimization;
            var oldOptimization = this.props.optimization;
            if (!_.isEqual(newOptimization, oldOptimization)) {
                this.log("props.optimization changed. updating optimization.");
                this.map.optimization(newOptimization);
            }

            var newRouteDrawRequestTime = nextProps.routeDrawRequestTime;
            var oldRouteDrawRequestTime = this.props.routeDrawRequestTime;
            if (!_.isEqual(newRouteDrawRequestTime, oldRouteDrawRequestTime)) {
                this.log("props.routeDrawRequestTime changed. drawing route.");
                if (newRouteDrawRequestTime == -1) {
                    _GoogleMaps.GoogleMaps.clearRoute(this.map);
                } else {
                    _GoogleMaps.GoogleMaps.drawRoute(this.map, nextProps.route, nextProps.onRouteDrawn, this.map.optimization(), nextProps.routeCheckFunction, false, this.props.getLegPolylineOptions);
                }
            }

            var newPolygonData = nextProps.polygonData;
            var oldPolygonData = this.props.polygonData;
            if (!_.isEqual(newPolygonData, oldPolygonData)) {
                this.log("props.polygonData changed. updating polygonData.");
                _GoogleMaps.GoogleMaps.updatePolygons(this.map, newPolygonData, this.props.onShowPolygonInfo, this.props.editablePoligons);
            }

            var newShowTraffic = nextProps.showTraffic;
            var oldShowTraffic = this.props.showTraffic;
            if (!_.isEqual(newShowTraffic, oldShowTraffic)) {
                this.log("props.showTraffic changed. updating showTraffic.");
                _GoogleMaps.GoogleMaps.changeTrafficVisibility(this.map, newShowTraffic);
            }

            var newShowClustering = nextProps.showClustering;
            var oldShowClustering = this.props.showClustering;
            if (!_.isEqual(newShowClustering, oldShowClustering)) {
                this.log("props.showClustering changed. updating showClustering.");
                _GoogleMaps.GoogleMaps.changeClusteringVisibility(this.map, newShowClustering);
            }

            var newShowOptimization = nextProps.showOptimization;
            var oldShowOptimization = this.props.showOptimization;
            if (!_.isEqual(newShowOptimization, oldShowOptimization)) {
                this.log("props.showOptimization changed. updating showOptimization.");
                _GoogleMaps.GoogleMaps.changeOptimizationVisibility(this.map, newShowOptimization);
            }
        }
    }, {
        key: "componentDidMount",
        value: function componentDidMount() {
            var _this2 = this;

            this.log("inside componentDidMount");
            _GoogleMaps.GoogleMaps.addScripts(this.props.key, this.initFunctionName, function () {
                _this2.initMap();
            });
        }
    }, {
        key: "initMap",
        value: function initMap() {
            var _this3 = this;

            this.log("inside initMap");

            this.map = _GoogleMaps.GoogleMaps.createMap(this.mapId, this.props.center, this.baseImageUrl, this.props.markCurrentPosition, this.props.onResize);
            _GoogleMaps.GoogleMaps.attachControlsToMap(this.map, this.props.traffic, this.props.clustering, this.props.optimization, function () {
                _this3.onOptimizationChange();
            }, this.baseImageUrl);
            _GoogleMaps.GoogleMaps.changeTrafficVisibility(this.map, this.props.showTraffic);
            _GoogleMaps.GoogleMaps.changeClusteringVisibility(this.map, this.props.showClustering);
            _GoogleMaps.GoogleMaps.changeOptimizationVisibility(this.map, this.props.showOptimization);
            _GoogleMaps.GoogleMaps.updateMarkers(this.map, this.props.data, this.baseImageUrl, this.props.onShowInfo, this.props.onMarkerClicked);
            _GoogleMaps.GoogleMaps.updatePolygons(this.map, this.props.polygonData, this.props.onShowPolygonInfo, this.props.editablePoligons);
        }
    }, {
        key: "onOptimizationChange",
        value: function onOptimizationChange() {
            this.log("inside onOptimizationChange");

            if (_GoogleMaps.GoogleMaps.hasDrownRoute(this.map)) {
                _GoogleMaps.GoogleMaps.drawRoute(this.map, this.props.route, this.props.onRouteDrawn, this.map.optimization(), this.props.routeCheckFunction, false, this.props.getLegPolylineOptions);
            }

            this.props.onOptimizationChange();
        }
    }, {
        key: "calculateDistanceMatrix",
        value: function calculateDistanceMatrix(origins, destinations, callbackFn) {
            _GoogleMaps.GoogleMaps.calculateDistanceMatrix(origins, destinations, callbackFn);
        }
    }, {
        key: "getBounds",
        value: function getBounds(outerPaths) {
            return _GoogleMaps.GoogleMaps.getBounds(outerPaths);
        }
    }, {
        key: "unionBounds",
        value: function unionBounds(bounds) {
            return _GoogleMaps.GoogleMaps.unionBounds(bounds);
        }
    }, {
        key: "fitBounds",
        value: function fitBounds(bounds) {
            _GoogleMaps.GoogleMaps.fitBounds(this.map, bounds);
        }
    }, {
        key: "drawBounds",
        value: function drawBounds(bounds) {
            _GoogleMaps.GoogleMaps.drawBounds(this.map, bounds);
        }
    }, {
        key: "render",
        value: function render() {
            this.log("inside render");

            return _react2.default.createElement("div", { key: this.id, id: this.mapId,
                style: { width: this.props.width, height: this.props.height } });
        }
    }]);

    return Map;
}(_react2.default.Component);