import * as axios from "axios";

export class KpiService {

    static list(){
        return axios.get('/kpi-service/kpi');
    }
    static save(kpi){
        return axios.post('/kpi-service/kpi', kpi);
    }
    static delete(id){
        return axios.delete('/kpi-service/kpi/' + id);
    }
    static update(kpi){
        return axios.put('/kpi-service/kpi/' + kpi.id, kpi);
    }

    static getPeriods(){
        return axios.get('/kpi-service/periods');
    }
    static getOperators(){
        return axios.get('/kpi-service/operators');
    }
    static getCollectors(){
        return axios.get('/kpi-service/collectors');
    }
}