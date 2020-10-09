import React from "react";
import _ from "lodash";
import uuid from 'uuid';
import * as axios from 'axios';
import Script from 'react-load-script';

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card, PageHeader} from "susam-components/layout";
import {Notify, TextInput, DropDown, Button} from "susam-components/basic";
import {Map, Chip} from "susam-components/advanced";
import {RegionMapWithPostcodeFilter} from "./RegionMapWithPostcodeFilter";
import {CollectionAndDistributionRegionEdit} from "./CollectionAndDistributionRegionEdit";

import {ZoneService, LocationService} from '../services';

export class OperationRegionEdit extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            data: null, // Bu alanı sadece edit aşamasında, verinin orjinal halini tutmak için kullanıyoruz.
            id: props.location.query.id ? props.location.query.id : null,
            name: null,
            tags: [],
            collectionRegions: [],
            distributionRegions: [],
            polygonRegionsThatCanBeAdded: [],
            polygonRegionsThatCannotBeAdded: [],
            polygonRegionsThatAreAdded: [],
            allTags: [],
            scriptLoaded: false
        }
        this.caller = uuid.v4();
    }

    componentDidMount() {
        this.loadTags();
        this.init(this.state.id);
        this.initMapRelatedData(this.state.id);
    }

    loadTags() {
        ZoneService.getZoneTags().then(response => {
            this.setState({allTags: response.data ? response.data : []});
        }).catch(error => {
            this.setState({allTags: []});
            Notify.showError(error);
        });
    }

    sortCollectionRegions(collectionRegions) {
        return _.sortBy(collectionRegions, elem => {
            return elem.name;
        });
    }

    sortDistributionRegions(distributionRegions) {
        return _.sortBy(distributionRegions, elem => {
            return elem.name;
        });
    }

    getPolygonRegionAbsoluteName(polygonRegion) {
        if (polygonRegion.parent == "/") {
            return polygonRegion.parent + polygonRegion.name;
        } else {
            return polygonRegion.parent + "/" + polygonRegion.name;
        }
    }

    init(operationRegionId) {

        if (operationRegionId) {

            ZoneService.getOperationRegionAccordingToQueryFive(operationRegionId).then(response => {

                let data = response.data;
                let name = data.name;
                let tags = data.tags ? data.tags : []; // tags zorunlu olmadığı için null olabilir
                let collectionRegions = this.sortCollectionRegions(data.collectionRegions);
                let distributionRegions = this.sortDistributionRegions(data.distributionRegions);

                collectionRegions.forEach(elem => {
                    elem._key = uuid.v4();
                    elem.collectionRegionToPolygonRegions.forEach(elemInner => {
                        elemInner.polygonRegion.absoluteName = this.getPolygonRegionAbsoluteName(elemInner.polygonRegion);
                    });
                });

                distributionRegions.forEach(elem => {
                    elem._key = uuid.v4();
                    elem.distributionRegionToPolygonRegions.forEach(elemInner => {
                        elemInner.polygonRegion.absoluteName = this.getPolygonRegionAbsoluteName(elemInner.polygonRegion);
                    });
                });

                this.setState({
                    data: data,
                    id: operationRegionId,
                    name: name,
                    tags: tags,
                    collectionRegions: collectionRegions,
                    distributionRegions: distributionRegions
                });

            }).catch(error => {
                Notify.showError(error);
            });
        }
    }

    initMapRelatedData(operationRegionId) {

        let callbackFunction = (polygonRegionsThatCanBeAdded, polygonRegionsThatCannotBeAdded, polygonRegionsThatAreAdded) => {
            this.caller = uuid.v4();
            this.setState({
                    polygonRegionsThatCanBeAdded: polygonRegionsThatCanBeAdded,
                    polygonRegionsThatCannotBeAdded: polygonRegionsThatCannotBeAdded,
                    polygonRegionsThatAreAdded: polygonRegionsThatAreAdded}, () => { /*console.log("query end");*/ });
        };

        this.getMapInputDataSingleThreaded(operationRegionId, callbackFunction);
    }

    getMapInputDataSingleThreaded(operationRegionId, callbackFunction) {
        ZoneService.findDataForOperationRegionMap(operationRegionId).then(response => {
            callbackFunction(response.data.polygonRegionsThatCanBeAdded,
                response.data.polygonRegionsThatCannotBeAdded, response.data.polygonRegionsThatAreAdded);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    // getMapInputDataMultiThreaded(operationRegionId) {
    //
    //     ZoneService.getPolygonRegionIdsOfMapInputDataForOperationRegion(operationRegionId).then(response => {
    //
    //         let polygonRegionIdAndTypePairs = [];
    //
    //         response.data.idsOfPolygonRegionsThatCanBeAdded.forEach(id => {
    //             polygonRegionIdAndTypePairs.push(new PolygonRegionIdAndTypePair(id, POLYGON_REGION_TYPE_THAT_CAN_BE_ADDED));
    //         });
    //
    //         response.data.idsOfPolygonRegionsThatCannotBeAdded.forEach(id => {
    //             polygonRegionIdAndTypePairs.push(new PolygonRegionIdAndTypePair(id, POLYGON_REGION_TYPE_THAT_CANNOT_BE_ADDED));
    //         });
    //
    //         response.data.idsOfPolygonRegionsThatAreAdded.forEach(id => {
    //             polygonRegionIdAndTypePairs.push(new PolygonRegionIdAndTypePair(id, POLYGON_REGION_TYPE_THAT_ARE_ADDED));
    //         });
    //
    //         // this.getPolygonRegionsOneByOne([], [], [], polygonRegionIdAndTypePairs);
    //         this.getPolygonRegionsBulk([], [], [], polygonRegionIdAndTypePairs);
    //
    //     }).catch(error => {
    //         Notify.showError(error);
    //     });
    // }

    // getPolygonRegionsOneByOne(polygonRegionsThatCanBeAdded, polygonRegionsThatCannotBeAdded, polygonRegionsThatAreAdded, idAndTypePairs) {
    //
    //     let promises = [];
    //
    //     idAndTypePairs.every((pair, index) => {
    //         promises.push(ZoneService.getPolygonRegion(pair.id));
    //         if (index < 4) { // 4+1 yani 5, thread sayısı oluyor.
    //             return true;
    //         } else {
    //             return false;
    //         }
    //     });
    //
    //     let deletedElems = idAndTypePairs.splice(0, promises.length);
    //
    //     axios.all(promises).then(responses => {
    //
    //         responses.forEach((response, index) => {
    //
    //             let pair = deletedElems[index]; // TODO: Burayı daha anlaşılır yapmak lazım.
    //
    //             if (pair.type == POLYGON_REGION_TYPE_THAT_CAN_BE_ADDED) {
    //                 polygonRegionsThatCanBeAdded.push(response.data);
    //             } else if (pair.type == POLYGON_REGION_TYPE_THAT_CANNOT_BE_ADDED) {
    //                 polygonRegionsThatCannotBeAdded.push(response.data);
    //             } else if (pair.type == POLYGON_REGION_TYPE_THAT_ARE_ADDED) {
    //                 polygonRegionsThatAreAdded.push(response.data);
    //             }
    //         });
    //
    //         if (idAndTypePairs.length > 0) {
    //             this.getPolygonRegionsOneByOne(polygonRegionsThatCanBeAdded, polygonRegionsThatCannotBeAdded, polygonRegionsThatAreAdded, idAndTypePairs);
    //         } else {
    //             this.setState({
    //                 polygonRegionsThatCanBeAdded: polygonRegionsThatCanBeAdded,
    //                 polygonRegionsThatCannotBeAdded: polygonRegionsThatCannotBeAdded,
    //                 polygonRegionsThatAreAdded: polygonRegionsThatAreAdded}, () => { /*console.log("query end");*/ });
    //         }
    //
    //     }).catch((error) => {
    //         Notify.showError(error);
    //     });
    // }

    // getPolygonRegionsBulk(polygonRegionsThatCanBeAdded, polygonRegionsThatCannotBeAdded, polygonRegionsThatAreAdded, idAndTypePairs) {
    //
    //     let promises = [];
    //     let ids = [];
    //
    //     idAndTypePairs.forEach((pair, index) => {
    //         ids.push(pair.id);
    //         if (ids.length == 20 || idAndTypePairs.length == index + 1) {
    //             promises.push(ZoneService.getPolygonRegionsByIds(ids.join(",")));
    //             ids = [];
    //         }
    //     });
    //
    //     axios.all(promises).then(responses => {
    //
    //         responses.forEach((response) => {
    //
    //             response.data.forEach(polygonRegion => {
    //
    //                 let pair = _.find(idAndTypePairs, elem => {
    //                     return elem.id == polygonRegion.id;
    //                 });
    //
    //                 if (pair.type == POLYGON_REGION_TYPE_THAT_CAN_BE_ADDED) {
    //                     polygonRegionsThatCanBeAdded.push(polygonRegion);
    //                 } else if (pair.type == POLYGON_REGION_TYPE_THAT_CANNOT_BE_ADDED) {
    //                     polygonRegionsThatCannotBeAdded.push(polygonRegion);
    //                 } else if (pair.type == POLYGON_REGION_TYPE_THAT_ARE_ADDED) {
    //                     polygonRegionsThatAreAdded.push(polygonRegion);
    //                 }
    //             });
    //         });
    //
    //         this.setState({
    //             polygonRegionsThatCanBeAdded: polygonRegionsThatCanBeAdded,
    //             polygonRegionsThatCannotBeAdded: polygonRegionsThatCannotBeAdded,
    //             polygonRegionsThatAreAdded: polygonRegionsThatAreAdded}, () => { /*console.log("query end");*/ });
    //
    //     }).catch((error) => {
    //         Notify.showError(error);
    //     });
    // }

    onResize() {

    }

    updateName(value) {
        this.setState({name: value});
    }

    updateTags(value) {
        this.setState({tags: value});
    }

    onCreateNewCollectionRegionClick() {

        let polygonsOfOperationRegion = this.operationRegionMapComponent.getAddedPolygons();

        if (polygonsOfOperationRegion.length == 0) {
            Notify.showError("Operation region must have at least one region.");
        } else {

            let polygonRegionIdsOfOperationRegion = [];
            let polygonRegionIdsOfOtherCollectionRegions = [];
            let polygonRegionIdsOfSelectedCollectionRegion = [];

            polygonsOfOperationRegion.forEach(polygon => {
                polygonRegionIdsOfOperationRegion.push(polygon.externalData.id);
            });

            this.state.collectionRegions.forEach(elem => {
                elem.collectionRegionToPolygonRegions.forEach(elemInner => {
                    polygonRegionIdsOfOtherCollectionRegions.push(elemInner.polygonRegion.id);
                });
            });

            let data = {
                name: null,
                tags: [],
                collectionRegionToPolygonRegions: []
            };

            ZoneService.findDataForCollectionRegionMap(
                polygonRegionIdsOfOperationRegion.join(","),
                polygonRegionIdsOfOtherCollectionRegions.join(","),
                polygonRegionIdsOfSelectedCollectionRegion.join(",")).then(response => {

                this.collectionAndDistributionRegionEditComponent.open(true, data, response.data.polygonRegionsThatCanBeAdded,
                    response.data.polygonRegionsThatCannotBeAdded, response.data.polygonRegionsThatAreAdded);

            }).catch(error => {
                Notify.showError(error);
            });
        }
    }

    onCollectionRegionClick(e, value) {

        e.preventDefault();

        let polygonsOfOperationRegion = this.operationRegionMapComponent.getAddedPolygons();

        let polygonRegionIdsOfOperationRegion = [];
        let polygonRegionIdsOfOtherCollectionRegions = [];
        let polygonRegionIdsOfSelectedCollectionRegion = [];

        polygonsOfOperationRegion.forEach(polygon => {
            polygonRegionIdsOfOperationRegion.push(polygon.externalData.id);
        });

        this.state.collectionRegions.forEach(elem => {
            if (elem._key != value._key) {
                elem.collectionRegionToPolygonRegions.forEach(elemInner => {
                    polygonRegionIdsOfOtherCollectionRegions.push(elemInner.polygonRegion.id);
                });
            }
        });

        let data = value;

        data.collectionRegionToPolygonRegions.forEach(elem => {
            polygonRegionIdsOfSelectedCollectionRegion.push(elem.polygonRegion.id);
        });

        ZoneService.findDataForCollectionRegionMap(
            polygonRegionIdsOfOperationRegion.join(","),
            polygonRegionIdsOfOtherCollectionRegions.join(","),
            polygonRegionIdsOfSelectedCollectionRegion.join(",")).then(response => {

            response.data.polygonRegionsThatAreAdded.forEach(elem => {

                let match = _.find(data.collectionRegionToPolygonRegions, elemInner => {
                    return elemInner.polygonRegion.id == elem.id;
                });

                elem.category = match.category;
            });

            this.collectionAndDistributionRegionEditComponent.open(true, data, response.data.polygonRegionsThatCanBeAdded,
                response.data.polygonRegionsThatCannotBeAdded, response.data.polygonRegionsThatAreAdded);

        }).catch(error => {
            Notify.showError(error);
        });
    }

    onDeleteCollectionRegionClick(value) {

        Notify.confirm("Are you sure you want to delete collection region with name " + value.name + "?", () => {

            let collectionRegions = _.cloneDeep(this.state.collectionRegions);

            _.remove(collectionRegions, elem => {
                return elem._key == value._key;
            });

            this.setState({collectionRegions: collectionRegions});
        });
    }

    onCollectionAndDistributionRegionSave(isCollectionRegion, value) {

        if (isCollectionRegion) {

            let collectionRegions = _.cloneDeep(this.state.collectionRegions);

            let anotherCollectionRegionWithSameName = _.find(collectionRegions, elem => {
                return elem.name == value.name && (value._key ? elem._key != value._key : true);
            });

            if (anotherCollectionRegionWithSameName) {
                Notify.showError("The specified name is already used.");
                return false;
            } else {

                if (value._key) {
                    _.remove(collectionRegions, elem => {
                        return elem._key == value._key;
                    });
                } else {
                    value._key = uuid.v4();
                }

                collectionRegions.push(value);

                collectionRegions = this.sortCollectionRegions(collectionRegions);

                this.setState({collectionRegions: collectionRegions});
                return true;
            }

        } else {

            let distributionRegions = _.cloneDeep(this.state.distributionRegions);

            let anotherDistributionRegionWithSameName = _.find(distributionRegions, elem => {
                return elem.name == value.name && (value._key ? elem._key != value._key : true);
            });

            if (anotherDistributionRegionWithSameName) {
                Notify.showError("The specified name is already used.");
                return false;
            } else {

                if (value._key) {
                    _.remove(distributionRegions, elem => {
                        return elem._key == value._key;
                    });
                } else {
                    value._key = uuid.v4();
                }

                distributionRegions.push(value);

                distributionRegions = this.sortDistributionRegions(distributionRegions);

                this.setState({distributionRegions: distributionRegions});
                return true;
            }
        }
    }

    onCreateNewDistributionRegionClick() {

        let polygonsOfOperationRegion = this.operationRegionMapComponent.getAddedPolygons();

        if (polygonsOfOperationRegion.length == 0) {
            Notify.showError("Operation region must have at least one region.");
        } else {

            let polygonRegionIdsOfOperationRegion = [];
            let polygonRegionIdsOfOtherDistributionRegions = [];
            let polygonRegionIdsOfSelectedDistributionRegion = [];

            polygonsOfOperationRegion.forEach(polygon => {
                polygonRegionIdsOfOperationRegion.push(polygon.externalData.id);
            });

            this.state.distributionRegions.forEach(elem => {
                elem.distributionRegionToPolygonRegions.forEach(elemInner => {
                    polygonRegionIdsOfOtherDistributionRegions.push(elemInner.polygonRegion.id);
                });
            });

            let data = {
                name: null,
                tags: [],
                distributionRegionToPolygonRegions: []
            };

            ZoneService.findDataForDistributionRegionMap(
                polygonRegionIdsOfOperationRegion.join(","),
                polygonRegionIdsOfOtherDistributionRegions.join(","),
                polygonRegionIdsOfSelectedDistributionRegion.join(",")).then(response => {

                this.collectionAndDistributionRegionEditComponent.open(false, data, response.data.polygonRegionsThatCanBeAdded,
                    response.data.polygonRegionsThatCannotBeAdded, response.data.polygonRegionsThatAreAdded);

            }).catch(error => {
                Notify.showError(error);
            });
        }
    }

    onDistributionRegionClick(e, value) {

        e.preventDefault();

        let polygonsOfOperationRegion = this.operationRegionMapComponent.getAddedPolygons();

        let polygonRegionIdsOfOperationRegion = [];
        let polygonRegionIdsOfOtherDistributionRegions = [];
        let polygonRegionIdsOfSelectedDistributionRegion = [];

        polygonsOfOperationRegion.forEach(polygon => {
            polygonRegionIdsOfOperationRegion.push(polygon.externalData.id);
        });

        this.state.distributionRegions.forEach(elem => {
            if (elem._key != value._key) {
                elem.distributionRegionToPolygonRegions.forEach(elemInner => {
                    polygonRegionIdsOfOtherDistributionRegions.push(elemInner.polygonRegion.id);
                });
            }
        });

        let data = value;

        data.distributionRegionToPolygonRegions.forEach(elem => {
            polygonRegionIdsOfSelectedDistributionRegion.push(elem.polygonRegion.id);
        });

        ZoneService.findDataForDistributionRegionMap(
            polygonRegionIdsOfOperationRegion.join(","),
            polygonRegionIdsOfOtherDistributionRegions.join(","),
            polygonRegionIdsOfSelectedDistributionRegion.join(",")).then(response => {

            response.data.polygonRegionsThatAreAdded.forEach(elem => {

                let match = _.find(data.distributionRegionToPolygonRegions, elemInner => {
                    return elemInner.polygonRegion.id == elem.id;
                });

                elem.category = match.category;
            });

            this.collectionAndDistributionRegionEditComponent.open(false, data, response.data.polygonRegionsThatCanBeAdded,
                response.data.polygonRegionsThatCannotBeAdded, response.data.polygonRegionsThatAreAdded);

        }).catch(error => {
            Notify.showError(error);
        });
    }

    onDeleteDistributionRegionClick(value) {

        Notify.confirm("Are you sure you want to delete distribution region with name " + value.name + "?", () => {

            let distributionRegions = _.cloneDeep(this.state.distributionRegions);

            _.remove(distributionRegions, elem => {
                return elem._key == value._key;
            });

            this.setState({distributionRegions: distributionRegions});
        });
    }

    onSaveClick() {

        let operationRegion = {};

        operationRegion.id = this.state.id;
        operationRegion.name = this.state.name;
        operationRegion.tags = this.state.tags;
        operationRegion.operationRegionToPolygonRegions = [];
        operationRegion.collectionRegions = this.state.collectionRegions;
        operationRegion.distributionRegions = this.state.distributionRegions;

        this.operationRegionMapComponent.getAddedPolygons().forEach(elem => {
            let item = {};
            item.polygonRegion = {};
            item.polygonRegion.id = elem.externalData.id;
            operationRegion.operationRegionToPolygonRegions.push(item);
        });

        ZoneService.saveOperationRegion(operationRegion).then(response => {
            window.location = "/ui/management/operation-region-edit?id=" + response.data.id;
        }).catch(e => {
            Notify.showError(e);
        });
    }

    onReturnToListClick() {
        window.location = "/ui/management/operation-region-summary";
    }

    getConfirmationIfNecessaryBeforeRemove(polygonsToBeRemoved) {

        let state = _.cloneDeep(this.state);
        let noCollectionRegionAffected = true;
        let noDistributionRegionAffected = true;

        noCollectionRegionAffected = polygonsToBeRemoved.every(polygon => {

            let absoluteName = polygon.externalData.absoluteName;

            // noCollectionRegionAffected
            return state.collectionRegions.every(elem => {
                // noCollectionRegionToPolygonRegionAffected
                return elem.collectionRegionToPolygonRegions.every(elemInner => {
                    let absoluteNameInner = elemInner.polygonRegion.absoluteName;
                    return absoluteNameInner != absoluteName && !absoluteNameInner.startsWith(absoluteName + "/") && !absoluteName.startsWith(absoluteNameInner + "/");
                });
            });
        });

        if (noCollectionRegionAffected) {

            noDistributionRegionAffected = polygonsToBeRemoved.every(polygon => {

                let absoluteName = polygon.externalData.absoluteName;

                // noDistributionRegionAffected
                return state.distributionRegions.every(elem => {
                    // noDistributionRegionToPolygonRegionAffected
                    return elem.distributionRegionToPolygonRegions.every(elemInner => {
                        let absoluteNameInner = elemInner.polygonRegion.absoluteName;
                        return absoluteNameInner != absoluteName && !absoluteNameInner.startsWith(absoluteName + "/") && !absoluteName.startsWith(absoluteNameInner + "/");
                    });
                });
            });
        }

        if (!noCollectionRegionAffected || !noDistributionRegionAffected) {
            Notify.confirm("Some collection/distribution regions are affected by this action, they will be changed or deleted, are you sure you want to continue?", () => {
                this.operationRegionMapComponent.doRemove();
            });
        } else {
            this.operationRegionMapComponent.doRemove();
        }
    }

    onPolygonsRemoved(removedPolygons) {

        let state = _.cloneDeep(this.state);

        removedPolygons.forEach(polygon => {

            let absoluteName = polygon.externalData.absoluteName;

            state.collectionRegions.forEach(elem => {
                _.remove(elem.collectionRegionToPolygonRegions, elemInner => {
                    let absoluteNameInner = elemInner.polygonRegion.absoluteName;
                    return absoluteNameInner == absoluteName || absoluteNameInner.startsWith(absoluteName + "/") || absoluteName.startsWith(absoluteNameInner + "/");
                });
            });

            state.distributionRegions.forEach(elem => {
                _.remove(elem.distributionRegionToPolygonRegions, elemInner => {
                    let absoluteNameInner = elemInner.polygonRegion.absoluteName;
                    return absoluteNameInner == absoluteName || absoluteNameInner.startsWith(absoluteName + "/") || absoluteName.startsWith(absoluteNameInner + "/");
                });
            });
        });

        _.remove(state.collectionRegions, elem => {
            return elem.collectionRegionToPolygonRegions.length == 0;
        });

        _.remove(state.distributionRegions, elem => {
            return elem.distributionRegionToPolygonRegions.length == 0;
        });

        this.setState(state);
    }

    syncDistributionRegions() {

        let callbackFunction = () => {

            let state = _.cloneDeep(this.state);

            state.distributionRegions.splice(0);

            state.collectionRegions.forEach(elem => {

                let distributionRegion = {};

                distributionRegion._key = uuid.v4();
                distributionRegion.name = elem.name;
                distributionRegion.tags = [];
                distributionRegion.distributionRegionToPolygonRegions = [];

                elem.tags.forEach(tag => {
                    distributionRegion.tags.push({
                        value: tag.value
                    });
                });

                elem.collectionRegionToPolygonRegions.forEach(collectionRegionToPolygonRegion => {
                    distributionRegion.distributionRegionToPolygonRegions.push({
                        polygonRegion: _.cloneDeep(collectionRegionToPolygonRegion.polygonRegion),
                        category: _.cloneDeep(collectionRegionToPolygonRegion.category)
                    });
                });

                state.distributionRegions.push(distributionRegion);
            });

            this.setState(state);
        };

        if (this.state.distributionRegions.length > 0) {
            Notify.confirm("All distribution regions will be deleted and created again according to collection regions, continue?", callbackFunction);
        } else {
            callbackFunction();
        }
    }

    syncCollectionRegions() {

        let callbackFunction = () => {

            let state = _.cloneDeep(this.state);

            state.collectionRegions.splice(0);

            state.distributionRegions.forEach(elem => {

                let collectionRegion = {};

                collectionRegion._key = uuid.v4();
                collectionRegion.name = elem.name;
                collectionRegion.tags = [];
                collectionRegion.collectionRegionToPolygonRegions = [];

                elem.tags.forEach(tag => {
                    collectionRegion.tags.push({
                        value: tag.value
                    });
                });

                elem.distributionRegionToPolygonRegions.forEach(distributionRegionToPolygonRegion => {
                    collectionRegion.collectionRegionToPolygonRegions.push({
                        polygonRegion: _.cloneDeep(distributionRegionToPolygonRegion.polygonRegion),
                        category: _.cloneDeep(distributionRegionToPolygonRegion.category)
                    });
                });

                state.collectionRegions.push(collectionRegion);
            });

            this.setState(state);
        };

        if (this.state.collectionRegions.length > 0) {
            Notify.confirm("All collection regions will be deleted and created again according to distribution regions, continue?", callbackFunction);
        } else {
            callbackFunction();
        }
    }

    renderActualContent() {

        let syncDistributionRegionsSection = null;
        let syncCollectionRegionsSection = null;

        if (this.state.collectionRegions.length > 0) {
            syncDistributionRegionsSection = (
                <GridCell width="2-2">
                    <div className="uk-align-right">
                        <Button label="Sync Distribution Regions With Collection Regions »" style="success" waves={true} size="small" onclick={() => this.syncDistributionRegions()}/>
                    </div>
                </GridCell>
            );
        }

        if (this.state.distributionRegions.length > 0) {
            syncCollectionRegionsSection = (
                <GridCell width="2-2">
                    <div className="uk-align-left">
                        <Button label="« Sync Collection Regions With Distribution Regions" style="success" waves={true} size="small" onclick={() => this.syncCollectionRegions()}/>
                    </div>
                </GridCell>
            );
        }

        return (
            <div>
                <PageHeader title="Operation Region"/>
                <Grid>
                    <GridCell width="1-1">
                        <Card>
                            <Grid>
                                <GridCell width="1-2" noMargin="true">
                                    <TextInput label="Name"
                                               value={this.state.name}
                                               onchange={(value) => this.updateName(value)}/>
                                </GridCell>
                                <GridCell width="1-2" noMargin="true">
                                    <Chip label="Tags"
                                          valueField="value"
                                          labelField="value"
                                          options={this.state.allTags}
                                          onchange={(value)=> this.updateTags(value)}
                                          value={this.state.tags}/>
                                </GridCell>
                            </Grid>
                        </Card>
                    </GridCell>
                    <GridCell width="1-1">
                        <Card>
                            <RegionMapWithPostcodeFilter polygonRegionsThatCanBeAdded={this.state.polygonRegionsThatCanBeAdded}
                                                         polygonRegionsThatCannotBeAdded={this.state.polygonRegionsThatCannotBeAdded}
                                                         polygonRegionsThatAreAdded={this.state.polygonRegionsThatAreAdded}
                                                         mapId="operationRegionEdit"
                                                         ref={(c) => this.operationRegionMapComponent = c}
                                                         canAddCountryIfNotExists={true}
                                                         caller={this.caller}
                                                         getConfirmationIfNecessaryBeforeRemove={(polygonsToBeRemoved) => this.getConfirmationIfNecessaryBeforeRemove(polygonsToBeRemoved)}
                                                         onRemove={(removedPolygons) => this.onPolygonsRemoved(removedPolygons)}/>
                        </Card>
                    </GridCell>
                    <GridCell width="1-1">
                        <Card>
                            <Grid>
                                <GridCell width="1-2" noMargin="true">
                                    <Grid>
                                        <GridCell width="1-2" noMargin="true">
                                            <b>Collection Regions</b>
                                        </GridCell>
                                        <GridCell width="1-2" noMargin="true">
                                            <Button label="Create New" style="success" waves = {true}
                                                    flat = {true} onclick = {() => this.onCreateNewCollectionRegionClick()} />
                                        </GridCell>
                                        <GridCell width="2-2">
                                            <ul className="md-list md-list-centered">
                                                {this.state.collectionRegions.map(item => {
                                                    return (
                                                        <li key={item._key}>
                                                            <div className="md-list-content">
                                                                <span className="md-list-heading">
                                                                    <a href="#" onClick={(e) => this.onCollectionRegionClick(e, item)}>{item.name}</a>
                                                                    <Button label="Delete" style="danger" waves = {true}
                                                                            flat = {true} size="small" float="right" onclick = {() => this.onDeleteCollectionRegionClick(item)} />
                                                                </span>
                                                            </div>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </GridCell>
                                        {syncDistributionRegionsSection}
                                    </Grid>
                                </GridCell>
                                <GridCell width="1-2" noMargin="true">
                                    <Grid>
                                        <GridCell width="1-2" noMargin="true">
                                            <b>Distribution Regions</b>
                                        </GridCell>
                                        <GridCell width="1-2" noMargin="true">
                                            <Button label="Create New" style="success" waves = {true}
                                                    flat = {true} onclick = {() => this.onCreateNewDistributionRegionClick()} />
                                        </GridCell>
                                        <GridCell width="2-2">
                                            <ul className="md-list md-list-centered">
                                                {this.state.distributionRegions.map(item => {
                                                    return (
                                                        <li key={item._key}>
                                                            <div className="md-list-content">
                                                                <span className="md-list-heading">
                                                                    <a href="#" onClick={(e) => this.onDistributionRegionClick(e, item)}>{item.name}</a>
                                                                    <Button label="Delete" style="danger" waves = {true}
                                                                            flat = {true} size="small" float="right" onclick = {() => this.onDeleteDistributionRegionClick(item)} />
                                                                </span>
                                                            </div>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </GridCell>
                                        {syncCollectionRegionsSection}
                                    </Grid>
                                </GridCell>
                            </Grid>
                        </Card>
                    </GridCell>
                    <GridCell width="1-1">
                        <div className="uk-align-right">
                            <Button label="Return To List" style="primary" waves={true} onclick={() => this.onReturnToListClick()}/>
                            <Button label="Save" style="primary" waves={true} onclick={() => this.onSaveClick()}/>
                        </div>
                    </GridCell>
                    <GridCell width="1-1">
                        <CollectionAndDistributionRegionEdit ref={(c) => this.collectionAndDistributionRegionEditComponent = c}
                                                             onSave={(isCollectionRegion, value) => { return this.onCollectionAndDistributionRegionSave(isCollectionRegion, value); }}/>
                    </GridCell>
                </Grid>
            </div>
        );
    }

    handleScriptLoad() {
        this.setState({scriptLoaded: true})
    }

    renderScript() {
        return (
            <Script url="https://maps.googleapis.com/maps/api/js?libraries=geometry&key=AIzaSyDE6jFmZfiFjIYBu9CD2lNKSxYaJhAF4nI"
                    onLoad={() => this.handleScriptLoad()}/>
        );
    }

    render() {
        if (this.state.scriptLoaded) {
            return this.renderActualContent();
        } else {
            return this.renderScript();
        }
    }
}