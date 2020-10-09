import * as axios from 'axios';
import {DistanceUtil} from '../../common/DistanceUtil'
import {GoogleMaps} from "../map/GoogleMaps"

export class TrailerDistanceCalculation{
    static sortByBeelineDistanceToFirstStop(trailers, firstStop) {

        if(!trailers) {
            return trailers;
        }

        let firstStopPointOnMap = firstStop.pointOnMap;

        if(!firstStopPointOnMap || !_.isNumber(firstStopPointOnMap.lat) || !_.isNumber(firstStopPointOnMap.lng)) {
            return trailers;
        }

        trailers.forEach(item => {
            if (item.assignment && item.assignment.location && item.assignment.location.pointOnMap) {
                let vehiclePointOnMap =  item.assignment.location.pointOnMap;
                item._airDistanceToFirstStop = DistanceUtil.calculateAirDistance(
                    vehiclePointOnMap.latitude, vehiclePointOnMap.longitude,
                    firstStopPointOnMap.lat, firstStopPointOnMap.lng);
            } else {
                item._airDistanceToFirstStop = null;
            }
        });

        let sortedTrailers = trailers.sort((a, b) => this.compareDistance(a, b, "_airDistanceToFirstStop"));
        return sortedTrailers;

    }

    static calculateRouteDistance(closestTrailers, firstStopPointOnMap, callbackFcn) {

        let origins = [];
        let destinations = [];

        closestTrailers.forEach(trailer => {
            let from = trailer.assignment.location.pointOnMap;
            origins.push(new google.maps.LatLng(from.latitude, from.longitude));
            destinations.push(new google.maps.LatLng(firstStopPointOnMap.lat, firstStopPointOnMap.lng));
        });

       GoogleMaps.calculateDistanceMatrix(origins, destinations, (response) => {
            let distanceMatrix = [];
            response.rows.forEach(row => {
                let element = row.elements.find(elem => elem.status == "OK");
                distanceMatrix.push(element);
            });

            if (closestTrailers.length != distanceMatrix.length) {
                console.error("Error: Google maps does not return distance matrix for each of the given trailers, trailer route distance calculation failed. ");
            }

            callbackFcn(closestTrailers, distanceMatrix);
        });
    }


    static applyDistanceMatricesToTrailers(trailers, distanceMatrices) {

        trailers.forEach((trailer, index) => {
            let distanceMatrixElem = distanceMatrices[index];
            if (distanceMatrixElem) {
                this.applyDistanceMatrix(trailer, distanceMatrixElem);
            }
        });

        return trailers.sort((a, b) => this.compareDistance(a, b, "_groundDistanceToFirstStopText"));
    }


    static calculateGroundDistanceForSingleVehicle(pointOnMap, firstStopPointOnMap, saveCallback) {

        GoogleMaps.calculateDistanceMatrix(
            [new google.maps.LatLng(pointOnMap.latitude, pointOnMap.longitude)],
            [new google.maps.LatLng(firstStopPointOnMap.lat,
                firstStopPointOnMap.lng)], (response) => {
                let distanceMatrix = [];
                response.rows.forEach(row => {
                    let element = row.elements.find(elem => elem.status == "OK");
                    distanceMatrix.push(element);
                });

                saveCallback(distanceMatrix[0]);
            })
    }

    static applyDistanceMatrix(vehicle, distanceMatrixElem) {
        if (distanceMatrixElem) {
            let textContent = null;
            if(distanceMatrixElem.distance) {
                textContent = distanceMatrixElem.distance.text;
                vehicle._groundDistanceToFirstStop = distanceMatrixElem.distance.value;
            }
            if(distanceMatrixElem.duration) {
                if(textContent != null) {
                    textContent = textContent + " - " + distanceMatrixElem.duration.text
                }
                vehicle._groundDurationToFirstStop = distanceMatrixElem.duration.value;
            }
            vehicle._groundDistanceAndDurationText = textContent;
        }

        return vehicle;
    }

    static compareDistance(a,b, field) {
        if(!_.isNumber(b[field])) {
            return -1;
        }
        if(!_.isNumber(a[field])) {
            return 1
        }

        if (a[field] < b[field])
            return -1;
        else {
            return 1
        }
    }
}