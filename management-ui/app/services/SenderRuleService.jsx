import * as axios from 'axios';

export class SenderRuleService {

    static getRuleSet() {
        return axios.get('/order-template-service/rule/sender');
    }

    static deleteRuleSet(rule){
        return axios.delete('/order-template-service/rule/sender/' + rule.id);
    }

    static saveRuleSet(rule){
        if(rule.id){
            return axios.put('/order-template-service/rule/sender/' + rule.id, rule);
        }
        return axios.post('/order-template-service/rule/sender', rule);
    }
}