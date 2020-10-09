import * as axios from "axios";


export class HistoryService {

    static retrieveChanges(params){
        return axios.get('/crm-history-service/history/changes', {params: params});
    }
}