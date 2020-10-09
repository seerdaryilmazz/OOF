import * as axios from "axios";

export class LocationService {

    static getRoutes() {
        return axios.get('/location-service/route');
    }

    static getWarehouses() {
        return axios.get('/location-service/location/warehouse');
    }

    static getBorderCustoms() {
        return axios.get('/location-service/location/customs-office/border-customs');
    }

    static findCollectionRegionOfLocation(locationId) {
        return axios.get('/location-service/collection-region/query-two/by-company-location?companyLocationId=' + locationId);
    }

    static findDistributionRegionOfLocation(locationId) {
        return axios.get('/location-service/distribution-region/query-two/by-company-location?companyLocationId=' + locationId);
    }

    static getRouteLegStops(){
        return axios.get("/location-service/linehaul-route-leg-stop");
    }

    static getCustomerWarehouseDetailsByType(locationId, type){
        return axios.get(`/location-service/location/customerwarehouse/bycompanylocation/${type}/${locationId}`);
    }

    static getCustomerWarehouseDetails(locationId){
        return axios.get(`/location-service/location/customerwarehouse/bycompanylocation/${locationId}`);
    }
    
    static getWarehouseDetails(locationId){
        return axios.get(`/location-service/location/warehouse/bycompanylocation/${locationId}`);
    }

    static getDaysOfWeek(){
        return axios.get('/location-service/lookup/day-of-week');
    }

    static listCustomsOffices() {
        return axios.get("/location-service/location/customs-office");
    }
    static getCustomsOffice(id) {
        return axios.get(`/location-service/location/customs-office/${id}`);
    }
    static getCustomsOfficeLocations(id) {
        return axios.get(`/location-service/location/customs-office/${id}/locations`);
    }
    static getCustomsOfficeLocation(id) {
        return axios.get(`/location-service/location/customs-office/location/${id}`);
    }
    static listCustomsTypes(){
        return axios.get("/location-service/lookup/warehouse-customs-type");
    }

    static listCompaniesWithEuropeanCustomsLocations(){
        return axios.get("/location-service/location/customs/european-customs-companies");
    }

    static getCustomsLocationByLocationId(id, companyType) {
        return axios.get(`/location-service/location/customs/by-location/${id}`, { params: { companyType: companyType } });
    }
    static getCustomsLocationById(id){
        return axios.get(`/location-service/location/customs/${id}`);
    }

    static searchCustomsLocations(customsOfficeId, customsType, dangerousGoods, tempControlledGoods, onBoardClearance){
        return axios.get("/location-service/location/customs", {
            params: {
                customsOfficeId: customsOfficeId,
                type: customsType,
                dangerousGoods: dangerousGoods,
                tempControlledGoods: tempControlledGoods,
                onBoardClearance: onBoardClearance
            }
        });
    }
    static findCustomerWarehousesOfCompany(companyId){
        return axios.get(`/location-service/location/customerwarehouse/bycompany/${companyId}`);
    }

    static findEuropeanCustomsLocations(companyId, companyType){
        return axios.get(`/location-service/location/customs/european-customs`, {params: {companyId: companyId, companyType: companyType}});
    }

    static getCountry(code) {
        return axios.get(`/location-service/country/by-iso/${code}`);
    }
    static getCustomsOfficeLocationContacts(id) {
        return axios.get(`/location-service/location/customs-office/location/${id}/contacts`);
    }

}