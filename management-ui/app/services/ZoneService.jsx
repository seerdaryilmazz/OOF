import * as axios from "axios";
import _ from "lodash";

export class ZoneService {

    static ZONETYPE_COLLECTION = "COLLECTION";
    static ZONETYPE_DISTRIBUTION = "DISTRIBUTION";

    static getZoneTypes() {
        return axios.get('/location-service/lookup/zone-type');
    }

    static getZoneZipCodeTypes() {
        return axios.get('/location-service/lookup/zone-zip-code-type');
    }

    static getZoneTags() {
        return axios.get('/tag-service/tag/ZONE');
    }

    static getZones() {
        return axios.get('/location-service/zone');
    }

    static getZonesWithType(zoneType) {
        return axios.get('/location-service/zone/zone-type/' + zoneType);
    }

    static getZone(id) {
        return axios.get('/location-service/zone/' + id);
    }

    static saveZone(zone) {
        return axios.post('/location-service/zone', zone);
    }

    static getCountries() {
        return axios.get('/location-service/country');
    }

    static deleteZone(id) {
        return axios.delete('/location-service/zone/' + id);
    }

    static getCountryPolygonRegion(isoAlpha3Code) {
        return axios.get('/location-service/polygon-region/by-country?isoAlpha3Code=' + isoAlpha3Code);
    }

    static getChildrenOfPolygonRegion(parent, name) {
        return axios.get('/location-service/polygon-region/children?parent=' + (parent ? parent : "") + "&name=" + (name ? name : ""));
    }

    static getIdsOfChildrenOfPolygonRegion(parent, name) {
        return axios.get('/location-service/polygon-region/ids-of-children?parent=' + (parent ? parent : "") + "&name=" + (name ? name : ""));
    }

    static getParentOfPolygonRegion(parent, name) {
        return axios.get('/location-service/polygon-region/parent?parent=' + (parent ? parent : "") + "&name=" + (name ? name : ""));
    }

    static getIdOfParentOfPolygonRegion(parent, name) {
        return axios.get('/location-service/polygon-region/id-of-parent?parent=' + (parent ? parent : "") + "&name=" + (name ? name : ""));
    }

    static getPolygonRegionsByPostcode(isoAlpha3Code, searchType, postcode, searchForDrawing) {

        let url = '/location-service/polygon-region/by-postcode?isoAlpha3Code=' + isoAlpha3Code;

        if (searchType == "STARTS") {
            url += '&postcodeStartsWith=' + postcode;
        } else if (searchType == "EQUALS") {
            url += '&postcodeEquals=' + postcode;
        }

        url += '&searchForDrawing=' + searchForDrawing;

        return axios.get(url);
    }

    static getPolygonRegion(id) {
        return axios.get('/location-service/polygon-region/' + id);
    }

    static getPolygonRegionsByIds(commaSeparatedIds) {
        return axios.get('/location-service/polygon-region/by-ids?ids=' + commaSeparatedIds);
    }

    static getOperationRegionListAccordingToQueryTwo() {
        return axios.get('/location-service/operation-region/query-two');
    }

    static getOperationRegionListAccordingToQueryThree() {
        return axios.get('/location-service/operation-region/query-three');
    }

    static getOperationRegionThatContainsWarehouseAccordingToQueryThree(warehouseId) {
        return axios.get('/location-service/operation-region/query-three/by-warehouse?warehouseId=' + warehouseId);
    }

    static getOperationRegionAccordingToQueryFive(id) {
        return axios.get('/location-service/operation-region/query-five/' + id);
    }

    static saveOperationRegion(data) {
        if (data.id) {
            return axios.put('/location-service/operation-region/' + data.id, data);
        } else {
            return axios.post('/location-service/operation-region', data);
        }
    }

    static deleteOperationRegion(id) {
        return axios.delete('/location-service/operation-region/' + id);
    }

    static findDataForOperationRegionMap(selectedOperationRegionId) {
        if (selectedOperationRegionId) {
            return axios.get('/location-service/operation-region/map?selectedOperationRegionId=' + selectedOperationRegionId);
        } else {
            return axios.get('/location-service/operation-region/map');
        }
    }

