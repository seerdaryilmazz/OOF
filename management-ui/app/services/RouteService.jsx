import * as axios from "axios";

export class RouteService {

    static ROAD = 'ROAD';
    static SEAWAY = 'SEAWAY';
    static RAILWAY = 'RAILWAY';

    static MULTIPLE_LEGGED = 'MULTIPLE_LEGGED';
    static ONE_LEGGED = 'ONE_LEGGED';

    static LOCATION_TYPE_PORT = 'PORT';
    static LOCATION_TYPE_TRAIN_TERMINAL = 'TRAIN_TERMINAL';

    static getRouteLegTypes(){
        return axios.get("/location-service/lookup/route-leg-type");
    }

    static getRouteLocationTypes(){
        return axios.get("/location-service/lookup/location-type");
    }

    static getPorts(){
        return axios.get("/location-service/location/port");
    }

    static getWarehouses(){
        return axios.get('/order-planning-service/definition/warehouse/idnamepair');
    }

    static saveRouteLeg(routeLeg) {
        if (routeLeg.id) {
            return axios.put('/location-service/linehaul-route-leg/' + routeLeg.id, routeLeg);
        }else{
            return axios.post('/location-service/linehaul-route-leg', routeLeg);
        }
    }

    static deleteRouteLeg(routeLeg){
        return axios.delete("/location-service/linehaul-route-leg/" + routeLeg.id);
    }

    static getRouteLegs(type) {
        return axios.get("/location-service/linehaul-route-leg", {params: {type: type}});
    }

    static getAllRouteLegs() {
        return axios.get("/location-service/linehaul-route-leg");
    }

    static getRouteLegsFromLocation(location){
        return axios.get("/location-service/linehaul-route-leg", {params: {fromId: location.id}});
    }

    static getRoutes(){
        return axios.get('/location-service/linehaul-route');
    }

    static getRouteById(id){
        return axios.get('/location-service/linehaul-route/' + id);
    }

    static getRoutesFromLocation(location){
        return axios.get("/location-service/linehaul-route", {params: {fromId: location.id}});
    }

    static getRoutesBetweenWarehouses(from, to){
        return axios.get("/location-service/linehaul-route/between-warehouses", {params: {fromId: from.id, toId: to.id}});
    }

    static saveRoute(route){
        if(route.id){
            return axios.put('/location-service/linehaul-route/' + route.id, route);
        }
        return axios.post('/location-service/linehaul-route', route);
    }

    static deleteRoute(route){
        return axios.delete('/location-service/linehaul-route/' + route.id);
    }

    static getRouteLegStops() {
        return axios.get('/location-service/linehaul-route-leg-stop');
    }

    static getRouteLegStop(id) {
        return axios.get('/location-service/linehaul-route-leg-stop/' + id);
    }

    static getRouteLegStopsByLocationType(locationType) {
        return axios.get('/location-service/linehaul-route-leg-stop/by-location-type/' + locationType.id);
    }

    static getRouteLegStopsByRouteLegType(routeLegType) {
        return axios.get('/location-service/linehaul-route-leg-stop/by-route-leg-type/' + routeLegType.id);
    }

    static getRouteLegDetails(routeLeg){
        return axios.get('/location-service/linehaul-route-leg/' + routeLeg.id);
    }

    static getRouteLegExpeditions(routeLegId, searchCriteria) {
        return axios.get('/location-service/route-leg-expedition/by-route-leg/' + routeLegId,
            {params:searchCriteria});
    }

    static getRouteLegExpeditionTripRelations(expeditionId) {
        return axios.get('/location-service/route-leg-expedition-trip/by-expedition-id/' + expeditionId);
    }
}