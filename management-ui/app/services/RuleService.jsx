import * as axios from "axios";

export class RuleService {

    static retrieveRuleSummary() {
        return axios.get("/order-template-service/rule/summary");
    }

    static executeScheduleRuleExecutor(data) {
        return axios.post("/order-template-service/rule/execute/schedule/execute-rules", data);
    }

    static getDeliveryDateRules(){
        return axios.get("/project-service/region-delivery-date-rule");
    }
    static saveDeliveryDateRule(rule){
        if(rule.id){
            return axios.put(`/project-service/region-delivery-date-rule/${rule.id}`, rule);
        }else{
            return axios.post("/project-service/region-delivery-date-rule", rule);
        }

    }
    static deleteDeliveryDateRule(id){
        return axios.delete(`/project-service/region-delivery-date-rule/${id}`);
    }
    
}