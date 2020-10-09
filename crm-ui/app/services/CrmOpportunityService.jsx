import * as axios from "axios";


export class CrmOpportunityService{
    
    static getOpportunityById(id){
        return axios.get(`/crm-opportunity-service/opportunity/${id}`)
    }

    static saveOpportunity(data, params) {
        if (data.id) {
            return axios.put(`/crm-opportunity-service/opportunity/${data.id}`, data, {params: params});
        }
        else {
            return axios.post("/crm-opportunity-service/opportunity", data, {params: params});
        }
    }

    static updateNotes(id, data) {
        return axios.put(`/crm-opportunity-service/opportunity/${id}/notes`, data);
    }

    static updateDocuments(id, data) {
        return axios.put(`/crm-opportunity-service/opportunity/${id}/documents`, data);
    }

    static retrieveOpportunities(params){
        return axios.get("/crm-opportunity-service/opportunity", {params:params})
    }

    static getByAccountId(id){
        return axios.get(`/crm-opportunity-service/opportunity/list-by-accountId/${id}`)
    }

    static getCustomsServiceTypes(){
        return axios.get(`/crm-opportunity-service/lookup/customs-service-type`);
    }

    static reopen(id){
        return axios.put(`/crm-opportunity-service/opportunity/${id}/open`)
    }
}