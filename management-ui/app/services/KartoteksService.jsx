import * as axios from "axios";

export class KartoteksService {

    static getWarehouses(companyId) {
        return axios.get('/kartoteks-service/company/' + companyId + '/warehouses');
    }

    static getCompany(companyId) {
        return axios.get('/kartoteks-service/company/' + companyId);
    }

    static findCompaniesAsIdNamePairs(ids) {
        let commaSeparatedIds = ids.join(",");
        return axios.get("/kartoteks-service/company/" + commaSeparatedIds + "/id-and-name");
    }

    static getEkolLocations() {
        return axios.get("/kartoteks-service/ekol/locations");
    }

    static getLocationDetails(id) {
        return axios.get("/kartoteks-service/location/" + id);
    }

    static getCompanyByLocationId(id) {
        return axios.get("/kartoteks-service/company/by-location", {params: {locationId: id}});
    }

    static retrieveCompanyLocations(companyId) {
        return axios.get("/kartoteks-service/company/" + companyId + "/locations");
    }


    static retrievePartnerCompanies() {
        return axios.get("/kartoteks-service/company/partners");
    }

    static getCompaniesOwnedByEkol() {
        return axios.get('/kartoteks-service/company/owned-by-ekol');
    }

    static getParentSectors() {
        return axios.get('/kartoteks-service/sector');
    }

    static getSubSectors(sectorId) {
        return axios.get('/kartoteks-service/sector/' + sectorId + '/subsectors');
    }

    static autoCompleteGooglePlaces(query){
        return axios.get('/kartoteks-service/google-places/auto-complete', {params: {query: query}});
    }

    static getGooglePlaceDetails(placeId){
        return axios.get('/kartoteks-service/google-places/details', {params: {placeId: placeId}});
    }

    static getPhoneTypeList(){
        return axios.get('/kartoteks-service/phone-type');
    }

    static getGenderList(){
        return [{code: "FEMALE", name: "Female"}, {code: "MALE", name: "Male"}];
    }

    static getUsageTypeList(){
        return axios.get('/kartoteks-service/usage-type');
    }

    static getCompanyContacts(companyId) {
        return axios.get('/kartoteks-service/company/' + companyId + '/contacts');
    }

    static getProperty(key){
        return axios.get(`/kartoteks-service/property/${key}`)
    }
}