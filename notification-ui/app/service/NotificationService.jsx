import * as axios from 'axios';

export class NotificationService {
    static lookup(lookup) {
        return axios.get(`/notification-service/lookup/${lookup}`);
    }
    static list(){
        return axios.get(`/notification-service/notification`);
    }
    static read(id){
        return axios.put(`/notification-service/notification/read/${id}`);
    }
    static readAll(){
        return axios.put(`/notification-service/notification/read-all`);
    }
}

export class UserPreferenceService {
    static my(){
        return axios.get(`/notification-service/user-preference`);
    }

    static updateStatus(id, params){
        return axios.patch(`/notification-service/user-preference/${id}/status`, null, {params: params});
    }

    static updateChannelStatus(id, params){
        return axios.patch(`/notification-service/user-preference/${id}/channel-status`, null, {params: params});
    }
}

export class NotificationTemplateService {
    static listByChannel(channel){
        return axios.get(`/notification-service/template/by-channel`, {params: {channel: channel}});
    }

    static patch(id, params){
        return axios.patch(`/notification-service/template/${id}`, null, {params: params});
    }

    static save(id, value){
        if(id){
            return axios.put(`/notification-service/template/${id}`, value);
        } else {
            return axios.post(`/notification-service/template`, value);
        }
    }
}

export class NotificationChannelService {
    static list(){
        return axios.get(`/notification-service/notification-channel`);
    }

    static patch(id, params){
        return axios.patch(`/notification-service/notification-channel/${id}`, null, {params: params});
    }
}

export class NotificationManagementService {
    static listConcerns() {
        return axios.get(`/notification-service/management/concern`);
    }

    static updateStatus(params) {
        return axios.patch(`/notification-service/management/concern`, null, { params: params });
    }

    static getSample(concern) {
        return axios.get(`/notification-service/management/sample-data`, { params: {concern: concern} });
    }
}