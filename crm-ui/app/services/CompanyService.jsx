import * as axios from "axios";
import _ from "lodash";

export class CompanyService {

    static getCompany(id){
        return axios.get(`/kartoteks-service/company/${id}`);
    }
    static getContactsByAccount(contactIds){
        return axios.get(`/kartoteks-service/contact/contactIds/${contactIds}`);
    }
    static getDefaultLocation(id) {
        return axios.get(`/kartoteks-service/company/${id}/default-location`);
    }
    static getDefaultLocations(companyIds) {
        let commaSeparatedCompanyIds = _.join(companyIds, ",");
        return axios.get(`/kartoteks-service/company/default-locations?commaSeparatedCompanyIds=${commaSeparatedCompanyIds}`);
    }
    static getContactsByCompany(id){
        return axios.get(`/kartoteks-service/company/${id}/contacts`);
    }
    static getContactsByLocation(id){
        return axios.get(`/kartoteks-service/location/${id}/contacts`);
    }
    static search(params){
        return axios.get('/kartoteks-service/search', {params: params});
    }
    static getLocationsByCompany(companyId){
        return axios.get(`/kartoteks-service/company/${companyId}/locations`);
    }
    static getActiveLocationsByCompany(companyId) {
        return axios.get(`/kartoteks-service/company/${companyId}/active-locations`);
    }
    static getLocationById(id){
        return axios.get(`/kartoteks-service/location/${id}`);
    }
    static validateContact(contact){
        return axios.put('/kartoteks-service/contact/validate', contact);
    }
    static addContact(contact){
        return axios.post('/kartoteks-service/contact/', contact);
    }
    static updateContact(contact){
        return axios.put(`/kartoteks-service/contact/${contact.id}`, contact);
    }
    static getCompanySectors(companyId){
        return axios.get(`/kartoteks-service/company/${companyId}/sectors`);
    }
    static validateSectors(sectors){
        return axios.put('/kartoteks-service/company/validate-sectors', sectors);
    }
    static updateSectors(companyId, sectors){
        return axios.put(`/kartoteks-service/company/${companyId}/sectors`, sectors);
    }
}