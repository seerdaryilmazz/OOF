import * as axios from "axios";

export class EventMonitorService {

    static getEventLog(event, service, days, page=0){
        return axios.get('/event-monitor-service/event', {params: {event: event, service: service, days: days, page: page}});
    }

    static getEventMap(){
        return axios.get('/event-monitor-service/event/map');
    }
}