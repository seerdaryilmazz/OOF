import React from "react";
import _ from "lodash";

export class VehicleFeature {

    static VEHICLE_FEATURE = [
        {id: "box", name: "BOX", label: "Box", class: "md-bg-green-A200 md-color-grey-900", inverted: false},
        {id: "curtainSider", name: "CS", label: "Curtain Sider", class: "md-bg-green-300", inverted: false},
        {id: "mega", name: "MGA", label: "Not Mega", style: {"text-decoration": "line-through"}, class: "md-bg-red-900", inverted: true},
        {id: "suitableForTrain", name: "TRN", label: "Not Suitable For Train", style: {"text-decoration": "line-through"}, class: "md-bg-red-900", inverted: true},
        {id: "frigoTrailer", name: "FRG", label: "Frigo", class: "md-bg-light-blue-800", inverted: false},
        {id: "isolated", name: "ISO", label: "Isolated", class: "md-bg-light-blue-100", inverted: false},
        {id: "xlCertificate", name: "XL", label: "XL Certificate", class: "md-bg-grey-500 md-color-grey-900", inverted: false},
        {id: "doubleDeck", name: "DD", label: "Double Deck", class: "md-bg-grey-500 md-color-grey-900", inverted: false},
        {id: "suitableForHangingLoads", name: "HNG", label: "Suitable For Hanging Loads", class: "md-bg-grey-500 md-color-grey-900", inverted: false},
        {id: "liftingRoof", name: "LR", label: "Lifting Roof", class: "md-bg-grey-400 md-color-grey-900", inverted: false},
        {id: "slidingRoof", name: "SR", label: "Sliding Roof", class: "md-bg-grey-400", inverted: false},
        {id: "securitySensor", name: "SS", label: "Security Sensor", class: "md-bg-grey-400 md-color-grey-900", inverted: false},
        {id: "tailLift", name: "TL", label: "Tail Lift", class: "md-bg-grey-400 md-color-grey-900", inverted: false}
    ];

    static SHIPMENT_REQUIRED = [
        {id: "box", name: "BOX", label: "Box", class: "md-bg-green-A200 md-color-grey-900"},
        {id: "curtainSider", name: "CS", label: "Curtain Sider", class: "md-bg-green-300"},
        {id: "mega", name: "MGA", label: "Mega", class: "md-bg-deep-purple-200"},
        {id: "suitableForTrain", name: "TRN", label: "Suitable For Train", class: "md-bg-amber-300 md-color-grey-900"},
        {id: "frigoTrailer", name: "FRG", label: "Frigo", class: "md-bg-light-blue-800"},
        {id: "isolated", name: "ISO", label: "Isolated", class: "md-bg-light-blue-100 md-color-grey-900"},
        {id: "xlCertificate", name: "XL", label: "XL Certificate", class: "md-bg-grey-500 md-color-grey-900"},
        {id: "doubleDeck", name: "DD", label: "Double Deck", class: "md-bg-grey-500 md-color-grey-900"},
        {id: "suitableForHangingLoads", name: "HNG", label: "Suitable For Hanging Loads", class: "md-bg-grey-500 md-color-grey-900"},
        {id: "liftingRoof", name: "LR", label: "Lifting Roof", class: "md-bg-grey-400 md-color-grey-900"},
        {id: "slidingRoof", name: "SR", label: "Sliding Roof", class: "md-bg-grey-400 md-color-grey-900"},
        {id: "securitySensor", name: "SS", label: "Security Sensor", class: "md-bg-grey-400 md-color-grey-900"},
        {id: "tailLift", name: "TL", label: "Tail Lift", class: "md-bg-grey-400 md-color-grey-900"}
    ];

