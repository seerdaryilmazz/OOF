import * as axios from "axios";


export class CrmLeadService {

    static createLead(data) {
        return axios.post("/crm-lead-service/lead", data);
    }

    static updateLead(id, data) {
        return axios.put(`/crm-lead-service/lead/${id}`, data);
    }

    static getLeadById(id) {
        return axios.get(`/crm-lead-service/lead/${id}`);
    }

    static getLeads(params){
        return axios.get(`/crm-lead-service/lead`, {params: params});
    }

    static deleteLeadById(id) {
        return axios.delete(`/crm-lead-service/lead/${id}`);
    }
    static updateStatus(id, status){
        return axios.patch(`/crm-lead-service/lead/${id}/status/${status}`)
    }

    static searchLeadsForHomePage(params) {
        return axios.get("/crm-lead-service/lead/searchForHomePage", {params: params});
    }

}