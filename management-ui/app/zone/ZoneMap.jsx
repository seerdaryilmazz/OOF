import React from "react";
import {Map} from "susam-components/advanced";
import {Notify} from "susam-components/basic";
import {ZoneService} from "../services";
import _ from "lodash";
import uuid from "uuid";

class Polygon {

    constructor(paths) {
        this.paths = paths;
    }
}

class PolygonTreeNode {

    constructor(id, name, parent, parentNode, childNodes, polygons, hasParent, hasChildren, countryIsoAlpha3Code, bounds, selected, zoneZipCodeRep, zIndex) {
        this.id = id;
        this.name = name;
        this.parent = parent;
        this.parentNode = parentNode;
        this.childNodes = childNodes;
        this.polygons = polygons;
        this.hasParent = hasParent;
        this.hasChildren = hasChildren;
        this.countryIsoAlpha3Code = countryIsoAlpha3Code;
        this.bounds = bounds;
        this.selected = selected;
        this.zoneZipCodeRep = zoneZipCodeRep;
        this.zIndex = zIndex;
    }

    addChildNode(childNode) {
        childNode.parentNode = this;
        this.childNodes.push(childNode);
    }

    clearChildNodes() {
        this.childNodes = [];
    }

    findWithNameAndParent(name, parent) {
        if (this.name == name && this.parent == parent) {
            return this;
        }

        for (let i = 0; i < this.childNodes.length; i++) {
            let ret = this.childNodes[i].findWithNameAndParent(name, parent);
            if (ret) {
                return ret;
            }
        }

        return null;
    }

    findLeaves(leaves) {
        if (this.childNodes.length == 0) {
            leaves.push(this);
        } else {
            for (let i = 0; i < this.childNodes.length; i++) {
                this.childNodes[i].findLeaves(leaves);
            }
        }
    }

    findAll(all) {
        all.push(this);

        for (let i = 0; i < this.childNodes.length; i++) {
            this.childNodes[i].findAll(all);
        }
    }

    getOuterPaths() {
        let outerPaths = [];
        this.polygons.forEach(polygon=> {
            outerPaths.push(polygon.paths[0]);
        });
        return outerPaths;
    }

    getPaths() {
        let paths = [];
        this.polygons.forEach(polygon=> {
            polygon.paths.forEach(path => {
                paths.push(path)
            });
        });
        return paths;
    }

    hasChildNodeWithId(id) {
        for (let i = 0; i < this.childNodes.length; i++) {
            if (this.childNodes[i].id == id) {
                return true;
            }
        }

        return false;
    }
}

class PolygonTree {

    constructor() {
        this.root = new PolygonTreeNode(-1, "__ROOT__", null, null, [], [], null, null, null, null, null, null, 1);
    }

    findWithNameAndParent(name, parent) {
        return this.root.findWithNameAndParent(name, parent);
    }

    findLeaves() {
        let leaves = [];
        this.root.childNodes.forEach(childNode => {
            childNode.findLeaves(leaves);
        });
        return leaves;
    }

    findAll() {
        let all = [];
        this.root.childNodes.forEach(childNode => {
            childNode.findAll(all);
        });
        return all;
    }
}

export class ZoneMap extends React.Component {

    constructor(props) {
        super(props);
        this.id = uuid.v4();
        this.state = {
            polygonData: [],
            loading: false,
        };
        this.polygonTree = new PolygonTree();
        this.resizeBounds = null;
        this.idCounter = 0;
    }

    componentWillReceiveProps(nextProps) {
        let oldZonePolygonRegions = this.props.zone ? this.props.zone.polygonRegions : null;
        let newZonePolygonRegions = nextProps.zone ? nextProps.zone.polygonRegions : null;
        if (!_.isEqual(oldZonePolygonRegions, newZonePolygonRegions)) {
            this.updateZone(nextProps.zone);
        }
    }

