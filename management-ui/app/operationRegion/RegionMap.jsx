import React from "react";
import ReactDOM from "react-dom";
import uuid from "uuid";
import * as axios from 'axios';
import _ from "lodash";

import {TranslatingComponent} from 'susam-components/abstract';
import {GoogleMaps} from "susam-components/advanced";
import {Card, Grid, GridCell} from "susam-components/layout";
import {Notify, Button, DropDown, DropDownButton, TextInput} from "susam-components/basic";
import {LocationService, ZoneService} from "../services";

const POLYGON_TYPE_THAT_CAN_BE_ADDED = 1;
const POLYGON_TYPE_THAT_CANNOT_BE_ADDED = 2;
const POLYGON_TYPE_THAT_ARE_ADDED = 3;

const FILL_COLOR_FOR_THAT_CAN_BE_ADDED = "#696969";
const FILL_COLOR_FOR_THAT_CANNOT_BE_ADDED = "#0000FF";
const FILL_COLOR_FOR_THAT_ARE_ADDED = "#008000";
const FILL_COLOR_FOR_THAT_ARE_SELECTED = "#FFFF00";

export class RegionMap extends TranslatingComponent {

    log(str) {
        // console.log(str);
    }

    constructor(props) {
        super(props);
        this.id = (props.id ? props.id : uuid.v4()).replace(/-/g, '');
        this.mapId = props.mapId;
        this.key = "AIzaSyDE6jFmZfiFjIYBu9CD2lNKSxYaJhAF4nI";
        //this.key = "AIzaSyChgiAMDKWpPRM8b3ajXfyrrLnOt_cG3tM";
        this.baseImageUrl = window.baseResourceUrl + '/assets/img/map/';
        this.countries = [];

        this.state = {
        };

        this.polygons = [];
        this.categoriesWhenAdding = [];
        this.colorsForCategoriesWhenAdding = [];
    }

    componentDidMount() {

        this.initCategoriesWhenAdding(this.props.categoriesWhenAdding);

        axios.all([
            LocationService.retrieveCountries()
        ]).then(axios.spread((countriesResponse) => {

            countriesResponse.data.forEach(elem => {
                this.countries.push(elem);
            });

            this.initMap();

            this.init(this.props.polygonRegionsThatCanBeAdded, this.props.polygonRegionsThatCannotBeAdded, this.props.polygonRegionsThatAreAdded);

        })).catch((error) => {
            Notify.showError(error);
        });
    }

    componentWillReceiveProps(nextProps) {

        this.initCategoriesWhenAdding(nextProps.categoriesWhenAdding);

        if (!this.map) {
            return;
        }

        if (this.props.caller != nextProps.caller) {
            this.init(nextProps.polygonRegionsThatCanBeAdded, nextProps.polygonRegionsThatCannotBeAdded, nextProps.polygonRegionsThatAreAdded);
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.caller != nextProps.caller) {
            return true;
        } else {
            return false;
        }
    }

    onResize() {
        if (this.props.onResize) {
            this.props.onResize();
        }
    }

    initCategoriesWhenAdding(categoriesWhenAdding) {

        this.categoriesWhenAdding = [];
        this.colorsForCategoriesWhenAdding = [];

        if (categoriesWhenAdding) {
            categoriesWhenAdding.forEach((elem, index) => {
                this.categoriesWhenAdding.push(elem);
                if (index == 0) {
                    this.colorsForCategoriesWhenAdding[elem.id] = "#008000"; // green
                } else if (index == 1) {
                    this.colorsForCategoriesWhenAdding[elem.id] = "#32CD32"; // limegreen
                } else if (index == 2) {
                    this.colorsForCategoriesWhenAdding[elem.id] = "#7CFC00"; // lawngreen
                } else if (index == 3) {
                    this.colorsForCategoriesWhenAdding[elem.id] = "#98FB98"; // palegreen
                } else {
                    Notify.showError("categoriesWhenAdding cannot have more than 4 elements.");
                }
            });
        }
    }

    initMap() {
        this.map = GoogleMaps.createMap(this.mapId, this.props.center, this.baseImageUrl, this.props.markCurrentPosition, () => this.onResize());
        this.putLegendOnMap(this.map);
    }
    
