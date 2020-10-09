import * as axios from 'axios';

export class TrailerRuleService {

    static getTrailerDocumentTypes(){
        return axios.get("/order-template-service/lookup/trailer/document-type-with-expiration");
    }

    static getRuleSetForTrailers() {
        return axios.get('/order-template-service/rule/trailer');
    }

    static saveGpsRule(rules){
        return axios.put('/order-template-service/rule/trailer/gps-rules', rules);
    }

    static saveUsabilityRule(rules){
        return axios.put('/order-template-service/rule/trailer/usability-rules', rules);
    }
}