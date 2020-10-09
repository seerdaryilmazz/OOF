import * as axios from "axios";

export class IncotermService {

    static list(){
        return axios.get('/order-service/incoterm');
    }
    static save(incoterm){
        if(incoterm.id){
            return axios.put('/order-service/incoterm/' + incoterm.id, incoterm);
        }else{
            return axios.post('/order-service/incoterm', incoterm);
        }
    }
    static delete(incoterm){
        return axios.delete('/order-service/incoterm/' + incoterm.id);
    }

    static inactivate(incoterm){
        return axios.put('/order-service/incoterm/' + incoterm.id + '/inactivate');
    }
    static activate(incoterm){
        return axios.put('/order-service/incoterm/' + incoterm.id + '/activate');
    }

    static listRules(){
        return axios.get('/order-template-service/rule/incoterms');
    }
    static saveRule(rule){
        if(rule.id){
            return axios.put('/order-template-service/rule/incoterms/' + rule.incoterm, rule);
        }else{
            return axios.post('/order-template-service/rule/incoterms', rule);
        }
    }
    static deleteRule(rule){
        return axios.delete('/order-template-service/rule/incoterms/' + rule.incoterm);
    }
    static listCustomsClearanceTypes(){
        return axios.get('/order-template-service/lookup/incoterms/customs-clearance-types');
    }
    static listFreightCostTypes(){
        return axios.get('/order-template-service/lookup/incoterms/freight-cost-types');
    }
    static listLocationTypes(){
        return axios.get('/order-template-service/lookup/incoterms/location-types');
    }
    static listCustomResponsibilityTypes() {
        return axios.get('/order-template-service/lookup/incoterms/cust-resp-types');
    }
}