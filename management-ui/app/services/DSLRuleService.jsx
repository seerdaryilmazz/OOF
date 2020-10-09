import * as axios from "axios";

export class DSLRuleService {

    static validateAntlrSpelDSLScript(data) {
        return axios.post("/rules-engine-service/dsl/validate-syntax", data);
    }

    static validateGroovyDSLScript(data) {
        return axios.post("/groovy-rules-engine-service/dsl/validate-syntax", data);
    }

}