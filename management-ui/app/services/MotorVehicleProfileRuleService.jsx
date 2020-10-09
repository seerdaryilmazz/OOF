import * as axios from "axios";

export class MotorVehicleProfileRuleService {

    static getRuleSetForProfile(profile) {
        return axios.get('/order-template-service/rule/motor-vehicle-profile/' + profile.id);
    }

    static saveRuleSet(ruleset){
        return axios.post('/order-template-service/rule/motor-vehicle-profile', ruleset);
    }

    static saveFuelEconomyRule(profile, rules){
        return axios.put('/order-template-service/rule/motor-vehicle-profile/' + profile.id + '/fuel-economy-rules', rules);
    }

    static saveAgeRule(profile, rules){
        return axios.put('/order-template-service/rule/motor-vehicle-profile/' + profile.id + '/age-rules', rules);
    }

    static listFuelConsumptionTypes(){
        return axios.get('/vehicle-service/lookup/fuel-consumption-type');
    }
    static listAgeOperatorTypes(){
        return axios.get('/vehicle-service/lookup/age-operator-type');
    }
    static listVehicleProfiles(){
        return axios.get('/vehicle-service/lookup/profile-type');
    }


}