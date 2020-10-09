import * as axios from "axios";

export class RuleService {

    static executeProductRule(order){
        return axios.post('/order-template-service/rule/execute/product-rule/execute-rules', order);
    }

    static executePackageGroupVehicleRequirementRules(transportOrder) {
        return axios.post('/order-template-service/rule/execute/package-group/vehicle-requirement-rule/execute-rules', transportOrder);
    }

}