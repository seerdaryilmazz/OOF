import * as axios from "axios";

export class UserService {

    static searchUsers(params) {
        return axios.get("/user-service/users/search", {params: params});
    }

}