    static SHIPMENT_NOT_ALLOWED = [
        {id: "box", name: "BOX", label: "Not Box", style: {"text-decoration": "line-through"}, class: "md-bg-red-900"},
        {id: "curtainSider", name: "CS", label: "Not Curtain Sider", style: {"text-decoration": "line-through"}, class: "md-bg-red-900"},
        {id: "mega", name: "MGA", label: "Not Mega", style: {"text-decoration": "line-through"}, class: "md-bg-red-900"},
        {id: "suitableForTrain", name: "TRN", label: "Not Suitable For Train", style: {"text-decoration": "line-through"}, class: "md-bg-red-900"},
        {id: "frigoTrailer", name: "FRG", label: "Not Frigo", style: {"text-decoration": "line-through"}, class: "md-bg-red-900"},
        {id: "isolated", name: "ISO", label: "Not Isolated", style: {"text-decoration": "line-through"}, class: "md-bg-red-900"},
        {id: "xlCertificate", name: "XL", label: "No XL Certificate", style: {"text-decoration": "line-through"}, class: "md-bg-red-900"},
        {id: "doubleDeck", name: "DD", label: "No Double Deck", style: {"text-decoration": "line-through"}, class: "md-bg-red-900 uk-text-line-through"},
        {id: "suitableForHangingLoads", name: "HNG", label: "Not Suitable For Hanging Loads", style: {"text-decoration": "line-through"}, class: "md-bg-red-900"},
        {id: "liftingRoof", name: "LR", label: "No Lifting Roof", style: {"text-decoration": "line-through"}, class: "md-bg-red-900"},
        {id: "slidingRoof", name: "SR", label: "No Sliding Roof", style: {"text-decoration": "line-through"}, class: "md-bg-red-900"},
        {id: "securitySensor", name: "SS", label: "No Security Sensor", style: {"text-decoration": "line-through"}, class: "md-bg-red-900"},
        {id: "tailLift", name: "TL", label: "No Tail Lift", style: {"text-decoration": "line-through"}, class: "md-bg-red-900"}
    ];

    //initializes shipment of segments:
    //clones vehicle feature fields to selectedRequiredVehicleFeatures and selectedNotAllowedVehicleFeatures
    static initializeSelectedVehicleFeaturesOfShipment(segment) {
        let shipment = segment ? segment.shipment : null;
        if (shipment) {

            if (shipment.requiredVehicleFeatures) {
                shipment.selectedRequiredVehicleFeatures =  _.cloneDeep(shipment.requiredVehicleFeatures);
            } else {
                shipment.selectedRequiredVehicleFeatures = {};
            }

            if (shipment.notAllowedVehicleFeatures) {
                shipment.selectedNotAllowedVehicleFeatures =  _.cloneDeep(shipment.notAllowedVehicleFeatures);
            }else {
                shipment.selectedNotAllowedVehicleFeatures = {};
            }
        }
    }

    /**
     *
     * @param segment
     * @returns list of vehicle feature badges for given vehicleRequirementFeatures
     */
    static createVehicleRequirementElementsOfRuleResult(requiredVehicleFeatures, notAllowedVehicleFeatures) {
        let content = [];

        if (requiredVehicleFeatures) {
            VehicleFeature.SHIPMENT_REQUIRED.filter(spec =>
                requiredVehicleFeatures[spec.id]
            ).forEach(spec => {
                let className = spec.class;
                content.push(<span key={"rseg-req--" + spec.id} style={spec.style} title={spec.label}
                                   className={className + " uk-badge uk-text uk-text-small uk-text-bold uk-margin-small-right"}>{spec.name}</span>);
            })
        }
        if (notAllowedVehicleFeatures) {
            VehicleFeature.SHIPMENT_NOT_ALLOWED.filter(spec =>
                notAllowedVehicleFeatures[spec.id]
            ).forEach(spec => {
                let className = spec.class;
                content.push(<span key={"seg-na-" + spec.id} style={spec.style} title={spec.label}
                                   className={className + " uk-badge uk-text uk-text-small uk-text-bold uk-margin-small-right"}>{spec.name}</span>);
            })
        }


        return content;
    }