    convertPolygonRegionToPolygonTreeNode(polygonRegion) {
        let polygonTreeNode = null;

        if (polygonRegion) {
            polygonTreeNode = new PolygonTreeNode(this.idCounter++, polygonRegion.name, polygonRegion.parent, null, [], [], polygonRegion.hasParent, polygonRegion.hasChildren, polygonRegion.countryIsoAlpha3Code, null, null, null, 1);

            if (polygonRegion.polygons && polygonRegion.polygons.length > 0) {
                polygonRegion.polygons.forEach(polygon => {
                    let outerPath = null;
                    let innerPaths = [];

                    if (polygon.rings && polygon.rings.length > 0) {
                        polygon.rings.forEach(ring => {
                            if (ring.type.id == "OUTER") {
                                outerPath = ring.encodedCoordinatesString.value;
                            } else {
                                innerPaths.push(ring.encodedCoordinatesString.value);
                            }
                        });
                    }

                    if (outerPath) {
                        let paths = [outerPath];
                        innerPaths.forEach(innerPath => {
                            paths.push(innerPath);
                        });

                        polygonTreeNode.polygons.push(new Polygon(paths));
                    }
                });
            }

            polygonTreeNode.bounds = this._map.getBounds(polygonTreeNode.getOuterPaths());
        }

        return polygonTreeNode;
    }

    updatePolygonData(callback) {
        let polygonData = [];

        this.polygonTree.findLeaves().forEach(leaf => {
            let shouldShowLeaf = this.props.editable ? true : leaf.selected;
            if (shouldShowLeaf) {
                let leafCopy = _.cloneDeep(leaf);
                polygonData.push({
                    id: leafCopy.id,
                    paths: leafCopy.getPaths(),
                    color: leafCopy.selected ? "#00AA00" : "#FF0000",
                    zIndex: leafCopy.zIndex,
                    data: leafCopy,
                });
            }
        });

        this.setState({polygonData: polygonData}, () => {
            if (callback) {
                callback();
            }
        });
    }

    clearLoading(callback) {
        this.setState({loading: false}, () => {
            if (callback) {
                callback();
            }
        });
    }

    updateCountry(country) {
        if (country && country.isoAlpha3Code) {
            this.setState({loading: true}, () => {
                ZoneService.getCountryPolygonRegion(country.isoAlpha3Code).then(response => {
                    let polygonTreeNode = this.convertPolygonRegionToPolygonTreeNode(response.data);
                    let foundPolygonTreeNode = this.polygonTree.findWithNameAndParent(polygonTreeNode.name, polygonTreeNode.parent);

                    if (!foundPolygonTreeNode) {
                        this.polygonTree.root.addChildNode(polygonTreeNode);
                        this.updatePolygonData(() => {
                            this._map.fitBounds(polygonTreeNode.bounds);
                            this.clearLoading();
                        });
                    } else {
                        this._map.fitBounds(foundPolygonTreeNode.bounds);
                        this.clearLoading();
                    }
                }).catch(error => {
                    Notify.showError(error);
                    this.clearLoading();
                });
            });
        }
    }

    updateZone(zone) {
        this.setState({loading: true}, () => {
            this.polygonTree = new PolygonTree();

            if (zone && zone.polygonRegions && zone.polygonRegions.length > 0) {
                let copy = _.cloneDeep(zone.polygonRegions);
                let maxIters = copy.length;

                for (let i = 0; i < maxIters; i++) {
                    if (copy.length == 0) {
                        break;
                    }

                    for (let j = copy.length - 1; j >= 0; j--) {
                        let item = copy[j];

                        let polygonTreeNode = this.convertPolygonRegionToPolygonTreeNode(item.polygonRegion);
                        polygonTreeNode.selected = item.selected;
                        polygonTreeNode.zoneZipCodeRep = item.zoneZipCode ? item.zoneZipCode.rep : null;

                        if (item.zoneZipCode) {
                            // Polygons which are coming from zip codes are added to the polygon tree root
                            polygonTreeNode.zIndex = 2;
                            this.polygonTree.root.addChildNode(polygonTreeNode);
                            copy.splice(j, 1);
                        } else {
                            // Polygons which are not coming from zip codes are added to their parent
                            let parentName = item.polygonRegion.parent;
                            if (parentName == "/") {
                                this.polygonTree.root.addChildNode(polygonTreeNode);
                                copy.splice(j, 1);
                            } else {
                                let lastIndex = parentName.lastIndexOf("/");
                                let parentParentName = parentName.substring(0, lastIndex);
                                let parentSingleName = parentName.substring(lastIndex + 1);

                                let polygonTreeNodeParent = this.polygonTree.findWithNameAndParent(parentSingleName, parentParentName == "" ? "/" : parentParentName);
                                if (polygonTreeNodeParent) {
                                    polygonTreeNodeParent.addChildNode(polygonTreeNode);
                                    copy.splice(j, 1);
                                }
                            }
                        }
                    }
                }

                if (copy.length != 0) {
                    Notify.showError("Some polygons are in error!");
                    console.log(copy);
                }
            }

            if (this.polygonTree.root.childNodes && this.polygonTree.root.childNodes.length > 0) {
                this.resizeBounds = this._map.unionBounds(this.polygonTree.root.childNodes.map(childNode => childNode.bounds));
            }

            this.updatePolygonData(() => {
                if (this.resizeBounds) {
                    this._map.fitBounds(this.resizeBounds);
                }
                this.clearLoading();
            });
        });
    }

