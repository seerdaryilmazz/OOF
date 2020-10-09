import * as axios from "axios";

export class UserService {

    static getUsers() {
        return axios.get('/user-service/users/');
    }

    //search method eklendi
    static searchUsers(filter)
    {
        return axios.get('/user-service/users/search', {params:{
            username:filter.username,
            displayName:filter.displayName,
            inactiveUsers:filter.inactiveUsers
        }});

    }
    static saveUser(user) {
        if (user.id) {
            return axios.put('/user-service/users/' + user.id, user)
        } else {
            return axios.post('/user-service/users/', user);
        }
    }

    static save(user){
        if(user.id){
            return axios.put(`/user-service/users/${user.username}`, user);
        }else{
            return axios.post("/user-service/users", user);
        }
    }

    static getTimeZones() {
        return axios.get('/user-service/timezone');
    }

    static deleteUser(userId) {
        return axios.delete('/user-service/users/' + userId);
    }

    static getUserStatuses() {
        return axios.get('/user-service/lookup/user-status');
    }

    static getMenuList() {
        return axios.get('/user-service/uimenu');
    }

    static saveMenu(menu) {
        if (menu.id) {
            return axios.put('/user-service/uimenu/' + menu.id, menu);
        } else {
            return axios.post('/user-service/uimenu', menu);
        }
    }

    static deleteMenu(menuId) {
        return axios.delete('/user-service/uimenu/' + menuId);
    }

    static getUserAuthenticationTypes() {
        return axios.get('/user-service/lookup/user-authentication-type');
    }

    static changeRank(menu, parent, rank) {
        var params = new URLSearchParams();
        if(parent){
            params.append('parentId', parent);
        }
        params.append('rank', rank);
        return axios.put('/user-service/uimenu/' + menu + '/changeRank', params);
    }

    static getOfficeTimezone(office){
        return axios.get("/user-service/get-office-timezone", {params: {office: office}});
    }

    static deactivate(user) {
        return axios.put(`/user-service/users/${user.username}/deactivate`, null);
    }
    static activate(user) {
        return axios.put(`/user-service/users/${user.username}/activate`, null);
    }

    static getUserInfo(username){
        return axios.get(`/user-service/active-directory/${username}/details`);
    }
}