    /**
     *
     * @param segment
     * @param requiredOnClick: if this function is given, the "required badges" becomes clickable and this function is called upon click
     * @param notAllowedOnClick:  if this function is given, the "required badges" becomes clickable and this function is called upon click
     * @returns list of vehicle feature badges for given segment's shipment
     */
    static createVehicleRequirementElementsOfSegment(segment, requiredOnClick, notAllowedOnClick) {
        let content = [];
        let shipment = segment.shipment;
        if (shipment) {
            if (shipment.requiredVehicleFeatures && shipment.selectedRequiredVehicleFeatures) {
                VehicleFeature.SHIPMENT_REQUIRED.filter(spec =>
                    shipment.requiredVehicleFeatures[spec.id]
                ).forEach(spec => {
                    let className = !shipment.selectedRequiredVehicleFeatures[spec.id] && requiredOnClick ? "md-bg-grey-50 md-color-grey-900" : spec.class;
                    content.push(<span key={"rseg-req--" + spec.id} style={spec.style} title={spec.label}
                                       onClick={() => {
                                           requiredOnClick ? requiredOnClick(spec.id) : null
                                       }}
                                       className={className + " uk-badge uk-text uk-text-small uk-text-bold uk-margin-small-right"}>{spec.name}</span>);
                })
            }
            if (shipment.notAllowedVehicleFeatures && shipment.selectedNotAllowedVehicleFeatures) {
                VehicleFeature.SHIPMENT_NOT_ALLOWED.filter(spec =>
                    shipment.notAllowedVehicleFeatures[spec.id]
                ).forEach(spec => {
                    let className = !shipment.selectedNotAllowedVehicleFeatures[spec.id] && notAllowedOnClick ? "md-bg-grey-50 md-color-grey-900" : spec.class;
                    content.push(<span key={"seg-na-" + spec.id} style={spec.style} title={spec.label} onClick={() => {
                        notAllowedOnClick ? notAllowedOnClick(spec.id) : null
                    }}
                                       className={className + " uk-badge uk-text uk-text-small uk-text-bold uk-margin-small-right"}>{spec.name}</span>);
                })
            }
        }

        return content;
    }

    /**
     *
     * @param trailer
     * @returns returns the list of badges of vehicle features for given trailer
     */
    static createVehicleRequirementElementsOfVehicle (trailer) {
        if(trailer && trailer.vehicle && trailer.vehicle.details) {
            return <div>
                {
                    VehicleFeature.VEHICLE_FEATURE.filter(spec =>
                        trailer.vehicle.details[spec.id] != spec.inverted //XOR operation: only value true or only inverted
                    ).map(spec => {
                        return <span key={"vehicle-" + spec.id} style={spec.style} title={spec.label}
                                     className={spec.class + " uk-badge uk-text uk-text-small uk-text-bold uk-margin-small-right"}>{spec.name}</span>
                    })
                }
            </div>
        }
        return null;
    }


    static prepareRequestForIsVehicleFeaturesConflict(segments) {
        let postData = {};

        if (segments) {
            segments.forEach(segment => {
                let shipment = segment.shipment;
                if (shipment) {
                    postData.requiredVehicleFeatures = segments.filter(segment =>
                        segment.shipment && segment.shipment.selectedRequiredVehicleFeatures
                    ).map(segment => segment.shipment.selectedRequiredVehicleFeatures);
                    postData.notAllowedVehicleFeatures = segments.filter(segment =>
                        segment.shipment && segment.shipment.selectedNotAllowedVehicleFeatures
                    ).map(segment => segment.shipment.selectedNotAllowedVehicleFeatures);
                }
            });
        }

        return postData;
    }