    init(polygonRegionsThatCanBeAdded, polygonRegionsThatCannotBeAdded, polygonRegionsThatAreAdded) {

        this.polygons.forEach(polygon => {
            polygon.setMap(null);
        });

        this.polygons.splice(0);

        polygonRegionsThatCanBeAdded.forEach(polygon => {
            this.polygons.push(this.convertPolygonRegionToGoogleMapsPolygon(polygon, POLYGON_TYPE_THAT_CAN_BE_ADDED, false));
        });

        polygonRegionsThatCannotBeAdded.forEach(polygon => {
            this.polygons.push(this.convertPolygonRegionToGoogleMapsPolygon(polygon, POLYGON_TYPE_THAT_CANNOT_BE_ADDED, false));
        });

        polygonRegionsThatAreAdded.forEach(polygon => {
            this.polygons.push(this.convertPolygonRegionToGoogleMapsPolygon(polygon, POLYGON_TYPE_THAT_ARE_ADDED, false));
        });

        this.drawPolygons(this.map, this.polygons);

        let country = null;

        if (polygonRegionsThatAreAdded.length > 0) {
            country = _.find(this.countries, country => {
                return country.isoAlpha3Code == polygonRegionsThatAreAdded[0].countryIsoAlpha3Code;
            });
        } else if (polygonRegionsThatCanBeAdded.length > 0) {
            country = _.find(this.countries, country => {
                return country.isoAlpha3Code == polygonRegionsThatCanBeAdded[0].countryIsoAlpha3Code;
            });
        } else {
            country = _.find(this.countries, country => {
                return country.isoAlpha3Code == "TUR";
            });
        }

        // Bu satır olmadan setCenter doğru çalışmıyor, o yüzden önemli.
        google.maps.event.trigger(this.map, 'resize');

        this.map.setZoom(5);
        this.map.setCenter({lat: country.centerLat, lng: country.centerLng});

        this.refreshButtons();
    }

    putLegendOnMap(map) {

        let columns = [];

        if (this.categoriesWhenAdding.length > 0) {
            this.categoriesWhenAdding.forEach(elem => {
                let backgroundColor = this.colorsForCategoriesWhenAdding[elem.id];
                columns.push(
                    <td key={uuid.v4()}>
                        <span style={{backgroundColor: backgroundColor}}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                    </td>
                );
                columns.push(
                    <td key={uuid.v4()}>
                        Added ({elem.name})
                    </td>
                );
            });
        } else {
            columns.push(
                <td key={uuid.v4()}>
                    <span style={{backgroundColor: FILL_COLOR_FOR_THAT_ARE_ADDED}}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                </td>
            );
            columns.push(
                <td key={uuid.v4()}>
                    Added
                </td>
            );
        }

        let controls = (
            <table>
                <tbody>
                    <tr>
                        <td>
                            <div className="md-card">
                                <div className="md-card-content">
                                    <table>
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <span style={{backgroundColor: FILL_COLOR_FOR_THAT_CAN_BE_ADDED}}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                                </td>
                                                <td>
                                                    Can be added
                                                </td>
                                                <td>
                                                    <span style={{backgroundColor: FILL_COLOR_FOR_THAT_CANNOT_BE_ADDED}}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                                </td>
                                                <td>
                                                    Cannot be added
                                                </td>
                                                <td>
                                                    <span style={{backgroundColor: FILL_COLOR_FOR_THAT_ARE_SELECTED}}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                                </td>
                                                <td>
                                                    Selected
                                                </td>
                                                {columns}
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        );

        let controlsDiv = document.createElement('div');

        ReactDOM.render(controls, controlsDiv);

        map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(controlsDiv);
    }

    getFillColor(polygonType, selected, category) {

        let fillColor;

        if (polygonType == POLYGON_TYPE_THAT_CANNOT_BE_ADDED) {
            fillColor = FILL_COLOR_FOR_THAT_CANNOT_BE_ADDED;
        } else {
            if (selected) {
                fillColor = FILL_COLOR_FOR_THAT_ARE_SELECTED;
            } else {
                if (polygonType == POLYGON_TYPE_THAT_CAN_BE_ADDED) {
                    fillColor = FILL_COLOR_FOR_THAT_CAN_BE_ADDED;
                } else if (polygonType == POLYGON_TYPE_THAT_ARE_ADDED) {
                    if (this.categoriesWhenAdding.length == 0) {
                        fillColor = FILL_COLOR_FOR_THAT_ARE_ADDED;
                    } else {
                        fillColor = this.colorsForCategoriesWhenAdding[category.id];
                    }
                }
            }
        }

        return fillColor;
    }

