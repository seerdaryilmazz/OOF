import * as axios from "axios";

export class TruckLoadTypeRuleService {


    static retrieveTruckLoadTypeRule(truckLoadTypeId) {
       return axios.get("/order-template-service/rule/truck-load-type/" + truckLoadTypeId);
    }

    static saveTruckLoadTypeRule(truckLoadTypeId, data) {
        return axios.post("/order-template-service/rule/truck-load-type/" + truckLoadTypeId, data);
    }

    static saveAdvancedRule(truckLoadTypeId, data) {
        return axios.post("/order-template-service/rule/truck-load-type/" + truckLoadTypeId + "/" + "advanced-rule", data);
    }
}