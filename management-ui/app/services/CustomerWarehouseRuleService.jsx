import * as axios from "axios";

export class CustomerWarehouseRuleService {

    static retrieveCustomerWarehouseRule(customerWarehouseId) {
        return axios.get("/order-template-service/rule/customerwarehouse/" + customerWarehouseId);
    }

    static saveVehicleRule(customerWarehouseId, data) {
        return axios.post("/order-template-service/rule/customerwarehouse/" + customerWarehouseId + "/" + "vehicle-rule", data);
    }

    static saveDriverRule(customerWarehouseId, data) {
        return axios.post("/order-template-service/rule/customerwarehouse/" + customerWarehouseId + "/" + "driver-rule", data);
    }

    static saveEquipmentRule(customerWarehouseId, data) {
        return axios.post("/order-template-service/rule/customerwarehouse/" + customerWarehouseId + "/" + "equipment-rule", data);
    }

    static saveCarrierRule(customerWarehouseId, data) {
        return axios.post("/order-template-service/rule/customerwarehouse/" + customerWarehouseId + "/" + "carrier-rule", data);
    }

    static saveAdvancedRule(customerWarehouseId, data) {
        return axios.post("/order-template-service/rule/customerwarehouse/" + customerWarehouseId + "/" + "advanced-rule", data);
    }
}