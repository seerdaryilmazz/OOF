import * as axios from "axios";

export class TripService {

    static TRIP_STATUS_PENDING = "Pending";
    static TRIP_STATUS_INPROGRESS = "In Progress";
    static TRIP_STATUS_DONE = "Done";

    static ROUTE_LEG_TYPE_ROAD = 'ROAD';
    static ROUTE_LEG_TYPE_SEAWAY = 'SEAWAY';
    static ROUTE_LEG_TYPE_RAILWAY = 'RAILWAY';

    static requestPlanning(planningRequest) {
        return axios.post('/trip-service/plan', planningRequest);
    }

    static departFromTripStop(tripPlanId, tripStopId, date) {
        return axios.post('/trip-service/plan/' + tripPlanId + '/tripstop/' + tripStopId + '/depart', {date: date});
    }

    static arriveToTripStop(tripPlanId, tripStopId, date) {
        return axios.post('/trip-service/plan/' + tripPlanId + '/tripstop/' + tripStopId + '/arrive', {date: date});
    }

    static startUnloadJob(tripPlanId, tripStopId, date) {
        return axios.post('/trip-service/plan/' + tripPlanId + '/tripstop/' + tripStopId + '/customer-unloading/start', {date: date});
    }

    static completeUnloadJob(tripPlanId, tripStopId, date) {
        return axios.post('/trip-service/plan/' + tripPlanId + '/tripstop/' + tripStopId + '/customer-unloading/complete', {date: date});
    }

    static startLoadJob(tripPlanId, tripStopId, date) {
        return axios.post('/trip-service/plan/' + tripPlanId + '/tripstop/' + tripStopId + '/customer-loading/start', {date: date});
    }

    static completeLoadJob(tripPlanId, tripStopId, date) {
        return axios.post('/trip-service/plan/' + tripPlanId + '/tripstop/' + tripStopId + '/customer-loading/complete', {date: date});
    }

    static updateDates(tripPlanId, tripStopId, dateObject) {
        return axios.post('/trip-service/plan/' + tripPlanId + '/tripstop/' + tripStopId + '/update-dates', dateObject);
    }

    static findTransportByShipmentId(shipmentId) {
        return axios.get('/trip-service/transport/byShipmentId/' + shipmentId);
    }

    static findTripOperationsByTransportId(transportId) {
        return axios.get('/trip-service/tripOperation/byTransportId/' + transportId);
    }

    static findTripsByTransportId(transportId) {
        return axios.get('/trip-service/trip/byTransportId/' + transportId);
    }

    static findTripsByTripPlanId(tripPlanId) {
        return axios.get('/trip-service/trip/byTripPlanId/' + tripPlanId);
    }

    static findTripPlans() {
        return axios.get('/trip-service/search/tripPlan');
    }

    static searchTripPlansByShipmentId(shipmentId) {
        return axios.get('/trip-service/search/trip', {params: {shipmentId: shipmentId}});
    }

    static findTripPlanById(id) {
        return axios.get('/trip-service/search/trip', {params:{id: id}});
    }

    static assignTrailerToTripPlan(trailerId, tripPlanId) {
        return axios.get('/trip-service/assignTrailerToTripPlan/' + trailerId + '/' + tripPlanId);
    }

    static updateTripPlanEstimatedDates(trailerPlanId, tripStops) {
        return axios.post('/trip-service/plan/' + trailerPlanId + '/update-estimated-dates', tripStops);
    }

    /**
     * @description finds routes for given origin and destination
     * @param fromId
     * @param fromType
     * @param toId
     * @param toType
     * @returns {axios.Promise}
     */
    static findUsableRoutes(fromId, fromType, toId, toType) {
        return axios.get('/trip-service/route/find-usable-routes',
            {params: {fromId: fromId, fromType: fromType, toId: toId, toType: toType}});
    }

    /**
     * @description finds route legs for given origin and destination
     * @param fromId
     * @param toId
     * @returns {axios.Promise}
     */
    static findUsableRouteLegs(fromId, toId) {
        return axios.get('/trip-service/route/find-usable-route-legs',
            {params: {fromId: fromId, toId: toId}});
    }

    /**
     * @description gets route for selected trip sotp
     * @param tripStopId
     * @returns {axios.Promise}
     */
    static findTripStopRoute(tripStopId) {
        return axios.get('/trip-service/route/of-trip-stop/' + tripStopId + '/outgoing');
    }
}