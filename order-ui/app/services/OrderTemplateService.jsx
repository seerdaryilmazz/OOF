import * as axios from "axios";

export class OrderTemplateService {

    static findAllSenderRulesThatMatch(senderId, loadingLocationOwnerId, loadingLocationId, consigneeId) {
        return axios.get('/order-template-service/rule/execute/sender-rule/execute-rules' +
            '?senderId=' + senderId + '&loadingLocationOwnerId=' + loadingLocationOwnerId + '&loadingLocationId=' + loadingLocationId + '&consigneeId=' + consigneeId);
    }
    
    static getCustomerWarehouseRule(locationId){
        return axios.get(`/order-template-service/rule/customerwarehouse/${locationId}`);
    }
}