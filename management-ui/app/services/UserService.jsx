import * as axios from "axios";

export class UserService {

    static getAllUsers() {
        return axios.get("/user-service/users");
    }
    static getUsers(users) {
        return axios.post("/user-service/users/by-username", users);
    }

    static searchUsers(filter) {
        return axios.get("/user-service/users/search", {params: {
            username: filter.username,
            displayName: filter.displayName,
            inactiveUsers: filter.inactiveUsers
        }});
    }

    static save(user){
        if(user.id){
            return axios.put(`/user-service/users/${user.username}`, user);
        }else{
            return axios.post("/user-service/users", user);
        }
    }
    static activate(user) {
        return axios.put(`/user-service/users/${user.username}/activate`, null);
    }
    static deactivate(user) {
        return axios.put(`/user-service/users/${user.username}/deactivate`, null);
    }

    static getMembershipType(){
        return axios.get("/user-service/lookup/user-group-membership-type");
    }

    static getUserAuthenticationType(){
        return axios.get("/user-service/lookup/user-authentication-type");
    }

    static getUserInfo(username){
        return axios.get(`/user-service/active-directory/${username}/details`);
    }
    static getTimezones(){
        return axios.get("/user-service/timezone");
    }
    static getOfficeTimezone(office){
        return axios.get("/user-service/get-office-timezone", {params: {office: office}});
    }
}