    convertPolygonRegionToGoogleMapsPolygon(polygonRegion, polygonType, selected) {

        let paths = [];

        polygonRegion.polygons.forEach(polygon => {

            let outerRing = null;
            let innerRings = [];

            polygon.rings.forEach(ring => {
                if (ring.type.id == "OUTER") {
                    outerRing = ring;
                } else {
                    innerRings.push(ring);
                }
            });

            let outerPath = google.maps.geometry.encoding.decodePath(outerRing.encodedCoordinatesString.value);
            paths.push(outerPath);

            innerRings.forEach(innerRing => {
                let innerPath = google.maps.geometry.encoding.decodePath(innerRing.encodedCoordinatesString.value);
                paths.push(innerPath);
            });
        });

        // Normalde PolygonRegion'da böyle bir alan yok, duruma göre bu alanı biz dolduruyoruz.
        let category = polygonRegion.category;

        let polygon = new google.maps.Polygon({
            paths: paths,
            strokeColor: "#000000",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: this.getFillColor(polygonType, selected, category),
            fillOpacity: 0.6,
            zIndex: 1,
            externalData: { // Normalde böyle bir alan yok, bu alana bizim projeye has şeyleri koyuyoruz.
                id: polygonRegion.id,
                parent: polygonRegion.parent,
                name: polygonRegion.name,
                absoluteName: this.getPolygonRegionAbsoluteName(polygonRegion),
                type: polygonType,
                selected: selected,
                hasParent: polygonRegion.hasParent,
                hasChildren: polygonRegion.hasChildren,
                countryIsoAlpha3Code: polygonRegion.countryIsoAlpha3Code,
                level: polygonRegion.level,
                category: category
            }
        });

        return polygon;
    }

    getPolygonRegionAbsoluteName(polygonRegion) {
        if (polygonRegion.parent == "/") {
            return polygonRegion.parent + polygonRegion.name;
        } else {
            return polygonRegion.parent + "/" + polygonRegion.name;
        }
    }

    drawPolygons(map, polygons) {
        polygons.forEach(polygon => {
            if (polygon.getVisible() && polygon.getMap() == null) {
                polygon.setMap(map);
                polygon.addListener("click", () => {
                    this.onPolygonClick(polygon);
                });
                polygon.addListener("mouseover", (e) => {
                    this.onPolygonMouseOver(e, polygon);
                });
                polygon.addListener("mouseout", () => {
                    this.onPolygonMouseOut(polygon);
                });
            }
        });
    }

    onPolygonClick(polygon) {

        if (polygon.externalData.type != POLYGON_TYPE_THAT_CANNOT_BE_ADDED) {

            if (polygon.externalData.selected) {
                // deselect
                polygon.externalData.selected = false;
                polygon.setOptions({fillColor: this.getFillColor(polygon.externalData.type, polygon.externalData.selected, polygon.externalData.category)});
            } else {

                let doSelect = false;

                let anySelectedPolygon = _.find(this.polygons, elem => {
                    return elem.externalData.selected;
                });

                if (!anySelectedPolygon) {
                    doSelect = true;
                } else {
                    if (anySelectedPolygon.externalData.type == polygon.externalData.type) {
                        doSelect = true;
                    }
                }

                if (doSelect) {
                    polygon.externalData.selected = true;
                    polygon.setOptions({fillColor: FILL_COLOR_FOR_THAT_ARE_SELECTED});
                }
            }

            this.refreshButtons();
        }
    }

    onPolygonMouseOver(e, polygon) {

        let controls = (
            <table>
                <tbody>
                <tr>
                    <td>
                        <div className="md-card">
                            <div className="md-card-content">
                                <table>
                                    <tbody>
                                    <tr>
                                        <td>
                                            {polygon.externalData.absoluteName}
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </td>
                </tr>
                </tbody>
            </table>
        );

        let controlsDiv = document.createElement('div');

        ReactDOM.render(controls, controlsDiv);

        this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(controlsDiv);
    }

