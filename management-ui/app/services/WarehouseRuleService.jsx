import * as axios from "axios";

export class WarehouseRuleService {


    static retrieveWarehouseRule(warehouseId) {
       return axios.get("/order-template-service/rule/warehouse/" + warehouseId);
    }
    
    static savePackageHandlingRule(warehouseId, data) {
        return axios.post("/order-template-service/rule/warehouse/" + warehouseId + "/" + "package-handling", data);
    }

    static saveRFUsageRule(warehouseId, data) {
        return axios.post("/order-template-service/rule/warehouse/" + warehouseId + "/" + "rf-usage-rule", data);
    }

    static saveAdvancedRule(warehouseId, data) {
        return axios.post("/order-template-service/rule/warehouse/" + warehouseId + "/" + "advanced-rule", data);
    }
}