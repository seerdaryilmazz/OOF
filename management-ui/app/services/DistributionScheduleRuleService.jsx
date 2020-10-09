import * as axios from "axios";

export class DistributionScheduleRuleService {

    static getDistributionSchedules(){
        return axios.get('/order-template-service/distribution-schedule');
    }
    static saveDistributionSchedule(schedule){
        return axios.post('/order-template-service/distribution-schedule', schedule);
    }
    static deleteDistributionSchedule(schedule){
        return axios.delete('/order-template-service/distribution-schedule/' + schedule.id);
    }
}