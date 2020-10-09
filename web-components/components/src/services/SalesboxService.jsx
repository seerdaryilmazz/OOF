import * as axios from "axios";

export class SalesboxService {

    static findSalesBoxCancelReasons() {
        return axios.get('/salesbox-service/sales-box-cancel-reason');
    }
}