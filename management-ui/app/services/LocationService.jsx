import * as axios from "axios";

export class LocationService {

    static retrieveZones() {
        return axios.get("/location-service/zone");
    }

    static retrieveCountries() {
        return axios.get("/location-service/country");
    }

    static saveCountry(country) {
        if (country.id) {
            return axios.put("/location-service/country/" + country.id, country);
        } else {
            return axios.post("/location-service/country", country);
        }
    }

    static deleteCountry(id) {
        return axios.delete("/location-service/country/" + id);
    }
}

export class CustomsOfficeService {
    static save(customsOffice) {
        if(customsOffice.id){
            return axios.put(`/location-service/location/customs-office/${customsOffice.id}`, customsOffice);
        }
        return axios.post("/location-service/location/customs-office", customsOffice);
    }

    static list() {
        return axios.get("/location-service/location/customs-office");
    }

    static get(id) {
        return axios.get(`/location-service/location/customs-office/${id}`);
    }

    static delete(customsOffice) {
        return axios.delete(`/location-service/location/customs-office/${customsOffice.id}`);
    }

    static listLocations(customsOffice) {
        return axios.get(`/location-service/location/customs-office/${customsOffice.id}/locations`);
    }

    static listContacts(customsOffice) {
        return axios.get(`/location-service/location/customs-office/${customsOffice.id}/contacts`);
    }
    
    static validateName(customsOffice){
        return axios.post(`/location-service/location/customs-office/validate-name`, customsOffice);
    }

    static search(terms){
        return axios.post("/location-service/location/customs-office/search", terms);
    }
}
export class PortService {

    static save(port) {
        if(port.id){
            return axios.put("/location-service/location/port/" + port.id, port);
        }
        return axios.post("/location-service/location/port", port);
    }

    static list() {
        return axios.get("/location-service/location/port");
    }

    static get(id) {
        return axios.get("/location-service/location/port/" + id);
    }

    static delete(port) {
        return axios.delete("/location-service/location/port/" + port.id);
    }

    static listRegistrationMethods() {
        return axios.get("/location-service/lookup/port-registration-method");
    }

    static listAssetTypes() {
        return axios.get("/location-service/lookup/port-asset-type");
    }


}

export class TerminalService {

    static save(terminal) {
        if(terminal.id){
            return axios.put("/location-service/location/terminal/" + terminal.id, terminal);
        }
        return axios.post("/location-service/location/terminal", terminal);
    }

    static list() {
        return axios.get("/location-service/location/terminal");
    }
    static get(id) {
        return axios.get("/location-service/location/terminal/" + id);
    }

    static delete(terminal) {
        return axios.delete("/location-service/location/terminal/" + terminal.id);
    }

    static listRegistrationMethods() {
        return axios.get("/location-service/lookup/terminal-registration-method");
    }

    static listAssetTypes() {
        return axios.get("/location-service/lookup/terminal-asset-type");
    }


}


export class CustomerWarehouseService {

    static save(customerWarehouse) {
        if(customerWarehouse.id) {
            return axios.put("/location-service/location/customerwarehouse/" + customerWarehouse.id, customerWarehouse);
        } else {
            return axios.post("/location-service/location/customerwarehouse", customerWarehouse);
        }
    }

    static list() {
        return axios.get("/location-service/location/customerwarehouse");
    }

    static get(customerWarehouseId) {
        return axios.get("/location-service/location/customerwarehouse/" + customerWarehouseId);
    }

    static delete(customerWarehouseId) {
        return axios.delete("/location-service/location/customerwarehouse/" + customerWarehouseId);
    }

    static getCustomerWarehouseByCompanyLocation(companyLocationId) {
        return axios.get("/location-service/location/customerwarehouse/bycompanylocation/" + companyLocationId);
    }
    static getCustomerWarehouseByCompanyLocationAndType(companyLocationId, type) {
        return axios.get(`/location-service/location/customerwarehouse/bycompanylocation/${type}/${companyLocationId}`);
    }

    static listCWBookingType() {
        return axios.get("/location-service/lookup/cw-booking-type");
    }
    static listCWBookingOptions() {
        return axios.get("/location-service/lookup/cw-booking-options");
    }

    static listCustomsTypes(){
        return axios.get("/location-service/lookup/warehouse-customs-type");
    }

    static listCustomsTypesForCustoms(){
        return axios.get("/location-service/lookup/warehouse-customs-type/for-customs");
    }

    static listCustomsTypesForCompanies(){
        return axios.get("/location-service/lookup/warehouse-customs-type/for-companies");
    }

    static search(terms){
        return axios.post("/location-service/location/customerwarehouse/search", terms);
    }

}

export class TrailerParkService {
    static save(trailerPark) {
        if (trailerPark.id) {
            return axios.put("/location-service/location/trailer-park/" + trailerPark.id, trailerPark);
        }
        return axios.post("/location-service/location/trailer-park", trailerPark);
    }

    static list() {
        return axios.get("/location-service/location/trailer-park");
    }

    static get(id) {
        return axios.get("/location-service/location/trailer-park/" + id);
    }

    static delete(trailerPark) {
        return axios.delete("/location-service/location/trailer-park/" + trailerPark.id);
    }

}

export class CustomsService {
    static getByLocationId(id, companyType) {
        return axios.get(`/location-service/location/customs/place/${id}`, {params: {companyType: companyType}});
    }
}