import * as axios from "axios";

export class SalesboxService {

    static findSalesBoxCancelReasons() {
        return axios.get('/salesbox-service/sales-box-cancel-reason');
    }

    static findSuitableCampaign(params) {
        return axios.get('/salesbox-service/sales-demand/suitable-campaign', {params: params});
    }

    static findCampaign(id) {
        return axios.get('/salesbox-service/sales-demand/' + id);
    }
}