    static prepareRequestForIsTrailerAppropriate(trailer, segments) {
        let postData = {};
        if (segments && trailer) {
            segments.forEach(segment => {
                let shipment = segment.shipment;
                if (shipment) {
                    postData.vehicleFeatures = trailer.vehicle ? trailer.vehicle.details : null;
                    postData.requiredVehicleFeatures = segments.filter(segment =>
                        segment.shipment && segment.shipment.selectedRequiredVehicleFeatures
                    ).map(segment => segment.shipment.selectedRequiredVehicleFeatures);
                    postData.notAllowedVehicleFeatures = segments.filter(segment =>
                        segment.shipment && segment.shipment.selectedNotAllowedVehicleFeatures
                    ).map(segment => segment.shipment.selectedNotAllowedVehicleFeatures);
                }
            });
        }

        return postData;
    }

    /**
     *
     * @param segment
     * @param featureId
     * @description switches given segments given vehicle feature's status between enable-disbale
     */
    static switchSegmentRequiredVehicleFeature(segment, vehicleFeatureId) {
        let shipment = segment.shipment;
        if (shipment) {
            shipment.selectedRequiredVehicleFeatures[vehicleFeatureId] = !shipment.selectedRequiredVehicleFeatures[vehicleFeatureId];

        }
    }

    /**
     *
     * @param segment
     * @param vehicleFeatureId
     * @description switches given segments given vehicle feature's status between enable-disbale
     */
    static switchSegmentNotAllowedVehicleFeature(segment, vehicleFeatureId) {
        let shipment = segment.shipment;
        if(shipment) {
            shipment.selectedNotAllowedVehicleFeatures[vehicleFeatureId] = !shipment.selectedNotAllowedVehicleFeatures[vehicleFeatureId];

        }
    }

    /**
     *
     * @param segments
     * @returns {{}}
     */
    static constructDefaultVehicleFeatureFilter(segments) {
        let currentSegmentsFeatureIds = this.listSegmentsVehicleFeaturesHavingValueAsTrue(segments);

        let filter = {};
        VehicleFeature.VEHICLE_FEATURE.forEach(feature => {
            filter[feature.id]  = currentSegmentsFeatureIds.includes(feature.id);
        })

        return filter;
    }

    /**
     *
     * @param trailerFilter
     * @param previousSegments
     * @param segments
     * @returns {*}
     */
    static handleTrailerFilterChangeFromSegmentSelectionUpdate(trailerFilter, previousSegments, segments) {

        let isAdded = false;
        let featureSelectedOrDeselected = false;

        let prevSegments = [];
        let currSegments = [];

        let vehicleFeatureFilter = {};
        if (trailerFilter && trailerFilter.vehicleFeature) {
            vehicleFeatureFilter = trailerFilter.vehicleFeature
        }

        if (previousSegments && segments) {
            currSegments = segments;
            prevSegments = previousSegments;

            if (previousSegments.length < segments.length) {
                isAdded = true;
            } else if (previousSegments.length > segments.length) {
                isAdded = false;
            } else {
                //segments contents are changed but no new segments added or existing one is removed, so dont update vehicle feature filter
                featureSelectedOrDeselected = true;
            }
        } else {
            if (segments) {
                currSegments = segments;
                isAdded = true
            } else if (previousSegments) {
                prevSegments = previousSegments;
                isAdded = false;
            }
        }

        if (featureSelectedOrDeselected) {
            return this.handlerTrailerFilterChangeFromEnableDisable(vehicleFeatureFilter, prevSegments, currSegments);
        } else if (isAdded) {
            return this.handlerTrailerFilterChangeFromSegmentAdd(vehicleFeatureFilter, prevSegments, currSegments);
        } else {
            return this.handlerTrailerFilterChangeFromSegmentRemove(vehicleFeatureFilter, prevSegments, currSegments);
        }
    }

    static isTrailerAppropriate(expectedFeatures, trailer) {
        return VehicleFeature.VEHICLE_FEATURE.filter(feature =>
        expectedFeatures[feature.id]
        &&
        (!trailer.vehicle || !trailer.vehicle.details || !trailer.vehicle.details[feature.id])).length > 0 ? false : true;
    }