    findPolygonTreeNodeFromPolygonData(polygonData) {
        return this.polygonTree.findWithNameAndParent(polygonData.data.name, polygonData.data.parent);
    }

    select(polygonData) {
        this.setState({loading: true}, () => {
            let foundPolygonTreeNode = this.findPolygonTreeNodeFromPolygonData(polygonData);
            foundPolygonTreeNode.selected = foundPolygonTreeNode.selected ? false : true;
            this.updatePolygonData(() => {
                this.clearLoading();
            });
        });
    }

    levelDown(polygonData) {
        this.setState({loading: true}, () => {
            let foundPolygonTreeNode = this.findPolygonTreeNodeFromPolygonData(polygonData);

            ZoneService.getChildrenOfPolygonRegion(foundPolygonTreeNode.parent, foundPolygonTreeNode.name).then(response => {
                response.data.forEach(child => {
                    foundPolygonTreeNode.addChildNode(this.convertPolygonRegionToPolygonTreeNode(child));
                });

                this.updatePolygonData(() => {
                    this.clearLoading();
                });
            }).catch(error => {
                Notify.showError(error);
                this.clearLoading();
            });
        });
    }

    levelUp(polygonData) {
        this.setState({loading: true}, () => {
            let foundPolygonTreeNode = this.findPolygonTreeNodeFromPolygonData(polygonData);
            foundPolygonTreeNode.parentNode.clearChildNodes();
            this.updatePolygonData(() => {
                this.clearLoading();
            });
        });
    }

    deletePolygon(polygonData) {
        this.setState({loading: true}, () => {
            let foundPolygonTreeNode = this.findPolygonTreeNodeFromPolygonData(polygonData);
            _.remove(foundPolygonTreeNode.parentNode.childNodes, c => {
                return c.id == polygonData.data.id;
            });

            this.updatePolygonData(() => {
                this.clearLoading();
            });
        });
    }

    onShowPolygonInfo(polygonData) {
        if (this.state.loading) {
            return <span></span>;
        }

        let buttons = [];
        let zoneZipCodeRepDiv = null;

        if (!polygonData.data.zoneZipCodeRep) {
            // Add buttons for polygons coming from map selection
            // Do not show any buttons for polygons that come from zone zip code selection

            // Always add the select/unselect button
            buttons.push(
                <a className="uk-button uk-button-small" href="javascript:void(0)"
                   onClick={(e) => this.select(polygonData)}>
                    <i className={polygonData.data.selected ? "uk-icon-close" : "uk-icon-check-square-o"}></i>
                </a>
            );

            // A polygon can go down if it has children and it is not selected
            if (polygonData.data.hasChildren && !polygonData.data.selected) {
                buttons.push(
                    <a className="uk-button uk-button-small" href="javascript:void(0)"
                       onClick={(e) => this.levelDown(polygonData)}>
                        <i className="uk-icon-level-down"></i>
                    </a>
                );
            }

            // A polygon can go up if it has a parent and none of its siblings are selected
            if (polygonData.data.hasParent) {
                let selectedSiblingCount = 0;
                polygonData.data.parentNode.childNodes.forEach(s => {
                    if (s.selected) {
                        selectedSiblingCount++
                    }
                });

                if (selectedSiblingCount == 0) {
                    buttons.push(
                        <a className="uk-button uk-button-small" href="javascript:void(0)"
                           onClick={(e) => this.levelUp(polygonData)}>
                            <i className="uk-icon-level-up"></i>
                        </a>
                    );
                }
            }

            // A polygon can be deleted if it is the child of the root
            if (this.polygonTree.root.hasChildNodeWithId(polygonData.data.id)) {
                buttons.push(
                    <a className="uk-button uk-button-small" href="javascript:void(0)"
                       onClick={(e) => this.deletePolygon(polygonData)}>
                        <i className="uk-icon-trash-o"></i>
                    </a>
                );
            }
        } else {
            zoneZipCodeRepDiv = (
                <div style={{overflow: "hidden", maxHeight: "18px"}}>
                    {polygonData.data.zoneZipCodeRep}
                </div>
            );
        }

        let buttonsDiv = null;
        if (buttons.length > 0) {
            buttonsDiv = (
                <div className="uk-button-group">
                    {buttons}
                </div>
            );
        }

        return (
            <div style={{
                display: "inline-block",
                lineHeight: "20px",
                backgroundColor: "white",
                borderRadius: "10px",
                padding: "5px",
                minWidth: "70px",
            }}>
                <div>
                    <div style={{overflow: "hidden", maxHeight: "18px"}}>
                        {polygonData.data.name}
                    </div>
                    {zoneZipCodeRepDiv}
                </div>
                {buttonsDiv}
            </div>
        );
    }

