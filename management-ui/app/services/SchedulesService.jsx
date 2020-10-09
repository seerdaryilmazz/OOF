import * as axios from "axios";

export class CollectionSchedulesService {

    static getSchedules(){
        return axios.get('/order-planning-service/collection-schedule');
    }
    static saveSchedule(schedule){
        if(schedule.id){
            return axios.put('/order-planning-service/collection-schedule/' + schedule.id, schedule);
        }
        return axios.post('/order-planning-service/collection-schedule', schedule);
    }
    static deleteSchedule(schedule){
        return axios.delete('/order-planning-service/collection-schedule/' + schedule.id);
    }
}


export class DistributionSchedulesService {

    static getSchedules(){
        return axios.get('/order-planning-service/distribution-schedule');
    }
    static saveSchedule(schedule){
        if(schedule.id){
            return axios.put('/order-planning-service/distribution-schedule/' + schedule.id, schedule);
        }
        return axios.post('/order-planning-service/distribution-schedule', schedule);
    }
    static deleteSchedule(scheduleId){
        return axios.delete('/order-planning-service/distribution-schedule/' + scheduleId);
    }
}