    onPolygonMouseOut(polygon) {
        this.map.controls[google.maps.ControlPosition.TOP_CENTER].clear();
    }

    onCountryChange(value) {

        if (value) {

            let countryIsoAlpha3Code = value.isoAlpha3Code;

            let anyPolygonThatBelongsToSelectedCountry =_.find(this.polygons, elem => {
                return elem.externalData.countryIsoAlpha3Code == countryIsoAlpha3Code;
            });

            // Elimizde, ilgili ülkeye ait hiç kayıt yoksa...
            if (!anyPolygonThatBelongsToSelectedCountry) {

                ZoneService.getCountryPolygonRegion(countryIsoAlpha3Code).then(response => {

                    let polygonRegion = response.data;
                    let polygonType;

                    if (this.props.canAddCountryIfNotExists) {
                        polygonType = POLYGON_TYPE_THAT_CAN_BE_ADDED;
                    } else {
                        polygonType = POLYGON_TYPE_THAT_CANNOT_BE_ADDED;
                    }

                    let polygon = this.convertPolygonRegionToGoogleMapsPolygon(polygonRegion, polygonType, false);
                    this.polygons.push(polygon);

                    if (value.centerLat && value.centerLng) {
                        this.map.setCenter({lat: value.centerLat, lng: value.centerLng});
                    }

                    this.drawPolygons(this.map, this.polygons);

                    this.refreshButtons();

                }).catch(error => {
                    Notify.showError(error);
                });
            } else {
                if (value.centerLat && value.centerLng) {
                    this.map.setCenter({lat: value.centerLat, lng: value.centerLng});
                }
            }
        }
    }

    onAddClick(category) {

        this.polygons.forEach(polygon => {
            if (polygon.externalData.type == POLYGON_TYPE_THAT_CAN_BE_ADDED && polygon.externalData.selected) {
                polygon.externalData.type = POLYGON_TYPE_THAT_ARE_ADDED;
                polygon.externalData.selected = false;
                polygon.externalData.category = category;
                polygon.setOptions({fillColor: this.getFillColor(polygon.externalData.type, polygon.externalData.selected, polygon.externalData.category)});
            }
        });

        this.refreshButtons();
    }

    onRemoveClick() {

        if (this.props.getConfirmationIfNecessaryBeforeRemove) {

            let polygonsToBeRemoved = [];

            this.polygons.forEach(polygon => {
                if (polygon.externalData.type == POLYGON_TYPE_THAT_ARE_ADDED && polygon.externalData.selected) {
                    polygonsToBeRemoved.push(polygon);
                }
            });

            this.props.getConfirmationIfNecessaryBeforeRemove(polygonsToBeRemoved);

        } else {
            this.doRemove();
        }
    }

    doRemove() {

        let removedPolygons = [];

        this.polygons.forEach(polygon => {
            if (polygon.externalData.type == POLYGON_TYPE_THAT_ARE_ADDED && polygon.externalData.selected) {
                polygon.externalData.type = POLYGON_TYPE_THAT_CAN_BE_ADDED;
                polygon.externalData.selected = false;
                polygon.externalData.category = null;
                polygon.setOptions({fillColor: this.getFillColor(polygon.externalData.type, polygon.externalData.selected, polygon.externalData.category)});
                removedPolygons.push(polygon);
            }
        });

        if (this.props.onRemove) {
            this.props.onRemove(removedPolygons);
        }

        this.refreshButtons();
    }

    triggerRecursiveDrillDown(polygonRegion) {

        let absoluteNameOfTarget = this.getPolygonRegionAbsoluteName(polygonRegion);
        let absoluteNameOfNextParent;

        let indexOfSlash = absoluteNameOfTarget.indexOf("/", 1);

        if (indexOfSlash == -1) {
            absoluteNameOfNextParent = absoluteNameOfTarget;
        } else {
            absoluteNameOfNextParent = absoluteNameOfTarget.substring(0, indexOfSlash);
        }

        this.onRecursiveDrillDownWithAbsoluteName(absoluteNameOfNextParent, absoluteNameOfTarget);
    }

