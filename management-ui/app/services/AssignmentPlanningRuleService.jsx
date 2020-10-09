import * as axios from "axios";

export class AssignmentPlanningRuleService {

    static RULETYPE_COLLECTION_ID = "COLLECTION";
    static RULETYPE_DISTRIBUTION_ID = "DISTRIBUTION";
    static RULETYPE_LINEHAUL_ID = "LINEHAUL";

    static assingmentPlanRuleTypes(){
        return axios.get('/order-template-service/lookup/assignment-plan-rule-type');
    }

    static assignmentPlanningList(){
        return axios.get('/order-template-service/rule/assignment-planning');
    }

    static save(data) {
        return axios.post('/order-template-service/rule/assignment-planning', data);
    }

    static delete(assignmentPlanId) {
        return axios.delete('/order-template-service/rule/assignment-planning/' + assignmentPlanId);
    }
}