import * as axios from 'axios';

export class NotificationService {
    static my(){
        return axios.get(`/notification-service/notification/my`);
    }
    
    static read(id){
        return axios.put(`/notification-service/notification/read/${id}`);
    }
    static readAll(){
        return axios.put(`/notification-service/notification/read-all`);
    }
}