    onRecursiveDrillDownWithAbsoluteName(absoluteNameOfParent, absoluteNameOfTarget) {

        this.log("onRecursiveDrillDownWithAbsoluteName");
        this.log(absoluteNameOfParent + " - " + absoluteNameOfTarget);

        if (absoluteNameOfParent != absoluteNameOfTarget) {

            let anyPolygon = _.find(this.polygons, polygon => {
                return polygon.externalData.absoluteName.startsWith(absoluteNameOfParent + "/") && polygon.getVisible(); // TODO: Burası doğru mu?
            });

            if (anyPolygon) {

                let absoluteNameOfNextParent;

                let indexOfSlash = absoluteNameOfTarget.indexOf("/", absoluteNameOfParent.length + 1);

                if (indexOfSlash == -1) {
                    absoluteNameOfNextParent = absoluteNameOfTarget;
                } else {
                    absoluteNameOfNextParent = absoluteNameOfTarget.substring(0, indexOfSlash);
                }

                this.onRecursiveDrillDownWithAbsoluteName(absoluteNameOfNextParent, absoluteNameOfTarget);

            } else {

                let selectedPolygon = _.find(this.polygons, polygon => {
                    return polygon.externalData.absoluteName == absoluteNameOfParent;
                });

                if (selectedPolygon.externalData.type != POLYGON_TYPE_THAT_CANNOT_BE_ADDED) {

                    let absoluteNameOfNextParent;

                    let indexOfSlash = absoluteNameOfTarget.indexOf("/", absoluteNameOfParent.length + 1);

                    if (indexOfSlash == -1) {
                        absoluteNameOfNextParent = absoluteNameOfTarget;
                    } else {
                        absoluteNameOfNextParent = absoluteNameOfTarget.substring(0, indexOfSlash);
                    }

                    this.onDrillDownClickWithParam(selectedPolygon, () => {
                        this.onRecursiveDrillDownWithAbsoluteName(absoluteNameOfNextParent, absoluteNameOfTarget);
                    });

                } else {
                    Notify.showError("You cannot drill down of " + selectedPolygon.externalData.absoluteName + " because it is a region that cannot be added.");
                }
            }

        } else {

            let targetPolygon = _.find(this.polygons, polygon => {
                return polygon.externalData.absoluteName == absoluteNameOfTarget;
            });

            this.onPolygonClick(targetPolygon);

            let bounds = new google.maps.LatLngBounds();

            targetPolygon.getPath().forEach(latLng => {
                bounds.extend(latLng);
            });

            this.map.fitBounds(bounds);
        }
    }

    onDrillDownClick() {

        let selectedPolygon = _.find(this.polygons, polygon => {
            return polygon.externalData.selected;
        });

        this.onDrillDownClickWithParam(selectedPolygon, () => {});
    }

    onDrillDownClickWithParam(selectedPolygon, callbackFunction) {

        ZoneService.getIdsOfChildrenOfPolygonRegion(selectedPolygon.externalData.parent, selectedPolygon.externalData.name).then(response1 => {

            let idsOfChildren = response1.data;
            let idsOfChildrenThatCouldNotBeFoundInExistingData = [];

            idsOfChildren.forEach(id => {

                let polygon = _.find(this.polygons, elem => {
                    return elem.externalData.id == id;
                });

                if (polygon) {
                    polygon.externalData.type = POLYGON_TYPE_THAT_CAN_BE_ADDED;
                    polygon.externalData.selected = false;
                    polygon.externalData.category = null;
                    polygon.setOptions({fillColor: this.getFillColor(polygon.externalData.type, polygon.externalData.selected, polygon.externalData.category)});
                    polygon.setVisible(true);
                } else {
                    idsOfChildrenThatCouldNotBeFoundInExistingData.push(id);
                }
            });

            let internalCallbackFunction = () => {

                selectedPolygon.externalData.type = POLYGON_TYPE_THAT_CAN_BE_ADDED;
                selectedPolygon.externalData.selected = false;
                selectedPolygon.externalData.category = null;
                selectedPolygon.setOptions({fillColor: this.getFillColor(selectedPolygon.externalData.type, selectedPolygon.externalData.selected, selectedPolygon.externalData.category)});
                selectedPolygon.setVisible(false);

                this.drawPolygons(this.map, this.polygons);

                this.refreshButtons();

                callbackFunction();
            };

            if (idsOfChildrenThatCouldNotBeFoundInExistingData.length == 0) {
                internalCallbackFunction();
            } else {

                ZoneService.getPolygonRegionsByIds(idsOfChildrenThatCouldNotBeFoundInExistingData.join(",")).then(response2 => {

                    let childrenThatCouldNotBeFoundInExistingData = response2.data;

                    childrenThatCouldNotBeFoundInExistingData.forEach(elem => {
                        let polygon = this.convertPolygonRegionToGoogleMapsPolygon(elem, POLYGON_TYPE_THAT_CAN_BE_ADDED, false);
                        this.polygons.push(polygon);
                    });

                    internalCallbackFunction();

                }).catch(error => {
                    Notify.showError(error);
                });
            }

        }).catch(error => {
            Notify.showError(error);
        });
    }

