import * as axios from "axios";

export class UserService {

    static listUsers(){
        return axios.get('/user-service/users/');
    }

    static findUser(username) {
        return axios.get('/user-service/users/' + username);
    }

}