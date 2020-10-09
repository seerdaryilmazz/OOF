import * as axios from 'axios';

export class UserService {

    static me(){
        return axios.get("/user-service/users/current");
    }
}