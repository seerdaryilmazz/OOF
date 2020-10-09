import * as axios from "axios";


export class UserService {

    static getUsers(){
        return axios.get(`/user-service/users/search`, {params:{authenticationType:"ACTIVE_DIRECTORY"}});
    }

}