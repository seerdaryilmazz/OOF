import * as axios from 'axios';

export class AuthorizationService {
    static listSubsidiaries(){
        return axios.get('/authorization-service/subsidiary');
    }
}