    // static getPolygonRegionIdsOfMapInputDataForOperationRegion(id) {
    //     return axios.get('/location-service/operation-region/map-input-data/polygon-region-ids?selectedOperationRegionId=' + id);
    // }

    static findDataForCollectionRegionMap(commaSeparatedPolygonRegionIdsOfOperationRegion,
                                          commaSeparatedPolygonRegionIdsOfOtherCollectionRegions,
                                          commaSeparatedPolygonRegionIdsOfSelectedCollectionRegion) {

        let paramValue1 = '';
        let paramValue2 = '';
        let paramValue3 = '';

        if (commaSeparatedPolygonRegionIdsOfOperationRegion && commaSeparatedPolygonRegionIdsOfOperationRegion.length > 0) {
            paramValue1 = commaSeparatedPolygonRegionIdsOfOperationRegion;
        }

        if (commaSeparatedPolygonRegionIdsOfOtherCollectionRegions && commaSeparatedPolygonRegionIdsOfOtherCollectionRegions.length > 0) {
            paramValue2 = commaSeparatedPolygonRegionIdsOfOtherCollectionRegions;
        }

        if (commaSeparatedPolygonRegionIdsOfSelectedCollectionRegion && commaSeparatedPolygonRegionIdsOfSelectedCollectionRegion.length > 0) {
            paramValue3 = commaSeparatedPolygonRegionIdsOfSelectedCollectionRegion;
        }

        return axios.get('/location-service/collection-region/map' +
            '?commaSeparatedPolygonRegionIdsOfOperationRegion=' + paramValue1 +
            '&commaSeparatedPolygonRegionIdsOfOtherCollectionRegions=' + paramValue2 +
            '&commaSeparatedPolygonRegionIdsOfSelectedCollectionRegion=' + paramValue3);
    }

    static findDataForDistributionRegionMap(commaSeparatedPolygonRegionIdsOfOperationRegion,
                                            commaSeparatedPolygonRegionIdsOfOtherDistributionRegions,
                                            commaSeparatedPolygonRegionIdsOfSelectedDistributionRegion) {

        let paramValue1 = '';
        let paramValue2 = '';
        let paramValue3 = '';

        if (commaSeparatedPolygonRegionIdsOfOperationRegion && commaSeparatedPolygonRegionIdsOfOperationRegion.length > 0) {
            paramValue1 = commaSeparatedPolygonRegionIdsOfOperationRegion;
        }

        if (commaSeparatedPolygonRegionIdsOfOtherDistributionRegions && commaSeparatedPolygonRegionIdsOfOtherDistributionRegions.length > 0) {
            paramValue2 = commaSeparatedPolygonRegionIdsOfOtherDistributionRegions;
        }

        if (commaSeparatedPolygonRegionIdsOfSelectedDistributionRegion && commaSeparatedPolygonRegionIdsOfSelectedDistributionRegion.length > 0) {
            paramValue3 = commaSeparatedPolygonRegionIdsOfSelectedDistributionRegion;
        }

        return axios.get('/location-service/distribution-region/map' +
            '?commaSeparatedPolygonRegionIdsOfOperationRegion=' + paramValue1 +
            '&commaSeparatedPolygonRegionIdsOfOtherDistributionRegions=' + paramValue2 +
            '&commaSeparatedPolygonRegionIdsOfSelectedDistributionRegion=' + paramValue3);
    }

    static getRegionCategories() {
        return axios.get('/location-service/lookup/region-category');
    }

    static findOperationRegionByCollectionRegionId(operationRegions, collectionRegionId) {

        let matchedOperationRegion = _.find(operationRegions, operationRegion => {

            let matchedCollectionRegion =_.find(operationRegion.collectionRegions, collectionRegion => {
                return collectionRegion.id == collectionRegionId;
            });

            if (matchedCollectionRegion) {
                return true;
            } else {
                return false;
            }
        });

        return matchedOperationRegion;
    }

    static findOperationRegionByDistributionRegionId(operationRegions, distributionRegionId) {

        let matchedOperationRegion = _.find(operationRegions, operationRegion => {

            let matchedDistributionRegion =_.find(operationRegion.distributionRegions, distributionRegion => {
                return distributionRegion.id == distributionRegionId;
            });

            if (matchedDistributionRegion) {
                return true;
            } else {
                return false;
            }
        });

        return matchedOperationRegion;
    }
}