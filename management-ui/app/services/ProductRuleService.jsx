import * as axios from 'axios';

export class ProductRuleService {

    static getRuleSetList() {
        return axios.get('/order-template-service/rule/product-rule-set');
    }

    static deleteRuleSet(rule){
        return axios.delete('/order-template-service/rule/product-rule-set/' + rule.id);
    }

    static saveRuleSet(rule){
        if(rule.id){
            return axios.put('/order-template-service/rule/product-rule-set/' + rule.id, rule);
        }
        return axios.post('/order-template-service/rule/product-rule-set', rule);
    }
}