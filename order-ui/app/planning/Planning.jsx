import * as axios from 'axios';
import _ from "lodash";
import React from "react";
import { Map } from "susam-components/advanced";
import { Notify } from "susam-components/basic";
import { Grid, GridCell, Page } from "susam-components/layout";
import { ShipmentAssignmentPlanningService, TripService, VehicleService, WarehouseService } from "../services";
import { DisplayMode } from "./DisplayMode";
import { Route } from "./Route";
import { SegmentTable } from "./SegmentTable";
import { Summary } from "./Summary";

export class Planning extends React.Component {

    constructor(props) {
        super(props);

        this.moment = require("moment");

        this.OP_TYPE_LOAD = "LOAD";
        this.OP_TYPE_UNLOAD = "UNLOAD";

        this.LOCATION_TYPE_CUSTOMER = "CUSTOMER";
        this.LOCATION_TYPE_WAREHOUSE = "WAREHOUSE";
        this.LOCATION_TYPE_TRAILER = "TRAILER";

        this.state = {
            currentData: [],
            currentSegments: [],
            selectedData: [],
            selectedRows: [],
            routeDrawRequestTime: null,
            routeInfo: null,
            mapWidth: "100%",
            mapHeight: 328,
            displayMode: "E", /* EQUAL: E, LEFT: L, RIGHT: R */
            warehouses: [],
            trailers: [],
            shipmentsFullScreen: false,
            loadPageFor: this.props ? this.props.loadPageFor : null
        };
    }

    static TYPE_COL_DIST = "COLLECION/DISTRIBUTION";
    static TYPE_LINEHAUL = "LINEHAUL";
    static TYPE_FTL = "FTL";

    isPageRequestedAsColDist() {
        return this.state.loadPageFor && this.state.loadPageFor == Planning.TYPE_COL_DIST;
    }

    isPageRequestedAsLinehaul() {
        return this.state.loadPageFor && this.state.loadPageFor == Planning.TYPE_LINEHAUL;
    }

    isPageRequestedAsFTL() {
        return this.state.loadPageFor && this.state.loadPageFor == Planning.TYPE_FTL;
    }


    componentWillMount() {
        axios.all([WarehouseService.retrieveWarehouses(), VehicleService.allTrailers(), this.fetchMyShipmentSegments()])
            .then(axios.spread((warehouses, trailers, shipmentSegments) => {
                let state = _.cloneDeep(this.state);
                state.warehouses = warehouses.data;
                state.trailers = trailers.data;

                let combinedData = [];
                if (shipmentSegments.data) {
                    shipmentSegments.data.forEach(shipmentsegment => {
                        combinedData.push(this.setShipmentDetails(shipmentsegment));
                    });
                }
                combinedData.forEach(item => {
                    item._key = item.id
                });
                state.currentData = this.setIconsAndTypes(this.extractDataList(combinedData));
                state.currentSegments = combinedData;

                this.setState(state);
            })).catch((error) => {
            Notify.showError(error);
        });
    }

    fetchMyShipmentSegments() {
        if(this.isPageRequestedAsColDist()) {
            return ShipmentAssignmentPlanningService.getMyColDistShipmentSegments();
        } else  if(this.isPageRequestedAsLinehaul()) {
            return ShipmentAssignmentPlanningService.getMyLinehaulShipmentSegments();
        } else  if(this.isPageRequestedAsFTL()) {
            return ShipmentAssignmentPlanningService.getMyFTLShipmentSegments();
        } else {
            return ShipmentAssignmentPlanningService.getMyShipmentSegments();
        }
    }

    getUniqueLocationId(locationType, locationId) {
        return locationType && locationId ? locationType + "_" + locationId : null;
    }

    isLocationValid(location) {
        let valid = location && location.id && location.name && location.location && location.location.lat && location.location.lon && location.type;

        if (!valid) {
            console.log("invalid location");
        }

        return valid;
    }

    setIndexes(dataList) {
        if (dataList && dataList.length > 0) {
            for (let i = 0; i < dataList.length; i++) {
                dataList[i].index = i;
            }
        }

        return dataList;
    }

