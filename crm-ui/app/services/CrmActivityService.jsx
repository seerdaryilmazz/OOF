import * as axios from "axios";


export class CrmActivityService {

    static saveActivity(data, params){
        if(data.id){
            return axios.put(`/crm-activity-service/activity/${data.id}`, data, {params:params});
        }else{
            return axios.post("/crm-activity-service/activity", data, {params:params});
        }
    }

    static getActivityById(id) {
        return axios.get(`/crm-activity-service/activity/${id}`);
    }

    static retrieveActivities(accountId, params) {
        return axios.get(`/crm-activity-service/activity/byAccount/${accountId}`, {params: params});
    }
    static retrieveActiveActivities(accountId, params) {
        return axios.get(`/crm-activity-service/activity/actives/byAccount/${accountId}`, {params: params});
    }

    static updateNotes(id, data) {
        return axios.put(`/crm-activity-service/activity/${id}/notes`, data);
    }

    static updateDocuments(id, data) {
        return axios.put(`/crm-activity-service/activity/${id}/documents`, data);
    }

    static search(params) {
        return axios.get("/crm-activity-service/activity/search", {params: params});
    }

    static getHomePageStatistics() {
        return axios.get("/crm-activity-service/activity/homePageStatistics");
    }

    static deleteActivityById(id) {
        return axios.delete(`/crm-activity-service/activity/${id}`);
    }
    static validateCalender(activity){
        return axios.post(`/crm-activity-service/activity/validate-calendar`, activity)
    }
    static updateStatus(id, status){
        return axios.patch(`/crm-activity-service/activity/${id}/status/${status}`)
    }
}