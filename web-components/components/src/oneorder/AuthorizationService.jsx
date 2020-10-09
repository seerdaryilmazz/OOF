import * as axios from 'axios';

export class AuthorizationService {

    static operations(){
        return axios.get("/authorization-service/auth/operation/my");
    }

}