    onRollUpClick() {

        let selectedPolygon = _.find(this.polygons, polygon => {
            return polygon.externalData.selected;
        });

        let anyPolygon = _.find(this.polygons, polygon => {
            return polygon.externalData.absoluteName.startsWith(selectedPolygon.externalData.parent + "/") &&
                polygon.externalData.type == POLYGON_TYPE_THAT_CANNOT_BE_ADDED;
        });

        if (anyPolygon) {
            Notify.showError("You cannot roll up when upper region has at least one sub region that cannot be added.");
        } else {

            ZoneService.getIdOfParentOfPolygonRegion(selectedPolygon.externalData.parent, selectedPolygon.externalData.name).then(response1 => {

                let idOfParent = response1.data;

                let polygon = _.find(this.polygons, elem => {
                    return elem.externalData.id == idOfParent;
                });

                let callbackFunction = () => {

                    let parent = _.find(this.polygons, elem => {
                        return elem.externalData.id == idOfParent;
                    });

                    parent.externalData.type = POLYGON_TYPE_THAT_CAN_BE_ADDED;
                    parent.externalData.selected = false;
                    parent.externalData.category = null;
                    parent.setOptions({fillColor: this.getFillColor(parent.externalData.type, parent.externalData.selected, parent.externalData.category)});
                    parent.setVisible(true);

                    this.polygons.forEach(elem => {
                        if (elem.externalData.absoluteName.startsWith(parent.externalData.absoluteName + "/")) {
                            elem.externalData.type = POLYGON_TYPE_THAT_CAN_BE_ADDED;
                            elem.externalData.selected = false;
                            elem.externalData.category = null;
                            elem.setOptions({fillColor: this.getFillColor(elem.externalData.type, elem.externalData.selected, elem.externalData.category)});
                            elem.setVisible(false);
                        }
                    });

                    this.drawPolygons(this.map, this.polygons);

                    this.refreshButtons();
                };

                if (polygon) {
                    callbackFunction();
                } else {

                    ZoneService.getParentOfPolygonRegion(selectedPolygon.externalData.parent, selectedPolygon.externalData.name).then(response2 => {

                        let parentPolygonRegion = response2.data;

                        let parent = this.convertPolygonRegionToGoogleMapsPolygon(parentPolygonRegion, POLYGON_TYPE_THAT_CAN_BE_ADDED, false);

                        this.polygons.push(parent);

                        callbackFunction();

                    }).catch(error => {
                        Notify.showError(error);
                    });
                }

            }).catch(error => {
                Notify.showError(error);
            });
        }
    }

    onSelectAllClick() {
        this.polygons.forEach(polygon => {
            if (polygon.getVisible() && polygon.externalData.type == POLYGON_TYPE_THAT_CAN_BE_ADDED) {
                polygon.externalData.selected = true;
                polygon.setOptions({fillColor: this.getFillColor(polygon.externalData.type, polygon.externalData.selected, polygon.externalData.category)});
            }
        });
        this.refreshButtons();
    }

    onDeselectAllClick() {
        this.polygons.forEach(polygon => {
            polygon.externalData.selected = false;
            polygon.setOptions({fillColor: this.getFillColor(polygon.externalData.type, polygon.externalData.selected, polygon.externalData.category)});
        });
        this.refreshButtons();
    }

