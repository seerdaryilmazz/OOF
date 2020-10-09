import * as axios from "axios";

export class AgreementQueueService {
    static search(params) {
        return axios.get('/agreement-queue-service/agreement-queue/search', {params: params});
    }
    static requeue(id){
        return axios.get(`/agreement-queue-service/agreement-queue/requeue/${id}`);
    }
}