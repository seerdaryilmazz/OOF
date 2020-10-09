import * as axios from "axios";

export class Kartoteks {

    static getAgentOrLogisticPartner(companyId) {
        return axios.get('/kartoteks-service/relation/' + companyId + '/agentsOrLogisticsPartners');
    }

    static getCompaniesRelatedToCustomerRep() {
        return axios.get('/kartoteks-service/customer-service-rep/my-companies');
    }

    static getWarehouses(companyId) {
        return axios.get('/kartoteks-service/company/' + companyId + '/warehouses');
    }

    static getCompanyByLocation(locationId) {
        return axios.get('/kartoteks-service/company/by-location?locationId=' + locationId);
    }

    static getLocation(locationId) {
        return axios.get(`/kartoteks-service/location/${locationId}`);
    }

    static getCompanyLocations(companyId) {
        return axios.get(`/kartoteks-service/company/${companyId}/locations`);
    }

    static getCompanyDetails(companyId) {
        return axios.get(`/kartoteks-service/company/${companyId}`);
    }

    static getCompanyLocation(locationId) {
        return axios.get(`/kartoteks-service/location/${locationId}`);
    }

    static getCompanyContacts(companyId) {
        return axios.get(`/kartoteks-service/company/${companyId}/contacts`);
    }

    static getLocationContacts(locationId) {
        return axios.get(`/kartoteks-service/location/${locationId}/contacts`);
    }

    static getContactDetails(contactId) {
        return axios.get(`/kartoteks-service/contact/${contactId}`);
    }

    static getCountries(){
        return axios.get('/kartoteks-service/country/all');
    }
    static searchCountry(query){
        return axios.get('/kartoteks-service/country/search', {params: {q: query}});
    }

    static isCompanyPartner(companyId) {
        return axios.get(`/kartoteks-service/company/${companyId}/is-partner`);
    }

    static getCompaniesOwnedByEkol() {
        return axios.get('/kartoteks-service/company/owned-by-ekol');
    }

    static readProperty(key){
        return axios.get(`/kartoteks-service/property/${key}`);
    }
}