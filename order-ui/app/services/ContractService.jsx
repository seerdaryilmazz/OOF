import * as axios from "axios";
import _ from 'lodash';

export class ContractService {

    static findContractsForNewOrderRequestPage(customerId, subsidiaryId) {

        let params = [];

        if (!_.isNil(customerId)) params.push("customerId=" + customerId);
        if (!_.isNil(subsidiaryId)) params.push("subsidiaryId=" + subsidiaryId);

        return axios.get("/contract-service/contract/for-new-order-request-page" + (params.length > 0 ? "?" + params.join("&") : ""));
    }
}