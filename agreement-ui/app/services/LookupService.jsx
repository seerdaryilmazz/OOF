import * as axios from "axios";

export class LookupService {

    static getServiceAreas() {
        return axios.get("/kartoteks-service/business-segment-type");
    }

    static getAgreementTypes() {
        return axios.get(`/agreement-service/lookup/agreement-type`);
    }

    static getRenewalDateTypes() {
        return axios.get(`/agreement-service/lookup/renewal-date-type`);
    }

    static getAgreementCategoryByCode(code) {
        return axios.get(`/agreement-service/lookup/agreement-category/${code}`);
    }

    static getStampTaxPayer() {
        return axios.get(`/agreement-service/lookup/stamp-tax-payer`);
    }

    static getApographType() {
        return axios.get(`/agreement-service/lookup/apograph-type`);
    }

    static getPaymentDueDays(){
        return axios.get(`/crm-quote-service/lookup/payment-due-days`);
    }

    static getCountries(){
        return axios.get('/crm-account-service/lookup/country');
    }

    static getNoteTypes(){
        return axios.get(`/note-service/lookup/note-type`);
    }

    static getInsuranceTypes(){
        return axios.get(`/agreement-service/lookup/insurance-type`);
    }

    static getEkolOrCustomer(){
        return axios.get(`/agreement-service/lookup/ekol-or-customer`);
    }

    static getResponsbilityTypes() {
        return axios.get(`/agreement-service/lookup/responsibility-type`);
    }

    static getBasedOnTypes(){
        return axios.get(`/agreement-service/lookup/basedOn-type`);
    }

    static getBillingItems(serviceAreas){
        return axios.post(`/agreement-service/lookup/billing-item`,serviceAreas);
    }
}