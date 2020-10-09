import * as axios from "axios";

export class CarrierUnitModelRuleService {


    static retrieveCarrierUnitModelRule(carrierTypeId, carrierUnitModelId) {
       return axios.get("/order-template-service/rule/carrier-unit-model/" + carrierTypeId + "/" + carrierUnitModelId);
    }


    static saveDoubleDeckRule(carrierTypeId, carrierUnitModelId, data) {
        return axios.post("/order-template-service/rule/carrier-unit-model/" + carrierTypeId + "/" + carrierUnitModelId + "/" + "double-deck-rule", data);
    }

    static saveAdvancedRule(carrierTypeId, carrierUnitModelId, data) {
        return axios.post("/order-template-service/rule/carrier-unit-model/" + carrierTypeId + "/" + carrierUnitModelId + "/" + "advanced-rule", data);
    }
}