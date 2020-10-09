import * as axios from "axios";

export class PackageRuleService {
    
    static retrievePackageRule(packageGroupId) {
        return axios.get("/order-template-service/rule/package/" + packageGroupId);
    }

    static saveHandlingControlRule(packageGroupId, data) {
        return axios.post("/order-template-service/rule/package/" + packageGroupId + "/" + "handling-control", data);
    }

    static saveHandlingTime(packageGroupId, data) {
        return axios.post("/order-template-service/rule/package/" + packageGroupId + "/" + "handling-time", data);
    }

    static saveAdvancedRule(packageGroupId, data) {
        return axios.post("/order-template-service/rule/package/" + packageGroupId + "/" + "advanced-rule", data);
    }
}