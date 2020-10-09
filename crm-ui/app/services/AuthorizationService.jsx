import * as axios from "axios";
import axiosInstance from 'susam-components/services/AxiosUtils';

const axiosInst = axiosInstance();
export class AuthorizationService {

    static getSubsidiary(id) {
        return axios.get(`/authorization-service/subsidiary/${id}`);
    }

    static getSubsidiaries() {
        return axios.get("/authorization-service/subsidiary");
    }

    static getSubsidiariesOfCurrentUser() {
        return axios.get("/authorization-service/user-details/subsidiaries-current-user");
    }
    static getUserTeammates(username){
        return axios.get(`/authorization-service/user-details/${username}/teammates`)
    }
    
    static getUserSublevelUsers(){
        return axiosInst.get(`/authorization-service/auth/user/sublevel-users`)
    }

}