    getPolygonData() {
        let all = this.polygonTree.findAll();
        return all.map(item => {
            return {
                selected: item.selected,
                polygonRegion: {
                    parent: item.parent,
                    name: item.name
                },
                zoneZipCodeRep: item.zoneZipCodeRep,
            }
        });
    }

    onResize() {
        if (this.resizeBounds) {
            window.setTimeout(() => {
                if (this.resizeBounds) {
                    this._map.fitBounds(this.resizeBounds);
                    this.resizeBounds = null;
                }
            }, 1000);
        }
    }

    calculateHierarchyHelper(str, h) {
        if (str == "/") {
            return;
        }

        let lastSlashIndex = str.lastIndexOf("/");
        if (lastSlashIndex != -1) {
            let name = str.substring(lastSlashIndex + 1);
            let parent = str.substring(0, lastSlashIndex == 0 ? 1 : lastSlashIndex);
            h.unshift({name: name, parent: parent});
            this.calculateHierarchyHelper(parent, h);
        }
    }

    calculateHierarchy(polygonRegion) {
        let str = polygonRegion.parent + (polygonRegion.parent == "/" ? "" : "/") + polygonRegion.name;
        let hierarchy = [];
        this.calculateHierarchyHelper(str, hierarchy);
        return hierarchy;
    }

    getZoneZipCodeRep(zoneZipCode) {
        // Should be the same as ZoneZipCode.getRep
        if (zoneZipCode.zoneZipCodeType.id == "STARTS") {
            return zoneZipCode.country.iso + " " + zoneZipCode.value1 + "*";
        } else if (zoneZipCode.zoneZipCodeType.id == "EQUALS") {
            return zoneZipCode.country.iso + " " + zoneZipCode.value1;
        } else {
            return null;
        }
    }

    addZoneZipCode(zoneZipCode) {
        let request = ZoneService.getPolygonRegionsByPostcode(zoneZipCode.country.isoAlpha3Code, zoneZipCode.zoneZipCodeType.id, zoneZipCode.value1, true);
        if (request) {
            let zoneZipCodeRep = this.getZoneZipCodeRep(zoneZipCode);
            this.setState({loading: true}, () => {
                request.then(response => {
                    response.data.forEach(polygonRegion => {
                        let polygonTreeNode = this.convertPolygonRegionToPolygonTreeNode(polygonRegion);
                        polygonTreeNode.selected = true;
                        polygonTreeNode.zoneZipCodeRep = zoneZipCodeRep;
                        polygonTreeNode.zIndex = 2;
                        this.polygonTree.root.addChildNode(polygonTreeNode);
                    });

                    this.updatePolygonData(() => {
                        this.clearLoading();
                    });
                }).catch(error => {
                    Notify.showError(error);
                    this.clearLoading();
                });
            });
        }
    }

    updateZoneZipCode(oldZoneZipCode, newZoneZipCode) {
        this.deleteZoneZipCode(oldZoneZipCode, () => {
            this.addZoneZipCode(newZoneZipCode);
        });
    }

    deleteZoneZipCode(zoneZipCode, callback) {
        this.setState({loading: true}, () => {
            let zoneZipCodeRep = this.getZoneZipCodeRep(zoneZipCode);
            _.remove(this.polygonTree.root.childNodes, n => {
                return n.zoneZipCodeRep == zoneZipCodeRep;
            });

            this.updatePolygonData(() => {
                this.clearLoading(() => {
                    if (callback) {
                        callback();
                    }
                });
            });
        });
    }

    render() {
        return (
            <div>
                <Map width="100%"
                     height="550px"
                     polygonData={this.state.polygonData}
                     onShowPolygonInfo={(data) => this.onShowPolygonInfo(data)}
                     ref={(c) => this._map = c}
                     editablePoligons={this.props.editable}
                     onResize={() => this.onResize()}/>
            </div>
        );
    }
}