    refreshButtons() {

        this.map.controls[google.maps.ControlPosition.TOP_RIGHT].clear();

        let selectedPolygons = _.filter(this.polygons, elem => {
            return elem.externalData.selected;
        });

        let controls = null;

        if (selectedPolygons.length > 0) {

            let showAddButton = (selectedPolygons.length > 0 && selectedPolygons[0].externalData.type == POLYGON_TYPE_THAT_CAN_BE_ADDED);
            let multipleAdd = (showAddButton && selectedPolygons.length > 1);
            let showRemoveButton = (selectedPolygons.length > 0 && selectedPolygons[0].externalData.type == POLYGON_TYPE_THAT_ARE_ADDED);
            let multipleRemove = (showRemoveButton && selectedPolygons.length > 1);
            let showDrillDownButton = (selectedPolygons.length == 1);
            let disableDrillDownButton = (showDrillDownButton && selectedPolygons[0].externalData.hasChildren == false);
            let showRollUpButton = (selectedPolygons.length == 1);
            let disableRollUpButton = (showRollUpButton && selectedPolygons[0].externalData.hasParent == false);

            let addButton = null;
            let removeButton = null;
            let clearSelectionButton = null;
            let drillDownButton = null;
            let rollUpButton = null;

            if (showAddButton) {

                if (this.categoriesWhenAdding.length == 0) {

                    addButton = (
                        <td>
                            <Button label={multipleAdd ? "ADD ALL" : "ADD"} waves={true}
                                    onclick={() => this.onAddClick(null)}/>
                        </td>
                    );

                } else {

                    let options = [];

                    this.categoriesWhenAdding.forEach(category => {
                        let option = {
                            label: category.name,
                            onclick: () => {
                                this.onAddClick(category)
                            }
                        };
                        options.push(option);
                    });

                    addButton = (
                        <td>
                            <DropDownButton label={multipleAdd ? "ADD ALL" : "ADD"} waves={true} width="50px"
                                            options={options}/>
                        </td>
                    );
                }
            }

            if (showRemoveButton) {
                removeButton = (
                    <td>
                        <Button label={multipleRemove ? "REMOVE ALL" : "REMOVE"} waves={true}
                                onclick={() => this.onRemoveClick()}/>
                    </td>
                );
            }

            if (multipleAdd || multipleRemove) {
                clearSelectionButton = (
                    <td>
                        <Button label="DESELECT ALL" waves={true} onclick={() => this.onDeselectAllClick()}/>
                    </td>
                );
            }

            if (showDrillDownButton) {
                drillDownButton = (
                    <td>
                        <Button label="DRILL DOWN" waves={true} onclick={() => this.onDrillDownClick()}
                                disabled={disableDrillDownButton}/>
                    </td>
                );
            }

            if (showRollUpButton) {
                rollUpButton = (
                    <td>
                        <Button label="ROLL UP" waves={true} onclick={() => this.onRollUpClick()}
                                disabled={disableRollUpButton}/>
                    </td>
                );
            }

            controls = (
                <table>
                    <tbody>
                    <tr>
                        {addButton}
                        {removeButton}
                        {clearSelectionButton}
                        {drillDownButton}
                        {rollUpButton}
                    </tr>
                    </tbody>
                </table>
            );

        } else {

            let anyPolygonThatCanBeAdded = _.find(this.polygons, elem => {
                return elem.getVisible() && elem.externalData.type == POLYGON_TYPE_THAT_CAN_BE_ADDED;
            });

            // Yani en az bir adet seçilebilecek polygon varsa...
            if (anyPolygonThatCanBeAdded) {
                controls = (
                    <table>
                        <tbody>
                        <tr>
                            <td>
                                <Button label="Select All" waves={true} onclick={() => this.onSelectAllClick()}/>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                );
            }
        }

        if (controls) {
            let controlsDiv = document.createElement('div');
            ReactDOM.render(controls, controlsDiv);
            this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(controlsDiv);
        }
    }

    getAddedPolygons() {

        let addedPolygons = [];

        this.polygons.forEach(polygon => {
            if (polygon.externalData.type == POLYGON_TYPE_THAT_ARE_ADDED) {
                addedPolygons.push(polygon);
            }
        });

        return addedPolygons;
    }

    render() {
        return (
            <div key={this.id} id={this.mapId} style={{width: this.props.width, height: this.props.height}}/>
        );
    }
}