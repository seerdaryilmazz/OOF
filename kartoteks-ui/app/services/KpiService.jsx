import * as axios from "axios";

export class KpiService {

    static list(){
        return axios.get('/kpi-service/kpi');
    }
    static listQueueCompleteKpisAssignedToMe(){
        return axios.get('/kpi-service/kpi/assigned-to-me');
    }
    static getKpiArchive(id){
        return axios.get('/kpi-service/kpi/assigned-to-me/' + id + '/archive', {params: {count: 20}});
    }

    static assignToUserNow(kpi, user){
        return axios.put('/kpi-service/kpi/' + kpi.id + "/assign-now", {id: user.id, name: user.username});
    }
    static assignToUserNextPeriod(kpi, user){
        return axios.put('/kpi-service/kpi/' + kpi.id + "/assign-next-period", {id: user.id, name: user.username});
    }
    static revokeFromUserNow(kpi, user){
        return axios.put('/kpi-service/kpi/' + kpi.id + "/revoke-now", {id: user.id, name: user.username});
    }
    static revokeFromUserNextPeriod(kpi, user){
        return axios.put('/kpi-service/kpi/' + kpi.id + "/revoke-next-period", {id: user.id, name: user.username});
    }

}