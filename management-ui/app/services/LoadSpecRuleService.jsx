import * as axios from "axios";

export class LoadSpecRuleService {


    static retrieveLoadSpecRule() {
        return axios.get("/order-template-service/rule/load-spec");
    }

    static saveLoadSpecGenericRule(data) {
        return axios.post("/order-template-service/rule/load-spec/generic-rule", data);
    }

    static saveAdvancedRule(data) {
        return axios.post("/order-template-service/rule/load-spec/advanced-rule", data);
    }
}