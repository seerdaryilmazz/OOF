import * as axios from "axios";

export class MotorVehicleTypeRuleService {

    static listMotorVehicleTypes(){
        return axios.get('/vehicle-service/motor-vehicle-type');
    }
    static listTripTypes(){
        return axios.get('/order-template-service/lookup/motor-vehicle-type/trip-types');
    }
    static listInspectionTypes(){
        return axios.get('/order-template-service/lookup/motor-vehicle-type/inspection-types');
    }
    static listServiceTypes(){
        return axios.get('/order-template-service/lookup/motor-vehicle-type/service-types');
    }
    static listTrailerTypes(){
        return axios.get('/order-template-service/lookup/motor-vehicle-type/trailer-types');
    }

    static list() {
        return axios.get('/order-template-service/rule/motor-vehicle-type');
    }
    static getRuleSetForVehicleType(type) {
        return axios.get('/order-template-service/rule/motor-vehicle-type/' + type.id);
    }
    static saveRuleSet(type, ruleset){
        if(ruleset.id){
            return axios.put('/order-template-service/rule/motor-vehicle-type/' + type.id, ruleset);
        }else{
            return axios.post('/order-template-service/rule/motor-vehicle-type', ruleset);
        }
    }

    static saveGpsRule(type, rules){
        return axios.put('/order-template-service/rule/motor-vehicle-type/' + type.id + '/gps-rules', rules);
    }

    static saveCouplingRule(type, rules){
        return axios.put('/order-template-service/rule/motor-vehicle-type/' + type.id + '/coupling-rules', rules);
    }

    static saveUsabilityRule(type, rules){
        return axios.put('/order-template-service/rule/motor-vehicle-type/' + type.id + '/usability-rules', rules);
    }


}