import * as axios from "axios";

export class UserGroupZoneService {

    static getOrderPlanningUserGroups() {
        return axios.get('/user-service/usergroups/order-planning');
    }

    static getUserGroupZones(userGroupId) {
        return axios.get('/order-planning-service/group-zone/user-group/' + userGroupId);
    }

    static saveUserGroupZone(userGroupZone) {
        return axios.post('/order-planning-service/group-zone', userGroupZone);
    }
    static deleteUserGroupZone(userGroupZoneId) {
        return axios.delete('/order-planning-service/group-zone/' + userGroupZoneId);
    }
}