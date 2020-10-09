import * as axios from "axios";


export class AgreementService {
    static search(params) {
        return axios.get('/agreement-service/agreement', {params: params});
    }
    static save(data) {
        if (data.id) {
            return axios.put(`/agreement-service/agreement/${data.id}`, data);
        }
        else {
            return axios.post("/agreement-service/agreement", data);
        }
    }
    static getAgreementById(id) {
        return axios.get(`/agreement-service/agreement/${id}`);
    }
    static validateViewAgreementAuthorization(id) {
        return axios.post(`/agreement-service/agreement/${id}`, null, {params: {'_method': 'options'}});
    }
    static getAgreementByIdAsAuthorized(id) {
        return axios.get(`/agreement-service/agreement/${id}/as-authorized`);
    }
    static updateNotes(id, data) {
        return axios.put(`/agreement-service/agreement/${id}/notes`, data);
    }
    static updateDocuments(id, data) {
        return axios.put(`/agreement-service/agreement/${id}/documents`, data);
    }
    static addHistoryModel(data){
        return axios.post(`/agreement-service/agreement/historyAdpModel`, data)
    }
    static getHistoryModelsByModelId(modelId){
        return axios.get(`/agreement-service/agreement/historyAdpModel/${modelId}`)
    }
    static addHistoryUnitPrice(data){
        return axios.post(`/agreement-service/agreement/historyUnitPrice`, data)
    }
    static getHistoryUnitPricesByUnitPriceId(unitPriceId){
        return axios.get(`/agreement-service/agreement/historyUnitPrice/${unitPriceId}`)
    }
    static calculateCurrentPrice(calculationObject){
        return axios.post('/agreement-service/agreement/calculate-current-price', calculationObject)
    }
    static extendAgreement(id, params){
        return axios.get(`/agreement-service/agreement/extend-agreement/${id}`, {params:params})
    }
    static calculateAutoRenewalDate(params){
        return axios.get("/agreement-service/agreement/calculate-auto-renewal-date", {params:params})
    }
    static deleteHistoryUnitPriceByUnitPriceId(id){
        return axios.delete(`/agreement-service/agreement/unit-price-histories/${id}`);
    }
    static deleteHistoryUnitPriceById(id){
        return axios.delete(`/agreement-service/agreement/unit-price-history/${id}`);
    }

}
