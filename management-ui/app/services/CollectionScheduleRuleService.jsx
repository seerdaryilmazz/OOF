import * as axios from "axios";

export class CollectionScheduleRuleService {

    static getCollectionSchedules(){
        return axios.get('/order-template-service/collection-schedule');
    }
    static saveCollectionSchedule(schedule){
        return axios.post('/order-template-service/collection-schedule', schedule);
    }
    static deleteCollectionSchedule(schedule){
        return axios.delete('/order-template-service/collection-schedule/' + schedule.id);
    }
}