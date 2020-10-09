import * as axios from "axios";

export class ExportQuoteQueueService {

    static getStatus() {
        return axios.get(`/crm-quote-queue-service/export-queue/lookup/status`);
    }

    static requeue(id) {
        return axios.put(`/crm-quote-queue-service/export-queue/requeue/${id}`);
    }
    
    static search(filter) {
        var qs = require('qs');
        return axios.get(`/crm-quote-queue-service/export-queue/search`, { params: filter, paramsSerializer: params => { return qs.stringify(params, { arrayFormat: 'status' }) } });
    }
}
export class ImportQuoteQueueService {
    static getLookup(lookup) {
        return axios.get(`/crm-quote-queue-service/import-queue/lookup/${lookup}`);
    }

    static requeue(id) {
        return axios.put(`/crm-quote-queue-service/import-queue/requeue/${id}`);
    }
    
    static search(filter) {
        var qs = require('qs');
        return axios.get(`/crm-quote-queue-service/import-queue/search`, { params: filter, paramsSerializer: params => { return qs.stringify(params, { arrayFormat: 'status' }) } });
    }
}