    static handlerTrailerFilterChangeFromEnableDisable(vehicleFeatureFilter, previousSegments, currentSegments) {

        let vehicleFeature = _.cloneDeep(vehicleFeatureFilter);

        let previousSegmentsFeatureIds = this.listSegmentsVehicleFeaturesHavingValueAsTrue(previousSegments);
        let currentSegmentsFeatureIds = this.listSegmentsVehicleFeaturesHavingValueAsTrue(currentSegments);

        var removedElems = _.differenceWith(previousSegmentsFeatureIds, currentSegmentsFeatureIds, _.isEqual);
        var addedElems = _.differenceWith(currentSegmentsFeatureIds, previousSegmentsFeatureIds, _.isEqual);

        removedElems.forEach( removedElem => {
            vehicleFeature[removedElem] = false;
        });

        addedElems.forEach( addedElem => {
            vehicleFeature[addedElem] = true;
        });

        return vehicleFeature;
    }

    static handlerTrailerFilterChangeFromSegmentAdd(vehicleFeatureFilter, previousSegment, currentSegments) {
        let vehicleFeature = _.cloneDeep(vehicleFeatureFilter);
        let previouslySelectedSegmentIds = previousSegment ? previousSegment.map(segment => segment.id) : [];

        let newSegments = [];
        currentSegments.forEach(segment => {
            if(!previouslySelectedSegmentIds.includes(segment.id)) {
                newSegments.push(segment);
            }
        });

        if(newSegments.length == 0) {
            return vehicleFeature;
        }
        newSegments.forEach(newSegment => {
            if(newSegment.shipment && newSegment.shipment.selectedRequiredVehicleFeatures) {
                vehicleFeature =
                    VehicleFeature.mergeFeatures(vehicleFeature, newSegment.shipment.selectedRequiredVehicleFeatures);
            }
        });

        return vehicleFeature;
    }

    static handlerTrailerFilterChangeFromSegmentRemove(vehicleFeatureFilter, previousSegment, currentSegments) {

        let vehicleFeature = _.cloneDeep(vehicleFeatureFilter);

        let currentSegmentIds = currentSegments.map(segment => segment.id);

        let removedSegment;
        previousSegment.forEach(prevSegment => {
            if(!currentSegmentIds.includes(prevSegment.id)) {
                removedSegment = prevSegment;
            }
        });

        if(!removedSegment || !removedSegment.shipment || !removedSegment.shipment.selectedRequiredVehicleFeatures) {
            return vehicleFeature;
        }

        let removedSegmentsFeatureIds = VehicleFeature.VEHICLE_FEATURE.filter(
            feature => removedSegment.shipment.selectedRequiredVehicleFeatures[feature.id]
        ).map(feature => feature.id);

        let currentSegmentsFeatureIds = this.listSegmentsVehicleFeaturesHavingValueAsTrue(currentSegments);

        let toBeDeselected = removedSegmentsFeatureIds.filter(currentSegmentsFeatureId => !currentSegmentsFeatureIds.includes(currentSegmentsFeatureId));

        toBeDeselected.forEach(featureId => vehicleFeature[featureId] = false);


        return vehicleFeature
    }

    static listSegmentsVehicleFeaturesHavingValueAsTrue(segments) {
        return VehicleFeature.VEHICLE_FEATURE.filter( feature =>
            segments.filter(segment =>
                (segment.shipment && segment.shipment.selectedRequiredVehicleFeatures &&
                segment.shipment.selectedRequiredVehicleFeatures[feature.id])).length > 0
        ).map(feature => feature.id);
    }



    static mergeFeatures(vehicleFeatures1, vehicleFeatures2) {
        let result = {};
        VehicleFeature.VEHICLE_FEATURE.forEach(feature => {
            result[feature.id] = vehicleFeatures1[feature.id] || vehicleFeatures2[feature.id];
        })

        return result;
    }

}