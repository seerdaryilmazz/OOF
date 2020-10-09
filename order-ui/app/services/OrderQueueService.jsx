import * as axios from "axios";

export class OrderQueueService {

    static getLookup(lookup) {
        return axios.get(`/order-queue-service/lookup/${lookup}`);
    }

    static orderExportRequeue(id) {
        return axios.put(`/order-queue-service/export-queue/requeue/${id}`);
    }
    
    static orderExportSearch(filter) {
        var qs = require('qs');
        return axios.get(`/order-queue-service/export-queue/search`, { params: filter, paramsSerializer: params => { return qs.stringify(params, { arrayFormat: 'status' }) } });
    }
    
    static shipmentImportRequeue(id) {
        return axios.put(`/order-queue-service/import-queue/requeue/${id}`);
    }

    static shipmentImportSearch(filter) {
        var qs = require('qs');
        return axios.get(`/order-queue-service/import-queue/search`, { params: filter, paramsSerializer: params => { return qs.stringify(params, { arrayFormat: 'status' }) } });
    }
}