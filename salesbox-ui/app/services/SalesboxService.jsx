import * as axios from "axios";

export class SalesboxService {

    static findRegions() {
        return axios.get('/salesbox-service/region');
    }

    static findRegion(id) {
        return axios.get('/salesbox-service/region/' + id);
    }

    static saveRegion(data) {
        if (data.id) {
            return axios.put('/salesbox-service/region/' + data.id, data);
        } else {
            return axios.post('/salesbox-service/region', data);
        }
    }

    static deleteRegion(id) {
        return axios.delete('/salesbox-service/region/' + id);
    }

    static findSalesDemandPriorities() {
        return axios.get('/salesbox-service/lookup/sales-demand-priority');
    }

    static findPayWeights() {
        return axios.get('/salesbox-service/lookup/pay-weight');
    }

    static findLoadWeightTypes() {
        return axios.get('/salesbox-service/lookup/load-weight-type');
    }

    static findPotentialDeactivationSettings() {
        return axios.get('/salesbox-service/lookup/potential-deactivation-setting');
    }

    static findSalesDemands(page, pageSize) {
        return axios.get('/salesbox-service/sales-demand?page=' + page + '&pageSize=' + pageSize);
    }

    static findSalesDemand(id) {
        return axios.get('/salesbox-service/sales-demand/' + id);
    }

    static saveSalesDemand(data) {
        if (data.id) {
            return axios.put('/salesbox-service/sales-demand/' + data.id, data);
        } else {
            return axios.post('/salesbox-service/sales-demand', data);
        }
    }

    static approveSalesDemand(id) {
        return axios.put('/salesbox-service/sales-demand/' + id + '/approve', null);
    }

    static createSalesBoxesForSalesDemand(id) {
        return axios.put('/salesbox-service/sales-demand/' + id + '/create-boxes', null);
    }

    static findSalesBoxesForSalesDemand(id) {
        return axios.get('/salesbox-service/sales-demand/' + id + '/find-boxes');
    }

    static deleteSalesDemand(id) {
        return axios.delete('/salesbox-service/sales-demand/' + id);
    }

    static findAccountOwnerSalesBoxOwnerRelations(page, pageSize) {
        return axios.get('/salesbox-service/account-owner-sales-box-owner-relation?page=' + page + '&pageSize=' + pageSize);
    }

    static findAccountOwnerSalesBoxOwnerRelation(id) {
        return axios.get('/salesbox-service/account-owner-sales-box-owner-relation/' + id);
    }

    static saveAccountOwnerSalesBoxOwnerRelation(data) {
        if (data.id) {
            return axios.put('/salesbox-service/account-owner-sales-box-owner-relation/' + data.id, data);
        } else {
            return axios.post('/salesbox-service/account-owner-sales-box-owner-relation', data);
        }
    }

    static deleteAccountOwnerSalesBoxOwnerRelation(id) {
        return axios.delete('/salesbox-service/account-owner-sales-box-owner-relation/' + id);
    }

    static findSalesBoxCancelReasons() {
        return axios.get('/salesbox-service/sales-box-cancel-reason');
    }

    static findSalesBoxCancelReason(id) {
        return axios.get('/salesbox-service/sales-box-cancel-reason/' + id);
    }

    static saveSalesBoxCancelReason(data) {
        if (data.id) {
            return axios.put('/salesbox-service/sales-box-cancel-reason/' + data.id, data);
        } else {
            return axios.post('/salesbox-service/sales-box-cancel-reason', data);
        }
    }

    static deleteSalesBoxCancelReason(id) {
        return axios.delete('/salesbox-service/sales-box-cancel-reason/' + id);
    }
}