    setIconsAndTypes(dataList) {
        if (dataList && dataList.length > 0) {
            dataList.forEach(data => {
                if (data.info.type == this.LOCATION_TYPE_CUSTOMER) {
                    let loads = 0, unloads = 0;

                    if (data.ops && data.ops.length > 0) {
                        data.ops.forEach(op => {
                            if (op.opType.id == this.OP_TYPE_LOAD) {
                                loads++;
                            } else if (op.opType.id == this.OP_TYPE_UNLOAD) {
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
                } else if (data.info.type == this.LOCATION_TYPE_WAREHOUSE) {
                    data.icon = "warehouse";
                    data.types = ["Warehouses"];
                } else if (data.info.type == this.LOCATION_TYPE_TRAILER) {
                    data.icon = "trailer";
                    data.types = ["Trailers"];
                }
            });
        }

        return this.setIndexes(dataList);
    }

    convertLocationToData(location, segment, opType) {
        if (this.isLocationValid(location)) {

            let result = {
                id: this.getUniqueLocationId(location.type, location.id),
                info: _.cloneDeep(location),
            };

            result.ops = [];
            if (segment && opType) {
                let shipment = _.cloneDeep(segment.shipment);
                result.ops.push({
                    opType: opType,
                    segmentId: segment.id,
                    shipment: shipment
                });
            }

            result.position = {
                lat: location.location.lat,
                lng: location.location.lon
            };

            return result;
        }

        return null;
    }

    findDataFromId(dataList, id) {
        if (dataList && dataList.length > 0 && id) {
            let found = _.filter(dataList, d => {
                return d.id == id;
            });

            if (found && found.length > 0) {
                return found[0];
            }
        }

        return null;
    }

    findDataFromLocation(dataList, locationType, locationId) {
        return this.findDataFromId(dataList, this.getUniqueLocationId(locationType, locationId));
    }

    addShipmentToData(data, segment, opType) {
        if (data && segment && opType) {
            let foundShipment = _.filter(data.ops, o => {
                return o.opType.id == opType.id && o.shipment.id == segment.shipment.id
            });

            if (!foundShipment || foundShipment.length == 0) {
                let shipment = _.cloneDeep(segment.shipment);
                data.ops.push({
                    opType: opType,
                    segmentId: segment.id,
                    shipment: shipment
                });
            }
        }
    }

    addShipment(dataList, segment, preventDuplicate) {
        if (dataList && segment) {

            if (preventDuplicate && dataList.filter(d => d.ops.filter(o => (o.shipment.id == segment.shipment.id)).length > 0).length > 0) {
                Notify.showError("Shipment '" + segment.shipment.id + "' already selected. Shipment can not be selected again from different segment.");
                return false;
            }
            let from = segment.fromLocation;
            let to = segment.toLocation;

            if (from && this.isLocationValid(from) && to && this.isLocationValid(to)) {
                let fromData = this.findDataFromLocation(dataList, from.type, from.id);
                let toData = this.findDataFromLocation(dataList, to.type, to.id);

                if (fromData) {
                    this.addShipmentToData(fromData, segment, {id: this.OP_TYPE_LOAD});
                } else {
                    dataList.push(this.convertLocationToData(from, segment, {id: this.OP_TYPE_LOAD}));
                }

                if (toData) {
                    this.addShipmentToData(toData, segment, {id: this.OP_TYPE_UNLOAD});
                } else {
                    dataList.push(this.convertLocationToData(to, segment, {id: this.OP_TYPE_UNLOAD}));
                }
            }

            this.initializeDatesDataStructuresForDefaultValuesAndValidation(dataList);
            this.adjustPlannedDates(dataList);
            return true;
        }
    }

    cleanDataList(dataList) {
        _.remove(dataList, d => {
            return (d.info.type == this.LOCATION_TYPE_CUSTOMER || d.info.type == this.LOCATION_TYPE_WAREHOUSE)
                && (!d.ops || d.ops.length <= 0);
        });
    }

    deleteData(dataList, dataId) {
        let data = this.findDataFromId(dataList, dataId);
        if (data) {
            if (data.ops && data.ops.length > 0) {
                let ops = _.cloneDeep(data.ops);
                ops.forEach(o => {
                    this.deleteShipment(dataList, o.segmentId);
                });
            }

            _.remove(dataList, d => {
                return d.id == dataId;
            });

            this.cleanDataList(dataList);
        }
        this.syncTableWithSelectedData(dataList);

    }

    syncTableWithSelectedData(dataList){
        let newSelectedRows = [];
        dataList.forEach(data => {
            data.ops.forEach(ops => {
                let index = _.findIndex(newSelectedRows, {id: ops.shipment.id});
                if(index < 0){
                    newSelectedRows.push(ops.shipment);
                }
            })
        });
        this.setState({selectedRows: newSelectedRows});
    }

    deleteShipment(dataList, segmentId) {
        dataList.forEach(d => {
            if (d.ops && d.ops.length > 0) {
                _.remove(d.ops, o => {
                    return o.shipment && o.segmentId == segmentId;
                });
            }
        });

        this.cleanDataList(dataList);
    }

    extractDataList(segmentList) {
        let dataList = [];

        if (segmentList && segmentList.length > 0) {
            segmentList.forEach(segment => {
                if (segment) {
                    this.addShipment(dataList, segment, false);
                }
            });
        }

        if (this.state.trailers && this.state.trailers.length > 0) {
            _.cloneDeep(this.state.trailers).forEach(trailer => {
                this.addTrailer(dataList, trailer, false);
            });
        }

        return dataList;
    }

    onShowInfo(data) {
        let info = null;

        if (data) {
            info = (
                <table>
                    <tbody>
                    <tr>
                        <td>{data.info.name}</td>
                    </tr>
                    </tbody>
                </table>
            );
        }

        return (
            <div>
                <table>
                    <tbody>
                        <tr>
                            <td style={{textAlign: "center", fontSize: "18px", borderBottom: "1px solid black"}}>
                                <b>Info</b>
                            </td>
                        </tr>
                    </tbody>
                </table>
                {info}
            </div>
        );
    }

    onMarkerClicked(data) {
        if (data && data.info) {
            let selectedData = _.cloneDeep(this.state.selectedData);
            switch (data.info.type) {

                case this.LOCATION_TYPE_CUSTOMER:
                    if (data.ops && data.ops.length > 0) {
                        data.ops.forEach(op => {
                            this.addShipment(selectedData, op.shipment, true);
                        })
                        this.updateSelectedData(selectedData);
                    }
                    break;

                case this.LOCATION_TYPE_TRAILER:
                    if (data.trailerDetails) {

                        this.addTrailer(selectedData, data.trailerDetails, true);
                        this.updateSelectedData(selectedData);
                    }
                    break;
            }

            this.syncTableWithSelectedData(selectedData);
        }
    }

    onRouteChanged(selectedData) {
        this.updateSelectedData(selectedData);
    }

    onRouteDelete(data) {
        let selectedData = _.cloneDeep(this.state.selectedData);
        this.deleteData(selectedData, data.id);
        this.updateSelectedData(selectedData);
    }

    onRouteDrawn(routeInfo) {
        this.setState({
            routeInfo: routeInfo,
            selectedData: this.setTripInfo(this.state.selectedData, routeInfo, true)
        }, () => {
            this.resizeMapComponent();
        });
    }

    onRoute() {
        this.setState({routeDrawRequestTime: Date.now(), routeInfo: null});
    }

    onPlan() {
        let data = {summary: this._summary.getSummary(), stops: this.state.selectedData};
        TripService.requestPlanning(data).then((response) => {
            this.handlePlanSuccess();
            //window.location.reload(true);
            Notify.showSuccess("Planning saved");
        }).catch((error) => {
            Notify.showError(error);
        });
    }

    handlePlanSuccess() {
        let selectedRows = this.state.selectedRows;
        let currentSegments = this.state.currentSegments;

        selectedRows.forEach(selectedRowElem => {
            _.remove(currentSegments, item => {
                return item.id == selectedRowElem.id;
            });
        })

        this.setState({
            selectedData: [],
            selectedRows: [],
            currentSegments: currentSegments,
            currentData: this.setIconsAndTypes(this.extractDataList(currentSegments))
        });
    }

    onAcceptOrderedRoute() {
        let newRouteInfo = _.cloneDeep(this.state.routeInfo);
        _.unset(newRouteInfo, "orderedRoute");
        this.updateSelectedData(this.state.routeInfo.orderedRoute, newRouteInfo);
    }

    handleSegmentSelection(newSelection){

        let selectedRows = _.cloneDeep(this.state.selectedRows);
        let selectedData = _.cloneDeep(this.state.selectedData);
        let isAddFailed = false;
        newSelection.forEach(item => {
            let rowIndex = _.findIndex(selectedRows, {id: item.id});
            if(rowIndex < 0){
                if(!this.addShipment(selectedData, _.cloneDeep(item), true)) {
                    isAddFailed = true;
                }
            }
        });
        selectedRows.forEach(item => {
            let rowIndex = _.findIndex(newSelection, {id: item.id});
            if(rowIndex < 0){
                this.deleteShipment(selectedData, item.id);
            }
        });
        this.updateSelectedData(selectedData);
        if(isAddFailed) {
            this.setState({selectedRows: selectedRows});
        } else {
            this.setState({selectedRows: newSelection});
        }
    }

    resizeMapComponent() {
        if (!this.minLeftColumnHeight) {
            this.minLeftColumnHeight = $('#leftColumn').outerHeight();
            this.mapHeightOffset = this.minLeftColumnHeight - this.state.mapHeight;
        }

        let rightColumnHeight = $('#rightColumn').outerHeight();

        let mapHeight = (rightColumnHeight >= this.minLeftColumnHeight ? rightColumnHeight : this.minLeftColumnHeight) - this.mapHeightOffset;

        if (this.state.mapHeight != mapHeight) {
            this.setState({mapHeight: mapHeight});
        }
    }

    onDisplayModeChange(value) {
        if (this.state.displayMode == "E") {
            if (value == "L") {
                $("#leftGridCell").hide();
                $("#rightGridCell").removeClass("uk-width-medium-1-2");
                $("#rightGridCell").addClass("uk-width-medium-1-1");
            } else {
                $("#rightGridCell").hide();
                $("#leftGridCell").removeClass("uk-width-medium-1-2");
                $("#leftGridCell").addClass("uk-width-medium-1-1");
            }
        } else {
            if (value == "L") {
                $("#leftGridCell").removeClass("uk-width-medium-1-1");
                $("#leftGridCell").addClass("uk-width-medium-1-2");
                $("#rightGridCell").show();
            } else {
                $("#rightGridCell").removeClass("uk-width-medium-1-1");
                $("#rightGridCell").addClass("uk-width-medium-1-2");
                $("#leftGridCell").show();
            }
        }

        this.setState({displayMode: this.state.displayMode == "E" ? value : "E"});
    }

    onShipmentsDisplayModeChange(shipmentsFullScreen) {
        if (shipmentsFullScreen) {
            $("#topGridCell").hide();
        } else {
            $("#topGridCell").show();
        }
        this.setState({shipmentsFullScreen: shipmentsFullScreen});
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

    convertTrailerDataToElasticLocation(data) {
        return {
            location: {
                // If the trailer is moving, the next stop location id of the trailer will be passed
                // If the trailer is not moving, the current location id of the trailer will be passed
                id: data.latestLocation ? data.latestLocation.id : null,
                name: data.plateNumber,
                postalCode: "",
                countryIsoCode: "",
                location: {
                    lat: data.latestLocation && data.latestLocation.postaladdress && data.latestLocation.postaladdress.pointOnMap ? data.latestLocation.postaladdress.pointOnMap.lat : null,
                    lon: data.latestLocation && data.latestLocation.postaladdress && data.latestLocation.postaladdress.pointOnMap ? data.latestLocation.postaladdress.pointOnMap.lng : null,
                },
                formattedAddress: data.latestLocation && data.latestLocation.postaladdress ? data.latestLocation.postaladdress.formattedAddress : null,
                type: this.LOCATION_TYPE_TRAILER
            }
        }
    }

    updateSelectedData(selectedData, routeInfo) {
        let valid = this.validateSelectedData(selectedData, false);

        this.setState({
            selectedData: this.setTripInfo(this.setIconsAndTypes(selectedData), routeInfo, valid),
            routeInfo: routeInfo ? routeInfo : null,
            routeDrawRequestTime: -1,
            selectedDataValid: valid
        }, () => {
            //when the order of the trip stops is changed, "initializeMissingArrivalAndDepartureDates" is called
            // 1. to ensure last trip stop has null departure date
            // 2. to ensure any element, which is previously the last element but changed, should be given a default value after
            this.initializeMissingArrivalAndDepartureDates(selectedData);
            this.adjustPlannedDates(selectedData);
            this.resizeMapComponent();
        });
    }

    clearMessages(selectedData) {
        if (selectedData && selectedData.length > 0) {
            selectedData.forEach(data => {
                delete data["hasMessages"]; // This is used for background coloring
                delete data["messages"]; // This is used for displaying messages
                delete data["terminalStop"]; // This is used for background coloring (hasMessages has higher priority)
                if (data.ops && data.ops.length > 0) {
                    data.ops.forEach(op => {
                        delete op["hasMessages"]; // This is used for shipment number coloring
                        delete op["messages"]; // This is used for displaying messages
                    });
                }
            });
        }
    }

    setOpsForShipmentHasMessages(dataList, op) {
        dataList.forEach(data => {
            if (data.ops && data.ops.length > 0) {
                data.ops.forEach(o => {
                    if (o.shipment && o.shipment.id == op.shipment.id && o != op) {
                        o.hasMessages = true;
                    }
                });
            }
        });
    }

    addMessage(messages, type, text) {
        let list = messages;
        if (!list) {
            list = [];
        }
        list.push({type: type, text: text});
        return list;
    }

    validateSelectedData(selectedData, justChecking) {
        if (!justChecking) {
            // Clear previous eori
            this.clearMessages(selectedData);
        }

        let valid = true;

        // There must be at least 2 stops
        if (!selectedData || selectedData.length < 2) {
            valid = false;
        }

        if (selectedData && selectedData.length > 0) {
            let loadedShipments = [];
            let terminalStops = [];

            for (let i = 0; i < selectedData.length; i++) {
                let data = selectedData[i];
                let loadedShipmentsForThisData = _.cloneDeep(loadedShipments);

                if (data.ops && data.ops.length > 0) {
                    data.ops.forEach(op => {
                        if (op.opType.id == this.OP_TYPE_LOAD) {
                            if (op.shipment && op.shipment.id) {
                                // Add to loaded shipments
                                loadedShipments.push(op.shipment.id);
                            }
                        } else if (op.opType.id == this.OP_TYPE_UNLOAD) {
                            if (op.shipment && op.shipment.id) {
                                // Remove rom loaded shipments
                                _.remove(loadedShipments, s => {
                                    return s == op.shipment.id;
                                });

                                // If the shipment is unloaded before loading, give error
                                if (_.indexOf(loadedShipmentsForThisData, op.shipment.id) < 0) {
                                    if (!justChecking) {
                                        op.messages = this.addMessage(op.messages, "error", "This shipment is not loaded yet");
                                        data.hasMessages = true;
                                        this.setOpsForShipmentHasMessages(selectedData, op);
                                    }
                                    valid = false;
                                }
                            }
                        }
                    });
                }

                // If the loaded shipments is empty, this means this stop is terminal
                if (loadedShipments.length == 0 && data.info.type != this.LOCATION_TYPE_TRAILER) {
                    data.terminalStop = true;
                    terminalStops.push(data);
                }

                if (data.info.type == this.LOCATION_TYPE_TRAILER && i != 0) {
                    if (!justChecking) {
                        data.messages = this.addMessage(data.messages, "error", "Trailer must be the first element");
                        data.hasMessages = true;
                    }
                    valid = false;
                }
            }

            // There can not be more than 1 terminal stop
            if (terminalStops.length > 1) {
                terminalStops.forEach(data => {
                    if (!justChecking) {
                        data.messages = this.addMessage(data.messages, "error", "There are multiple terminal stops");
                        data.hasMessages = true;
                    }
                    valid = false;
                });
            }
        }

        return valid;
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

    findTrailer(dataList) {
        if (dataList && dataList.length > 0) {
            let result = _.filter(dataList, data => {
                return data && data.info && data.info.type == this.LOCATION_TYPE_TRAILER;
            });

            if (result && result.length > 0) {
                return result[0];
            }
        }

        return null;
    }

    addTrailer(dataList, trailer, removeExisting) {
        if (removeExisting) {
            let currentTrailerData = this.findTrailer(dataList);
            if (currentTrailerData) {
                this.deleteData(dataList, currentTrailerData.id);
            }
        }

        let location = this.convertTrailerDataToElasticLocation(trailer);
        if (location && location.location) {
            let data = this.convertLocationToData(location.location, null, null);
            if (data) {
                data.trailerDetails = trailer;
                dataList.unshift(data);
            }
        }
    }

    onSelectTrailer(values) {
        let selectedData = _.cloneDeep(this.state.selectedData);
        this.addTrailer(selectedData, values, true);
        this.updateSelectedData(selectedData);
    }

    routeCheckFunction(route) {
        return this.validateSelectedData(route, true);
    }

    onOptimizationChange() {
        this.setState({routeInfo: null});
    }

    setShipmentDetails(shipmentsegment) {

        let shipment = shipmentsegment.shipment;

        if(!shipment) {
            return;
        }

        let ret = "";

        if (shipment.packageTypes && shipment.packageTypes.length > 0) {
            shipment.packageTypes.forEach(t => {
                ret += " " + t.count + " " + t.name;
            });
        }

        shipment.details = _.trim(_.cloneDeep(ret));

        if (shipment.grossWeight) {
            ret += " " + shipment.grossWeight + " kg";
        }

        if (shipment.volume) {
            ret += " " + shipment.volume + " m3";
        }

        if (shipment.ldm) {
            ret += " " + shipment.ldm + " ldm";
        }

        if (shipment.payWeight) {
            ret += " " + shipment.payWeight + " pw";
        }

        shipment.combined = _.trim(ret);

        return shipmentsegment;
    }

    setTripInfo(dataList, routeInfo, valid) {
        if (dataList && dataList.length > 0) {
            let grossWeight = 0, volume = 0, ldm = 0, payWeight=0, i = -1;

            dataList.forEach(data => {
                if (!valid) {
                    data.tripInfo = null;
                } else {
                    if (data.ops && data.ops.length > 0) {
                        data.ops.forEach(op => {
                            if (op.opType) {
                                if (op.opType.id == this.OP_TYPE_LOAD) {
                                    grossWeight += op.shipment.grossWeight ? op.shipment.grossWeight : 0;
                                    volume += op.shipment.volume ? op.shipment.volume : 0;
                                    ldm += op.shipment.ldm ? op.shipment.ldm : 0;
                                    payWeight += op.shipment.payWeight ? op.shipment.payWeight : 0;
                                } else if (op.opType.id == this.OP_TYPE_UNLOAD) {
                                    grossWeight -= op.shipment.grossWeight ? op.shipment.grossWeight : 0;
                                    volume -= op.shipment.volume ? op.shipment.volume : 0;
                                    ldm -= op.shipment.ldm ? op.shipment.ldm : 0;
                                    payWeight += op.shipment.payWeight ? op.shipment.payWeight : 0;
                                }
                            }
                        });
                    }

                    i++;

                    data.tripInfo = {
                        grossWeight: grossWeight > 0.01 ? grossWeight.toFixed(2) : null,
                        volume: volume > 0.01 ? volume.toFixed(2) : null,
                        ldm: ldm > 0.01 ? ldm.toFixed(2) : null,
                        payWeight:  payWeight > 0.01 ? payWeight.toFixed(2) : null,
                        km: routeInfo && routeInfo.legs && routeInfo.legs.length > i ? routeInfo.legs[i].distance : null,
                    };
                }
            });
        }

        return dataList;
    }

    getLegPolylineOptions(i) {
        if (i == 0
            && this.state.selectedData
            && this.state.selectedData.length > 0
            && this.state.selectedData[0]
            && this.state.selectedData[0].info
            && this.state.selectedData[0].info.type == this.LOCATION_TYPE_TRAILER) {
            // If a trailer is the first element, draw to first leg in ref to emphasize the empty travel
            return {strokeColor: "#FF0000", strokeOpacity: 1.0, strokeWeight: 5, zIndex: 1};
        }

        // Use the default polyline options
        return null;
    }


    dataUpdateHandler(dataId, field, value) {
        let dataList = this.state.selectedData;

        //old data and new data is used to detect automatic data changes and warn user about those
        let oldValue;
        let dataToBeUpdated;

        dataList.forEach(data => {
            if(data.id == dataId) {
                dataToBeUpdated = data;
                oldValue = _.cloneDeep(data[field]);
                data[field] = value;
            }
        });

        if(field == "plannedTimeDeparture" || field == "plannedTimeArrival") {
            this.adjustPlannedDatesWithWarnings(dataList, dataToBeUpdated, field, oldValue);
        }


        this.setState({selectedData: dataList});

    }

    initializeDatesDataStructuresForDefaultValuesAndValidation(dataList) {
        this.createTripStopShipmentDatesCache(dataList);
        this.initializeMissingArrivalAndDepartureDates(dataList);
    }

    createTripStopShipmentDatesCache(dataList){
        dataList.forEach((data, index) => {

            let dates = {};

            //Find earliest and latest shipment ready dates for each trip stop
            //also kep their moment objects to be used later
            data.ops.forEach(op => {

                let currMoment = this.moment(op.shipment.readyAtDate.utcDateTime, "DD/MM/YYYY HH:mm");

                if(!dates.earliestReadyDateMoment ||  currMoment < dates.earliestReadyDateMoment) {
                    dates.earliestReadyDate = op.shipment.readyAtDate.localDateTime;
                    dates.earliestReadyDateTimezone = op.shipment.readyAtDate.timezone;
                    dates.earliestReadyDateMoment =  this.moment(op.shipment.readyAtDate.utcDateTime, "DD/MM/YYYY HH:mm");
                }

                if(!dates.latestReadyDateMoment ||  currMoment > dates.latestReadyDateMoment) {
                    dates.latestReadyDate = op.shipment.readyAtDate.localDateTime;
                    dates.latestReadyDateTimezone = op.shipment.readyAtDate.timezone;
                    dates.latestReadyDateMoment =  this.moment(op.shipment.readyAtDate.utcDateTime, "DD/MM/YYYY HH:mm");
                }
            });

            data._dates = dates;

        });

    }

    initializeMissingArrivalAndDepartureDates(dataList) {

        //sets initial arrival and departure dates of tripstops with respect to the shipment ready dates
        //the relation of dates between tripstops are not taken into consideration for now.
        //the relation willl be handled by the caller of this function
        dataList.forEach((data, index) => {

            if(data.info.type != this.LOCATION_TYPE_TRAILER) {
                if (!data.plannedTimeArrival) {
                    data.plannedTimeArrival = data._dates.earliestReadyDate + " " + data.info.timezone;
                }

                if (index == (dataList.length - 1)) {
                    //last trip stop does not have departure date
                    data.plannedTimeDeparture = null;
                }
                else if (!data.plannedTimeDeparture) {
                    data.plannedTimeDeparture = data._dates.latestReadyDate + " " + data.info.timezone;
                }
            }
        });
    }

    adjustPlannedDatesWithWarnings(dataList, dataToBeUpdated, field, oldValue) {

        let adjustmentExist = this.adjustPlannedDates(dataList);

        let finalValue = dataToBeUpdated[field];

        if (adjustmentExist) {
            if(finalValue == oldValue) {
                UIkit.notify("Operation Date should not be before \n  *Previous operations' Dates. \n  *Ready date of shipments");
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

            if(data.info.type != this.LOCATION_TYPE_TRAILER) {
                let arrivalMoment = this.moment(data.plannedTimeArrival.split(" ").splice(2,1).join(" "), "DD/MM/YYYY HH:mm");

                //ARRIVAL DATE of trio stop
                //If there exist any previousElemDepartureMoment (any date from previous trip stop if exist)
                //Ensure that current Trip Stop arrival dates > Previous Trip Stop Departure Date
                if (previousElemDepartureMoment && arrivalMoment < previousElemDepartureMoment) {
                    data.plannedTimeArrival = _.cloneDeep(previousElemDeparture);
                    arrivalMoment = _.cloneDeep(previousElemDepartureMoment);
                    isUpdated = true;
                }

                //DEPARTURE DATE of trip stop
                //last trip stop does not have departure time so skip it
                if (index < (dataList.length - 1)) {
                    let departureMoment = this.moment(data.plannedTimeDeparture.split(" ").splice(2,1).join(" "), "DD/MM/YYYY HH:mm");

                    //Ensure that current Trip Stop departure date > arrival date
                    if (departureMoment < arrivalMoment) {
                        data.plannedTimeDeparture = _.cloneDeep(data.plannedTimeArrival);
                        departureMoment = _.cloneDeep(arrivalMoment);
                        isUpdated = true;
                    }

                    //Ensure that current Trip Stop departure date > lates shipment ready date of current trip stop
                    if (departureMoment < data._dates.earliestReadyDateMoment) {
                        data.plannedTimeDeparture = _.cloneDeep(data._dates.earliestReadyDate);
                        departureMoment = _.cloneDeep(data._dates.earliestReadyDateMoment);
                        isUpdated = true;
                    }

                    previousElemDeparture = data.plannedTimeDeparture;
                    previousElemDepartureMoment = departureMoment;

                }
            }
        });

        return isUpdated;
    }

    divideSegments(segment, selectedCrossDock) {
        let request = {};
        request.segmentId = segment.id;
        request.warehouse = {id: selectedCrossDock.companyLocation.id, name: selectedCrossDock.name};
        ShipmentAssignmentPlanningService.divideSegments(request).then((response) => {
            if (response.data) {

                let currentSegments = _.cloneDeep(this.state.currentSegments);
                let updatesSegmentIds = response.data.map(r => r.id);

                currentSegments = _.remove(currentSegments, (data) => {
                    return !updatesSegmentIds.includes(data.id)
                });

                let newElems = [];

                response.data.forEach(shipmentSegment => {
                    newElems.push(this.setShipmentDetails(shipmentSegment));
                    newElems.forEach(item => {item._key = item.id});
                });
                Notify.showSuccess("Segment is divided.");
                this.setState({
                    currentData: this.setIconsAndTypes(this.extractDataList(currentSegments)),
                    currentSegments: [...newElems, ...currentSegments]
                });
            }
        }).catch((error) => {
            Notify.showError(error);
        });

        return true;
    }

    mergeSegments(segment, segmentIds) {
        let request = {};
        request.segmentId = segment.id;
        request.segmentIds = segmentIds;

        ShipmentAssignmentPlanningService.mergeSegments(request).then((response) => {
            if (response.data) {

                let currentSegments = _.cloneDeep(this.state.currentSegments);
                let shipmentId = segment.shipment.id;

                currentSegments = _.remove(currentSegments, (data) => {
                    return data.shipment.id != shipmentId
                });

                currentSegments = _.remove(currentSegments, (data) => {
                    return !segmentIds.includes(data.shipment.id)
                });

                let newElems = [];

                response.data.forEach(shipmentSegment => {
                    newElems.push(this.setShipmentDetails(shipmentSegment));
                    newElems.forEach(item => {
                        item._key = item.id
                    });
                });
                Notify.showSuccess("Segments are merged.");
                this.setState({
                    currentData: this.setIconsAndTypes(this.extractDataList(currentSegments)),
                    currentSegments: [...newElems, ...currentSegments]
                });
            }
        }).catch((error) => {
            Notify.showError(error);
        });

        return true;
    }

    render() {
        let selectedShipments = this.sortShipments(this.extractShipmentList(this.state.selectedData));

        let origin = null;
        if (this.state.selectedData && this.state.selectedData.length > 0) {
            this.state.selectedData.forEach(d => {
                if (d && d.info && d.info.type != this.LOCATION_TYPE_TRAILER && !origin) {
                    origin = d.position;
                }
            });
        }

        let rightCell = this.state.selectedData && this.state.selectedData.length > 0 ?
            <GridCell id="rightGridCell" width="1-2" noMargin={true}>
                <div id="rightColumn">
                    <Grid>
                        <GridCell width="1-1" noMargin={true}>
                            <Summary selectedShipments={selectedShipments}
                                     ref={(c) => this._summary = c}/>
                        </GridCell>
                        <GridCell width="1-1"
                                  noMargin={selectedShipments && selectedShipments.length > 0 ? false : true}>
                            <Route onRoute={() => this.onRoute()}
                                   onPlan={() => this.onPlan()}
                                   onAcceptOrderedRoute={() => this.onAcceptOrderedRoute()}
                                   onRouteChanged={(selectedData) => this.onRouteChanged(selectedData)}
                                   onRouteDelete={(data) => this.onRouteDelete(data)}
                                   routeInfo={this.state.routeInfo}
                                   selectedData={this.state.selectedData}
                                   selectedShipments={selectedShipments}
                                   selectedDataValid={this.state.selectedDataValid}
                                   origin={origin}
                                   onSelectTrailer={(values) => this.onSelectTrailer(values)}
                                   dataUpdateHandler={(dataId, field, value) => {this.dataUpdateHandler(dataId, field, value)}}/>
                        </GridCell>
                    </Grid>
                </div>
            </GridCell>
            : null;

        let mapWidth = rightCell ? "1-2" : "1-1";

        let displayMode = rightCell && !this.state.shipmentsFullScreen ?
            <div style={{margin: "-55px 0 3px", minHeight: "40px"}}>
                <DisplayMode displayMode={this.state.displayMode}
                             onDisplayModeChange={(value) => this.onDisplayModeChange(value)}/>
            </div>
            : null;
        let shipments = this.state.currentSegments && this.state.currentSegments.length > 0 ?
            <GridCell width="1-1">
                <SegmentTable segmentList={this.state.currentSegments}
                              warehouses={this.state.warehouses}
                              handleSegmentSelection={(value) => this.handleSegmentSelection(value)}
                              selectedRows = {this.state.selectedRows}
                              onShipmentsDisplayModeChange={(shipmentsFullScreen) => this.onShipmentsDisplayModeChange(shipmentsFullScreen)}
                              shipmentsFullScreen={this.state.shipmentsFullScreen}
                              handleDivideSegment={(segment, selectedCrossDock) => this.divideSegments(segment, selectedCrossDock)}
                              handleMergeSegment={(segment, segmentIds) => {return this.mergeSegments(segment, segmentIds)}}
                              renderForFTL={this.isPageRequestedAsFTL()}
                />
            </GridCell>
            : null;

        let title = "Planning";
        if(this.isPageRequestedAsColDist()) {
            title = "Collection & Distribution Planning";
        } else if(this.isPageRequestedAsLinehaul()) {
            title = "Linehaul Planning";
        }
        return (
            <div>
                <Page title={title}>
                <Grid>
                    <GridCell width="1-1" noMargin={true}>
                            {displayMode}
                    </GridCell>
                    <GridCell id="topGridCell" width="1-1" noMargin={true}>
                        <Grid>
                            <GridCell id="leftGridCell" width={mapWidth} noMargin={true}>
                                <div id="leftColumn">
                                    <Map width={this.state.mapWidth}
                                         height={this.state.mapHeight + "px"}
                                         data={this.state.currentData}
                                         onShowInfo={(data) => this.onShowInfo(data)}
                                         onMarkerClicked={(data) => this.onMarkerClicked(data)}
                                         onRouteDrawn={(routeInfo) => this.onRouteDrawn(routeInfo)}
                                         traffic={false}
                                         clustering={false}
                                         optimization={false}
                                         route={this.state.selectedData}
                                         routeDrawRequestTime={this.state.routeDrawRequestTime}
                                         routeCheckFunction={(route) => this.routeCheckFunction(route)}
                                         onOptimizationChange={()=>this.onOptimizationChange()}
                                         showTraffic="true"
                                         showClustering="true"
                                         showOptimization="true"
                                         markCurrentPosition="true"
                                         getLegPolylineOptions={(i)=>this.getLegPolylineOptions(i)}/>
                                </div>
                            </GridCell>
                            {rightCell}
                        </Grid>
                    </GridCell>
                </Grid>
                </Page>
                {shipments}
            </div>
        );
    }
}